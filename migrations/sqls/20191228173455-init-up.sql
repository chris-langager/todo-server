CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY NOT NULL,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT (now() at time zone 'utc'),
    date_updated TIMESTAMP WITH TIME ZONE DEFAULT (now() at time zone 'utc'),
    email text NOT NULL,
    password text NOT NULL
);

CREATE UNIQUE INDEX ON users (email);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    date_time TIMESTAMP WITH TIME ZONE DEFAULT (now() at time zone 'utc'),
    event_type text NOT NULL,
    aggregate_type text NOT NULL,
    aggregate_id text NOT NULL,
    actor text NOT NULL,
    payload JSON NOT NULL
);

CREATE INDEX ON events (actor);

CREATE INDEX ON events (aggregate_type);

CREATE INDEX ON events (aggregate_id);