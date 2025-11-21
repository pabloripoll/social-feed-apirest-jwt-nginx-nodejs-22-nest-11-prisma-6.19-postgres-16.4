CREATE TABLE IF NOT EXISTS members (
  id BIGSERIAL PRIMARY KEY,
  uid BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  region_id BIGINT, -- nullable
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  following_count INTEGER NOT NULL DEFAULT 0,
  followers_count INTEGER NOT NULL DEFAULT 0,
  posts_count INTEGER NOT NULL DEFAULT 0,
  posts_votes_up_count INTEGER NOT NULL DEFAULT 0,
  posts_votes_down_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT uniq_members_uid UNIQUE (uid),
  CONSTRAINT fk_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_members_region FOREIGN KEY (region_id) REFERENCES geo_regions(id) ON DELETE CASCADE
);