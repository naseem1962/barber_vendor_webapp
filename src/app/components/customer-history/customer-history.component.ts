import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

interface CustomerSummary {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface HistoryEntry {
  _id: string;
  haircutStyle: string;
  beardLength?: string;
  beardStyle?: string;
  productsUsed: string[];
  notes?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  appointment?: { appointmentDate: string };
}

@Component({
  selector: 'app-customer-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Customer History</h1>
        <p class="text-gray-600 mb-8">View past haircuts and use &quot;Same as last time&quot; for returning customers.</p>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1 bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Customers</h2>
            <div *ngIf="loadingCustomers" class="text-gray-600 py-4 text-center text-sm">Loading...</div>
            <div *ngIf="!loadingCustomers && customers.length === 0" class="text-gray-500 py-4 text-center text-sm">No customers yet.</div>
            <ul *ngIf="!loadingCustomers && customers.length > 0" class="space-y-1">
              <li *ngFor="let c of customers">
                <button
                  type="button"
                  (click)="selectCustomer(c)"
                  class="w-full text-left px-4 py-3 rounded-lg transition-colors"
                  [ngClass]="{
                    'bg-forest/10': selectedCustomer?._id === c._id,
                    'text-forest': selectedCustomer?._id === c._id,
                    'hover:bg-gray-100': selectedCustomer?._id !== c._id
                  }"
                >
                  <span class="font-medium text-gray-900">{{ c.name }}</span>
                  <span *ngIf="c.email" class="block text-xs text-gray-500 truncate">{{ c.email }}</span>
                </button>
              </li>
            </ul>
          </div>

          <div class="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">History</h2>
            <div *ngIf="!selectedCustomer" class="text-gray-500 py-12 text-center">Select a customer to view history.</div>
            <div *ngIf="selectedCustomer && loadingHistory" class="text-gray-600 py-12 text-center">Loading history...</div>
            <div *ngIf="selectedCustomer && !loadingHistory && history.length === 0" class="text-gray-500 py-12 text-center">No history for this customer yet.</div>
            <div *ngIf="selectedCustomer && !loadingHistory && history.length > 0" class="space-y-6">
              <div class="p-4 bg-forest/5 border border-forest/20 rounded-lg">
                <p class="text-sm font-medium text-forest uppercase mb-2">Same as last time</p>
                <p class="text-gray-800 font-medium">{{ lastEntry?.haircutStyle }}</p>
                <p *ngIf="lastEntry?.beardStyle" class="text-sm text-gray-600">Beard: {{ lastEntry?.beardStyle }}</p>
                <p *ngIf="lastEntry?.productsUsed?.length" class="text-sm text-gray-600">Products: {{ lastEntry?.productsUsed?.join(', ') }}</p>
              </div>
              <div class="space-y-4">
                <p class="text-sm font-medium text-gray-700">Past visits</p>
                <div *ngFor="let h of history" class="border border-gray-200 rounded-lg p-4">
                  <p class="font-medium text-gray-900">{{ h.haircutStyle }}</p>
                  <p *ngIf="h.beardLength || h.beardStyle" class="text-sm text-gray-600">Beard: {{ h.beardLength || '' }} {{ h.beardStyle || '' }}</p>
                  <p *ngIf="h.productsUsed?.length" class="text-sm text-gray-600">Products: {{ h.productsUsed.join(', ') }}</p>
                  <p *ngIf="h.notes" class="text-sm text-gray-500 mt-1">{{ h.notes }}</p>
                  <p class="text-xs text-gray-400 mt-2">{{ h.createdAt | date:'medium' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class CustomerHistoryComponent implements OnInit {
  customers: CustomerSummary[] = [];
  selectedCustomer: CustomerSummary | null = null;
  history: HistoryEntry[] = [];
  loadingCustomers = true;
  loadingHistory = false;

  get lastEntry(): HistoryEntry | null {
    return this.history.length > 0 ? this.history[0] : null;
  }

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loadingCustomers = true;
    this.apiService.get('/appointments/barber').subscribe({
      next: (res: any) => {
        const appointments = res?.data?.appointments || [];
        const seen = new Set<string>();
        this.customers = [];
        appointments.forEach((a: any) => {
          const u = a.user;
          if (u?._id && !seen.has(u._id)) {
            seen.add(u._id);
            this.customers.push({ _id: u._id, name: u.name || 'Customer', email: u.email, phone: u.phone });
          }
        });
        this.loadingCustomers = false;
      },
      error: () => {
        this.loadingCustomers = false;
        this.customers = [];
      },
    });
  }

  selectCustomer(c: CustomerSummary): void {
    this.selectedCustomer = c;
    this.loadHistory(c._id);
  }

  loadHistory(userId: string): void {
    this.loadingHistory = true;
    this.apiService.get('/appointments/history/' + userId).subscribe({
      next: (res: any) => {
        this.history = res?.data?.history || [];
        this.loadingHistory = false;
      },
      error: () => {
        this.history = [];
        this.loadingHistory = false;
      },
    });
  }
}
