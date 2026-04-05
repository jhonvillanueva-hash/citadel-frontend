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
  direccion: string;
  ciudad: string;
}

export interface Carrito {
  id_carrito: number;
  id_usuario: number;
  estado: 'E' | 'V';
  fecha_pedido: Date;
  fecha_compra: Date;
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
