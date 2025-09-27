package com.crm.dto;

import java.time.LocalDateTime;

public class SecureFileDTO {
    private Long id;
    private String fileName;
    private String fileType;
    private LocalDateTime createdAt;

    public SecureFileDTO(Long id, String fileName, String fileType, LocalDateTime createdAt) {
        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}