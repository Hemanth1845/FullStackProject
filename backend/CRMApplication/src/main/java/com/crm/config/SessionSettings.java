package com.crm.config;

import com.crm.model.Settings;
import com.crm.repository.SettingsRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

@Component
public class SessionSettings {

    @Autowired
    private SettingsRepository settingsRepository;

    // Default to 5 minutes (300,000 ms)
    private final long DEFAULT_TIMEOUT = 300000;

    public long getSessionTimeout() {
        try {
            Optional<Settings> settingsOpt = settingsRepository.findById(1L);
            if (settingsOpt.isPresent()) {
                String securitySettingsJson = settingsOpt.get().getSecuritySettings();
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> securityMap = mapper.readValue(securitySettingsJson, new TypeReference<>() {});
                
                Object timeoutObj = securityMap.get("sessionTimeout");
                if (timeoutObj != null) {
                    long timeoutInMinutes = Long.parseLong(String.valueOf(timeoutObj));
                    if (timeoutInMinutes > 0) {
                        return timeoutInMinutes * 60 * 1000; // Convert minutes to milliseconds
                    }
                }
            }
        } catch (Exception e) {
            // Log the error and fall back to default
            System.err.println("Could not parse session timeout from settings. Falling back to default. Error: " + e.getMessage());
        }
        return DEFAULT_TIMEOUT;
    }
}