import { useState, useMemo, useContext } from "react";
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination";
import Modal from "../../components/ui/Modal";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { UserContext } from "../../context/UserContext";
import { createUser } from "../../api/userApi";
import { NavCreateUserIcon } from "../../pages/shared/icon";

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

const COUNTRY_CODES = [
  ["🇪🇹 Ethiopia", "+251"],
  ["🇦🇫 Afghanistan", "+93"],
  ["🇦🇱 Albania", "+355"],
  ["🇩🇿 Algeria", "+213"],
  ["🇦🇴 Angola", "+244"],
  ["🇦🇷 Argentina", "+54"],
  ["🇦🇲 Armenia", "+374"],
  ["🇦🇺 Australia", "+61"],
  ["🇦🇹 Austria", "+43"],
  ["🇦🇿 Azerbaijan", "+994"],
  ["🇧🇭 Bahrain", "+973"],
  ["🇧🇩 Bangladesh", "+880"],
  ["🇧🇾 Belarus", "+375"],
  ["🇧🇪 Belgium", "+32"],
  ["🇧🇯 Benin", "+229"],
  ["🇧🇴 Bolivia", "+591"],
  ["🇧🇦 Bosnia", "+387"],
  ["🇧🇼 Botswana", "+267"],
  ["🇧🇷 Brazil", "+55"],
  ["🇧🇬 Bulgaria", "+359"],
  ["🇧🇫 Burkina Faso", "+226"],
  ["🇧🇮 Burundi", "+257"],
  ["🇨🇲 Cameroon", "+237"],
  ["🇨🇦 Canada", "+1"],
  ["🇨🇫 CAR", "+236"],
  ["🇹🇩 Chad", "+235"],
  ["🇨🇱 Chile", "+56"],
  ["🇨🇳 China", "+86"],
  ["🇨🇴 Colombia", "+57"],
  ["🇨🇬 Congo", "+242"],
  ["🇨🇩 Congo DRC", "+243"],
  ["🇨🇷 Costa Rica", "+506"],
  ["🇨🇮 Côte d'Ivoire", "+225"],
  ["🇭🇷 Croatia", "+385"],
  ["🇨🇺 Cuba", "+53"],
  ["🇨🇾 Cyprus", "+357"],
  ["🇨🇿 Czech Republic", "+420"],
  ["🇩🇰 Denmark", "+45"],
  ["🇩🇯 Djibouti", "+253"],
  ["🇩🇴 Dominican Rep.", "+1-809"],
  ["🇪🇨 Ecuador", "+593"],
  ["🇪🇬 Egypt", "+20"],
  ["🇸🇻 El Salvador", "+503"],
  ["🇬🇶 Eq. Guinea", "+240"],
  ["🇪🇷 Eritrea", "+291"],
  ["🇪🇪 Estonia", "+372"],
  ["🇸🇿 Eswatini", "+268"],
  ["🇫🇯 Fiji", "+679"],
  ["🇫🇮 Finland", "+358"],
  ["🇫🇷 France", "+33"],
  ["🇬🇦 Gabon", "+241"],
  ["🇬🇲 Gambia", "+220"],
  ["🇬🇪 Georgia", "+995"],
  ["🇩🇪 Germany", "+49"],
  ["🇬🇭 Ghana", "+233"],
  ["🇬🇷 Greece", "+30"],
  ["🇬🇹 Guatemala", "+502"],
  ["🇬🇳 Guinea", "+224"],
  ["🇬🇾 Guyana", "+592"],
  ["🇭🇹 Haiti", "+509"],
  ["🇭🇳 Honduras", "+504"],
  ["🇭🇺 Hungary", "+36"],
  ["🇮🇸 Iceland", "+354"],
  ["🇮🇳 India", "+91"],
  ["🇮🇩 Indonesia", "+62"],
  ["🇮🇷 Iran", "+98"],
  ["🇮🇶 Iraq", "+964"],
  ["🇮🇪 Ireland", "+353"],
  ["🇮🇱 Israel", "+972"],
  ["🇮🇹 Italy", "+39"],
  ["🇯🇲 Jamaica", "+1-876"],
  ["🇯🇵 Japan", "+81"],
  ["🇯🇴 Jordan", "+962"],
  ["🇰🇿 Kazakhstan", "+7"],
  ["🇰🇪 Kenya", "+254"],
  ["🇰🇼 Kuwait", "+965"],
  ["🇰🇬 Kyrgyzstan", "+996"],
  ["🇱🇦 Laos", "+856"],
  ["🇱🇻 Latvia", "+371"],
  ["🇱🇧 Lebanon", "+961"],
  ["🇱🇸 Lesotho", "+266"],
  ["🇱🇷 Liberia", "+231"],
  ["🇱🇾 Libya", "+218"],
  ["🇱🇹 Lithuania", "+370"],
  ["🇱🇺 Luxembourg", "+352"],
  ["🇲🇬 Madagascar", "+261"],
  ["🇲🇼 Malawi", "+265"],
  ["🇲🇾 Malaysia", "+60"],
  ["🇲🇻 Maldives", "+960"],
  ["🇲🇱 Mali", "+223"],
  ["🇲🇹 Malta", "+356"],
  ["🇲🇷 Mauritania", "+222"],
  ["🇲🇺 Mauritius", "+230"],
  ["🇲🇽 Mexico", "+52"],
  ["🇲🇩 Moldova", "+373"],
  ["🇲🇳 Mongolia", "+976"],
  ["🇲🇪 Montenegro", "+382"],
  ["🇲🇦 Morocco", "+212"],
  ["🇲🇿 Mozambique", "+258"],
  ["🇲🇲 Myanmar", "+95"],
  ["🇳🇦 Namibia", "+264"],
  ["🇳🇵 Nepal", "+977"],
  ["🇳🇱 Netherlands", "+31"],
  ["🇳🇿 New Zealand", "+64"],
  ["🇳🇮 Nicaragua", "+505"],
  ["🇳🇪 Niger", "+227"],
  ["🇳🇬 Nigeria", "+234"],
  ["🇲🇰 N. Macedonia", "+389"],
  ["🇳🇴 Norway", "+47"],
  ["🇴🇲 Oman", "+968"],
  ["🇵🇰 Pakistan", "+92"],
  ["🇵🇸 Palestine", "+970"],
  ["🇵🇦 Panama", "+507"],
  ["🇵🇬 Papua New Guinea", "+675"],
  ["🇵🇾 Paraguay", "+595"],
  ["🇵🇪 Peru", "+51"],
  ["🇵🇭 Philippines", "+63"],
  ["🇵🇱 Poland", "+48"],
  ["🇵🇹 Portugal", "+351"],
  ["🇶🇦 Qatar", "+974"],
  ["🇷🇴 Romania", "+40"],
  ["🇷🇺 Russia", "+7"],
  ["🇷🇼 Rwanda", "+250"],
  ["🇸🇦 Saudi Arabia", "+966"],
  ["🇸🇳 Senegal", "+221"],
  ["🇷🇸 Serbia", "+381"],
  ["🇸🇨 Seychelles", "+248"],
  ["🇸🇱 Sierra Leone", "+232"],
  ["🇸🇬 Singapore", "+65"],
  ["🇸🇰 Slovakia", "+421"],
  ["🇸🇮 Slovenia", "+386"],
  ["🇸🇴 Somalia", "+252"],
  ["🇿🇦 South Africa", "+27"],
  ["🇸🇸 South Sudan", "+211"],
  ["🇪🇸 Spain", "+34"],
  ["🇱🇰 Sri Lanka", "+94"],
  ["🇸🇩 Sudan", "+249"],
  ["🇸🇷 Suriname", "+597"],
  ["🇸🇪 Sweden", "+46"],
  ["🇨🇭 Switzerland", "+41"],
  ["🇸🇾 Syria", "+963"],
  ["🇹🇼 Taiwan", "+886"],
  ["🇹🇯 Tajikistan", "+992"],
  ["🇹🇿 Tanzania", "+255"],
  ["🇹🇭 Thailand", "+66"],
  ["🇹🇬 Togo", "+228"],
  ["🇹🇹 Trinidad & Tobago", "+1-868"],
  ["🇹🇳 Tunisia", "+216"],
  ["🇹🇷 Turkey", "+90"],
  ["🇹🇲 Turkmenistan", "+993"],
  ["🇺🇬 Uganda", "+256"],
  ["🇺🇦 Ukraine", "+380"],
  ["🇦🇪 UAE", "+971"],
  ["🇬🇧 United Kingdom", "+44"],
  ["🇺🇸 United States", "+1"],
  ["🇺🇾 Uruguay", "+598"],
  ["🇺🇿 Uzbekistan", "+998"],
  ["🇻🇦 Vatican", "+379"],
  ["🇻🇪 Venezuela", "+58"],
  ["🇻🇳 Vietnam", "+84"],
  ["🇾🇪 Yemen", "+967"],
  ["🇿🇲 Zambia", "+260"],
  ["🇿🇼 Zimbabwe", "+263"],
];

const passwordValidator = (p) => ({
  length: p.length >= 8,
  uppercase: /[A-Z]/.test(p),
  lowercase: /[a-z]/.test(p),
  number: /[0-9]/.test(p),
  symbol: /[!@#$%^&*]/.test(p),
});
const phoneValidator = (p) => /^[0-9]{7,12}$/.test(p.replace(/\s/g, ""));

const STATUS_STYLE = {
  Active: { bg: "#e8f5e9", color: "#27ae60" },
  Inactive: { bg: "#fde8e8", color: "#c0392b" },
};
const ROLE_STYLE = {
  admin: { bg: "#e8eaf6", color: "#3949ab" },
  manager: { bg: "#e3f2fd", color: "#1976D2" },
  staff: { bg: "#f3e5f5", color: "#7b1fa2" },
};

// ─── Embedded Create User Form ────────────────────────────────────────────
function CreateUserForm({ onSuccess, onCancel }) {
  const [busy, setBusy] = useState(false);
  const [countryCode, setCountryCode] = useState("+251");
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [touched, setTouched] = useState({});
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

  const pwRules = passwordValidator(formData.password);
  const allPwOk = Object.values(pwRules).every(Boolean);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setTouched((p) => ({ ...p, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.accountType) {
      showErrorToast("Please select an account type!");
      return;
    }
    if (formData.phone && !phoneValidator(formData.phone)) {
      showErrorToast("Please enter a valid phone number");
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
        phone: formData.phone
          ? `${countryCode}${formData.phone.replace(/\s/g, "")}`
          : "",
        department: formData.department,
        gender: formData.gender,
        password: formData.password,
        role: formData.accountType,
      });
      showSuccessToast("User Created Successfully!");
      onSuccess();
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to create user");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <style>{`
        .cu-wrap {
          background: #fff; border-radius: 12px; padding: 24px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07); margin-top: 20px;
          border-top: 3px solid #2196F3;
        }
        .cu-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .cu-title  { margin: 0; font-size: 15px; font-weight: 700; color: #1a1a2e; }
        .cu-grid   { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .cu-col h4 { margin: 0 0 14px; font-size: 13px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: .5px; }
        .cu-field  { margin-bottom: 14px; }
        .cu-label  { display: block; font-size: 12px; font-weight: 600; color: #555; margin-bottom: 5px; }
        .cu-input  {
          width: 100%; padding: 9px 12px; border: 1px solid #e0e0e0;
          border-radius: 8px; font-size: 13px; font-family: inherit;
          background: #f8f9fb; color: #333; outline: none; box-sizing: border-box;
          transition: border-color .2s;
        }
        .cu-input:focus { border-color: #90CAF9; background: #fff; }
        .cu-pw-wrap { position: relative; }
        .cu-pw-wrap .cu-input { padding-right: 36px; }
        .cu-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; font-size: 16px; }
        .cu-phone-row { display: flex; }
        .cu-phone-row .cu-input:first-child { width: 130px; flex-shrink: 0; border-radius: 8px 0 0 8px; border-right: none; }
        .cu-phone-row .cu-input:last-child  { flex: 1; border-radius: 0 8px 8px 0; }
        .cu-hint { font-size: 11px; margin-top: 4px; }
        .cu-hint--ok  { color: #27ae60; }
        .cu-hint--err { color: #c0392b; }
        .cu-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f0f2f5; }
        .cu-cancel-btn {
          padding: 8px 16px; border-radius: 8px; border: 1px solid #e0e0e0;
          background: #f8f9fb; font-size: 13px; font-weight: 600; color: #555; cursor: pointer;
        }
        .cu-cancel-btn:hover { background: #e0e0e0; }
        .cu-submit-btn {
          padding: 8px 20px; border-radius: 8px; border: none;
          background: #2196F3; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;
          transition: background .15s;
        }
        .cu-submit-btn:hover:not(:disabled) { background: #1976D2; }
        .cu-submit-btn:disabled { opacity: .5; cursor: not-allowed; }
        @media (max-width: 768px) { .cu-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="cu-wrap">
        <div className="cu-header">
          <h3 className="cu-title">➕ Add New User</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="cu-grid">
            {/* LEFT */}
            <div className="cu-col">
              <h4>Personal Info</h4>
              {[
                {
                  label: "Account Type",
                  name: "accountType",
                  type: "select",
                  opts: [
                    { v: "", l: "Select type" },
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
                <div className="cu-field" key={name}>
                  <label className="cu-label">{label}</label>
                  {type === "select" ? (
                    <select
                      className="cu-input"
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
                      className="cu-input"
                      type="text"
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      required={name !== "middleName"}
                    />
                  )}
                </div>
              ))}
              <div className="cu-field">
                <label className="cu-label">Department</label>
                <select
                  className="cu-input"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* RIGHT */}
            <div className="cu-col">
              <h4>Account Info</h4>
              <div className="cu-field">
                <label className="cu-label">Email</label>
                <input
                  className="cu-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="cu-field">
                <label className="cu-label">Phone</label>
                <div className="cu-phone-row">
                  <select
                    className="cu-input"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    {COUNTRY_CODES.map(([name, code]) => (
                      <option key={code + name} value={code}>
                        {name} ({code})
                      </option>
                    ))}
                  </select>
                  <input
                    className="cu-input"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9\s]/g, "");
                      setFormData((p) => ({ ...p, phone: v }));
                      setTouched((p) => ({ ...p, phone: true }));
                    }}
                    placeholder="9XX XXX XXX"
                    maxLength={12}
                  />
                </div>
                {touched.phone &&
                  formData.phone &&
                  !phoneValidator(formData.phone) && (
                    <div className="cu-hint cu-hint--err">
                      Enter a valid phone number (7-12 digits)
                    </div>
                  )}
              </div>
              <div className="cu-field">
                <label className="cu-label">Password</label>
                <div className="cu-pw-wrap">
                  <input
                    className="cu-input"
                    type={showPw ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <span className="cu-eye" onClick={() => setShowPw((p) => !p)}>
                    {showPw ? "🙈" : "👁"}
                  </span>
                </div>
                {touched.password && formData.password && (
                  <div
                    className={`cu-hint ${allPwOk ? "cu-hint--ok" : "cu-hint--err"}`}
                  >
                    {allPwOk
                      ? "✔️ Password looks good!"
                      : `✖️ Need: ${[!pwRules.length && "8 chars", !pwRules.uppercase && "uppercase", !pwRules.lowercase && "lowercase", !pwRules.number && "number", !pwRules.symbol && "symbol"].filter(Boolean).join(", ")}`}
                  </div>
                )}
              </div>
              <div className="cu-field">
                <label className="cu-label">Confirm Password</label>
                <div className="cu-pw-wrap">
                  <input
                    className="cu-input"
                    type={showCPw ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <span
                    className="cu-eye"
                    onClick={() => setShowCPw((p) => !p)}
                  >
                    {showCPw ? "🙈" : "👁"}
                  </span>
                </div>
                {touched.confirmPassword &&
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <div className="cu-hint cu-hint--err">
                      Passwords do not match
                    </div>
                  )}
              </div>
            </div>
          </div>

          <div className="cu-footer">
            <button type="button" className="cu-cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="cu-submit-btn" disabled={busy}>
              {busy ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Main UserManagement ──────────────────────────────────────────────────
export default function UserManagement() {
  const { users, editUser, toggleStatus, loading } = useContext(UserContext);

  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editModal, setEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.role
    ) {
      showErrorToast("Please fill all required fields");
      return;
    }
    setBusy(true);
    try {
      await editUser(selectedUser._id, formData);
      setEditModal(false);
      showSuccessToast("User updated successfully");
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleStatus(id);
      showSuccessToast("User status updated");
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed");
    }
  };

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const name = `${u.firstName || ""} ${u.lastName || ""}`;
        const matchSearch =
          name.toLowerCase().includes(query.toLowerCase()) ||
          (u.email || "").toLowerCase().includes(query.toLowerCase());
        return (
          matchSearch &&
          (roleFilter === "" || u.role === roleFilter) &&
          (genderFilter === "" || u.gender === genderFilter) &&
          (deptFilter === "" || u.department === deptFilter) &&
          (statusFilter === "" || u.status === statusFilter)
        );
      }),
    [query, roleFilter, genderFilter, deptFilter, statusFilter, users],
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const activeCount = users.filter((u) => u.status === "Active").length;

  return (
    <>
      <style>{`
        .um-page { font-family: 'Segoe UI', sans-serif; box-sizing: border-box; }

        /* stats */
        .um-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
        .um-stat {
          background: #fff; border-radius: 10px; padding: 12px 18px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
          display: flex; align-items: center; gap: 10px;
        }
        .um-stat-dot { width: 10px; height: 10px; border-radius: 50%; }
        .um-stat-val { font-size: 20px; font-weight: 700; color: #1a1a2e; }
        .um-stat-label { font-size: 12px; color: #666; }

        /* toolbar */
        .um-toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; align-items: center; }
        .um-input {
          padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 8px;
          font-size: 13px; background: #f8f9fb; color: #333; outline: none;
          transition: border-color .2s;
        }
        .um-input:focus { border-color: #90CAF9; background: #fff; }
        .um-search { flex: 1; min-width: 180px; }
.um-btn-new {
  padding: 5px 10px; border-radius: 6px; border: none;
  font-size: 12px; font-weight: 600; cursor: pointer;
  transition: background .15s; display: flex; align-items: center; gap: 4px;
  white-space: nowrap; height: 30px;
}
        .um-btn-new--add    { background: #2196F3; color: #fff; }
        .um-btn-new--add:hover { background: #1976D2; }
        .um-btn-new--close  { background: #fde8e8; color: #c0392b; border: 1px solid #ef9a9a; }
        .um-btn-new--close:hover { background: #c0392b; color: #fff; }

        /* table */
        .um-table-wrap { overflow-x: auto; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.07); }
        .um-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .um-table th {
          text-align: left; padding: 11px 14px;
          background: #f4f6f8; color: #555;
          font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px;
          border-bottom: 1px solid #e8eaed; white-space: nowrap;
        }
        .um-table td { padding: 12px 14px; border-bottom: 1px solid #f0f2f5; color: #333; vertical-align: middle; }
        .um-table tbody tr:hover { background: #f8f9fb; }
        .um-table tbody tr:last-child td { border-bottom: none; }
        .um-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #2196F3, #6366f1);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; flex-shrink: 0;
        }
        .um-name-cell { display: flex; align-items: center; gap: 10px; }
        .um-name { font-weight: 500; color: #1a1a2e; }
        .um-email { font-size: 11px; color: #888; }
        .um-badge {
          display: inline-block; padding: 3px 10px; border-radius: 99px;
          font-size: 11px; font-weight: 600; white-space: nowrap;
        }
        .um-dept { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #666; font-size: 12px; }
        .um-actions { display: flex; gap: 6px; }
        .um-action-btn {
          padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
          cursor: pointer; border: 1px solid transparent; transition: all .15s;
        }
        .um-action-btn--edit       { background: #e3f2fd; color: #1976D2; border-color: #90CAF9; }
        .um-action-btn--edit:hover { background: #1976D2; color: #fff; }
        .um-action-btn--deactivate       { background: #fde8e8; color: #c0392b; border-color: #ef9a9a; }
        .um-action-btn--deactivate:hover { background: #c0392b; color: #fff; }
        .um-action-btn--activate       { background: #e8f5e9; color: #27ae60; border-color: #a5d6a7; }
        .um-action-btn--activate:hover { background: #27ae60; color: #fff; }
        .um-empty { text-align: center; padding: 40px; color: #aaa; font-size: 13px; }

        /* edit modal fields */
        .um-form-group { margin-bottom: 13px; }
        .um-form-label { display: block; font-size: 12px; font-weight: 600; color: #555; margin-bottom: 5px; }
        .um-form-input {
          width: 100%; padding: 9px 12px; border: 1px solid #e0e0e0;
          border-radius: 8px; font-size: 13px; font-family: inherit;
          background: #f8f9fb; color: #333; outline: none; box-sizing: border-box;
        }
        .um-form-input:focus { border-color: #90CAF9; background: #fff; }
        .um-modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
      `}</style>

      <div className="um-page">
        <p style={{ margin: "0 0 20px", color: "#555", fontSize: 14 }}>
          Manage system users, roles, and access.
        </p>

        {/* stats */}
        <div className="um-stats">
          {[
            { label: "Total Users", val: users.length, color: "#2196F3" },
            { label: "Active", val: activeCount, color: "#4CAF50" },
            {
              label: "Inactive",
              val: users.length - activeCount,
              color: "#F44336",
            },
            {
              label: "Managers",
              val: users.filter((u) => u.role === "manager").length,
              color: "#FF9800",
            },
            {
              label: "Staff",
              val: users.filter((u) => u.role === "staff").length,
              color: "#9C27B0",
            },
          ].map(({ label, val, color }) => (
            <div className="um-stat" key={label}>
              <div className="um-stat-dot" style={{ background: color }} />
              <div>
                <div className="um-stat-val">{val}</div>
                <div className="um-stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* toolbar */}
        <div className="um-toolbar">
          <input
            type="search"
            className="um-input um-search"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="um-input"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
          </select>
          <select
            className="um-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <select
            className="um-input"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            className="um-input"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="">All Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>
          <button
            className={`staff-btn staff-btn--sm ${showCreateForm ? "staff-btn--danger" : "staff-btn--primary"}`}
            onClick={() => setShowCreateForm((p) => !p)}
          >
            {showCreateForm ? (
              "✕ Close Form"
            ) : (
              <>
                <NavCreateUserIcon /> Create New User
              </>
            )}
          </button>
        </div>

        {/* table */}
        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Gender</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="um-empty">
                    Loading...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="um-empty">
                    No users found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const initials =
                    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
                  const rs = ROLE_STYLE[user.role] || {
                    bg: "#f0f0f0",
                    color: "#888",
                  };
                  const ss = STATUS_STYLE[user.status] || {
                    bg: "#f0f0f0",
                    color: "#888",
                  };
                  return (
                    <tr key={user._id}>
                      <td>
                        <div className="um-name-cell">
                          <div className="um-avatar">
                            {user.avatar ? (
                              <img
                                src={
                                  user.avatar.startsWith("http")
                                    ? user.avatar
                                    : `http://localhost:5000${user.avatar}`
                                }
                                alt={initials}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <div className="um-name">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="um-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="um-badge"
                          style={{ background: rs.bg, color: rs.color }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className="um-dept" title={user.department}>
                          {user.department}
                        </span>
                      </td>
                      <td style={{ color: "#666" }}>{user.gender}</td>
                      <td>
                        <span
                          className="um-badge"
                          style={{ background: ss.bg, color: ss.color }}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <div className="um-actions">
                          <button
                            className="um-action-btn um-action-btn--edit"
                            onClick={() => {
                              setSelectedUser(user);
                              setFormData({ ...user });
                              setEditModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className={`um-action-btn ${user.status === "Active" ? "um-action-btn--deactivate" : "um-action-btn--activate"}`}
                            onClick={() => handleToggle(user._id)}
                          >
                            {user.status === "Active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* inline create form */}
      {showCreateForm && (
        <CreateUserForm
          onSuccess={() => setShowCreateForm(false)}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* edit modal */}
      {editModal && (
        <Modal onClose={() => setEditModal(false)}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>Edit User</h3>
          {[
            { label: "First Name", name: "firstName", type: "text" },
            { label: "Last Name", name: "lastName", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Phone", name: "phone", type: "text" },
          ].map(({ label, name, type }) => (
            <div className="um-form-group" key={name}>
              <label className="um-form-label">{label}</label>
              <input
                type={type}
                name={name}
                className="um-form-input"
                value={formData[name] || ""}
                onChange={handleChange}
              />
            </div>
          ))}
          {[
            {
              label: "Role",
              name: "role",
              opts: ["admin", "manager", "staff"],
            },
            { label: "Gender", name: "gender", opts: ["Male", "Female"] },
            { label: "Status", name: "status", opts: ["Active", "Inactive"] },
          ].map(({ label, name, opts }) => (
            <div className="um-form-group" key={name}>
              <label className="um-form-label">{label}</label>
              <select
                name={name}
                className="um-form-input"
                value={formData[name] || ""}
                onChange={handleChange}
              >
                {opts.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="um-form-group">
            <label className="um-form-label">Department</label>
            <select
              name="department"
              className="um-form-input"
              value={formData.department || ""}
              onChange={handleChange}
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="um-modal-footer">
            <Button variant="ghost" onClick={() => setEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={busy}>
              {busy ? "Saving..." : "Update User"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
