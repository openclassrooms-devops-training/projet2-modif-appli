import { CommonModule } from '@angular/common';
import { Component, DestroyRef, HostListener, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Student, StudentRequest } from '../../core/models/Student';
import { StudentService } from '../../core/service/student.service';
import { MaterialModule } from '../../shared/material.module';

const MESSAGE_DURATION_MS = 4000;

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
  private messageTimeoutId?: ReturnType<typeof setTimeout>;

  students: Student[] = [];
  studentForm: FormGroup = new FormGroup({});
  selectedStudent: Student | null = null;
  editingId: number | null = null;
  showForm = false;
  confirmingDeleteId: number | null = null;
  submitted: boolean = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.studentForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      birthDate: [''],
      studentNumber: [''],
      address: [''],
      avatarSeed: ['']
    });
    this.destroyRef.onDestroy(() => clearTimeout(this.messageTimeoutId));
    this.loadStudents();
  }

  get form() {
    return this.studentForm.controls;
  }

  get avatarPreviewSeed(): string | number {
    return this.form['avatarSeed'].value || this.editingId || 'nouvel-etudiant';
  }

  get studentPendingDeletion(): Student | null {
    return this.students.find((student) => student.id === this.confirmingDeleteId) ?? null;
  }

  get showDetailPanel(): boolean {
    return !this.showForm && this.selectedStudent !== null;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.cancelDeleteConfirmation();
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
          this.showTemporaryMessage('error', 'Impossible de charger les étudiants.');
        }
      });
  }

  openAddForm(): void {
    this.editingId = null;
    this.confirmingDeleteId = null;
    this.submitted = false;
    this.studentForm.reset();
    this.studentForm.get('avatarSeed')?.setValue(this.randomAvatarSeed());
    this.showForm = true;
  }

  avatarUrl(seed: string | number | null | undefined): string {
    return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(String(seed))}`;
  }

  regenerateAvatar(): void {
    this.studentForm.get('avatarSeed')?.setValue(this.randomAvatarSeed());
  }

  private randomAvatarSeed(): string {
    return Math.random().toString(36).slice(2, 10);
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
        this.showTemporaryMessage('success', this.editingId === null
          ? 'Étudiant ajouté.'
          : 'Étudiant modifié.');
        this.cancelEdit();
        this.loadStudents();
      },
      error: () => {
        this.loading = false;
        this.showTemporaryMessage('error', 'Impossible d’enregistrer cet étudiant.');
      }
    });
  }

  selectStudent(student: Student): void {
    this.selectedStudent = this.selectedStudent?.id === student.id ? null : student;
  }

  closeDetail(): void {
    this.selectedStudent = null;
  }

  editStudent(student: Student): void {
    this.editingId = student.id;
    this.selectedStudent = student;
    this.confirmingDeleteId = null;
    this.submitted = false;
    this.showForm = true;
    this.studentForm.patchValue(student);
  }

  deleteStudent(student: Student): void {
    if (this.confirmingDeleteId !== student.id) {
      this.confirmingDeleteId = student.id;
      return;
    }
    this.confirmingDeleteId = null;

    this.loading = true;
    this.studentService.delete(student.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showTemporaryMessage('success', 'Étudiant supprimé.');
          this.selectedStudent = null;
          this.loadStudents();
        },
        error: () => {
          this.loading = false;
          this.showTemporaryMessage('error', 'Impossible de supprimer cet étudiant.');
        }
      });
  }

  cancelDeleteConfirmation(): void {
    this.confirmingDeleteId = null;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.submitted = false;
    this.showForm = false;
    this.studentForm.reset();
  }

  private showTemporaryMessage(type: 'success' | 'error', message: string): void {
    if (type === 'success') {
      this.successMessage = message;
      this.errorMessage = '';
    } else {
      this.errorMessage = message;
      this.successMessage = '';
    }

    clearTimeout(this.messageTimeoutId);
    this.messageTimeoutId = setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, MESSAGE_DURATION_MS);
  }
}
