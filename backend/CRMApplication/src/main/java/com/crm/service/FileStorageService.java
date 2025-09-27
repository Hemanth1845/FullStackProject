package com.crm.service;

import com.crm.dto.SecureFileDTO;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface FileStorageService {

    void uploadFile(MultipartFile file, String pin) throws Exception;

    Resource downloadFile(Long fileId, String pin) throws Exception;

    List<SecureFileDTO> getFilesForUser();

    void deleteFile(Long fileId, String pin) throws Exception;
    
    void resetPin(String oldPin, String newPin) throws Exception;
}