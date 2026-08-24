import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student, StudentRequest } from '../models/Student';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly httpClient = inject(HttpClient);
  private readonly endpoint = '/api/students';

  findAll(): Observable<Student[]> {
    return this.httpClient.get<Student[]>(this.endpoint);
  }

  create(student: StudentRequest): Observable<Student> {
    return this.httpClient.post<Student>(this.endpoint, student);
  }

  update(id: number, student: StudentRequest): Observable<Student> {
    return this.httpClient.put<Student>(`${this.endpoint}/${id}`, student);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.endpoint}/${id}`);
  }
}
