import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';
import { adminGuard } from './core/guards/admin.guard';
import { Landing } from './features/public/landing/landing';
import { Store } from './features/public/store/store';
import { DetailsStore } from './features/public/store/pages/details-store/details-store';
import { FlavorStore } from './features/public/store/pages/flavor-store/flavor-store';
import { SweetStore } from './features/public/store/pages/sweet-store/sweet-store';
import { ComplaintsComponent } from './features/public/complaints/complaints';
import { CartStore } from './features/public/store/pages/cart-store/cart-store';
import { CheckoutStore } from './features/public/store/pages/checkout-store/checkout-store';
import { ProfileStore } from './features/public/store/pages/profile-store/profile-store';
import { storeGuard } from './core/guards/store.guard';
import { SearchStore } from './features/public/store/pages/search-store/search-store';
import { TermsAndConditionsComponent } from './features/public/legal/terms-and-conditions/terms-and-conditions';
import { RefundPolicyComponent } from './features/public/legal/refund-policy/refund-policy';

export const routes: Routes = [
  {
    path: '',
    component: Landing,
    title: 'Citadel',
  },
  {
    path: 'libro-de-reclamaciones',
    component: ComplaintsComponent,
    title: 'Libro de reclamaciones',
  },
  {
    path: 'terms-and-conditions',
    component: TermsAndConditionsComponent,
    title: 'Términos y Condiciones',
    data: {
      showHeader: true,
      showFooter: true
    }
  },
  {
    path: 'refund-policy',
    component: RefundPolicyComponent,
    title: 'Cambios y Devoluciones',
    data: {
      showHeader: true,
      showFooter: true
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [publicGuard],
    title: 'Iniciar sesión',
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [publicGuard],
    title: 'Registrarse',
  },
  {
    path: 'store',
    component: Store,
    data: { showHeader: true, showFooter: true },
    canActivate: [storeGuard],
    title: 'Tienda Citadel',
  },
  {
    path: 'store/profile',
    component: ProfileStore,
    data: { showHeader: false, showFooter: false },
    canActivate: [authGuard],
    title: 'Mi perfil',
  },
  {
    path: 'store/search',
    component: SearchStore,
    data: { showHeader: true, showFooter: true },
    canActivate: [storeGuard]
  },
  {
    path: 'store/products/flavors/:name',
    component: FlavorStore,
    data: { showHeader: true, showFooter: true },
    canActivate: [storeGuard],
  },
  {
    path: 'store/products/flavors/:name/:id',
    component: FlavorStore,
    data: { showHeader: true, showFooter: true },
    canActivate: [storeGuard],
  },
  {
    path: 'store/products/sweetness/:name/:id',
    component: SweetStore,
    data: { showHeader: true, showFooter: true },
    canActivate: [storeGuard]
  },
  {
    path: 'store/products/:slug/:id',
    component: DetailsStore,
    data: { showHeader: true, showFooter: true },
    canActivate: [storeGuard],
  },
  {
    path: 'store/cart/checkout',
    component: CheckoutStore,
    data: { showHeader: false, showFooter: false },
    canActivate: [storeGuard],
    title: 'Paga tu carrito',
  },
  {
    path: 'store/cart',
    component: CartStore,
    data: { showHeader: false, showFooter: false },
    canActivate: [storeGuard],
    title: 'Carrito',
  },
  {
    path: 'admin',
      loadChildren: () =>
        import('./core/routes/admin.routes').then(m => m.ADMIN_ROUTES),
      canActivate: [authGuard, adminGuard]
  },
  { path: '**', redirectTo: '' }
];
