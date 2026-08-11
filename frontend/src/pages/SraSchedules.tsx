/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import isEmail from "validator/lib/isEmail";
import disposableDomains from "disposable-email-domains";
import SraSchedulesDesign from "./SraSchedulesDesign";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SraEvent {
  id: string;
  name: string;
  image: string | null;
  date: string;
  time: string;
  venue: string;
}

export interface SraJobListing {
  id: string;
  company: string;
  position: string;
  location: string;
  educationLabel: string;
  requiredSkills: string[];
}

export interface SraFormState {
  sraId: string;
  sraName: string;
  sraDate: string;
  sraTime: string;
  sraVenue: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  contact: string;
  address: string;
  birthday: string;
  gender: string;
  civilStatus: string;
  hasDisability: string;
  disabilityDetails: string;
  employmentStatus: string;
  ofwStatus: string;
  fourPsBeneficiary: string;
  educationalAttainment: string;
  school: string;
  degree: string;
  preferredOccupation: string;
  preferredWorkLocation: string;
  languages: string[];
  otherLanguage: string;
  consentGiven: boolean;
}

// ── SRA Events ────────────────────────────────────────────────────────────────

export const SRA_EVENTS: SraEvent[] = [
  {
    id: "buildnet-sra",
    name: "Buildnet Special Recruitment Activity",
    image: "/assets/buildnet.jpg",
    date: "May 27–28, 2026",
    time: "8:00 AM – 5:00 PM",
    venue: "Halls of Governors",
  },
  {
    id: "capiz-sra-2",
    name: "Capiz Skills Hiring Fair",
    image: null,
    date: "July 18, 2026",
    time: "9:00 AM – 4:00 PM",
    venue: "Roxas City Convention Center",
  },
  {
    id: "capiz-sra-3",
    name: "Western Visayas Talent Connect",
    image: null,
    date: "August 22, 2026",
    time: "8:00 AM – 3:00 PM",
    venue: "Capiz State University Gym",
  },
];

// ── Placeholder banner colors per event (for null-image events) ───────────────

export const SRA_PLACEHOLDER_COLORS: Record<string, { bg: string; accent: string }> = {
  "capiz-sra-2": { bg: "#1a1d5e", accent: "#f5c842" },
  "capiz-sra-3": { bg: "#c0151a", accent: "#ffffff" },
};

// ── Data ──────────────────────────────────────────────────────────────────────

export const SRA_JOB_LISTINGS: SraJobListing[] = [
  {
    id: "buildnet-engineer",
    company: "Buildnet",
    position: "Civil Engineer",
    location: "Roxas City, Capiz",
    educationLabel: "College Graduate",
    requiredSkills: ["AutoCAD", "Project Management", "Structural Analysis"],
  },
  {
    id: "buildnet-foreman",
    company: "Buildnet",
    position: "Construction Foreman",
    location: "Roxas City, Capiz",
    educationLabel: "High School Graduate",
    requiredSkills: ["Site Supervision", "Safety Compliance", "Team Leadership"],
  },
  {
    id: "sample-admin",
    company: "Sample Company B",
    position: "Administrative Assistant",
    location: "Roxas City, Capiz",
    educationLabel: "College Graduate",
    requiredSkills: ["MS Office", "Communication Skills", "Filing & Records"],
  },
];

export const SRA_EDUCATION_LEVELS = [
  { rank: 1, label: "Elementary Graduate" },
  { rank: 2, label: "High School Graduate" },
  { rank: 3, label: "Senior High School" },
  { rank: 4, label: "College Undergraduate" },
  { rank: 5, label: "College Graduate" },
  { rank: 6, label: "Post-Graduate" },
  { rank: 7, label: "Vocational (TESDA) Graduate" },
  { rank: 8, label: "ALS Graduate" },
];

export const SRA_DEGREE_OPTIONS = [
  "BS Accountancy",
  "BS Accounting Information System",
  "BS Agriculture",
  "BS Agricultural Engineering",
  "BS Architecture",
  "BS Biology",
  "BS Business Administration",
  "BS Civil Engineering",
  "BS Computer Engineering",
  "BS Computer Science",
  "BS Criminology",
  "BS Education",
  "BS Electrical Engineering",
  "BS Electronics Engineering",
  "BS Elementary Education",
  "BS Fisheries",
  "BS Hospitality Management",
  "BS Industrial Engineering",
  "BS Information Technology",
  "BS Marine Engineering",
  "BS Marine Transportation",
  "BS Mechanical Engineering",
  "BS Midwifery",
  "BS Nursing",
  "BS Nutrition and Dietetics",
  "BS Office Administration",
  "BS Pharmacy",
  "BS Psychology",
  "BS Public Administration",
  "BS Secondary Education",
  "BS Social Work",
  "BS Tourism Management",
  "Bachelor of Arts in Communication",
  "Bachelor of Arts in Political Science",
  "Bachelor of Elementary Education",
  "Bachelor of Secondary Education",
];

export const SRA_GENDER_OPTIONS     = ["Male", "Female", "Prefer not to say"];
export const SRA_CIVIL_OPTIONS      = ["Single", "Married", "Widowed", "Separated", "Divorced"];
export const SRA_DISABILITY_OPTIONS = ["None", "Yes"];
export const SRA_EMPLOYMENT_OPTIONS = ["Employed", "Unemployed"];
export const SRA_OFW_OPTIONS        = ["Yes", "No"];
export const SRA_FOURPS_OPTIONS     = ["Yes", "No"];
export const SRA_LANGUAGE_OPTIONS   = ["Filipino", "English", "Hiligaynon/Ilonggo", "Cebuano", "Others"];

// ── Registration Deadline ─────────────────────────────────────────────────────
// Same pattern as the Attendance / LRA pre-registration forms: a live
// countdown badge in the header, and a "closed" screen once the deadline
// passes. Ported from Attendance.tsx.

export const APPLICATION_DEADLINE = "2026-10-10";

export function isApplicationClosed(): boolean {
  const now      = new Date();
  const deadline = new Date(APPLICATION_DEADLINE + "T23:59:59");
  return now > deadline;
}

export function formatDeadline(): string {
  const deadline = new Date(APPLICATION_DEADLINE + "T12:00:00");
  return deadline.toLocaleDateString("en-PH", {
    year:  "numeric",
    month: "long",
    day:   "numeric",
  });
}

export interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

/**
 * Live countdown to APPLICATION_DEADLINE (23:59:59 on the deadline date).
 * Call this fresh (e.g. inside a setInterval tick) to get updated values.
 */
export function getTimeRemaining(): TimeRemaining {
  const deadline = new Date(APPLICATION_DEADLINE + "T23:59:59").getTime();
  const now      = Date.now();
  const totalMs  = Math.max(0, deadline - now);

  const days    = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
  const seconds = Math.floor((totalMs / 1000) % 60);

  return { totalMs, days, hours, minutes, seconds, expired: totalMs <= 0 };
}

// ── Apps Script endpoint ──────────────────────────────────────────────────────
// This one URL now handles BOTH the OTP send/verify actions AND the final
// registration submission — see SraSchedules.gs. It's also passed to
// EmailVerificationGate as `otpUrl` so the gate hits the same self-contained
// backend, rather than a separate shared OTP-Service.gs.

export const SRA_SUBMIT_URL =
  "https://script.google.com/macros/s/AKfycbzlCH-FoeIh7OBzFtYiwfOKPTk61-1yT6kepAFIblUKHiF4EFbLWdZihv4towLX76K_uA/exec";

// ── Payload builder ───────────────────────────────────────────────────────────
// verificationToken is the signed HMAC token issued by SraSchedules.gs after
// a successful OTP check. doPost rejects the submission outright if this
// doesn't verify, so it's required here.

export function buildSraPayload(form: SraFormState, verificationToken: string) {
  return {
    formType:              "sra",
    verificationToken:     verificationToken,
    sraName:               form.sraName,
    sraDate:               form.sraDate,
    sraTime:               form.sraTime,
    sraVenue:              form.sraVenue,
    firstName:             form.firstName.trim(),
    middleName:            form.middleName.trim(),
    lastName:              form.lastName.trim(),
    email:                 form.email.trim(),
    contact:               form.contact.trim(),
    address:               form.address.trim(),
    birthday:              form.birthday,
    gender:                form.gender,
    civilStatus:           form.civilStatus,
    hasDisability:         form.hasDisability,
    disabilityDetails:     form.disabilityDetails.trim(),
    employmentStatus:      form.employmentStatus,
    ofwStatus:             form.ofwStatus,
    fourPsBeneficiary:     form.fourPsBeneficiary,
    educationalAttainment: form.educationalAttainment,
    school:                form.school.trim(),
    degree:                form.degree.trim(),
    preferredOccupation:   form.preferredOccupation.trim(),
    preferredWorkLocation: form.preferredWorkLocation.trim(),
    languages:             form.languages,
    otherLanguage:         form.otherLanguage.trim(),
  };
}

// ── Submission ────────────────────────────────────────────────────────────────
// No longer uses mode: "no-cors" — a rejected/invalid verification token needs
// to come back as a real, readable error message instead of silently failing
// as if it succeeded.

export async function submitSra(
  form: SraFormState,
  verificationToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(SRA_SUBMIT_URL, {
      method:  "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body:    JSON.stringify(buildSraPayload(form, verificationToken)),
    });
    const data = await res.json();

    if (data.success) return { success: true };
    return { success: false, error: data.error || "Something went wrong. Please try again." };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ── Validation ────────────────────────────────────────────────────────────────

const DISPOSABLE_DOMAIN_SET = new Set(disposableDomains);

/** True if the email's domain is a known disposable/throwaway provider. */
export function isDisposableEmail(value: string): boolean {
  const domain = value.trim().split("@")[1]?.toLowerCase();
  return !!domain && DISPOSABLE_DOMAIN_SET.has(domain);
}

const POPULAR_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "yahoo.com.ph",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "aol.com",
  "live.com",
  "msn.com",
  "protonmail.com",
];

function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = [];
  for (let i = 0; i < rows; i++) dp.push(new Array(cols).fill(0));
  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[rows - 1][cols - 1];
}

export function findLikelyDomainTypo(value: string): string | null {
  const domain = value.trim().split("@")[1]?.toLowerCase();
  if (!domain) return null;
  if (POPULAR_EMAIL_DOMAINS.includes(domain)) return null;

  for (const popular of POPULAR_EMAIL_DOMAINS) {
    const distance = levenshteinDistance(domain, popular);
    if (distance > 0 && distance <= 2 && Math.abs(domain.length - popular.length) <= 2) {
      return popular;
    }
  }
  return null;
}

export function getSraIssues(form: SraFormState): string[] {
  const issues: string[] = [];

  if (!form.firstName.trim())  issues.push("First name is required.");
  if (!form.middleName.trim()) issues.push("Middle name is required.");
  if (!form.lastName.trim())   issues.push("Last name is required.");

  if (!form.email.trim()) {
    issues.push("Email address is required.");
  } else if (!isEmail(form.email.trim())) {
    issues.push("Please enter a valid email address.");
  } else if (isDisposableEmail(form.email.trim())) {
    issues.push("Temporary/disposable email addresses are not allowed. Please use a permanent email.");
  } else {
    const suggestedDomain = findLikelyDomainTypo(form.email.trim());
    if (suggestedDomain) {
      const localPart = form.email.trim().split("@")[0];
      issues.push("Did you mean " + localPart + "@" + suggestedDomain + "? Please double-check your email for typos.");
    }
  }

  if (!form.contact.trim())           issues.push("Contact number is required.");
  if (!form.address.trim())           issues.push("Address is required.");
  if (!form.birthday.trim())          issues.push("Birthday is required.");
  if (!form.gender.trim())            issues.push("Gender is required.");
  if (!form.civilStatus.trim())       issues.push("Civil status is required.");
  if (!form.hasDisability.trim())     issues.push("Please indicate if you have a disability.");
  if (!form.employmentStatus.trim())  issues.push("Employment status is required.");
  if (!form.ofwStatus.trim())         issues.push("OFW status is required.");
  if (!form.fourPsBeneficiary.trim()) issues.push("Please indicate if you are a 4Ps beneficiary.");

  if (!form.educationalAttainment.trim()) issues.push("Educational attainment is required.");
  if (!form.school.trim())                issues.push("School name is required.");
  if (!form.degree.trim())                issues.push("Degree/Course is required.");

  if (!form.preferredOccupation.trim())   issues.push("Preferred occupation is required.");
  if (!form.preferredWorkLocation.trim()) issues.push("Preferred work location is required.");

  if (form.languages.length === 0) {
    issues.push("Please select at least one language you're proficient in.");
  }
  if (form.languages.includes("Others") && !form.otherLanguage.trim()) {
    issues.push("Please specify your other language(s).");
  }

  if (!form.consentGiven) {
    issues.push("You must agree to the data privacy consent before submitting.");
  }

  return issues;
}

// ── localStorage helpers ──────────────────────────────────────────────────────

const LS_FORM      = "peso_sra_draft";
const LS_SUBMITTED = "peso_sra_submitted";

const EMPTY_FORM: SraFormState = {
  sraId:                 "",
  sraName:               "",
  sraDate:               "",
  sraTime:               "",
  sraVenue:              "",
  firstName:             "",
  middleName:            "",
  lastName:              "",
  email:                 "",
  contact:               "",
  address:               "",
  birthday:              "",
  gender:                "",
  civilStatus:           "",
  hasDisability:         "",
  disabilityDetails:     "",
  employmentStatus:      "",
  ofwStatus:             "",
  fourPsBeneficiary:     "",
  educationalAttainment: "",
  school:                "",
  degree:                "",
  preferredOccupation:   "",
  preferredWorkLocation: "",
  languages:             [],
  otherLanguage:         "",
  consentGiven:          false,
};

// PII fields stripped before writing the draft to localStorage — same
// pattern as Jobs.tsx / Attendance.tsx / LraSchedules.tsx. They reset on
// refresh; everything else autosaves.
const SENSITIVE_FIELDS: (keyof SraFormState)[] = ["email", "contact", "address"];

function loadForm(): SraFormState {
  try {
    const raw = localStorage.getItem(LS_FORM);
    if (!raw) return EMPTY_FORM;
    return { ...EMPTY_FORM, ...(JSON.parse(raw) as Partial<SraFormState>) };
  } catch { return EMPTY_FORM; }
}

function saveForm(form: SraFormState): void {
  try {
    const safeToStore: Partial<SraFormState> = { ...form };
    for (const field of SENSITIVE_FIELDS) delete safeToStore[field];
    localStorage.setItem(LS_FORM, JSON.stringify(safeToStore));
  } catch { /* silent */ }
}

function loadSubmitted(): boolean {
  try { return localStorage.getItem(LS_SUBMITTED) === "true"; }
  catch { return false; }
}

function saveSubmitted(): void {
  try { localStorage.setItem(LS_SUBMITTED, "true"); } catch { /* silent */ }
}

function clearDraft(): void {
  try {
    localStorage.removeItem(LS_FORM);
    localStorage.removeItem(LS_SUBMITTED);
  } catch { /* silent */ }
}

// ── Root component ────────────────────────────────────────────────────────────

export default function SraSchedules() {
  const navigate = useNavigate();

  const [form, setForm]                   = useState<SraFormState>(() => loadForm());
  const [attempted, setAttempted]         = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [submitError, setSubmitError]     = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(() => loadSubmitted());
  const [isMobile, setIsMobile]           = useState(false);
  const formTopRef                        = useRef<HTMLDivElement>(null);

  // Email verification state — intentionally NOT persisted to localStorage.
  // A page reload always requires re-verification, on purpose.
  const [emailVerified, setEmailVerified]         = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  useEffect(() => {
    const mq     = window.matchMedia("(max-width: 900px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    saveForm(form);
  }, [form]);

  useEffect(() => {
    if (submitSuccess) {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [submitSuccess]);

  const issues = attempted ? getSraIssues(form) : [];

  const updateForm = (patch: Partial<SraFormState>) => {
    setForm(prev => ({ ...prev, ...patch }));
    setSubmitError(null);
  };

  const toggleLanguage = (lang: string) => {
    setForm(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }));
    setSubmitError(null);
  };

  const handleSelectSra = (event: { id: string; name: string; date: string; time: string; venue: string }) => {
    setForm(prev => ({
      ...prev,
      sraId:    event.id,
      sraName:  event.name,
      sraDate:  event.date,
      sraTime:  event.time,
      sraVenue: event.venue,
    }));
    setAttempted(false);
    setSubmitError(null);
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleBackToEvents = () => {
    setForm(prev => ({
      ...prev,
      sraId:    "",
      sraName:  "",
      sraDate:  "",
      sraTime:  "",
      sraVenue: "",
    }));
    setAttempted(false);
    setSubmitError(null);
  };

  // Called by EmailVerificationGate once the OTP is confirmed. Fills the
  // form's email field and unlocks the rest of the form.
  const handleEmailVerified = (email: string, token: string) => {
    setForm(prev => ({ ...prev, email }));
    setVerificationToken(token);
    setEmailVerified(true);
    setSubmitError(null);
  };

  // Lets someone back out of a completed verification to use a different
  // address. Clears the stored token too, since it's bound to the old email.
  const handleChangeEmail = () => {
    setEmailVerified(false);
    setVerificationToken(null);
    setForm(prev => ({ ...prev, email: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    setSubmitError(null);

    // Second guard on top of the UI hiding the form until verified — submit
    // can't proceed without a verified token no matter how it's triggered.
    if (!emailVerified || !verificationToken) {
      setSubmitError("Please verify your email before submitting.");
      return;
    }

    const validationIssues = getSraIssues(form);
    if (validationIssues.length > 0) return;

    setSubmitting(true);

    const payload = buildSraPayload(form, verificationToken);
    console.log("Submitting SRA payload:", JSON.stringify(payload, null, 2));

    const result = await submitSra(form, verificationToken);
    setSubmitting(false);

    console.log("SRA submit result:", result);

    if (result.success) {
      saveSubmitted();
      setSubmitSuccess(true);
    } else {
      setSubmitError(result.error || "Something went wrong. Please try again.");
    }
  };

  const handleRegisterAnother = () => {
    clearDraft();
    setForm(EMPTY_FORM);
    setAttempted(false);
    setSubmitError(null);
    setSubmitSuccess(false);
    setEmailVerified(false);
    setVerificationToken(null);
  };

  return (
    <SraSchedulesDesign
      form={form}
      issues={issues}
      attempted={attempted}
      submitting={submitting}
      submitError={submitError}
      submitSuccess={submitSuccess}
      isMobile={isMobile}
      formTopRef={formTopRef}
      emailVerified={emailVerified}
      onUpdateForm={updateForm}
      onToggleLanguage={toggleLanguage}
      onSelectSra={handleSelectSra}
      onBackToEvents={handleBackToEvents}
      onEmailVerified={handleEmailVerified}
      onChangeEmail={handleChangeEmail}
      onSubmit={handleSubmit}
      onNavigateHome={() => navigate("/")}
      onRegisterAnother={handleRegisterAnother}
    />
  );
}