import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'

import { internalCategories, InternalCategory } from '../../../models/internal/internal-category'


@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category.html',
  styleUrl: './category.css'
})

export class Category {
  internalCategories: InternalCategory[] = internalCategories

  trackById(index: number, item: InternalCategory) {
    return item.id
  }
}
