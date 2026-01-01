package com.expenseops.dto;

import com.expenseops.entity.UserRole;
import java.util.UUID;

public class AuthResponse {
    private String token;
    private UUID userId;
    private UUID tenantId;
    private String email;
    private String name;
    private UserRole role;
    private String tenantName;

    public AuthResponse() {
    }

    public AuthResponse(String token, UUID userId, UUID tenantId, String email, String name, UserRole role,
            String tenantName) {
        this.token = token;
        this.userId = userId;
        this.tenantId = tenantId;
        this.email = email;
        this.name = name;
        this.role = role;
        this.tenantName = tenantName;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public void setTenantId(UUID tenantId) {
        this.tenantId = tenantId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public String getTenantName() {
        return tenantName;
    }

    public void setTenantName(String tenantName) {
        this.tenantName = tenantName;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String token;
        private UUID userId;
        private UUID tenantId;
        private String email;
        private String name;
        private UserRole role;
        private String tenantName;

        public Builder token(String token) {
            this.token = token;
            return this;
        }

        public Builder userId(UUID userId) {
            this.userId = userId;
            return this;
        }

        public Builder tenantId(UUID tenantId) {
            this.tenantId = tenantId;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder role(UserRole role) {
            this.role = role;
            return this;
        }

        public Builder tenantName(String tenantName) {
            this.tenantName = tenantName;
            return this;
        }

        public AuthResponse build() {
            return new AuthResponse(token, userId, tenantId, email, name, role, tenantName);
        }
    }
}
