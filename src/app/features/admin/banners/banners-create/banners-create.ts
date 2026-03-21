import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { BannerService } from '../../../../data/services/banner.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faCircleExclamation, faSpinner, faUpload } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-banners-create',
  imports: [ ReactiveFormsModule, FontAwesomeModule ],
  templateUrl: './banners-create.html',
})
export class BannersCreateComponent {
  bannerForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  minDate: string;
  loading = false;

  constructor(private fb: FormBuilder, private bannerService: BannerService, private router: Router) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.minDate = [
      tomorrow.getFullYear(),
      String(tomorrow.getMonth() + 1).padStart(2, '0'),
      String(tomorrow.getDate()).padStart(2, '0')
    ].join('-');
    this.bannerForm = this.fb.group({
      fecha_expiracion: [''],
      imagen: [null, Validators.required]
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.bannerForm.patchValue({ imagen: file });

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.bannerForm.valid && this.selectedFile) {
      this.loading = true;
      const formData = new FormData();

      formData.append('url_img', this.selectedFile);

      if (this.bannerForm.value.fecha_expiracion) {
        formData.append('fecha_expiracion', this.bannerForm.value.fecha_expiracion);
      }

      this.bannerService.createWithImage(formData).subscribe({
        next: () => {
          this.loading = false;
          this.toastService.showSuccess('Banner creado correctamente');
          this.router.navigate(['/admin/banners']);
        },
        error: (err) => {
          this.loading = false;
          this.toastService.showError('Error al crear el banner: ', err.message);
        }
      });
    }
  }

  icons = {
    faUpload,
    faCircleExclamation,
    faCheck,
    faSpinner,
  }
}