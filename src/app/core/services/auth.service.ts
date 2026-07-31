import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { RolNombre } from '../constants/roles.constant';
import {
  CambioPasswordRequest,
  LoginRequest,
  LoginResponse,
  MensajeResponse,
  NuevaPasswordRequest,
  RecuperarPasswordRequest,
  RegistroRequest,
  RegistroTenantRequest,
  SesionUsuario,
  TokenResponse,
} from '../models';
import { decodificarJwt, tokenExpirado } from './jwt.util';

const CLAVE_TOKEN = 'propify_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiUrl;

  private readonly sesionSignal = signal<SesionUsuario | null>(
    this.leerSesionAlmacenada(),
  );

  public readonly sesion = this.sesionSignal.asReadonly();
  public readonly estaAutenticado = computed(() => this.sesionSignal() !== null);
  public readonly rol = computed(() => this.sesionSignal()?.nombre_rol ?? null);
  public readonly tenantId = computed(() => this.sesionSignal()?.tenant_id ?? null);

  constructor(private readonly http: HttpClient) {}

  public tieneRol(...roles: RolNombre[]): boolean {
    const rolActual = this.rol();
    return rolActual !== null && (roles as string[]).includes(rolActual);
  }

  public login(datos: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/publico/auth/login`, datos)
      .pipe(tap((respuesta) => this.guardarToken(respuesta.token)));
  }

  public logout(): void {
    if (this.estaAutenticado()) {
      this.http.post(`${this.baseUrl}/publico/auth/logout`, {}).subscribe();
    }
    this.limpiarSesion();
  }

  public registrarUsuario(datos: RegistroRequest): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${this.baseUrl}/publico/registros/user`, datos)
      .pipe(tap((respuesta) => this.guardarToken(respuesta.token)));
  }

  public registrarTenant(
    datos: RegistroTenantRequest,
  ): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${this.baseUrl}/publico/registros/tenant`, datos)
      .pipe(tap((respuesta) => this.guardarToken(respuesta.token)));
  }

  public recuperarPassword(
    datos: RecuperarPasswordRequest,
  ): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(
      `${this.baseUrl}/publico/registros/recuperar-password`,
      datos,
    );
  }

  public nuevaPassword(datos: NuevaPasswordRequest): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(
      `${this.baseUrl}/publico/registros/nueva-password`,
      datos,
    );
  }

  public cambiarPassword(
    datos: CambioPasswordRequest,
  ): Observable<MensajeResponse> {
    return this.http.patch<MensajeResponse>(
      `${this.baseUrl}/publico/registros/cambiar-password`,
      datos,
    );
  }

  public obtenerToken(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
  }

  private guardarToken(token: string): void {
    localStorage.setItem(CLAVE_TOKEN, token);
    this.sesionSignal.set(decodificarJwt(token));
  }

  private limpiarSesion(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    this.sesionSignal.set(null);
  }

  private leerSesionAlmacenada(): SesionUsuario | null {
    const token = localStorage.getItem(CLAVE_TOKEN);
    if (!token) {
      return null;
    }

    const sesion = decodificarJwt(token);
    if (!sesion || tokenExpirado(sesion)) {
      localStorage.removeItem(CLAVE_TOKEN);
      return null;
    }

    return sesion;
  }
}
