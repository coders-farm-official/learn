package com.codersfarm.subdomains;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SubdomainsApplication {

    public static void main(String[] args) {
        SpringApplication.run(SubdomainsApplication.class, args);
    }
}
