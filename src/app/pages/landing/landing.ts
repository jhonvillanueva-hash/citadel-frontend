import { Component } from '@angular/core';
import { HeroLanding } from "../../components/landing/hero-landing/hero-landing";
import { InfoLanding } from "../../components/landing/info-landing/info-landing";
import { FooterLanding } from '../../components/landing/footer-landing/footer-landing';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
  imports: [HeroLanding, InfoLanding, FooterLanding ]
})

export class Landing {

}
