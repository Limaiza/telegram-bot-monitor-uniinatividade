CREATE TABLE groups (
id SERIAL PRIMARY KEY,
monitored_group_id BIGINT UNIQUE NOT NULL,
monitored_group_name TEXT,
report_group_id BIGINT NOT NULL,
report_group_name TEXT,
created_by BIGINT,
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE group_members (
id SERIAL PRIMARY KEY,
telegram_id BIGINT NOT NULL,
group_id BIGINT NOT NULL,
username TEXT,
first_name TEXT,
last_name TEXT,
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT NOW(),
UNIQUE(telegram_id, group_id)
);

CREATE TABLE chat_sessions (
telegram_id BIGINT NOT NULL,
group_id BIGINT NOT NULL,
started_at TIMESTAMP NOT NULL,
last_message_at TIMESTAMP NOT NULL,
PRIMARY KEY (telegram_id, group_id)
);

CREATE TABLE achievements (
id SERIAL PRIMARY KEY,
telegram_id BIGINT NOT NULL,
group_id BIGINT NOT NULL,
achievement_date DATE NOT NULL,
achieved_at TIMESTAMP DEFAULT NOW(),
UNIQUE(
telegram_id,
group_id,
achievement_date
)
);

CREATE TABLE messages (
id BIGSERIAL PRIMARY KEY,
telegram_id BIGINT NOT NULL,
group_id BIGINT NOT NULL,
sent_at TIMESTAMP DEFAULT NOW()
);