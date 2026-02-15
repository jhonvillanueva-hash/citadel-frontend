import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderStore } from './header-store/header-store';
import { HeroStore } from './hero-store/hero-store';
import { Category } from './category/category';
import { ProductStore } from './product-store/product-store';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, HeaderStore, HeroStore, Category, ProductStore],
  templateUrl: './store.html',
  styles: ``,
})

export class Store {
  
}
