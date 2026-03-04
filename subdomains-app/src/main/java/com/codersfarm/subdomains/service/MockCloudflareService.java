package com.codersfarm.subdomains.service;

import com.codersfarm.subdomains.model.DnsRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Mock implementation of CloudflareService for development.
 * Simulates DNS provider API calls with deterministic responses.
 */
@Service
public class MockCloudflareService implements CloudflareService {

    private static final Logger log = LoggerFactory.getLogger(MockCloudflareService.class);

    @Override
    public String createRecord(String zoneDomain, DnsRecord record) {
        String mockId = "mock-" + UUID.randomUUID().toString().substring(0, 8);
        log.info("[MOCK DNS] Created {} record '{}' -> '{}' on {} (id: {})",
                record.getRecordType(), record.getName(), record.getValue(), zoneDomain, mockId);
        return mockId;
    }

    @Override
    public boolean updateRecord(String zoneDomain, String providerRecordId, DnsRecord record) {
        log.info("[MOCK DNS] Updated record {} on {}: {} -> '{}'",
                providerRecordId, zoneDomain, record.getRecordType(), record.getValue());
        return true;
    }

    @Override
    public boolean deleteRecord(String zoneDomain, String providerRecordId) {
        log.info("[MOCK DNS] Deleted record {} on {}", providerRecordId, zoneDomain);
        return true;
    }

    @Override
    public String checkPropagation(String zoneDomain, String providerRecordId) {
        return "active";
    }
}
