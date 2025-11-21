CREATE TABLE IF NOT EXISTS members_followers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  follower_user_id BIGINT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT fk_members_followers_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_members_followers_follower_user_id FOREIGN KEY (follower_user_id) REFERENCES users(id) ON DELETE CASCADE
);