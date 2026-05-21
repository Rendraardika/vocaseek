import api from "../lib/api";
import { pickFirstMediaValue } from "../utils/media";
import { getSavedLanguage } from "../utils/languagePreference";

const COMPANY_JOBS_ENDPOINT = "/company/jobs";
const PUBLIC_JOBS_ENDPOINT = "/popular-vacancies";
const LANDING_STATS_ENDPOINT = "/landing-stats";

function normalizeAssetUrl(value) {
  if (!value) return "";

  const raw = String(value).trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;

  const apiBase =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001/api";

  try {
    const apiUrl = new URL(apiBase, window.location.origin);
    const origin = apiUrl.origin;
    const trimmed = raw.replace(/^\/+/, "");
    const normalizedPath = trimmed.startsWith("storage/")
      ? trimmed
      : `storage/${trimmed}`;

    return `${origin}/${normalizedPath}`;
  } catch {
    return raw;
  }
}

function cleanText(value) {
  if (value === null || value === undefined) return "";

  return String(value).trim();
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLongDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    getSavedLanguage() === "en" ? "en-US" : "id-ID",
    {
    day: "numeric",
    month: "long",
    year: "numeric",
    }
  );
}

function formatSalary(value) {
  if (!value) return "";

  const formattedValue = String(value)
    .split("-")
    .map((item) => {
      const numberOnly = item.replace(/[^\d]/g, "");
      if (!numberOnly) return item.trim();

      return Number(numberOnly).toLocaleString("id-ID");
    })
    .join(" - ");

  return formattedValue;
}

function formatRelativeTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  const locale = getSavedLanguage();

  if (diffMinutes < 60) {
    const count = Math.max(diffMinutes, 1);
    return locale === "en"
      ? `${count} minute${count === 1 ? "" : "s"} ago`
      : `${count} menit lalu`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return locale === "en"
      ? `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
      : `${diffHours} jam lalu`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return locale === "en"
    ? `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
    : `${diffDays} hari lalu`;
}

function normalizeWorkSetting(value) {
  const normalized = cleanText(value).toLowerCase();

  if (normalized === "remote") return "Remote";
  if (normalized === "hybrid") return "Hybrid";
  if (normalized === "onsite") return "WFO";

  return cleanText(value);
}

function normalizeStatus(value) {
  const normalized = String(value || "").toUpperCase();

  if (normalized === "CLOSED") return "Closed";
  if (normalized === "DRAFT") return "Draft";
  return "Open";
}

function getJobTag(title) {
  const words = String(title || "Job")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "JB";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function splitLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getCompanyJobs() {
  return api.get(COMPANY_JOBS_ENDPOINT);
}

export function getCompanyDashboard() {
  return api.get("/company/dashboard");
}

export function createCompanyJob(payload) {
  return api.post(COMPANY_JOBS_ENDPOINT, payload);
}

export function deleteCompanyJob(id) {
  return api.delete(`${COMPANY_JOBS_ENDPOINT}/${id}`);
}

export function updateCompanyJob(id, payload) {
  return api.put(`${COMPANY_JOBS_ENDPOINT}/${id}`, payload);
}

export function getCompanyJobApplicants(jobId) {
  return api.get(`/company/jobs/${jobId}/applicants`);
}

export function updateCompanyApplicationStatus(id, payload) {
  return api.put(`/company/applications/${id}/status`, payload);
}

export function getPublicJobs() {
  return api.get(PUBLIC_JOBS_ENDPOINT);
}

export function getLandingStats() {
  return api.get(LANDING_STATS_ENDPOINT);
}

export function mapCompanyJobRow(job) {
  const title = job?.judul_posisi || job?.title || "Lowongan";
  const status = normalizeStatus(job?.status);

  return {
    raw: job,
    backendId: job?.id,
    id: `JOB-${String(job?.id || "000").padStart(3, "0")}`,
    tag: getJobTag(title),
    tagBg: "job-postings__tag-bg--fe",
    tagText: "job-postings__tag-text--fe",
    title,
    dept: job?.kategori_pekerjaan || job?.kategori || "Lowongan",
    team: normalizeWorkSetting(job?.tipe_magang),
    date: formatDate(job?.created_at),
    status,
    applicantsType: "none",
    applicantsLabel: "Belum ada pelamar",
    applicantCountBubble: false,
    actions: status === "Closed" ? "restore" : "edit",
  };
}

export function mapCompanyDashboardApplicant(applicant) {
  const rawStatus = String(applicant?.status || "PENDING").toUpperCase();
  const normalizedStatus =
    rawStatus === "REVIEW"
      ? "PENDING"
      : rawStatus === "ACCEPTED"
        ? "SHORTLISTED"
        : rawStatus;

  return {
    id:
      applicant?.candidate_id ||
      applicant?.application_id ||
      applicant?.id ||
      "-",
    name: applicant?.name || applicant?.candidate_name || "Kandidat",
    image: pickFirstMediaValue(
      applicant?.foto,
      applicant?.photo,
      applicant?.avatar,
      applicant?.image,
      applicant?.user?.foto,
      applicant?.user?.photo,
      applicant?.user?.avatar,
      applicant?.candidate?.foto,
      applicant?.candidate?.photo,
      applicant?.candidate?.avatar,
      applicant?.personal?.foto,
      applicant?.personal?.photo,
      applicant?.profile?.foto,
      applicant?.profile?.photo,
    ),
    position: applicant?.position || applicant?.job_title || "Posisi belum tersedia",
    date: formatDate(applicant?.date || applicant?.date_applied || applicant?.created_at),
    status: normalizedStatus,
    raw: applicant,
  };
}

export function mapPublicJob(job) {
  const title = cleanText(job?.judul_posisi || job?.title);
  const companyProfile = job?.company_profile || job?.companyProfile || {};
  const companyName =
    cleanText(
      companyProfile?.nama_perusahaan ||
        companyProfile?.name ||
        job?.nama_perusahaan,
    );
  const companyAddress =
    cleanText(
      companyProfile?.alamat_kantor_pusat ||
        companyProfile?.alamat_kantor ||
        job?.lokasi,
    );
  const location = cleanText(job?.lokasi) || companyAddress;
  const salary = formatSalary(job?.gaji_per_bulan);

  return {
    id: job?.id,
    title,
    company: companyName,
    location,
    type: cleanText(
      job?.kategori_pekerjaan || job?.tipe_pekerjaan || job?.jenis_pekerjaan,
    ),
    duration: salary,
    work: normalizeWorkSetting(job?.tipe_magang),
    postedAt: formatRelativeTime(job?.created_at),
    description: cleanText(job?.deskripsi_pekerjaan),
    qualifications: splitLines(job?.persyaratan),
    benefits: salary
      ? [getSavedLanguage() === "en" ? `Allowance: ${salary}` : `Insentif: ${salary}`]
      : [],
    education: null,
    documents: null,
    dates: {
      deadline: formatLongDate(
        job?.tanggal_penutupan_lamaran || job?.tgl_tutup_lamaran,
      ),
      start: formatLongDate(
        job?.tanggal_mulai_kerja || job?.tgl_mulai_kerja,
      ),
    },
    companyProfile: {
      id: companyProfile?.id || job?.company_profile_id || null,
      name: companyName,
      industry: cleanText(
        companyProfile?.industri || companyProfile?.sektor_industri,
      ),
      size: cleanText(companyProfile?.ukuran_perusahaan),
      website: cleanText(
        companyProfile?.website_url || companyProfile?.website,
      ),
      description: cleanText(companyProfile?.deskripsi),
      vision: cleanText(companyProfile?.visi || companyProfile?.vision),
      mission: cleanText(companyProfile?.misi || companyProfile?.mission),
      address: companyAddress,
      phone: cleanText(companyProfile?.notelp),
      status: cleanText(companyProfile?.status_mitra),
      logoUrl: normalizeAssetUrl(
        companyProfile?.logo_url || companyProfile?.logo_perusahaan || "",
      ),
    },
    raw: job,
  };
}
