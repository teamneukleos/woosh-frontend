/** Google/Apple stay on Next Auth.js. Nest owns credentials; hide social until Nest has OAuth. */
export function googleLoginEnabled() {
  return false;
}

export function appleLoginEnabled() {
  return false;
}
