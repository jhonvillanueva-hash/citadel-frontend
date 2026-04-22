import { Component, inject, signal, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Carousel } from '../carousel/carousel'
import { BannerService } from '../../../../../data/services/banner.service'
import { Banner } from '../../../../../data/models/api.models'

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, Carousel],
  templateUrl: './hero-store.html',
  styles: ``,
})

export class HeroStore implements OnInit {
  private bannerService = inject(BannerService)

  carouselImages = signal<string[]>([])
  isLoading = signal<boolean>(true)
  error = signal<string | null>(null)

  ngOnInit(): void {
    this.loadBanners()
  }

  private loadBanners(): void {
    this.bannerService.getAll().subscribe({
      next: (banners: Banner[]) => {
        const imageUrls = banners.map(banner => banner.url_img)
        this.carouselImages.set(imageUrls)
        this.isLoading.set(false)
      },
      error: (err) => {
        console.error('Error al cargar banners:', err)
        this.error.set('No se pudieron cargar los banners')
        this.isLoading.set(false)
        this.carouselImages.set([])
      }
    })
  }
}
