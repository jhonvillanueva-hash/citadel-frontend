import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'

export interface CategoryWine {
    id: number;
    name: string;
    amount?: number;
}

export const categories: CategoryWine[] = [
    { id: 1, name: 'Seco', amount: 24 },
    { id: 2, name: 'Semiseco', amount: 18 },
    { id: 3, name: 'Dulce', amount: 12 },
]

export interface InternalCategory {
  id: number
  name: string
  img: string
  amount?: number
}

export const internalCategories: InternalCategory[] = [
  ...categories.map(category => ({ id: category.id, name: category.name, img: `/img/store/${category.name.toLowerCase()}.jpg`, amount: category.amount })),
]

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category.html',
  styles: ``,
})

export class Category {
  internalCategories: InternalCategory[] = internalCategories

  trackById(index: number, item: InternalCategory) {
    return item.id
  }
}
