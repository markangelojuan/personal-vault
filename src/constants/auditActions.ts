export const AUDIT_ACTIONS = {
  // Auth
  LOGIN_SUCCESS: "login_success",
  LOGIN_FAILED: "login_failed",
  LOGOUT: "logout",
  UNAUTHORIZED_LOGIN_ATTEMPT: "unauthorized_login_attempt",
  SESSION_ENDED: "session_ended",
  
  // Passphrase
  PASSPHRASE_SETUP: "passphrase_setup",
  PASSPHRASE_SETUP_FAILED: "passphrase_setup_failed",
  MAX_ATTEMPT_REACHED: "max_attempt_reached",
  VAULT_UNLOCK: "vault_unlock",
  VAULT_UNLOCK_FAILED: "vault_unlock_failed",

  // Secrets
  SECRET_CREATED: "secret_created",
  SECRET_UPDATED: "secret_updated",
  SECRET_DELETED: "secret_deleted",
} as const;