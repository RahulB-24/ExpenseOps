package com.expenseops.controller;

import com.expenseops.dto.CategoryResponse;
import com.expenseops.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Categories", description = "Expense categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @Operation(summary = "Get all categories", description = "Get active expense categories for the current tenant")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(categoryService.getCategories());
    }

    @PostMapping
    @Operation(summary = "Create category (Admin only)", description = "Create a new expense category")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<CategoryResponse> createCategory(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String icon = request.get("icon");
        String description = request.get("description");

        if (name == null || name.isBlank()) {
            throw new RuntimeException("Category name is required");
        }

        return ResponseEntity.ok(categoryService.createCategory(name, icon, description));
    }
}
