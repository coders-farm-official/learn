package com.codersfarm.subdomains.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AbuseReportForm {

    @NotBlank(message = "Subdomain handle is required")
    private String subdomainHandle;

    private String reporterContact;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;

    public String getSubdomainHandle() { return subdomainHandle; }
    public void setSubdomainHandle(String subdomainHandle) { this.subdomainHandle = subdomainHandle; }

    public String getReporterContact() { return reporterContact; }
    public void setReporterContact(String reporterContact) { this.reporterContact = reporterContact; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
