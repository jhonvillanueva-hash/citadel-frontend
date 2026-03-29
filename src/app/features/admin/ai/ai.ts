import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../../core/services/ai.service';
import { AiResponse } from '../../../core/schemas/ai.schema';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

type Message = {
  role: 'user' | 'ai';
  text?: string;
  chart?: any;
};

@Component({
  selector: 'app-ai',
  standalone: true,
  imports: [FormsModule, NgApexchartsModule, FontAwesomeModule],
  templateUrl: './ai.html',
})
export class AIComponent {
  private aiService = inject(AiService);

  prompt = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  messages = signal<Message[]>([]);

  aiResponse = signal<AiResponse | null>(null);
  isChart = computed(() => this.aiResponse()?.format === 'chart');

  chartOptions = computed(() => {
    const r = this.aiResponse();
    if (r?.format !== 'chart') return null;

    const config = r.apexchart;

    return {
      series: config.series as any,
      chart: {
        type: config.chart.type,
        toolbar: { show: config.chart.toolbar?.show ?? true },
        zoom: { enabled: !!config.chart.zoom?.enabled },
        redrawOnParentResize: config.chart.redrawOnParentResize ?? true,
      },
      xaxis: config.xaxis ?? { categories: [] },
      title: { text: r.title },
      labels: config.labels ?? [],
      colors: config.colors ?? undefined,
    };
  });

  enviar() {
    const text = this.prompt().trim();
    if (!text) return;

    this.messages.update(m => [...m, { role: 'user', text }]);

    this.loading.set(true);
    this.error.set(null);
    this.prompt.set('');

    this.aiService.sendPrompt(text).subscribe({
      next: (res) => {
        this.messages.update(m => [
          ...m,
          {
            role: 'ai',
            text: res.text,
            chart: res.format === 'chart' ? res.apexchart : null
          }
        ]);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al consultar la IA');
        this.loading.set(false);
      }
    });
  }

  icons = {
    faPaperPlane
  }
}