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
    // Act: subscribe triggers the GET request; the response assertion below
    // runs once the request is flushed with a fake response
    service.findAll().subscribe((students) => expect(students).toEqual([]));

    // Assert: the request itself has the expected shape...
    const request = httpController.expectOne('/api/students');
    expect(request.request.method).toBe('GET');
    // ...then flush a fake response, which resolves the subscribe above
    request.flush([]);
  });

  it('creates a student with the expected DTO', () => {
    // Arrange
    const student = { firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com' };

    // Act
    service.create(student).subscribe((response) => expect(response.id).toBe(1));

    // Assert
    const request = httpController.expectOne('/api/students');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(student);
    request.flush({ id: 1, ...student });
  });

  it('updates a student with the expected DTO', () => {
    // Arrange
    const student = { firstName: 'Alicia', lastName: 'Martin', email: 'alicia@example.com' };

    // Act
    service.update(1, student).subscribe((response) => expect(response.email).toBe(student.email));

    // Assert
    const request = httpController.expectOne('/api/students/1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(student);
    request.flush({ id: 1, ...student });
  });

  it('deletes a student', () => {
    // Act
    service.delete(1).subscribe();

    // Assert
    const request = httpController.expectOne('/api/students/1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
