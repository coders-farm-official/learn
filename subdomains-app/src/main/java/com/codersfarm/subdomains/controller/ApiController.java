package com.codersfarm.subdomains.controller;

import com.codersfarm.subdomains.service.SubdomainService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {

    private final SubdomainService subdomainService;

    public ApiController(SubdomainService subdomainService) {
        this.subdomainService = subdomainService;
    }

    @GetMapping("/subdomains/check/{handle}")
    public ResponseEntity<Map<String, Object>> checkAvailability(@PathVariable String handle) {
        boolean available = subdomainService.isAvailable(handle);
        String fullDomain = handle.toLowerCase() + "." + subdomainService.getBaseDomain();
        return ResponseEntity.ok(Map.of(
                "handle", handle.toLowerCase(),
                "available", available,
                "fullDomain", fullDomain
        ));
    }
}
