import { flavors } from '../flavor-wine'
import { categories } from '../category-wine'
import { productsPullApi } from '../product-wine'

const flavorMap = new Map(flavors.map(f => [f.id, f.name]))
const categoryMap = new Map(categories.map(c => [c.id, c.name]))


export interface InternalProduct {
  id: number
  flavor: string
  category: string
  name: string
  description: string
  volumen: string
  state: string
  image: string
  iconoFlavor?: string
  iconoCategory?: string
}

export const internalProducts: InternalProduct[] =
  productsPullApi.map(product => ({
    id: product.id,
    flavor: flavorMap.get(product.idFlavor) ?? 'Desconocido',
    category: categoryMap.get(product.idCategory) ?? 'Desconocido',
    name: product.name,
    description: product.description,
    volumen: product.volumen,
    state: product.state,
    image: product.image,
    iconoCategory:categoryMap.get(product.idCategory)?.toLowerCase() === 'dulce' ? '/img/store/icons/droplet-fill.svg' :
                 categoryMap.get(product.idCategory)?.toLowerCase() === 'seco' ? '/img/store/icons/droplet.svg' :
                 categoryMap.get(product.idCategory)?.toLowerCase() === 'semiseco' ? '/img/store/icons/droplet-half.svg' : '',
    iconoFlavor: flavorMap.get(product.idFlavor)?.toLowerCase() === 'frambuesas' ? '/img/store/icons/baya.svg' :
                 flavorMap.get(product.idFlavor)?.toLowerCase() === 'zarzamoras' ? '/img/store/icons/mora-de-los-pantanos.svg' :
                 flavorMap.get(product.idFlavor)?.toLowerCase() === 'arandanos' ? '/img/store/icons/arandanos.svg' : '',
  }))

