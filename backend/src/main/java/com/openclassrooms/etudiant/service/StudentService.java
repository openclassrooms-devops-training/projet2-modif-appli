package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.dto.StudentResponseDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.repository.StudentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;

    public StudentResponseDTO create(StudentRequestDTO request) {
        Student student = new Student();
        updateStudent(student, request);
        return toResponse(studentRepository.save(student));
    }

    public List<StudentResponseDTO> findAll() {
        return studentRepository.findAll().stream().map(this::toResponse).toList();
    }

    public StudentResponseDTO findById(Long id) {
        return toResponse(findStudent(id));
    }

    public StudentResponseDTO update(Long id, StudentRequestDTO request) {
        Student student = findStudent(id);
        updateStudent(student, request);
        return toResponse(studentRepository.save(student));
    }

    public void delete(Long id) {
        Student student = findStudent(id);
        studentRepository.delete(student);
    }

    private Student findStudent(Long id) {
        return studentRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Student with id " + id + " not found"));
    }

    private void updateStudent(Student student, StudentRequestDTO request) {
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setEmail(request.getEmail());
    }

    private StudentResponseDTO toResponse(Student student) {
        return new StudentResponseDTO(student.getId(), student.getFirstName(), student.getLastName(),
                student.getEmail(), student.getCreatedAt(), student.getUpdatedAt());
    }
}
