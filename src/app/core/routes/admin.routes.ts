import { Routes } from '@angular/router';
import { AdminDashboardComponent } from '../../features/admin/admin-dashboard';
import { AIComponent } from '../../features/admin/ai/ai';
import { Statistics } from '../../features/admin/statistics/statistics';
import { Users } from '../../features/admin/users/users';
import { WinesCreateComponent } from '../../features/admin/wines/wines-create/wines-create';
import { WinesListComponent } from '../../features/admin/wines/wines-list/wines-list';
import { BannersCreateComponent } from '../../features/admin/banners/banners-create/banners-create';
import { BannersListComponent } from '../../features/admin/banners/banners-list/banners-list';
import { WinesConfigComponent } from '../../features/admin/wines/wines-config/wines-config';
import { WinesEditComponent } from '../../features/admin/wines/wines-edit/wines-edit';
import { ComplaintsComponent } from '../../features/admin/complaints/complaints';
import { CouponsListComponent } from '../../features/admin/coupons/coupons-list/coupons-list';
import { CouponsEditComponent } from '../../features/admin/coupons/coupons-edit/coupons-edit';
import { CouponsCreateComponent } from '../../features/admin/coupons/coupons-create/coupons-create';
import { SalesListComponent } from '../../features/admin/sales/sales';
import { SalesDetailComponent } from '../../features/admin/sales/sales-detail';

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
        path: 'wines/config',
        component: WinesConfigComponent
      },
      {
        path: 'wines/create',
        component: WinesCreateComponent
      },
      {
        path: 'wines/edit/:id',
        component: WinesEditComponent
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
        path: 'complaints',
        component: ComplaintsComponent
      },
      {
        path: 'coupons',
        component: CouponsListComponent
      },
      {
        path: 'coupons/create',
        component: CouponsCreateComponent
      },
      {
        path: 'coupons/edit/:id',
        component: CouponsEditComponent
      },
      {
        path: 'sales',
        component: SalesListComponent
      },
      {
        path: 'sales/:id',
        component: SalesDetailComponent
      },
      {
        path: '',
        redirectTo: 'statistics',
        pathMatch: 'full'
      }
    ]
  }
];