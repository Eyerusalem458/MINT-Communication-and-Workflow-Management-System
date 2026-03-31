import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const passwordValidator = (password) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  number: /[0-9]/.test(password),
  symbol: /[!@#$%^&*]/.test(password),
});

export default function CreateUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    accountType: "",
    email: "",
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRules, setPasswordRules] = useState(passwordValidator(""));

  const updatePasswordRules = (password) => {
    const rules = passwordValidator(password);
    setPasswordRules(rules);
    return rules;
  };

  const getPasswordMessage = () => {
    const missing = [];
    if (!passwordRules.length) missing.push("8 characters");
    if (!passwordRules.uppercase) missing.push("1 uppercase letter");
    if (!passwordRules.number) missing.push("1 number");
    if (!passwordRules.symbol) missing.push("1 special symbol");

    return missing.length > 0
      ? `✖️ Must include: ${missing.join(", ")}`
      : "✔️ Password looks good!";
  };

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") updatePasswordRules(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.accountType) {
      toast.error("Please select an account type!");
      return;
    }

    if (!isEmailValid(formData.email)) {
      toast.error("Please enter a valid email!");
      return;
    }

    const currentRules = updatePasswordRules(formData.password);
    if (Object.values(currentRules).includes(false)) {
      toast.error("Password does not meet requirements!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    toast.success("User Created Successfully!", {
      position: "top-right",
      autoClose: 2000,
      onClose: () => navigate("/admin/users"),
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-top">
        <h2>Create User</h2>
        <p>Enter new user details below.</p>
      </div>

      <div className="formCard">
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-grid">
            <div className="admin-form-column">
              <label>Account Type</label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                required
              >
                <option value="">Select account type</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>

              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />

              <label>Middle Name</label>
              <input
                type="text"
                name="middleName"
                placeholder="Middle Name"
                value={formData.middleName}
                onChange={handleChange}
              />

              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-column">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {formData.email && !isEmailValid(formData.email) && (
                <div className="errorText">✖️ Please enter a valid email</div>
              )}

              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="+251 Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />

              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "🙈" : "👁"}
                </span>
              </div>
              {formData.password && (
                <div className="password-hint">{getPasswordMessage()}</div>
              )}

              <label>Confirm Password</label>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? "🙈" : "👁"}
                </span>
              </div>
            </div>
          </div>

          <button type="submit" className="submitBtn">
            Create User
          </button>
        </form>
      </div>
    </div>
  );
}
