import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Store } from './pages/store/store';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'store', component: Store },
];
