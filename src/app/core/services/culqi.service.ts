import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CulqiService {
  protected http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private readonly publicKey = 'pk_test_nWSVzqyiD7C1xspu';
  loading = signal(false);

  private loadCulqiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).CulqiCheckout) {
        return resolve();
      }
      const script = document.createElement('script');
      script.src = 'https://js.culqi.com/checkout-js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar el script de Culqi'));
      document.body.appendChild(script);
    });
  }

  async pagar(email: string): Promise<any> {
    try {
      this.loading.set(true);

      await this.loadCulqiScript();

      const totalResponse = await firstValueFrom(
        this.http.get<{ total: number }>(`${this.apiUrl}/me/culqi/total`)
      );

      this.loading.set(false);
      const amount = Math.round(totalResponse.total * 100);

      const config = {
        settings: {
          title: 'Vinos Citadel',
          currency: 'PEN',
          amount,
          order: ''
        },
        client: { email }
      };

      this.lockScroll();

      const CulqiCheckout = (window as any).CulqiCheckout;
      const culqi = new CulqiCheckout(this.publicKey, config);

      return await new Promise((resolve, reject) => {
        const closeObserver = this.setupCulqiCloseListener(() => {
          this.unlockScroll();
        });

        culqi.culqi = async () => {
          try {
            if (!culqi.token) {
              return reject(new Error('No se generó el token'));
            }

            culqi.close();

            this.loading.set(true);
            const response = await firstValueFrom(
              this.http.post(`${this.apiUrl}/me/culqi/charge`, {
                tokenId: culqi.token.id,
                email
              })
            );

            resolve(response);
          } catch (error) {
            reject(error);
          } finally {
            this.loading.set(false);
            this.unlockScroll();
            closeObserver.disconnect();
          }
        };

        culqi.open();
      });
    } catch (error) {
      this.loading.set(false);
      this.unlockScroll();
      throw error;
    }
  }

  private lockScroll() {
    document.body.style.overflow = 'hidden';
  }

  private unlockScroll() {
    document.body.style.overflow = '';
  }

  private setupCulqiCloseListener(onClose: () => void): MutationObserver {
    let modalOpened = false;

    const observer = new MutationObserver(() => {
      const hasModal = document.querySelector('iframe[src*="culqi.com"], #culqi-checkout-iframe-container') !== null;

      if (hasModal) {
        modalOpened = true; 
      } else if (modalOpened && !hasModal) {
        onClose();
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return observer;
  }
}