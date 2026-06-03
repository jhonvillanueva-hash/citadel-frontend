import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface NavLink { label: string; href?: string; routerLink?: string; }
interface SocialLink { label: string; href: string; svgPath: string; }
interface ContactItem { label: string; href: string; svgPath: string; }

@Component({
  selector: 'app-footer-landing',
  standalone: true,
  templateUrl: './footer-landing.html',
  imports: [RouterLink]
})
export class FooterLanding {
  readonly socialLinks: SocialLink[] = [
    {
      label: 'Facebook de Vinos Citadel',
      href: 'https://www.facebook.com/vinoscitadel?locale=es_LA',
      svgPath: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z'
    },
    {
      label: 'Instagram de Vinos Citadel',
      href: 'https://www.instagram.com/vinoscitadel?utm_source=qr&igsh=dWc5dWZ4MHlqeXpq',
      svgPath: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z'
    },
    {
      label: 'TikTok de Vinos Citadel',
      href: 'https://www.tiktok.com/@vinoscitadel?_t=8eeItWKo8d3&_r=1',
      svgPath: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z'
    }
  ];

  readonly storeLinks: NavLink[] = [
    { label: 'Frambuesas', routerLink: '/store/products/flavors/todos' },
    { label: 'Arándanos',  routerLink: '/store/products/flavors/todos' },
    { label: 'Zarzamoras', routerLink: '/store/products/flavors/todos' },
    { label: 'Mix',        routerLink: '/store/products/flavors/todos' }
  ];

  readonly companyLinks: NavLink[] = [
    { label: 'Nosotros',              href: 'https://www.facebook.com/vinoscitadel?locale=es_LA' },
    { label: 'Catálogo',              routerLink: '/store' },
    { label: 'Proceso de Elaboración', href: 'https://www.instagram.com/vinoscitadel?utm_source=qr&igsh=dWc5dWZ4MHlqeXpq' }
  ];

  readonly contactItems: ContactItem[] = [
    {
      label: '+51 935 609 881',
      href: 'https://wa.me/51935609881',
      svgPath: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z'
    },
    {
      label: 'fgperu@hotmail.com',
      href: 'mailto:fgperu@hotmail.com',
      svgPath: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6'
    },
    {
    label: 'Av. Carlos Valderrama 491, Las Quintanas, Trujillo',
      href: 'https://maps.google.com/?q=Av+Carlos+Valderrama+491+Las+Quintanas+Trujillo',
      svgPath: 'M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10zm0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'
    },
    {
      label: 'Libro de reclamaciones',
      href: '/libro-de-reclamaciones',
      svgPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z'
    },
  ];

  readonly legalLinks: NavLink[] = [
    {
      label: 'Términos y Condiciones',
      routerLink: '/terms-and-conditions'
    },
    {
      label: 'Cambios y Devoluciones',
      routerLink: '/refund-policy'
    }
  ];
}
