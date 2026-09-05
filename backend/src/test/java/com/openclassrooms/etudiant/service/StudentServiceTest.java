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

import java.time.LocalDate;
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
        // Arrange
        StudentRequestDTO request = request("Alice", "Martin", "alice@example.com");
        Student savedStudent = Student.builder()
                .id(1L).firstName("Alice").lastName("Martin").email("alice@example.com")
                .build();
        when(studentRepository.save(any(Student.class))).thenReturn(savedStudent);

        // Act
        var response = studentService.create(request);

        // Assert
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("alice@example.com");
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    void findByIdReturnsStudent() {
        // Arrange
        Student student = Student.builder()
                .id(1L).firstName("Alice").lastName("Martin").email("alice@example.com")
                .build();
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        // Act
        var response = studentService.findById(1L);

        // Assert
        assertThat(response.getFirstName()).isEqualTo("Alice");
    }

    @Test
    void updateChangesStudentFields() {
        // Arrange
        Student student = Student.builder()
                .id(1L).firstName("Alice").lastName("Martin").email("alice@example.com")
                .build();
        StudentRequestDTO request = request("Alicia", "Martin", "alicia@example.com");
        request.setPhone("0612345678");
        request.setBirthDate(LocalDate.of(2001, 5, 17));
        request.setStudentNumber("ETU-2026-042");
        request.setAddress("12 rue des Lilas, 75000 Paris");
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        var response = studentService.update(1L, request);

        // Assert
        assertThat(response.getFirstName()).isEqualTo("Alicia");
        assertThat(response.getEmail()).isEqualTo("alicia@example.com");
        assertThat(response.getPhone()).isEqualTo("0612345678");
        assertThat(response.getBirthDate()).isEqualTo(LocalDate.of(2001, 5, 17));
        assertThat(response.getStudentNumber()).isEqualTo("ETU-2026-042");
        assertThat(response.getAddress()).isEqualTo("12 rue des Lilas, 75000 Paris");
    }

    @Test
    void deleteRemovesExistingStudent() {
        // Arrange
        Student student = Student.builder()
                .id(1L).firstName("Alice").lastName("Martin").email("alice@example.com")
                .build();
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        // Act
        studentService.delete(1L);

        // Assert
        verify(studentRepository).delete(student);
    }

    @Test
    void findByIdThrowsNotFoundForUnknownStudent() {
        // Arrange
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
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
