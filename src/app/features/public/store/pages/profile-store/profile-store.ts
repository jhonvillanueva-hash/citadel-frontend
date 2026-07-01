import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
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
  faArrowUpRightFromSquare,
  faMapMarkerAlt,
  faPlus,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import { UsuarioService } from '../../../../../data/services/usuario.service';
import { DireccionService } from '../../../../../data/services/direccion.service';
import { UbigeoService, Departamento, Provincia, Distrito } from '../../../../../data/services/ubigeo.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { Usuario, HistorialPedido, Direccion } from '../../../../../data/models/api.models';
import { RouterLink, Router } from "@angular/router";
import { CarritoService } from '../../../../../data/services/cart.service';
import { CarritoProductoService } from '../../../../../data/services/carrito-producto.service';
import { finalize, forkJoin, map, switchMap, take } from 'rxjs';
import { CuponService } from '../../../../../data/services/cupon.service';
import { VinoService } from '../../../../../data/services/vino.service';
import { PrecioService } from '../../../../../data/services/precio.service';
import { ToastService } from '../../../../../shared/components/toast/toast.service';

interface OrderProduct {
  id: number
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

interface Order {
  id: string;
  date: Date;
  total: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  couponCode?: string;
  status: 'E' | 'R' | 'P' | 'S' | 'C' | 'A';
  type: 'D' | 'T';
  products: OrderProduct[];
  destinationAddress?: Direccion | null;
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
}

const EMPTY_PROFILE: UserProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dni: '',
};

@Component({
  selector: 'app-profile-store',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, RouterLink],
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
  private toastService = inject(ToastService);
  private router = inject(Router);
  private direccionService = inject(DireccionService);
  private ubigeoService = inject(UbigeoService);
  private fb = inject(FormBuilder);

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
  faMapMarkerAlt = faMapMarkerAlt;
  faPlus = faPlus;
  faStar = faStar;

  activeTab = signal<'profile' | 'orders' | 'addresses'>('profile');
  isEditingProfile = signal(false);
  isSaving = signal(false);
  isLoadingOrders = signal(false);
  isMobileMenuOpen = signal(false);

  triggerFileInput(input: HTMLInputElement) {
    if (this.isSaving()) return;
    input.click();
  }

  tabs = [
    { id: 'profile' as const, name: 'Perfil', icon: faUser },
    { id: 'orders' as const, name: 'Pedidos', icon: faBox },
    { id: 'addresses' as const, name: 'Mis Direcciones', icon: faMapMarkerAlt }
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

  direcciones = signal<Direccion[]>([]);
  isLoadingAddresses = signal(false);
  isEditingAddressForm = signal(false);
  currentAddressId = signal<number | null>(null);

  departamentos = signal<Departamento[]>([]);
  provincias = signal<Provincia[]>([]);
  distritos = signal<Distrito[]>([]);
  provinciasFiltradas = signal<Provincia[]>([]);
  distritosFiltrados = signal<Distrito[]>([]);

  addressForm: FormGroup;

  constructor() {
    this.addressForm = this.fb.group({
      id_departamento: ['', Validators.required],
      id_provincia: [{ value: '', disabled: true }, Validators.required],
      id_distrito: [{ value: '', disabled: true }, Validators.required],
      calle: ['', [Validators.required, Validators.minLength(3)]],
      numero: ['', Validators.required],
      cp: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      principal: [false]
    });

    effect(() => {
      const user = this.currentUser();
      if (user && user.dni) {
        this.usuarioApi.set(user as any);
        this.mapUsuarioToProfile(user as any);
      }
    });

    this.setupUbigeoCascade();
  }

  setupUbigeoCascade() {
    this.addressForm.get('id_departamento')?.valueChanges.subscribe(depId => {
      if (depId) {
        this.provinciasFiltradas.set(this.provincias().filter(p => p.departamento_id == Number(depId)));
        this.addressForm.get('id_provincia')?.enable();
      } else {
        this.provinciasFiltradas.set([]);
        this.addressForm.get('id_provincia')?.disable();
      }
      this.addressForm.patchValue({ id_provincia: '', id_distrito: '' }, { emitEvent: false });
      this.distritosFiltrados.set([]);
      this.addressForm.get('id_distrito')?.disable();
    });

    this.addressForm.get('id_provincia')?.valueChanges.subscribe(provId => {
      if (provId) {
        this.distritosFiltrados.set(this.distritos().filter(d => d.provincia_id == Number(provId)));
        this.addressForm.get('id_distrito')?.enable();
      } else {
        this.distritosFiltrados.set([]);
        this.addressForm.get('id_distrito')?.disable();
      }
      this.addressForm.patchValue({ id_distrito: '' }, { emitEvent: false });
    });
  }

  ngOnInit(): void {
    this.checkRouteAndLoadData();
    const user = this.currentUser();
    if (user && user.dni) {
      this.usuarioApi.set(user as any);
      this.mapUsuarioToProfile(user as any);
    } else {
      this.loadUsuario();
    }
  }

  checkRouteAndLoadData() {
    if (this.router.url.includes('/orders')) {
      this.activeTab.set('orders');
      this.loadOrders();
    } else if (this.router.url.includes('/addresses')) {
      this.activeTab.set('addresses');
      this.loadAddresses();
      this.loadUbigeo();
    } else {
      this.activeTab.set('profile');
    }
  }

  switchTab(tabId: 'profile' | 'orders' | 'addresses'): void {
    this.activeTab.set(tabId);
    if (tabId === 'orders') {
      this.router.navigate(['/store/profile/orders']);
      if (this.ordersSignal().length === 0 && !this.isLoadingOrders()) {
        this.loadOrders();
      }
    } else if (tabId === 'addresses') {
      this.router.navigate(['/store/profile/addresses']);
      if (this.direcciones().length === 0 && !this.isLoadingAddresses()) {
        this.loadAddresses();
        this.loadUbigeo();
      }
    } else {
      this.router.navigate(['/store/profile']);
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
    };

    this.userDataProfile.set(profile);
    this.originalProfile.set({ ...profile });
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

  enableEditing(): void {
    this.isEditingProfile.set(true);
  }

  cancelEditing(): void {
    this.userDataProfile.set({ ...this.originalProfile() });
    this.fieldErrors.set({});
    this.isEditingProfile.set(false);
  }

  saveProfile(): void {
    if (this.isSaving()) return;
    if (!this.validateAllFields()) return;

    const user = this.usuarioApi();
    if (!user) return;

    const current = this.userDataProfile();

    const payload = {
      nombres: current.firstName,
      apellidos: current.lastName,
      telefono: current.phone,
      dni: current.dni,
    };

    this.isSaving.set(true);

    this.usuarioService
      .updateProfile(user.id_usuario, payload)
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
          this.toastService.showSuccess('Información actualizada correctamente.');
        },
        error: (err) => {
          this.toastService.showError(err.error?.error ?? 'Error al actualizar perfil');
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
    }

    this.fieldErrors.set(errors);
  }

  validateAllFields(): boolean {
    ['firstName', 'lastName', 'email', 'phone', 'dni'].forEach(f => this.validateField(f));
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

  loadUbigeo() {
    if (this.departamentos().length > 0) return;

    forkJoin({
      deps: this.ubigeoService.getDepartamentos().pipe(take(1)),
      provs: this.ubigeoService.getProvincias().pipe(take(1)),
      dists: this.ubigeoService.getDistritos().pipe(take(1))
    }).subscribe({
      next: ({ deps, provs, dists }) => {
        this.departamentos.set(deps);
        this.provincias.set(provs);
        this.distritos.set(dists);
      },
      error: err => console.error('Error loading ubigeo', err)
    });
  }

  loadAddresses() {
    this.isLoadingAddresses.set(true);
    this.direccionService.getAll().pipe(
      finalize(() => this.isLoadingAddresses.set(false))
    ).subscribe({
      next: (dirs) => {
        this.direcciones.set(dirs);
      },
      error: (err) => {
        console.error('Error loading addresses', err);
        this.toastService.showError('No se pudieron cargar las direcciones');
      }
    });
  }

  openNewAddressForm() {
    this.isEditingAddressForm.set(true);
    this.currentAddressId.set(null);
    this.addressForm.reset();
    this.addressForm.patchValue({ principal: false });
    this.addressForm.get('id_provincia')?.disable();
    this.addressForm.get('id_distrito')?.disable();
  }

  editAddress(direccion: Direccion) {
    this.isEditingAddressForm.set(true);
    this.currentAddressId.set(direccion.id_direccion);

    this.addressForm.patchValue({
      id_departamento: direccion.id_departamento?.toString(),
    }, { emitEvent: true });

    this.addressForm.patchValue({
      id_provincia: direccion.id_provincia?.toString(),
    }, { emitEvent: true });

    this.addressForm.patchValue({
      id_distrito: direccion.id_distrito?.toString(),
      calle: direccion.calle,
      numero: direccion.numero,
      cp: direccion.cp,
      principal: direccion.principal
    });
  }

  cancelEditAddress() {
    this.isEditingAddressForm.set(false);
    this.currentAddressId.set(null);
    this.addressForm.reset();
  }

  saveAddress() {
    if (this.addressForm.invalid || this.isSaving()) return;
    this.isSaving.set(true);

    const formData = this.addressForm.getRawValue();
    const addressId = this.currentAddressId();

    if (addressId) {
      this.direccionService.update(addressId, formData).pipe(
        finalize(() => this.isSaving.set(false))
      ).subscribe({
        next: (updatedDir) => {
          this.toastService.showSuccess('Dirección actualizada');
          this.isEditingAddressForm.set(false);
          this.updateAddressInList(addressId, updatedDir);
        },
        error: (err) => this.toastService.showError(err.error?.error || 'Error al actualizar')
      });
    } else {
      this.direccionService.create(formData).pipe(
        finalize(() => this.isSaving.set(false))
      ).subscribe({
        next: (newDir) => {
          this.toastService.showSuccess('Dirección agregada');
          this.isEditingAddressForm.set(false);
          if (newDir.principal) {
            this.direcciones.update(dirs => dirs.map(d => ({ ...d, principal: false })));
          }
          this.direcciones.update(dirs => [newDir, ...dirs]);
        },
        error: (err) => this.toastService.showError(err.error?.error || 'Error al crear')
      });
    }
  }

  private updateAddressInList(originalId: number, updatedDir: Direccion) {
    this.direcciones.update(dirs => {
      let newDirs = [...dirs];

      if (originalId !== updatedDir.id_direccion) {
        newDirs = newDirs.filter(d => d.id_direccion !== originalId);
      } else {
        newDirs = newDirs.filter(d => d.id_direccion !== originalId);
      }

      if (updatedDir.principal) {
        newDirs = newDirs.map(d => ({ ...d, principal: false }));
      }

      return [updatedDir, ...newDirs].sort((a, b) => b.id_direccion - a.id_direccion);
    });
  }

  deleteAddress(id: number) {
    if (!confirm('¿Estás seguro de eliminar esta dirección?')) return;

    this.direccionService.delete(id).subscribe({
      next: () => {
        this.toastService.showSuccess('Dirección eliminada');
        this.direcciones.update(dirs => dirs.filter(d => d.id_direccion !== id));
      },
      error: (err) => this.toastService.showError(err.error?.error || 'Error al eliminar')
    });
  }

  setPrincipal(id: number) {
    const dir = this.direcciones().find(d => d.id_direccion === id);
    if (!dir || dir.principal) return;

    this.direccionService.actualizarPrincipal({
      id_departamento: dir.id_departamento,
      id_provincia: dir.id_provincia,
      id_distrito: dir.id_distrito,
      calle: dir.calle,
      numero: dir.numero,
      cp: dir.cp
    }).subscribe({
      next: (updatedDir) => {
        this.toastService.showSuccess('Dirección principal actualizada');
        this.updateAddressInList(dir.id_direccion, updatedDir);
      },
      error: (err) => this.toastService.showError(err.error?.error || 'Error al actualizar')
    });
  }

  getDepartamentoName(id: string | number): string {
    return this.departamentos().find(d => d.id_ubigeo === id?.toString())?.nombre_ubigeo || '';
  }

  getProvinciaName(id: string | number): string {
    return this.provincias().find(d => d.id_ubigeo === id?.toString())?.nombre_ubigeo || '';
  }

  getDistritoName(id: string | number): string {
    return this.distritos().find(d => d.id_ubigeo === id?.toString())?.nombre_ubigeo || '';
  }

  orders = (): Order[] => this.ordersSignal();

  loadOrders(): void {
    this.isLoadingAddresses.set(false);
    this.isLoadingOrders.set(true);
    this.ordersSignal.set([]);

    if (this.departamentos().length === 0) {
      this.loadUbigeo();
    }

    forkJoin({
      carritos: this.carritoService.getAll().pipe(take(1)),
      vinos: this.vinoService.getAll().pipe(take(1)),
      precios: this.precioService.getAll().pipe(take(1))
    }).pipe(
      finalize(() => this.isLoadingOrders.set(false))
    ).subscribe({
      next: ({ carritos, vinos, precios }) => {
        const vendidos = carritos.filter(c => ['R', 'P', 'S', 'C', 'A'].includes(c.estado));

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
              const date = new Date(carrito.fecha_compra);

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
                      date: date,
                      total,
                      subtotal,
                      shippingFee,
                      discount,
                      couponCode: cupon.codigo.toString(),
                      status: carrito.estado,
                      type: carrito.tipo,
                      products: orderProducts,
                      destinationAddress: carrito.direccion ?? null,
                      isExpanded: false
                    } as Order;
                  })
                );
              } else {
                const total = subtotal + shippingFee;
                return [{
                  id: carrito.id_carrito.toString(),
                  date: date,
                  total,
                  subtotal,
                  shippingFee,
                  discount: 0,
                  status: carrito.estado,
                  type: carrito.tipo,
                  products: orderProducts,
                  destinationAddress: carrito.direccion ?? null,
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
