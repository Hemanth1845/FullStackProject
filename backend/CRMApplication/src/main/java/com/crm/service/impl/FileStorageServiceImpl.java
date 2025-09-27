package com.crm.service.impl;

import com.crm.dto.SecureFileDTO;
import com.crm.exception.ResourceNotFoundException;
import com.crm.model.SecureFile;
import com.crm.model.User;
import com.crm.repository.SecureFileRepository;
import com.crm.repository.UserRepository;
import com.crm.service.FileStorageService;
import com.crm.util.CryptoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path fileStorageLocation;
    
    @Autowired
    private SecureFileRepository secureFileRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    public FileStorageServiceImpl(@Value("${file.upload-dir}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }
    
    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public void uploadFile(MultipartFile file, String pin) throws Exception {
        User currentUser = getCurrentUser();
        
        // Encrypt the file content with the user's PIN
        byte[] encryptedData = CryptoUtil.encrypt(pin, file.getBytes());

        // Generate a unique filename to prevent collisions
        String storedFileName = UUID.randomUUID().toString() + "-" + file.getOriginalFilename() + ".enc";
        Path targetLocation = this.fileStorageLocation.resolve(storedFileName);

        // Save the encrypted file to disk
        Files.write(targetLocation, encryptedData);

        // Save file metadata to the database
        SecureFile secureFile = new SecureFile();
        secureFile.setUser(currentUser);
        secureFile.setFileName(file.getOriginalFilename());
        secureFile.setFileType(file.getContentType());
        secureFile.setStoredFileName(storedFileName);
        secureFile.setPinHash(passwordEncoder.encode(pin)); // Store a hash of the PIN
        secureFileRepository.save(secureFile);
    }

    @Override
    public Resource downloadFile(Long fileId, String pin) throws Exception {
        User currentUser = getCurrentUser();
        SecureFile secureFile = secureFileRepository.findByIdAndUser(fileId, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("File not found or access denied."));
        
        // Verify the provided PIN against the stored hash
        if (!passwordEncoder.matches(pin, secureFile.getPinHash())) {
            throw new SecurityException("Incorrect PIN.");
        }

        // Read the encrypted file from disk
        Path filePath = this.fileStorageLocation.resolve(secureFile.getStoredFileName()).normalize();
        byte[] encryptedData = Files.readAllBytes(filePath);

        // Decrypt the file content
        byte[] decryptedData = CryptoUtil.decrypt(pin, encryptedData);
        
        // Create a temporary file to serve the decrypted content
        Path tempFile = Files.createTempFile("decrypted-", secureFile.getFileName());
        Files.write(tempFile, decryptedData);
        
        Resource resource = new UrlResource(tempFile.toUri());
        if (resource.exists()) {
            return resource;
        } else {
            throw new RuntimeException("File not found " + secureFile.getFileName());
        }
    }

    @Override
    public List<SecureFileDTO> getFilesForUser() {
        User currentUser = getCurrentUser();
        return secureFileRepository.findByUser(currentUser)
                .stream()
                .map(file -> new SecureFileDTO(file.getId(), file.getFileName(), file.getFileType(), file.getCreatedAt()))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteFile(Long fileId, String pin) throws Exception {
        User currentUser = getCurrentUser();
        SecureFile secureFile = secureFileRepository.findByIdAndUser(fileId, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("File not found or access denied."));
                
        if (!passwordEncoder.matches(pin, secureFile.getPinHash())) {
            throw new SecurityException("Incorrect PIN.");
        }

        // Delete file from disk
        Path filePath = this.fileStorageLocation.resolve(secureFile.getStoredFileName()).normalize();
        Files.deleteIfExists(filePath);

        // Delete record from database
        secureFileRepository.delete(secureFile);
    }
    
    @Override
    public void resetPin(String oldPin, String newPin) throws Exception {
        User currentUser = getCurrentUser();
        List<SecureFile> files = secureFileRepository.findByUser(currentUser);

        if (files.isEmpty() || !passwordEncoder.matches(oldPin, files.get(0).getPinHash())) {
            throw new SecurityException("Incorrect old PIN or no files found.");
        }

        for (SecureFile file : files) {
            // Re-encrypt each file with the new PIN
            Path filePath = this.fileStorageLocation.resolve(file.getStoredFileName()).normalize();
            byte[] encryptedData = Files.readAllBytes(filePath);
            byte[] decryptedData = CryptoUtil.decrypt(oldPin, encryptedData);
            byte[] reEncryptedData = CryptoUtil.encrypt(newPin, decryptedData);
            Files.write(filePath, reEncryptedData);

            // Update the PIN hash in the database
            file.setPinHash(passwordEncoder.encode(newPin));
            secureFileRepository.save(file);
        }
    }
}
