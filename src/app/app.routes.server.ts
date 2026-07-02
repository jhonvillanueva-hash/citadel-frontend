import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'nosotros',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'terms-and-conditions',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'refund-policy',
    renderMode: RenderMode.Prerender
  },
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
