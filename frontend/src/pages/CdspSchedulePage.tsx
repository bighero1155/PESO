import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ParticipantGroup {
  label: string;   // e.g. "Junior High School", "Senior High School", "College", "Faculty"
  female: number;
  male: number;
}

interface CdspPhoto {
  src: string;
  alt: string;
}

interface CdspEvent {
  date: string;      // "MM-DD" repeats yearly, "YYYY-MM-DD" one-time
  institution: string;
  time: string;
  participants: ParticipantGroup[];
  topics: string[];
  /** Drop real photos in here once you have them, e.g. { src: "/assets/cdsp-1.jpg", alt: "" }. */
  images: CdspPhoto[];
  /** How many empty placeholder tiles to show while `images` is still empty. */
  placeholderCount: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PESO_NAVY = "#1a1d5e";
const PESO_RED  = "#c0151a";
const PESO_GOLD = "#e8a800";

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  HOW TO ADD / EDIT ACTIVITIES
//
//  Each entry has these fields:
//    date             → "MM-DD"      repeats every year  (e.g. "05-01" = every May 1)
//                       "YYYY-MM-DD" one-time only        (e.g. "2026-08-07")
//    institution      → Name of the institution/office hosting the activity
//    time             → e.g. "8:00 a.m. – 11:00 a.m."
//    participants     → Array of groups, each with a label + female/male counts.
//                        Use whichever groups apply — Junior High School, Senior
//                        High School, College, Faculty, etc. Totals per row and
//                        the grand total are calculated automatically.
//    topics           → List of topics requested/discussed
//    images           → Array of photos for this activity. Leave as [] until you
//                        have real photos, then add entries like:
//                        { src: "/assets/cdsp-bungsuan-1.jpg", alt: "Orientation" }
//    placeholderCount → How many empty "photo coming soon" tiles to show while
//                        `images` is still empty (purely cosmetic, so the section
//                        doesn't look broken/blank).
//
//  EXAMPLE:
//    {
//      date: "2026-08-07",
//      institution: "Bungsuan National High School",
//      time: "8:00 a.m. – 11:00 a.m.",
//      participants: [
//        { label: "Junior High School", female: 30, male: 42 },
//        { label: "Senior High School", female: 60, male: 48 },
//        { label: "Faculty",            female: 3,  male: 4  },
//      ],
//      topics: ["Programs and Core Services of PESO", "LMI Situation in Capiz"],
//      images: [],
//      placeholderCount: 3,
//    }
//
//  To DELETE an entry just remove the whole { } block.
//  To ADD an entry just append a new { } block inside the array below.
// ─────────────────────────────────────────────────────────────────────────────

const STATIC_EVENTS: CdspEvent[] = [
  {
    date: "2026-08-07",
    institution: "Bungsuan National High School, Bungsuan, Dumarao, Capiz",
    time: "8:00 a.m. – 11:00 a.m.",
    participants: [
      { label: "Junior High School", female: 30, male: 42 },
      { label: "Senior High School", female: 60, male: 48 },
      { label: "Faculty",            female: 3,  male: 4  },
    ],
    topics: [
      "Programs and Core Services of PESO",
      "LMI Situation in Capiz",
      "Four Curriculum Exits",
      "Businesses Top 10 Skills Priorities for 2027",
      "Career advice for New Entrants to the Labor Force",
    ],
    images: [
      { src: "/assets/CDSP2026/bungsuannhs2026/1.JPG", alt: "" },
      { src: "/assets/CDSP2026/bungsuannhs2026/2.JPG", alt: "" },
      { src: "/assets/CDSP2026/bungsuannhs2026/3.JPG", alt: "" },
      { src: "/assets/CDSP2026/bungsuannhs2026/4.JPG", alt: "" },
      { src: "/assets/CDSP2026/bungsuannhs2026/5.JPG", alt: "" },
      { src: "/assets/CDSP2026/bungsuannhs2026/6.JPG", alt: "" },
      { src: "/assets/CDSP2026/bungsuannhs2026/7.JPG", alt: "" },
      { src: "/assets/CDSP2026/bungsuannhs2026/8.JPG", alt: "" },
      { src: "/assets/CDSP2026/bungsuannhs2026/9.JPG", alt: "" },
      { src: "/assets/CDSP2026/bungsuannhs2026/10.JPG", alt: "" },
      { src: "/assets/CDSP2026/bungsuannhs2026/11.JPG", alt: "" },
      { src: "/assets/CDSP2026/bungsuannhs2026/12.JPG", alt: "" },
    ],
    placeholderCount: 3,
  },
  {
    date: "2026-07-11",
    institution: "Maindang National High School, Maindang, Cuartero, Capiz",
    time: "8:00 a.m. – 11:00 a.m.",
    participants: [
      { label: "Junior High School", female: 37, male: 38 },
      { label: "Senior High School", female: 49, male: 52 },
      { label: "Faculty",            female: 1,  male: 7  },
    ],
    topics: [
      "Programs and Core Services of PESO",
      "LMI Situation in Capiz",
      "Four Curriculum Exits",
      "Businesses Top 10 Skills Priorities for 2027",
      "Career advice for New Entrants to the Labor Force",
    ],
    images: [],
    placeholderCount: 3,
  },
  {
    date: "2026-06-01",
    institution: "Capiz State University - Roxas City Campus, Fuentes Drive, Roxas City, Capiz",
    time: "8:00 a.m. – 11:00 a.m.",
    participants: [
      { label: "College", female: 221, male: 274 },
      { label: "Faculty", female: 3,  male: 0  },
    ],
    topics: [
      "Programs and Core Services of PESO",
      "LMI Situation in Capiz",
      "Four Curriculum Exits",
      "Businesses Top 10 Skills Priorities for 2027",
      "Resume and Job Interview Preparation",
    ],
    images: [
      { src: "/assets/CDSP2026/fuentesdrivecapsu2026/1.JPG", alt: "" },
      { src: "/assets/CDSP2026/fuentesdrivecapsu2026/2.JPG", alt: "" },
      { src: "/assets/CDSP2026/fuentesdrivecapsu2026/3.JPG", alt: "" },
      { src: "/assets/CDSP2026/fuentesdrivecapsu2026/4.JPG", alt: "" },
      { src: "/assets/CDSP2026/fuentesdrivecapsu2026/5.JPG", alt: "" },
      { src: "/assets/CDSP2026/fuentesdrivecapsu2026/6.JPG", alt: "" },
      { src: "/assets/CDSP2026/fuentesdrivecapsu2026/7.JPG", alt: "" },
      { src: "/assets/CDSP2026/fuentesdrivecapsu2026/8.JPG", alt: "" },
      { src: "/assets/CDSP2026/fuentesdrivecapsu2026/9.JPG", alt: "" },
      { src: "/assets/CDSP2026/fuentesdrivecapsu2026/10.JPG", alt: "" },
      { src: "/assets/CDSP2026/fuentesdrivecapsu2026/11.JPG", alt: "" },
      { src: "/assets/CDSP2026/fuentesdrivecapsu2026/12.JPG", alt: "" },
    ],
    placeholderCount: 3,
  },
  {
    date: "2026-05-29",
    institution: "Capiz State University - Tapaz Sattelite College, San Julian, Tapaz, Capiz",
    time: "8:00 a.m. – 11:00 a.m.",
    participants: [
      { label: "College", female: 40, male: 27 },
      { label: "Faculty", female: 2,  male: 1  },
    ],
    topics: [
      "Programs and Core Services of PESO",
      "LMI Situation in Capiz",
      "Four Curriculum Exits",
      "Businesses Top 10 Skills Priorities for 2027",
      "Resume and Job Interview Preparation",
    ],
    images: [
      { src: "/assets/CDSP2026/tapazcapsu2026/1.JPG", alt: "" },
      { src: "/assets/CDSP2026/tapazcapsu2026/2.JPG", alt: "" },
      { src: "/assets/CDSP2026/tapazcapsu2026/3.JPG", alt: "" },
      { src: "/assets/CDSP2026/tapazcapsu2026/4.JPG", alt: "" },
      { src: "/assets/CDSP2026/tapazcapsu2026/5.JPG", alt: "" },
      { src: "/assets/CDSP2026/tapazcapsu2026/6.JPG", alt: "" },
      { src: "/assets/CDSP2026/tapazcapsu2026/7.JPG", alt: "" },
      { src: "/assets/CDSP2026/tapazcapsu2026/8.JPG", alt: "" },
      { src: "/assets/CDSP2026/tapazcapsu2026/9.JPG", alt: "" },
      { src: "/assets/CDSP2026/tapazcapsu2026/10.JPG", alt: "" },
      { src: "/assets/CDSP2026/tapazcapsu2026/11.JPG", alt: "" },
      { src: "/assets/CDSP2026/tapazcapsu2026/12.JPG", alt: "" },
    ],
    placeholderCount: 3,
  },
  {
    date: "2026-05-26",
    institution: "Capiz State University - Sigma Sattelite College, Poblacion Sur, Sigma, Capiz",
    time: "1:00 p.m. – 3:00 p.m.",
    participants: [
      { label: "College", female: 101, male: 44 },
      { label: "Faculty", female: 2,  male: 1  },
    ],
    topics: [
      "Programs and Core Services of PESO",
      "LMI Situation in Capiz",
      "Businesses Top 10 Skills Priorities for 2027",
      "Career advice for New Entrants to the Labor Force",
      "Resume and Job Interview Preparation",
    ],
    images: [
      { src: "/assets/CDSP2026/sigmacapsu2026/1.JPG", alt: "" },
      { src: "/assets/CDSP2026/sigmacapsu2026/2.JPG", alt: "" },
      { src: "/assets/CDSP2026/sigmacapsu2026/3.JPG", alt: "" },
      { src: "/assets/CDSP2026/sigmacapsu2026/4.JPG", alt: "" },
      { src: "/assets/CDSP2026/sigmacapsu2026/5.JPG", alt: "" },
      { src: "/assets/CDSP2026/sigmacapsu2026/6.JPG", alt: "" },
      { src: "/assets/CDSP2026/sigmacapsu2026/7.JPG", alt: "" },
      { src: "/assets/CDSP2026/sigmacapsu2026/8.JPG", alt: "" },
      { src: "/assets/CDSP2026/sigmacapsu2026/9.JPG", alt: "" },
      { src: "/assets/CDSP2026/sigmacapsu2026/10.JPG", alt: "" },
      { src: "/assets/CDSP2026/sigmacapsu2026/11.JPG", alt: "" },
      { src: "/assets/CDSP2026/sigmacapsu2026/12.JPG", alt: "" },
    ],
    placeholderCount: 3,
  },
  {
    date: "2026-05-26",
    institution: "Capiz State University - Dumarao Sattelite College, Codingle, Dumarao, Capiz",
    time: "8:00 a.m. – 11:00 a.m.",
    participants: [
      { label: "College", female: 75, male: 39 },
      { label: "Faculty", female: 5,  male: 2  },
    ],
    topics: [
      "Programs and Core Services of PESO",
      "LMI Situation in Capiz",
      "Businesses Top 10 Skills Priorities for 2027",
      "Career advice for New Entrants to the Labor Force",
      "Resume and Job Interview Preparation",
    ],
    images: [
      { src: "/assets/CDSP2026/dumaraocapsu2026/1.JPG", alt: "" },
      { src: "/assets/CDSP2026/dumaraocapsu2026/2.JPG", alt: "" },
      { src: "/assets/CDSP2026/dumaraocapsu2026/3.JPG", alt: "" },
      { src: "/assets/CDSP2026/dumaraocapsu2026/4.JPG", alt: "" },
      { src: "/assets/CDSP2026/dumaraocapsu2026/5.JPG", alt: "" },
      { src: "/assets/CDSP2026/dumaraocapsu2026/6.JPG", alt: "" },
      { src: "/assets/CDSP2026/dumaraocapsu2026/7.JPG", alt: "" },
      { src: "/assets/CDSP2026/dumaraocapsu2026/8.JPG", alt: "" },
      { src: "/assets/CDSP2026/dumaraocapsu2026/9.JPG", alt: "" },
      { src: "/assets/CDSP2026/dumaraocapsu2026/10.JPG", alt: "" },
      { src: "/assets/CDSP2026/dumaraocapsu2026/11.JPG", alt: "" },
      { src: "/assets/CDSP2026/dumaraocapsu2026/12.JPG", alt: "" },
    ],
    placeholderCount: 3,
  },
  {
    date: "2026-05-25",
    institution: "Capiz State University - Pilar Sattelite College, Natividad, Pilar, Capiz",
    time: "8:00 a.m. – 11:00 a.m.",
    participants: [
      { label: "College", female: 129, male: 62 },
      { label: "Faculty", female: 5,  male: 1  },
    ],
    topics: [
      "Programs and Core Services of PESO",
      "LMI Situation in Capiz",
      "Businesses Top 10 Skills Priorities for 2027",
      "Career advice for New Entrants to the Labor Force",
      "Resume and Job Interview Preparation",
    ],
    images: [
      { src: "/assets/CDSP2026/pilarcapsu2026/1.JPG", alt: "" },
      { src: "/assets/CDSP2026/pilarcapsu2026/2.JPG", alt: "" },
      { src: "/assets/CDSP2026/pilarcapsu2026/3.JPG", alt: "" },
      { src: "/assets/CDSP2026/pilarcapsu2026/4.JPG", alt: "" },
      { src: "/assets/CDSP2026/pilarcapsu2026/5.JPG", alt: "" },
      { src: "/assets/CDSP2026/pilarcapsu2026/6.JPG", alt: "" },
      { src: "/assets/CDSP2026/pilarcapsu2026/7.JPG", alt: "" },
      { src: "/assets/CDSP2026/pilarcapsu2026/8.JPG", alt: "" },
      { src: "/assets/CDSP2026/pilarcapsu2026/9.JPG", alt: "" },
      { src: "/assets/CDSP2026/pilarcapsu2026/10.JPG", alt: "" },
      { src: "/assets/CDSP2026/pilarcapsu2026/11.JPG", alt: "" },
      { src: "/assets/CDSP2026/pilarcapsu2026/12.JPG", alt: "" },
    ],
    placeholderCount: 3,
  },
  {
    date: "2026-05-20",
    institution: "Capiz State University - Burias Campus, Burias, Mambusao, Capiz",
    time: "1:00 p.m. – 3:00 p.m.",
    participants: [
      { label: "College", female: 93, male: 18 },
      { label: "Faculty", female: 0,  male: 0  },
    ],
    topics: [
      "Programs and Core Services of PESO",
      "LMI Situation in Capiz",
      "Businesses Top 10 Skills Priorities for 2027",
      "Career advice for New Entrants to the Labor Force",
      "Resume and Job Interview Preparation",
    ],
    images: [
      { src: "/assets/CDSP2026/burias2026/1.JPG", alt: "" },
      { src: "/assets/CDSP2026/burias2026/2.JPG", alt: "" },
      { src: "/assets/CDSP2026/burias2026/3.JPG", alt: "" },
      { src: "/assets/CDSP2026/burias2026/4.JPG", alt: "" },
      { src: "/assets/CDSP2026/burias2026/5.JPG", alt: "" },
      { src: "/assets/CDSP2026/burias2026/6.JPG", alt: "" },
      { src: "/assets/CDSP2026/burias2026/7.JPG", alt: "" },
      { src: "/assets/CDSP2026/burias2026/8.JPG", alt: "" },
      { src: "/assets/CDSP2026/burias2026/9.JPG", alt: "" },
      { src: "/assets/CDSP2026/burias2026/10.JPG", alt: "" },
      { src: "/assets/CDSP2026/burias2026/11.JPG", alt: "" },
      { src: "/assets/CDSP2026/burias2026/12.JPG", alt: "" },
    ],
    placeholderCount: 3,
  },
  {
    date: "2026-05-20",
    institution: "Capiz State University - Mambusao Sattelite College, Poblacion Proper, Mambusao, Capiz",
    time: "8:00 a.m. – 11:00 a.m.",
    participants: [
      { label: "College", female: 51, male: 15 },
      { label: "Faculty", female: 0,  male: 0  },
    ],
    topics: [
      "Programs and Core Services of PESO",
      "LMI Situation in Capiz",
      "Businesses Top 10 Skills Priorities for 2027",
      "Career advice for New Entrants to the Labor Force",
      "Resume and Job Interview Preparation",
    ],
    images: [
      { src: "/assets/CDSP2026/mabusao2026/1.JPG", alt: "" },
      { src: "/assets/CDSP2026/mabusao2026/2.JPG", alt: "" },
      { src: "/assets/CDSP2026/mabusao2026/3.JPG", alt: "" },
      { src: "/assets/CDSP2026/mabusao2026/4.JPG", alt: "" },
      { src: "/assets/CDSP2026/mabusao2026/5.JPG", alt: "" },
      { src: "/assets/CDSP2026/mabusao2026/6.JPG", alt: "" },
      { src: "/assets/CDSP2026/mabusao2026/7.JPG", alt: "" },
      { src: "/assets/CDSP2026/mabusao2026/8.JPG", alt: "" },
      { src: "/assets/CDSP2026/mabusao2026/9.JPG", alt: "" },
      { src: "/assets/CDSP2026/mabusao2026/10.JPG", alt: "" },
      { src: "/assets/CDSP2026/mabusao2026/11.JPG", alt: "" },
      { src: "/assets/CDSP2026/mabusao2026/12.JPG", alt: "" },
    ],
    placeholderCount: 3,
  },
  {
    date: "2026-05-07",
    institution: "Hercor College - Roxas City, Capiz",
    time: "8:00 a.m. – 11:00 a.m.",
    participants: [
      { label: "College", female: 319, male: 245 },
      { label: "Faculty", female: 0,  male: 0  },
    ],
    topics: [
      "Programs and Core Services of PESO",
      "LMI Situation in Capiz",
      "Businesses Top 10 Skills Priorities for 2027",
      "Career advice for New Entrants to the Labor Force",
      "Resume and Job Interview Preparation",
    ],
    images: [
      { src: "/assets/CDSP2026/hercor2026/1.JPG", alt: "" },
      { src: "/assets/CDSP2026/hercor2026/2.JPG", alt: "" },
      { src: "/assets/CDSP2026/hercor2026/3.JPG", alt: "" },
      { src: "/assets/CDSP2026/hercor2026/4.JPG", alt: "" },
      { src: "/assets/CDSP2026/hercor2026/5.JPG", alt: "" },
      { src: "/assets/CDSP2026/hercor2026/6.JPG", alt: "" },
      { src: "/assets/CDSP2026/hercor2026/7.JPG", alt: "" },
      { src: "/assets/CDSP2026/hercor2026/8.JPG", alt: "" },
      { src: "/assets/CDSP2026/hercor2026/9.JPG", alt: "" },
      { src: "/assets/CDSP2026/hercor2026/10.JPG", alt: "" },
      { src: "/assets/CDSP2026/hercor2026/11.JPG", alt: "" },
      { src: "/assets/CDSP2026/hercor2026/12.JPG", alt: "" },
    ],
    placeholderCount: 3,
  },
  {
    date: "2026-04-08",
    institution: "Filamer Christian University - Roxas City, Capiz",
    time: "8:00 a.m. – 11:00 a.m.",
    participants: [
      { label: "College", female: 222, male: 130 },
      { label: "Faculty", female: 0,  male: 0  },
    ],
    topics: [
      "Programs and Core Services of PESO",
      "LMI Situation in Capiz",
      "Businesses Top 10 Skills Priorities for 2027",
      "Career advice for New Entrants to the Labor Force",
      "Resume and Job Interview Preparation",
    ],
    images: [],
    placeholderCount: 3,
  },
  {
    date: "2026-02-20",
    institution: "Ramon A. Benjamin Sr. National High School - Dacuton, Dumarao, Capiz",
    time: "8:00 a.m. – 11:00 a.m.",
    participants: [
      { label: "Junior High School", female: 113, male: 92 },
      { label: "Senior High School", female: 54, male: 30 },
      { label: "Faculty",            female: 8,  male: 4  },
    ],
    topics: [
      "Programs and Core Services of PESO",
      "LMI Situation in Capiz",
      "Four Curriculum Exits",
      "Businesses Top 10 Skills Priorities for 2027",
      "Career advice for New Entrants to the Labor Force",
    ],
    images: [],
    placeholderCount: 3,
  },
  {
    date: "2026-01-28",
    institution: "Commissioner Luis R. Asis National High School - Poblacion Ilaya, Panay, Capiz",
    time: "8:00 a.m. – 11:00 a.m.",
    participants: [
      { label: "Senior High School", female: 92, male: 116 },
      { label: "Faculty",            female: 9,  male: 1  },
    ],
    topics: [
      "Programs and Core Services of PESO",
      "LMI Situation in Capiz",
      "Four Curriculum Exits",
      "Businesses Top 10 Skills Priorities for 2027",
      "Career advice for New Entrants to the Labor Force",
    ],
    images: [
      { src: "/assets/CDSP2026/commisionernhs2026/1.JPG", alt: "" },
      { src: "/assets/CDSP2026/commisionernhs2026/2.JPG", alt: "" },
      { src: "/assets/CDSP2026/commisionernhs2026/3.JPG", alt: "" },
      { src: "/assets/CDSP2026/commisionernhs2026/4.JPG", alt: "" },
      { src: "/assets/CDSP2026/commisionernhs2026/5.JPG", alt: "" },
      { src: "/assets/CDSP2026/commisionernhs2026/6.JPG", alt: "" },
      { src: "/assets/CDSP2026/commisionernhs2026/7.JPG", alt: "" },
      { src: "/assets/CDSP2026/commisionernhs2026/8.JPG", alt: "" },
      { src: "/assets/CDSP2026/commisionernhs2026/9.JPG", alt: "" },
      { src: "/assets/CDSP2026/commisionernhs2026/10.JPG", alt: "" },
      { src: "/assets/CDSP2026/commisionernhs2026/11.JPG", alt: "" },
      { src: "/assets/CDSP2026/commisionernhs2026/12.JPG", alt: "" },
    ],
    placeholderCount: 3,
  },
  {
    date: "2026-01-27",
    institution: "Marciano M. Patricio National High School - Natividad, Pilar, Capiz",
    time: "8:00 a.m. – 11:00 a.m.",
    participants: [
      { label: "Senior High School", female: 96, male: 56 },
      { label: "Faculty",            female: 10,  male: 1  },
    ],
    topics: [
      "Programs and Core Services of PESO",
      "LMI Situation in Capiz",
      "Four Curriculum Exits",
      "Businesses Top 10 Skills Priorities for 2027",
      "Career advice for New Entrants to the Labor Force",
    ],
    images: [
      { src: "/assets/CDSP2026/marianonhs2026/1.JPG", alt: "" },
      { src: "/assets/CDSP2026/marianonhs2026/2.JPG", alt: "" },
      { src: "/assets/CDSP2026/marianonhs2026/3.JPG", alt: "" },
      { src: "/assets/CDSP2026/marianonhs2026/4.JPG", alt: "" },
      { src: "/assets/CDSP2026/marianonhs2026/5.JPG", alt: "" },
      { src: "/assets/CDSP2026/marianonhs2026/6.JPG", alt: "" },
      { src: "/assets/CDSP2026/marianonhs2026/7.JPG", alt: "" },
      { src: "/assets/CDSP2026/marianonhs2026/8.JPG", alt: "" },
      { src: "/assets/CDSP2026/marianonhs2026/9.JPG", alt: "" },
      { src: "/assets/CDSP2026/marianonhs2026/10.JPG", alt: "" },
      { src: "/assets/CDSP2026/marianonhs2026/11.JPG", alt: "" },
      { src: "/assets/CDSP2026/marianonhs2026/12.JPG", alt: "" },
    ],
    placeholderCount: 3,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Overall summary across every scheduled activity, regardless of month.
const getOverallSummary = () => {
  const totalActivities = STATIC_EVENTS.length;
  const totalParticipants = STATIC_EVENTS.reduce(
    (sum, ev) => sum + ev.participants.reduce((s, g) => s + g.female + g.male, 0),
    0
  );
  const uniqueInstitutions = new Set(STATIC_EVENTS.map((ev) => ev.institution)).size;
  return { totalActivities, totalParticipants, uniqueInstitutions };
};

// Human-readable label for an event's date field, handling both the
// recurring "MM-DD" form and the one-time "YYYY-MM-DD" form.
const formatEventDateLabel = (dateStr: string): string => {
  if (dateStr.length === 5) {
    const [mm, dd] = dateStr.split("-").map(Number);
    return `${MONTH_NAMES[mm - 1]} ${dd} (yearly)`;
  }
  const [yy, mm, dd] = dateStr.split("-").map(Number);
  return `${MONTH_NAMES[mm - 1]} ${dd}, ${yy}`;
};

// Used purely for sorting the "Activities" breakdown, most recent first.
// One-time dates sort by their real date; recurring "MM-DD" dates sort by
// month/day only (placed after one-time dates of the same month/day so the
// list reads newest-first without needing a "real" year for them).
const eventSortKey = (dateStr: string): string => {
  if (dateStr.length === 5) return `9999-${dateStr}`;
  return dateStr;
};

const totalForEvent = (ev: CdspEvent): number =>
  ev.participants.reduce((sum, g) => sum + g.female + g.male, 0);

interface InstitutionBreakdownRow {
  institution: string;
  visits: number;
  totalParticipants: number;
}

// One row per unique institution: how many times CDSP visited, and how many
// participants were reached there in total.
const getInstitutionBreakdown = (): InstitutionBreakdownRow[] => {
  const map = new Map<string, InstitutionBreakdownRow>();

  STATIC_EVENTS.forEach((ev) => {
    const existing = map.get(ev.institution);
    const eventTotal = totalForEvent(ev);
    if (existing) {
      existing.visits += 1;
      existing.totalParticipants += eventTotal;
    } else {
      map.set(ev.institution, {
        institution: ev.institution,
        visits: 1,
        totalParticipants: eventTotal,
      });
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    a.institution.localeCompare(b.institution)
  );
};

interface GroupBreakdownRow {
  label: string;
  female: number;
  male: number;
}

// Aggregates every participant group (Junior High School, College, Faculty,
// etc.) across all activities into one female/male total per group label.
const getParticipantGroupBreakdown = (): GroupBreakdownRow[] => {
  const map = new Map<string, GroupBreakdownRow>();

  STATIC_EVENTS.forEach((ev) => {
    ev.participants.forEach((g) => {
      const existing = map.get(g.label);
      if (existing) {
        existing.female += g.female;
        existing.male += g.male;
      } else {
        map.set(g.label, { label: g.label, female: g.female, male: g.male });
      }
    });
  });

  return Array.from(map.values()).sort(
    (a, b) => (b.female + b.male) - (a.female + a.male)
  );
};

// Returns events that fall in the given year+month (month is 1-indexed)
const getEventsForMonth = (
  year: number,
  month: number,
): (CdspEvent & { day: number })[] => {
  const results: (CdspEvent & { day: number })[] = [];

  STATIC_EVENTS.forEach((ev) => {
    let day: number | null = null;

    if (ev.date.length === 5) {
      // "MM-DD" — repeats every year
      const [mm, dd] = ev.date.split("-").map(Number);
      if (mm === month) day = dd;
    } else {
      // "YYYY-MM-DD" — one-time
      const [yy, mm, dd] = ev.date.split("-").map(Number);
      if (yy === year && mm === month) day = dd;
    }

    if (day !== null) results.push({ ...ev, day });
  });

  return results.sort((a, b) => a.day - b.day);
};

// ── Image Lightbox (portal — escapes any overflow:hidden parent) ──────────────

function ImageLightbox({
  photo,
  institution,
  onClose,
}: {
  photo: CdspPhoto;
  institution: string;
  onClose: () => void;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(10,11,38,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 24px", cursor: "zoom-out",
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close"
        style={{
          position: "fixed", top: 20, right: 24,
          width: 42, height: 42, borderRadius: "50%",
          border: "1.5px solid rgba(255,255,255,0.3)",
          background: "rgba(255,255,255,0.08)", color: "white",
          fontSize: "1.3rem", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2001,
        }}
      >
        ✕
      </button>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <img
          src={photo.src}
          alt={photo.alt}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: "90vw", maxHeight: "82vh", objectFit: "contain",
            borderRadius: 10, boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            cursor: "default", display: "block",
          }}
        />
        <span style={{
          fontSize: "0.7rem", fontWeight: 800, letterSpacing: 2,
          textTransform: "uppercase", color: PESO_GOLD, textAlign: "center",
        }}>
          {institution}
        </span>
      </div>
    </div>,
    document.body
  );
}

// ── Day Detail Modal ──────────────────────────────────────────────────────────

function DayModal({
  day,
  month,
  year,
  events,
  onClose,
  onOpenLightbox,
  isMobile,
}: {
  day: number;
  month: number;
  year: number;
  events: (CdspEvent & { day: number })[];
  onClose: () => void;
  onOpenLightbox: (photo: CdspPhoto, institution: string) => void;
  isMobile: boolean;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1001,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? 10 : 16,
      }}>
        <div style={{
          background: "white", borderRadius: 16,
          width: "100%", maxWidth: 460,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          overflow: "hidden", animation: "modalIn 0.2s ease",
          maxHeight: "85vh", display: "flex", flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{
            background: PESO_NAVY, padding: isMobile ? "14px 16px" : "18px 24px",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexShrink: 0,
          }}>
            <div>
              <p style={{
                color: PESO_GOLD, fontSize: "0.68rem", fontWeight: 700,
                letterSpacing: 2, textTransform: "uppercase", margin: "0 0 3px",
              }}>
                CDSP Activity
              </p>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                color: "white", fontSize: "1.2rem", margin: 0,
              }}>
                {MONTH_NAMES[month - 1]} {day}, {year}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "50%", width: 32, height: 32,
                color: "white", cursor: "pointer", fontSize: "1rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >✕</button>
          </div>

          {/* Events list */}
          <div style={{
            overflowY: "auto", flex: 1,
            padding: isMobile ? "16px 14px" : "20px 24px",
          }}>
            {events.map((ev, i) => (
              <div
                key={i}
                style={{
                  paddingBottom: i === events.length - 1 ? 0 : 20,
                  marginBottom:  i === events.length - 1 ? 0 : 20,
                  borderBottom:  i === events.length - 1 ? "none" : "1.5px solid rgba(26,29,94,0.08)",
                }}
              >
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  color: PESO_NAVY, fontSize: "1.1rem", margin: "0 0 14px", lineHeight: 1.3,
                }}>
                  {ev.institution}
                </h3>

                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 16 }}>
                  <span style={{ fontSize: "1rem" }}>🕐</span>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.68rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: PESO_RED }}>Time</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.88rem", color: "#5a5a7a" }}>{ev.time}</p>
                  </div>
                </div>

                <p style={{ margin: "0 0 8px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: PESO_RED }}>
                  Participants
                </p>
                <ScrollHint isMobile={isMobile} />
                <div style={{ marginBottom: 16 }}>
                  <ScrollableTable isMobile={isMobile} minWidth={380}>
                    <thead>
                      <tr style={{ background: "#f4f4f6" }}>
                        <th style={getThStyle(isMobile)}>Group</th>
                        <th style={getThStyleRight(isMobile)}>Female</th>
                        <th style={getThStyleRight(isMobile)}>Male</th>
                        <th style={getThStyleRight(isMobile)}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ev.participants.map((group, gi) => (
                        <tr key={gi} style={{ borderTop: "1px solid rgba(26,29,94,0.06)" }}>
                          <td style={{ ...getTdStyle(isMobile), color: PESO_NAVY, fontWeight: 600, whiteSpace: "nowrap" }}>{group.label}</td>
                          <td style={{ ...getTdStyleRight(isMobile), whiteSpace: "nowrap" }}>{group.female}</td>
                          <td style={{ ...getTdStyleRight(isMobile), whiteSpace: "nowrap" }}>{group.male}</td>
                          <td style={{ ...getTdStyleRight(isMobile), fontWeight: 700, whiteSpace: "nowrap" }}>{group.female + group.male}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: "1.5px solid rgba(26,29,94,0.12)", background: "#fff1f2" }}>
                        <td colSpan={3} style={{ ...getTdStyle(isMobile), color: PESO_RED, fontWeight: 700, whiteSpace: "nowrap" }}>Grand Total</td>
                        <td style={{ ...getTdStyleRight(isMobile), color: PESO_RED, fontWeight: 800, whiteSpace: "nowrap" }}>
                          {ev.participants.reduce((sum, g) => sum + g.female + g.male, 0)}
                        </td>
                      </tr>
                    </tbody>
                  </ScrollableTable>
                </div>

                <p style={{ margin: "0 0 8px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: PESO_RED }}>
                  Topics Requested
                </p>
                <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
                  {ev.topics.map((topic, idx) => (
                    <li key={idx} style={{ fontSize: "0.88rem", color: "#5a5a7a", lineHeight: 1.5 }}>
                      {topic}
                    </li>
                  ))}
                </ul>

                <p style={{ margin: "0 0 8px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: PESO_RED }}>
                  Photos
                </p>
                {ev.images.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {ev.images.map((photo, pi) => (
                      <div
                        key={pi}
                        onClick={() => onOpenLightbox(photo, ev.institution)}
                        style={{
                          aspectRatio: "4/3", borderRadius: 8, overflow: "hidden",
                          cursor: "zoom-in", border: "1px solid rgba(26,29,94,0.08)",
                        }}
                      >
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {Array.from({ length: ev.placeholderCount }).map((_, pi) => (
                      <div key={pi} style={{
                        aspectRatio: "4/3", borderRadius: 8,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                        background: "rgba(26,29,94,0.03)",
                        border: "1.5px dashed rgba(26,29,94,0.14)",
                      }}>
                        <span style={{ fontSize: "1.1rem", opacity: 0.3 }}>🖼️</span>
                        <span style={{ fontSize: "0.55rem", fontWeight: 700, color: "#9a9ab0", letterSpacing: 0.3, textAlign: "center", padding: "0 4px" }}>
                          Photo coming soon
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            padding: isMobile ? "12px 16px" : "14px 24px", borderTop: "1px solid #f0f0f4",
            display: "flex", justifyContent: "flex-end", flexShrink: 0,
          }}>
            <button
              onClick={onClose}
              style={{
                background: PESO_NAVY, color: "white",
                border: "none", borderRadius: 8,
                padding: "10px 24px", fontWeight: 700,
                fontSize: "0.88rem", cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Summary Detail Modal ───────────────────────────────────────────────────────
// Opens when any of the three summary cards (Activities / Participants /
// Institutions) is clicked. Shows a fuller breakdown behind that number so
// the summary strip works as a jumping-off point for a report rather than
// a dead-end stat.

type SummaryModalType = "activities" | "participants" | "institutions";

function SummaryModal({
  type,
  onClose,
  isMobile,
}: {
  type: SummaryModalType;
  onClose: () => void;
  isMobile: boolean;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const titles: Record<SummaryModalType, string> = {
    activities:   "CDSP Activities Conducted",
    participants: "Total Participants Reached",
    institutions: "Institutions Visited",
  };

  const subtitles: Record<SummaryModalType, string> = {
    activities:   "Every scheduled activity, most recent first.",
    participants: "Broken down by participant group and by institution.",
    institutions: "Every institution visited, with visit count and reach.",
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1500,
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1501,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? 10 : 16,
      }}>
        <div style={{
          background: "white", borderRadius: 16,
          width: "100%", maxWidth: 560,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          overflow: "hidden", animation: "modalIn 0.2s ease",
          maxHeight: "85vh", display: "flex", flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{
            background: PESO_NAVY, padding: isMobile ? "14px 16px" : "18px 24px",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexShrink: 0,
          }}>
            <div>
              <p style={{
                color: PESO_GOLD, fontSize: "0.68rem", fontWeight: 700,
                letterSpacing: 2, textTransform: "uppercase", margin: "0 0 3px",
              }}>
                Summary Breakdown
              </p>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                color: "white", fontSize: isMobile ? "1.05rem" : "1.2rem", margin: 0,
              }}>
                {titles[type]}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "50%", width: 32, height: 32,
                color: "white", cursor: "pointer", fontSize: "1rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >✕</button>
          </div>

          <div style={{
            overflowY: "auto", flex: 1,
            padding: isMobile ? "16px 14px" : "20px 24px",
          }}>
            <p style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "#5a5a7a", lineHeight: 1.5 }}>
              {subtitles[type]}
            </p>

            {type === "activities" && <ActivitiesBreakdown isMobile={isMobile} />}
            {type === "participants" && <ParticipantsBreakdown isMobile={isMobile} />}
            {type === "institutions" && <InstitutionsBreakdown isMobile={isMobile} />}
          </div>

          {/* Footer */}
          <div style={{
            padding: isMobile ? "12px 16px" : "14px 24px", borderTop: "1px solid #f0f0f4",
            display: "flex", justifyContent: "flex-end", flexShrink: 0,
          }}>
            <button
              onClick={onClose}
              style={{
                background: PESO_NAVY, color: "white",
                border: "none", borderRadius: 8,
                padding: "10px 24px", fontWeight: 700,
                fontSize: "0.88rem", cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// Base th/td styles as functions of isMobile — smaller type + tighter
// padding on small screens so tables take up less horizontal space before
// scrolling ever needs to kick in.
const getThStyle = (isMobile: boolean): React.CSSProperties => ({
  textAlign: "left",
  padding: isMobile ? "7px 10px" : "8px 12px",
  fontSize: isMobile ? "0.62rem" : "0.66rem",
  fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "#94a3b8",
  whiteSpace: "nowrap",
});
const getThStyleRight = (isMobile: boolean): React.CSSProperties => ({
  ...getThStyle(isMobile), textAlign: "right",
});
const getTdStyle = (isMobile: boolean): React.CSSProperties => ({
  padding: isMobile ? "7px 10px" : "8px 12px",
  color: "#5a5a7a",
  fontSize: isMobile ? "0.8rem" : "0.85rem",
});
const getTdStyleRight = (isMobile: boolean): React.CSSProperties => ({
  ...getTdStyle(isMobile), textAlign: "right",
});

// Wraps a table so it scrolls horizontally instead of overflowing the modal
// on narrow screens. minWidth on the inner table forces columns to keep
// their natural width — text stays readable, and the user swipes to see
// columns that don't fit, rather than everything getting squished.
function ScrollableTable({
  children,
  isMobile,
  minWidth,
}: {
  children: React.ReactNode;
  isMobile: boolean;
  minWidth: number;
}) {
  return (
    <div style={{
      border: "1.5px solid rgba(26,29,94,0.08)",
      borderRadius: 10,
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
    }}>
      <table style={{
        width: "100%",
        minWidth: isMobile ? minWidth : "100%",
        borderCollapse: "collapse",
      }}>
        {children}
      </table>
    </div>
  );
}

// Small "swipe to see more" hint shown above a table only on mobile, only
// when that table is wide enough to actually need scrolling.
function ScrollHint({ isMobile }: { isMobile: boolean }) {
  if (!isMobile) return null;
  return (
    <p style={{
      fontSize: "0.68rem", color: "#94a3b8", fontStyle: "italic",
      margin: "0 0 6px", display: "flex", alignItems: "center", gap: 4,
    }}>
      ← Swipe table to see more →
    </p>
  );
}

// "CDSP Activities Conducted" breakdown — every activity, with the place
// (institution) and date, most recent first.
function ActivitiesBreakdown({ isMobile }: { isMobile: boolean }) {
  const rows = [...STATIC_EVENTS].sort(
    (a, b) => eventSortKey(b.date).localeCompare(eventSortKey(a.date))
  );
  const th = getThStyle(isMobile);
  const thRight = getThStyleRight(isMobile);
  const td = getTdStyle(isMobile);
  const tdRight = getTdStyleRight(isMobile);

  return (
    <>
      <ScrollHint isMobile={isMobile} />
      <ScrollableTable isMobile={isMobile} minWidth={560}>
        <thead>
          <tr style={{ background: "#f4f4f6" }}>
            <th style={th}>Date</th>
            <th style={th}>Institution</th>
            <th style={thRight}>Participants</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((ev, i) => (
            <tr key={i} style={{ borderTop: "1px solid rgba(26,29,94,0.06)" }}>
              <td style={{ ...td, color: PESO_NAVY, fontWeight: 600, whiteSpace: "nowrap" }}>
                {formatEventDateLabel(ev.date)}
              </td>
              <td style={{ ...td, whiteSpace: isMobile ? "nowrap" : "normal" }}>{ev.institution}</td>
              <td style={{ ...tdRight, fontWeight: 700, color: PESO_NAVY, whiteSpace: "nowrap" }}>
                {totalForEvent(ev)}
              </td>
            </tr>
          ))}
        </tbody>
      </ScrollableTable>
    </>
  );
}

// "Total Participants Reached" breakdown — totals by participant group
// (Junior High School, College, Faculty, etc.) and totals by institution.
function ParticipantsBreakdown({ isMobile }: { isMobile: boolean }) {
  const groupRows = getParticipantGroupBreakdown();
  const institutionRows = [...getInstitutionBreakdown()].sort(
    (a, b) => b.totalParticipants - a.totalParticipants
  );
  const grandTotal = groupRows.reduce((s, g) => s + g.female + g.male, 0);
  const th = getThStyle(isMobile);
  const thRight = getThStyleRight(isMobile);
  const td = getTdStyle(isMobile);
  const tdRight = getTdStyleRight(isMobile);

  return (
    <>
      <p style={{ margin: "0 0 8px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: PESO_RED }}>
        By Participant Group
      </p>
      <ScrollHint isMobile={isMobile} />
      <div style={{ marginBottom: 20 }}>
        <ScrollableTable isMobile={isMobile} minWidth={420}>
          <thead>
            <tr style={{ background: "#f4f4f6" }}>
              <th style={th}>Group</th>
              <th style={thRight}>Female</th>
              <th style={thRight}>Male</th>
              <th style={thRight}>Total</th>
            </tr>
          </thead>
          <tbody>
            {groupRows.map((g, i) => (
              <tr key={i} style={{ borderTop: "1px solid rgba(26,29,94,0.06)" }}>
                <td style={{ ...td, color: PESO_NAVY, fontWeight: 600, whiteSpace: "nowrap" }}>{g.label}</td>
                <td style={{ ...tdRight, whiteSpace: "nowrap" }}>{g.female}</td>
                <td style={{ ...tdRight, whiteSpace: "nowrap" }}>{g.male}</td>
                <td style={{ ...tdRight, fontWeight: 700, color: PESO_NAVY, whiteSpace: "nowrap" }}>{g.female + g.male}</td>
              </tr>
            ))}
            <tr style={{ borderTop: "1.5px solid rgba(26,29,94,0.12)", background: "#fff1f2" }}>
              <td colSpan={3} style={{ ...td, color: PESO_RED, fontWeight: 700, whiteSpace: "nowrap" }}>Grand Total</td>
              <td style={{ ...tdRight, color: PESO_RED, fontWeight: 800, whiteSpace: "nowrap" }}>{grandTotal}</td>
            </tr>
          </tbody>
        </ScrollableTable>
      </div>

      <p style={{ margin: "0 0 8px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: PESO_RED }}>
        By Institution
      </p>
      <ScrollHint isMobile={isMobile} />
      <ScrollableTable isMobile={isMobile} minWidth={480}>
        <thead>
          <tr style={{ background: "#f4f4f6" }}>
            <th style={th}>Institution</th>
            <th style={thRight}>Total Participants</th>
          </tr>
        </thead>
        <tbody>
          {institutionRows.map((row, i) => (
            <tr key={i} style={{ borderTop: "1px solid rgba(26,29,94,0.06)" }}>
              <td style={{ ...td, color: PESO_NAVY, fontWeight: 600, whiteSpace: isMobile ? "nowrap" : "normal" }}>{row.institution}</td>
              <td style={{ ...tdRight, fontWeight: 700, color: PESO_NAVY, whiteSpace: "nowrap" }}>{row.totalParticipants}</td>
            </tr>
          ))}
        </tbody>
      </ScrollableTable>
    </>
  );
}

// "Institutions Visited" breakdown — every unique institution (the place/
// school), how many times CDSP has been there, and how many people were
// reached there in total.
function InstitutionsBreakdown({ isMobile }: { isMobile: boolean }) {
  const rows = getInstitutionBreakdown();
  const th = getThStyle(isMobile);
  const thRight = getThStyleRight(isMobile);
  const td = getTdStyle(isMobile);
  const tdRight = getTdStyleRight(isMobile);

  return (
    <>
      <ScrollHint isMobile={isMobile} />
      <ScrollableTable isMobile={isMobile} minWidth={520}>
        <thead>
          <tr style={{ background: "#f4f4f6" }}>
            <th style={th}>Institution</th>
            <th style={thRight}>Visits</th>
            <th style={thRight}>Total Participants</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderTop: "1px solid rgba(26,29,94,0.06)" }}>
              <td style={{ ...td, color: PESO_NAVY, fontWeight: 600, whiteSpace: isMobile ? "nowrap" : "normal" }}>{row.institution}</td>
              <td style={{ ...tdRight, whiteSpace: "nowrap" }}>{row.visits}</td>
              <td style={{ ...tdRight, fontWeight: 700, color: PESO_NAVY, whiteSpace: "nowrap" }}>{row.totalParticipants}</td>
            </tr>
          ))}
        </tbody>
      </ScrollableTable>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const CdspSchedulePage: React.FC = () => {
  const navigate    = useNavigate();
  const today       = new Date();

  const [year, setYear]           = useState(today.getFullYear());
  const [month, setMonth]         = useState(today.getMonth() + 1); // 1-indexed
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<{ photo: CdspPhoto; institution: string } | null>(null);
  const [summaryModal, setSummaryModal] = useState<SummaryModalType | null>(null);
  const [isMobile, setIsMobile]   = useState(
    () => window.matchMedia("(max-width: 640px)").matches
  );

  // Track mobile breakpoint
  React.useEffect(() => {
    const mq     = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // ── Calendar grid helpers ──────────────────────────────────────────────────

  const monthEvents   = getEventsForMonth(year, month);
  const summary        = getOverallSummary();
  const firstDow      = new Date(year, month - 1, 1).getDay(); // 0 = Sun
  const daysInMonth   = new Date(year, month, 0).getDate();

  // Build flat array: nulls for leading empty cells, then 1..daysInMonth
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete the last row
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedDay(null);
  };

  const eventsForDay  = (day: number) => monthEvents.filter((e) => e.day === day);
  const isToday       = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() + 1 &&
    year === today.getFullYear();

  // Shared style + hover handlers for the three clickable summary cards.
  const summaryCardStyle: React.CSSProperties = {
    background: "white", borderRadius: 12,
    border: "1.5px solid rgba(26,29,94,0.08)",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
    padding: isMobile ? "14px 14px" : "18px 20px",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    fontFamily: "'Source Sans 3', sans-serif",
    transition: "box-shadow 0.15s, transform 0.15s, border-color 0.15s",
  };
  const onSummaryHoverEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = "0 6px 18px rgba(26,29,94,0.12)";
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.borderColor = "rgba(26,29,94,0.18)";
  };
  const onSummaryHoverLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)";
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.borderColor = "rgba(26,29,94,0.08)";
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#f4f4f6",
        fontFamily: "'Source Sans 3', sans-serif",
      }}>

        {/* ── Page Header ── */}
        <div style={{
          background: PESO_NAVY,
          padding: isMobile ? "32px 20px 28px" : "48px 32px 40px",
          borderBottom: `4px solid ${PESO_GOLD}`,
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>

            {/* Back button */}
            <button
              onClick={() => navigate("/")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.1)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                borderRadius: 8, padding: "7px 14px",
                color: "rgba(255,255,255,0.85)", fontSize: "0.8rem",
                fontWeight: 600, cursor: "pointer", marginBottom: 20,
                letterSpacing: 0.3, fontFamily: "'Source Sans 3', sans-serif",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.18)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              }}
            >
              ← Back to Home
            </button>

            <p style={{
              color: PESO_GOLD, fontSize: "0.72rem", fontWeight: 700,
              letterSpacing: 3, textTransform: "uppercase", margin: "0 0 8px",
            }}>
              Career Development Support
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif", color: "white",
              fontSize: isMobile ? "1.8rem" : "clamp(1.8rem, 3.5vw, 2.8rem)",
              margin: "0 0 10px", lineHeight: 1.2,
            }}>
              CDSP Schedule
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.65)", fontSize: "0.95rem",
              fontWeight: 300, margin: 0,
              maxWidth: isMobile ? "100%" : 520,
            }}>
              Scheduled CDSP activities — click any highlighted date to view
              the institution, time, participants, and topics requested.
            </p>
          </div>
        </div>

        {/* ── Summary ── */}
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: isMobile ? "20px 12px 0" : "32px 24px 0",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)",
            gap: isMobile ? 10 : 16,
          }}>
            <button
              onClick={() => setSummaryModal("activities")}
              style={summaryCardStyle}
              onMouseEnter={onSummaryHoverEnter}
              onMouseLeave={onSummaryHoverLeave}
            >
              <p style={{
                fontSize: isMobile ? "1.5rem" : "1.9rem", fontWeight: 800,
                color: PESO_NAVY, margin: "0 0 2px", fontFamily: "'Playfair Display', serif",
              }}>
                {summary.totalActivities}
              </p>
              <p style={{
                fontSize: "0.72rem", fontWeight: 700, letterSpacing: 0.5,
                color: "#94a3b8", margin: 0, textTransform: "uppercase",
              }}>
                CDSP Activities Conducted
              </p>
            </button>

            <button
              onClick={() => setSummaryModal("participants")}
              style={summaryCardStyle}
              onMouseEnter={onSummaryHoverEnter}
              onMouseLeave={onSummaryHoverLeave}
            >
              <p style={{
                fontSize: isMobile ? "1.5rem" : "1.9rem", fontWeight: 800,
                color: PESO_RED, margin: "0 0 2px", fontFamily: "'Playfair Display', serif",
              }}>
                {summary.totalParticipants}
              </p>
              <p style={{
                fontSize: "0.72rem", fontWeight: 700, letterSpacing: 0.5,
                color: "#94a3b8", margin: 0, textTransform: "uppercase",
              }}>
                Total Participants Reached
              </p>
            </button>

            <button
              onClick={() => setSummaryModal("institutions")}
              style={{
                ...summaryCardStyle,
                gridColumn: isMobile ? "span 2" : undefined,
              }}
              onMouseEnter={onSummaryHoverEnter}
              onMouseLeave={onSummaryHoverLeave}
            >
              <p style={{
                fontSize: isMobile ? "1.5rem" : "1.9rem", fontWeight: 800,
                color: "#e8a800", margin: "0 0 2px", fontFamily: "'Playfair Display', serif",
              }}>
                {summary.uniqueInstitutions}
              </p>
              <p style={{
                fontSize: "0.72rem", fontWeight: 700, letterSpacing: 0.5,
                color: "#94a3b8", margin: 0, textTransform: "uppercase",
              }}>
                Institutions Visited
              </p>
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: isMobile ? "24px 12px" : "40px 24px",
        }}>

          {/* ── Wall Calendar ── */}
          <div style={{
            background: "white",
            borderRadius: isMobile ? 12 : 16,
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            overflow: "hidden",
          }}>

            {/* Month navigation header */}
            <div style={{
              background: PESO_NAVY, padding: "16px 24px",
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
            }}>
              <button
                onClick={prevMonth}
                aria-label="Previous month"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 8, width: 36, height: 36,
                  color: "white", fontSize: "1.2rem", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >‹</button>

              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                color: "white", fontSize: isMobile ? "1rem" : "1.2rem",
                margin: 0,
              }}>
                {MONTH_NAMES[month - 1]} {year}
              </h3>

              <button
                onClick={nextMonth}
                aria-label="Next month"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 8, width: 36, height: 36,
                  color: "white", fontSize: "1.2rem", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >›</button>
            </div>

            {/* Day-of-week headers */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
              background: "#f4f4f6", borderBottom: "1px solid #e2e8f0",
            }}>
              {DAY_NAMES.map((d) => (
                <div key={d} style={{
                  padding: isMobile ? "8px 0" : "10px 0",
                  textAlign: "center",
                  fontSize: isMobile ? "0.62rem" : "0.7rem",
                  fontWeight: 700, color: "#94a3b8",
                  letterSpacing: 1, textTransform: "uppercase",
                }}>
                  {isMobile ? d.charAt(0) : d}
                </div>
              ))}
            </div>

            {/* Day cells grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              borderLeft: "1px solid #f0f0f4",
            }}>
              {cells.map((day, i) => {
                // Empty cell (before first day of month)
                if (day === null) {
                  return (
                    <div key={`empty-${i}`} style={{
                      minHeight: isMobile ? 52 : 80,
                      minWidth: 0,
                      background: "#fafafa",
                      borderRight: "1px solid #f0f0f4",
                      borderBottom: "1px solid #f0f0f4",
                      boxSizing: "border-box",
                    }} />
                  );
                }

                const dayEvs     = eventsForDay(day);
                const hasEvs     = dayEvs.length > 0;
                const isSelected = selectedDay === day;
                const isTod      = isToday(day);

                return (
                  <div
                    key={day}
                    onClick={() => hasEvs
                      ? setSelectedDay(isSelected ? null : day)
                      : undefined
                    }
                    style={{
                      minHeight: isMobile ? 52 : 80,
                      minWidth: 0,
                      padding: isMobile ? "4px 4px" : "6px 8px",
                      borderRight: "1px solid #f0f0f4",
                      borderBottom: "1px solid #f0f0f4",
                      background: isSelected
                        ? "rgba(26,29,94,0.06)"
                        : isTod
                        ? "rgba(232,168,0,0.06)"
                        : "white",
                      cursor: hasEvs ? "pointer" : "default",
                      transition: "background 0.15s",
                      overflow: "hidden",
                      boxSizing: "border-box",
                    }}
                    onMouseEnter={(e) => {
                      if (hasEvs && !isSelected)
                        e.currentTarget.style.background = "rgba(26,29,94,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      if (hasEvs && !isSelected)
                        e.currentTarget.style.background = isTod
                          ? "rgba(232,168,0,0.06)" : "white";
                    }}
                  >
                    {/* Day number circle */}
                    <div style={{
                      width: isMobile ? 22 : 26,
                      height: isMobile ? 22 : 26,
                      borderRadius: "50%",
                      display: "flex", alignItems: "center",
                      justifyContent: "center",
                      background: isTod
                        ? PESO_RED
                        : isSelected ? PESO_NAVY : "transparent",
                      color: isTod || isSelected ? "white" : "#1e293b",
                      fontSize: isMobile ? "0.7rem" : "0.8rem",
                      fontWeight: isTod || isSelected ? 700 : 400,
                      marginBottom: 3,
                      flexShrink: 0,
                    }}>
                      {day}
                    </div>

                    {/* Marker dot for days with an activity */}
                    {hasEvs && (
                      <span style={{
                        display: "block",
                        width: isMobile ? 5 : 6,
                        height: isMobile ? 5 : 6,
                        borderRadius: "50%",
                        background: PESO_RED,
                      }} />
                    )}

                    {/* Institution name pill — desktop only */}
                    {hasEvs && !isMobile && (
                      <div style={{ marginTop: 4, width: "100%", overflow: "hidden" }}>
                        {dayEvs.slice(0, 1).map((ev, idx) => (
                          <div key={idx} title={ev.institution} style={{
                            background: "#fff1f2",
                            color: PESO_RED,
                            fontSize: "0.6rem", fontWeight: 600,
                            borderRadius: 3, padding: "1px 4px",
                            whiteSpace: "nowrap", overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "100%", boxSizing: "border-box",
                          }}>
                            {ev.institution}
                          </div>
                        ))}
                        {dayEvs.length > 1 && (
                          <div style={{
                            fontSize: "0.6rem", color: "#94a3b8",
                            fontWeight: 600, paddingLeft: 2, marginTop: 2,
                          }}>
                            +{dayEvs.length - 1} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Empty month state */}
            {monthEvents.length === 0 && (
              <div style={{
                borderTop: "1px solid #f0f0f4",
                padding: "32px 24px", textAlign: "center", color: "#94a3b8",
              }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>📭</div>
                <p style={{ fontSize: "0.88rem", margin: 0 }}>
                  No CDSP activities scheduled for this month.
                </p>
              </div>
            )}
          </div>

          {/* Mobile tap hint */}
          {isMobile && (
            <p style={{
              fontSize: "0.75rem", color: "#94a3b8",
              fontStyle: "italic", marginTop: 12, textAlign: "center",
            }}>
              Tap a highlighted date to view details
            </p>
          )}
        </div>
      </div>

      {/* ── Day detail modal — opens when a highlighted day is clicked ── */}
      {selectedDay && eventsForDay(selectedDay).length > 0 && (
        <DayModal
          day={selectedDay}
          month={month}
          year={year}
          events={eventsForDay(selectedDay)}
          onClose={() => setSelectedDay(null)}
          onOpenLightbox={(photo, institution) => setLightbox({ photo, institution })}
          isMobile={isMobile}
        />
      )}

      {/* ── Summary detail modal — opens when a summary card is clicked ── */}
      {summaryModal && (
        <SummaryModal
          type={summaryModal}
          isMobile={isMobile}
          onClose={() => setSummaryModal(null)}
        />
      )}

      {/* ── Photo lightbox — opens when a thumbnail inside the modal is clicked ── */}
      {lightbox && (
        <ImageLightbox
          photo={lightbox.photo}
          institution={lightbox.institution}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
};

export default CdspSchedulePage;