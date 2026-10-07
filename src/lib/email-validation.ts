const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string) {
  return value.length > 0 && value === value.trim() && emailPattern.test(value);
}
