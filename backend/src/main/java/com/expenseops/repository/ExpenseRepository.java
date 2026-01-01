package com.expenseops.repository;

import com.expenseops.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    // User's own expenses
    List<Expense> findByUserIdAndTenantIdOrderByCreatedAtDesc(UUID userId, UUID tenantId);

    // By tenant (for managers/finance)
    List<Expense> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);

    // By status within tenant
    List<Expense> findByTenantIdAndStatusOrderByCreatedAtDesc(UUID tenantId, String status);

    // Find specific expense with tenant check
    Optional<Expense> findByIdAndTenantId(UUID id, UUID tenantId);

    // Pending approvals (for managers) - not owned by the requester
    List<Expense> findByTenantIdAndStatusAndUserIdNot(UUID tenantId, String status, UUID userId);

    // Count by status
    long countByTenantIdAndStatus(UUID tenantId, String status);

    // Approval History (Approved, Rejected, Reimbursed)
    List<Expense> findByTenantIdAndStatusInOrderByUpdatedAtDesc(UUID tenantId,
            List<String> statuses);
}
