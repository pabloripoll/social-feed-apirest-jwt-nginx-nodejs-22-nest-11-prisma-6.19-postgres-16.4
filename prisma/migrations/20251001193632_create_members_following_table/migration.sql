CREATE TABLE IF NOT EXISTS members_following (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  following_user_id BIGINT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT fk_members_following_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_members_following_following_user_id FOREIGN KEY (following_user_id) REFERENCES users(id) ON DELETE CASCADE
);