import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { UsuarioService } from '../../../data/services/usuario.service';
import { Usuario } from '../../../data/models/api.models';
import { CommonModule, DatePipe } from '@angular/common';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faFilter, 
  faSearch, 
  faEraser, 
  faChevronLeft, 
  faChevronRight,
  faUser,
  faEnvelope,
  faIdCard,
  faPhone,
  faMapMarkerAlt,
  faCalendar
} from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, DatePipe],
  templateUrl: './users.html',
})
export class Users implements OnInit {
  userService = inject(UsuarioService);
  toastService = inject(ToastService);

  allUsers = signal<Usuario[]>([]);
  isLoading = signal(false);

  currentPage = signal(1);
  pageSize = signal(10);
  
  filterField = signal<string>('all');
  filterText = signal<string>('');
  appliedFilterField = signal<string>('all');
  appliedFilterText = signal<string>('');

  filteredUsers = computed(() => {
    let users = this.allUsers().filter(u => u.tipo !== 'A');
    const field = this.appliedFilterField();
    const text = this.appliedFilterText().toLowerCase().trim();

    if (text) {
      users = users.filter(u => {
        if (field === 'all') {
          return (
            u.nombres?.toLowerCase().includes(text) ||
            u.apellidos?.toLowerCase().includes(text) ||
            u.dni?.toLowerCase().includes(text) ||
            u.email?.toLowerCase().includes(text) ||
            u.telefono?.toLowerCase().includes(text) ||
            u.ciudad?.toLowerCase().includes(text)
          );
        }
        
        const value = (u as any)[field]?.toString().toLowerCase() || '';
        return value.includes(text);
      });
    }

    return users;
  });

  paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredUsers().slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredUsers().length / this.pageSize()) || 1;
  });

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.isLoading.set(true);
    this.userService.getAll().subscribe({
      next: (data) => {
        this.allUsers.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.showError('Error cargando usuarios', err);
        this.isLoading.set(false);
      }
    });
  }

  applyFilter() {
    this.appliedFilterField.set(this.filterField());
    this.appliedFilterText.set(this.filterText());
    this.currentPage.set(1);
  }

  clearFilter() {
    this.filterField.set('all');
    this.filterText.set('');
    this.appliedFilterField.set('all');
    this.appliedFilterText.set('');
    this.currentPage.set(1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
  }

  getPagesArray() {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    for (let i = 1; i <= total; i++) {
      if (
        i === 1 || 
        i === total || 
        (i >= current - 1 && i <= current + 1)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== -1) {
        pages.push(-1);
      }
    }
    return pages;
  }

  formatValue(value: any): string {
    return value && value.toString().trim() !== '' ? value : 'No establecido';
  }

  icons = {
    faFilter,
    faSearch,
    faEraser,
    faChevronLeft,
    faChevronRight,
    faUser,
    faEnvelope,
    faIdCard,
    faPhone,
    faMapMarkerAlt,
    faCalendar
  }
}