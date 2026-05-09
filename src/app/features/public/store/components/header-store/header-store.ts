import { Component, inject, OnInit, signal, Renderer2, Inject, PLATFORM_ID } from '@angular/core'
import { CommonModule, isPlatformBrowser } from '@angular/common'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCartShopping, faList, faUser, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';
import { SaborService } from '../../../../../data/services/sabor.service';
import { Sabor } from '../../../../../data/models/api.models';
import { CartService } from '../../../../../core/services/cart.service';
import { UsuarioService } from '../../../../../data/services/usuario.service';
import { Usuario } from '../../../../../data/models/api.models';
import { filter } from 'rxjs/operators';

export interface InternalNav {
  id?: number
  name: string
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink],
  templateUrl: './header-store.html',
  styles: ``,
})

export class HeaderStore implements OnInit {
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private renderer = inject(Renderer2);
  @Inject(PLATFORM_ID) private platformId: any = inject(PLATFORM_ID);

  searchTerm = signal('');

  usuarioApi = signal<Usuario | null>(null);
  avatarDb = signal<string | null>(null);
  userInitials = signal<string>('');

  private cartService = inject(CartService);

  cartCount = this.cartService.cartCount;

  openCart() {
    this.cartService.open();
  }

  private saborService = inject(SaborService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  internalNavs = signal<InternalNav[]>([]);
  isLoading = signal<boolean>(true);
  currentUrl = signal<string>('');
  isMobileMenuOpen = signal<boolean>(false);

  icons = {
    faCartShopping,
    faList,
    faUser,
    faSearch,
    faTimes
  }

  goToSearch(): void {
    const term = this.searchTerm().trim();
    if (!term) return;
    this.router.navigate(['/store/search'], { queryParams: { q: term } });
  }

  ngOnInit(): void {
    this.loadFlavors();
    if (this.currentUser()) {
      this.loadUsuario();
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl.set(event.urlAfterRedirects);
      this.closeMobileMenu();
    });
  }

  isActive(nav: InternalNav): boolean {
    const url = this.currentUrl();

    if (nav.name === 'Todos') {
      return url === '/store' || url.includes('/store/products/flavors/todos');
    }

    if (nav.id) {
      return url.endsWith('/' + nav.id);
    }

    return false;
  }

  private formatSaborName(nombre: string): string {
    const lowerName = nombre.toLowerCase();

    let formattedName = lowerName;

    if (!lowerName.endsWith('s')) {
      if (lowerName.endsWith('z')) {
        formattedName = lowerName.slice(0, -1) + 'ces';
      } else if (lowerName.endsWith('ón')) {
        formattedName = lowerName.slice(0, -2) + 'ones';
      } else {
        formattedName = lowerName + 's';
      }
    }

    return formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
  }

  loadUsuario(): void {
    if (!this.currentUser()) return;
    this.usuarioService.getAll().subscribe({
      next: (res) => {
        const user = res[0];
        this.usuarioApi.set(user);

        if (user?.url_img) {
          this.avatarDb.set(user.url_img);
        } else {
          this.avatarDb.set(null);
        }

        const first = user?.nombres?.charAt(0) || '';
        const last = user?.apellidos?.charAt(0) || '';
        this.userInitials.set((first + last).toUpperCase());
      },
      error: () => {
        this.avatarDb.set(null);
        this.userInitials.set('');
      }
    });
  }

  private loadFlavors(): void {
    this.saborService.getAll().subscribe({
      next: (sabores: Sabor[]) => {
        const navItems: InternalNav[] = [
          { name: 'Todos' },
          ...sabores.map(sabor => ({
            id: sabor.id_sabor,
            name: this.formatSaborName(sabor.nombre)
          }))
        ];

        this.internalNavs.set(navItems);
        this.isLoading.set(false);
      },
      error: () => {
        this.internalNavs.set([
          { name: 'Todos' }
        ]);
        this.isLoading.set(false);
      }
    });
  }

  generarSlug(texto: string): string {
    return texto
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  trackById(index: number, item: InternalNav) {
    return item.id ?? item.name;
  }

  toggleMobileMenu(): void {
    const newState = !this.isMobileMenuOpen();
    this.isMobileMenuOpen.set(newState);

    if (isPlatformBrowser(this.platformId)) {
      if (newState) {
        this.renderer.setStyle(document.body, 'overflow', 'hidden');
      } else {
        this.renderer.setStyle(document.body, 'overflow', '');
      }
    }
  }

  closeMobileMenu(): void {
    if (this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
      if (isPlatformBrowser(this.platformId)) {
        this.renderer.setStyle(document.body, 'overflow', '');
      }
    }
  }
}
