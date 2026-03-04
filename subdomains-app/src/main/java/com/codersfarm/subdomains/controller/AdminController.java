package com.codersfarm.subdomains.controller;

import com.codersfarm.subdomains.dto.AbuseReportForm;
import com.codersfarm.subdomains.model.AbuseReport;
import com.codersfarm.subdomains.repository.AbuseReportRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
public class AdminController {

    private final AbuseReportRepository abuseReportRepository;

    public AdminController(AbuseReportRepository abuseReportRepository) {
        this.abuseReportRepository = abuseReportRepository;
    }

    // Public abuse report form
    @GetMapping("/abuse/report")
    public String reportForm(Model model) {
        model.addAttribute("form", new AbuseReportForm());
        return "abuse-report";
    }

    @PostMapping("/abuse/report")
    public String submitReport(@Valid @ModelAttribute("form") AbuseReportForm form,
                                BindingResult result,
                                RedirectAttributes redirectAttrs) {
        if (result.hasErrors()) {
            return "abuse-report";
        }

        AbuseReport report = new AbuseReport();
        report.setSubdomainHandle(form.getSubdomainHandle().toLowerCase().trim());
        report.setReporterContact(form.getReporterContact());
        report.setDescription(form.getDescription());
        abuseReportRepository.save(report);

        redirectAttrs.addFlashAttribute("message", "Thank you. Your report has been submitted.");
        return "redirect:/abuse/report";
    }

    // Admin views
    @GetMapping("/admin/abuse-reports")
    public String abuseReports(@RequestParam(required = false, defaultValue = "all") String filter,
                                Model model) {
        List<AbuseReport> reports;
        if ("all".equals(filter)) {
            reports = abuseReportRepository.findAllByOrderBySubmittedAtDesc();
        } else {
            reports = abuseReportRepository.findByStatusOrderBySubmittedAtDesc(filter);
        }
        model.addAttribute("reports", reports);
        model.addAttribute("currentFilter", filter);
        return "admin/abuse-reports";
    }

    @PostMapping("/admin/abuse-reports/{id}/update")
    public String updateReportStatus(@PathVariable Long id,
                                      @RequestParam String status,
                                      @RequestParam(required = false) String adminNotes,
                                      RedirectAttributes redirectAttrs) {
        abuseReportRepository.findById(id).ifPresent(report -> {
            report.setStatus(status);
            if (adminNotes != null && !adminNotes.isBlank()) {
                report.setAdminNotes(adminNotes);
            }
            abuseReportRepository.save(report);
        });
        redirectAttrs.addFlashAttribute("success", "Report updated");
        return "redirect:/admin/abuse-reports";
    }
}
