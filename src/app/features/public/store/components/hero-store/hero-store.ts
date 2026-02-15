import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Carousel } from '../carousel/carousel'

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, Carousel],
  templateUrl: './hero-store.html',
  styles: ``,
})

export class HeroStore {
  carouselImages = [
    '/img/landing/hero/carousel/hero1.png',
    '/img/landing/hero/carousel/hero2.png'
  ]
}
