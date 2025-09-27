package com.crm.repository;

import com.crm.model.SecureFile;
import com.crm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SecureFileRepository extends JpaRepository<SecureFile, Long> {
    List<SecureFile> findByUser(User user);
    Optional<SecureFile> findByIdAndUser(Long id, User user);
}