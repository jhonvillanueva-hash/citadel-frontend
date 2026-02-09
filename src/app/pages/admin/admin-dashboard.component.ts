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
      <div class="loading-container">
        <p>Verificando permisos...</p>
      </div>
    } 
    
    @else if (currentUser()?.tipo === 'A') {
      <div class="admin-panel">
        <header>
          <h1>Panel de Administración</h1>
          <button (click)="logout()">Salir</button>
        </header>
        
        <div class="content">
          <p>Bienvenido, Administrador <strong>{{ currentUser()?.nombres }}</strong></p>
          <div class="stats">
            <div class="card">Usuarios: 150</div>
            <div class="card">Ventas: $5000</div>
            <div class="card">Alertas: 0</div>
          </div>
        </div>

        <div class="test-area" style="margin-top: 20px; padding: 20px; border: 1px solid red;">
          <h3>Tests</h3>
          <p>Prueba de borrado (DELETE /admin/carritos/:id)</p>
          
          <div style="display: flex; gap: 10px;">
             <input #idInput type="number" placeholder="ID Carrito">
             <button (click)="borrarCarrito(idInput.value)">Borrar Carrito</button>
          </div>
        </div>
        
      </div>
    }
  `,
  styles: [`
    .admin-panel { padding: 20px; font-family: sans-serif; }
    header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
    .content { margin-top: 20px; }
    .stats { display: flex; gap: 20px; margin-top: 20px; }
    .card { background: #333; color: white; padding: 20px; border-radius: 8px; width: 150px; text-align: center; }
    button { background: #d9534f; color: white; border: none; padding: 8px 16px; cursor: pointer; border-radius: 4px; }
  `]
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