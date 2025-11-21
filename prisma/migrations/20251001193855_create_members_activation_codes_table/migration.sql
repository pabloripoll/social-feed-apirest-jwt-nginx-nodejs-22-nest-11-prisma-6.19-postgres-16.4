CREATE TABLE IF NOT EXISTS members_activation_codes (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(64) NOT NULL,
  user_id BIGINT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT uniq_members_activation_codes_code UNIQUE (code),
  CONSTRAINT fk_members_activation_codes_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);