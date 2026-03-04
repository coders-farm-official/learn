package com.codersfarm.subdomains.controller;

import com.codersfarm.subdomains.dto.DnsRecordForm;
import com.codersfarm.subdomains.model.DnsRecord;
import com.codersfarm.subdomains.model.DnsRecordType;
import com.codersfarm.subdomains.model.Subdomain;
import com.codersfarm.subdomains.model.User;
import com.codersfarm.subdomains.service.DnsRecordService;
import com.codersfarm.subdomains.service.SubdomainService;
import com.codersfarm.subdomains.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/dashboard")
public class DashboardController {

    private final UserService userService;
    private final SubdomainService subdomainService;
    private final DnsRecordService dnsRecordService;

    public DashboardController(UserService userService,
                                SubdomainService subdomainService,
                                DnsRecordService dnsRecordService) {
        this.userService = userService;
        this.subdomainService = subdomainService;
        this.dnsRecordService = dnsRecordService;
    }

    @GetMapping
    public String dashboard(Authentication auth, Model model) {
        User user = getUser(auth);
        Optional<Subdomain> subOpt = subdomainService.findByUser(user);

        if (subOpt.isEmpty()) {
            return "redirect:/claim";
        }

        Subdomain subdomain = subOpt.get();
        List<DnsRecord> records = dnsRecordService.getRecords(subdomain);

        model.addAttribute("subdomain", subdomain);
        model.addAttribute("records", records);
        model.addAttribute("recordTypes", DnsRecordType.values());
        model.addAttribute("recordForm", new DnsRecordForm());
        model.addAttribute("baseDomain", subdomainService.getBaseDomain());

        return "dashboard/home";
    }

    @PostMapping("/records/add")
    public String addRecord(Authentication auth,
                            @Valid @ModelAttribute("recordForm") DnsRecordForm form,
                            BindingResult result,
                            RedirectAttributes redirectAttrs) {
        if (result.hasErrors()) {
            redirectAttrs.addFlashAttribute("error", "Please fix the form errors");
            return "redirect:/dashboard";
        }

        User user = getUser(auth);
        Subdomain subdomain = subdomainService.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("No subdomain found"));

        try {
            dnsRecordService.addRecord(subdomain, form);
            redirectAttrs.addFlashAttribute("success", "DNS record added! Propagation may take a few minutes.");
        } catch (Exception e) {
            redirectAttrs.addFlashAttribute("error", e.getMessage());
        }

        return "redirect:/dashboard";
    }

    @GetMapping("/records/{id}/edit")
    public String editRecordPage(@PathVariable Long id,
                                  Authentication auth,
                                  Model model,
                                  RedirectAttributes redirectAttrs) {
        User user = getUser(auth);
        Subdomain subdomain = subdomainService.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("No subdomain found"));

        Optional<DnsRecord> recordOpt = dnsRecordService.findById(id);
        if (recordOpt.isEmpty() || !recordOpt.get().getSubdomain().getId().equals(subdomain.getId())) {
            redirectAttrs.addFlashAttribute("error", "Record not found");
            return "redirect:/dashboard";
        }

        DnsRecord record = recordOpt.get();
        DnsRecordForm form = new DnsRecordForm();
        form.setId(record.getId());
        form.setRecordType(record.getRecordType());
        form.setName(record.getName());
        form.setValue(record.getValue());
        form.setTtl(record.getTtl());
        form.setPriority(record.getPriority());

        model.addAttribute("subdomain", subdomain);
        model.addAttribute("recordForm", form);
        model.addAttribute("recordTypes", DnsRecordType.values());
        model.addAttribute("editing", true);

        return "dashboard/edit-record";
    }

    @PostMapping("/records/{id}/edit")
    public String updateRecord(@PathVariable Long id,
                                Authentication auth,
                                @Valid @ModelAttribute("recordForm") DnsRecordForm form,
                                BindingResult result,
                                RedirectAttributes redirectAttrs) {
        if (result.hasErrors()) {
            redirectAttrs.addFlashAttribute("error", "Please fix the form errors");
            return "redirect:/dashboard/records/" + id + "/edit";
        }

        User user = getUser(auth);
        Subdomain subdomain = subdomainService.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("No subdomain found"));

        try {
            dnsRecordService.updateRecord(subdomain, id, form);
            redirectAttrs.addFlashAttribute("success", "DNS record updated!");
        } catch (Exception e) {
            redirectAttrs.addFlashAttribute("error", e.getMessage());
        }

        return "redirect:/dashboard";
    }

    @PostMapping("/records/{id}/delete")
    public String deleteRecord(@PathVariable Long id,
                                Authentication auth,
                                RedirectAttributes redirectAttrs) {
        User user = getUser(auth);
        Subdomain subdomain = subdomainService.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("No subdomain found"));

        try {
            dnsRecordService.deleteRecord(subdomain, id);
            redirectAttrs.addFlashAttribute("success", "DNS record deleted");
        } catch (Exception e) {
            redirectAttrs.addFlashAttribute("error", e.getMessage());
        }

        return "redirect:/dashboard";
    }

    @GetMapping("/raw-zone")
    public String rawZone(Authentication auth, Model model) {
        User user = getUser(auth);
        Subdomain subdomain = subdomainService.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("No subdomain found"));

        String zoneFile = dnsRecordService.generateZoneFile(subdomain);
        model.addAttribute("subdomain", subdomain);
        model.addAttribute("zoneFile", zoneFile);

        return "dashboard/raw-zone";
    }

    @PostMapping("/delete-account")
    public String deleteAccount(Authentication auth, RedirectAttributes redirectAttrs) {
        User user = getUser(auth);
        userService.deleteAccount(user.getId());
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
        redirectAttrs.addFlashAttribute("message", "Your account and all data have been deleted.");
        return "redirect:/auth/login";
    }

    private User getUser(Authentication auth) {
        return userService.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }
}
