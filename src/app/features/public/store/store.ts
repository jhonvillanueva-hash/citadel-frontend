import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroStore } from './components/hero-store/hero-store';
import { Category } from './components/category/category';
import { ProductStore } from './components/product-store/product-store';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, HeroStore, ProductStore],
  templateUrl: './store.html',
  styles: ``,
})

export class Store {
  filterType: 'todos' | 'mixtos' | 'promociones' | 'sabor' = 'todos';
}
