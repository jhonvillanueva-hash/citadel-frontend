import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Banner } from '../../../../data/models/api.models';
import { BannerService } from '../../../../data/services/banner.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faImage, faPen, faSpinner, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-banners-list',
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './banners-list.html',
})
export class BannersListComponent implements OnInit {
  bannerService = inject(BannerService);
  toastService = inject(ToastService);
  confirmDialogService = inject(ConfirmDialogService);
  dataBanners = signal<Banner[] | null>(null);
  editingBannerId = signal<number | null>(null);
  editedDate = signal('');
  minDate = this.getTomorrowDate();

  ngOnInit(): void {
    this.loadBanners();
  }
  
  loadBanners() {
    this.bannerService.getAll().subscribe({
      next: (banners) => {
        const ordered = [...banners].sort((a, b) => a.id_imagen - b.id_imagen);
        this.dataBanners.set(ordered);
      },
      error: (err) => this.toastService.showError('Error cargando banners', err),
    });
  }

  startEdit(banner: Banner) {
    this.editingBannerId.set(banner.id_imagen);

    if (banner.fecha_expiracion) {
      const d = new Date(banner.fecha_expiracion);

      const localDate = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0')
      ].join('-');

      this.editedDate.set(localDate);
    } else {      
      this.editedDate.set(this.minDate);
    }
  }

  cancelEdit() {
    this.editingBannerId.set(null);
    this.editedDate.set('');
  }

  saveEdit(banner: Banner) {
    const newDate = this.editedDate();
    if (!newDate) return;
    this.updateDate(banner, newDate);
  }

  updateDate(banner: Banner, newDate: string) {
    if (!newDate) return;
    
    this.bannerService.update(banner.id_imagen, { fecha_expiracion: new Date(newDate + 'T00:00:00') }).subscribe({
      next: () => {
        this.toastService.showSuccess('Fecha actualizada correctamente');
        this.cancelEdit();
        this.loadBanners();
      },
      error: (err) => this.toastService.showError('Error al actualizar fecha', err.message),
    });
  }

  async deleteBanner(id: number) {
    const ok = await this.confirmDialogService.confirm('¿Está seguro de eliminar este registro?');
    if (ok) {
      this.bannerService.delete(id).subscribe({
        next: () => {
          this.toastService.showSuccess('Banner eliminado correctamente');
          this.loadBanners();
        },
        error: (err) => this.toastService.showError('Error al eliminar banner', err.message),
      });
    }
  }

  private getTomorrowDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);

    return (
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0')
    );
  }

  icons = {
    faPen,
    faSpinner,
    faImage,
    faTrash,
    faXmark
  }
}
