package com.crm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Interaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;
    
    private String type; // e.g., 'call', 'email', 'meeting'
    private String subject;
    private LocalDateTime date;

    // MODIFIED: Replaced 'status' with two new fields
    private String adminStatus; // e.g., 'PENDING', 'COMPLETED'
    private String customerStatus; // e.g., 'PENDING', 'COMPLETED', 'NOT_COMPLETED'
    
    @Lob
    private String notes;

    public Interaction() {
    }

    public Interaction(User customer, String type, String subject, LocalDateTime date, String adminStatus, String customerStatus, String notes) {
        this.customer = customer;
        this.type = type;
        this.subject = subject;
        this.date = date;
        this.adminStatus = adminStatus;
        this.customerStatus = customerStatus;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    // New Getters and Setters for status fields
    public String getAdminStatus() { return adminStatus; }
    public void setAdminStatus(String adminStatus) { this.adminStatus = adminStatus; }
    public String getCustomerStatus() { return customerStatus; }
    public void setCustomerStatus(String customerStatus) { this.customerStatus = customerStatus; }
}