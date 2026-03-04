package com.codersfarm.subdomains.service;

import com.codersfarm.subdomains.model.DnsRecord;
import java.util.Optional;

/**
 * Interface for DNS provider operations.
 * The default implementation is a mock; swap to a real Cloudflare or GoDaddy
 * implementation when credentials are available.
 */
public interface CloudflareService {

    /**
     * Creates a DNS record in the provider and returns the provider's record ID.
     */
    String createRecord(String zoneDomain, DnsRecord record);

    /**
     * Updates an existing DNS record in the provider.
     */
    boolean updateRecord(String zoneDomain, String providerRecordId, DnsRecord record);

    /**
     * Deletes a DNS record from the provider.
     */
    boolean deleteRecord(String zoneDomain, String providerRecordId);

    /**
     * Checks the propagation status of a record.
     * Returns "active", "pending", or "error".
     */
    String checkPropagation(String zoneDomain, String providerRecordId);
}
