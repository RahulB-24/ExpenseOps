package com.expenseops.dto;

import com.expenseops.entity.UserRole;
import jakarta.validation.constraints.NotNull;

public class UpdateRoleRequest {

    @NotNull(message = "Role is required")
    private UserRole role;

    public UpdateRoleRequest() {
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }
}
