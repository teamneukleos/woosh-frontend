/** 8–128 chars, at least one uppercase letter, one digit, and one special character. */
export const PASSWORD_HINT =
  "Use 8 or more characters with an uppercase letter, a number, and a special character.";

export const PASSWORD_PATTERN =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/;

export const PASSWORD_PATTERN_HTML =
  "(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,128}";

export function isStrongPassword(value: string) {
  return PASSWORD_PATTERN.test(value);
}
