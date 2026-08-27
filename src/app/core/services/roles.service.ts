import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { Rol } from '../models';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly baseUrl = `${environment.apiUrl}/privado/roles`;

  constructor(private readonly http: HttpClient) {}

  // El backend ya excluye "superadministrador" de la lista salvo que quien
  // pregunte sea él mismo (ver RolesService.consultar en el backend).
  public consultar(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.baseUrl);
  }
}
