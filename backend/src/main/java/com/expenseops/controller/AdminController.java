package com.expenseops.controller;

import com.expenseops.dto.UpdateRoleRequest;
import com.expenseops.dto.UserResponse;
import com.expenseops.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin management operations")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    @Operation(summary = "Get all users in tenant", description = "Returns all users in the current tenant (Admin only)")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsersInTenant());
    }

    @PutMapping("/users/{userId}/role")
    @Operation(summary = "Update user role", description = "Changes a user's role (Admin only)")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(userService.updateUserRole(userId, request.getRole()));
    }

    @PostMapping("/users/{userId}/toggle-active")
    @Operation(summary = "Toggle user active status", description = "Activates or deactivates a user (Admin only)")
    public ResponseEntity<UserResponse> toggleUserActive(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.toggleUserActive(userId));
    }

    @GetMapping("/tenant/invite-code")
    @Operation(summary = "Get tenant invite code", description = "Returns the invite code for the current tenant (Admin only)")
    public ResponseEntity<java.util.Map<String, String>> getTenantInviteCode() {
        String inviteCode = userService.getTenantInviteCode();
        return ResponseEntity.ok(java.util.Map.of("inviteCode", inviteCode));
    }

    @PutMapping("/users/{userId}/department")
    @Operation(summary = "Update user department", description = "Changes a user's department (Admin only)")
    public ResponseEntity<UserResponse> updateUserDepartment(
            @PathVariable UUID userId,
            @RequestBody java.util.Map<String, String> request) {
        return ResponseEntity.ok(userService.updateUserDepartment(userId, request.get("department")));
    }

    @PostMapping("/users/{userId}/reset-password")
    @Operation(summary = "Reset user password", description = "Sets a new password for a user (Admin only)")
    public ResponseEntity<java.util.Map<String, String>> resetUserPassword(
            @PathVariable UUID userId,
            @RequestBody java.util.Map<String, String> request) {
        userService.resetUserPassword(userId, request.get("newPassword"));
        return ResponseEntity.ok(java.util.Map.of("message", "Password updated successfully"));
    }

    // Category Management
    @Autowired
    private com.expenseops.service.CategoryService categoryService;

    @GetMapping("/categories")
    @Operation(summary = "Get all categories", description = "Returns all categories including inactive ones (Admin only)")
    public ResponseEntity<java.util.List<com.expenseops.dto.CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategoriesForAdmin());
    }

    @PostMapping("/categories")
    @Operation(summary = "Create category", description = "Creates a new expense category (Admin only)")
    public ResponseEntity<com.expenseops.dto.CategoryResponse> createCategory(
            @RequestBody java.util.Map<String, String> request) {
        return ResponseEntity.ok(categoryService.createCategory(
                request.get("name"),
                request.get("icon"),
                request.get("description")));
    }

    @PutMapping("/categories/{categoryId}")
    @Operation(summary = "Update category", description = "Updates an expense category (Admin only)")
    public ResponseEntity<com.expenseops.dto.CategoryResponse> updateCategory(
            @PathVariable UUID categoryId,
            @RequestBody java.util.Map<String, String> request) {
        return ResponseEntity.ok(categoryService.updateCategory(
                categoryId,
                request.get("name"),
                request.get("icon"),
                request.get("description")));
    }

    @PostMapping("/categories/{categoryId}/toggle-active")
    @Operation(summary = "Toggle category active", description = "Activates or deactivates a category (Admin only)")
    public ResponseEntity<com.expenseops.dto.CategoryResponse> toggleCategoryActive(
            @PathVariable UUID categoryId) {
        return ResponseEntity.ok(categoryService.toggleCategoryActive(categoryId));
    }
}
