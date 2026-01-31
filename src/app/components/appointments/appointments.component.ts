import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Appointments</h1>

        <div *ngIf="loading" class="text-center py-12 text-gray-600">Loading...</div>

        <div *ngIf="!loading && appointments.length === 0" class="text-center py-12 text-gray-600 bg-white rounded-xl border border-gray-200 p-8">
          No appointments yet.
        </div>

        <div *ngIf="!loading && appointments.length > 0" class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & time</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No-show risk</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr *ngFor="let a of appointments" class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <p class="font-medium text-gray-900">{{ a.user?.name }}</p>
                    <p *ngIf="a.user?.phone" class="text-xs text-gray-500">{{ a.user.phone }}</p>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ a.service?.name }} · $ {{ a.service?.price }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(a.appointmentDate) }}</td>
                  <td class="px-6 py-4">
                    <span [class]="getStatusClass(a.status)">{{ a.status }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span *ngIf="a.noShowProbability != null" [class]="getRiskClass(a.noShowProbability)">
                      {{ a.noShowProbability }}% risk
                    </span>
                    <button
                      *ngIf="(a.status === 'pending' || a.status === 'confirmed') && a.noShowProbability == null && !loadingRisk[a._id]"
                      type="button"
                      (click)="checkRisk(a._id)"
                      class="text-xs text-forest font-medium hover:underline"
                    >
                      Check risk
                    </button>
                    <span *ngIf="loadingRisk[a._id]" class="text-xs text-gray-500">Checking...</span>
                  </td>
                  <td class="px-6 py-4">
                    <select
                      *ngIf="a.status === 'pending' || a.status === 'confirmed'"
                      [value]="a.status"
                      (change)="updateStatus(a._id, $any($event.target).value)"
                      class="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No-show</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class AppointmentsComponent implements OnInit {
  appointments: any[] = [];
  loading = true;
  loadingRisk: Record<string, boolean> = {};

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.apiService.get('/appointments/barber').subscribe({
      next: (response: any) => {
        this.appointments = response?.data?.appointments ?? response?.appointments ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.appointments = [];
      },
    });
  }

  checkRisk(appointmentId: string): void {
    this.loadingRisk[appointmentId] = true;
    this.apiService.get('/ai/predict-no-show/' + appointmentId).subscribe({
      next: () => {
        this.loadingRisk[appointmentId] = false;
        this.loadAppointments();
      },
      error: () => {
        this.loadingRisk[appointmentId] = false;
      },
    });
  }

  updateStatus(appointmentId: string, status: string): void {
    this.apiService.put('/appointments/' + appointmentId + '/status', { status }).subscribe({
      next: () => this.loadAppointments(),
      error: () => {},
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      completed: 'px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800',
      confirmed: 'px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
      pending: 'px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
      cancelled: 'px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
      no_show: 'px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800',
    };
    return classes[status] || 'px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
  }

  getRiskClass(risk: number): string {
    if (risk >= 50) return 'text-xs font-medium text-red-600';
    if (risk >= 25) return 'text-xs font-medium text-amber-600';
    return 'text-xs font-medium text-green-600';
  }
}
