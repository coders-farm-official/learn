package com.codersfarm.subdomains.service;

import com.codersfarm.subdomains.model.Subdomain;
import com.codersfarm.subdomains.model.User;
import com.codersfarm.subdomains.repository.SubdomainRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class SubdomainService {

    private final SubdomainRepository subdomainRepository;
    private final ReservedNameService reservedNameService;

    @Value("${app.base-domain:codersfarm.com}")
    private String baseDomain;

    public SubdomainService(SubdomainRepository subdomainRepository,
                            ReservedNameService reservedNameService) {
        this.subdomainRepository = subdomainRepository;
        this.reservedNameService = reservedNameService;
    }

    public boolean isAvailable(String handle) {
        String normalized = handle.toLowerCase().trim();
        if (reservedNameService.isReserved(normalized)) return false;
        return !subdomainRepository.existsByHandle(normalized);
    }

    @Transactional
    public Subdomain claim(User user, String handle) {
        String normalized = handle.toLowerCase().trim();

        if (subdomainRepository.existsByUserId(user.getId())) {
            throw new IllegalStateException("You already have a subdomain. One subdomain per account in v1.");
        }
        if (!isAvailable(normalized)) {
            throw new IllegalArgumentException("Handle '" + normalized + "' is not available");
        }

        Subdomain subdomain = new Subdomain(user, normalized, baseDomain);
        return subdomainRepository.save(subdomain);
    }

    public Optional<Subdomain> findByUser(User user) {
        return subdomainRepository.findByUserId(user.getId());
    }

    public Optional<Subdomain> findByHandle(String handle) {
        return subdomainRepository.findByHandle(handle.toLowerCase());
    }

    @Transactional
    public void touch(Subdomain subdomain) {
        subdomain.touch();
        subdomainRepository.save(subdomain);
    }

    @Transactional
    public void delete(Subdomain subdomain) {
        subdomainRepository.delete(subdomain);
    }

    public String getBaseDomain() {
        return baseDomain;
    }
}
