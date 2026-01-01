package com.expenseops.service;

import com.expenseops.dto.ApprovalResponse;
import com.expenseops.dto.ExpenseRequest;
import com.expenseops.dto.ExpenseResponse;
import com.expenseops.entity.*;
import com.expenseops.repository.ApprovalRepository;
import com.expenseops.repository.ExpenseRepository;
import com.expenseops.repository.TenantRepository;
import com.expenseops.security.TenantContext;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ApprovalRepository approvalRepository;
    private final TenantRepository tenantRepository;
    private final CategoryService categoryService;

    public ExpenseService(ExpenseRepository expenseRepository, ApprovalRepository approvalRepository,
            TenantRepository tenantRepository, CategoryService categoryService) {
        this.expenseRepository = expenseRepository;
        this.approvalRepository = approvalRepository;
        this.tenantRepository = tenantRepository;
        this.categoryService = categoryService;
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private UUID getTenantId() {
        return TenantContext.getCurrentTenant();
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getMyExpenses() {
        User user = getCurrentUser();
        return expenseRepository.findByUserIdAndTenantIdOrderByCreatedAtDesc(user.getId(), getTenantId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('MANAGER', 'FINANCE', 'ADMIN')")
    public List<ExpenseResponse> getPendingApprovals() {
        User user = getCurrentUser();
        UUID tenantId = getTenantId();
        System.out.println("DEBUG: getPendingApprovals called by User: " + user.getId() + " (" + user.getEmail() + ")");
        System.out.println("DEBUG: Tenant ID: " + tenantId);

        List<Expense> expenses = expenseRepository
                .findByTenantIdAndStatusAndUserIdNot(tenantId, ExpenseStatus.SUBMITTED.name(), user.getId());

        System.out.println("DEBUG: Found " + expenses.size() + " pending expenses for tenant " + tenantId);
        expenses.forEach(e -> System.out.println("DEBUG: Expense " + e.getId() + " - User: " + e.getUser().getId()));

        return expenses.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('MANAGER', 'FINANCE', 'ADMIN')")
    public List<ExpenseResponse> getApprovalHistory() {
        UUID tenantId = getTenantId();
        List<String> historyStatuses = Arrays.asList(
                ExpenseStatus.APPROVED.name(),
                ExpenseStatus.REJECTED.name(),
                ExpenseStatus.REIMBURSED.name());
        return expenseRepository.findByTenantIdAndStatusInOrderByUpdatedAtDesc(tenantId, historyStatuses)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('FINANCE', 'ADMIN')")
    public List<ExpenseResponse> getApprovedForReimbursement() {
        return expenseRepository
                .findByTenantIdAndStatusOrderByCreatedAtDesc(getTenantId(), ExpenseStatus.APPROVED.name())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(UUID id) {
        Expense expense = expenseRepository.findByIdAndTenantId(id, getTenantId())
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        return toResponse(expense);
    }

    @Transactional(readOnly = true)
    public List<ApprovalResponse> getExpenseHistory(UUID expenseId) {
        // Verify expense exists and belongs to tenant
        expenseRepository.findByIdAndTenantId(expenseId, getTenantId())
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        return approvalRepository.findByExpenseIdOrderByCreatedAtAsc(expenseId)
                .stream()
                .map(this::toApprovalResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request) {
        User user = getCurrentUser();
        Tenant tenant = tenantRepository.findById(getTenantId())
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        Category category = categoryService.getCategoryById(request.getCategoryId());

        Expense expense = new Expense();
        expense.setTenant(tenant);
        expense.setUser(user);
        expense.setCategory(category);
        expense.setTitle(request.getTitle());
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setAmount(request.getAmount());
        expense.setStatus(ExpenseStatus.DRAFT);
        expense.setReceiptUrl(request.getReceiptUrl());
        expense.setExpenseDate(request.getExpenseDate());

        expense = expenseRepository.saveAndFlush(expense);
        return toResponse(expense);
    }

    @Transactional
    public ExpenseResponse updateExpense(UUID id, ExpenseRequest request) {
        Expense expense = getExpenseForOwner(id);

        if (expense.getStatus() != ExpenseStatus.DRAFT && expense.getStatus() != ExpenseStatus.REJECTED) {
            throw new RuntimeException("Can only edit DRAFT or REJECTED expenses");
        }

        Category category = categoryService.getCategoryById(request.getCategoryId());

        expense.setTitle(request.getTitle());
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setAmount(request.getAmount());
        expense.setCategory(category);
        expense.setReceiptUrl(request.getReceiptUrl());
        expense.setExpenseDate(request.getExpenseDate());

        // Reset to draft if was rejected
        if (expense.getStatus() == ExpenseStatus.REJECTED) {
            expense.setStatus(ExpenseStatus.DRAFT);
            expense.setRejectionReason(null);
        }

        expense = expenseRepository.save(expense);
        return toResponse(expense);
    }

    @Transactional
    public ExpenseResponse submitExpense(UUID id) {
        Expense expense = getExpenseForOwner(id);

        if (expense.getStatus() != ExpenseStatus.DRAFT) {
            throw new RuntimeException("Can only submit DRAFT expenses");
        }

        expense.setStatus(ExpenseStatus.SUBMITTED);
        expense.setSubmittedAt(OffsetDateTime.now());
        expense = expenseRepository.save(expense);

        // Record approval history
        createApproval(expense, ApprovalAction.SUBMITTED, null);

        return toResponse(expense);
    }

    @Transactional
    @PreAuthorize("hasAnyRole('MANAGER', 'FINANCE', 'ADMIN')")
    public ExpenseResponse approveExpense(UUID id) {
        Expense expense = getExpenseForApproval(id);

        if (expense.getStatus() != ExpenseStatus.SUBMITTED) {
            throw new RuntimeException("Can only approve SUBMITTED expenses");
        }

        User currentUser = getCurrentUser();
        expense.setStatus(ExpenseStatus.APPROVED);
        expense.setApprovedAt(OffsetDateTime.now());
        expense.setApprovedById(currentUser.getId());
        expense.setApprovedByName(currentUser.getName());
        expense = expenseRepository.save(expense);

        createApproval(expense, ApprovalAction.APPROVED, null);

        return toResponse(expense);
    }

    @Transactional
    @PreAuthorize("hasAnyRole('MANAGER', 'FINANCE', 'ADMIN')")
    public ExpenseResponse rejectExpense(UUID id, String reason) {
        Expense expense = getExpenseForApproval(id);

        if (expense.getStatus() != ExpenseStatus.SUBMITTED) {
            throw new RuntimeException("Can only reject SUBMITTED expenses");
        }

        expense.setStatus(ExpenseStatus.REJECTED);
        expense.setRejectionReason(reason);
        expense = expenseRepository.save(expense);

        createApproval(expense, ApprovalAction.REJECTED, reason);

        return toResponse(expense);
    }

    @Transactional
    @PreAuthorize("hasAnyRole('FINANCE', 'ADMIN')")
    public ExpenseResponse reimburseExpense(UUID id) {
        Expense expense = expenseRepository.findByIdAndTenantId(id, getTenantId())
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (expense.getStatus() != ExpenseStatus.APPROVED) {
            throw new RuntimeException("Can only reimburse APPROVED expenses");
        }

        User currentUser = getCurrentUser();
        expense.setStatus(ExpenseStatus.REIMBURSED);
        expense.setReimbursedAt(OffsetDateTime.now());
        expense.setReimbursedById(currentUser.getId());
        expense.setReimbursedByName(currentUser.getName());
        expense = expenseRepository.save(expense);

        createApproval(expense, ApprovalAction.REIMBURSED, null);

        return toResponse(expense);
    }

    @Transactional
    public void deleteExpense(UUID id) {
        Expense expense = getExpenseForOwner(id);

        if (expense.getStatus() != ExpenseStatus.DRAFT) {
            throw new RuntimeException("Can only delete DRAFT expenses");
        }

        expenseRepository.delete(expense);
    }

    private Expense getExpenseForOwner(UUID id) {
        User user = getCurrentUser();
        Expense expense = expenseRepository.findByIdAndTenantId(id, getTenantId())
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to modify this expense");
        }

        return expense;
    }

    private Expense getExpenseForApproval(UUID id) {
        User user = getCurrentUser();
        Expense expense = expenseRepository.findByIdAndTenantId(id, getTenantId())
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Cannot approve your own expense
        if (expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Cannot approve your own expense");
        }

        return expense;
    }

    private void createApproval(Expense expense, ApprovalAction action, String comment) {
        User actor = getCurrentUser();
        Approval approval = new Approval();
        approval.setTenant(expense.getTenant());
        approval.setExpense(expense);
        approval.setActor(actor);
        approval.setAction(action);
        approval.setComment(comment);
        approvalRepository.save(approval);
    }

    private ExpenseResponse toResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .title(expense.getTitle())
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .status(expense.getStatus())
                .rejectionReason(expense.getRejectionReason())
                .userId(expense.getUser().getId())
                .userName(expense.getUser().getName())
                .userDepartment(expense.getUser().getDepartment())
                .categoryId(expense.getCategory().getId())
                .categoryName(expense.getCategory().getName())
                .categoryIcon(expense.getCategory().getIcon())
                .createdAt(expense.getCreatedAt())
                .submittedAt(expense.getSubmittedAt())
                .approvedAt(expense.getApprovedAt())
                .approvedByName(expense.getApprovedByName())
                .reimbursedAt(expense.getReimbursedAt())
                .reimbursedByName(expense.getReimbursedByName())
                .receiptUrl(expense.getReceiptUrl())
                .expenseDate(expense.getExpenseDate())
                .build();
    }

    private ApprovalResponse toApprovalResponse(Approval approval) {
        return ApprovalResponse.builder()
                .id(approval.getId())
                .action(approval.getAction())
                .comment(approval.getComment())
                .actorId(approval.getActor().getId())
                .actorName(approval.getActor().getName())
                .createdAt(approval.getCreatedAt())
                .build();
    }
}
