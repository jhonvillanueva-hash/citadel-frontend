export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Usuario {
  id_usuario: number;
  tipo: 'A' | 'U';
  url_img: string;
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  hash_contrasena: string;
  telefono: string;
  fecha_creacion?: Date;
  direcciones?: Direccion[];
}

export interface Direccion {
  id_direccion: number;
  id_usuario: number;
  id_departamento: number;
  id_provincia: number;
  id_distrito: number;
  calle: string;
  numero: string;
  cp: number;
  principal: boolean;
}

export interface Carrito {
  id_carrito: number;
  id_direccion: number; 
  estado: 'E' | 'P' | 'R' | 'A' | 'S' | 'C';
  fecha_pedido: Date;
  fecha_compra: Date;
  tipo: 'D' | 'T';
  id_cupon?: number | null;
  direccion: Direccion;
}

export interface HistorialPedido {
  id: number;
  id_carrito: number;
  estado: 'E' | 'P' | 'R' | 'A' | 'S' | 'C';
  fecha: string;
  observaciones?: string;
}

export interface CarritoProducto {
  id_carrito_producto: number;
  id_carrito: number;
  id_precio: number;
  cantidad: number;
  precio_venta: number;
}

export interface Vino {
  id_vino: number;
  sku: string;
  nombre: string;
  descripcion: string;
  stock: number;
  url_img_principal: string;
  estado: 'D' | 'A' | 'P';
  id_sabor: number;
  id_dulzor: number;
  id_presentacion: number;
  fecha_creacion: Date;
  Sabor?: Sabor;
  Dulzor?: Dulzor;
  Presentacion?: Presentacion;
  Precios?: Precio[];
  ImagenAdicionalVinos?: ImagenAdicionalVino[];
}

export interface Sabor {
  id_sabor: number;
  nombre: string;
}

export interface Dulzor {
  id_dulzor: number;
  nombre: string;
}

export interface Presentacion {
  id_presentacion: number;
  volumen_ml: number;
  botellas_por_caja: number;
}

export interface Precio {
  id_precio: number;
  id_vino: number;
  cantidad_minima: number;
  precio: number;
}

export interface ImagenAdicionalVino {
  id_imagen: number;
  id_vino: number;
  url_img: string;
}

export interface Pago {
  id_pago: number;
  id_pedido: number;
  metodo: 'E' | 'T';
  monto: number;
  estado: string;
}

export interface Banner {
  id_imagen: number;
  url_img: string;
  fecha_expiracion?: Date;
}

export interface Reclamo {
  id_reclamo: number;
  id_pedido: number;
  dni: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  tipo: 'R' | 'Q';
  motivo: string;
  detalles: string;
  estado: 'N' | 'R' | 'S';
  fecha_creacion: Date;
}

export interface Cupon {
  id_cupon: number;
  codigo: number;
  tipo_descuento: 'F' | 'P';
  descuento: number;
  monto_minimo: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  activo: boolean;
  fecha_creacion: Date;
}