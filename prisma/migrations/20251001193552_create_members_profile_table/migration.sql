CREATE TABLE IF NOT EXISTS members_profile (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  nickname VARCHAR(32) NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT fk_members_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uniq_members_profile_nickname UNIQUE (nickname)
);