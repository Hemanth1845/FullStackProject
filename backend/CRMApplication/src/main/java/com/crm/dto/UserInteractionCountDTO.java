package com.crm.dto;

public class UserInteractionCountDTO {
    private String username;
    private long interactionCount;

    public UserInteractionCountDTO(String username, long interactionCount) {
        this.username = username;
        this.interactionCount = interactionCount;
    }

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public long getInteractionCount() { return interactionCount; }
    public void setInteractionCount(long interactionCount) { this.interactionCount = interactionCount; }
}