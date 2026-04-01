// Email validation
export const isEmailValid = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Email rules checker
export const checkEmailRules = (email) => {
  return {
    hasAt: email.includes("@"),
    hasDot: email.includes("."),
    noSpaces: !email.includes(" "),
  };
};

// Email message generator
export const getEmailMessage = (rules = {}) => {
  const missing = [];

  if (!rules.hasAt) missing.push("@");
  if (!rules.hasDot) missing.push("dot (.)");
  if (!rules.noSpaces) missing.push("no spaces");

  return missing.length > 0
    ? `✖ Must include: ${missing.join(", ")}`
    : "✔ Email looks good!";
};
// Password rules checker (returns object like your state)
export const checkPasswordRules = (password) => {
  return {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[!@#$%^&*]/.test(password),
  };
};

// Generate message (same as your function)
export const getPasswordMessage = (passwordRules) => {
  const missing = [];

  if (!passwordRules.length) missing.push("6 characters");
  if (!passwordRules.uppercase) missing.push("1 uppercase letter");
  if (!passwordRules.number) missing.push("1 number");
  if (!passwordRules.symbol) missing.push("1 special symbol");

  return missing.length > 0
    ? `✖ Must include: ${missing.join(", ")}`
    : "✔ Password looks good!";
};
