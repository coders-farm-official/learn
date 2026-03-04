package com.codersfarm.subdomains.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "abuse_reports")
public class AbuseReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "subdomain_handle", nullable = false)
    private String subdomainHandle;

    @Column(name = "reporter_contact")
    private String reporterContact;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private Instant submittedAt = Instant.now();

    @Column(nullable = false, length = 20)
    private String status = "open";

    @Column(name = "admin_notes", length = 2000)
    private String adminNotes;

    public AbuseReport() {}

    // Getters and setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSubdomainHandle() { return subdomainHandle; }
    public void setSubdomainHandle(String subdomainHandle) { this.subdomainHandle = subdomainHandle; }

    public String getReporterContact() { return reporterContact; }
    public void setReporterContact(String reporterContact) { this.reporterContact = reporterContact; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
}
