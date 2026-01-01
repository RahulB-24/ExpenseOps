package com.expenseops.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@Tag(name = "Health", description = "Root health check")
public class HomeController {

    @GetMapping("/")
    @Operation(summary = "Root endpoint", description = "Returns API status")
    public ResponseEntity<Map<String, String>> home() {
        return ResponseEntity.ok(Map.of(
                "status", "online",
                "message", "ExpenseOps API is running",
                "documentation", "/swagger-ui.html"));
    }
}
