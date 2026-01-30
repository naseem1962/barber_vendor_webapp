import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Barber {
  id: string;
  name: string;
  email: string;
  phone: string;
  shopName?: string;
  rating: number;
  subscriptionType: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentBarberSubject = new BehaviorSubject<Barber | null>(null);
  public currentBarber$ = this.currentBarberSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedBarber = localStorage.getItem('barber');
    const storedToken = localStorage.getItem('token');
    if (storedBarber && storedToken) {
      this.currentBarberSubject.next(JSON.parse(storedBarber));
    }
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/barbers/register`, data).pipe(
      tap((response: any) => {
        if (response.success) {
          this.setAuth(response.data.barber, response.data.token);
        }
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/barbers/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response.success) {
          this.setAuth(response.data.barber, response.data.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('barber');
    localStorage.removeItem('token');
    this.currentBarberSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setAuth(barber: Barber, token: string): void {
    localStorage.setItem('barber', JSON.stringify(barber));
    localStorage.setItem('token', token);
    this.currentBarberSubject.next(barber);
  }
}
