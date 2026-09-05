package com.openclassrooms.etudiant.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class StudentResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate birthDate;
    private String studentNumber;
    private String address;
    private String avatarSeed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
