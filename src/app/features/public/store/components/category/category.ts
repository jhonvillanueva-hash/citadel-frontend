import { Component, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VinoService } from '../../../../../data/services/vino.service'
import { DulzorService } from '../../../../../data/services/dulzor.service'
import { Dulzor, Vino } from '../../../../../data/models/api.models'
import { forkJoin } from 'rxjs'
import { RouterLink } from '@angular/router'

export interface InternalCategory {
  id: number
  name: string
  amount: number
}

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './category.html',
  styles: ``,
})

export class Category implements OnInit {
  private vinoService = inject(VinoService)
  private dulzorService = inject(DulzorService)

  internalCategories = signal<InternalCategory[]>([])
  isLoading = signal<boolean>(true)

  ngOnInit(): void {
    this.loadCategories()
  }

  private loadCategories(): void {
    forkJoin({
      vinos: this.vinoService.getAll(),
      dulzores: this.dulzorService.getAll()
    }).subscribe({
      next: ({ vinos, dulzores }) => {
        const categoriesWithCount = dulzores.map(dulzor => {
          const amount = vinos.filter(vino => vino.id_dulzor === dulzor.id_dulzor).length

          const formattedName = this.formatDulzorName(dulzor.nombre)

          return {
            id: dulzor.id_dulzor,
            name: formattedName,
            amount: amount
          }
        })

        this.internalCategories.set(categoriesWithCount)
        this.isLoading.set(false)
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error)
        this.isLoading.set(false)
      }
    })
  }

  private formatDulzorName(nombre: string): string {
    const lowerName = nombre.toLowerCase()
    const capitalized = lowerName.charAt(0).toUpperCase() + lowerName.slice(1)
    return capitalized
  }

  generarSlug(texto: string): string {
    return texto
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  trackById(index: number, item: InternalCategory) {
    return item.id
  }
}
