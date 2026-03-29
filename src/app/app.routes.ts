import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { HomeComponent } from './features/public/home/home';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';
import { adminGuard } from './core/guards/admin.guard';
import { Landing } from './features/public/landing/landing';
import { Store } from './features/public/store/store';
import { DetailsStore } from './features/public/store/pages/details-store/details-store';

export const routes: Routes = [
  {
    path: '',
    component: Landing
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [publicGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [publicGuard]
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'store',
    component: Store,
  },
  {
    path: 'store/products/:id',
    component: DetailsStore
  },
  {
    path: 'admin',
      loadChildren: () =>
        import('./core/routes/admin.routes').then(m => m.ADMIN_ROUTES),
      canActivate: [authGuard, adminGuard]
  },
  { path: '**', redirectTo: 'login' }
];
