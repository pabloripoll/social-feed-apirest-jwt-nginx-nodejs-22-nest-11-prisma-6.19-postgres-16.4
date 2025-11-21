CREATE TABLE IF NOT EXISTS members_moderations (
  id BIGSERIAL PRIMARY KEY,
  admin_user_id BIGINT NOT NULL,
  type_id BIGINT NOT NULL,
  is_applied BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  is_on_member BOOLEAN NOT NULL DEFAULT FALSE,
  is_on_post BOOLEAN NOT NULL DEFAULT FALSE,
  member_user_id BIGINT,
  member_feed_post_id BIGINT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT fk_members_moderations_admin_user_id FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_members_moderations_member_user_id FOREIGN KEY (member_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_members_moderations_member_feed_post_id FOREIGN KEY (member_feed_post_id) REFERENCES feed_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_members_moderations_expires_at ON members_moderations (expires_at);
