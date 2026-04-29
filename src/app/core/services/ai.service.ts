import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { AiResponse, AiResponseSchema } from '../schemas/ai.schema';

@Injectable({ providedIn: 'root' })
export class AiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  private getUrl(): { url: string, isAdmin: boolean } {
    const user = this.authService.currentUser();
    const isAdmin = user?.tipo === 'A';

    const basePath = isAdmin ? '/admin/ai' : '/public/ai';
    return { url: `${this.apiUrl}${basePath}`, isAdmin };
  }

  sendPrompt(prompt: string): Observable<AiResponse> {
    const { url, isAdmin } = this.getUrl();

    return this.http.post<any>(url, { prompt }, { withCredentials: true }).pipe(
      map((raw: any) => {
        if (isAdmin) {
          const content = (raw?.apexchart || raw?.format) ? raw : (raw?.response ?? raw);
          return this.parseAiResponse(typeof content === 'string' ? content : JSON.stringify(content));
        }
        const text = raw?.response ?? raw;
        return { format: 'text', text: typeof text === 'string' ? text : JSON.stringify(text) };
      })
    );
  }

  private cleanLLMOutput(raw: string): string {
    return raw
      .trim()
      .replace(/^```(?:json|javascript|ts)?\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();
  }

  parseAiResponse(raw: string): AiResponse {
    const clean = this.cleanLLMOutput(raw);

    try {
      const parsed = JSON.parse(clean);

      if (parsed.apexchart && !parsed.format) parsed.format = 'chart';
      if (parsed.response && !parsed.text) parsed.text = parsed.response;

      const result = AiResponseSchema.safeParse(parsed);
      if (result.success) return result.data;

      if (!result.success) {
        console.warn(
          'Zod validation failed:',
          result.error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code
          }))
        );
      }

    } catch (e) {
      console.log(e);
    }

    return { format: 'text', text: raw.trim() };
  }
}