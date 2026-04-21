export function extractApplicationCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.applications)) return payload.applications;
  return [];
}

export function normalizeCompanyCandidateStatus(value) {
  const normalized = String(value || "PENDING").trim().toUpperCase();

  if (["HIRED", "ACCEPTED", "OFFER", "OFFERED"].includes(normalized)) {
    return "HIRED";
  }

  if (["REJECTED", "DECLINED"].includes(normalized)) {
    return "REJECTED";
  }

  return "PENDING";
}

export function mapApplicationStage(value) {
  const normalized = String(value || "PENDING").trim().toUpperCase();

  if (["HIRED", "ACCEPTED", "OFFER", "OFFERED"].includes(normalized)) {
    return "Diterima";
  }

  if (["REJECTED", "DECLINED"].includes(normalized)) {
    return "Ditolak";
  }

  if (normalized === "MENGUNDURKAN_DIRI" || normalized === "WITHDRAWN") {
    return "Mengundurkan Diri";
  }

  return "Pending";
}

function normalizeWorkType(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "onsite") return "WFO";
  if (normalized === "remote") return "Remote";
  if (normalized === "hybrid") return "Hybrid";

  return value || "";
}

export function mapAppliedJobFromApplication(item = {}, fallback = {}) {
  const job = item?.lowongan || item?.job || item?.vacancy || {};
  const companyProfile =
    job?.companyProfile ||
    item?.company ||
    item?.companyProfile ||
    fallback?.companyProfile ||
    {};

  return {
    id: String(
      item?.application_id ||
        item?.id ||
        fallback?.id ||
        "",
    ),
    title:
      job?.judul_posisi ||
      job?.judul_pekerjaan ||
      job?.title ||
      job?.position ||
      item?.job_title ||
      fallback?.title ||
      "Belum ada lowongan dipilih",
    company:
      companyProfile?.nama_perusahaan ||
      companyProfile?.name ||
      companyProfile?.company_name ||
      item?.company_name ||
      fallback?.company ||
      "Perusahaan belum tersedia",
    location:
      job?.lokasi ||
      job?.location ||
      item?.location ||
      fallback?.location ||
      "Lokasi belum tersedia",
    type:
      job?.tipe_magang ||
      job?.tipe_pekerjaan ||
      job?.type ||
      item?.type ||
      fallback?.type ||
      "MAGANG",
    duration:
      job?.durasi ||
      item?.duration ||
      fallback?.duration ||
      "",
    work:
      normalizeWorkType(job?.tipe_magang || job?.tipe_pekerjaan || job?.type) ||
      item?.work ||
      fallback?.work ||
      "",
    stage: mapApplicationStage(item?.status || item?.application_status || fallback?.rawStatus),
    rawStatus: String(item?.status || item?.application_status || fallback?.rawStatus || "PENDING").toUpperCase(),
    motivation: fallback?.motivation || "",
    companyProfile,
    appliedAt: item?.created_at || fallback?.appliedAt || new Date().toISOString(),
  };
}
