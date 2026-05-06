import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { UsuarioService } from '../../../../../data/services/usuario.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { Usuario } from '../../../../../data/models/api.models';
import { RouterLink } from "@angular/router";
import { CarritoService } from '../../../../../data/services/cart.service';
import { CarritoProductoService } from '../../../../../data/services/carrito-producto.service';

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'completed' | 'pending' | 'shipped' | 'cancelled';
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
  private router = inject(Router);
  private carritoService = inject(CarritoService);
  private carritoProductoService = inject(CarritoProductoService);

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

  activeTab = signal<'profile' | 'orders'>('profile');
  isEditingProfile = signal(false);
  avatarDb = signal<string | null>(null);
  avatarPreview = signal<string | null>(null);
  isMobileMenuOpen = signal(false);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  selectedFileName = signal<string | null>(null);
  fileInputRef!: HTMLInputElement;

  triggerFileInput(input: HTMLInputElement) {
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
  }

  ngOnInit(): void {
    this.loadUsuario();
  }

  loadUsuario(): void {
    this.usuarioService.getAll().subscribe({
      next: (res) => {
        const user = res[0];
        this.usuarioApi.set(user);
        this.mapUsuarioToProfile(user);
      },
      error: (err) => {
        console.error('Error cargando usuario', err);
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

    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    this.selectedFileName.set(file.name);
    this.processImage(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      this.selectedFileName.set(file.name);
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
    this.avatarPreview.set(null);
    this.selectedFileName.set(null);

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
    this.isEditingProfile.set(false);
  }

  saveProfile(): void {
    if (!this.validateAllFields()) return;

    const user = this.usuarioApi();
    if (!user) return;

    const current = this.userDataProfile();

    const payload: Partial<Usuario> = {
      nombres: current.firstName,
      apellidos: current.lastName,
      email: current.email,
      telefono: current.phone,
      dni: current.dni,
      direccion: current.address,
      ciudad: current.city,
      url_img: this.selectedFileName() ? `https://preview.redd.it/mereleona-vs-natsu-from-fairy-tail-who-would-win-v0-uitjwhlhst3e1.jpg?width=640&crop=smart&auto=webp&s=c8ebf0076e6992f19f4cbeb507902ab8ad545faf` : undefined
    };

    this.usuarioService.update(user.id_usuario, payload).subscribe({
      next: () => {
        this.originalProfile.set({ ...current });
        this.isEditingProfile.set(false);

        if (this.avatarPreview()) {
          this.avatarDb.set(this.avatarPreview()!);
          this.avatarPreview.set(null);
        }
      },
      error: (err) => {
        console.error(err);
        alert('Error al actualizar el perfil');
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
    this.ordersSignal.set([]);

    this.carritoService.getAll().subscribe({
      next: (carritos) => {

        const vendidos = carritos.filter(c => c.estado === 'V');

        if (vendidos.length === 0) {
          this.ordersSignal.set([]);
          return;
        }

        vendidos.forEach(carrito => {
          this.carritoProductoService
            .getByCarrito(carrito.id_carrito)
            .subscribe(productos => {

              const total = productos.reduce((sum, p) =>
                sum + (p.cantidad * p.precio_venta), 0
              );

              this.ordersSignal.update(prev => [
                ...prev,
                {
                  id: carrito.id_carrito.toString(),
                  date: new Date(carrito.fecha_compra).toLocaleDateString(),
                  total: total,
                  status: 'completed'
                }
              ]);
            });
        });

      },
      error: () => {
        this.ordersSignal.set([]);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return classes[status] || classes['pending'];
  }

  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      completed: 'Completado',
      pending: 'Pendiente',
      shipped: 'Enviado',
      cancelled: 'Cancelado'
    };
    return texts[status] || status;
  }

  logout(): void {
    this.authService.logout();
  }
}
