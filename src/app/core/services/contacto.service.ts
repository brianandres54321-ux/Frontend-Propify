import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { MensajeContacto } from '../models';

// Consume POST /publico/contacto — formulario público de contacto, sin auth.
@Injectable({ providedIn: 'root' })
export class ContactoService {
  private readonly baseUrl = `${environment.apiUrl}/publico/contacto`;

  constructor(private readonly http: HttpClient) {}

  public enviarMensaje(datos: MensajeContacto): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(this.baseUrl, datos);
  }
}
