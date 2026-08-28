import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { CrearSolicitudUpgrade, SolicitudUpgrade } from '../models';

// POST: autoservicio del DUEÑO ("quiero pasar a plan pagado").
// GET / PATCH: bandeja del superadministrador.
@Injectable({ providedIn: 'root' })
export class SolicitudesUpgradeService {
  private readonly baseUrl = `${environment.apiUrl}/privado/solicitudes-upgrade`;

  constructor(private readonly http: HttpClient) {}

  public crear(datos: CrearSolicitudUpgrade): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(this.baseUrl, datos);
  }

  public consultar(): Observable<SolicitudUpgrade[]> {
    return this.http.get<SolicitudUpgrade[]>(this.baseUrl);
  }

  public marcarAtendida(id: number, atendida: boolean): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.baseUrl}/${id}`, {
      atendida,
    });
  }
}
