import { Component } from '@angular/core';
import { HeroLanding } from "../../components/landing/hero-landing/hero-landing";
import { InfoLanding } from "../../components/landing/info-landing/info-landing";

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  styleUrl: './landing.css',
  imports: [HeroLanding, InfoLanding]
})

export class Landing {

}
