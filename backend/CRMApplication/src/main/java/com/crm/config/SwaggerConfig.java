package com.crm.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI crmOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CRM Application MANAGEMENT")
                        .description("Spring Boot REST API for the Customer Relationship Management application.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Developer Team")
                                .email("support@crmproject.com")
                                .url("https://github.com/your-repo"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://springdoc.org")));
    }
}
