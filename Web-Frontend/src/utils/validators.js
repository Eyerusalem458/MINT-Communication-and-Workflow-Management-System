export const validateEmail = (email) => {
  const regex = /\S+@\S+\.\S+/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const passwordStrength = (password) => {
  if (password.length > 10) return "Strong";
  if (password.length > 6) return "Medium";
  return "Weak";
};
