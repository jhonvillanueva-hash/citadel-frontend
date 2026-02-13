import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';
import { adminGuard } from './core/guards/role.guard';
import { Landing } from './pages/landing/landing';

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
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, adminGuard]
  },
  { path: '**', redirectTo: 'login' }
];
