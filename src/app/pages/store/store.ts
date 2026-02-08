import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Wine } from './wine.model'
import { Header } from '../../components/store/header/header'
import { Hero } from '../../components/store/hero/hero'
import { Category } from '../../components/store/category/category'
import { Product } from '../../components/store/product/product'

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, Header, Hero, Category, Product],
  templateUrl: './store.html',
  styleUrl: './store.css'
})

export class Store {


}
