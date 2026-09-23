/** 8–128 chars, at least one uppercase letter, one digit, and one special character. */
export const PASSWORD_HINT =
  "Use 8 or more characters with an uppercase letter, a number, and a special character.";

export const PASSWORD_PATTERN =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/;

export const PASSWORD_PATTERN_HTML =
  "(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,128}";

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { id: "upper", label: "An uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { id: "digit", label: "A number", test: (value: string) => /\d/.test(value) },
  {
    id: "special",
    label: "A special character",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

export function passwordRuleStatus(value: string) {
  return PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    met: rule.test(value),
  }));
}

export function isStrongPassword(value: string) {
  return PASSWORD_PATTERN.test(value);
}
