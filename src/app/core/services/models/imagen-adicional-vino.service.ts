import { Injectable } from '@angular/core';
import { BaseHttpService, PathConfig } from '../base-http.service';
import { ImagenAdicionalVino } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class ImagenAdicionalVinoService extends BaseHttpService<ImagenAdicionalVino> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-public',
    endpoint: 'imagenesadicionalesvinos'
  };
}