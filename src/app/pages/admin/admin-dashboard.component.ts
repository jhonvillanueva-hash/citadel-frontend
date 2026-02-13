import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/models/cart.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (authService.isInitializing() || !currentUser()) {
      <div class="flex justify-center items-center mt-16">
        <p class="text-lg text-gray-600 font-medium">
          Verificando permisos...
        </p>
      </div>
    } 
    
    @else if (currentUser()?.tipo === 'A') {
      <div class="max-w-5xl mx-auto px-6 py-8 font-sans">
        
        <header class="flex justify-between items-center border-b-2 border-gray-800 pb-4">
          <h1 class="text-3xl font-bold text-gray-800">
            Panel de Administración
          </h1>
          <button 
            (click)="logout()"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Salir
          </button>
        </header>
        
        <div class="mt-8">
          <p class="text-lg text-gray-700">
            Bienvenido, Administrador 
            <strong>{{ currentUser()?.nombres }}</strong>
          </p>

          <div class="flex flex-wrap gap-6 mt-6">
            <div class="bg-gray-900 text-white px-6 py-6 rounded-xl w-40 text-center shadow-md">
              <p class="text-sm text-gray-400">Usuarios</p>
              <p class="text-2xl font-bold mt-2">150</p>
            </div>

            <div class="bg-gray-900 text-white px-6 py-6 rounded-xl w-40 text-center shadow-md">
              <p class="text-sm text-gray-400">Ventas</p>
              <p class="text-2xl font-bold mt-2">$5000</p>
            </div>

            <div class="bg-gray-900 text-white px-6 py-6 rounded-xl w-40 text-center shadow-md">
              <p class="text-sm text-gray-400">Alertas</p>
              <p class="text-2xl font-bold mt-2">0</p>
            </div>
          </div>
        </div>

        <div class="mt-10 p-6 border border-red-500 rounded-lg bg-red-50">
          <h3 class="text-lg font-semibold text-red-700 mb-2">
            Tests
          </h3>
          <p class="text-sm text-red-600 mb-4">
            Prueba de borrado (DELETE /admin/carritos/:id)
          </p>
          
          <div class="flex flex-wrap gap-3">
            <input 
              #idInput 
              type="number" 
              placeholder="ID Carrito"
              class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
            <button 
              (click)="borrarCarrito(idInput.value)"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              Borrar Carrito
            </button>
          </div>
        </div>
        
      </div>
    }
  `
})
export class AdminDashboardComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);
  currentUser = this.authService.currentUser;

  logout() {
    this.authService.logout();
  }

  borrarCarrito(id: string) {
    if (!id) {
      alert('Ingresa un ID válido');
      return;
    }

    if (!confirm(`¿Seguro que quieres borrar el carrito ${id}?`)) return;
    this.cartService.delete(id).subscribe({
      next: () => {
        alert(`Carrito ${id} eliminado correctamente.`);
      },
      error: (err) => {
        console.error(err);
        alert(`Error al eliminar. ¿Existe el ID ${id}? Revisa consola.`);
      }
    });
  }
}