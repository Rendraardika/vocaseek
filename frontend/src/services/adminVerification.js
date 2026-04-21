import { Building2, Leaf, Paintbrush2, Store } from "lucide-react";
import api from "../lib/api";
import { pickFirstMediaValue } from "../utils/media";

const VERIFICATION_BASE = "/admin/verification";
const PARTNERS_BASE = "/admin/partners";

const BUSINESS_ICONS = [Building2, Paintbrush2, Leaf, Store];
const BUSINESS_CLASSES = ["blue", "pink", "green", "orange"];
const PARTNER_ICON_CLASSES = ["blue", "pink", "green", "orange"];
const BADGE_CLASSES = ["purple", "pink", "green", "orange"];

function getApiOrigin() {
  const baseURL = api.defaults.baseURL || "";

  if (!baseURL) return "";

  try {
    return new URL(baseURL, window.location.origin).origin;
  } catch {
    return "";
  }
}

function toAssetUrl(value) {
  if (!value || typeof value !== "string") return null;
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;

  const trimmed = value.replace(/^\/+/, "");
  const normalizedPath = trimmed.startsWith("storage/")
    ? trimmed
    : `storage/${trimmed}`;
  const apiOrigin = getApiOrigin();

  return apiOrigin ? `${apiOrigin}/${normalizedPath}` : `/${normalizedPath}`;
}

function getDocumentUrl(candidate) {
  if (!candidate) return null;

  if (typeof candidate === "string") {
    return toAssetUrl(candidate);
  }

  if (typeof candidate !== "object") {
    return null;
  }

  return toAssetUrl(
    candidate.url ||
      candidate.preview_url ||
      candidate.previewUrl ||
      candidate.download_url ||
      candidate.downloadUrl ||
      candidate.path ||
      candidate.file ||
      candidate.value ||
      null,
  );
}

function findDocumentByName(documents, keywords = []) {
  if (!Array.isArray(documents) || !keywords.length) return null;

  return (
    documents.find((item) => {
      const haystack = [
        item?.nama,
        item?.name,
        item?.jenis,
        item?.slug,
        item?.key,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return keywords.some((keyword) => haystack.includes(String(keyword).toLowerCase()));
    }) || null
  );
}

function extractCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.companies)) return payload.companies;
  if (Array.isArray(payload?.partners)) return payload.partners;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function getBusinessType(item) {
  return (
    item?.tipe_bisnis ||
    item?.industri ||
    item?.business_type ||
    item?.industry ||
    item?.nama_perusahaan?.industri ||
    item?.company_profile?.industry ||
    item?.sector ||
    "Perusahaan"
  );
}

function getStatus(item) {
  const rawStatus = (
    item?.status_mitra ||
    item?.status_verifikasi ||
    item?.verification_status ||
    item?.status ||
    "pending"
  );

  const normalized = String(rawStatus).toLowerCase();

  if (normalized === "active") return "approved";
  if (normalized === "reviewed") return "review";
  if (normalized === "rejected") return "rejected";
  if (normalized === "pending") return "pending";

  return normalized;
}

function getPartnerStatus(item) {
  const rawStatus = (
    item?.status_verifikasi ||
    item?.status_mitra ||
    item?.verification_status ||
    item?.status ||
    "pending"
  );

  const normalized = String(rawStatus).toLowerCase();

  if (normalized === "approved") return "active";
  if (normalized === "reviewed") return "review";
  return normalized;
}

function getSubmittedAt(item) {
  const value =
    item?.submitted_at || item?.created_at || item?.tanggal_pengajuan;

  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function getCompanyCode(item) {
  return (
    item?.kode_perusahaan ||
    item?.company_code ||
    item?.user_code ||
    item?.id_perusahaan ||
    `CMP-${String(item?.user_id || item?.id || "NEW").padStart(3, "0")}`
  );
}

function getCompanyName(item) {
  const nestedCompany = item?.nama_perusahaan;
  return (
    (typeof nestedCompany === "object" ? nestedCompany?.nama : nestedCompany) ||
    item?.nama_perusahaan ||
    item?.company_name ||
    item?.company_profile?.nama_perusahaan ||
    item?.nama ||
    item?.name ||
    "Perusahaan Baru"
  );
}

function getCity(item) {
  const nestedCompany = item?.nama_perusahaan;
  return (
    (typeof nestedCompany === "object" ? nestedCompany?.lokasi : "") ||
    item?.city ||
    item?.kota ||
    item?.company_profile?.city ||
    item?.alamat_kota ||
    "Lokasi belum diisi"
  );
}

function mapCompanyRecord(item, index, mode = "verification") {
  const Icon = BUSINESS_ICONS[index % BUSINESS_ICONS.length];
  const iconClassPool =
    mode === "partner" ? PARTNER_ICON_CLASSES : BUSINESS_CLASSES;
  const companyData = item?.perusahaan || item;
  const companyProfileId =
    companyData?.id ||
    companyData?.company_profile_id ||
    item?.company_profile_id ||
    null;
  const userId =
    companyData?.user_id || item?.user_id || companyData?.user?.user_id || null;
  const pic = item?.pic || {};
  const partnerStatus =
    mode === "partner" ? getPartnerStatus(companyData) : getStatus(companyData);
  const documentsSource =
    companyData?.documents ||
    companyData?.legal_documents ||
    companyData?.legalDocuments ||
    companyData?.company_documents ||
    companyData?.companyDocuments ||
    {};
  const rawDocuments =
    item?.dokumen ||
    item?.documents ||
    companyData?.dokumen ||
    companyData?.documents ||
    [];
  const loaDocument = findDocumentByName(rawDocuments, ["loa", "letter of acceptance"]);
  const aktaDocument = findDocumentByName(rawDocuments, ["akta"]);

  return {
    id: companyProfileId || userId,
    companyProfileId,
    userId,
    raw: item,
    code: getCompanyCode(companyData),
    name: getCompanyName(companyData),
    logoUrl: pickFirstMediaValue(
      companyData?.logo_url,
      companyData?.logo,
      companyData?.logo_perusahaan,
      companyData?.company_profile?.logo_url,
      companyData?.company_profile?.logo,
      companyData?.company_profile?.logo_perusahaan,
      item?.logo_url,
      item?.logo,
    ),
    city: getCity(companyData),
    businessType: getBusinessType(companyData),
    status: partnerStatus,
    submittedAt: getSubmittedAt(companyData),
    email:
      pic?.email ||
      companyData?.email ||
      companyData?.company_email ||
      companyData?.user?.email ||
      "Email belum tersedia",
    phone:
      pic?.phone ||
      companyData?.notelp ||
      companyData?.phone ||
      companyData?.company_profile?.notelp ||
      companyData?.user?.notelp ||
      "Telepon belum tersedia",
    nib: companyData?.nib || companyData?.company_profile?.nib || "-",
    picName: pic?.nama || companyData?.nama_pic || getCompanyName(companyData),
    picRole: pic?.jabatan || companyData?.jabatan_pic || "PIC Perusahaan",
    notes:
      companyData?.review_notes ||
      item?.notes ||
      companyData?.catatan_verifikasi ||
      "",
    documents: {
      loa: getDocumentUrl(
        loaDocument ||
        documentsSource?.loa ||
        documentsSource?.loa_pdf ||
        companyData?.loa_url ||
          companyData?.preview_url?.loa ||
          companyData?.previewUrl?.loa ||
          companyData?.loa_pdf ||
          companyData?.company_profile?.loa_url ||
          companyData?.company_profile?.loa_pdf ||
          null,
      ),
      akta: getDocumentUrl(
        aktaDocument ||
        documentsSource?.akta ||
        documentsSource?.akta_pdf ||
        companyData?.akta_url ||
          companyData?.preview_url?.akta ||
          companyData?.previewUrl?.akta ||
          companyData?.akta_pdf ||
          companyData?.company_profile?.akta_url ||
          companyData?.company_profile?.akta_pdf ||
          null,
      ),
      extra: Array.isArray(rawDocuments) ? rawDocuments : [],
    },
    companyIconClass: iconClassPool[index % iconClassPool.length],
    businessTypeClass:
      companyData?.business_type_class ||
      companyData?.industry_class ||
      BADGE_CLASSES[index % BADGE_CLASSES.length],
    activities: Array.isArray(item?.aktivitas) ? item.aktivitas : [],
    Icon,
  };
}

export async function getVerificationCompanies() {
  const response = await api.get(VERIFICATION_BASE);
  return extractCollection(response.data).map((item, index) =>
    mapCompanyRecord(item, index),
  );
}

export async function getVerificationCompanyDetail(id) {
  const response = await api.get(`${VERIFICATION_BASE}/${id}/detail`);
  const payload =
    response.data?.data || response.data?.company || response.data?.partner || response.data;

  return mapCompanyRecord(payload, 0);
}

export function updateVerificationStatus(id, payload) {
  return api.put(`${VERIFICATION_BASE}/${id}/review-status`, payload);
}

export function finalizeVerification(id, payload) {
  return api.post(`${VERIFICATION_BASE}/${id}/final`, {
    action:
      payload?.status === "approved" || payload?.action === "approve"
        ? "approve"
        : "reject",
  });
}

export async function getPartners() {
  const response = await api.get(PARTNERS_BASE);
  const mappedPartners = extractCollection(response.data).map((item, index) =>
    mapCompanyRecord(item, index, "partner"),
  );

  const partnersMissingLogo = mappedPartners.filter(
    (partner) => !partner.logoUrl && (partner.companyProfileId || partner.id),
  );

  if (!partnersMissingLogo.length) {
    return mappedPartners;
  }

  const detailPairs = await Promise.all(
    partnersMissingLogo.map(async (partner) => {
      try {
        const detail = await getPartnerDetail(partner.companyProfileId || partner.id);
        return [String(partner.companyProfileId || partner.id), detail];
      } catch {
        return [String(partner.companyProfileId || partner.id), null];
      }
    }),
  );

  const detailMap = new Map(detailPairs);

  return mappedPartners.map((partner) => {
    const detail = detailMap.get(String(partner.companyProfileId || partner.id));

    if (!detail?.logoUrl) {
      return partner;
    }

    return {
      ...partner,
      logoUrl: detail.logoUrl,
    };
  });
}

export async function getPartnerDetail(id) {
  const response = await api.get(`${PARTNERS_BASE}/${id}`);
  const payload =
    response.data?.data || response.data?.partner || response.data?.company || response.data;

  return mapCompanyRecord(payload, 0, "partner");
}

export function deletePartner(id) {
  return api.delete(`${PARTNERS_BASE}/${id}`);
}
