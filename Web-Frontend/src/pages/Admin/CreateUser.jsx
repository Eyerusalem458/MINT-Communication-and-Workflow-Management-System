import { useState } from "react";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { createUser } from "../../api/userApi";

const DEPARTMENTS = [
  "Minister's Support Staff Unit",
  "Public Relations and Communications",
  "Innovation and Technology Sector",
  "Digital Economy Sector",
  "Innovation and Technology Research",
  "Creative Works Development",
  "Technology Transfer",
  "Innovation Hub Management",
  "Standardization and Quality Control",
  "Digital Infrastructure",
  "Digital Services Development",
  "Cyber Security",
  "E-Commerce Development",
  "Data Management and Analysis",
];

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
  const [busy, setBusy] = useState(false);
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

  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);

  const pwRules = passwordValidator(formData.password);
  const [touched, setTouched] = useState({});

const allPwOk = Object.values(pwRules).every(Boolean);

  // const getPasswordMessage = () => {
  //   const missing = [];
  //   if (!passwordRules.length) missing.push("8 characters");
  //   if (!passwordRules.uppercase) missing.push("1 uppercase letter");
  //   if (!passwordRules.lowercase) missing.push("1 lowercase letter");
  //   if (!passwordRules.number) missing.push("1 number");
  //   if (!passwordRules.symbol) missing.push("1 special symbol");
  //   return missing.length > 0
  //     ? `✖️ Must include: ${missing.join(", ")}`
  //     : "✔️ Password looks good!";
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.accountType) {
      showErrorToast("Please select an account type!");
      return;
    }

    if (!allPwOk) {
      showErrorToast("Password does not meet requirements");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showErrorToast("Passwords do not match");
      return;
    }

    setBusy(true);
    try {
      await createUser({
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        gender: formData.gender,
        password: formData.password,
        role: formData.accountType,
      });
      showSuccessToast("User Created Successfully!");
      setTimeout(() => navigate("/admin/users"), 1500);
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to create user");
    } finally {
      setBusy(false);
    }
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
            {[
              {
                label: "Account Type",
                name: "accountType",
                type: "select",
                opts: [
                  { v: "", l: "Select account type" },
                  { v: "admin", l: "Admin" },
                  { v: "manager", l: "Manager" },
                  { v: "staff", l: "Staff" },
                ],
              },
              { label: "First Name", name: "firstName", type: "text" },
              { label: "Middle Name", name: "middleName", type: "text" },
              { label: "Last Name", name: "lastName", type: "text" },
              {
                label: "Gender",
                name: "gender",
                type: "select",
                opts: [
                  { v: "", l: "Select gender" },
                  { v: "Male", l: "Male" },
                  { v: "Female", l: "Female" },
                ],
              },
            ].map(({ label, name, type, opts }) => (
              <div className="floating-group" key={name}>
                {type === "select" ? (
                  <select
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required={name !== "middleName"}
                  >
                    {opts.map((o) => (
                      <option key={o.v} value={o.v}>
                        {o.l}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required={name !== "middleName"}
                  />
                )}
                <label>{label}</label>
              </div>
            ))}

            <div className="floating-group">
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d}> {d}</option>
                ))}
              </select>
              <label>Department</label>
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
            {/* {touched.email &&
              formData.email &&
              !isEmailValid(formData.email) && (
                <div className="errorText">Invalid email</div>
              )} */}

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
                type={showPw ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label>Password</label>
              <div
                className="eye-icon"
                onClick={() => setShowPw((prev) => !prev)}
              >
                {showPw ? "🙈" : "👁"}
              </div>
            </div>

            {touched.password && formData.password && (
              <div
                className="password-hint"
                style={{ color: allPwOk ? "green" : "red" }}
              >
                {allPwOk
                  ? "✔️ Password looks good!"
                  : `✖️ Must include: ${[
                      !pwRules.length && "8 chars",
                      !pwRules.uppercase && "uppercase",
                      !pwRules.lowercase && "lowercase",
                      !pwRules.number && "number",
                      !pwRules.symbol && "symbol",
                    ]
                      .filter(Boolean)
                      .join(", ")}`}
              </div>
            )}

            <div className="floating-group icon-input">
              <span>🔒</span>
              <input
                type={showCPw ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <label>Confirm Password</label>
              <div
                className="eye-icon"
                onClick={() => setShowCPw((prev) => !prev)}
              >
                {showCPw ? "🙈" : "👁"}
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

          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? "Creating..." : "Create User"}
          </Button>
        </div>
      </form>
    </div>
  );
}

