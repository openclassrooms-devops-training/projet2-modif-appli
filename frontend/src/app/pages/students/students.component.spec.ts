import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { StudentsComponent } from './students.component';
import { StudentService } from '../../core/service/student.service';

const studentServiceMock = {
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

describe('StudentsComponent', () => {
  let component: StudentsComponent;
  let fixture: ComponentFixture<StudentsComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    studentServiceMock.findAll.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [StudentsComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the student list on initialization', () => {
    // Arrange & Act: ngOnInit already called loadStudents() via fixture.detectChanges() above

    // Assert
    expect(studentServiceMock.findAll).toHaveBeenCalledTimes(1);
    expect(component.students).toEqual([]);
  });

  it('creates a student from a valid form and reloads the list', () => {
    // Arrange
    const student = { firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com' };
    studentServiceMock.create.mockReturnValue(of({ id: 1, ...student }));
    component.studentForm.setValue(student);

    // Act
    component.onSubmit();

    // Assert
    expect(studentServiceMock.create).toHaveBeenCalledWith(student);
    expect(component.successMessage).toBe('Étudiant ajouté.');
    expect(studentServiceMock.findAll).toHaveBeenCalledTimes(2);
  });

  it('updates the selected student', () => {
    // Arrange
    const student = { id: 1, firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com' };
    const updated = { firstName: 'Alicia', lastName: 'Martin', email: 'alicia@example.com' };
    component.students = [student];
    component.editStudent(student);
    studentServiceMock.update.mockReturnValue(of({ id: 1, ...updated }));
    component.studentForm.setValue(updated);

    // Act
    component.onSubmit();

    // Assert
    expect(studentServiceMock.update).toHaveBeenCalledWith(1, updated);
    expect(component.successMessage).toBe('Étudiant modifié.');
  });

  it('deletes a student after confirmation', () => {
    // Arrange
    const student = { id: 1, firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com' };
    component.students = [student];
    studentServiceMock.delete.mockReturnValue(of(void 0));
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    // Act
    component.deleteStudent(student);

    // Assert
    expect(studentServiceMock.delete).toHaveBeenCalledWith(1);
    expect(component.successMessage).toBe('Étudiant supprimé.');
  });

  it('displays an error when loading students fails', () => {
    // Arrange
    studentServiceMock.findAll.mockReturnValue(throwError(() => new Error('network')));

    // Act
    component.loadStudents();

    // Assert
    expect(component.errorMessage).toBe('Impossible de charger les étudiants.');
  });
});
