import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { HomeComponent } from './features/public/home/home.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';
import { adminGuard } from './core/guards/admin.guard';
import { Landing } from './features/public/landing/landing';
import { Statistics } from './features/admin/statistics/statistics';
import { Users } from './features/admin/users/users';
import { AIComponent } from './features/admin/ai/ai';
import { Store } from './features/public/store/store';

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
    component: Store
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, adminGuard],
    title: 'Panel Admin',
    children: [
      {
        path: 'statistics',
        component: Statistics
      },
      {
        path: 'users',
        component: Users
      },
      {
        path: 'ai',
        component: AIComponent
      },
      {
        path: '',
        redirectTo: 'statistics',
        pathMatch: 'full'
      }
    ],
  },
  { path: '**', redirectTo: 'login' }
];
