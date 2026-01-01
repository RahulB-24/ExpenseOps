package com.expenseops.service;

import com.expenseops.dto.UserResponse;
import com.expenseops.entity.Tenant;
import com.expenseops.entity.User;
import com.expenseops.entity.UserRole;
import com.expenseops.repository.TenantRepository;
import com.expenseops.repository.UserRepository;
import com.expenseops.security.TenantContext;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, TenantRepository tenantRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private UUID getTenantId() {
        return TenantContext.getCurrentTenant();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUsersInTenant() {
        return userRepository.findByTenantIdOrderByCreatedAtDesc(getTenantId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateUserRole(UUID userId, UserRole newRole) {
        User currentUser = getCurrentUser();
        User targetUser = userRepository.findByIdAndTenantId(userId, getTenantId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Cannot change your own role
        if (targetUser.getId().equals(currentUser.getId())) {
            throw new RuntimeException("Cannot change your own role");
        }

        targetUser.setRole(newRole);
        targetUser = userRepository.save(targetUser);
        return toResponse(targetUser);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse toggleUserActive(UUID userId) {
        User currentUser = getCurrentUser();
        User targetUser = userRepository.findByIdAndTenantId(userId, getTenantId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Cannot deactivate yourself
        if (targetUser.getId().equals(currentUser.getId())) {
            throw new RuntimeException("Cannot deactivate your own account");
        }

        targetUser.setIsActive(!targetUser.getIsActive());
        targetUser = userRepository.save(targetUser);
        return toResponse(targetUser);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public String getTenantInviteCode() {
        Tenant tenant = tenantRepository.findById(getTenantId())
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        return tenant.getInviteCode();
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateUserDepartment(UUID userId, String department) {
        User targetUser = userRepository.findByIdAndTenantId(userId, getTenantId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        targetUser.setDepartment(department);
        targetUser = userRepository.save(targetUser);
        return toResponse(targetUser);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void resetUserPassword(UUID userId, String newPassword) {
        User currentUser = getCurrentUser();
        User targetUser = userRepository.findByIdAndTenantId(userId, getTenantId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Cannot reset your own password via this method
        if (targetUser.getId().equals(currentUser.getId())) {
            throw new RuntimeException("Cannot reset your own password via admin panel");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters");
        }

        targetUser.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(targetUser);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .department(user.getDepartment())
                .role(user.getRole())
                .active(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
