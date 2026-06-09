import { Precio } from "../../../../../data/models/api.models";
import { PriceRow } from '../models/wine-form.models';

export const calculateQuantityPerBox = (boxes: number, bottlesPerBox: number): number => 
  boxes * bottlesPerBox;

/**
 * Formatea los precios para el backend preservando los IDs originales
 * para evitar duplicados en la base de datos (problema de carritos).
 */
export const formatPricesForBackend = (
  basePrice: number,
  basePriceId: number | null,
  additionalPrices: PriceRow[],
  bottlesPerBox: number
) => {
  const precios = [
    { 
      id_precio: basePriceId, // Si es nulo, el backend debería crear uno nuevo
      cantidad_minima: 1, 
      precio: basePrice 
    },
    ...additionalPrices
      .filter(p => p.cantidad != null && p.precio != null)
      .map(p => ({
        id_precio: p.id_precio, // Preservar ID existente
        cantidad_minima: calculateQuantityPerBox(Number(p.cantidad), bottlesPerBox),
        precio: p.precio!
      }))
  ];

  return precios;
};

/**
 * Mapea los precios que vienen de la API al formato de filas del formulario
 */
export const mapBackendToPriceRows = (
  precios: Precio[] | undefined,
  bottlesPerBox: number
): PriceRow[] => {
  if (!precios) return [{ cantidad: null, precio: null }];
  
  const additional = precios
    .filter(p => p.cantidad_minima !== 1)
    .map(p => ({
      id_precio: p.id_precio,
      cantidad: Math.round(p.cantidad_minima / bottlesPerBox),
      precio: p.precio
    }));

  return additional.length ? additional : [{ cantidad: null, precio: null }];
};
