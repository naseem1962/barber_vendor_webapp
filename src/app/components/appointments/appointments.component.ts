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
        
        <div *ngIf="!loading && appointments.length === 0" class="text-center py-12 text-gray-600">
          No appointments yet
        </div>

        <div *ngIf="!loading && appointments.length > 0" class="bg-white rounded-lg shadow divide-y">
          <div *ngFor="let appointment of appointments" class="p-6 hover:bg-gray-50">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold text-gray-900">{{ appointment.user?.name }}</h3>
                <p class="text-sm text-gray-600">{{ appointment.service.name }} - {{ '$' + appointment.service.price }}</p>
                <p class="text-sm text-gray-600">{{ formatDate(appointment.appointmentDate) }}</p>
              </div>
              <span [class]="getStatusClass(appointment.status)">
                {{ appointment.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AppointmentsComponent implements OnInit {
  appointments: any[] = [];
  loading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.apiService.get('/appointments/barber').subscribe({
      next: (response: any) => {
        if (response.success) {
          this.appointments = response.data.appointments;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.loading = false;
      },
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
    };
    return classes[status] || 'px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
  }
}
