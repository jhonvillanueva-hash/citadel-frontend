import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBasketShopping, faCalculator, faCircleCheck, faSackDollar, faUserPlus, faUsers } from '@fortawesome/free-solid-svg-icons';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexChart, ApexXAxis, ApexAxisChartSeries } from 'ng-apexcharts';

@Component({
  selector: 'app-statistics',
  imports: [NgApexchartsModule, CurrencyPipe, FontAwesomeModule],
  templateUrl: './statistics.html',
})

export class Statistics {

  datos: ApexAxisChartSeries = [
    {
      name: "Ventas",
      data: [1200, 1500, 1800, 2000, 2200, 2500, 2700, 3000, 3200, 3500, 3700, 4000]
    }
  ];

  grafico: ApexChart = {
    type: "line",
    height: 350,
    toolbar: { show: false },
    zoom: { enabled: false }
  };

  xaxis: ApexXAxis = {
    categories: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  };

  topProductosDatos: number[] = [40, 30, 20, 10];

  topProductosGrafico: ApexChart = {
    type: "pie",
    height: 350
  };

  topProductosLabels: string[] = [
    "Producto A",
    "Producto B",
    "Producto C",
    "Producto D"
  ];

  estadosPedidosDatos: number[] = [50, 30, 20];

  estadosPedidosGrafico: ApexChart = {
    type: "pie",
    height: 350
  };

  estadosPedidosLabels: string[] = ["Completados", "Pendientes", "Cancelados"];

  metodosPagoDatos: number[] = [60, 25, 15];

  metodosPagoGrafico: ApexChart = {
    type: "pie",
    height: 350
  };

  metodosPagoLabels: string[] = ["Tarjeta", "Efectivo", "Transferencia"];

  tiposProductosDatos: number[] = [45, 35, 20];

  tiposProductosGrafico: ApexChart = {
    type: "pie",
    height: 350
  };

  tiposProductosLabels: string[] = ["Vinos", "Cervezas", "Licores"];

  departamentosVentasDatos: ApexAxisChartSeries = [
    {
      name: "Ventas",
      data: [3000, 2500, 2000, 1500, 1000]
    }
  ];

  departamentosVentasGrafico: ApexChart = {
    type: "bar",
    height: 350,
    toolbar: { show: false }
  };

  departamentosVentasCategorias: string[] = ["Departamento A", "Departamento B", "Departamento C", "Departamento D", "Departamento E"];

  productosBajoStockDatos: ApexAxisChartSeries = [
    {
      name: "Stock",
      data: [5, 10, 15, 20, 25]
    }
  ];

  productosBajoStockGrafico: ApexChart = {
    type: "bar",
    height: 350,
    toolbar: { show: false }
  };

  productosBajoStockCategorias: string[] = ["Producto A", "Producto B", "Producto C", "Producto D", "Producto E"];

  kpiData = {
    totalSales: 500,
    productsSold: 1200,
    totalUsers: 800,
    usersPurchased: 300,
    newClients: 50,
    avgSaleCost: 42
  };

  icons = {
    faSackDollar,
    faBasketShopping,
    faUsers,
    faCircleCheck,
    faUserPlus,
    faCalculator,
  }

}