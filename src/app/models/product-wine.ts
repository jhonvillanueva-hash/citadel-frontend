import { categories } from "./category-wine"
import { flavors } from "./flavor-wine"

export interface ProductWine {
  id: number
  idFlavor: number
  idCategory: number
  name: string
  description: string
  volumen: string
  state: string
  image: string
}

export const productsPullApi: ProductWine[] = [
  {id: 1, idFlavor: 1, idCategory: 1, name: 'Vino Tinto', description: "Vinos deliciosos con notas de frutas rojas y especias.", volumen: '750 ml', state: 'Disponible', image: '/img/store/one.jpg'},
  {id: 2, idFlavor: 1, idCategory: 2, name: 'Vino Tinto', description: "Vinos deliciosos con notas de frutas rojas y especias.", volumen: '750 ml', state: 'Disponible', image: '/img/store/one.jpg'},
  {id: 3, idFlavor: 1, idCategory: 3, name: 'Vino Tinto', description: "Vinos deliciosos con notas de frutas rojas y especias.", volumen: '550 ml', state: 'Disponible', image: '/img/store/one.jpg'},
  {id: 4, idFlavor: 2, idCategory: 1, name: 'Vino Tinto', description: "Vinos deliciosos con notas de frutas rojas y especias.", volumen: '750 ml', state: 'Disponible', image: '/img/store/one.jpg'},
  {id: 5, idFlavor: 3, idCategory: 1, name: 'Vino Tinto', description: "Vinos deliciosos con notas de frutas rojas y especias.", volumen: '750 ml', state: 'Disponible', image: '/img/store/one.jpg'},
  {id: 6, idFlavor: 3, idCategory: 2, name: 'Vino Tinto', description: "Vinos deliciosos con notas de frutas rojas y especias.", volumen: '650 ml', state: 'Disponible', image: '/img/store/one.jpg'},
  {id: 7, idFlavor: 2, idCategory: 3, name: 'Vino Tinto', description: "Vinos deliciosos con notas de frutas rojas y especias.", volumen: '750 ml', state: 'Disponible', image: '/img/store/one.jpg'},
  {id: 8, idFlavor: 3, idCategory: 3, name: 'Vino Tinto', description: "Vinos deliciosos con notas de frutas rojas y especias.", volumen: '750 ml', state: 'Disponible', image: '/img/store/one.jpg'},
  {id: 9, idFlavor: 2, idCategory: 2, name: 'Vino Tinto', description: "Vinos deliciosos con notas de frutas rojas y especias.", volumen: '850 ml', state: 'Disponible', image: '/img/store/one.jpg'},
]


