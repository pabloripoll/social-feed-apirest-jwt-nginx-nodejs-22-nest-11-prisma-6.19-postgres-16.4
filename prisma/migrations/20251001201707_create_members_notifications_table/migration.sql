CREATE TABLE IF NOT EXISTS members_notifications (
  id BIGSERIAL PRIMARY KEY,
  notification_type_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  is_opened BOOLEAN NOT NULL DEFAULT FALSE,
  opened_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  message VARCHAR(512) NOT NULL,
  last_member_user_id BIGINT NOT NULL,
  last_member_nickname VARCHAR(32) NOT NULL,
  last_member_avatar TEXT,
  CONSTRAINT fk_members_notifications_notification_type FOREIGN KEY (notification_type_id) REFERENCES members_notification_types(id) ON DELETE CASCADE,
  CONSTRAINT fk_members_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_members_notifications_last_member_user FOREIGN KEY (last_member_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_members_notifications_opened_at ON members_notifications (opened_at);
CREATE INDEX IF NOT EXISTS idx_members_notifications_created_at ON members_notifications (created_at);