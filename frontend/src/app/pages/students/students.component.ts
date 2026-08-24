import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Student, StudentRequest } from '../../core/models/Student';
import { StudentService } from '../../core/service/student.service';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-students',
  imports: [CommonModule, MaterialModule],
  templateUrl: './students.component.html',
  standalone: true,
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  students: Student[] = [];
  studentForm: FormGroup = new FormGroup({});
  selectedStudent: Student | null = null;
  editingId: number | null = null;
  submitted = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.studentForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
    this.loadStudents();
  }

  get form() {
    return this.studentForm.controls;
  }

  loadStudents(): void {
    this.loading = true;
    this.studentService.findAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (students) => {
          this.students = students;
          if (this.selectedStudent) {
            this.selectedStudent = students.find((student) => student.id === this.selectedStudent?.id) ?? null;
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Impossible de charger les étudiants.';
        }
      });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';
    if (this.studentForm.invalid) {
      return;
    }

    const student: StudentRequest = this.studentForm.getRawValue();
    this.loading = true;
    const request = this.editingId === null
      ? this.studentService.create(student)
      : this.studentService.update(this.editingId, student);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.successMessage = this.editingId === null
          ? 'Étudiant ajouté.'
          : 'Étudiant modifié.';
        this.cancelEdit();
        this.loadStudents();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible d’enregistrer cet étudiant.';
      }
    });
  }

  selectStudent(student: Student): void {
    this.selectedStudent = student;
  }

  editStudent(student: Student): void {
    this.editingId = student.id;
    this.selectedStudent = student;
    this.submitted = false;
    this.studentForm.patchValue(student);
  }

  deleteStudent(student: Student): void {
    if (!confirm(`Supprimer ${student.firstName} ${student.lastName} ?`)) {
      return;
    }

    this.loading = true;
    this.studentService.delete(student.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.successMessage = 'Étudiant supprimé.';
          this.selectedStudent = null;
          this.loadStudents();
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Impossible de supprimer cet étudiant.';
        }
      });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.submitted = false;
    this.studentForm.reset();
  }
}
