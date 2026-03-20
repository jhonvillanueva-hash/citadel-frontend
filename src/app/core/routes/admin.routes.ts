import { Routes } from '@angular/router';
import { AdminDashboardComponent } from '../../features/admin/admin-dashboard';
import { AIComponent } from '../../features/admin/ai/ai';
import { Statistics } from '../../features/admin/statistics/statistics';
import { Users } from '../../features/admin/users/users';
import { WinesCreateComponent } from '../../features/admin/wines/wines-create/wines-create';
import { WinesListComponent } from '../../features/admin/wines/wines-list/wines-list';

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
        path: '',
        redirectTo: 'statistics',
        pathMatch: 'full'
      }
    ]
  }
];