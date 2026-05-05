import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-hero-landing',
  standalone: true,
  templateUrl: './hero-landing.html',
  styleUrls: ['./hero-landing.css'],
  imports: [RouterLink]
})


export class HeroLanding {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  logout() {
    this.authService.logout();
  }
}

