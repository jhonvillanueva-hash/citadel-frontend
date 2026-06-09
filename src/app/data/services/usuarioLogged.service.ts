import { Injectable, inject } from "@angular/core";
import { tap } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { UsuarioService } from "./usuario.service";
import { EMPTY } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuarioLoggedService {

  private readonly usuarioService = inject(UsuarioService);
  private readonly authService = inject(AuthService);

  loadProfile() {
    const user = this.authService.currentUser();

    if (user?.tipo !== 'A') {
      return this.usuarioService.getProfile().pipe(
        tap({
          next: (user) => {
            this.authService.setUser(user);
          },
          error: (err) => {
            console.error(
              'Error al cargar perfil en UsuarioLoggedService:',
              err
            );
          }
        })
      );
    }

    return EMPTY;
  }
}