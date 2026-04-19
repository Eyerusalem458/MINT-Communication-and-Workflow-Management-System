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
    <div className="admin-page" style={{ background: 'linear-gradient(135deg, #f4f7fb 0%, #e4edf9 100%)', minHeight: '100vh', padding: '32px 0' }}>
      <div className="admin-top" style={{ maxWidth: 1100, margin: '0 auto 18px auto', padding: '0 16px' }}>
        <h2 style={{ fontWeight: 700, marginBottom: 4 }}>Create User</h2>
        <p style={{ color: '#555', fontSize: 17 }}>Enter new user details below.</p>
      </div>
      <div className="formCard" style={{
        maxWidth: 1100,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px #0001',
        padding: '36px 32px 28px 32px',
        minHeight: 420,
      }}>
        <form onSubmit={handleSubmit} className="admin-form" autoComplete="off">
          <div className="admin-form-grid" style={{ display: 'flex', gap: 40 }}>
            <div className="admin-form-column" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'flex-start' }}>
              <label>Account Type</label>
              <select
                className="staff-input"
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                required
                style={{ marginBottom: 12 }}
              >
                <option value="">Select account type</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>

              <label>First Name</label>
              <input
                className="staff-input"
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                style={{ marginBottom: 12 }}
              />

              <label>Middle Name</label>
              <input
                className="staff-input"
                type="text"
                name="middleName"
                placeholder="Middle Name"
                value={formData.middleName}
                onChange={handleChange}
                style={{ marginBottom: 12 }}
              />

              <label>Last Name</label>
              <input
                className="staff-input"
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                style={{ marginBottom: 12 }}
              />

              <label>Department</label>
              <select
                className="staff-input"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                style={{ marginBottom: 12 }}
              >
                <option value="">Select department</option>
                <optgroup label="Top Level">
                  <option value="Minister's Support Staff Unit">Minister's Support Staff Unit</option>
                  <option value="Public Relations and Communications">Public Relations and Communications</option>
                </optgroup>
                <optgroup label="Middle Management">
                  <option value="Innovation and Technology Sector">Innovation and Technology Sector</option>
                  <option value="Digital Economy Sector">Digital Economy Sector</option>
                </optgroup>
                <optgroup label="Innovation & Technology Cluster">
                  <option value="Innovation and Technology Research">Innovation and Technology Research</option>
                  <option value="Creative Works Development">Creative Works Development</option>
                  <option value="Technology Transfer">Technology Transfer</option>
                  <option value="Innovation Hub Management">Innovation Hub Management</option>
                  <option value="Standardization and Quality Control">Standardization and Quality Control</option>
                </optgroup>
                <optgroup label="Digital Economy Cluster">
                  <option value="Digital Infrastructure">Digital Infrastructure</option>
                  <option value="Digital Services Development">Digital Services Development</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="E-Commerce Development">E-Commerce Development</option>
                  <option value="Data Management and Analysis">Data Management and Analysis</option>
                </optgroup>
              </select>

              <label>Gender</label>
              <select
                className="staff-input"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                style={{ marginBottom: 12 }}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="admin-form-column" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'flex-start' }}>
              <label>Email</label>
              <input
                className="staff-input"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ marginBottom: 12, maxWidth: 400, width: '100%' }}
              />
              {touched.email && formData.email && !isEmailValid(formData.email) && (
                <div className="errorText">✖️ Please enter a valid email</div>
              )}

              <label>Phone Number</label>
              <input
                className="staff-input"
                type="tel"
                name="phone"
                placeholder="+251 Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                style={{ marginBottom: 12, maxWidth: 400, width: '100%' }}
              />

              <label>Password</label>
              <div className="password-wrapper" style={{ marginBottom: 0, position: 'relative' }}>
                <input
                  className="staff-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ marginBottom: 0 }}
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{ top: '50%' }}
                >
                  {showPassword ? "🙈" : "👁"}
                </span>
              </div>
              {touched.password && formData.password && (
                <div className="password-hint" style={{ color: passwordRules.length && passwordRules.uppercase && passwordRules.lowercase && passwordRules.number && passwordRules.symbol ? 'green' : 'red', fontSize: 13, marginTop: 4, marginBottom: 8, position: 'static', left: 'unset', top: 'unset' }}>{getPasswordMessage()}</div>
              )}

              <label>Confirm Password</label>
              <div className="password-wrapper" style={{ position: 'relative' }}>
                <input
                  className="staff-input"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{ marginBottom: 0 }}
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  style={{ top: '50%' }}
                >
                  {showConfirmPassword ? "🙈" : "👁"}
                </span>
              </div>
              {touched.confirmPassword && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="errorText" style={{ color: 'red', fontSize: 13, marginTop: 4, marginBottom: 8, position: 'static', left: 'unset', top: 'unset' }}>✖️ Passwords do not match</div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 40 }}>
            <Button type="submit" size="sm" variant="primary">
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
