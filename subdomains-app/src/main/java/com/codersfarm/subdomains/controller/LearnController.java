package com.codersfarm.subdomains.controller;

import com.codersfarm.subdomains.model.CurriculumProgress;
import com.codersfarm.subdomains.model.User;
import com.codersfarm.subdomains.repository.CurriculumProgressRepository;
import com.codersfarm.subdomains.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/learn")
public class LearnController {

    private static final List<Map<String, String>> LESSONS = List.of(
            Map.of("id", "what-is-dns", "title", "What is DNS?",
                   "summary", "DNS is the phonebook of the internet — it translates human-readable domain names into IP addresses."),
            Map.of("id", "a-records", "title", "A Records — IPv4 Addresses",
                   "summary", "An A record maps a domain name to an IPv4 address. It's the most fundamental DNS record type."),
            Map.of("id", "aaaa-records", "title", "AAAA Records — IPv6 Addresses",
                   "summary", "AAAA records work just like A records, but for the newer IPv6 address format."),
            Map.of("id", "cname-records", "title", "CNAME Records — Aliases",
                   "summary", "A CNAME record points one domain name to another, creating an alias."),
            Map.of("id", "txt-records", "title", "TXT Records — Text Data",
                   "summary", "TXT records store arbitrary text. They're used for verification, email security (SPF/DKIM/DMARC), and more."),
            Map.of("id", "mx-records", "title", "MX Records — Mail Routing",
                   "summary", "MX records tell the internet where to deliver email for your domain."),
            Map.of("id", "ttl", "title", "TTL — Time to Live",
                   "summary", "TTL controls how long DNS resolvers cache your records before checking for updates."),
            Map.of("id", "propagation", "title", "DNS Propagation",
                   "summary", "When you change a DNS record, the change doesn't happen instantly — it propagates across the internet.")
    );

    private final UserService userService;
    private final CurriculumProgressRepository progressRepository;

    public LearnController(UserService userService,
                           CurriculumProgressRepository progressRepository) {
        this.userService = userService;
        this.progressRepository = progressRepository;
    }

    @GetMapping
    public String curriculum(Authentication auth, Model model) {
        model.addAttribute("lessons", LESSONS);

        if (auth != null) {
            User user = getUser(auth);
            Set<String> completed = progressRepository.findByUserId(user.getId()).stream()
                    .filter(CurriculumProgress::isCompleted)
                    .map(CurriculumProgress::getLessonId)
                    .collect(Collectors.toSet());
            model.addAttribute("completedLessons", completed);
            model.addAttribute("totalLessons", LESSONS.size());
            model.addAttribute("completedCount", completed.size());
        }

        return "learn/curriculum";
    }

    @PostMapping("/complete/{lessonId}")
    public String completeLesson(@PathVariable String lessonId,
                                  Authentication auth,
                                  RedirectAttributes redirectAttrs) {
        User user = getUser(auth);

        progressRepository.findByUserIdAndLessonId(user.getId(), lessonId)
                .ifPresentOrElse(
                        progress -> {
                            if (!progress.isCompleted()) {
                                progress.markCompleted();
                                progressRepository.save(progress);
                            }
                        },
                        () -> {
                            CurriculumProgress progress = new CurriculumProgress(user, lessonId);
                            progress.markCompleted();
                            progressRepository.save(progress);
                        }
                );

        return "redirect:/learn";
    }

    private User getUser(Authentication auth) {
        return userService.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }
}
