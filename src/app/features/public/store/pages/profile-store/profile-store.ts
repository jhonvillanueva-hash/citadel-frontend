import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUser,
  faLock,
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
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './profile-store.html'
})
export class ProfileStore implements OnInit {

  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  usuarioApi = signal<Usuario | null>(null);

  faUser = faUser;
  faLock = faLock;
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

  activeTab = signal<'profile' | 'security' | 'orders'>('profile');
  isEditingProfile = signal(false);
  avatarPreview = signal<string | null>(null);
  isMobileMenuOpen = signal(false);

  tabs = [
    { id: 'profile' as const, name: 'Perfil', icon: faUser },
    { id: 'security' as const, name: 'Seguridad', icon: faLock },
    { id: 'orders' as const, name: 'Pedidos', icon: faBox }
  ];

  userDataProfile = signal<UserProfile>({ ...EMPTY_PROFILE });
  private originalProfile = signal<UserProfile>({ ...EMPTY_PROFILE });

  fieldErrors = signal<Record<string, string>>({});

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  ordersSignal = signal<Order[]>([]);

  userInitials = computed((): string => {
    const first = this.userDataProfile().firstName?.charAt(0) || '';
    const last = this.userDataProfile().lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  });

  passwordStrength = computed(() => {
    const pwd = this.passwordData.newPassword;
    return {
      hasMinLength: pwd.length >= 8,
      hasUpperCase: /[A-Z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd)
    };
  });

  passwordMismatch = computed((): boolean => {
    return this.passwordData.newPassword !== '' &&
           this.passwordData.confirmPassword !== '' &&
           this.passwordData.newPassword !== this.passwordData.confirmPassword;
  });

  isPasswordValid = computed((): boolean => {
    const strength = this.passwordStrength();
    return strength.hasMinLength &&
           strength.hasUpperCase &&
           strength.hasNumber &&
           !this.passwordMismatch() &&
           this.passwordData.newPassword !== '';
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
      this.avatarPreview.set(user.url_img);
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

  goBackToStore(): void {
    console.log('Navigate back to store');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.processImage(file);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processImage(input.files[0]);
    }
  }

  processImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarPreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeAvatar(): void {
    this.avatarPreview.set(null);
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
      url_img: this.avatarPreview() ?? undefined
    };

    this.usuarioService.update(user.id_usuario, payload).subscribe({
      next: () => {
        this.originalProfile.set({ ...current });
        this.isEditingProfile.set(false);
        alert('Perfil actualizado correctamente');
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
        if (profile.phone && profile.phone.length < 9) {
          errors['phone'] = 'Teléfono inválido';
        } else {
          delete errors['phone'];
        }
        break;
      case 'dni':
        if (profile.dni && profile.dni.length < 8) {
          errors['dni'] = 'DNI inválido';
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

  validatePassword(): void {}

  updatePassword(): void {
    if (this.isPasswordValid()) {
      this.passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      alert('Contraseña actualizada correctamente');
    }
  }

  memberSince = (): string => {
    return '15 de marzo de 2023';
  };

  orders = (): Order[] => this.ordersSignal();

  loadOrders(): void {
    const storedOrders = localStorage.getItem('mockOrders');
    if (storedOrders) {
      this.ordersSignal.set(JSON.parse(storedOrders));
    } else {
      const mockOrders: Order[] = [
        { id: 'ORD-001', date: '2024-01-15', total: 129.99, status: 'completed' },
        { id: 'ORD-002', date: '2024-02-20', total: 89.50, status: 'shipped' },
        { id: 'ORD-003', date: '2024-03-10', total: 245.00, status: 'pending' }
      ];
      this.ordersSignal.set(mockOrders);
      localStorage.setItem('mockOrders', JSON.stringify(mockOrders));
    }
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
    console.log('User logged out');
  }
}
