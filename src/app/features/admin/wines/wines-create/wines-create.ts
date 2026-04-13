import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { CatalogFacade } from '../shared/facades/catalog.facade';
import { WineFormFacade } from '../shared/facades/wine-form.facade';
import { WineBasicFormComponent } from '../shared/components/wine-basic-form/wine-basic-form';
import { WineCatalogSelectsComponent } from '../shared/components/wine-catalog-selects/wine-catalog-selects';
import { WinePriceListComponent } from '../shared/components/wine-price-list/wine-price-list';
import { WineImageUploaderComponent } from '../shared/components/wine-image-uploader/wine-image-uploader';

@Component({
  selector: 'app-admin-wines-create',
  standalone: true,
  imports: [
    CommonModule,
    WineBasicFormComponent,
    WineCatalogSelectsComponent,
    WinePriceListComponent,
    WineImageUploaderComponent
  ],
  templateUrl: './wines-create.html'
})
export class WinesCreateComponent implements OnInit {
  protected formFacade = inject(WineFormFacade);
  protected catalogFacade = inject(CatalogFacade);
  private toast = inject(ToastService);
  private router = inject(Router);

  ngOnInit() {
    this.formFacade.resetForCreate();
    this.catalogFacade.loadAll();
  }

  handleSave() {
    const selectedPresentationId = this.formFacade.wineData().id_presentacion;
    const presentation = this.catalogFacade.presentations()
      .find(p => p.id_presentacion == selectedPresentationId);
    
    const bottlesPerBox = presentation?.botellas_por_caja || 1;

    this.formFacade.submit(bottlesPerBox).subscribe({
      next: () => {
        this.toast.showSuccess('Vino registrado correctamente');
        this.router.navigate(['/admin/wines']);
      },
      error: (err: { message: any; }) => this.toast.showError('Error al registrar', err.message)
    });
  }
}