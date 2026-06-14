export interface WineImage {
  file: File | null;
  preview: string | null;
  url?: string | null;
}

export interface PriceRow {
  id_precio?: number; // PK de la base de datos
  cantidad: number | null;
  precio: number | null;
}
