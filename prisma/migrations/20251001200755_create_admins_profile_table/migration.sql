CREATE TABLE IF NOT EXISTS admins_profile (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  nickname VARCHAR(32) NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT fk_admins_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uniq_admins_profile_nickname UNIQUE (nickname)
);