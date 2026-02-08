import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { internalProducts, InternalProduct } from '../../../models/internal/internal-product'


@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product.html',
  styleUrl: './product.css'
})

export class Product {

  products: InternalProduct[] = internalProducts

  trackById(index: number, item: InternalProduct) {
      return item.id
    }
}
