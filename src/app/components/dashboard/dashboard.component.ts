import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="rounded-brand-lg p-6 shadow-brand-md border border-gray-200 bg-white">
            <h3 class="font-semibold text-gray-900 mb-2">AI pricing assistant</h3>
            <p class="text-sm text-gray-600">Recommended price based on time, skill & demand.</p>
            <div class="mt-4 p-4 rounded-brand-md bg-forest/5 border border-forest/20">
              <p class="text-xs font-medium text-forest uppercase">Recommended price</p>
              <p class="text-xl font-bold text-forest mt-1">—</p>
            </div>
          </div>
          <div class="rounded-brand-lg p-6 shadow-brand-md border border-gray-200 bg-white">
            <h3 class="font-semibold text-gray-900 mb-2">AI business insights</h3>
            <p class="text-sm text-gray-600">Weekly earnings, top customers, services to promote.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  barber: any = null;
  earnings: any = {};

  constructor(
    private authService: AuthService,
    private apiService: ApiService
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

  logout(): void {
    this.authService.logout();
  }
}
