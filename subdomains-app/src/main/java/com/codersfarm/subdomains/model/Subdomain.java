package com.codersfarm.subdomains.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "subdomains")
public class Subdomain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, unique = true, length = 32)
    private String handle;

    @Column(name = "full_domain", nullable = false)
    private String fullDomain;

    @Column(name = "cloudflare_zone_id")
    private String cloudflareZoneId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "last_seen", nullable = false)
    private Instant lastSeen = Instant.now();

    @OneToMany(mappedBy = "subdomain", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<DnsRecord> dnsRecords = new ArrayList<>();

    public Subdomain() {}

    public Subdomain(User user, String handle, String baseDomain) {
        this.user = user;
        this.handle = handle;
        this.fullDomain = handle + "." + baseDomain;
    }

    public void touch() {
        this.lastSeen = Instant.now();
    }

    // Getters and setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getHandle() { return handle; }
    public void setHandle(String handle) { this.handle = handle; }

    public String getFullDomain() { return fullDomain; }
    public void setFullDomain(String fullDomain) { this.fullDomain = fullDomain; }

    public String getCloudflareZoneId() { return cloudflareZoneId; }
    public void setCloudflareZoneId(String cloudflareZoneId) { this.cloudflareZoneId = cloudflareZoneId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getLastSeen() { return lastSeen; }
    public void setLastSeen(Instant lastSeen) { this.lastSeen = lastSeen; }

    public List<DnsRecord> getDnsRecords() { return dnsRecords; }
    public void setDnsRecords(List<DnsRecord> dnsRecords) { this.dnsRecords = dnsRecords; }
}
