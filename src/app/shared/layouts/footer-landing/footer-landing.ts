import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faGear } from '@fortawesome/free-solid-svg-icons';
import {
  faFacebook,
  faInstagram,
  faWhatsapp,
  faTiktok
} from '@fortawesome/free-brands-svg-icons';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-footer-landing',
  standalone: true,
  templateUrl: './footer-landing.html',
  styles: ``,
  imports: [FontAwesomeModule, RouterLink],
})
export class FooterLanding {
  icons = {
    faGear,
    faFacebook,
    faInstagram,
    faTiktok,
    faWhatsapp,
    faEnvelope
  };

  openFacebookPage() {
    window.open('https://www.facebook.com/vinoscitadel?locale=es_LA', '_blank');
  }

  openInstagramPage() {
    window.open('https://www.instagram.com/vinoscitadel?utm_source=qr&igsh=dWc5dWZ4MHlqeXpq', '_blank');
  }

  openTiktokPage() {
    window.open('https://www.tiktok.com/@vinoscitadel?_t=8eeItWKo8d3&_r=1&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnivjyu5zcdypAl5CdJgHCOUF83ns_uh6xvJt9udsAmh40Mn4esXbHbWquBig_aem_Lvoto7iBYsf7LvzEEYksbw', '_blank');
  }
}
