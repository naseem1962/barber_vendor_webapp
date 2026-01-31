import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

const FACE_SHAPES = ['oval', 'round', 'square', 'heart', 'diamond', 'oblong'];
const HAIR_TYPES = ['curly', 'straight', 'wavy', 'thin'];
const HAIR_DENSITY = ['low', 'medium', 'high'];

@Component({
  selector: 'app-ai-recommendations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">AI Hairstyle Recommendation</h1>
        <p class="text-gray-600 mb-8">Get personalized hairstyle and beard recommendations for your customer.</p>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Customer details</h2>
            <form class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Face shape</label>
                <select
                  [(ngModel)]="faceShape"
                  name="faceShape"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                >
                  <option value="">Select</option>
                  <option *ngFor="let s of faceShapes" [value]="s">{{ s | titlecase }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Hair type</label>
                <select
                  [(ngModel)]="hairType"
                  name="hairType"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                >
                  <option value="">Select</option>
                  <option *ngFor="let t of hairTypes" [value]="t">{{ t | titlecase }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Hair density</label>
                <select
                  [(ngModel)]="hairDensity"
                  name="hairDensity"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                >
                  <option value="">Select</option>
                  <option *ngFor="let d of hairDensityOptions" [value]="d">{{ d | titlecase }}</option>
                </select>
              </div>
              <button
                type="button"
                (click)="getRecommendations()"
                [disabled]="loading"
                class="w-full py-3 bg-forest text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {{ loading ? 'Getting recommendations...' : 'Get AI recommendations' }}
              </button>
            </form>
          </div>

          <div class="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Recommendations</h2>
            <div *ngIf="loading" class="text-gray-600 py-8 text-center">Loading...</div>
            <div *ngIf="error" class="text-red-600 py-4 p-4 bg-red-50 rounded-lg">{{ error }}</div>
            <div *ngIf="!loading && !error && !recommendations" class="text-gray-500 py-8 text-center">
              Enter customer details and click &quot;Get AI recommendations&quot;.
            </div>
            <div *ngIf="!loading && !error && recommendations" class="space-y-4">
              <div class="p-4 bg-forest/5 border border-forest/20 rounded-lg whitespace-pre-wrap text-gray-800">{{ recommendations }}</div>
              <div *ngIf="analysis" class="text-sm text-gray-600">
                <p><strong>Analysis:</strong> Face {{ analysis.faceShape || '—' }}, {{ analysis.hairType || '—' }} hair, {{ analysis.hairDensity || '—' }} density.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class AiRecommendationsComponent {
  faceShapes = FACE_SHAPES;
  hairTypes = HAIR_TYPES;
  hairDensityOptions = HAIR_DENSITY;
  faceShape = '';
  hairType = '';
  hairDensity = '';
  loading = false;
  error = '';
  recommendations: string | null = null;
  analysis: { faceShape?: string; hairType?: string; hairDensity?: string } | null = null;

  constructor(private apiService: ApiService) {}

  getRecommendations(): void {
    this.error = '';
    this.recommendations = null;
    this.analysis = null;
    this.loading = true;
    this.apiService
      .post('/ai/hairstyle-recommendation', {
        faceShape: this.faceShape || undefined,
        hairType: this.hairType || undefined,
        hairDensity: this.hairDensity || undefined,
      })
      .subscribe({
        next: (res: any) => {
          if (res.success && res.data) {
            this.recommendations = res.data.recommendations ?? null;
            this.analysis = res.data.analysis ?? null;
          } else {
            this.error = 'No recommendations returned.';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.error?.message || 'Failed to get recommendations.';
          this.loading = false;
        },
      });
  }
}
