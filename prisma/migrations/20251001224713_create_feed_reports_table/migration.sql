CREATE TABLE IF NOT EXISTS feed_reports (
  id BIGSERIAL PRIMARY KEY,
  type_id BIGINT NOT NULL,
  reporter_user_id BIGINT NOT NULL,
  reporter_message VARCHAR(256),
  in_review BOOLEAN NOT NULL DEFAULT FALSE,
  in_review_since TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  closed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  moderation_id BIGINT NOT NULL,
  member_user_id BIGINT NOT NULL,
  member_feed_post_id BIGINT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT fk_feed_reports_type_id FOREIGN KEY (type_id) REFERENCES feed_report_types(id) ON DELETE CASCADE,
  CONSTRAINT fk_feed_reports_reporter_user_id FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_feed_reports_member_user_id FOREIGN KEY (member_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_feed_reports_moderation_id FOREIGN KEY (moderation_id) REFERENCES members_moderations(id) ON DELETE CASCADE,
  CONSTRAINT fk_feed_reports_member_post_id FOREIGN KEY (member_feed_post_id) REFERENCES feed_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_feed_reports_created_at ON feed_reports (created_at);
