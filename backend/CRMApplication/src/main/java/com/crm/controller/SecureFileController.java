package com.crm.controller;

import com.crm.dto.SecureFileDTO;
import com.crm.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class SecureFileController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam("pin") String pin) {
        try {
            fileStorageService.uploadFile(file, pin);
            return ResponseEntity.ok("File uploaded successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to upload file: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<SecureFileDTO>> getUserFiles() {
        return ResponseEntity.ok(fileStorageService.getFilesForUser());
    }

    @PostMapping("/download/{fileId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long fileId, @RequestBody Map<String, String> payload) {
        try {
            String pin = payload.get("pin");
            Resource resource = fileStorageService.downloadFile(fileId, pin);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(401).build(); 
        }
    }
}