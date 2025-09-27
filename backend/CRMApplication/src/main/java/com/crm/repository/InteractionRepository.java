package com.crm.repository;

import com.crm.model.Interaction;
import com.crm.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface InteractionRepository extends JpaRepository<Interaction, Long> {

    Page<Interaction> findByCustomer(User customer, Pageable pageable);
    Page<Interaction> findByCustomerAndType(User customer, String type, Pageable pageable);
    long countByCustomer(User customer);

    @Query("SELECT i FROM Interaction i WHERE i.customer = :customer AND (i.subject LIKE %:searchTerm% OR i.notes LIKE %:searchTerm%)")
    Page<Interaction> findByCustomerContaining(@Param("customer") User customer, @Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT i FROM Interaction i WHERE i.customer = :customer AND i.type = :type AND (i.subject LIKE %:searchTerm% OR i.notes LIKE %:searchTerm%)")
    Page<Interaction> findByCustomerAndTypeContaining(@Param("customer") User customer, @Param("type") String type, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT i.type as type, COUNT(i) as count FROM Interaction i WHERE i.customer = :customer GROUP BY i.type")
    List<Map<String, Object>> countInteractionsByType(@Param("customer") User customer);

    @Query("SELECT FUNCTION('DATE', i.date), COUNT(i) FROM Interaction i WHERE i.customer = :customer AND i.date >= :startDate GROUP BY FUNCTION('DATE', i.date) ORDER BY FUNCTION('DATE', i.date) ASC")
    List<Object[]> countInteractionsPerDay(@Param("customer") User customer, @Param("startDate") LocalDateTime startDate);

    Page<Interaction> findByAdminStatus(String adminStatus, Pageable pageable);

    @Modifying
    @Query("DELETE FROM Interaction i WHERE i.customer.id = :customerId")
    void deleteByCustomerId(@Param("customerId") Long customerId);
    
    // NEW METHOD FOR CALENDAR
    List<Interaction> findByCustomerAndDateBetween(User customer, LocalDateTime start, LocalDateTime end);
}