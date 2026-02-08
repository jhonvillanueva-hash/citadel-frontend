import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Carousel } from '../../../components/store/carousel/carousel'


@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, Carousel],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})

export class Hero {
  carouselImages = [
    '/img/landing/hero/carousel/hero1.png',
    '/img/landing/hero/carousel/hero2.png'
  ]
}
