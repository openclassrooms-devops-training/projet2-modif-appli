package com.openclassrooms.etudiant.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileDTO {
    private String firstName;
    private String lastName;
    private String login;
}
