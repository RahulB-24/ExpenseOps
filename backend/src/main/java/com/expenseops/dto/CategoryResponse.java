package com.expenseops.dto;

import java.util.UUID;

public class CategoryResponse {
    private UUID id;
    private String name;
    private String icon;
    private String description;
    private Boolean isActive;

    public CategoryResponse() {
    }

    public CategoryResponse(UUID id, String name, String icon, String description, Boolean isActive) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.description = description;
        this.isActive = isActive;
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

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID id;
        private String name;
        private String icon;
        private String description;
        private Boolean isActive;

        public Builder id(UUID id) {
            this.id = id;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder icon(String icon) {
            this.icon = icon;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder isActive(Boolean isActive) {
            this.isActive = isActive;
            return this;
        }

        public CategoryResponse build() {
            return new CategoryResponse(id, name, icon, description, isActive);
        }
    }
}
