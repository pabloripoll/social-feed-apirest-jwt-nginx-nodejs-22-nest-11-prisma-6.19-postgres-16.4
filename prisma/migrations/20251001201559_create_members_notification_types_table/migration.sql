CREATE TABLE IF NOT EXISTS members_notification_types (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(64) NOT NULL,
  title VARCHAR(64) NOT NULL,
  message_singular VARCHAR(512) NOT NULL,
  message_multiple VARCHAR(512) NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT uniq_members_notification_types_key UNIQUE (key)
);