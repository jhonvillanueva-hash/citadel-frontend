import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCartShopping, faList, faUser } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';
import { SaborService } from '../../../../../data/services/sabor.service';
import { Sabor } from '../../../../../data/models/api.models';
import { CartService } from '../../../../../core/services/cart.service';

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

  private cartService = inject(CartService);

  cartCount = this.cartService.cartCount;

  openCart() {
    this.cartService.open();
  }

  private saborService = inject(SaborService);

  currentUser = this.authService.currentUser;
  internalNavs = signal<InternalNav[]>([]);
  isLoading = signal<boolean>(true);

  icons = {
    faCartShopping,
    faList,
    faUser
  }

  ngOnInit(): void {
    this.loadFlavors();
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

  private loadFlavors(): void {
    this.saborService.getAll().subscribe({
      next: (sabores: Sabor[]) => {

        const navItems: InternalNav[] = [
          { name: 'Todos' },
          ...sabores.map(sabor => ({
            id: sabor.id_sabor,
            name: this.formatSaborName(sabor.nombre)
          })),
          { name: 'Mixtos' },
          { name: 'Promociones' }
        ];

        this.internalNavs.set(navItems);
        this.isLoading.set(false);
      },
      error: () => {
        this.internalNavs.set([
          { name: 'Todos' },
          { name: 'Mixtos' },
          { name: 'Promociones' }
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
}
