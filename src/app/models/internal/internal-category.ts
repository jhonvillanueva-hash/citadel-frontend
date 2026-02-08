import { categories } from "../category-wine"

export interface InternalCategory {
  id: number
  name: string
  img: string
  amount?: number
}

export const internalCategories: InternalCategory[] = [
  ...categories.map(category => ({ id: category.id, name: category.name, img: `/img/store/${category.name.toLowerCase()}.jpg`, amount: category.amount })),
]
