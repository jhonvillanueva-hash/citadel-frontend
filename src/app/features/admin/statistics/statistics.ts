import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBasketShopping, faCalculator, faCircleCheck, faSackDollar, faUserPlus, faUsers } from '@fortawesome/free-solid-svg-icons';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexChart, ApexXAxis, ApexAxisChartSeries, ApexDataLabels } from 'ng-apexcharts';

@Component({
  selector: 'app-statistics',
  imports: [NgApexchartsModule, CurrencyPipe, FontAwesomeModule],
  templateUrl: './statistics.html',
})

export class Statistics {

  datos: ApexAxisChartSeries = [
    {
      name: "Ventas",
      data: [1, 5, 3, 2, 1, 6, 3, 2, 1, 4, 6, 10]
    }
  ];
  dataLabels: ApexDataLabels = {
  enabled: true
};

  grafico: ApexChart = {
    type: "line",
    height: 350,
    toolbar: { show: false },
    zoom: { enabled: false },
    redrawOnParentResize: true
  };

  xaxis: ApexXAxis = {
    categories: this.obtenerUltimos12Meses()
  };

  obtenerUltimos12Meses(): string[] {
  const meses = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  const resultado: string[] = [];
  const fecha = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(fecha.getFullYear(), fecha.getMonth() - i, 1);
    resultado.push(meses[d.getMonth()]);
  }

  return resultado;
}

  topProductosDatos: number[] = [40, 30, 20, 10];

  topProductosGrafico: ApexChart = {
    type: "pie",
    height: 350,
    redrawOnParentResize: true
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
    height: 350,
    redrawOnParentResize: true
  };

  estadosPedidosLabels: string[] = ["Completados", "Pendientes", "Cancelados"];

  metodosPagoDatos: number[] = [60, 25, 15];

  metodosPagoGrafico: ApexChart = {
    type: "pie",
    height: 350,
    redrawOnParentResize: true
  };

  metodosPagoLabels: string[] = ["Tarjeta", "Efectivo", "Transferencia"];

  tiposProductosDatos: number[] = [45, 35, 20];

  tiposProductosGrafico: ApexChart = {
    type: "pie",
    height: 350,
    redrawOnParentResize: true
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
    toolbar: { show: false },
    redrawOnParentResize: true
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
    toolbar: { show: false },
    redrawOnParentResize: true
  };

  productosBajoStockCategorias: string[] = ["Producto A", "Producto B", "Producto C", "Producto D", "Producto E"];

  kpiData = {
    totalSales: 5,
    productsSold: 12,
    totalUsers: 9,
    usersPurchased: 5,
    newClients: 3,
    avgSaleCost: 42.4
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