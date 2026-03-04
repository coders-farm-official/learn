package com.codersfarm.subdomains.repository;

import com.codersfarm.subdomains.model.DnsRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DnsRecordRepository extends JpaRepository<DnsRecord, Long> {

    List<DnsRecord> findBySubdomainIdOrderByCreatedAtAsc(Long subdomainId);

    int countBySubdomainId(Long subdomainId);

    void deleteBySubdomainId(Long subdomainId);
}
