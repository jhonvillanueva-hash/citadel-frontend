import { Injectable } from '@angular/core';

export interface CheckoutProfile {
  email: string;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  deliveryType: 'home' | 'pickup';
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  numeroCasa: string;
  codigoPostal: string;
}

const STORAGE_KEY = 'Profile';

const EMPTY_PROFILE: CheckoutProfile = {
  email: '',
  nombres: '',
  apellidos: '',
  dni: '',
  telefono: '',
  deliveryType: 'home',
  direccion: '',
  departamento: '',
  provincia: '',
  distrito: '',
  numeroCasa: '',
  codigoPostal: '',
};

@Injectable({ providedIn: 'root' })
export class CheckoutService {

  getProfile(): CheckoutProfile {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.setProfile(EMPTY_PROFILE);
        return { ...EMPTY_PROFILE };
      }
      return { ...EMPTY_PROFILE, ...JSON.parse(raw) };
    } catch {
      return { ...EMPTY_PROFILE };
    }
  }

  setProfile(data: CheckoutProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage no disponible (modo privado, etc.)
    }
  }

  updateField<K extends keyof CheckoutProfile>(field: K, value: CheckoutProfile[K]): void {
    const current = this.getProfile();
    current[field] = value;
    this.setProfile(current);
  }

  clearProfile(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
