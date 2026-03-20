import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faGear } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faTwitter, faWhatsapp, faYoutube } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-footer-landing',
  standalone: true,
  templateUrl: './footer-landing.html',
  styles: ``,
  imports: [FontAwesomeModule],
})
export class FooterLanding {
  icons = {
    faGear,
    faFacebook,
    faInstagram,
    faTwitter,
    faYoutube,
    faWhatsapp,
    faEnvelope
  }
}
