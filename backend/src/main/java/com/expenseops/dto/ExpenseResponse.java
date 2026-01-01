package com.expenseops.dto;

import com.expenseops.entity.ExpenseStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class ExpenseResponse {
    private UUID id;
    private String title;
    private String description;
    private BigDecimal amount;
    private ExpenseStatus status;
    private String rejectionReason;
    private UUID userId;
    private String userName;
    private String userDepartment;
    private UUID categoryId;
    private String categoryName;
    private String categoryIcon;
    private OffsetDateTime createdAt;
    private OffsetDateTime submittedAt;
    private OffsetDateTime approvedAt;
    private String approvedByName;
    private OffsetDateTime reimbursedAt;
    private String reimbursedByName;
    private String receiptUrl;
    private java.time.LocalDate expenseDate;

    public ExpenseResponse() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public ExpenseStatus getStatus() {
        return status;
    }

    public void setStatus(ExpenseStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserDepartment() {
        return userDepartment;
    }

    public void setUserDepartment(String userDepartment) {
        this.userDepartment = userDepartment;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(UUID categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCategoryIcon() {
        return categoryIcon;
    }

    public void setCategoryIcon(String categoryIcon) {
        this.categoryIcon = categoryIcon;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(OffsetDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public OffsetDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(OffsetDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public String getApprovedByName() {
        return approvedByName;
    }

    public void setApprovedByName(String approvedByName) {
        this.approvedByName = approvedByName;
    }

    public OffsetDateTime getReimbursedAt() {
        return reimbursedAt;
    }

    public void setReimbursedAt(OffsetDateTime reimbursedAt) {
        this.reimbursedAt = reimbursedAt;
    }

    public String getReimbursedByName() {
        return reimbursedByName;
    }

    public void setReimbursedByName(String reimbursedByName) {
        this.reimbursedByName = reimbursedByName;
    }

    public String getReceiptUrl() {
        return receiptUrl;
    }

    public void setReceiptUrl(String receiptUrl) {
        this.receiptUrl = receiptUrl;
    }

    public java.time.LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(java.time.LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final ExpenseResponse response = new ExpenseResponse();

        public Builder id(UUID id) {
            response.id = id;
            return this;
        }

        public Builder title(String title) {
            response.title = title;
            return this;
        }

        public Builder description(String description) {
            response.description = description;
            return this;
        }

        public Builder amount(BigDecimal amount) {
            response.amount = amount;
            return this;
        }

        public Builder status(ExpenseStatus status) {
            response.status = status;
            return this;
        }

        public Builder rejectionReason(String rejectionReason) {
            response.rejectionReason = rejectionReason;
            return this;
        }

        public Builder userId(UUID userId) {
            response.userId = userId;
            return this;
        }

        public Builder userName(String userName) {
            response.userName = userName;
            return this;
        }

        public Builder userDepartment(String userDepartment) {
            response.userDepartment = userDepartment;
            return this;
        }

        public Builder categoryId(UUID categoryId) {
            response.categoryId = categoryId;
            return this;
        }

        public Builder categoryName(String categoryName) {
            response.categoryName = categoryName;
            return this;
        }

        public Builder categoryIcon(String categoryIcon) {
            response.categoryIcon = categoryIcon;
            return this;
        }

        public Builder createdAt(OffsetDateTime createdAt) {
            response.createdAt = createdAt;
            return this;
        }

        public Builder submittedAt(OffsetDateTime submittedAt) {
            response.submittedAt = submittedAt;
            return this;
        }

        public Builder approvedAt(OffsetDateTime approvedAt) {
            response.approvedAt = approvedAt;
            return this;
        }

        public Builder approvedByName(String approvedByName) {
            response.approvedByName = approvedByName;
            return this;
        }

        public Builder reimbursedAt(OffsetDateTime reimbursedAt) {
            response.reimbursedAt = reimbursedAt;
            return this;
        }

        public Builder reimbursedByName(String reimbursedByName) {
            response.reimbursedByName = reimbursedByName;
            return this;
        }

        public Builder receiptUrl(String receiptUrl) {
            response.receiptUrl = receiptUrl;
            return this;
        }

        public Builder expenseDate(java.time.LocalDate expenseDate) {
            response.expenseDate = expenseDate;
            return this;
        }

        public ExpenseResponse build() {
            return response;
        }
    }
}
