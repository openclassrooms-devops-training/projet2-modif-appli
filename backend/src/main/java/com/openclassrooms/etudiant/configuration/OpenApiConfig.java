package com.openclassrooms.etudiant.configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI etudiantBibliothequeOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("EtuBibliothèque API")
                        .version("1.0.0")
                        .description("API de gestion des agents et des étudiants abonnés à la bibliothèque.")
                        .contact(new Contact().name("Équipe EtuBibliothèque")));
    }
}