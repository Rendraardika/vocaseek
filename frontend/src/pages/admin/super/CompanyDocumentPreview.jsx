import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/admin/Sidebar";
import "../../../styles/CompanyDocumentPreview.css";
import {
  ArrowLeft,
  Download,
  RotateCw,
  Printer,
  FileText,
  FileSearch,
  ExternalLink,
} from "lucide-react";
import api from "../../../lib/api";
import { getScopedUiItem } from "../../../utils/uiScopedStorage";

const LOCAL_SUBMISSION_KEY = "vocaseek_company_submissions";
const COMPANY_PREVIEW_STORAGE_KEY = "company_verification_preview";

function getFileExtension(value = "") {
  if (typeof value !== "string") return "";
  const cleanValue = value.split("?")[0];
  const parts = cleanValue.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function getFileNameFromUrl(url = "") {
  if (typeof url !== "string" || !url) return "";
  try {
    const cleanUrl = url.split("?")[0];
    const parts = cleanUrl.split("/");
    return parts[parts.length - 1] || "";
  } catch {
    return "";
  }
}

function resolveDocumentUrl(url = "") {
  if (typeof url !== "string" || !url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;

  const trimmed = url.replace(/^\/+/, "");
  const normalizedPath = trimmed.startsWith("storage/")
    ? trimmed
    : `storage/${trimmed}`;
  const baseURL = api.defaults.baseURL || "";

  try {
    const origin = baseURL
      ? new URL(baseURL, window.location.origin).origin
      : window.location.origin;
    return `${origin}/${normalizedPath}`;
  } catch {
    return `/${normalizedPath}`;
  }
}

function humanizeDocType(docType = "") {
  const map = {
    nib: "Business Identification Number (NIB)",
    npwp: "NPWP Perusahaan",
    akta: "Akta Pendirian Perusahaan",
    "akta-pendirian": "Akta Pendirian Perusahaan",
    loa: "Letter of Acceptance (LoA)",
    "company-profile": "Company Profile",
    profile: "Company Profile / SK",
    proposal: "Proposal Kerjasama",
  };

  return map[docType] || docType?.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeDocumentItem(item, fallbackKey) {
  if (!item) {
    return null;
  }

  if (typeof item === "string" || typeof item === "number") {
    const stringValue = String(item);

    const looksLikeFile =
      stringValue.includes("/") ||
      stringValue.startsWith("http") ||
      stringValue.startsWith("data:") ||
      /\.(pdf|png|jpg|jpeg|webp)$/i.test(stringValue);

    return {
      key: fallbackKey,
      title: humanizeDocType(fallbackKey),
      filename: looksLikeFile ? getFileNameFromUrl(stringValue) || `${fallbackKey}` : `${fallbackKey}`,
      type: looksLikeFile ? getFileExtension(stringValue).toUpperCase() || "FILE" : "TEXT",
      size: "-",
      uploaded: "-",
      uploader: "-",
      url: looksLikeFile ? resolveDocumentUrl(stringValue) : "",
      value: looksLikeFile ? "" : stringValue,
      raw: item,
    };
  }

  const url =
    item.url ||
    item.file ||
    item.path ||
    item.documentUrl ||
    item.previewUrl ||
    item.downloadUrl ||
    "";

  const explicitFilename =
    item.filename ||
    item.fileName ||
    item.name ||
    item.original_name ||
    item.originalName ||
    "";

  const fallbackFilename = url ? getFileNameFromUrl(url) : "";
  const filename = explicitFilename || fallbackFilename || fallbackKey;

  const type =
    item.type ||
    item.fileType ||
    item.mimeType ||
    (url ? getFileExtension(url).toUpperCase() : item.value ? "TEXT" : "FILE") ||
    "FILE";

  const value =
    item.value ||
    item.number ||
    item.documentNumber ||
    item.text ||
    item.label ||
    "";

  return {
    key: item.key || fallbackKey,
    title: item.title || item.label || humanizeDocType(fallbackKey),
    filename,
    type,
    size: item.size || item.fileSize || "-",
    uploaded: item.uploaded || item.uploadedAt || item.createdAt || "-",
    uploader: item.uploader || item.uploadedBy || item.pic || "-",
    url: resolveDocumentUrl(url),
    value,
    raw: item,
  };
}

function extractDocuments(company) {
  if (!company) return {};

  const rawSources = [
    company.documents,
    company.legalDocuments,
    company.companyDocuments,
    company.verificationDocuments,
  ].filter(Boolean);

  const mergedDocs = {};

  rawSources.forEach((source) => {
    if (Array.isArray(source)) {
      source.forEach((item, index) => {
        const key =
          item?.key ||
          item?.docType ||
          item?.slug ||
          item?.typeKey ||
          `document-${index + 1}`;
        mergedDocs[key] = normalizeDocumentItem(item, key);
      });
      return;
    }

    if (typeof source === "object") {
      Object.entries(source).forEach(([key, value]) => {
        mergedDocs[key] = normalizeDocumentItem(value, key);
      });
    }
  });

  if (!Object.keys(mergedDocs).length) {
    if (company.nib) mergedDocs.nib = normalizeDocumentItem(company.nib, "nib");
    if (company.npwp) mergedDocs.npwp = normalizeDocumentItem(company.npwp, "npwp");
    if (company.akta) mergedDocs.akta = normalizeDocumentItem(company.akta, "akta");
    if (company.loa) mergedDocs.loa = normalizeDocumentItem(company.loa, "loa");
    if (company.companyProfile) {
      mergedDocs["company-profile"] = normalizeDocumentItem(
        company.companyProfile,
        "company-profile",
      );
    }
  }

  return mergedDocs;
}

function getCompanyFromLocalStorage(companyId) {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_SUBMISSION_KEY) || "[]");
    return stored.find((item) => String(item.id) === String(companyId)) || null;
  } catch (error) {
    console.error("Gagal membaca company dari localStorage:", error);
    return null;
  }
}

export default function CompanyDocumentPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, docType } = useParams();

  const companyStorageKey = `company-verification-${id ?? "general"}`;
  const scopedPreviewStorageKey = `${COMPANY_PREVIEW_STORAGE_KEY}_${id ?? "general"}`;
  const initialCompanyData = useMemo(() => {
    if (location.state?.company) {
      return location.state.company;
    }

    try {
      const storedCompany =
        getScopedUiItem(scopedPreviewStorageKey) ||
        sessionStorage.getItem(companyStorageKey);
      if (storedCompany) {
        return JSON.parse(storedCompany);
      }
    } catch (error) {
      console.error("Gagal membaca data company dari sessionStorage:", error);
    }

    return getCompanyFromLocalStorage(id);
  }, [companyStorageKey, id, location.state, scopedPreviewStorageKey]);

  const [companyData] = useState(initialCompanyData);

  const allDocuments = useMemo(() => extractDocuments(companyData), [companyData]);

  const doc = useMemo(() => {
    const normalizedDocType = String(docType || "").toLowerCase();

    if (!normalizedDocType && Object.keys(allDocuments).length > 0) {
      return Object.values(allDocuments)[0];
    }

    return (
      allDocuments[normalizedDocType] ||
      Object.values(allDocuments).find(
        (item) => String(item?.key || "").toLowerCase() === normalizedDocType,
      ) || {
        key: normalizedDocType || "document",
        title: humanizeDocType(normalizedDocType || "document"),
        filename: "-",
        type: "UNKNOWN",
        size: "-",
        uploaded: "-",
        uploader: "-",
        url: "",
        value: "",
      }
    );
  }, [allDocuments, docType]);

  const companyName =
    companyData?.name ||
    companyData?.companyName ||
    companyData?.namaPerusahaan ||
    "Perusahaan";

  const canPreviewInIframe =
    !!doc.url &&
    (doc.url.startsWith("data:application/pdf") ||
      doc.url.startsWith("data:image/") ||
      ["pdf", "png", "jpg", "jpeg", "webp"].includes(getFileExtension(doc.url)));

  const handleDownload = () => {
    if (!doc.url) {
      alert("File dokumen tidak tersedia untuk diunduh.");
      return;
    }

    window.open(doc.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="cdp-layout">
      <Sidebar />

      <main className="cdp-main">

        <section className="cdp-content">
          <div className="cdp-top-row">
            <div>
              <div className="cdp-breadcrumb">
                <span>Dashboard</span>
                <span>›</span>
                <span>Verifikasi Mitra</span>
                <span>›</span>
                <span className="active">Review Dokumen</span>
              </div>

              <h1 className="cdp-page-title">{doc.title}</h1>
              <p className="cdp-page-subtitle">
                Tinjau kelengkapan dan validitas dokumen{" "}
                <strong>{doc.title}</strong> dari <strong>{companyName}</strong>
              </p>
            </div>

            <div className="cdp-top-actions">
              <button
                className="cdp-back-btn"
                type="button"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={16} />
                <span>Kembali ke Review</span>
              </button>

              <button className="cdp-download-btn" type="button" onClick={handleDownload}>
                <Download size={16} />
                <span>Download File</span>
              </button>
            </div>
          </div>

          <div className="cdp-grid">
            <div className="cdp-viewer-card">
              <div className="cdp-viewer-toolbar">
                <div className="cdp-toolbar-left">
                  <span>{doc.title}</span>
                  <span className="divider" />
                  <span>{doc.type || "Dokumen"}</span>
                </div>

                <div className="cdp-toolbar-right">
                  <button type="button" className="cdp-tool-btn" onClick={() => window.location.reload()}>
                    <RotateCw size={18} />
                  </button>
                  <button type="button" className="cdp-tool-btn" onClick={() => window.print()}>
                    <Printer size={18} />
                  </button>
                </div>
              </div>

              <div className="cdp-paper-area">
                {canPreviewInIframe ? (
                  <iframe
                    title={doc.title}
                    src={doc.url}
                    style={{
                      width: "100%",
                      minHeight: "780px",
                      border: "none",
                      borderRadius: "18px",
                      background: "#fff",
                    }}
                  />
                ) : doc.value ? (
                  <div
                    className="cdp-paper"
                    style={{
                      width: "100%",
                      maxWidth: "100%",
                      minHeight: "420px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 24,
                      }}
                    >
                      <div className="cdp-ri-logo">
                        <FileSearch size={18} />
                      </div>
                      <div className="cdp-paper-header-text">
                        <strong>{doc.title}</strong>
                        <span>Data dokumen perusahaan</span>
                      </div>
                    </div>

                    <div className="cdp-paper-line" />

                    <div className="cdp-doc-info">
                      <div>
                        <strong>Nama Perusahaan</strong>
                        <span>: {companyName}</span>
                      </div>
                      <div>
                        <strong>Jenis Dokumen</strong>
                        <span>: {doc.title}</span>
                      </div>
                      <div>
                        <strong>Nilai Dokumen</strong>
                        <span>: {doc.value}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="cdp-paper"
                    style={{
                      width: "100%",
                      maxWidth: "100%",
                      minHeight: "420px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      gap: 14,
                    }}
                  >
                    <div className="cdp-ri-logo">
                      <FileText size={18} />
                    </div>
                    <h2 style={{ margin: 0 }}>{doc.title}</h2>
                    <p style={{ margin: 0, color: "#6b7280", maxWidth: 480 }}>
                      Preview visual tidak tersedia untuk dokumen ini. Namun metadata dokumen
                      tetap ditampilkan di panel kanan.
                    </p>

                    {doc.url ? (
                      <button
                        type="button"
                        className="cdp-download-btn"
                        onClick={handleDownload}
                      >
                        <ExternalLink size={16} />
                        <span>Buka File</span>
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <aside className="cdp-sidebar">
              <div className="cdp-info-card">
                <div className="cdp-card-title">
                  <div className="cdp-title-icon red">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3>Informasi Dokumen</h3>
                    <p>Metadata file yang diunggah</p>
                  </div>
                </div>

                <div className="cdp-meta-list">
                  <div className="cdp-meta-row">
                    <span>Nama Dokumen</span>
                    <strong>{doc.title}</strong>
                  </div>
                  <div className="cdp-meta-row">
                    <span>Nama File</span>
                    <strong>{doc.filename || "-"}</strong>
                  </div>
                  <div className="cdp-meta-row">
                    <span>Tipe Dokumen</span>
                    <strong className="tag">{doc.type || "-"}</strong>
                  </div>
                  <div className="cdp-meta-row">
                    <span>Ukuran</span>
                    <strong>{doc.size || "-"}</strong>
                  </div>
                  <div className="cdp-meta-row">
                    <span>Tanggal Upload</span>
                    <strong>{doc.uploaded || "-"}</strong>
                  </div>
                  <div className="cdp-meta-row">
                    <span>Diunggah Oleh</span>
                    <strong className="linkish">{doc.uploader || "-"}</strong>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
