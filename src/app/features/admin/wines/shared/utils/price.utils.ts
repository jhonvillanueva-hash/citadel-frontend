import { Precio } from "../../../../../data/models/api.models";
import { PriceRow } from '../models/wine-form.models';

export const calculateQuantityPerBox = (boxes: number, bottlesPerBox: number): number => 
  boxes * bottlesPerBox;

export const formatPricesForBackend = (
  basePrice: number,
  additionalPrices: PriceRow[],
  bottlesPerBox: number
) => [
  { cantidad_minima: 1, precio: basePrice },
  ...additionalPrices
    .filter(p => p.cantidad != null && p.precio != null)
    .map(p => ({
      cantidad_minima: calculateQuantityPerBox(Number(p.cantidad), bottlesPerBox),
      precio: p.precio!
    }))
];

export const mapBackendToPriceRows = (
  precios: Precio[] | undefined,
  bottlesPerBox: number
): PriceRow[] => {
  if (!precios) return [{ cantidad: null, precio: null }];
  
  const additional = precios
    .filter(p => p.cantidad_minima !== 1)
    .map(p => ({
      cantidad: Math.round(p.cantidad_minima / bottlesPerBox),
      precio: p.precio
    }));

  return additional.length ? additional : [{ cantidad: null, precio: null }];
};
