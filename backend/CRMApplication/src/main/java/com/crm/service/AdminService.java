package com.crm.service;

import com.crm.model.CustomerCampaign;
import com.crm.model.EmailCampaign;
import com.crm.model.Interaction;
import com.crm.model.Settings;
import com.crm.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Map;

public interface AdminService {
    Page<User> getAllCustomers(Pageable pageable);
    User addCustomer(User customer);
    User updateCustomer(Long id, User customerDetails);
    void deleteCustomer(Long id);
    Page<User> getPendingCustomers(Pageable pageable);
    User approveCustomer(Long customerId);
    void rejectCustomer(Long customerId);
    Map<String, Object> getAdminAnalytics();
    Page<EmailCampaign> getAllCampaigns(Pageable pageable);
    EmailCampaign createCampaign(EmailCampaign campaign);
    EmailCampaign updateCampaign(Long id, EmailCampaign campaignDetails);
    void deleteCampaign(Long id);
    List<CustomerCampaign> getPendingCampaigns();
    CustomerCampaign updateCustomerCampaignStatus(Long campaignId, String status);
    User getAdminProfile(String username);
    User updateAdminProfile(String username, User userDetails);
    void changeAdminPassword(String username, Map<String, String> passwordData);
    Settings getSystemSettings();
    Settings updateSystemSettings(Settings settings);
    Page<Interaction> getPendingInteractions(Pageable pageable);
    Interaction updateInteractionStatus(Long interactionId, String status);
}

