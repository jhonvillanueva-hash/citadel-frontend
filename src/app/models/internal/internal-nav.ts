import { flavors } from '../../models/flavor-wine'

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
