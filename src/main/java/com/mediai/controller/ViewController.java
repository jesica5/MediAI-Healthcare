package com.mediai.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Thymeleaf UI View Controller
 * Serves server-rendered HTML views adhering to required capstone presentation stack.
 */
@Controller
public class ViewController {

    @GetMapping({"/", "/index"})
    public String index(Model model) {
        model.addAttribute("title", "MediAI — Smart Patient Triage & Emergency Risk Prediction System");
        model.addAttribute("appName", "MediAI");
        return "index";
    }

    @GetMapping("/intake")
    public String intake(Model model) {
        model.addAttribute("title", "Patient Health Assessment & Triage — MediAI");
        return "intake";
    }

    @GetMapping("/queue")
    public String queue(Model model) {
        model.addAttribute("title", "Emergency Patient Queue — MediAI");
        return "queue";
    }

    @GetMapping("/doctor")
    public String doctor(Model model) {
        model.addAttribute("title", "Doctor Clinical Workstation — MediAI");
        return "doctor";
    }

    @GetMapping("/profile")
    public String profile(Model model) {
        model.addAttribute("title", "Patient Profile & AI Risk Runner — MediAI");
        return "profile";
    }

    @GetMapping("/analytics")
    public String analytics(Model model) {
        model.addAttribute("title", "Department Clinical Analytics — MediAI");
        return "analytics";
    }

    @GetMapping("/review")
    public String review(Model model) {
        model.addAttribute("title", "Clinical Review & Override — MediAI");
        return "review";
    }

    @GetMapping("/medications")
    public String medications(Model model) {
        model.addAttribute("title", "Medication Reconciliation — MediAI");
        return "medications";
    }

    @GetMapping("/signin")
    public String signin(Model model) {
        model.addAttribute("title", "Clinical Staff Login — MediAI");
        return "signin";
    }
}
