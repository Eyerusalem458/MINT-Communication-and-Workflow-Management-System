import { useState } from "react";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const passwordValidator = (password) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[!@#$%^&*]/.test(password),
  };
};

export default function CreateUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    accountType: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRules, setPasswordRules] = useState(passwordValidator(""));
  const [touched, setTouched] = useState({});

  const updatePasswordRules = (password) => {
    const rules = passwordValidator(password);
    setPasswordRules(rules);
    return rules;
  };

  const getPasswordMessage = () => {
    const missing = [];
    if (!passwordRules.length) missing.push("8 characters");
    if (!passwordRules.uppercase) missing.push("1 uppercase letter");
    if (!passwordRules.lowercase) missing.push("1 lowercase letter");
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
    setTouched((prev) => ({ ...prev, [name]: true }));
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
    <div className="staff-card staff-card--full">
      {/* HEADER */}
      <div className="staff-card-header">
        
        <p className="staff-card-subtitle">
          Add a new user to the system with proper role and access.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="admin-form modern-form">
        <div className="admin-form-grid">
          {/* LEFT COLUMN */}
          <div className="admin-form-column">
            <h4 className="form-section-title">Personal Info</h4>
            <div className="floating-group">
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
              <label>Account Type</label>
            </div>

            <div className="floating-group">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <label>First Name</label>
            </div>

            <div className="floating-group">
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
              />
              <label>Middle Name</label>
            </div>

            <div className="floating-group">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
              <label>Last Name</label>
            </div>

            <div className="floating-group">
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select department</option>

                <optgroup label="Top Level">
                  <option>Minister's Support Staff Unit</option>
                  <option>Public Relations and Communications</option>
                </optgroup>

                <optgroup label="Middle Management">
                  <option>Innovation and Technology Sector</option>
                  <option>Digital Economy Sector</option>
                </optgroup>

                <optgroup label="Innovation & Technology Cluster">
                  <option>Innovation and Technology Research</option>
                  <option>Creative Works Development</option>
                  <option>Technology Transfer</option>
                  <option>Innovation Hub Management</option>
                  <option>Standardization and Quality Control</option>
                </optgroup>

                <optgroup label="Digital Economy Cluster">
                  <option>Digital Infrastructure</option>
                  <option>Digital Services Development</option>
                  <option>Cyber Security</option>
                  <option>E-Commerce Development</option>
                  <option>Data Management and Analysis</option>
                </optgroup>
              </select>
              <label>Department</label>
            </div>

            <div className="floating-group">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <label>Gender</label>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="admin-form-column">
            <h4 className="form-section-title">Account Info</h4>
            <div className="floating-group icon-input">
              <span>📧</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label>Email</label>
            </div>
            {touched.email &&
              formData.email &&
              !isEmailValid(formData.email) && (
                <div className="errorText">Invalid email</div>
              )}

            <div className="floating-group icon-input">
              <span>📞</span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <label>Phone</label>
            </div>

            <div className="floating-group icon-input">
              <span>🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label>Password</label>
              <div
                className="eye-icon"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "🙈" : "👁"}
              </div>
            </div>

            {touched.password && formData.password && (
              <div
                className="password-hint"
                style={{
                  color: Object.values(passwordRules).every(Boolean)
                    ? "green"
                    : "red",
                }}
              >
                {getPasswordMessage()}
              </div>
            )}

            <div className="floating-group icon-input">
              <span>🔒</span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <label>Confirm Password</label>
              <div
                className="eye-icon"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? "🙈" : "👁"}
              </div>
            </div>

            {touched.confirmPassword &&
              formData.confirmPassword &&
              formData.password !== formData.confirmPassword && (
                <div className="errorText">Passwords do not match</div>
              )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="staff-modal-footer">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>

          <Button type="submit" variant="primary">
            Create User
          </Button>
        </div>
      </form>
    </div>
  );
}
