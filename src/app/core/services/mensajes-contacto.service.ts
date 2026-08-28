import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { MensajeContactoRegistro } from '../models';

// Consume GET/PATCH /privado/mensajes-contacto — bandeja del superadministrador
// con los mensajes del formulario público de contacto.
@Injectable({ providedIn: 'root' })
export class MensajesContactoService {
  private readonly baseUrl = `${environment.apiUrl}/privado/mensajes-contacto`;

  constructor(private readonly http: HttpClient) {}

  public consultar(): Observable<MensajeContactoRegistro[]> {
    return this.http.get<MensajeContactoRegistro[]>(this.baseUrl);
  }

  public marcarAtendido(id: number, atendido: boolean): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.baseUrl}/${id}`, {
      atendido,
    });
  }
}
