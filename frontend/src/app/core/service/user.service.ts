import { Injectable } from '@angular/core';
import { Register } from '../models/Register';
import { Login } from '../models/Login';
import { UserProfile } from '../models/UserProfile';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private httpClient: HttpClient) { }

  register(user: Register): Observable<Object> {
    return this.httpClient.post('/api/register', user);
  }

  login(user: Login): Observable<string> {
    return this.httpClient.post('/api/login', user, { responseType: 'text' });
  }

  getProfile(): Observable<UserProfile> {
    return this.httpClient.get<UserProfile>('/api/me');
  }
}
