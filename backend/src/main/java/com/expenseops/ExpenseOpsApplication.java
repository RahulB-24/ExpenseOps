package com.expenseops;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ExpenseOpsApplication {

    public static void main(String[] args) {
        // Load .env file if it exists (for local development)
        try {
            Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
            dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
        } catch (Exception e) {
            // Ignore if .env is missing (e.g. in Cloud/Docker)
        }

        SpringApplication.run(ExpenseOpsApplication.class, args);
    }
}
