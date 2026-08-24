package com.openclassrooms.etudiant.controller;

import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.dto.StudentResponseDTO;
import com.openclassrooms.etudiant.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Tag(name = "Étudiants", description = "Gestion des étudiants abonnés à la bibliothèque")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {
    private final StudentService studentService;

    @PostMapping
    @Operation(summary = "Ajouter un étudiant")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Étudiant créé"),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "401", description = "Authentification requise")
    })
    public ResponseEntity<StudentResponseDTO> create(@Valid @RequestBody StudentRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.create(request));
    }

    @GetMapping
    @Operation(summary = "Consulter la liste des étudiants")
    public ResponseEntity<List<StudentResponseDTO>> findAll() {
        return ResponseEntity.ok(studentService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulter un étudiant")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Étudiant trouvé"),
            @ApiResponse(responseCode = "404", description = "Étudiant introuvable")
    })
    public ResponseEntity<StudentResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.findById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un étudiant")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Étudiant modifié"),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "404", description = "Étudiant introuvable")
    })
    public ResponseEntity<StudentResponseDTO> update(@PathVariable Long id,
                                                      @Valid @RequestBody StudentRequestDTO request) {
        return ResponseEntity.ok(studentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un étudiant")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Étudiant supprimé"),
            @ApiResponse(responseCode = "404", description = "Étudiant introuvable")
    })
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
