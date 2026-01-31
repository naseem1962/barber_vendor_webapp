import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen" style="background: var(--bg-primary);">
      <nav class="border-b" style="border-color: var(--border); background: var(--bg-secondary);">
        <div class="container mx-auto px-4 py-4">
          <div class="flex justify-between items-center">
            <h1 class="text-xl font-bold text-forest">Barber Portal</h1>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-600">Welcome, {{ barber?.name }}</span>
              <button
                (click)="logout()"
                class="px-4 py-2 text-sm font-medium text-red-600 hover:underline rounded-brand-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <h2 class="text-xl font-bold text-gray-900">Vendor dashboard</h2>
          <p class="text-sm text-gray-600 mt-1">AI insights, appointments, customer history</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div class="rounded-brand-lg p-6 shadow-brand-md border border-gray-200 bg-white">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Total earnings</h3>
            <p class="text-2xl font-bold text-forest">{{ '$' + (earnings?.total ?? 0) }}</p>
          </div>
          <div class="rounded-brand-lg p-6 shadow-brand-md border border-gray-200 bg-white">
            <h3 class="text-sm font-medium text-gray-500 mb-2">This month</h3>
            <p class="text-2xl font-bold text-forest">{{ '$' + (earnings?.thisMonth ?? 0) }}</p>
          </div>
          <div class="rounded-brand-lg p-6 shadow-brand-md border border-gray-200 bg-white">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Rating</h3>
            <p class="text-2xl font-bold text-forest">{{ barber?.rating || 0 }}/5</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <a
            routerLink="/appointments"
            class="rounded-brand-lg p-6 shadow-brand-md border border-gray-200 bg-white hover:shadow-brand-lg transition-shadow block"
          >
            <div class="text-2xl mb-2">📅</div>
            <h3 class="font-semibold text-gray-900">Appointments</h3>
            <p class="text-sm text-gray-600 mt-1">No-show prediction, reminders</p>
          </a>
          <a
            routerLink="/customer-history"
            class="rounded-brand-lg p-6 shadow-brand-md border border-gray-200 bg-white hover:shadow-brand-lg transition-shadow block"
          >
            <div class="text-2xl mb-2">📝</div>
            <h3 class="font-semibold text-gray-900">Customer history</h3>
            <p class="text-sm text-gray-600 mt-1">Same as last time</p>
          </a>
          <a
            routerLink="/ai-recommendations"
            class="rounded-brand-lg p-6 shadow-brand-md border border-gray-200 bg-white hover:shadow-brand-lg transition-shadow block"
          >
            <div class="text-2xl mb-2">🤖</div>
            <h3 class="font-semibold text-gray-900">AI hairstyle</h3>
            <p class="text-sm text-gray-600 mt-1">Recommend & save styles</p>
          </a>
          <a
            routerLink="/chat"
            class="rounded-brand-lg p-6 shadow-brand-md border border-gray-200 bg-white hover:shadow-brand-lg transition-shadow block"
          >
            <div class="text-2xl mb-2">💬</div>
            <h3 class="font-semibold text-gray-900">Messages</h3>
            <p class="text-sm text-gray-600 mt-1">Chat with customers</p>
          </a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div class="rounded-brand-lg p-6 shadow-brand-md border border-gray-200 bg-white">
            <h3 class="font-semibold text-gray-900 mb-2">AI pricing assistant</h3>
            <p class="text-sm text-gray-600 mb-4">Recommended price based on time, skill & demand.</p>
            <div class="space-y-3 mb-4">
              <input
                type="number"
                [(ngModel)]="pricingForm.serviceDuration"
                placeholder="Duration (min)"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <select [(ngModel)]="pricingForm.skillLevel" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
              <label class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="pricingForm.isPeakHour" />
                <span class="text-sm text-gray-700">Peak hour</span>
              </label>
              <select [(ngModel)]="pricingForm.dayOfWeek" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="weekday">Weekday</option>
                <option value="weekend">Weekend</option>
              </select>
            </div>
            <button
              type="button"
              (click)="getPricingRecommendation()"
              [disabled]="loadingPricing"
              class="w-full py-2 bg-forest text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {{ loadingPricing ? '...' : 'Get recommendation' }}
            </button>
            <div *ngIf="pricingRecommendation" class="mt-4 p-4 rounded-brand-md bg-forest/5 border border-forest/20">
              <p class="text-xs font-medium text-forest uppercase">Recommended price</p>
              <p class="text-gray-800 mt-1 whitespace-pre-wrap">{{ pricingRecommendation }}</p>
            </div>
          </div>
          <div class="rounded-brand-lg p-6 shadow-brand-md border border-gray-200 bg-white">
            <h3 class="font-semibold text-gray-900 mb-2">AI business insights</h3>
            <p class="text-sm text-gray-600 mb-4">Weekly earnings, top customers, services to promote.</p>
            <button
              type="button"
              (click)="loadBusinessInsights()"
              [disabled]="loadingInsights"
              class="w-full py-2 bg-forest text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 mb-4"
            >
              {{ loadingInsights ? 'Loading...' : 'Load insights' }}
            </button>
            <div *ngIf="businessInsights" class="p-4 rounded-brand-md bg-forest/5 border border-forest/20">
              <p class="text-gray-800 whitespace-pre-wrap">{{ businessInsights }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class DashboardComponent implements OnInit {
  barber: any = null;
  earnings: any = {};
  pricingRecommendation: string | null = null;
  businessInsights: string | null = null;
  loadingPricing = false;
  loadingInsights = false;
  pricingForm = {
    serviceDuration: 30,
    skillLevel: 'intermediate',
    isPeakHour: false,
    dayOfWeek: 'weekday',
  };

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentBarber$.subscribe((barber) => {
      this.barber = barber;
    });
    this.loadBarberData();
  }

  loadBarberData(): void {
    this.apiService.get('/barbers/me').subscribe({
      next: (response: any) => {
        if (response.success) {
          this.barber = response.data.barber;
          this.earnings = response.data.barber?.earnings || {};
        }
      },
      error: (error) => {
        console.error('Error loading barber data:', error);
      },
    });
  }

  getPricingRecommendation(): void {
    this.loadingPricing = true;
    this.pricingRecommendation = null;
    this.apiService
      .post('/ai/pricing-recommendation', {
        serviceDuration: this.pricingForm.serviceDuration,
        skillLevel: this.pricingForm.skillLevel,
        isPeakHour: this.pricingForm.isPeakHour,
        dayOfWeek: this.pricingForm.dayOfWeek,
      })
      .subscribe({
        next: (res: any) => {
          if (res.success && res.data?.recommendation) {
            this.pricingRecommendation = res.data.recommendation;
          }
          this.loadingPricing = false;
        },
        error: () => {
          this.loadingPricing = false;
        },
      });
  }

  loadBusinessInsights(): void {
    this.loadingInsights = true;
    this.businessInsights = null;
    this.apiService.get('/ai/business-insights').subscribe({
      next: (res: any) => {
        if (res.success && res.data?.insights) {
          this.businessInsights = res.data.insights;
        }
        this.loadingInsights = false;
      },
      error: () => {
        this.loadingInsights = false;
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
