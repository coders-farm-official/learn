package com.codersfarm.subdomains.repository;

import com.codersfarm.subdomains.model.Subdomain;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface SubdomainRepository extends JpaRepository<Subdomain, Long> {

    Optional<Subdomain> findByHandle(String handle);

    Optional<Subdomain> findByUserId(Long userId);

    boolean existsByHandle(String handle);

    boolean existsByUserId(Long userId);

    List<Subdomain> findByLastSeenBefore(Instant cutoff);
}
