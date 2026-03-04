package com.codersfarm.subdomains.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;

@Service
public class ReservedNameService {

    private static final Logger log = LoggerFactory.getLogger(ReservedNameService.class);
    private final Set<String> reservedNames = new HashSet<>();

    @PostConstruct
    public void loadReservedNames() {
        try {
            var resource = new ClassPathResource("reserved-names.txt");
            try (var reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim().toLowerCase();
                    if (!line.isEmpty() && !line.startsWith("#")) {
                        reservedNames.add(line);
                    }
                }
            }
            log.info("Loaded {} reserved subdomain names", reservedNames.size());
        } catch (Exception e) {
            log.warn("Could not load reserved-names.txt, using built-in defaults", e);
            loadDefaults();
        }
    }

    private void loadDefaults() {
        reservedNames.addAll(Set.of(
            "www", "mail", "ftp", "admin", "root", "api", "app", "blog",
            "cdn", "dev", "docs", "help", "info", "login", "ns1", "ns2",
            "pop", "smtp", "ssh", "ssl", "test", "webmail", "imap",
            "support", "status", "staging", "demo", "beta", "alpha",
            "portal", "dashboard", "panel", "manage", "console"
        ));
    }

    public boolean isReserved(String handle) {
        return reservedNames.contains(handle.toLowerCase());
    }

    public int getReservedCount() {
        return reservedNames.size();
    }
}
