// src/utils/auth.ts

export function generateVerificationToken() {
  // Tu implementación, por ejemplo:
  const crypto = require("crypto");
  const token = crypto.randomBytes(32).toString("hex");
  return token;
}
