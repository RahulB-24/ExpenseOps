package com.expenseops.controller;

import com.expenseops.dto.AuthResponse;
import com.expenseops.dto.LoginRequest;
import com.expenseops.dto.RegisterRequest;
import com.expenseops.dto.TenantResponse;
import com.expenseops.repository.TenantRepository;
import com.expenseops.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User authentication and registration")
public class AuthController {

    private final AuthService authService;
    private final TenantRepository tenantRepository;

    public AuthController(AuthService authService, TenantRepository tenantRepository) {
        this.authService = authService;
        this.tenantRepository = tenantRepository;
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticate user and return JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Create new user account in specified tenant")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/tenants")
    @Operation(summary = "Get available tenants", description = "List all active tenants for registration")
    public ResponseEntity<List<TenantResponse>> getTenants() {
        List<TenantResponse> tenants = tenantRepository.findAll().stream()
                .filter(t -> t.getIsActive())
                .map(t -> TenantResponse.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .slug(t.getSlug())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(tenants);
    }
}
