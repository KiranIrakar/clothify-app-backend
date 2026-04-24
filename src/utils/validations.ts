export function validateEmail(email: string) {
  console.log("VALIDATING EMAIL:", email);

  const normalized = email.trim().toLowerCase();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.(com|in|org|net)$/;

  if (!emailRegex.test(normalized)) {
    throw {
      statusCode: 400,
      message: "Invalid email format"
    };
  }

  return normalized;
}