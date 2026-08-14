'use strict'

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.sql(`
    -- Add Clerk identity column. Nullable so existing local/bcrypt accounts
    -- (including owner sendai) are unaffected. UNIQUE enforces one Clerk
    -- identity per local user row.
    ALTER TABLE users
      ADD COLUMN clerk_id TEXT UNIQUE;

    -- Clerk-only accounts have no local password. Drop NOT NULL so those rows
    -- can be inserted with clerk_id set and password_hash NULL.
    ALTER TABLE users
      ALTER COLUMN password_hash DROP NOT NULL;
  `)
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.sql(`
    -- Guard: refuse rollback if any Clerk-provisioned users exist.
    -- Rolling back with NULL password_hash rows would violate the restored
    -- NOT NULL constraint and corrupt data.
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM users WHERE clerk_id IS NOT NULL) THEN
        RAISE EXCEPTION
          'Migration rollback blocked: % Clerk-linked user(s) exist. '
          'De-provision all Clerk accounts before rolling back.',
          (SELECT COUNT(*) FROM users WHERE clerk_id IS NOT NULL);
      END IF;
    END $$;

    ALTER TABLE users
      ALTER COLUMN password_hash SET NOT NULL;

    ALTER TABLE users
      DROP COLUMN clerk_id;
  `)
}
