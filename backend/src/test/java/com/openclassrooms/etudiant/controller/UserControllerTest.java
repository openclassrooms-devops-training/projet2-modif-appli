package com.openclassrooms.etudiant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.etudiant.dto.RegisterDTO;
import com.openclassrooms.etudiant.dto.LoginRequestDTO;
import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.repository.StudentRepository;
import com.openclassrooms.etudiant.repository.UserRepository;
import com.openclassrooms.etudiant.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.testcontainers.mysql.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public class UserControllerTest {

    private static final String URL = "/api/register";
    private static final String LOGIN_URL = "/api/login";
    private static final String FIRST_NAME = "John";
    private static final String LAST_NAME = "Doe";
    private static final String LOGIN = "login";
    private static final String PASSWORD = "password";


    @Container
    static MySQLContainer mySQLContainer = new MySQLContainer("mysql:latest");

    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private MockMvc mockMvc;

    @DynamicPropertySource
    static void configureTestProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> mySQLContainer.getJdbcUrl());
        registry.add("spring.datasource.username", () -> mySQLContainer.getUsername());
        registry.add("spring.datasource.password", () -> mySQLContainer.getPassword());
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create");

    }

    @AfterEach
    public void afterEach() {
        userRepository.deleteAll();
        studentRepository.deleteAll();
    }

    @Test
    public void registerUserWithoutRequiredData() throws Exception {
        // Arrange
        RegisterDTO registerDTO = new RegisterDTO();

        // Act
        var result = mockMvc.perform(MockMvcRequestBuilders.post(URL)
                        .content(objectMapper.writeValueAsString(registerDTO))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print());

        // Assert
        result.andExpect(MockMvcResultMatchers.status().isBadRequest());
    }

    @Test
    public void registerAlreadyExistUser() throws Exception {
        // Arrange
        User user = new User();
        user.setFirstName(FIRST_NAME);
        user.setLastName(LAST_NAME);
        user.setLogin(LOGIN);
        user.setPassword(PASSWORD);
        userService.register(user);

        RegisterDTO registerDTO = new RegisterDTO();
        registerDTO.setFirstName(FIRST_NAME);
        registerDTO.setLastName(LAST_NAME);
        registerDTO.setLogin(LOGIN);
        registerDTO.setPassword(PASSWORD);

        // Act
        var result = mockMvc.perform(MockMvcRequestBuilders.post(URL)
                        .content(objectMapper.writeValueAsString(registerDTO))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print());

        // Assert
        result.andExpect(MockMvcResultMatchers.status().isBadRequest());
    }

    @Test
    public void registerUserSuccessful() throws Exception {
        // Arrange
        RegisterDTO registerDTO = new RegisterDTO();
        registerDTO.setFirstName(FIRST_NAME);
        registerDTO.setLastName(LAST_NAME);
        registerDTO.setLogin(LOGIN);
        registerDTO.setPassword(PASSWORD);

        // Act
        var result = mockMvc.perform(MockMvcRequestBuilders.post(URL)
                        .content(objectMapper.writeValueAsString(registerDTO))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print());

        // Assert
        result.andExpect(MockMvcResultMatchers.status().isCreated());
    }

    @Test
    public void loginWithValidCredentialsReturnsToken() throws Exception {
        // Arrange
        User user = new User();
        user.setFirstName(FIRST_NAME);
        user.setLastName(LAST_NAME);
        user.setLogin(LOGIN);
        user.setPassword(PASSWORD);
        userService.register(user);

        LoginRequestDTO loginRequestDTO = new LoginRequestDTO();
        loginRequestDTO.setLogin(LOGIN);
        loginRequestDTO.setPassword(PASSWORD);

        // Act
        var result = mockMvc.perform(MockMvcRequestBuilders.post(LOGIN_URL)
                        .content(objectMapper.writeValueAsString(loginRequestDTO))
                        .contentType(MediaType.APPLICATION_JSON));

        // Assert
        result.andExpect(MockMvcResultMatchers.status().isOk());
    }

    @Test
    public void loginWithWrongPasswordReturnsUnauthorized() throws Exception {
        // Arrange
        User user = new User();
        user.setFirstName(FIRST_NAME);
        user.setLastName(LAST_NAME);
        user.setLogin(LOGIN);
        user.setPassword(PASSWORD);
        userService.register(user);

        LoginRequestDTO loginRequestDTO = new LoginRequestDTO();
        loginRequestDTO.setLogin(LOGIN);
        loginRequestDTO.setPassword("wrong-password");

        // Act
        var result = mockMvc.perform(MockMvcRequestBuilders.post(LOGIN_URL)
                        .content(objectMapper.writeValueAsString(loginRequestDTO))
                        .contentType(MediaType.APPLICATION_JSON));

        // Assert
        result.andExpect(MockMvcResultMatchers.status().isUnauthorized());
    }

    @Test
    public void studentsAreNotAccessibleWithoutAuthentication() throws Exception {
        // Arrange: no Authorization header is sent

        // Act
        var result = mockMvc.perform(MockMvcRequestBuilders.get("/api/students"));

        // Assert
        result.andExpect(MockMvcResultMatchers.status().isUnauthorized());
    }

    @Test
    public void studentCrudWorksWithValidToken() throws Exception {
        // Arrange
        String token = authenticateUser();
        StudentRequestDTO request = new StudentRequestDTO();
        request.setFirstName("Alice");
        request.setLastName("Martin");
        request.setEmail("alice@example.com");

        // Act: create the student
        MvcResult createResult = mockMvc.perform(MockMvcRequestBuilders.post("/api/students")
                        .header("Authorization", "Bearer " + token)
                        .content(objectMapper.writeValueAsString(request))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andReturn();
        long studentId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        // Assert: the created student can be fetched back with its email
        mockMvc.perform(MockMvcRequestBuilders.get("/api/students/{id}", studentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.email").value("alice@example.com"));

        // Act: update the student
        request.setEmail("alicia@example.com");

        // Assert: update succeeds
        mockMvc.perform(MockMvcRequestBuilders.put("/api/students/{id}", studentId)
                        .header("Authorization", "Bearer " + token)
                        .content(objectMapper.writeValueAsString(request))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk());

        // Act & Assert: delete the student
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/students/{id}", studentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(MockMvcResultMatchers.status().isNoContent());
    }

    private String authenticateUser() throws Exception {
        User user = new User();
        user.setFirstName(FIRST_NAME);
        user.setLastName(LAST_NAME);
        user.setLogin("student-test-user");
        user.setPassword(PASSWORD);
        userService.register(user);

        LoginRequestDTO loginRequestDTO = new LoginRequestDTO();
        loginRequestDTO.setLogin("student-test-user");
        loginRequestDTO.setPassword(PASSWORD);

        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.post(LOGIN_URL)
                        .content(objectMapper.writeValueAsString(loginRequestDTO))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();
        return result.getResponse().getContentAsString();
    }
}
