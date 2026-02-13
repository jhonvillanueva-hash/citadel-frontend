import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/models/cart.service';
import { CommonModule } from '@angular/common';
import { Carrito } from '../../core/models/api.models';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (authService.isInitializing() || !currentUser()) {
      <div class="flex justify-center items-center mt-12">
        <h2 class="text-2xl font-semibold text-gray-700">Cargando...</h2>
      </div>
    } @else {
      <div class="max-w-2xl mx-auto mt-8 px-4 font-sans">
        <h1 class="text-3xl font-bold mb-6 text-gray-800">
          Bienvenido a la home del cliente
        </h1>
        
        <div class="bg-gray-100 p-4 rounded-lg shadow-sm mb-6">
          <h3 class="text-lg font-semibold mb-3 text-gray-700">Tus Datos:</h3>
          <ul class="space-y-1 text-gray-600">
            <li><strong>ID:</strong> {{ currentUser()?.id_usuario }}</li>
            <li><strong>Email:</strong> {{ currentUser()?.email }}</li>
            <li><strong>Tipo:</strong> {{ currentUser()?.tipo }}</li>
          </ul>
        </div>

        <div class="flex flex-wrap gap-3 mb-6">
          <button
            (click)="crearCarritoTest()"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Test: Crear Carrito (POST)
          </button>

          <button
            (click)="logout()"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Cerrar Sesión
          </button>

          <button
            routerLink="/"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Ir a la landing
          </button>
        </div>

        @if (testResult()) {
          <div class="bg-gray-100 p-4 rounded-lg shadow-sm mt-6">
            <h3 class="text-lg font-semibold mb-3 text-gray-700">
              Resultado API:
            </h3>
            <pre class="bg-white p-3 rounded text-sm overflow-x-auto">
              {{ testResult() | json }}
            </pre>
          </div>
        }
      </div>
    }
  `
})
export class HomeComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);
  currentUser = this.authService.currentUser;
  isInitializing = this.authService.isInitializing;
  testResult = signal<any>(null);

  logout() {
    this.authService.logout();
  }

  crearCarritoTest() {
    const nuevoCarrito: Partial<Carrito> = {
      id_usuario: this.currentUser()?.id_usuario,
    };

    this.cartService.create(nuevoCarrito).subscribe({
      next: (res) => {
        this.testResult.set(res);
        alert('Carrito creado con éxito. Mira el JSON en pantalla.');
      },
      error: (err) => {
        console.error(err);
        this.testResult.set(err.error);
        alert('Error al crear carrito. Revisa consola.');
      }
    });
  }
}