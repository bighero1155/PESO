/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import isEmail from "validator/lib/isEmail";
import disposableDomains from "disposable-email-domains";
import JobsDesign from "../pesolanding/JobsDesign";

// ── Types ────────────────────────────────────────────────────────────────────

export interface JobListing {
  id: string;
  company: string;
  position: string;
  location: string;
  salaryRange: string;
  minAge: number;
  maxAge: number;
  minEducationRank: number;
  requiredSkills: string[];
  description: string;
}

export interface FormState {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  contact: string;
  address: string;
  resumeLink: string;
  education: number;
  skills: string[];
  birthday: string;
  gender: string;
  civilStatus: string;
  hasDisability: string;
  disabilityDetails: string;
  employmentStatus: string;
  ofwStatus: string;
  fourPsBeneficiary: string;
  preferredOccupation: string;
  preferredWorkLocation: string;
  languages: string[];
  otherLanguage: string;
  school: string;
  degree: string;
  consentGiven: boolean;
}

export interface JobResult {
  jobId: string;
  status: "qualified" | "not-qualified";
  issues: string[];
}

// ── Data ─────────────────────────────────────────────────────────────────────

export const EDUCATION_LEVELS = [
  { rank: 1, label: "Elementary Graduate" },
  { rank: 2, label: "High School Graduate" },
  { rank: 3, label: "Senior High School" },
  { rank: 4, label: "College Undergraduate" },
  { rank: 5, label: "College Graduate" },
  { rank: 6, label: "Post-Graduate" },
  { rank: 7, label: "Vocational (TESDA) Graduate" },
  { rank: 8, label: "ALS Graduate" },
];

export const GENDER_OPTIONS = ["Male", "Female", "Prefer not to say"];

export const CIVIL_STATUS_OPTIONS = ["Single", "Married", "Widowed", "Separated", "Divorced"];

export const DISABILITY_OPTIONS = ["None", "Yes"];

export const EMPLOYMENT_STATUS_OPTIONS = ["Employed", "Unemployed"];

export const OFW_STATUS_OPTIONS = ["Not OFW", "Current OFW", "Former OFW"];

export const FOUR_PS_OPTIONS = ["Yes", "No"];

export const LANGUAGE_OPTIONS = ["Filipino", "English", "Hiligaynon/Ilonggo", "Cebuano", "Others"];

/**
 * Common Philippine degree/course programs, used to power the Degree/Course
 * datalist on Step 2. This is a suggestion list only — applicants can still
 * type any value not present here (e.g. a major/specialization, or a course
 * we haven't listed).
 */
export const DEGREE_OPTIONS = [
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

export const JOB_LISTINGS: JobListing[] = [
  {
    id: "abc-cashier",
    company: "ABC Company",
    position: "Cashier",
    location: "Roxas City, Capiz",
    salaryRange: "",
    minAge: 18,
    maxAge: 35,
    minEducationRank: 2,
    requiredSkills: ["Basic Math", "1 year of experience of Customer Service", "Experienced in Cash Handling"],
    description:
      "Responsible for processing customer transactions accurately, operating the point-of-sale system, and providing courteous service at checkout.",
  },
  {
    id: "abc-supervisor",           
    company: "ABC Company",
    position: "Supervisor",         
    location: "Roxas City, Capiz",
    salaryRange: "",
    minAge: 21,
    maxAge: 40,
    minEducationRank: 5,            
    requiredSkills: [
      "Leadership",
      "2 years of supervisory experience",
    ],
    description:
      "Oversees daily store operations, manages a team of staff, ensures customer satisfaction standards are met, and reports directly to the store manager.",
  },
  {
    id: "xyz-bagger",
    company: "XYZ Company",
    position: "Bagger",
    location: "Roxas City, Capiz",
    salaryRange: "",
    minAge: 18,
    maxAge: 40,
    minEducationRank: 1,
    requiredSkills: ["Good Physical Stamina", "Experienced in Customer Service"],
    description:
      "Packs customer purchases efficiently, assists baggers and cashiers during peak hours, and helps maintain a clean and orderly checkout area.",
  },
];

// ── Application Deadline ──────────────────────────────────────────────────────

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

const EMPTY_FORM: FormState = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  contact: "",
  address: "",
  resumeLink: "",
  education: 0,
  skills: [],
  birthday: "",
  gender: "",
  civilStatus: "",
  hasDisability: "",
  disabilityDetails: "",
  employmentStatus: "",
  ofwStatus: "",
  fourPsBeneficiary: "",
  preferredOccupation: "",
  preferredWorkLocation: "",
  languages: [],
  otherLanguage: "",
  school: "",
  degree: "",
  consentGiven: false,
};

// ── Apps Script Web App submission endpoint ───────────────────────────────────
// This one URL now handles BOTH the OTP send/verify actions AND the final
// application submission — see Jobs.gs. It's also passed to
// EmailVerificationGate as `otpUrl` so the gate hits the same self-contained
// backend, rather than a separate shared OTP-Service.gs.

export const JOBS_SUBMIT_URL =
  "https://script.google.com/macros/s/AKfycbwFYUipthBAvHaFRyHzL43XUp1l7hWkB4aAyw16Tp0aXZTvgYcYvZrg2PKbUNAvCPSxfA/exec";

// ── Payload builder ───────────────────────────────────────────────────────────
// verificationToken is the signed HMAC token issued by Jobs.gs after a
// successful OTP check. doPost rejects the submission outright if this
// doesn't verify, so it's required here.

export function buildSubmissionPayload(
  form: FormState,
  chosenJobIds: string[],
  verificationToken: string
) {
  const chosenJobs = chosenJobIds
    .map(id => JOB_LISTINGS.find(j => j.id === id))
    .filter((j): j is JobListing => !!j)
    .map(j => ({ company: j.company, position: j.position }));

  return {
    verificationToken: verificationToken,
    firstName: form.firstName.trim(),
    middleName: form.middleName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    contact: form.contact.trim(),
    address: form.address.trim(),
    birthday: form.birthday,
    gender: form.gender,
    civilStatus: form.civilStatus,
    hasDisability: form.hasDisability,
    disabilityDetails: form.disabilityDetails.trim(),
    employmentStatus: form.employmentStatus,
    ofwStatus: form.ofwStatus,
    fourPsBeneficiary: form.fourPsBeneficiary,
    preferredOccupation: form.preferredOccupation.trim(),
    preferredWorkLocation: form.preferredWorkLocation.trim(),
    languages: form.languages,
    otherLanguage: form.otherLanguage.trim(),
    school: form.school.trim(),
    degree: form.degree.trim(),
    education: form.education,
    skills: form.skills,
    resumeLink: form.resumeLink.trim(),
    chosenJobs,
  };
}

// ── Submission ────────────────────────────────────────────────────────────────
// No longer uses mode: "no-cors" — a rejected/invalid verification token (or
// an undeliverable email from the Abstract API check) needs to come back as
// a real, readable error message instead of silently failing as if it
// succeeded.

export async function submitApplication(
  form: FormState,
  chosenJobIds: string[],
  verificationToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(JOBS_SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(buildSubmissionPayload(form, chosenJobIds, verificationToken)),
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
// "gmail.con". Ported from the Job Fair Schedules form.
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

export function isValidGDriveLink(value: string): boolean {
  try {
    const url  = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    if (host !== "drive.google.com" && host !== "docs.google.com") return false;
    if (host === "drive.google.com") {
      return (
        /^\/file\/d\/[A-Za-z0-9_-]{10,}/.test(url.pathname) ||
        /^\/drive\/folders\/[A-Za-z0-9_-]{10,}/.test(url.pathname) ||
        !!url.searchParams.get("id")
      );
    }
    if (host === "docs.google.com") {
      return /^\/(document|presentation|spreadsheets|forms)\/d\/[A-Za-z0-9_-]{10,}/.test(
        url.pathname
      );
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Issues that gate the Step 1 → Step 2 transition.
 * Does NOT include school, degree, resume, or consent — those moved to Step 2.
 */
export function getStep1Issues(form: FormState): string[] {
  const issues: string[] = [];

  if (!form.firstName.trim()) issues.push("First name is required.");
  if (!form.middleName.trim()) issues.push("Middle name is required.");
  if (!form.lastName.trim())  issues.push("Last name is required.");

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

  if (!form.contact.trim()) issues.push("Contact number is required.");
  if (!form.address.trim()) issues.push("Address is required.");

  if (!form.birthday.trim()) issues.push("Birthday is required.");
  if (!form.gender.trim()) issues.push("Gender is required.");
  if (!form.civilStatus.trim()) issues.push("Civil status is required.");
  if (!form.hasDisability.trim()) issues.push("Please indicate if you have a disability.");
  if (!form.employmentStatus.trim()) issues.push("Employment status is required.");
  if (!form.ofwStatus.trim()) issues.push("OFW status is required.");
  if (!form.fourPsBeneficiary.trim()) issues.push("Please indicate if you are a 4Ps beneficiary.");
  if (!form.preferredOccupation.trim()) issues.push("Preferred occupation is required.");
  if (!form.preferredWorkLocation.trim()) issues.push("Preferred work location is required.");
  if (form.languages.length === 0) issues.push("Please select at least one language you're proficient in.");
  if (form.languages.includes("Others") && !form.otherLanguage.trim()) {
    issues.push("Please specify your other language(s).");
  }

  return issues;
}

/**
 * Full validation — all personal issues including school, degree, resume, and consent.
 * School and degree now serve the role the old work-experience requirement used to
 * (replacing it in the qualification check and the match percent calculation), but
 * since they're applicant-level facts rather than job-specific ones, the messaging
 * lives here so it isn't repeated once per selected job.
 * Used at final submission time in handleSubmit.
 */
export function getPersonalIssues(form: FormState): string[] {
  const issues = getStep1Issues(form);

  if (!form.school.trim()) issues.push("School name is required.");
  if (!form.degree.trim()) issues.push("Degree/Course is required.");

  if (!form.resumeLink.trim()) {
    issues.push("Resume link is required.");
  } else if (!isValidGDriveLink(form.resumeLink.trim())) {
    issues.push("Resume link must be a valid Google Drive link.");
  }

  if (!form.consentGiven) issues.push("You must agree to the data privacy consent before submitting.");

  return issues;
}

/** Qualification issues specific to one job. */
export function getJobIssues(job: JobListing, form: FormState): string[] {
  const issues: string[] = [];

  if (form.education === 0) {
    issues.push("Educational attainment is required.");
  } else if (form.education < job.minEducationRank) {
    const required = EDUCATION_LEVELS.find(e => e.rank === job.minEducationRank)?.label;
    issues.push(`Requires at least: ${required}.`);
  }

  const missingSkills = job.requiredSkills.filter(s => !form.skills.includes(s));
  if (missingSkills.length > 0) {
    issues.push(`Please confirm you have: ${missingSkills.join(", ")}.`);
  }

  return issues;
}

export function getMatchPercent(job: JobListing, form: FormState): number {
  let passed = 0;
  const total = 4;

  if (form.resumeLink.trim() && isValidGDriveLink(form.resumeLink.trim())) passed++;
  if (form.education >= job.minEducationRank && form.education > 0)         passed++;
  if (form.school.trim() && form.degree.trim())                            passed++;
  if (job.requiredSkills.every(s => form.skills.includes(s))) passed++;

  return Math.round((passed / total) * 100);
}

// ── localStorage helpers ──────────────────────────────────────────────────────

const LS_APPLIED = "peso_applied_job_ids";
const LS_FORM    = "peso_form_draft";
const LS_STEP    = "peso_form_step";

function loadAppliedIds(): string[] {
  try {
    const raw = localStorage.getItem(LS_APPLIED);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}
function saveAppliedIds(ids: string[]): void {
  try { localStorage.setItem(LS_APPLIED, JSON.stringify(ids)); } catch { /* silent */ }
}

// PII fields that should never be written to localStorage in plaintext.
// They're stripped out before saving, so a page refresh clears them and
// the applicant re-enters them — the rest of the draft (name, education,
// skills, etc.) still autosaves normally.
const SENSITIVE_FIELDS: (keyof FormState)[] = ["email", "contact", "address"];

function loadForm(): FormState {
  try {
    const raw = localStorage.getItem(LS_FORM);
    if (!raw) return EMPTY_FORM;
    return { ...EMPTY_FORM, ...(JSON.parse(raw) as Partial<FormState>) };
  } catch { return EMPTY_FORM; }
}
function saveForm(form: FormState): void {
  try {
    const safeToStore: Partial<FormState> = { ...form };
    for (const field of SENSITIVE_FIELDS) delete safeToStore[field];
    localStorage.setItem(LS_FORM, JSON.stringify(safeToStore));
  } catch { /* silent */ }
}

function loadStep(): 1 | 2 {
  try { return localStorage.getItem(LS_STEP) === "2" ? 2 : 1; }
  catch { return 1; }
}
function saveStep(step: 1 | 2): void {
  try { localStorage.setItem(LS_STEP, String(step)); } catch { /* silent */ }
}

function clearAllDraft(): void {
  try {
    localStorage.removeItem(LS_APPLIED);
    localStorage.removeItem(LS_FORM);
    localStorage.removeItem(LS_STEP);
  } catch { /* silent */ }
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function Jobs() {
  const navigate = useNavigate();

  const [step, setStep]                   = useState<1 | 2>(() => loadStep());
  const [isMobile, setIsMobile]           = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(JOB_LISTINGS[0].id);
  const [chosenJobIds, setChosenJobIds]   = useState<string[]>([]);
  const [form, setForm]                   = useState<FormState>(() => loadForm());
  const [jobResults, setJobResults]       = useState<JobResult[]>([]);
  const [submitted, setSubmitted]         = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [submitError, setSubmitError]     = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [appliedJobIds, setAppliedJobIds] = useState<string[]>(() => loadAppliedIds());
  const [step1Attempted, setStep1Attempted] = useState(false);

  // Email verification state — intentionally NOT persisted to localStorage.
  // A page reload always requires re-verification, on purpose. Only Step 1
  // is gated by this; job matching in Step 2 is unaffected.
  const [emailVerified, setEmailVerified]         = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  const formTopRef = useRef<HTMLDivElement>(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeJob = useMemo(
    () => JOB_LISTINGS.find(j => j.id === selectedJobId)!,
    [selectedJobId]
  );

  const matchPercent = useMemo(
    () => getMatchPercent(activeJob, form),
    [activeJob, form]
  );

  const qualifiedResults    = jobResults.filter(r => r.status === "qualified");
  const notQualifiedResults = jobResults.filter(r => r.status === "not-qualified");

  const allChosenSkills = useMemo(() => {
    const seen = new Set<string>();
    const out: { skill: string; jobLabel: string }[] = [];
    for (const id of chosenJobIds) {
      const job = JOB_LISTINGS.find(j => j.id === id)!;
      for (const skill of job.requiredSkills) {
        if (!seen.has(skill)) {
          seen.add(skill);
          out.push({ skill, jobLabel: `${job.company} – ${job.position}` });
        }
      }
    }
    return out;
  }, [chosenJobIds]);

  // ── Effects ───────────────────────────────────────────────────────────────
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
    if (!isMounted.current) return;
    saveStep(step);
  }, [step]);

  useEffect(() => {
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const resetStatus = () => {
    setJobResults([]);
    setSubmitted(false);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const updateForm = (patch: Partial<FormState>) => {
    setForm(prev => ({ ...prev, ...patch }));
    resetStatus();
  };

  const toggleSkill = (skill: string) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
    resetStatus();
  };

  const toggleLanguage = (lang: string) => {
    setForm(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }));
    resetStatus();
  };

  const toggleChosenJob = (id: string) => {
    if (appliedJobIds.includes(id)) return;

    setChosenJobIds(prev =>
      prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]
    );
    resetStatus();
  };

  // Called by EmailVerificationGate once the OTP is confirmed. Fills the
  // form's email field and unlocks the rest of Step 1.
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

  /** Step 1 → Step 2: only validate step 1 fields (no school/degree/resume/consent). */
  const handleNext = () => {
    setStep1Attempted(true);
    const issues = getStep1Issues(form);
    if (issues.length > 0) return;
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setStep1Attempted(false);
    resetStatus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    // Second guard on top of Step 1 hiding the form until verified — submit
    // can't proceed without a verified token no matter how it's triggered.
    if (!emailVerified || !verificationToken) {
      setSubmitError("Please verify your email before submitting.");
      return;
    }

    const newJobIds = chosenJobIds.filter(id => !appliedJobIds.includes(id));

    if (newJobIds.length === 0) return;
    const personalIssues = getPersonalIssues(form);

    const results: JobResult[] = newJobIds.map(id => {
      const job       = JOB_LISTINGS.find(j => j.id === id)!;
      const jobIssues = getJobIssues(job, form);
      const allIssues = [...personalIssues, ...jobIssues];
      return {
        jobId:  id,
        status: allIssues.length === 0 ? "qualified" : "not-qualified",
        issues: allIssues,
      };
    });

    setJobResults(results);

    const allQualified = results.every(r => r.status === "qualified");
    if (!allQualified) return;

    setSubmitting(true);
    const result = await submitApplication(form, newJobIds, verificationToken);
    setSubmitting(false);

    if (result.success) {
      const newApplied = Array.from(new Set([...appliedJobIds, ...newJobIds])); 
      setAppliedJobIds(newApplied);
      saveAppliedIds(newApplied);
      setSubmitSuccess(true);
    } else {
      setSubmitError(result.error || "Something went wrong. Please try again.");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <JobsDesign
      step={step}
      isMobile={isMobile}
      form={form}
      chosenJobIds={chosenJobIds}
      selectedJobId={selectedJobId}
      jobResults={jobResults}
      submitted={submitted}
      submitting={submitting}
      submitError={submitError}
      submitSuccess={submitSuccess}
      matchPercent={matchPercent}
      activeJob={activeJob}
      allChosenSkills={allChosenSkills}
      qualifiedResults={qualifiedResults}
      notQualifiedResults={notQualifiedResults}
      formTopRef={formTopRef}
      step1Attempted={step1Attempted}
      emailVerified={emailVerified}
      onUpdateForm={updateForm}
      onToggleSkill={toggleSkill}
      onToggleLanguage={toggleLanguage}
      onToggleChosenJob={toggleChosenJob}
      onSelectJobTab={setSelectedJobId}
      onEmailVerified={handleEmailVerified}
      onChangeEmail={handleChangeEmail}
      onNext={handleNext}
      onBack={handleBack}
      onSubmit={handleSubmit}
      onNavigateHome={() => {
        clearAllDraft();
        navigate("/");
      }}
      appliedJobIds={appliedJobIds}
    />
  );
}