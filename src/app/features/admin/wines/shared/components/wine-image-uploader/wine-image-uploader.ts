import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WineFormFacade } from '../../facades/wine-form.facade';
import { readFileAsDataURL } from '../../utils/file.utils';

@Component({
  selector: 'app-wine-image-uploader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wine-image-uploader.html'
})
export class WineImageUploaderComponent {
  protected facade = inject(WineFormFacade);

  async onPrincipalChange(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const preview = await readFileAsDataURL(file);
      this.facade.setPrincipalImage({ file, preview });
    }
  }

  async onAdditionalChange(event: any, index: number) {
    const input = event.target;
    const file = input.files?.[0];

    if (file) {
      const preview = await readFileAsDataURL(file);
      this.facade.addAdditionalImage({ file, preview }, index);
    }

    input.value = '';
  }
}
