package com.codersfarm.subdomains.controller;

import com.codersfarm.subdomains.dto.SubdomainClaimForm;
import com.codersfarm.subdomains.model.User;
import com.codersfarm.subdomains.service.SubdomainService;
import com.codersfarm.subdomains.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/claim")
public class ClaimController {

    private final UserService userService;
    private final SubdomainService subdomainService;

    public ClaimController(UserService userService, SubdomainService subdomainService) {
        this.userService = userService;
        this.subdomainService = subdomainService;
    }

    @GetMapping
    public String claimPage(Authentication auth, Model model) {
        User user = getUser(auth);

        if (subdomainService.findByUser(user).isPresent()) {
            return "redirect:/dashboard";
        }

        model.addAttribute("form", new SubdomainClaimForm());
        model.addAttribute("baseDomain", subdomainService.getBaseDomain());
        return "claim/claim";
    }

    @PostMapping
    public String claim(Authentication auth,
                        @Valid @ModelAttribute("form") SubdomainClaimForm form,
                        BindingResult result,
                        Model model,
                        RedirectAttributes redirectAttrs) {
        if (!form.isAcceptTos()) {
            result.rejectValue("acceptTos", "required", "You must accept the Terms of Service");
        }
        if (result.hasErrors()) {
            model.addAttribute("baseDomain", subdomainService.getBaseDomain());
            return "claim/claim";
        }

        User user = getUser(auth);

        try {
            subdomainService.claim(user, form.getHandle());
            redirectAttrs.addFlashAttribute("success",
                    "Your subdomain " + form.getHandle() + "." + subdomainService.getBaseDomain() +
                    " is live! Welcome to DNS.");
            return "redirect:/dashboard";
        } catch (Exception e) {
            result.rejectValue("handle", "error", e.getMessage());
            model.addAttribute("baseDomain", subdomainService.getBaseDomain());
            return "claim/claim";
        }
    }

    private User getUser(Authentication auth) {
        return userService.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }
}
