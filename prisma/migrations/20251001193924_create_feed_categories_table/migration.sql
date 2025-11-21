CREATE TABLE IF NOT EXISTS feed_categories (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(64) NOT NULL,
  title VARCHAR(64) NOT NULL,
  visits_count INTEGER NOT NULL DEFAULT 0,
  feed_posts_count INTEGER NOT NULL DEFAULT 0,
  feed_posts_votes_up_count INTEGER NOT NULL DEFAULT 0,
  feed_posts_votes_down_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT uniq_feed_categories_key UNIQUE (key)
);