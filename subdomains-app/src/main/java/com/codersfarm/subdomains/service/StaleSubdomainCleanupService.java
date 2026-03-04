package com.codersfarm.subdomains.service;

import com.codersfarm.subdomains.model.Subdomain;
import com.codersfarm.subdomains.repository.DnsRecordRepository;
import com.codersfarm.subdomains.repository.SubdomainRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class StaleSubdomainCleanupService {

    private static final Logger log = LoggerFactory.getLogger(StaleSubdomainCleanupService.class);

    private final SubdomainRepository subdomainRepository;
    private final DnsRecordRepository dnsRecordRepository;
    private final EmailService emailService;

    @Value("${app.stale-days:90}")
    private int staleDays;

    public StaleSubdomainCleanupService(SubdomainRepository subdomainRepository,
                                         DnsRecordRepository dnsRecordRepository,
                                         EmailService emailService) {
        this.subdomainRepository = subdomainRepository;
        this.dnsRecordRepository = dnsRecordRepository;
        this.emailService = emailService;
    }

    // Run daily at 3 AM
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupStaleSubdomains() {
        Instant warningCutoff = Instant.now().minus(staleDays - 10, ChronoUnit.DAYS);
        Instant deletionCutoff = Instant.now().minus(staleDays, ChronoUnit.DAYS);

        // Send warnings for subdomains approaching stale threshold
        List<Subdomain> aboutToExpire = subdomainRepository.findByLastSeenBefore(warningCutoff);
        for (Subdomain sub : aboutToExpire) {
            if (sub.getLastSeen().isAfter(deletionCutoff)) {
                try {
                    emailService.sendStaleSubdomainWarning(
                            sub.getUser().getEmail(), sub.getHandle());
                } catch (Exception e) {
                    log.warn("Failed to send stale warning for {}", sub.getHandle(), e);
                }
            }
        }

        // Delete subdomains past the threshold
        List<Subdomain> stale = subdomainRepository.findByLastSeenBefore(deletionCutoff);
        for (Subdomain sub : stale) {
            log.info("Cleaning up stale subdomain: {} (last seen: {})", sub.getHandle(), sub.getLastSeen());
            dnsRecordRepository.deleteBySubdomainId(sub.getId());
            subdomainRepository.delete(sub);
        }

        if (!stale.isEmpty()) {
            log.info("Cleaned up {} stale subdomains", stale.size());
        }
    }
}
