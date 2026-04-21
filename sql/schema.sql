CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    anon_token CHAR(36) NOT NULL,
    display_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_anon_token (anon_token)
) ENGINE=InnoDB;

CREATE TABLE opinions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_opinions_created_at (created_at),
    CONSTRAINT fk_opinions_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_opinions_content_not_empty
        CHECK (CHAR_LENGTH(TRIM(content)) > 0)
) ENGINE=InnoDB;

CREATE TABLE opinion_reactions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    opinion_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    reaction ENUM('like', 'dislike') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_opinion_user (opinion_id, user_id),
    KEY idx_reactions_opinion_id (opinion_id),
    KEY idx_reactions_user_id (user_id),
    CONSTRAINT fk_reactions_opinion
        FOREIGN KEY (opinion_id) REFERENCES opinions(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reactions_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;