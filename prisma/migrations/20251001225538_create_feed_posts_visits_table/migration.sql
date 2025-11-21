CREATE TABLE IF NOT EXISTS feed_posts_visits (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  post_id BIGINT NOT NULL,
  visitor_user_id BIGINT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT fk_feed_posts_visits_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_feed_posts_visits_post_id FOREIGN KEY (post_id) REFERENCES feed_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_feed_posts_visits_visitor_user_id FOREIGN KEY (visitor_user_id) REFERENCES users(id) ON DELETE CASCADE
);