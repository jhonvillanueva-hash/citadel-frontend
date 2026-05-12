import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WineFormFacade } from '../../facades/wine-form.facade';
import { ToastService } from '../../../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-wine-price-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wine-price-list.html'
})
export class WinePriceListComponent {
  protected facade = inject(WineFormFacade);
  protected toastService = inject(ToastService);

  addPriceRow() {

    this.facade.priceRows.update(prev => {

      const error = this.facade.validatePriceRows();

      if (error) {
        this.toastService.showWarning(error);
        return prev;
      }

      return [...prev, { cantidad: null, precio: null }];
    });
  }

  removePriceRow(index: number) {
    this.facade.priceRows.update(prev => prev.filter((_, i) => i !== index));
  }
}
