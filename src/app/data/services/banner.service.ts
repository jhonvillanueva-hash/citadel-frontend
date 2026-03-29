import { Injectable } from '@angular/core';
import { BaseHttpService, PathConfig } from '../../core/services/base-http.service';
import { Banner } from '../models/api.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BannerService extends BaseHttpService<Banner> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-public',
    endpoint: 'banners'
  };
  
  createWithImage(formData: FormData): Observable<Banner> {
    return this.http.post<Banner>(this.fullUrl, formData, { withCredentials: true});
  }
}
