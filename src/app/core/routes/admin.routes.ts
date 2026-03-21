import { Routes } from '@angular/router';
import { AdminDashboardComponent } from '../../features/admin/admin-dashboard';
import { AIComponent } from '../../features/admin/ai/ai';
import { Statistics } from '../../features/admin/statistics/statistics';
import { Users } from '../../features/admin/users/users';
import { WinesCreateComponent } from '../../features/admin/wines/wines-create/wines-create';
import { WinesListComponent } from '../../features/admin/wines/wines-list/wines-list';
import { BannersCreateComponent } from '../../features/admin/banners/banners-create/banners-create';
import { BannersListComponent } from '../../features/admin/banners/banners-list/banners-list';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    title: 'Panel Admin',
    children: [
      {
        path: 'statistics',
        component: Statistics
      },
      {
        path: 'wines',
        component: WinesListComponent
      },
      {
        path: 'wines/create',
        component: WinesCreateComponent
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
        path: 'banners',
        component: BannersListComponent
      },
      {
        path: 'banners/create',
        component: BannersCreateComponent
      },
      {
        path: '',
        redirectTo: 'statistics',
        pathMatch: 'full'
      }
    ]
  }
];