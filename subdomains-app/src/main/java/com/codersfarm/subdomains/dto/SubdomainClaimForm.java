package com.codersfarm.subdomains.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class SubdomainClaimForm {

    @NotBlank(message = "Handle is required")
    @Size(min = 3, max = 32, message = "Handle must be between 3 and 32 characters")
    @Pattern(regexp = "^[a-z0-9]([a-z0-9-]*[a-z0-9])?$",
             message = "Handle can only contain lowercase letters, numbers, and hyphens (cannot start or end with a hyphen)")
    private String handle;

    private boolean acceptTos;

    public String getHandle() { return handle; }
    public void setHandle(String handle) { this.handle = handle; }

    public boolean isAcceptTos() { return acceptTos; }
    public void setAcceptTos(boolean acceptTos) { this.acceptTos = acceptTos; }
}
