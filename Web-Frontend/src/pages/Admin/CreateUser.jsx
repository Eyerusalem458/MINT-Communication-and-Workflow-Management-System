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

  const [countryCode, setCountryCode] = useState("+251");
const phoneValidator = (phone) => {
  return /^[0-9]{7,12}$/.test(phone.replace(/\s/g, ""));
};
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

    // ✅ phone validation
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
      setTimeout(() => navigate("/admin/users"), 1500);
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to create user");
    } finally {
      setBusy(false);
    }
  };;

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

            <div
              className="floating-group floating-group--phone"
              style={{ padding: 0, overflow: "hidden" }}
            >
              {/* <span>📞</span> */}
              <div className="phone-input-wrapper">
                <select
                  className="country-code-select"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  {[
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
                  ].map(([name, code]) => (
                    <option key={code + name} value={code}>
                      {name} ({code})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    // ✅ only allow numbers and spaces
                    const val = e.target.value.replace(/[^0-9\s]/g, "");
                    setFormData((prev) => ({ ...prev, phone: val }));
                    setTouched((prev) => ({ ...prev, phone: true }));
                  }}
                  placeholder={
                    countryCode === "+251"
                      ? "9XX XXX XXX"
                      : countryCode === "+1"
                        ? "XXX XXX XXXX"
                        : countryCode === "+44"
                          ? "7XXX XXXXXX"
                          : "XXX XXX XXXX"
                  }
                  maxLength={12}
                />
              </div>
              <label>Phone</label>
            </div>

            {/* ✅ phone validation hint */}
            {touched.phone &&
              formData.phone &&
              !phoneValidator(formData.phone) && (
                <div className="errorText">
                  Enter a valid phone number (digits only, 7-12 digits)
                </div>
              )}

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
