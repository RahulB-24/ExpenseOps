package com.expenseops.dto;

import com.expenseops.entity.ApprovalAction;
import java.time.OffsetDateTime;
import java.util.UUID;

public class ApprovalResponse {
    private UUID id;
    private ApprovalAction action;
    private String comment;
    private UUID actorId;
    private String actorName;
    private OffsetDateTime createdAt;

    public ApprovalResponse() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ApprovalAction getAction() {
        return action;
    }

    public void setAction(ApprovalAction action) {
        this.action = action;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public UUID getActorId() {
        return actorId;
    }

    public void setActorId(UUID actorId) {
        this.actorId = actorId;
    }

    public String getActorName() {
        return actorName;
    }

    public void setActorName(String actorName) {
        this.actorName = actorName;
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
        private final ApprovalResponse response = new ApprovalResponse();

        public Builder id(UUID id) {
            response.id = id;
            return this;
        }

        public Builder action(ApprovalAction action) {
            response.action = action;
            return this;
        }

        public Builder comment(String comment) {
            response.comment = comment;
            return this;
        }

        public Builder actorId(UUID actorId) {
            response.actorId = actorId;
            return this;
        }

        public Builder actorName(String actorName) {
            response.actorName = actorName;
            return this;
        }

        public Builder createdAt(OffsetDateTime createdAt) {
            response.createdAt = createdAt;
            return this;
        }

        public ApprovalResponse build() {
            return response;
        }
    }
}
