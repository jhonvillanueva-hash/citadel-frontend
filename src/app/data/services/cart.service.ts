import { Injectable } from '@angular/core';
import { BaseHttpService, PathConfig } from '../../core/services/base-http.service';
import { Carrito } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CartService extends BaseHttpService<Carrito> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-me',
    endpoint: 'carritos'
  };
}