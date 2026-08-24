package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
class StudentServiceTest {
    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentService studentService;

    @Test
    void createPersistsAndReturnsStudent() {
        StudentRequestDTO request = request("Alice", "Martin", "alice@example.com");
        Student savedStudent = new Student(1L, "Alice", "Martin", "alice@example.com", null, null);
        when(studentRepository.save(any(Student.class))).thenReturn(savedStudent);

        var response = studentService.create(request);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("alice@example.com");
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    void findByIdReturnsStudent() {
        Student student = new Student(1L, "Alice", "Martin", "alice@example.com", null, null);
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        var response = studentService.findById(1L);

        assertThat(response.getFirstName()).isEqualTo("Alice");
    }

    @Test
    void updateChangesStudentFields() {
        Student student = new Student(1L, "Alice", "Martin", "alice@example.com", null, null);
        StudentRequestDTO request = request("Alicia", "Martin", "alicia@example.com");
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = studentService.update(1L, request);

        assertThat(response.getFirstName()).isEqualTo("Alicia");
        assertThat(response.getEmail()).isEqualTo("alicia@example.com");
    }

    @Test
    void deleteRemovesExistingStudent() {
        Student student = new Student(1L, "Alice", "Martin", "alice@example.com", null, null);
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        studentService.delete(1L);

        verify(studentRepository).delete(student);
    }

    @Test
    void findByIdThrowsNotFoundForUnknownStudent() {
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentService.findById(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Student with id 99 not found");
    }

    private StudentRequestDTO request(String firstName, String lastName, String email) {
        StudentRequestDTO request = new StudentRequestDTO();
        request.setFirstName(firstName);
        request.setLastName(lastName);
        request.setEmail(email);
        return request;
    }
}
