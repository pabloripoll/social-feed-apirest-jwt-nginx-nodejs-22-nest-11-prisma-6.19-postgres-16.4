CREATE TABLE IF NOT EXISTS members_access_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  is_terminated BOOLEAN NOT NULL DEFAULT FALSE,
  is_expired BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  refresh_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  requests_count INTEGER NOT NULL DEFAULT 0,
  payload JSON,
  token TEXT NOT NULL,
  CONSTRAINT fk_members_access_logs_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_members_access_logs_expires_at ON members_access_logs (expires_at);
CREATE INDEX IF NOT EXISTS idx_members_access_logs_token ON members_access_logs (token);