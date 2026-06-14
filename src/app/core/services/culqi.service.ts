import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

declare const CulqiCheckout: any;

@Injectable({ providedIn: 'root' })
export class CulqiService {

  protected http = inject(HttpClient);

  private apiUrl = environment.apiUrl;
  private readonly publicKey = 'pk_test_nWSVzqyiD7C1xspu';
  loading = signal(false);

  async pagar(email: string): Promise<any> {

    return new Promise(async (resolve, reject) => {
      try {
        this.loading.set(true);
        const totalResponse = await firstValueFrom(
          this.http.get<{ total: number }>(
            `${this.apiUrl}/me/culqi/total`
          )
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
          client: {
            email
          }
        };

        const culqi = new CulqiCheckout(this.publicKey, config);

        culqi.culqi = async () => {
          try {
            if (!culqi.token) {
              reject(new Error('No se generó el token'));
              return;
            }

            culqi.close();

            this.loading.set(true);

            const response = await firstValueFrom(
              this.http.post(
                `${this.apiUrl}/me/culqi/charge`,
                {
                  tokenId: culqi.token.id,
                  email
                }
              )
            );

            this.loading.set(false);

            resolve(response);
          } catch (error) {
            reject(error);
          }
        };

        culqi.open();
      } catch (error) {
        reject(error);
      }
    }
    );
  }
}