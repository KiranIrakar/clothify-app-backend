export function validateIndianPhone(phone: string): string {
  if (!phone || typeof phone !== "string") {
    throw new Error("Phone number is required.");
  }

  const normalized = phone.trim();
  const pattern = /^\+91[6-9][0-9]{9}$/;

  if (!pattern.test(normalized)) {
    throw new Error("Phone number must start with +91 and contain 10 digits, e.g. +919999999999.");
  }

  return normalized;
}
