-- Apply once to the ARTECH_TICKETS_DB D1 binding. No existing tables are changed.
CREATE TABLE IF NOT EXISTS artech_tickets (
 id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, request_hash TEXT NOT NULL,
 visit_date TEXT NOT NULL, visit_time TEXT NOT NULL, level TEXT NOT NULL,
 guests INTEGER NOT NULL CHECK(guests BETWEEN 1 AND 20), adults INTEGER NOT NULL,
 children INTEGER NOT NULL, seniors INTEGER NOT NULL, buyer_name TEXT NOT NULL,
 buyer_email TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('pending','confirmed','used','cancelled')),
 created_at TEXT NOT NULL, updated_at TEXT, client_hash TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS artech_tickets_rate ON artech_tickets(client_hash,created_at);
