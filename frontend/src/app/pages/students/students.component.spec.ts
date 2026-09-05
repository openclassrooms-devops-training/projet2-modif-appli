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
    const student = {
      firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com',
      phone: '', birthDate: '', studentNumber: '', address: '', avatarSeed: ''
    };
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
    const updated = {
      firstName: 'Alicia', lastName: 'Martin', email: 'alicia@example.com',
      phone: '', birthDate: '', studentNumber: '', address: '', avatarSeed: ''
    };
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

  it('asks for confirmation before deleting a student', () => {
    // Arrange
    const student = { id: 1, firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com' };
    component.students = [student];

    // Act: a single click only requests confirmation
    component.deleteStudent(student);

    // Assert
    expect(studentServiceMock.delete).not.toHaveBeenCalled();
    expect(component.confirmingDeleteId).toBe(1);
  });

  it('cancels the delete confirmation without deleting', () => {
    // Arrange
    const student = { id: 1, firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com' };
    component.students = [student];
    component.deleteStudent(student);

    // Act
    component.cancelDeleteConfirmation();

    // Assert
    expect(component.confirmingDeleteId).toBeNull();
    expect(studentServiceMock.delete).not.toHaveBeenCalled();
  });

  it('deletes a student on the confirming click', () => {
    // Arrange
    const student = { id: 1, firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com' };
    component.students = [student];
    studentServiceMock.delete.mockReturnValue(of(void 0));
    component.deleteStudent(student);

    // Act: the second click on the same student confirms the deletion
    component.deleteStudent(student);

    // Assert
    expect(studentServiceMock.delete).toHaveBeenCalledWith(1);
    expect(component.confirmingDeleteId).toBeNull();
    expect(component.successMessage).toBe('Étudiant supprimé.');
  });

  it('exposes the student pending deletion for the confirmation popup', () => {
    // Arrange
    const student = { id: 1, firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com' };
    component.students = [student];

    // Assert: nobody pending yet
    expect(component.studentPendingDeletion).toBeNull();

    // Act
    component.deleteStudent(student);

    // Assert
    expect(component.studentPendingDeletion).toEqual(student);
  });

  it('closes the delete confirmation popup on Escape', () => {
    // Arrange
    const student = { id: 1, firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com' };
    component.students = [student];
    component.deleteStudent(student);

    // Act
    component.onEscapeKey();

    // Assert
    expect(component.confirmingDeleteId).toBeNull();
    expect(component.studentPendingDeletion).toBeNull();
  });

  it('toggles the read-only detail panel when clicking a row twice', () => {
    // Arrange
    const student = { id: 1, firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com' };
    component.students = [student];

    // Assert: nothing selected yet
    expect(component.showDetailPanel).toBe(false);

    // Act: first click selects it
    component.selectStudent(student);

    // Assert
    expect(component.selectedStudent).toEqual(student);
    expect(component.showDetailPanel).toBe(true);

    // Act: clicking the same row again deselects it
    component.selectStudent(student);

    // Assert
    expect(component.selectedStudent).toBeNull();
    expect(component.showDetailPanel).toBe(false);
  });

  it('hides the detail panel while the form is open, even if a student is selected', () => {
    // Arrange
    const student = { id: 1, firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com' };
    component.students = [student];
    component.selectStudent(student);

    // Act: opening the edit form takes priority over the detail panel
    component.editStudent(student);

    // Assert
    expect(component.showDetailPanel).toBe(false);
  });

  it('closes the detail panel via closeDetail()', () => {
    // Arrange
    const student = { id: 1, firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com' };
    component.students = [student];
    component.selectStudent(student);

    // Act
    component.closeDetail();

    // Assert
    expect(component.selectedStudent).toBeNull();
    expect(component.showDetailPanel).toBe(false);
  });

  it('opens the add form and reopens it in edit mode', () => {
    // Arrange & Act: open the form for a new student
    component.openAddForm();

    // Assert
    expect(component.showForm).toBe(true);
    expect(component.editingId).toBeNull();

    // Act: editing a student also opens the form
    component.cancelEdit();
    component.editStudent({ id: 1, firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com' });

    // Assert
    expect(component.showForm).toBe(true);
    expect(component.editingId).toBe(1);
  });

  it('assigns a random avatar seed when opening the add form, and regenerates it on demand', () => {
    // Arrange & Act
    component.openAddForm();
    const firstSeed = component.form['avatarSeed'].value;

    // Assert
    expect(firstSeed).toBeTruthy();

    // Act: regenerating changes the seed
    component.regenerateAvatar();
    const secondSeed = component.form['avatarSeed'].value;

    // Assert
    expect(secondSeed).toBeTruthy();
    expect(secondSeed).not.toBe(firstSeed);
  });

  it('falls back to the student id for the avatar preview when no seed is set yet', () => {
    // Arrange & Act
    component.editStudent({ id: 42, firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com' });

    // Assert
    expect(component.avatarPreviewSeed).toBe(42);
  });

  it('clears success and error messages automatically after a delay', () => {
    // Arrange
    jest.useFakeTimers();
    const student = {
      firstName: 'Alice', lastName: 'Martin', email: 'alice@example.com',
      phone: '', birthDate: '', studentNumber: '', address: '', avatarSeed: ''
    };
    studentServiceMock.create.mockReturnValue(of({ id: 1, ...student }));
    component.studentForm.setValue(student);

    // Act
    component.onSubmit();
    expect(component.successMessage).toBe('Étudiant ajouté.');
    jest.advanceTimersByTime(4000);

    // Assert
    expect(component.successMessage).toBe('');
    jest.useRealTimers();
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
