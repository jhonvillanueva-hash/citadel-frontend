import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleXmark, faPlus } from '@fortawesome/free-solid-svg-icons';
import { CatalogFacade } from '../../facades/catalog.facade';
import { WineFormFacade } from '../../facades/wine-form.facade';

@Component({
  selector: 'app-wine-catalog-selects',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './wine-catalog-selects.html'
})
export class WineCatalogSelectsComponent {
  protected catalogFacade = inject(CatalogFacade);
  protected formFacade = inject(WineFormFacade);

  isAddingFlavor = signal(false);
  newFlavorName = signal('');
  
  isAddingSweet = signal(false);
  newSweetName = signal('');
  
  isAddingPresentation = signal(false);
  newPres = signal({ volumen_ml: 0, botellas_por_caja: 0 });

  icons = { faPlus, faCircleXmark };

  saveFlavor() {
    if (!this.newFlavorName()) return;
    this.catalogFacade.addFlavor(this.newFlavorName()).subscribe(() => {
      this.isAddingFlavor.set(false);
      this.newFlavorName.set('');
    });
  }

  saveSweet() {
    if (!this.newSweetName()) return;
    this.catalogFacade.addSweet(this.newSweetName()).subscribe(() => {
      this.isAddingSweet.set(false);
      this.newSweetName.set('');
    });
  }

  savePresentation() {
    if (!this.newPres().volumen_ml || !this.newPres().botellas_por_caja) return;
    this.catalogFacade.addPresentation(this.newPres()).subscribe(() => {
      this.isAddingPresentation.set(false);
      this.newPres.set({ volumen_ml: 0, botellas_por_caja: 0 });
    });
  }
}
