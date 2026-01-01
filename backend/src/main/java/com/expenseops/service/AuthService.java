package com.expenseops.service;

import com.expenseops.dto.AuthResponse;
import com.expenseops.dto.LoginRequest;
import com.expenseops.dto.RegisterRequest;
import com.expenseops.entity.Category;
import com.expenseops.entity.Tenant;
import com.expenseops.entity.User;
import com.expenseops.entity.UserRole;
import com.expenseops.repository.CategoryRepository;
import com.expenseops.repository.TenantRepository;
import com.expenseops.repository.UserRepository;
import com.expenseops.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, TenantRepository tenantRepository,
            CategoryRepository categoryRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        // Find user by email (across all tenants for simplicity)
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Check if user is active
        if (!user.getIsActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        // Generate JWT token
        String token = jwtUtils.generateToken(
                user.getId(),
                user.getTenant().getId(),
                user.getEmail(),
                user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .tenantId(user.getTenant().getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .tenantName(user.getTenant().getName())
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        Tenant tenant;
        boolean isFirstUserInTenant = false;

        // Check if creating a new organization
        if (request.getNewTenantName() != null && !request.getNewTenantName().isBlank()) {
            // Create new tenant
            String slug = request.getNewTenantName().toLowerCase()
                    .replaceAll("[^a-z0-9]", "-")
                    .replaceAll("-+", "-")
                    .replaceAll("^-|-$", "");

            // Check if slug already exists
            if (tenantRepository.findBySlug(slug).isPresent()) {
                throw new RuntimeException("Organization name already taken. Please choose a different name.");
            }

            tenant = new Tenant();
            tenant.setName(request.getNewTenantName());
            tenant.setSlug(slug);
            tenant.setIsActive(true);
            tenant.setInviteCode(generateInviteCode());
            tenant = tenantRepository.save(tenant);

            // Create default categories for new organization
            createDefaultCategories(tenant);

            isFirstUserInTenant = true; // First user of new org
        } else {
            // Find existing tenant by invite code
            tenant = tenantRepository.findByInviteCode(request.getInviteCode())
                    .orElseThrow(() -> new RuntimeException("Invalid invite code. Please check and try again."));

            // Check if this is the first user in this tenant
            isFirstUserInTenant = userRepository.findByTenantId(tenant.getId()).isEmpty();
        }

        // Check if email already exists in tenant
        if (userRepository.existsByEmailAndTenantId(request.getEmail(), tenant.getId())) {
            throw new RuntimeException("Email already registered in this organization");
        }

        // Create user
        User user = new User();
        user.setTenant(tenant);
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        // First user becomes ADMIN, others become EMPLOYEE
        user.setRole(isFirstUserInTenant ? UserRole.ADMIN : UserRole.EMPLOYEE);
        user.setDepartment(request.getDepartment());
        user.setIsActive(true);

        user = userRepository.save(user);

        // Generate JWT token
        String token = jwtUtils.generateToken(
                user.getId(),
                tenant.getId(),
                user.getEmail(),
                user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .tenantId(tenant.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .tenantName(tenant.getName())
                .build();
    }

    private void createDefaultCategories(Tenant tenant) {
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
            Category category = new Category();
            category.setTenant(tenant);
            category.setName(cat[0]);
            category.setIcon(cat[1]);
            category.setDescription(cat[2]);
            category.setIsActive(true);
            categoryRepository.save(category);
        }
    }

    private String generateInviteCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 6-digit number
        return String.valueOf(code);
    }
}
