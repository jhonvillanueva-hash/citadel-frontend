import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Departamento {
  id_ubigeo: string;
  nombre_ubigeo: string;
  codigo_ubigeo: string;
}

export interface Provincia {
  id_ubigeo: string;
  nombre_ubigeo: string;
  codigo_ubigeo: string;
  departamento_id: number;
}

export interface Distrito {
  id_ubigeo: string;
  nombre_ubigeo: string;
  codigo_ubigeo: string;
  provincia_id: number;
  departamento_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class UbigeoService {
  private http = inject(HttpClient);

  getDepartamentos(): Observable<Departamento[]> {
    return this.http.get<any>('assets/1_ubigeo_departamentos.json').pipe(
      map(res => res.ubigeo_departamentos.map((d: any) => ({
        id_ubigeo: d.id.toString(),
        nombre_ubigeo: d.departamento,
        codigo_ubigeo: d.ubigeo
      })))
    );
  }

  getProvincias(): Observable<Provincia[]> {
    return this.http.get<any>('assets/2_ubigeo_provincias.json').pipe(
      map(res => res.ubigeo_provincias.map((p: any) => ({
        id_ubigeo: p.id.toString(),
        nombre_ubigeo: p.provincia,
        codigo_ubigeo: p.ubigeo,
        departamento_id: p.departamento_id
      })))
    );
  }

  getDistritos(): Observable<Distrito[]> {
    return this.http.get<any>('assets/3_ubigeo_distritos.json').pipe(
      map(res => res.ubigeo_distritos.map((d: any) => ({
        id_ubigeo: d.id.toString(),
        nombre_ubigeo: d.distrito,
        codigo_ubigeo: d.ubigeo,
        provincia_id: d.provincia_id,
        departamento_id: d.departamento_id
      })))
    );
  }
}
