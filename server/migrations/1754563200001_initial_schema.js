'use strict'

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- ------------------------------------------------------------------ users
    CREATE TABLE users (
      id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      username       TEXT        NOT NULL,
      email          TEXT        NOT NULL,
      password_hash  TEXT        NOT NULL,
      role           TEXT        NOT NULL DEFAULT 'user'
                                 CHECK (role IN ('user', 'moderator', 'admin', 'owner')),
      status         TEXT        NOT NULL DEFAULT 'active'
                                 CHECK (status IN ('active', 'suspended', 'deleted')),
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at  TIMESTAMPTZ
    );
    CREATE UNIQUE INDEX users_username_idx ON users (LOWER(username));
    CREATE UNIQUE INDEX users_email_idx    ON users (LOWER(email));

    -- --------------------------------------------------------------- products
    CREATE TABLE products (
      id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
      slug             TEXT          NOT NULL UNIQUE,
      name             TEXT          NOT NULL,
      description      TEXT          NOT NULL DEFAULT '',
      product_type     TEXT          NOT NULL
                                     CHECK (product_type IN ('single_character', 'character_pack', 'full_archive')),
      price_amount     NUMERIC(10,2) NOT NULL CHECK (price_amount >= 0),
      price_currency   TEXT          NOT NULL DEFAULT 'usd',
      resource_mapping JSONB         NOT NULL DEFAULT '{}',
      active           BOOLEAN       NOT NULL DEFAULT TRUE,
      created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    );

    -- --------------------------------------------------------- payment_orders
    CREATE TABLE payment_orders (
      id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id             UUID          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      product_id          UUID          NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
      provider            TEXT          NOT NULL,
      provider_payment_id TEXT,
      provider_invoice_id TEXT,
      provider_status     TEXT,
      order_status        TEXT          NOT NULL DEFAULT 'pending'
                                        CHECK (order_status IN ('pending', 'processing', 'completed', 'failed', 'expired', 'refunded')),
      expected_amount     NUMERIC(10,2) NOT NULL,
      expected_currency   TEXT          NOT NULL,
      checkout_url        TEXT,
      created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      fulfilled_at        TIMESTAMPTZ
    );
    CREATE INDEX payment_orders_user_idx     ON payment_orders (user_id);
    CREATE INDEX payment_orders_status_idx   ON payment_orders (order_status);
    CREATE INDEX payment_orders_provider_idx ON payment_orders (provider_payment_id);

    -- -------------------------------------------------------- webhook_events
    CREATE TABLE webhook_events (
      id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      provider            TEXT        NOT NULL,
      event_hash          TEXT        NOT NULL UNIQUE,
      provider_payment_id TEXT,
      payload             JSONB       NOT NULL,
      status              TEXT        NOT NULL DEFAULT 'received'
                                      CHECK (status IN ('received', 'processed', 'failed', 'duplicate')),
      processing_result   TEXT,
      received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      processed_at        TIMESTAMPTZ
    );

    -- ---------------------------------------------------------- entitlements
    CREATE TABLE entitlements (
      id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id       UUID        REFERENCES products(id) ON DELETE RESTRICT,
      entitlement_type TEXT        NOT NULL
                                   CHECK (entitlement_type IN ('character', 'pack', 'full_archive')),
      resource_mapping JSONB       NOT NULL DEFAULT '{}',
      status           TEXT        NOT NULL DEFAULT 'active'
                                   CHECK (status IN ('active', 'revoked', 'expired')),
      source           TEXT        NOT NULL
                                   CHECK (source IN ('payment', 'redemption', 'admin', 'owner')),
      source_reference TEXT,
      granted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at       TIMESTAMPTZ,
      revoked_at       TIMESTAMPTZ
    );
    CREATE INDEX entitlements_user_idx   ON entitlements (user_id);
    CREATE INDEX entitlements_status_idx ON entitlements (status);

    -- ------------------------------------------------------- redemption_codes
    CREATE TABLE redemption_codes (
      id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      code_hash           TEXT        NOT NULL UNIQUE,
      product_id          UUID        REFERENCES products(id) ON DELETE SET NULL,
      entitlement_mapping JSONB       NOT NULL DEFAULT '{}',
      max_uses            INTEGER     NOT NULL DEFAULT 1 CHECK (max_uses >= 1),
      uses                INTEGER     NOT NULL DEFAULT 0 CHECK (uses >= 0),
      active              BOOLEAN     NOT NULL DEFAULT TRUE,
      expires_at          TIMESTAMPTZ,
      created_by          UUID        REFERENCES users(id) ON DELETE SET NULL,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    COMMENT ON COLUMN redemption_codes.code_hash
      IS 'SHA-256 hex of the raw code. Raw code is shown once at creation and never stored.';

    -- ----------------------------------------------------- redemption_events
    CREATE TABLE redemption_events (
      id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      code_id        UUID        NOT NULL REFERENCES redemption_codes(id) ON DELETE RESTRICT,
      user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      entitlement_id UUID        REFERENCES entitlements(id),
      redeemed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ip_address     TEXT,
      user_agent     TEXT
    );
    CREATE UNIQUE INDEX redemption_events_unique_idx ON redemption_events (code_id, user_id);

    -- ------------------------------------------------------------ audit_logs
    CREATE TABLE audit_logs (
      id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_user_id UUID        REFERENCES users(id) ON DELETE SET NULL,
      action        TEXT        NOT NULL,
      target_type   TEXT,
      target_id     TEXT,
      metadata      JSONB       NOT NULL DEFAULT '{}',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX audit_logs_actor_idx  ON audit_logs (actor_user_id);
    CREATE INDEX audit_logs_action_idx ON audit_logs (action);
    CREATE INDEX audit_logs_time_idx   ON audit_logs (created_at DESC);
  `)
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS audit_logs          CASCADE;
    DROP TABLE IF EXISTS redemption_events   CASCADE;
    DROP TABLE IF EXISTS redemption_codes    CASCADE;
    DROP TABLE IF EXISTS entitlements        CASCADE;
    DROP TABLE IF EXISTS webhook_events      CASCADE;
    DROP TABLE IF EXISTS payment_orders      CASCADE;
    DROP TABLE IF EXISTS products            CASCADE;
    DROP TABLE IF EXISTS users               CASCADE;
    DROP EXTENSION IF EXISTS pgcrypto;
  `)
}
