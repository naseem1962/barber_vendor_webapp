import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AppointmentsComponent } from './components/appointments/appointments.component';
import { CustomerHistoryComponent } from './components/customer-history/customer-history.component';
import { AiRecommendationsComponent } from './components/ai-recommendations/ai-recommendations.component';
import { ChatComponent } from './components/chat/chat.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'appointments',
    component: AppointmentsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'customer-history',
    component: CustomerHistoryComponent,
    canActivate: [authGuard],
  },
  {
    path: 'ai-recommendations',
    component: AiRecommendationsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [authGuard],
  },
];
