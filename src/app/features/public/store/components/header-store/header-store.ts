import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'

export interface FlavorWine {
  id: number
  name: string
}

export const flavors: FlavorWine[] = [
  { id: 1, name: 'Frambuesas' },
  { id: 2, name: 'Arandanos' },
  { id: 3, name: 'Zarzamoras' },
]

export interface InternalNav {
  id: number
  name: string
}

export const internalNavs: InternalNav[] = [
  { id: 1, name: 'Todos' },
  ...flavors.map(flavor => ({ id: flavor.id + 1, name: flavor.name })),
  { id: flavors.length + 2, name: 'Mixtos' },
  { id: flavors.length + 3, name: 'Promociones' },
]

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-store.html',
  styles: ``,
})

export class HeaderStore {

  internalNavs: InternalNav[] = internalNavs

  trackById(index: number, item: InternalNav) {
    return item.id
  }

}
