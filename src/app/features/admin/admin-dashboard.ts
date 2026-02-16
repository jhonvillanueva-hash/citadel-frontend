import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  styles: [`
    .sidebar {
      transition: transform 0.3s ease, width 0.3s ease;
    }
    .main-content {
      transition: margin-left 0.3s ease;
    }
    @media (min-width: 768px) {
      .sidebar {
        transform: translateX(0) !important;
      }
      .layout-open   .sidebar { width: 16rem; }
      .layout-open   .main-content { margin-left: 16rem; }
      .layout-closed .sidebar { width: 4rem; }
      .layout-closed .main-content { margin-left: 4rem; }
      .layout-closed .sidebar .nav-label,
      .layout-closed .sidebar .nav-section,
      .layout-closed .sidebar .brand-name,
      .layout-closed .sidebar .logout-label {
        display: none;
      }
      .layout-closed .sidebar .nav-link {
        justify-content: center;
        padding-left: 0;
        padding-right: 0;
      }
    }
    @media (max-width: 767px) {
      .sidebar { width: 16rem; }
      .main-content { margin-left: 0 !important; }

      .layout-open   .sidebar { transform: translateX(0); }
      .layout-closed .sidebar { transform: translateX(-100%); }
    }
  `],
  template: `
    @if (authService.isInitializing() || !currentUser()) {
      <div class="flex items-center justify-center mt-20">
        <p class="text-[#c35b64] text-lg font-medium">Verificando permisos...</p>
      </div>
    } @else {
      @if (currentUser()?.tipo === 'A') {

        <div
          class="min-h-screen flex bg-[#f8ecee] relative"
          [class.layout-open]="sidebarOpen"
          [class.layout-closed]="!sidebarOpen"
        >
          <aside
            class="sidebar fixed z-30 inset-y-0 left-0 bg-[#2a1f21] text-white flex flex-col overflow-hidden"
            role="navigation"
            aria-label="Menú lateral administración"
          >
            <div class="flex items-center gap-2 px-4 border-b border-[#3a2a2d] min-h-[64px] overflow-hidden">
              <span class="w-8 h-8 shrink-0 rounded-lg bg-[#c35b64] flex items-center justify-center shadow-md">
                <i class="bi bi-shield-lock-fill text-white text-sm"></i>
              </span>
              <span class="brand-name text-base font-bold tracking-tight whitespace-nowrap">
                CITADEL
              </span>
            </div>

            <nav class="flex-1 px-2 py-5 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">

              <p class="nav-section text-[10px] font-semibold uppercase tracking-widest text-[#c35b64]/70 px-3 mb-2 whitespace-nowrap">
                General
              </p>

              <a
                routerLink="/admin/statistics"
                routerLinkActive="!bg-[#c35b64] !text-white"
                [routerLinkActiveOptions]="{ exact: true }"
                class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300
                       hover:bg-[#3a2a2d] hover:text-white transition-all duration-150 text-sm font-medium"
                title="Estadísticas"
              >
                <i class="bi bi-bar-chart-line shrink-0 w-4 text-center text-base"></i>
                <span class="nav-label whitespace-nowrap">Estadísticas</span>
              </a>

              <a
                routerLink="/admin/users"
                routerLinkActive="!bg-[#c35b64] !text-white"
                class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300
                       hover:bg-[#3a2a2d] hover:text-white transition-all duration-150 text-sm font-medium"
                title="Usuarios"
              >
                <i class="bi bi-people shrink-0 w-4 text-center text-base"></i>
                <span class="nav-label whitespace-nowrap">Usuarios</span>
              </a>

              <p class="nav-section text-[10px] font-semibold uppercase tracking-widest text-[#c35b64]/70 px-3 mt-5 mb-2 whitespace-nowrap">
                Configuración
              </p>

              <a
                routerLink="/admin/ai"
                routerLinkActive="!bg-[#c35b64] !text-white"
                class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300
                       hover:bg-[#3a2a2d] hover:text-white transition-all duration-150 text-sm font-medium"
                title="IA"
              >
                <i class="bi bi-robot shrink-0 w-4 text-center text-base"></i>
                <span class="nav-label whitespace-nowrap">IA</span>
              </a>
            </nav>

            <div class="px-2 py-4 border-t border-[#3a2a2d]">
              <button
                (click)="logout()"
                class="nav-link w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400
                       hover:bg-[#3a2a2d] hover:text-[#ff8a95] transition-all duration-150 text-sm font-medium"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <i class="bi bi-box-arrow-right shrink-0 w-4 text-center text-base"></i>
                <span class="logout-label whitespace-nowrap">Cerrar sesión</span>
              </button>
            </div>
          </aside>

          <div
            class="fixed inset-0 bg-black/50 z-20 backdrop-blur-sm
                   transition-opacity duration-300 md:hidden"
            [class.opacity-0]="!sidebarOpen"
            [class.pointer-events-none]="!sidebarOpen"
            (click)="sidebarOpen = false"
            aria-hidden="true"
          ></div>

          <div class="main-content flex-1 min-h-screen flex flex-col">

            <header class="bg-white border-b border-[#f1d6d9] px-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm min-h-[64px]">

              <button
                class="p-2 rounded-lg border border-[#f1d6d9] hover:bg-[#f8ecee]
                       text-[#c35b64] transition-all active:scale-95"
                (click)="sidebarOpen = !sidebarOpen"
                [attr.aria-label]="sidebarOpen ? 'Colapsar menú' : 'Expandir menú'"
              >
                <i
                  class="bi text-base transition-all duration-200"
                  [class.bi-layout-sidebar]="sidebarOpen"
                  [class.bi-layout-sidebar-inset]="!sidebarOpen"
                ></i>
              </button>

              <div class="h-5 w-px bg-[#f1d6d9]"></div>

              <h1 class="text-sm font-semibold text-[#c35b64]">
                Panel de Administración
              </h1>

              <div class="flex-1"></div>

              <div class="flex items-center gap-2 bg-[#f8ecee] rounded-full px-3 py-1.5">
                <span class="w-6 h-6 rounded-full bg-[#c35b64] flex items-center justify-center shrink-0">
                  <i class="bi bi-person-fill text-white text-xs"></i>
                </span>
                <span class="text-xs font-medium text-gray-700 hidden sm:inline">
                  Admin
                </span>
              </div>

            </header>

            <main class="flex-1 p-6">
              <router-outlet></router-outlet>
            </main>

          </div>
        </div>

      } @else {
        <div class="flex items-center justify-center min-h-screen bg-[#f8ecee]">
          <div class="bg-white rounded-xl p-8 shadow text-center max-w-sm">
            <i class="bi bi-shield-x text-4xl text-[#c35b64]"></i>
            <p class="mt-3 text-gray-700 font-medium">Sin permisos de acceso</p>
            <p class="mt-1 text-sm text-gray-400">
              No tiene permisos para acceder a esta sección.
            </p>
          </div>
        </div>
      }
    }
  `
})
export class AdminDashboardComponent {
  authService = inject(AuthService);
  currentUser = this.authService.currentUser;
  sidebarOpen = true;

  logout() {
    this.authService.logout();
  }
}
