package com.codersfarm.subdomains.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.email-from:noreply@codersfarm.com}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String to, String token, String baseUrl) {
        String link = baseUrl + "/auth/verify?token=" + token;
        send(to, "Verify your Coders Farm account",
             "Welcome to Coders Farm!\n\n" +
             "Please verify your email by clicking this link:\n" + link + "\n\n" +
             "If you didn't create this account, you can safely ignore this email.");
    }

    public void sendMagicLink(String to, String token, String baseUrl) {
        String link = baseUrl + "/auth/magic-login?token=" + token;
        send(to, "Your Coders Farm login link",
             "Click this link to log in to your Coders Farm account:\n" + link + "\n\n" +
             "This link expires in 15 minutes.\n\n" +
             "If you didn't request this, you can safely ignore this email.");
    }

    public void sendPasswordResetEmail(String to, String token, String baseUrl) {
        String link = baseUrl + "/auth/reset-password?token=" + token;
        send(to, "Reset your Coders Farm password",
             "Click this link to reset your password:\n" + link + "\n\n" +
             "This link expires in 1 hour.\n\n" +
             "If you didn't request this, you can safely ignore this email.");
    }

    public void sendStaleSubdomainWarning(String to, String handle) {
        send(to, "Your subdomain " + handle + ".codersfarm.com may be cleaned up",
             "Hi,\n\n" +
             "Your subdomain " + handle + ".codersfarm.com has been inactive for over 80 days. " +
             "If no activity is detected within the next 10 days, the subdomain and all associated " +
             "DNS records will be released.\n\n" +
             "To keep your subdomain, simply log in to your dashboard.\n\n" +
             "— Coders Farm");
    }

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Sent email to {} with subject: {}", to, subject);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
