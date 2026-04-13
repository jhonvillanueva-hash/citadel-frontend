import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WineFormFacade } from '../../facades/wine-form.facade';

@Component({
  selector: 'app-wine-basic-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wine-basic-form.html'
})
export class WineBasicFormComponent {
  protected facade = inject(WineFormFacade);
}
