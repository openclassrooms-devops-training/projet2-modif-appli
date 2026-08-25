import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { StudentService } from './student.service';

describe('StudentService', () => {
  let service: StudentService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(StudentService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('loads the student list', () => {
    service.findAll().subscribe((students) => expect(students).toEqual([]));

    const request = httpController.expectOne('/api/students');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('creates a student with the expected DTO', () => {
    const student = { firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com' };

    service.create(student).subscribe((response) => expect(response.id).toBe(1));

    const request = httpController.expectOne('/api/students');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(student);
    request.flush({ id: 1, ...student });
  });

  it('updates a student with the expected DTO', () => {
    const student = { firstName: 'Alicia', lastName: 'Martin', email: 'alicia@example.com' };

    service.update(1, student).subscribe((response) => expect(response.email).toBe(student.email));

    const request = httpController.expectOne('/api/students/1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(student);
    request.flush({ id: 1, ...student });
  });

  it('deletes a student', () => {
    service.delete(1).subscribe();

    const request = httpController.expectOne('/api/students/1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
