package com.codersfarm.subdomains.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "dns_records")
public class DnsRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subdomain_id", nullable = false)
    private Subdomain subdomain;

    @Enumerated(EnumType.STRING)
    @Column(name = "record_type", nullable = false, length = 10)
    private DnsRecordType recordType;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 1024)
    private String value;

    @Column(nullable = false)
    private int ttl = 3600;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "cloudflare_record_id")
    private String cloudflareRecordId;

    @Column(name = "propagation_status", length = 20)
    private String propagationStatus = "pending";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public DnsRecord() {}

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Subdomain getSubdomain() { return subdomain; }
    public void setSubdomain(Subdomain subdomain) { this.subdomain = subdomain; }

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

    public String getCloudflareRecordId() { return cloudflareRecordId; }
    public void setCloudflareRecordId(String cloudflareRecordId) { this.cloudflareRecordId = cloudflareRecordId; }

    public String getPropagationStatus() { return propagationStatus; }
    public void setPropagationStatus(String propagationStatus) { this.propagationStatus = propagationStatus; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String toZoneLine() {
        String ttlStr = String.valueOf(ttl);
        if (recordType == DnsRecordType.MX && priority != null) {
            return String.format("%-30s %6s IN  %-5s %d %s", name, ttlStr, recordType.getCode(), priority, value);
        }
        return String.format("%-30s %6s IN  %-5s %s", name, ttlStr, recordType.getCode(), value);
    }
}
