/** Always offer Google/Apple on login and register. Auth.js still needs env; empty creds fail at OAuth. */
export function googleLoginEnabled() {
  return true;
}

export function appleLoginEnabled() {
  return true;
}
