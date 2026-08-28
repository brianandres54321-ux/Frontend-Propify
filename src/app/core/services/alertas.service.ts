import { Injectable, computed, inject, signal } from '@angular/core';

import { RoleNames } from '../constants/roles.constant';
import { Residente } from '../models';
import { TableBadgeVariant } from '@shared/interfaces';
import { AuthService } from './auth.service';
import { CobranzaService } from './cobranza.service';
import { MensajesContactoService } from './mensajes-contacto.service';
import { ReportesDanoService } from './reportes-dano.service';
import { ResidentesService } from './residentes.service';
import { UnidadesService } from './unidades.service';

export interface Alerta {
  color: TableBadgeVariant;
  icono: string;
  texto: string;
  link?: string;
}

function diasRestantes(fechaFin: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fechaFin);
  fin.setHours(0, 0, 0, 0);
  return Math.round((fin.getTime() - hoy.getTime()) / 86_400_000);
}

// Fuente única de las alertas accionables (spec §1 del feedback de
// dashboard): la tarjeta "Alertas" del dashboard y la campana de
// notificaciones del navbar leen de aquí, en vez de calcular la misma
// lista dos veces con datos que podrían desincronizarse.
@Injectable({ providedIn: 'root' })
export class AlertasService {
  private readonly auth = inject(AuthService);
  private readonly cobranzaService = inject(CobranzaService);
  private readonly residentesService = inject(ResidentesService);
  private readonly reportesDanoService = inject(ReportesDanoService);
  private readonly unidadesService = inject(UnidadesService);
  private readonly mensajesContactoService = inject(MensajesContactoService);

  private readonly cargado = signal(false);
  private readonly cargandoFinanciero = signal(true);
  private readonly cargandoContratos = signal(true);
  private readonly cargandoReportes = signal(true);
  private readonly cargandoOcupacion = signal(true);

  private readonly cuentasVencidasCriticas = signal(0);
  private readonly contratosPorVencer = signal<Residente[]>([]);
  private readonly reportesPendientes = signal(0);
  private readonly vaciasProlongadas = signal(0);
  // Solo superadmin: mensajes del formulario de contacto sin atender.
  private readonly mensajesContactoSinAtender = signal(0);

  public readonly cargando = computed(
    () =>
      this.cargandoFinanciero() ||
      this.cargandoContratos() ||
      this.cargandoReportes() ||
      this.cargandoOcupacion(),
  );

  public readonly alertas = computed<Alerta[]>(() => {
    const lista: Alerta[] = [];

    const criticas = this.cuentasVencidasCriticas();
    if (criticas > 0) {
      lista.push({
        color: 'danger',
        icono: 'exclamation-triangle-fill',
        texto: `${criticas} cuenta${criticas === 1 ? '' : 's'} vencida${criticas === 1 ? '' : 's'} hace más de 30 días`,
        link: '/app/cobranza',
      });
    }

    const urgentes = this.contratosPorVencer().filter(
      (r) => diasRestantes(r.fechaFin!) <= 7,
    ).length;
    if (urgentes > 0) {
      lista.push({
        color: 'warning',
        icono: 'calendar-event',
        texto: `${urgentes} contrato${urgentes === 1 ? '' : 's'} vence${urgentes === 1 ? '' : 'n'} en los próximos 7 días`,
      });
    }

    const reportes = this.reportesPendientes();
    if (reportes > 0) {
      lista.push({
        color: 'info',
        icono: 'tools',
        texto: `${reportes} reporte${reportes === 1 ? '' : 's'} de daño pendiente${reportes === 1 ? '' : 's'}`,
        link: '/app/reportes-dano',
      });
    }

    const vacias = this.vaciasProlongadas();
    if (vacias > 0) {
      lista.push({
        color: 'primary',
        icono: 'door-open',
        texto: `${vacias} unidad${vacias === 1 ? '' : 'es'} vacía${vacias === 1 ? '' : 's'} hace más de 60 días`,
        link: '/app/inmuebles',
      });
    }

    const mensajes = this.mensajesContactoSinAtender();
    if (mensajes > 0) {
      lista.push({
        color: 'info',
        icono: 'envelope',
        texto: `${mensajes} mensaje${mensajes === 1 ? '' : 's'} de contacto sin atender`,
        link: '/app/mensajes-contacto',
      });
    }

    return lista;
  });

  // Se llama una vez desde el layout interno. Sin efecto si ya se cargó o
  // si el rol no tiene acceso a estos datos (RESIDENTE/CELADOR recibirían
  // 403 de estos endpoints, así que ni se intenta).
  public cargar(): void {
    if (this.cargado()) {
      return;
    }

    // El superadministrador no tiene tenant: los endpoints de cobranza /
    // reportes / ocupación le darían 403. Su única alerta es la bandeja de
    // mensajes de contacto.
    if (this.auth.tieneRol(RoleNames.SUPERADMIN)) {
      this.cargado.set(true);
      this.cargandoFinanciero.set(false);
      this.cargandoContratos.set(false);
      this.cargandoReportes.set(false);
      this.cargandoOcupacion.set(false);

      this.refrescarMensajesContacto();
      return;
    }

    if (!this.auth.tieneRol(RoleNames.DUENO, RoleNames.ADMIN)) {
      return;
    }
    this.cargado.set(true);

    this.cobranzaService.consultarResumen().subscribe({
      next: (resumen) => {
        this.cuentasVencidasCriticas.set(resumen.cuentasVencidasCriticas);
        this.cargandoFinanciero.set(false);
      },
      error: () => this.cargandoFinanciero.set(false),
    });

    this.residentesService.consultarPorVencer().subscribe({
      next: (residentes) => {
        this.contratosPorVencer.set(residentes);
        this.cargandoContratos.set(false);
      },
      error: () => this.cargandoContratos.set(false),
    });

    this.reportesDanoService.consultarResumen().subscribe({
      next: (resumen) => {
        this.reportesPendientes.set(resumen.pendientes);
        this.cargandoReportes.set(false);
      },
      error: () => this.cargandoReportes.set(false),
    });

    this.unidadesService.consultarResumenOcupacion().subscribe({
      next: (resumen) => {
        this.vaciasProlongadas.set(resumen.vaciasProlongadas);
        this.cargandoOcupacion.set(false);
      },
      error: () => this.cargandoOcupacion.set(false),
    });
  }

  // La bandeja de mensajes de contacto la llama tras marcar/reabrir un
  // mensaje, para que el contador de la campana no quede desfasado.
  public refrescarMensajesContacto(): void {
    if (!this.auth.tieneRol(RoleNames.SUPERADMIN)) {
      return;
    }
    this.mensajesContactoService.consultar().subscribe({
      next: (mensajes) =>
        this.mensajesContactoSinAtender.set(mensajes.filter((m) => !m.atendido).length),
      error: () => undefined,
    });
  }
}
