/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import isEmail from "validator/lib/isEmail";
import disposableDomains from "disposable-email-domains";
import JobFairSchedulesDesign from "./Jobfairschedulesdesign";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface JobFairSchedulesJobFair {
  id: string;
  name: string;
  image: string | null;
  date: string;
  time: string;
  venue: string;
}

export interface JobFairSchedulesJobListing {
  id: string;
  company: string;
  position: string;
  location: string;
  educationLabel: string;
  requiredSkills: string[];
}

export interface JobFairSchedulesFormState {
  jobFairId: string;
  jobFairName: string;
  jobFairDate: string;
  jobFairTime: string;
  jobFairVenue: string;
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

// ── Job Fairs ─────────────────────────────────────────────────────────────────

export const JOBFAIR_SCHEDULES_JOB_FAIRS: JobFairSchedulesJobFair[] = [
  {
    id: "hil-o-hanay",
    name: "Hil-O-Hanay Job Fair",
    image: "/assets/hil-o-hanay.jpg",
    date: "June 24, 2026",
    time: "8:00 AM – 5:00 PM",
    venue: "Sigma Cultural Heritage Center",
  },
  {
    id: "capiz-summer-fair",
    name: "Capiz Summer Job Fair",
    image: null,
    date: "July 15, 2026",
    time: "8:00 AM – 5:00 PM",
    venue: "Roxas City Convention Center",
  },
  {
    id: "roxas-hiring-expo",
    name: "Roxas Hiring Expo",
    image: null,
    date: "August 20, 2026",
    time: "9:00 AM – 4:00 PM",
    venue: "Plaza Baybay, Roxas City",
  },
];

// ── Placeholder banner colors per fair (for null-image fairs) ─────────────────

export const FAIR_PLACEHOLDER_COLORS: Record<string, { bg: string; accent: string }> = {
  "capiz-summer-fair": { bg: "#1a1d5e", accent: "#f5c842" },
  "roxas-hiring-expo": { bg: "#c0151a", accent: "#ffffff" },
};

// ── Data ─────────────────────────────────────────────────────────────────────

export const JOBFAIR_SCHEDULES_JOB_LISTINGS: JobFairSchedulesJobListing[] = [
  {
    id: "abc-cashier",
    company: "ABC Company",
    position: "Cashier",
    location: "Roxas City, Capiz",
    educationLabel: "High School Graduate",
    requiredSkills: ["Basic Math", "1 year of experience of Customer Service", "Experienced in Cash Handling"],
  },
  {
    id: "abc-supervisor",
    company: "ABC Company",
    position: "Supervisor",
    location: "Roxas City, Capiz",
    educationLabel: "College Graduate",
    requiredSkills: ["Leadership", "2 years of supervisory experience"],
  },
  {
    id: "xyz-bagger",
    company: "XYZ Company",
    position: "Bagger",
    location: "Roxas City, Capiz",
    educationLabel: "Elementary Graduate",
    requiredSkills: ["Good Physical Stamina", "Experienced in Customer Service"],
  },
];

export const JOBFAIR_SCHEDULES_EDUCATION_LEVELS = [
  { rank: 1, label: "Elementary Graduate" },
  { rank: 2, label: "High School Graduate" },
  { rank: 3, label: "Senior High School" },
  { rank: 4, label: "College Undergraduate" },
  { rank: 5, label: "College Graduate" },
  { rank: 6, label: "Post-Graduate" },
  { rank: 7, label: "Vocational (TESDA) Graduate" },
  { rank: 8, label: "ALS Graduate" },
];

export const JOBFAIR_SCHEDULES_DEGREE_OPTIONS = [
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

export const JOBFAIR_SCHEDULES_GENDER_OPTIONS     = ["Male", "Female", "Prefer not to say"];
export const JOBFAIR_SCHEDULES_CIVIL_OPTIONS      = ["Single", "Married", "Widowed", "Separated", "Divorced"];
export const JOBFAIR_SCHEDULES_DISABILITY_OPTIONS = ["None", "Yes"];
export const JOBFAIR_SCHEDULES_EMPLOYMENT_OPTIONS = ["Employed", "Unemployed"];
export const JOBFAIR_SCHEDULES_OFW_OPTIONS        = ["Yes", "No"];
export const JOBFAIR_SCHEDULES_FOURPS_OPTIONS     = ["Yes", "No"];
export const JOBFAIR_SCHEDULES_LANGUAGE_OPTIONS   = ["Filipino", "English", "Hiligaynon/Ilonggo", "Cebuano", "Others"];

// ── Registration Deadline ─────────────────────────────────────────────────────
// Same pattern as the Jobs pre-application form: a live countdown badge in the
// header, and a "closed" screen once the deadline passes. Ported from Jobs.tsx.

export const APPLICATION_DEADLINE = "2026-10-15";

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
// registration submission — see Jobfairschedules.gs. It's also passed to
// EmailVerificationGate as `otpUrl` so the gate hits the same self-contained
// backend, rather than a separate shared OTP-Service.gs.

export const JOBFAIR_SCHEDULES_SUBMIT_URL =
  "https://script.google.com/macros/s/AKfycbzKUt2OyWmN8YIqYi0D7p-HUkIqoQnV7Y-zROGsPVYj-XkZslI2PH3AImWZii5xE3pq/exec";

// ── Payload builder ───────────────────────────────────────────────────────────
// verificationToken is the signed HMAC token issued by Jobfairschedules.gs
// after a successful OTP check. doPost rejects the submission outright if
// this doesn't verify, so it's required here.

export function buildJobFairSchedulesPayload(
  form: JobFairSchedulesFormState,
  verificationToken: string
) {
  return {
    formType:              "jobFairSchedules",
    verificationToken:     verificationToken,
    jobFairName:           form.jobFairName,
    jobFairDate:           form.jobFairDate,
    jobFairTime:           form.jobFairTime,
    jobFairVenue:          form.jobFairVenue,
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

export async function submitJobFairSchedules(
  form: JobFairSchedulesFormState,
  verificationToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(JOBFAIR_SCHEDULES_SUBMIT_URL, {
      method:  "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body:    JSON.stringify(buildJobFairSchedulesPayload(form, verificationToken)),
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

// Common email domains used to catch typos like "gmial.com", "gmail.co", or
// "gmail.con". Same list used across SRA / LRA / JobFair.
const POPULAR_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "protonmail.com",
  "live.com",
  "msn.com",
];

/** Standard Levenshtein edit-distance between two strings. */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * If the email's domain is a close-but-not-exact match to a popular domain
 * (e.g. "gmail.co", "gmial.com", "gmail.con"), return the likely-intended
 * domain so the UI can suggest it. Returns null if the domain is an exact
 * match to a popular domain, or isn't close to any of them.
 */
export function findLikelyDomainTypo(value: string): string | null {
  const domain = value.trim().split("@")[1]?.toLowerCase();
  if (!domain) return null;
  if (POPULAR_EMAIL_DOMAINS.includes(domain)) return null;

  for (const popular of POPULAR_EMAIL_DOMAINS) {
    const distance = levenshteinDistance(domain, popular);
    if (distance > 0 && distance <= 2) {
      return popular;
    }
  }
  return null;
}

export function getJobFairSchedulesIssues(form: JobFairSchedulesFormState): string[] {
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
      const [localPart] = form.email.trim().split("@");
      issues.push(`Did you mean ${localPart}@${suggestedDomain}? Please double-check your email for typos.`);
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

const LS_FORM      = "peso_jobfair_schedules_draft";
const LS_SUBMITTED = "peso_jobfair_schedules_submitted";

const EMPTY_FORM: JobFairSchedulesFormState = {
  jobFairId:             "",
  jobFairName:           "",
  jobFairDate:           "",
  jobFairTime:           "",
  jobFairVenue:          "",
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
// pattern as Jobs.tsx. They reset on refresh; everything else autosaves.
const SENSITIVE_FIELDS: (keyof JobFairSchedulesFormState)[] = ["email", "contact", "address"];

function loadForm(): JobFairSchedulesFormState {
  try {
    const raw = localStorage.getItem(LS_FORM);
    if (!raw) return EMPTY_FORM;
    return { ...EMPTY_FORM, ...(JSON.parse(raw) as Partial<JobFairSchedulesFormState>) };
  } catch { return EMPTY_FORM; }
}

function saveForm(form: JobFairSchedulesFormState): void {
  try {
    const safeToStore: Partial<JobFairSchedulesFormState> = { ...form };
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

export default function JobFairSchedules() {
  const navigate = useNavigate();

  const [form, setForm]                   = useState<JobFairSchedulesFormState>(() => loadForm());
  const [attempted, setAttempted]         = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [submitError, setSubmitError]     = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(() => loadSubmitted());
  const [isMobile, setIsMobile]           = useState(false);
  const formTopRef                        = useRef<HTMLDivElement>(null);

  // Email verification state — intentionally NOT persisted to localStorage.
  // A page reload always requires re-verification, on purpose.
  const [emailVerified, setEmailVerified]           = useState(false);
  const [verificationToken, setVerificationToken]   = useState<string | null>(null);

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

  const issues = attempted ? getJobFairSchedulesIssues(form) : [];

  const updateForm = (patch: Partial<JobFairSchedulesFormState>) => {
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

  const handleSelectFair = (fair: { id: string; name: string; date: string; time: string; venue: string }) => {
    setForm(prev => ({
      ...prev,
      jobFairId:    fair.id,
      jobFairName:  fair.name,
      jobFairDate:  fair.date,
      jobFairTime:  fair.time,
      jobFairVenue: fair.venue,
    }));
    setAttempted(false);
    setSubmitError(null);
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleBackToFairs = () => {
    setForm(prev => ({
      ...prev,
      jobFairId:    "",
      jobFairName:  "",
      jobFairDate:  "",
      jobFairTime:  "",
      jobFairVenue: "",
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

    const validationIssues = getJobFairSchedulesIssues(form);
    if (validationIssues.length > 0) return;

    setSubmitting(true);

    const payload = buildJobFairSchedulesPayload(form, verificationToken);
    console.log("Submitting payload:", JSON.stringify(payload, null, 2));

    const result = await submitJobFairSchedules(form, verificationToken);
    setSubmitting(false);

    console.log("Submit result:", result);

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
    <JobFairSchedulesDesign
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
      onSelectFair={handleSelectFair}
      onBackToFairs={handleBackToFairs}
      onEmailVerified={handleEmailVerified}
      onChangeEmail={handleChangeEmail}
      onSubmit={handleSubmit}
      onNavigateHome={() => navigate("/")}
      onRegisterAnother={handleRegisterAnother}
    />
  );
}