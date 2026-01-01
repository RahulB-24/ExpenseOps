package com.expenseops.dto;

import com.expenseops.entity.UserRole;
import java.time.OffsetDateTime;
import java.util.UUID;

public class UserResponse {
    private UUID id;
    private String name;
    private String email;
    private String department;
    private UserRole role;
    private boolean active;
    private OffsetDateTime createdAt;

    public UserResponse() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final UserResponse response = new UserResponse();

        public Builder id(UUID id) {
            response.id = id;
            return this;
        }

        public Builder name(String name) {
            response.name = name;
            return this;
        }

        public Builder email(String email) {
            response.email = email;
            return this;
        }

        public Builder department(String department) {
            response.department = department;
            return this;
        }

        public Builder role(UserRole role) {
            response.role = role;
            return this;
        }

        public Builder active(boolean active) {
            response.active = active;
            return this;
        }

        public Builder createdAt(OffsetDateTime createdAt) {
            response.createdAt = createdAt;
            return this;
        }

        public UserResponse build() {
            return response;
        }
    }
}
