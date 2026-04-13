export interface WineImage {
  file: File | null;
  preview: string | null;
  url?: string | null;
}

export interface PriceRow {
  cantidad: number | null;
  precio: number | null;
}
