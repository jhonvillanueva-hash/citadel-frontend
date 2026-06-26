import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBasketShopping, faCalculator, faCircleCheck, faSackDollar, faUserPlus, faUsers } from '@fortawesome/free-solid-svg-icons';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexChart, ApexXAxis, ApexAxisChartSeries, ApexDataLabels } from 'ng-apexcharts';
import { EstadisticaService } from '../../../data/services/estadistica.service';
import { ElementRef, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-statistics',
  imports: [NgApexchartsModule, CurrencyPipe, FontAwesomeModule, FormsModule],
  templateUrl: './statistics.html',
  styles: `
    .evitar-corte {
      width: 100%;
      min-height: 300px;
      position: relative;
      overflow: hidden;
      page-break-inside: avoid;
      break-inside: avoid;
    }
  `,
})

export class Statistics implements OnInit {
  @ViewChild('pdfContainer', { static: false })
  pdfContainer!: ElementRef<HTMLDivElement>;

  private estadisticaService = inject(EstadisticaService);
  private cdr = inject(ChangeDetectorRef);

  globalStartDate: string = '';
  globalEndDate: string = '';

  ventasStartDate: string = '';
  ventasEndDate: string = '';

  topProductosStartDate: string = '';
  topProductosEndDate: string = '';

  estadosPedidosStartDate: string = '';
  estadosPedidosEndDate: string = '';

  saboresStartDate: string = '';
  saboresEndDate: string = '';

  ciudadesStartDate: string = '';
  ciudadesEndDate: string = '';

  bajoStockStartDate: string = '';
  bajoStockEndDate: string = '';

  isKpiMock = true;
  isVentasMock = true;
  isTopProductosMock = true;
  isEstadosPedidosMock = true;
  isSaboresMock = true;
  isCiudadesMock = true;
  isBajoStockMock = true;

  datos: ApexAxisChartSeries = [
    {
      name: "Pedidos (Ejemplo)",
      data: [12, 15, 13, 18, 22, 25, 21, 24, 28, 31, 35, 42]
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
    categories: []
  };

  topProductosDatos: number[] = [40, 30, 20, 10];

  topProductosGrafico: ApexChart = {
    type: "pie",
    height: 350,
    redrawOnParentResize: true
  };

  topProductosLabels: string[] = ["Vino Malbec (Ejemplo)", "Vino Cabernet (Ejemplo)", "Vino Merlot (Ejemplo)", "Vino Chardonnay (Ejemplo)"];

  estadosPedidosDatos: number[] = [60, 30, 10];

  estadosPedidosGrafico: ApexChart = {
    type: "pie",
    height: 350,
    redrawOnParentResize: true
  };

  estadosPedidosLabels: string[] = ["Completados (Ejemplo)", "Pendientes (Ejemplo)", "Cancelados (Ejemplo)"];

  tiposProductosDatos: number[] = [45, 35, 20];

  tiposProductosGrafico: ApexChart = {
    type: "pie",
    height: 350,
    redrawOnParentResize: true
  };

  tiposProductosLabels: string[] = ["Seco (Ejemplo)", "Semiseco (Ejemplo)", "Dulce (Ejemplo)"];

  departamentosVentasDatos: ApexAxisChartSeries = [
    {
      name: "Ventas (Ejemplo)",
      data: [5000, 4000, 3000, 2000, 1000]
    }
  ];

  departamentosVentasGrafico: ApexChart = {
    type: "bar",
    height: 350,
    toolbar: { show: false },
    redrawOnParentResize: true
  };

  departamentosVentasCategorias: string[] = ["Lima", "Arequipa", "Trujillo", "Cusco", "Piura"];

  productosBajoStockDatos: ApexAxisChartSeries = [
    {
      name: "Stock (Ejemplo)",
      data: [3, 5, 8, 12, 15]
    }
  ];

  productosBajoStockGrafico: ApexChart = {
    type: "bar",
    height: 350,
    toolbar: { show: false },
    redrawOnParentResize: true
  };

  productosBajoStockCategorias: string[] = ["Vino Tinto Premium", "Vino Blanco Seco", "Rosé Especial", "Espumante Brut", "Vino Dulce Reserva"];

  kpiData = {
    totalSales: 15420.50,
    productsSold: 342,
    totalUsers: 89,
    usersPurchased: 45,
    newClients: 12,
    avgSaleCost: 45.08
  };

  icons = {
    faSackDollar,
    faBasketShopping,
    faUsers,
    faCircleCheck,
    faUserPlus,
    faCalculator,
  };

  async exportToPdf() {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const gap = 8;
    let currentY = margin;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(30, 41, 59);
    pdf.text('Resumen General - Citadel', margin, currentY);
    currentY += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);
    const fechaDesde = this.globalStartDate || 'Inicio';
    const fechaHasta = this.globalEndDate || 'Actualidad';
    pdf.text(`Período de análisis: ${fechaDesde} al ${fechaHasta}`, margin, currentY);
    currentY += 12;

    const captureElementAsImage = async (element: HTMLElement, captureWidth: number) => {
      const uniqueId = 'pdf-target-' + Math.random().toString(36).substring(7);
      element.setAttribute('data-pdf-target', uniqueId);

      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: Math.max(window.innerWidth, captureWidth),
        width: captureWidth,
        scrollX: 0,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.querySelector(`[data-pdf-target="${uniqueId}"]`) as HTMLElement;
          if (!clonedEl) return;

          clonedEl.style.width = `${captureWidth}px`;
          clonedEl.style.minWidth = `${captureWidth}px`;
          clonedEl.style.maxWidth = 'none';
          clonedEl.style.marginLeft = '0';

          const dateInputs = clonedEl.querySelectorAll('input[type="date"]') as NodeListOf<HTMLInputElement>;
          dateInputs.forEach(input => {
            if (input.value) {
              const textSpan = clonedDoc.createElement('span');
              textSpan.textContent = input.value;
              textSpan.style.cssText = `
                font-size: 12px; 
                padding: 6px 8px; 
                border: 1px solid #e2e8f0; 
                border-radius: 6px;
                color: #334155;
                display: inline-block;
              `;
              input.parentNode?.replaceChild(textSpan, input);
            }
          });
        }
      });

      const dateInputsOriginal = element.querySelectorAll('input[type="date"]') as NodeListOf<HTMLInputElement>;
      dateInputsOriginal.forEach((input: HTMLInputElement) => {
        input.type = 'date';
      });

      element.removeAttribute('data-pdf-target');

      return {
        imgData: canvas.toDataURL('image/jpeg', 0.85),
        canvasW: canvas.width,
        canvasH: canvas.height
      };
    };

    const kpiSection = document.getElementById('kpi-section');
    if (kpiSection) {
      const { imgData, canvasW, canvasH } = await captureElementAsImage(kpiSection, 1200);
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvasH * imgWidth) / canvasW;

      pdf.addImage(imgData, 'JPEG', margin, currentY, imgWidth, imgHeight);
      currentY += imgHeight + gap;
    }

    const chartCards = document.querySelectorAll('.evitar-corte');
    let rowMaxHeight = 0;

    for (let i = 0; i < chartCards.length; i++) {
      const card = chartCards[i] as HTMLElement;

      if (i === 0) {
        const { imgData, canvasW, canvasH } = await captureElementAsImage(card, 1200);
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvasH * imgWidth) / canvasW;

        if (currentY + imgHeight > pageHeight - margin) { pdf.addPage(); currentY = margin; }

        pdf.addImage(imgData, 'JPEG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + gap;

      } else {
        const { imgData, canvasW, canvasH } = await captureElementAsImage(card, 600);
        const imgWidth = (pageWidth - (margin * 2) - gap) / 2;
        const imgHeight = (canvasH * imgWidth) / canvasW;
        const isLeftColumn = (i % 2 !== 0);

        if (isLeftColumn) {
          if (currentY + imgHeight > pageHeight - margin) { pdf.addPage(); currentY = margin; }

          pdf.addImage(imgData, 'JPEG', margin, currentY, imgWidth, imgHeight);
          rowMaxHeight = imgHeight;

          if (i === chartCards.length - 1) {
            currentY += rowMaxHeight + gap;
          }
        } else {
          const xPosDerecha = margin + imgWidth + gap;
          pdf.addImage(imgData, 'JPEG', xPosDerecha, currentY, imgWidth, imgHeight);
          currentY += Math.max(rowMaxHeight, imgHeight) + gap;
        }
      }
    }
    pdf.save('reporte_estadisticas_citadel.pdf');
  }

  ngOnInit() {
    this.xaxis.categories = this.obtenerUltimos12Meses();
    this.resetGlobalFilters();
  }

  resetGlobalFilters() {
    const currentYear = new Date().getFullYear();
    this.globalStartDate = `${currentYear}-01-01`;
    this.globalEndDate = `${currentYear}-12-31`;
    this.sincronizarFechasLocales();
    this.cargarTodo();
  }

  sincronizarFechasLocales() {
    this.ventasStartDate = this.globalStartDate;
    this.ventasEndDate = this.globalEndDate;

    this.topProductosStartDate = this.globalStartDate;
    this.topProductosEndDate = this.globalEndDate;

    this.estadosPedidosStartDate = this.globalStartDate;
    this.estadosPedidosEndDate = this.globalEndDate;

    this.saboresStartDate = this.globalStartDate;
    this.saboresEndDate = this.globalEndDate;

    this.ciudadesStartDate = this.globalStartDate;
    this.ciudadesEndDate = this.globalEndDate;

    this.bajoStockStartDate = this.globalStartDate;
    this.bajoStockEndDate = this.globalEndDate;
  }

  onGlobalFilterChange() {
    this.sincronizarFechasLocales();
    this.cargarTodo();
  }

  cargarTodo() {
    this.estadisticaService.getEstadisticas({
      startDate: this.globalStartDate,
      endDate: this.globalEndDate
    }).subscribe({
      next: (res) => {
        this.procesarKPIs(res.kpi);
        this.procesarVentas(res.ventasMensuales);
        this.procesarTopProductos(res.topProductos);
        this.procesarEstadosPedidos(res.estadosPedidos);
        this.procesarSabores(res.ventasSabores);
        this.procesarCiudades(res.ciudadesVentas);
        this.procesarBajoStock(res.productosBajoStock);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar estadísticas generales', err);
      }
    });
  }

  cargarVentas() {
    this.estadisticaService.getEstadisticas({
      startDate: this.ventasStartDate,
      endDate: this.ventasEndDate,
      metric: 'sales'
    }).subscribe({
      next: (res) => {
        this.procesarVentas(res.data);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar ventas mensuales', err)
    });
  }

  cargarTopProductos() {
    this.estadisticaService.getEstadisticas({
      startDate: this.topProductosStartDate,
      endDate: this.topProductosEndDate,
      metric: 'top-products'
    }).subscribe({
      next: (res) => {
        this.procesarTopProductos(res.data);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar top productos', err)
    });
  }

  cargarEstadosPedidos() {
    this.estadisticaService.getEstadisticas({
      startDate: this.estadosPedidosStartDate,
      endDate: this.estadosPedidosEndDate,
      metric: 'order-statuses'
    }).subscribe({
      next: (res) => {
        this.procesarEstadosPedidos(res.data);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar estados de pedidos', err)
    });
  }

  cargarVentasSabores() {
    this.estadisticaService.getEstadisticas({
      startDate: this.saboresStartDate,
      endDate: this.saboresEndDate,
      metric: 'flavors'
    }).subscribe({
      next: (res) => {
        this.procesarSabores(res.data);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar ventas por sabores', err)
    });
  }

  cargarCiudadesVentas() {
    this.estadisticaService.getEstadisticas({
      startDate: this.ciudadesStartDate,
      endDate: this.ciudadesEndDate,
      metric: 'cities'
    }).subscribe({
      next: (res) => {
        this.procesarCiudades(res.data);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar ventas por ciudades', err)
    });
  }

  cargarProductosBajoStock() {
    this.estadisticaService.getEstadisticas({
      startDate: this.bajoStockStartDate,
      endDate: this.bajoStockEndDate,
      metric: 'low-stock'
    }).subscribe({
      next: (res) => {
        this.procesarBajoStock(res.data);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar bajo stock', err)
    });
  }

  procesarKPIs(kpi: any) {
    if (!kpi) return;
    if (kpi.totalSales === 0 && kpi.productsSold === 0) {
      this.isKpiMock = true;
      this.kpiData = {
        totalSales: 15420.50,
        productsSold: 342,
        totalUsers: 89,
        usersPurchased: 45,
        newClients: 12,
        avgSaleCost: 45.08
      };
    } else {
      this.isKpiMock = false;
      this.kpiData = {
        totalSales: kpi.totalSales,
        productsSold: kpi.productsSold,
        totalUsers: kpi.totalUsers,
        usersPurchased: kpi.usersPurchased,
        newClients: kpi.newClients,
        avgSaleCost: kpi.avgSaleCost
      };
    }
  }

  procesarVentas(ventas: any[]) {
    if (!ventas || ventas.length === 0) {
      this.isVentasMock = true;
      const mockCategories = this.obtenerUltimos12Meses();
      const mockData = [12, 15, 13, 18, 22, 25, 21, 24, 28, 31, 35, 42];
      this.datos = [{
        name: "Pedidos (Ejemplo)",
        data: mockData
      }];
      this.xaxis = {
        categories: mockCategories
      };
    } else {
      this.isVentasMock = false;
      const categories = ventas.map(item => this.formatMonth(item.mes));
      const data = ventas.map(item => item.total);
      this.datos = [{
        name: "Pedidos",
        data: data
      }];
      this.xaxis = {
        categories: categories
      };
    }
  }

  procesarTopProductos(productos: any[]) {
    if (!productos || productos.length === 0) {
      this.isTopProductosMock = true;
      this.topProductosDatos = [40, 30, 20, 10];
      this.topProductosLabels = ["Vino Malbec (Ejemplo)", "Vino Cabernet (Ejemplo)", "Vino Merlot (Ejemplo)", "Vino Chardonnay (Ejemplo)"];
    } else {
      this.isTopProductosMock = false;
      this.topProductosDatos = productos.map(p => p.cantidad);
      this.topProductosLabels = productos.map(p => p.nombre);
    }
  }

  procesarEstadosPedidos(estados: any[]) {
    if (!estados || estados.length === 0) {
      this.isEstadosPedidosMock = true;
      this.estadosPedidosDatos = [60, 30, 10];
      this.estadosPedidosLabels = ["Completados (Ejemplo)", "Pendientes (Ejemplo)", "Cancelados (Ejemplo)"];
    } else {
      this.isEstadosPedidosMock = false;
      let completados = 0;
      let pendientes = 0;
      estados.forEach(e => {
        if (e.estado === 'C') {
          completados += e.count;
        } else {
          pendientes += e.count;
        }
      });
      this.estadosPedidosDatos = [completados, pendientes, 0];
      this.estadosPedidosLabels = ["Completados", "Pendientes", "Cancelados"];
    }
  }

  procesarSabores(sabores: any[]) {
    if (!sabores || sabores.length === 0) {
      this.isSaboresMock = true;
      this.tiposProductosDatos = [45, 35, 20];
      this.tiposProductosLabels = ["Seco (Ejemplo)", "Semiseco (Ejemplo)", "Dulce (Ejemplo)"];
    } else {
      this.isSaboresMock = false;
      this.tiposProductosDatos = sabores.map(s => s.cantidad);
      this.tiposProductosLabels = sabores.map(s => s.sabor || 'Desconocido');
    }
  }

  procesarCiudades(ciudades: any[]) {
    if (!ciudades || ciudades.length === 0) {
      this.isCiudadesMock = true;
      this.departamentosVentasDatos = [{
        name: "Ventas (Ejemplo)",
        data: [5000, 4000, 3000, 2000, 1000]
      }];
      this.departamentosVentasCategorias = ["Lima", "Arequipa", "Trujillo", "Cusco", "Piura"];
    } else {
      this.isCiudadesMock = false;
      this.departamentosVentasDatos = [{
        name: "Ventas",
        data: ciudades.map(c => c.total)
      }];
      this.departamentosVentasCategorias = ciudades.map(c => c.ciudad);
    }
  }

  procesarBajoStock(vinos: any[]) {
    if (!vinos || vinos.length === 0) {
      this.isBajoStockMock = true;
      this.productosBajoStockDatos = [{
        name: "Stock (Ejemplo)",
        data: [3, 5, 8, 12, 15]
      }];
      this.productosBajoStockCategorias = ["Vino Tinto Premium", "Vino Blanco Seco", "Rosé Especial", "Espumante Brut", "Vino Dulce Reserva"];
    } else {
      this.isBajoStockMock = false;
      this.productosBajoStockDatos = [{
        name: "Stock",
        data: vinos.map(v => v.stock)
      }];
      this.productosBajoStockCategorias = vinos.map(v => v.nombre);
    }
  }

  formatMonth(mesStr: string): string {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const parts = mesStr.split('-');
    if (parts.length < 2) return mesStr;
    const year = parts[0].substring(2);
    const monthIndex = parseInt(parts[1], 10) - 1;
    return `${meses[monthIndex]} ${year}`;
  }

  obtenerUltimos12Meses(): string[] {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const resultado: string[] = [];
    const fecha = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(fecha.getFullYear(), fecha.getMonth() - i, 1);
      resultado.push(`${meses[d.getMonth()]} ${String(d.getFullYear()).substring(2)}`);
    }
    return resultado;
  }
}