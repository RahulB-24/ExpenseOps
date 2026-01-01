package com.expenseops.service;

import com.expenseops.dto.CategoryResponse;
import com.expenseops.entity.Category;
import com.expenseops.entity.Tenant;
import com.expenseops.repository.CategoryRepository;
import com.expenseops.repository.TenantRepository;
import com.expenseops.security.TenantContext;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TenantRepository tenantRepository;

    public CategoryService(CategoryRepository categoryRepository, TenantRepository tenantRepository) {
        this.categoryRepository = categoryRepository;
        this.tenantRepository = tenantRepository;
    }

    @Transactional
    public List<CategoryResponse> getCategories() {
        UUID tenantId = TenantContext.getCurrentTenant();
        List<Category> categories = categoryRepository.findByTenantIdAndIsActiveTrue(tenantId);

        // If no categories exist, seed default ones
        if (categories.isEmpty()) {
            Tenant tenant = tenantRepository.findById(tenantId)
                    .orElseThrow(() -> new RuntimeException("Tenant not found"));
            seedDefaultCategories(tenant);
            categories = categoryRepository.findByTenantIdAndIsActiveTrue(tenantId);
        }

        return categories.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Category getCategoryById(UUID categoryId) {
        UUID tenantId = TenantContext.getCurrentTenant();
        return categoryRepository.findByIdAndTenantId(categoryId, tenantId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryResponse createCategory(String name, String icon, String description) {
        UUID tenantId = TenantContext.getCurrentTenant();

        if (categoryRepository.existsByNameAndTenantId(name, tenantId)) {
            throw new RuntimeException("Category with this name already exists");
        }

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        Category category = new Category();
        category.setTenant(tenant);
        category.setName(name);
        category.setIcon(icon != null ? icon : "📋");
        category.setDescription(description);
        category.setIsActive(true);
        category = categoryRepository.save(category);

        return toResponse(category);
    }

    @Transactional
    public void seedDefaultCategories(Tenant tenant) {
        List<String[]> defaultCategories = Arrays.asList(
                new String[] { "Travel", "✈️", "Flights, hotels, and transport" },
                new String[] { "Meals", "🍽️", "Business meals and entertainment" },
                new String[] { "Office Supplies", "📦", "Stationery, equipment, and supplies" },
                new String[] { "Software", "💻", "Software subscriptions and licenses" },
                new String[] { "Transport", "🚕", "Taxi, uber, and local transport" },
                new String[] { "Training", "📚", "Courses, books, and learning materials" },
                new String[] { "Equipment", "🖥️", "Hardware and office equipment" },
                new String[] { "Other", "📋", "Miscellaneous expenses" });

        for (String[] cat : defaultCategories) {
            if (!categoryRepository.existsByNameAndTenantId(cat[0], tenant.getId())) {
                Category category = new Category();
                category.setTenant(tenant);
                category.setName(cat[0]);
                category.setIcon(cat[1]);
                category.setDescription(cat[2]);
                category.setIsActive(true);
                categoryRepository.save(category);
            }
        }
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<CategoryResponse> getAllCategoriesForAdmin() {
        UUID tenantId = TenantContext.getCurrentTenant();
        // Include inactive categories for admin
        return categoryRepository.findByTenantId(tenantId).stream()
                .map(this::toAdminResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryResponse updateCategory(UUID categoryId, String name, String icon, String description) {
        UUID tenantId = TenantContext.getCurrentTenant();
        Category category = categoryRepository.findByIdAndTenantId(categoryId, tenantId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Check if name is taken by another category
        if (!category.getName().equals(name) && categoryRepository.existsByNameAndTenantId(name, tenantId)) {
            throw new RuntimeException("Category with this name already exists");
        }

        category.setName(name);
        if (icon != null) {
            category.setIcon(icon);
        }
        category.setDescription(description);
        category = categoryRepository.save(category);
        return toAdminResponse(category);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryResponse toggleCategoryActive(UUID categoryId) {
        UUID tenantId = TenantContext.getCurrentTenant();
        Category category = categoryRepository.findByIdAndTenantId(categoryId, tenantId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        category.setIsActive(!category.getIsActive());
        category = categoryRepository.save(category);
        return toAdminResponse(category);
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .icon(category.getIcon())
                .description(category.getDescription())
                .build();
    }

    private CategoryResponse toAdminResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .icon(category.getIcon())
                .description(category.getDescription())
                .isActive(category.getIsActive())
                .build();
    }
}
