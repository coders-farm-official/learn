package com.codersfarm.subdomains.controller;

import com.codersfarm.subdomains.dto.RegistrationForm;
import com.codersfarm.subdomains.model.User;
import com.codersfarm.subdomains.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Optional;

@Controller
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserService userService,
                          AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
    }

    @GetMapping("/login")
    public String loginPage(@RequestParam(required = false) String error,
                            @RequestParam(required = false) String logout,
                            Model model) {
        if (error != null) model.addAttribute("error", "Invalid email or password");
        if (logout != null) model.addAttribute("message", "You have been logged out");
        return "auth/login";
    }

    @GetMapping("/register")
    public String registerPage(Model model) {
        model.addAttribute("form", new RegistrationForm());
        return "auth/register";
    }

    @PostMapping("/register")
    public String register(@Valid @ModelAttribute("form") RegistrationForm form,
                           BindingResult result,
                           HttpServletRequest request,
                           RedirectAttributes redirectAttrs) {
        if (!form.passwordsMatch()) {
            result.rejectValue("confirmPassword", "mismatch", "Passwords do not match");
        }
        if (result.hasErrors()) {
            return "auth/register";
        }

        try {
            String baseUrl = getBaseUrl(request);
            userService.register(form.getEmail(), form.getPassword(), baseUrl);
            redirectAttrs.addFlashAttribute("message",
                    "Account created! Check your email to verify your account.");
            return "redirect:/auth/login";
        } catch (IllegalArgumentException e) {
            result.rejectValue("email", "duplicate", e.getMessage());
            return "auth/register";
        }
    }

    @GetMapping("/verify")
    public String verifyEmail(@RequestParam String token, RedirectAttributes redirectAttrs) {
        if (userService.verifyEmail(token)) {
            redirectAttrs.addFlashAttribute("message",
                    "Email verified! You can now log in.");
        } else {
            redirectAttrs.addFlashAttribute("error",
                    "Invalid or expired verification link.");
        }
        return "redirect:/auth/login";
    }

    @GetMapping("/magic-link")
    public String magicLinkPage() {
        return "auth/magic-link";
    }

    @PostMapping("/magic-link")
    public String sendMagicLink(@RequestParam String email,
                                HttpServletRequest request,
                                RedirectAttributes redirectAttrs) {
        String baseUrl = getBaseUrl(request);
        userService.sendMagicLink(email, baseUrl);
        redirectAttrs.addFlashAttribute("message",
                "If an account exists with that email, a login link has been sent.");
        return "redirect:/auth/magic-link";
    }

    @GetMapping("/magic-login")
    public String magicLogin(@RequestParam String token,
                             HttpServletRequest request,
                             RedirectAttributes redirectAttrs) {
        Optional<User> userOpt = userService.authenticateMagicLink(token);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    user.getEmail(), null,
                    new org.springframework.security.core.userdetails.User(
                            user.getEmail(), "",
                            java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"))
                    ).getAuthorities()
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
            request.getSession().setAttribute(
                    HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                    SecurityContextHolder.getContext());
            return "redirect:/dashboard";
        }

        redirectAttrs.addFlashAttribute("error", "Invalid or expired login link.");
        return "redirect:/auth/login";
    }

    @GetMapping("/forgot-password")
    public String forgotPasswordPage() {
        return "auth/forgot-password";
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email,
                                 HttpServletRequest request,
                                 RedirectAttributes redirectAttrs) {
        String baseUrl = getBaseUrl(request);
        userService.requestPasswordReset(email, baseUrl);
        redirectAttrs.addFlashAttribute("message",
                "If an account exists with that email, a password reset link has been sent.");
        return "redirect:/auth/forgot-password";
    }

    @GetMapping("/reset-password")
    public String resetPasswordPage(@RequestParam String token, Model model) {
        model.addAttribute("token", token);
        return "auth/reset-password";
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestParam String token,
                                @RequestParam String password,
                                @RequestParam String confirmPassword,
                                RedirectAttributes redirectAttrs) {
        if (!password.equals(confirmPassword)) {
            redirectAttrs.addFlashAttribute("error", "Passwords do not match");
            return "redirect:/auth/reset-password?token=" + token;
        }
        if (password.length() < 8) {
            redirectAttrs.addFlashAttribute("error", "Password must be at least 8 characters");
            return "redirect:/auth/reset-password?token=" + token;
        }

        if (userService.resetPassword(token, password)) {
            redirectAttrs.addFlashAttribute("message", "Password reset! You can now log in.");
            return "redirect:/auth/login";
        }

        redirectAttrs.addFlashAttribute("error", "Invalid or expired reset link.");
        return "redirect:/auth/forgot-password";
    }

    private String getBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme();
        String host = request.getServerName();
        int port = request.getServerPort();
        if ((scheme.equals("http") && port == 80) || (scheme.equals("https") && port == 443)) {
            return scheme + "://" + host;
        }
        return scheme + "://" + host + ":" + port;
    }
}
