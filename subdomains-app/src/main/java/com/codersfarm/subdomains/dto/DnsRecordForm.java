package com.codersfarm.subdomains.dto;

import com.codersfarm.subdomains.model.DnsRecordType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DnsRecordForm {

    private Long id;

    @NotNull(message = "Record type is required")
    private DnsRecordType recordType;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Value is required")
    private String value;

    @Min(value = 60, message = "TTL must be at least 60 seconds")
    @Max(value = 86400, message = "TTL cannot exceed 86400 seconds (24 hours)")
    private int ttl = 3600;

    @Min(value = 0, message = "Priority must be non-negative")
    @Max(value = 65535, message = "Priority cannot exceed 65535")
    private Integer priority;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DnsRecordType getRecordType() { return recordType; }
    public void setRecordType(DnsRecordType recordType) { this.recordType = recordType; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    public int getTtl() { return ttl; }
    public void setTtl(int ttl) { this.ttl = ttl; }

    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }
}
