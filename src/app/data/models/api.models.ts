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
  id_vino: number;
  cantidad: number;
  precio_venta: number;
}

export interface Vino {
  id_vino: number;
  id_sabor: number;
  id_presentacion: number;
  nombre: string;
  descripcion: string;
  volumen_ml: number;
  stock: number;
  estado: 'D' | 'A' | 'P';
  url_img_principal: string;
  fecha_creacion: Date;
  sabor?: Sabor;
  presentacion?: Presentacion;
}

export interface Precio {
  id_precio: number;
  id_vino: number;
  tipo_venta: 'my' | 'mn';
  cantidad_minima: number;
  precio: number;
}

export interface Sabor {
  id_sabor: number;
  nombre: string;
  descripcion: string;
}

export interface Presentacion {
  id_presentacion: number;
  nombre: string;
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
