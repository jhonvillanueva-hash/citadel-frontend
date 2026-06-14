import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewChild, ElementRef } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUser,
  faBox,
  faSignOutAlt,
  faEdit,
  faSave,
  faTimes,
  faTrash,
  faCheckCircle,
  faBars,
  faCamera,
  faArrowLeft,
  faChevronDown,
  faChevronUp,
  faTruck,
  faStore,
  faReceipt,
  faTag,
  faArrowUpRightFromSquare
} from '@fortawesome/free-solid-svg-icons';
import { UsuarioService } from '../../../../../data/services/usuario.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { Usuario, Vino, Precio, HistorialPedido } from '../../../../../data/models/api.models';
import { RouterLink } from "@angular/router";
import { CarritoService } from '../../../../../data/services/cart.service';
import { CarritoProductoService } from '../../../../../data/services/carrito-producto.service';
import { finalize, forkJoin, map, switchMap, take } from 'rxjs';
import { CuponService } from '../../../../../data/services/cupon.service';
import { VinoService } from '../../../../../data/services/vino.service';
import { PrecioService } from '../../../../../data/services/precio.service';

interface OrderProduct {
  id: number
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  couponCode?: string;
  status: 'E' | 'R' | 'P' | 'S' | 'C' | 'A';
  type: 'D' | 'T';
  products: OrderProduct[];
  isExpanded?: boolean;
  history?: HistorialPedido[];
  isLoadingHistory?: boolean;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string;
  address: string;
  city: string;
}

const EMPTY_PROFILE: UserProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dni: '',
  address: '',
  city: ''
};

@Component({
  selector: 'app-profile-store',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, RouterLink],
  templateUrl: './profile-store.html'
})
export class ProfileStore implements OnInit {

  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private carritoService = inject(CarritoService);
  private carritoProductoService = inject(CarritoProductoService);
  private cuponService = inject(CuponService);
  private vinoService = inject(VinoService);
  private precioService = inject(PrecioService);

  currentUser = this.authService.currentUser;
  usuarioApi = signal<Usuario | null>(null);

  faUser = faUser;
  faBox = faBox;
  faSignOutAlt = faSignOutAlt;
  faEdit = faEdit;
  faSave = faSave;
  faTimes = faTimes;
  faTrash = faTrash;
  faCheckCircle = faCheckCircle;
  faBars = faBars;
  faCamera = faCamera;
  faArrowLeft = faArrowLeft;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faTruck = faTruck;
  faStore = faStore;
  faReceipt = faReceipt;
  faTag = faTag;
  faArrowUpRightFromSquare = faArrowUpRightFromSquare;

  activeTab = signal<'profile' | 'orders'>('profile');
  isEditingProfile = signal(false);
  isSaving = signal(false);
  isLoadingOrders = signal(false);
  avatarDb = signal<string | null>(null);
  avatarPreview = signal<string | null>(null);
  isMobileMenuOpen = signal(false);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  selectedFileName = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  triggerFileInput(input: HTMLInputElement) {
    if (this.isSaving()) return;
    input.click();
  }

  tabs = [
    { id: 'profile' as const, name: 'Perfil', icon: faUser },
    { id: 'orders' as const, name: 'Pedidos', icon: faBox }
  ];

  userDataProfile = signal<UserProfile>({ ...EMPTY_PROFILE });
  private originalProfile = signal<UserProfile>({ ...EMPTY_PROFILE });

  fieldErrors = signal<Record<string, string>>({});

  ordersSignal = signal<Order[]>([]);

  isInputDisabled = computed(() => !this.isEditingProfile() || this.isSaving());

  userInitials = computed((): string => {
    const first = this.userDataProfile().firstName?.charAt(0) || '';
    const last = this.userDataProfile().lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  });

  maskedEmail = computed(() => {
    const email = this.userDataProfile().email;
    if (!email) return '...';
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return '...';
    const maskedLocal = localPart.length > 2
      ? localPart.substring(0, 2) + '****'
      : '****';
    return `${maskedLocal}@${domain}`;
  });

  constructor() {
    this.loadOrders();
    effect(() => {
      const user = this.currentUser();
      if (user && user.dni) {
        this.usuarioApi.set(user as any);
        this.mapUsuarioToProfile(user as any);
      }
    });
  }

  ngOnInit(): void {
    const user = this.currentUser();
    if (user && user.dni) {
      this.usuarioApi.set(user as any);
      this.mapUsuarioToProfile(user as any);
    } else {
      this.loadUsuario();
    }
  }

  loadUsuario(): void {
    this.usuarioService.getProfile().subscribe({
      next: (user) => {
        this.usuarioApi.set(user);
        this.mapUsuarioToProfile(user);
        this.authService.setUser(user);
      },
      error: (err) => {
        console.error('Error cargando usuario', err);
        this.usuarioService.getAll().subscribe({
          next: (res) => {
            const user = Array.isArray(res) ? res[0] : res;
            if (user) {
              this.usuarioApi.set(user);
              this.mapUsuarioToProfile(user);
              this.authService.setUser(user);
            }
          }
        });
      }
    });
  }

  mapUsuarioToProfile(user: Usuario): void {
    const profile: UserProfile = {
      firstName: user.nombres || '',
      lastName: user.apellidos || '',
      email: user.email || '',
      phone: user.telefono || '',
      dni: user.dni || '',
      address: user.direccion || '',
      city: user.ciudad || ''
    };

    this.userDataProfile.set(profile);
    this.originalProfile.set({ ...profile });

    if (user.url_img) {
      this.avatarDb.set(user.url_img);
    }
  }

  updateField(field: keyof UserProfile, value: string): void {
    this.userDataProfile.update(profile => ({ ...profile, [field]: value }));
    this.validateField(field);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (this.isSaving()) return;

    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    this.selectedFileName.set(file.name);
    this.selectedFile.set(file);
    this.processImage(file);
  }

  onFileSelected(event: Event): void {
    if (this.isSaving()) return;
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      this.selectedFileName.set(file.name);
      this.selectedFile.set(file);
      this.processImage(file);

      input.value = '';
    }
  }

  processImage(file: File): void {
    if (file.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarPreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeAvatar(): void {
    if (this.isSaving()) return;
    this.avatarPreview.set(null);
    this.selectedFileName.set(null);
    this.selectedFile.set(null);

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  enableEditing(): void {
    this.isEditingProfile.set(true);
  }

  cancelEditing(): void {
    this.userDataProfile.set({ ...this.originalProfile() });
    this.fieldErrors.set({});
    this.avatarPreview.set(null);
    this.selectedFile.set(null);
    this.selectedFileName.set(null);
    this.isEditingProfile.set(false);
  }

  saveProfile(): void {
    if (this.isSaving()) return;
    if (!this.validateAllFields()) return;

    const user = this.usuarioApi();
    if (!user) return;

    const current = this.userDataProfile();

    const formData = new FormData();
    formData.append('nombres', current.firstName);
    formData.append('apellidos', current.lastName);
    formData.append('telefono', current.phone);
    formData.append('dni', current.dni);
    formData.append('direccion', current.address);
    formData.append('ciudad', current.city);

    const file = this.selectedFile();
    if (file) {
      formData.append('imagen', file);
    }

    this.isSaving.set(true);

    this.usuarioService
      .updateProfile(user.id_usuario, formData)
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        })
      )
      .subscribe({
        next: (updatedUser) => {
          this.usuarioApi.set(updatedUser);
          this.originalProfile.set({ ...current });
          this.isEditingProfile.set(false);
          this.avatarPreview.set(null);
          this.selectedFile.set(null);
          this.selectedFileName.set(null);

          if (updatedUser.url_img) {
            this.avatarDb.set(updatedUser.url_img + '?t=' + Date.now());
          }
        },
        error: (err) => {
          console.error(err);
          alert('Error al actualizar perfil');
        }
      });
  }

  validateField(field: string): void {
    const errors = { ...this.fieldErrors() };
    const profile = this.userDataProfile();

    switch (field) {
      case 'firstName':
        if (!profile.firstName?.trim()) {
          errors['firstName'] = 'El nombre es requerido';
        } else if (profile.firstName.length < 2) {
          errors['firstName'] = 'El nombre debe tener al menos 2 caracteres';
        } else {
          delete errors['firstName'];
        }
        break;
      case 'lastName':
        if (!profile.lastName?.trim()) {
          errors['lastName'] = 'Los apellidos son requeridos';
        } else {
          delete errors['lastName'];
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!profile.email?.trim()) {
          errors['email'] = 'El email es requerido';
        } else if (!emailRegex.test(profile.email)) {
          errors['email'] = 'Email inválido';
        } else {
          delete errors['email'];
        }
        break;
      case 'phone':
        if (!/^[0-9]{9}$/.test(profile.phone)) {
          errors['phone'] = 'Debe tener 9 dígitos';
        } else {
          delete errors['phone'];
        }
        break;
      case 'dni':
        if (!/^[0-9]{8}$/.test(profile.dni)) {
          errors['dni'] = 'Debe tener 8 dígitos';
        } else {
          delete errors['dni'];
        }
        break;
      case 'address':
        if (profile.address && /[^a-zA-Z0-9\s]/.test(profile.address)) {
          errors['address'] = 'No se permiten signos';
        } else {
          delete errors['address'];
        }
        break;
      case 'city':
        if (profile.city && /[^a-zA-Z\s]/.test(profile.city)) {
          errors['city'] = 'No se permiten signos';
        } else {
          delete errors['city'];
        }
        break;
    }

    this.fieldErrors.set(errors);
  }

  validateAllFields(): boolean {
    ['firstName', 'lastName', 'email', 'phone', 'dni', 'address', 'city'].forEach(f => this.validateField(f));
    return Object.keys(this.fieldErrors()).length === 0;
  }

  getInputClasses(field: string): string {
    const base = 'w-full px-4 py-2.5 bg-gray-50 border focus:outline-none focus:ring-1 focus:ring-[#0e0d12] focus:border-[#0e0d12] transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500 text-[#0e0d12] text-sm';
    return `${base} ${this.fieldErrors()[field] ? 'border-red-500' : 'border-gray-200'}`;
  }

  onlyNumbers(event: KeyboardEvent): void {
    if (!/[0-9]/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab') {
      event.preventDefault();
    }
  }

  onlyLettersAndNumbers(event: KeyboardEvent): void {
    if (!/[a-zA-Z0-9\s]/.test(event.key)) {
      event.preventDefault();
    }
  }

  isProfileValid = computed(() => {
    const p = this.userDataProfile();

    const phoneValid = p.phone === '' || /^[0-9]{9}$/.test(p.phone);
    const dniValid = p.dni === '' || /^[0-9]{8}$/.test(p.dni);

    const requiredValid =
      p.firstName.trim().length >= 2 &&
      p.lastName.trim().length > 0;

    return phoneValid && dniValid && requiredValid && Object.keys(this.fieldErrors()).length === 0;
  });

  orders = (): Order[] => this.ordersSignal();

  loadOrders(): void {
    this.isLoadingOrders.set(true);
    this.ordersSignal.set([]);

    forkJoin({
      carritos: this.carritoService.getAll().pipe(take(1)),
      vinos: this.vinoService.getAll().pipe(take(1)),
      precios: this.precioService.getAll().pipe(take(1))
    }).pipe(
      finalize(() => this.isLoadingOrders.set(false))
    ).subscribe({
      next: ({ carritos, vinos, precios }) => {
        const vendidos = carritos.filter(c => ['E', 'R', 'P', 'S', 'C', 'A'].includes(c.estado));

        if (vendidos.length === 0) {
          return;
        }

        const orderObservables = vendidos.map(carrito => {
          return this.carritoProductoService.getByCarrito(carrito.id_carrito).pipe(
            switchMap(productos => {
              const orderProducts: OrderProduct[] = productos.map(p => {
                const precio = precios.find(pr => pr.id_precio === p.id_precio);
                const vino = vinos.find(v => v.id_vino === precio?.id_vino);
                return {
                  id: vino?.id_vino!,
                  name: vino?.nombre || 'Producto desconocido',
                  quantity: p.cantidad,
                  price: p.precio_venta,
                  imageUrl: vino?.url_img_principal || ''
                };
              });

              const subtotal = orderProducts.reduce((sum, p) => sum + (p.quantity * p.price), 0);
              const shippingFee = carrito.tipo === 'D' ? 20 : 0;

              if (carrito.id_cupon) {
                return this.cuponService.getById(carrito.id_cupon).pipe(
                  map(cupon => {
                    let discount = 0;
                    if (subtotal >= cupon.monto_minimo) {
                      if (cupon.tipo_descuento === 'F') {
                        discount = cupon.descuento;
                      } else if (cupon.tipo_descuento === 'P') {
                        discount = subtotal * (cupon.descuento / 100);
                      }
                    }

                    const total = Math.max(0, subtotal + shippingFee - discount);

                    return {
                      id: carrito.id_carrito.toString(),
                      date: new Date(carrito.fecha_compra).toLocaleDateString(),
                      total,
                      subtotal,
                      shippingFee,
                      discount,
                      couponCode: cupon.codigo.toString(),
                      status: carrito.estado,
                      type: carrito.tipo,
                      products: orderProducts,
                      isExpanded: false
                    } as Order;
                  })
                );
              } else {
                const total = subtotal + shippingFee;
                return [{
                  id: carrito.id_carrito.toString(),
                  date: new Date(carrito.fecha_compra).toLocaleDateString(),
                  total,
                  subtotal,
                  shippingFee,
                  discount: 0,
                  status: carrito.estado,
                  type: carrito.tipo,
                  products: orderProducts,
                  isExpanded: false
                } as Order];
              }
            })
          );
        });

        forkJoin(orderObservables).subscribe(orders => {
          const flattenedOrders = (orders as any).flat() as Order[];
          flattenedOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          this.ordersSignal.set(flattenedOrders);
        });
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.ordersSignal.set([]);
      }
    });
  }

  toggleOrderExpansion(orderId: string): void {
    this.ordersSignal.update(orders =>
      orders.map(o => {
        if (o.id === orderId) {
          const newState = !o.isExpanded;
          if (newState && !o.history) {
            this.loadOrderHistory(o.id);
          }
          return { ...o, isExpanded: newState };
        }
        return o;
      })
    );
  }

  loadOrderHistory(orderId: string): void {
    this.ordersSignal.update(orders =>
      orders.map(o => o.id === orderId ? { ...o, isLoadingHistory: true } : o)
    );

    this.carritoService.getHistory(Number(orderId)).subscribe({
      next: (history: any[]) => {
        this.ordersSignal.update(orders =>
          orders.map(o => o.id === orderId ? { 
            ...o, 
            history: history.sort((a: { fecha_cambio: string | number | Date; }, b: { fecha_cambio: string | number | Date; }) => new Date(a.fecha_cambio).getTime() - new Date(b.fecha_cambio).getTime()), 
            isLoadingHistory: false 
          } : o)
        );
      },
      error: (err: any) => {
        console.error('Error loading history:', err);
        this.ordersSignal.update(orders =>
          orders.map(o => o.id === orderId ? { ...o, isLoadingHistory: false } : o)
        );
      }
    });
  }

  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      E: 'En espera',
      P: 'Pagado',
      R: 'Revisado',
      A: 'Alistado',
      S: 'Enviado o listo para recoger',
      C: 'Completado',
    };
    return texts[status] || status;
  }

  getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      E: 'Los productos de tu carrito pasaron a un pedido oficial.',
      P: 'Tu pedido fue pagado exitósamente.',
      R: 'Tu pedido fue revisado por la tienda',
      A: 'Tu pedido ya está listo.',
      S: 'Tu pedido fue enviado o está listo para recoger en tienda.',
      C: 'Pedido completado exitosamente.',
    };
    return descriptions[status] || status;
  }

  logout(): void {
    this.authService.logout();
  }

  generarSlug(texto: string): string {
    return texto
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }
}
