import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { CatalogFacade } from '../shared/facades/catalog.facade';
import { WineFormFacade } from '../shared/facades/wine-form.facade';
import { WineBasicFormComponent } from '../shared/components/wine-basic-form/wine-basic-form';
import { WineCatalogSelectsComponent } from '../shared/components/wine-catalog-selects/wine-catalog-selects';
import { WinePriceListComponent } from '../shared/components/wine-price-list/wine-price-list';
import { WineImageUploaderComponent } from '../shared/components/wine-image-uploader/wine-image-uploader';
import { VinoService } from '../../../../data/services/vino.service';

@Component({
  selector: 'app-admin-wines-edit',
  standalone: true,
  imports: [
    CommonModule,
    WineBasicFormComponent,
    WineCatalogSelectsComponent,
    WinePriceListComponent,
    WineImageUploaderComponent
  ],
  templateUrl: './wines-edit.html'
})
export class WinesEditComponent implements OnInit {
  protected formFacade = inject(WineFormFacade);
  protected catalogFacade = inject(CatalogFacade);
  private wineService = inject(VinoService);
  private toast = inject(ToastService);
  protected router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.catalogFacade.loadAll();
    
    this.wineService.getById(id).subscribe({
      next: (wine) => this.formFacade.initializeForEdit(wine),
      error: (err) => {
        this.toast.showError('Error al cargar vino', err.message);
        this.router.navigate(['/admin/wines']);
      }
    });
  }

  handleUpdate() {
    const selectedPresId = this.formFacade.wineData().id_presentacion;
    const presentation = this.catalogFacade.presentations()
      .find(p => p.id_presentacion == selectedPresId);
    
    const bottlesPerBox = presentation?.botellas_por_caja || 1;

    this.formFacade.submit(bottlesPerBox).subscribe({
      next: () => {
        this.toast.showSuccess('Vino actualizado correctamente');
        this.router.navigate(['/admin/wines']);
      },
      error: (err) => this.toast.showError('Error al actualizar', err.message)
    });
  }
}
