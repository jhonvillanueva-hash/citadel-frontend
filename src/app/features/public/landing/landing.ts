import { Component } from '@angular/core';
import { HeroLanding } from '../../../shared/layouts/hero-landing/hero-landing';
import { InfoLanding } from '../../../shared/layouts/info-landing/info-landing';
import { FooterLanding } from '../../../shared/layouts/footer-landing/footer-landing';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  styleUrl: './landing.css',
  imports: [HeroLanding, InfoLanding, FooterLanding]
})

export class Landing {

}
