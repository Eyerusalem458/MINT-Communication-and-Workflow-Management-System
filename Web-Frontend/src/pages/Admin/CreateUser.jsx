import { useState } from "react";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { createUser } from "../../api/userApi";

const DEPARTMENTS = [
  "Minister's Office (ሚኒስትር ፅህፈት ቤት)",
  "Legal Affairs (ህግ ጉዳዮች)",
  "Public Relations and Communications (የህዝብ ግንኙነትና ኮሙኒኬሽን)",
  "Audit Service (ኦዲት አገልግሎት)",
  "Ethics and Anti-Corruption (ስነምግባርና ፀረሙስና)",
  "Strategy Affairs (ትራቴጂ ጉዳዮች)",
  "Procurement and Finance (ግዥና ፋይናንስ)",
  "Human Resource Administration (የቃትና ሰው ሃብት አስተዳደር)",
  "Basic Services (ሰረታዊ አገልግሎት)",
  "ICT and Digital Economy Sector (አይሲቲ እና ዲጂታል ኢኮኖሚ ዘርፍ)",
  "Innovation and Research Sector (ኢኖቬሽንና ምርምር ዘርፍ)",
  "National Research and Development (ሀገራዊ የምርምር ልማት)",
  "Technology Transfer and Development (የቴክኖሎጂ ሽግግርና ልማት)",
  "Innovation and Startup Development (የኢኖቬሽንና ስታርትአፕ ልማት)",
  "Government ICT Infrastructure (የመንግስት አይሲቲ መሰረተልማት ግንባታ እና አስተዳደር)",
  "Digital Economy Development (የዲጂታል ኢኮኖሚ ልማት)",
  "E-Government Development (ኤሌክትሮኒክስ መንግስት ልማት)",
  "Digital Infrastructure (ዲጂታል መሰረተልማት ግንባታ)",
  "Digital Standards and Regulation (ዲጂታል ስታንዳርድ እና ሬጉሌሽን)",
  "Innovation and Technology Data Management (የኢኖቬሽንና ቴክኖሎጂ መረጃ ልማትና አስተዳደር)",
  "Innovation Development (ኢኖቬሽን ልማት)",
  "National Research Infrastructure (የሀገራዊ ምርምር መሰረተልማት ግንባታ)",
  "Technology Transfer and Linkage (የቴክኖሎጂ ሽግግርና ትስስር)",
  "Indigenous Technology Development (ሀገር በቀል ቴክኖሎጂ ልማት)",
  "Innovation Infrastructure (ኢኖቬሽን መሰረተልማት)",
  "National E-Government Plan Coordination (የብሄራዊ የኤ-መንግስት ዕቅድ ማስተባበሪያ)",
  "Government Digital Services Development (መንግስታዊ ዲጂታል አገልግሎቶች ልማት እና አስተዳደር)",
  "National Data Resource Development (ብሄራዊ ዳታ ሃብት ልማት ቅንጅት)",
  "Data Center Administration (የዳታ ማዕክል አስተዳደር)",
  "Quality and Security Management (የጥራት እና ደህንነት አስተዳደር)",
  "Digital Community Development (የዲጂታል ማሕበረስብ ልማት)",
  "Digital Industry Development (የዲጂታል ኢንዱስትሪ ልማት)",
  "Startup and Innovative Enterprise Development (የስታርፕ እና ኢኖቫቲቭ ኢንተርፕራይዝ ልማት)",
  "National Research Ethics and Science Culture (ሀገራዊ የምርምር ስነምግባርና የሳይንስ ባህል ግንባታ)",
  "International Relations and Cooperation (የዓለም አቀፍ ግንኙነትና ትብብር)",
  "Regional and Council Affairs (የክልሎች እና ካውንስል ጉዳዮች)",
  "Private Sector (የግል ዘርፍ)",
  "Innovation Fund Office (የኢኖቬሽን ፈንድ ፅህፈት ቤት)",
  "Collaboration and Partnership (የትብብር እና ትስስር)",
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
