import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/models/cart.service';
import { CommonModule } from '@angular/common';
import { Carrito } from '../../core/models/api.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (authService.isInitializing() || !currentUser()) {
      <div style="text-align: center; margin-top: 50px;">
        <h2>Cargando...</h2>
      </div>
    } @else {
      <div class="dashboard">
        <h1>Bienvenido al Dashboard</h1>
        
        <div class="user-info">
          <h3>Tus Datos:</h3>
          <ul>
            <li><strong>ID:</strong> {{ currentUser()?.id_usuario }}</li>
            <li><strong>Email:</strong> {{ currentUser()?.email }}</li>
            <li><strong>Tipo:</strong> {{ currentUser()?.tipo }}</li>
          </ul>
        </div>

        <div class="actions">
          <button class="logout" (click)="logout()">Cerrar Sesión</button>
        </div>

        <div class="actions">
          <button (click)="crearCarritoTest()">Test: Crear Carrito (POST)</button>
          <button class="logout" (click)="logout()">Cerrar Sesión</button>
        </div>

        @if (testResult()) {
          <div class="result-box">
            <h3>Resultado API:</h3>
            <pre>{{ testResult() | json }}</pre>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .dashboard { max-width: 600px; margin: 2rem auto; font-family: sans-serif; }
    .actions { margin: 20px 0; display: flex; gap: 10px; }
    .user-info { background: #f4f4f4; padding: 15px; border-radius: 5px; }
    button { margin-right: 10px; padding: 10px; cursor: pointer; }
    .logout { background: #dc3545; color: white; border: none; }
    .result-box { background: #f4f4f4; padding: 15px; border-radius: 5px; margin-top: 20px; }
  `]
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