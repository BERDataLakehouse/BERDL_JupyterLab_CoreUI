/**
 * Token expiration monitoring settings
 */

// Warning shows 5 minutes before expiration
export const WARNING_BEFORE_EXPIRY_MS = 5 * 60 * 1000;

// After dismissing, warning returns after 1 minute
export const DISMISS_COOLDOWN_MS = 60 * 1000;

// Check token status periodically (polling interval)
export const CHECK_INTERVAL_MS = 30 * 1000;
