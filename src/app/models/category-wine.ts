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
