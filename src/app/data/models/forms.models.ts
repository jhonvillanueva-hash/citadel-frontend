export interface VinoForm {
  sku: string;
  nombre: string;
  descripcion: string;
  stock: number;
  estado: 'D' | 'A' | 'P';
  id_sabor: number | null;
  id_dulzor: number | null;
  id_presentacion: number | null;
}