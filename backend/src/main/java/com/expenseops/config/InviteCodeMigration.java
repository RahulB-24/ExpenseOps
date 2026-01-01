package com.expenseops.config;

import com.expenseops.entity.Tenant;
import com.expenseops.repository.TenantRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

/**
 * Generates invite codes for existing tenants that don't have one.
 * Runs on application startup.
 */
@Component
public class InviteCodeMigration implements CommandLineRunner {

    private final TenantRepository tenantRepository;

    public InviteCodeMigration(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        List<Tenant> tenants = tenantRepository.findAll();
        Random random = new Random();

        for (Tenant tenant : tenants) {
            if (tenant.getInviteCode() == null || tenant.getInviteCode().isBlank()) {
                String code = String.valueOf(100000 + random.nextInt(900000));
                tenant.setInviteCode(code);
                tenantRepository.save(tenant);
                System.out.println("Generated invite code " + code + " for tenant: " + tenant.getName());
            }
        }
    }
}
