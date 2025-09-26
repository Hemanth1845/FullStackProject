package com.crm.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**") // Apply to all API endpoints
                        .allowedOrigins("http://localhost:4000") // Allow your frontend's origin
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allow all common methods
                        .allowedHeaders("*") // Allow all headers
                        .allowCredentials(true); // Allow cookies and credentials
            }
        };
    }
}