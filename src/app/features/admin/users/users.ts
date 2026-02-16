import { Component, inject, OnInit, signal } from '@angular/core';
import { UsuarioService } from '../../../data/services/usuario.service';
import { Usuario } from '../../../data/models/api.models';
import { JsonPipe } from '@angular/common';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './users.html',
  styles: ``,
})
export class Users implements OnInit {
  userService = inject(UsuarioService);
  toastService = inject(ToastService);
  dataUsers = signal<Usuario[]>([]);

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.userService.getAll().subscribe({
      next: (data) => {
        this.dataUsers.set(data); 
      }
    });
  }
}