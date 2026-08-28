import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import {
  ActualizarUsuarioRequest,
  CrearUsuarioRequest,
  PerfilUsuario,
  UsuarioResumen,
} from '../models';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly baseUrl = `${environment.apiUrl}/privado/usuarios`;

  constructor(private readonly http: HttpClient) {}

  public consultar(): Observable<UsuarioResumen[]> {
    return this.http.get<UsuarioResumen[]>(this.baseUrl);
  }

  public consultarPerfil(): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(`${this.baseUrl}/perfil`);
  }

  public registrar(datos: CrearUsuarioRequest): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(this.baseUrl, datos);
  }

  public actualizar(id: number, datos: ActualizarUsuarioRequest): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.baseUrl}/${id}`, datos);
  }

  public eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.baseUrl}/${id}`);
  }
}
