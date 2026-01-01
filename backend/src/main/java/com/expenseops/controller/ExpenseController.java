package com.expenseops.controller;

import com.expenseops.dto.*;
import com.expenseops.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
@Tag(name = "Expenses", description = "Expense management and workflow")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    @Operation(summary = "Get my expenses", description = "Get all expenses for the current user")
    public ResponseEntity<List<ExpenseResponse>> getMyExpenses() {
        return ResponseEntity.ok(expenseService.getMyExpenses());
    }

    @GetMapping("/pending")
    @Operation(summary = "Get pending approvals", description = "Get expenses awaiting approval (Manager/Finance only)")
    public ResponseEntity<List<ExpenseResponse>> getPendingApprovals() {
        return ResponseEntity.ok(expenseService.getPendingApprovals());
    }

    @GetMapping("/approved")
    @Operation(summary = "Get approved for reimbursement", description = "Get approved expenses awaiting reimbursement (Finance only)")
    public ResponseEntity<List<ExpenseResponse>> getApprovedForReimbursement() {
        return ResponseEntity.ok(expenseService.getApprovedForReimbursement());
    }

    @GetMapping("/approval-history")
    @Operation(summary = "Get approval history", description = "Get expenses that have been processed (Approved/Rejected/Reimbursed)")
    public ResponseEntity<List<ExpenseResponse>> getApprovalHistory() {
        return ResponseEntity.ok(expenseService.getApprovalHistory());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get expense by ID", description = "Get expense details")
    public ResponseEntity<ExpenseResponse> getExpenseById(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.getExpenseById(id));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Get expense history", description = "Get approval/rejection history for an expense")
    public ResponseEntity<List<ApprovalResponse>> getExpenseHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.getExpenseHistory(id));
    }

    @PostMapping
    @Operation(summary = "Create expense", description = "Create a new expense in DRAFT status")
    public ResponseEntity<ExpenseResponse> createExpense(@Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.createExpense(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update expense", description = "Update a DRAFT or REJECTED expense")
    public ResponseEntity<ExpenseResponse> updateExpense(@PathVariable UUID id,
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.updateExpense(id, request));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit expense", description = "Submit a DRAFT expense for approval")
    public ResponseEntity<ExpenseResponse> submitExpense(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.submitExpense(id));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve expense", description = "Approve a SUBMITTED expense (Manager/Finance only)")
    public ResponseEntity<ExpenseResponse> approveExpense(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.approveExpense(id));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject expense", description = "Reject a SUBMITTED expense with reason (Manager/Finance only)")
    public ResponseEntity<ExpenseResponse> rejectExpense(@PathVariable UUID id,
            @Valid @RequestBody RejectRequest request) {
        return ResponseEntity.ok(expenseService.rejectExpense(id, request.getReason()));
    }

    @PostMapping("/{id}/reimburse")
    @Operation(summary = "Reimburse expense", description = "Mark an APPROVED expense as reimbursed (Finance only)")
    public ResponseEntity<ExpenseResponse> reimburseExpense(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.reimburseExpense(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete expense", description = "Delete a DRAFT expense")
    public ResponseEntity<Void> deleteExpense(@PathVariable UUID id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
