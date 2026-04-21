import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/Dokumen.css";
import {
  getScopedItem,
  setScopedItem,
  USER_STORAGE_KEYS,
} from "../../utils/userScopedStorage";
import { getApiErrorMessage } from "../../services/auth";
import { getInternProfile, updateInternProfile } from "../../services/intern";
import { mapTalentDetailPayload } from "../../utils/talentProfile";
const REQUIRED_DOC_IDS = ["cv", "portfolio", "rekomendasi", "ktp", "transkrip"];
const DOC_BACKEND_FIELDS = {
  cv: {
    fileField: "cv_pdf",
    aliases: ["cv"],
    deleteFlags: ["cv_pdf_delete", "remove_cv"],
  },
  portfolio: {
    fileField: "portofolio_pdf",
    aliases: ["portfolio"],
    deleteFlags: ["portofolio_pdf_delete", "remove_portfolio"],
  },
  rekomendasi: {
    fileField: "surat_rekomendasi_pdf",
    aliases: ["recommendation_letter"],
    deleteFlags: ["surat_rekomendasi_pdf_delete", "remove_recommendation"],
  },
  ktp: {
    fileField: "ktp_pdf",
    aliases: ["ktp"],
    deleteFlags: ["ktp_pdf_delete", "remove_ktp"],
  },
  transkrip: {
    fileField: "transkrip_nilai_pdf",
    aliases: ["transcript"],
    deleteFlags: ["transkrip_nilai_pdf_delete", "remove_transcript"],
  },
};

const initialDocs = [
  {
    id: "cv",
    label: "Curriculum Vitae",
    filename: "Belum ada file yang diunggah",
    uploadedAt: "",
    status: "empty",
    type: "",
    previewUrl: "",
    fileData: "",
  },
  {
    id: "portfolio",
    label: "Portofolio",
    filename: "Belum ada file yang diunggah",
    uploadedAt: "",
    status: "empty",
    type: "",
    previewUrl: "",
    fileData: "",
  },
  {
    id: "rekomendasi",
    label: "Surat Rekomendasi",
    filename: "Belum ada file yang diunggah",
    uploadedAt: "",
    status: "empty",
    type: "",
    previewUrl: "",
    fileData: "",
  },
  {
    id: "ktp",
    label: "KTP / Identitas Diri",
    filename: "Belum ada file yang diunggah",
    uploadedAt: "",
    status: "empty",
    type: "",
    previewUrl: "",
    fileData: "",
  },
  {
    id: "transkrip",
    label: "Transkrip Nilai Terakhir",
    filename: "Belum ada file yang diunggah",
    uploadedAt: "",
    status: "empty",
    type: "",
    previewUrl: "",
    fileData: "",
  },
];

function IconPdf() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 3h7l3 3v15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        className="dcm-iconFilePaper"
      />
      <path d="M14 3v4a1 1 0 0 0 1 1h4" className="dcm-iconFileFold" />
      <path
        d="M8 14h1.6c1 0 1.7.7 1.7 1.6S10.6 17.2 9.6 17.2H8V14Zm0 3.2h1.4c.5 0 .8-.4.8-.8s-.3-.8-.8-.8H8v1.6Z"
        className="dcm-iconInk"
      />
      <path
        d="M12 14h1.4c1.2 0 2 .8 2 2s-.8 2-2 2H12V14Zm1.4 3.2c.6 0 1-.4 1-1.2s-.4-1.2-1-1.2H13v2.4h.4Z"
        className="dcm-iconInk"
      />
      <path
        d="M16.4 14H19v.9h-1.6v.8H19v.9h-1.6V18h-1v-4Z"
        className="dcm-iconInk"
      />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 7.5a2 2 0 0 1 2-2H10l1.3 1.3c.4.4.9.7 1.5.7H18.5a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7.5Z"
        className="dcm-iconFolder"
      />
      <path d="M3.5 9.2h17" className="dcm-iconFolderLine" />
    </svg>
  );
}

function IconCloud() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7.5 18.5h9a3.5 3.5 0 0 0 .6-7A5 5 0 0 0 7 10.6a3.2 3.2 0 0 0 .5 6.4Z"
        className="dcm-iconCloud"
      />
      <path d="M12 10.5v5" className="dcm-iconCloudArrow" />
      <path d="M9.8 12.7 12 10.5l2.2 2.2" className="dcm-iconCloudArrow" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M9 3h6l1 2h4v2H4V5h4l1-2Z" className="dcm-iconTrash" />
      <path
        d="M6 7h12l-1 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7Z"
        className="dcm-iconTrash"
      />
      <path d="M10 11v8M14 11v8" className="dcm-iconTrashStroke" />
    </svg>
  );
}

function FileIconByType(label) {
  if (label.toLowerCase().includes("portofolio")) return <IconFolder />;
  if (label.toLowerCase().includes("surat")) return <IconCloud />;
  return <IconPdf />;
}

function getNowLabel() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  return `Diperbarui ${dd}-${mm}-${yyyy} ${hh}:${mi}`;
}

function getFileType(file) {
  if (!file) return "";
  if (file.type.includes("pdf")) return "pdf";

  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  return "other";
}

function dataUrlToFile(dataUrl, filename) {
  if (!dataUrl || !dataUrl.startsWith("data:")) return null;

  const [header, base64] = dataUrl.split(",");
  if (!header || !base64) return null;

  const mimeMatch = header.match(/data:(.*);base64/);
  const mimeType = mimeMatch?.[1] || "application/octet-stream";

  const byteString = atob(base64);
  const arrayBuffer = new Uint8Array(byteString.length);

  for (let i = 0; i < byteString.length; i += 1) {
    arrayBuffer[i] = byteString.charCodeAt(i);
  }

  return new File([arrayBuffer], filename || "document", { type: mimeType });
}

function getDocFile(doc) {
  if (!doc || doc.status !== "uploaded") return null;

  const dataSource = doc.fileData || doc.previewUrl || "";
  return dataUrlToFile(dataSource, doc.filename);
}

function normalizeDocs(savedDocs) {
  if (!Array.isArray(savedDocs)) return initialDocs;

  return initialDocs.map((defaultDoc) => {
    const matched = savedDocs.find((item) => item.id === defaultDoc.id);

    if (!matched) return defaultDoc;

    return {
      ...defaultDoc,
      ...matched,
    };
  });
}

function extractFilenameFromUrl(url) {
  if (!url) return "Dokumen.pdf";

  try {
    const cleanUrl = String(url).split("?")[0];
    const segments = cleanUrl.split("/");
    return decodeURIComponent(segments[segments.length - 1] || "Dokumen.pdf");
  } catch {
    return "Dokumen.pdf";
  }
}

function shortenMiddleText(value, maxLength = 42) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length <= maxLength) return text;

  const headLength = Math.ceil((maxLength - 3) / 2);
  const tailLength = Math.floor((maxLength - 3) / 2);
  return `${text.slice(0, headLength)}...${text.slice(-tailLength)}`;
}

function formatDocumentDisplayName(label, filename) {
  const trimmedName = String(filename || "").trim();
  if (!trimmedName || trimmedName === "Belum ada file yang diunggah") {
    return trimmedName || "Belum ada file yang diunggah";
  }

  const extensionMatch = trimmedName.match(/(\.[a-z0-9]+)$/i);
  const extension = extensionMatch?.[1] || "";
  const basename = extension
    ? trimmedName.slice(0, -extension.length)
    : trimmedName;

  const looksGenerated = /^[A-Za-z0-9_-]{20,}$/.test(basename);
  if (looksGenerated) {
    return `${label}${extension}`;
  }

  return shortenMiddleText(trimmedName);
}

function createUploadedDoc(defaultDoc, url) {
  if (!url) return defaultDoc;

  return {
    ...defaultDoc,
    filename: extractFilenameFromUrl(url),
    uploadedAt: "",
    status: "uploaded",
    type: "pdf",
    previewUrl: url,
    fileData: "",
  };
}

function mapDocsFromBackend(payload = {}) {
  const normalizedProfile = mapTalentDetailPayload(payload);
  const documents = normalizedProfile?.documents || {};
  const educationDocument = normalizedProfile?.educationDocument;

  return initialDocs.map((defaultDoc) => {
    if (defaultDoc.id === "cv") {
      return createUploadedDoc(
        defaultDoc,
        documents.cv?.url || payload.cv || payload.cv_url,
      );
    }

    if (defaultDoc.id === "portfolio") {
      return createUploadedDoc(
        defaultDoc,
        documents.portfolio?.url ||
          payload.portfolio ||
          payload.portfolio_url ||
          payload.portofolio_pdf,
      );
    }

    if (defaultDoc.id === "rekomendasi") {
      return createUploadedDoc(
        defaultDoc,
        documents.recommendation?.url ||
          payload.recommendation_letter ||
          payload.recommendation_letter_url ||
          payload.surat_rekomendasi_pdf,
      );
    }

    if (defaultDoc.id === "ktp") {
      return createUploadedDoc(
        defaultDoc,
        documents.identity?.url || payload.ktp || payload.ktp_url || payload.ktp_pdf,
      );
    }

    if (defaultDoc.id === "transkrip") {
      return createUploadedDoc(
        defaultDoc,
        // HANYA baca dari field transkrip yang spesifik.
        // Jangan baca education_document karena itu adalah dokumen pendidikan akademik,
        // bukan transkrip nilai.
        documents.transcript?.url ||
          payload.transcript ||
          payload.transcript_url ||
          payload.transkrip_nilai_pdf,
      );
    }

    return defaultDoc;
  });
}

function isDokumenComplete(docs) {
  return REQUIRED_DOC_IDS.every((requiredId) => {
    const matched = docs.find((item) => item.id === requiredId);
    return matched?.status === "uploaded";
  });
}

export default function Dokumen() {
  const [docs, setDocs] = useState(initialDocs);
  const [savedDocs, setSavedDocs] = useState(initialDocs);
  const [previewDocId, setPreviewDocId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const fileInputRefs = useRef({});

  useEffect(() => {
    try {
      const saved = getScopedItem(USER_STORAGE_KEYS.dokumen);

      if (saved) {
        const parsed = JSON.parse(saved);
        const normalizedDocs = normalizeDocs(parsed);
        setDocs(normalizedDocs);
        setSavedDocs(normalizedDocs);
      } else {
        setDocs(initialDocs);
        setSavedDocs(initialDocs);
      }
    } catch (error) {
      console.error("Gagal membaca dokumen tersimpan:", error);
      setDocs(initialDocs);
      setSavedDocs(initialDocs);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDocumentsFromBackend = async () => {
      try {
        const response = await getInternProfile();
        const payload = response?.data?.data || {};
        const backendDocs = mapDocsFromBackend(payload);

        if (!isMounted) return;

        setDocs(backendDocs);
        setSavedDocs(backendDocs);
        setScopedItem(USER_STORAGE_KEYS.dokumen, JSON.stringify(backendDocs));
      } catch (error) {
        console.error("Gagal memuat dokumen backend:", error);
      }
    };

    loadDocumentsFromBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveDocuments = async () => {
    try {
      const cvDoc = docs.find((item) => item.id === "cv");
      const portfolioDoc = docs.find((item) => item.id === "portfolio");
      const recommendationDoc = docs.find((item) => item.id === "rekomendasi");
      const identityDoc = docs.find((item) => item.id === "ktp");
      const transcriptDoc = docs.find((item) => item.id === "transkrip");
      const deletedDocs = docs.filter((doc) => {
        const previousDoc = savedDocs.find((item) => item.id === doc.id);
        return previousDoc?.status === "uploaded" && doc.status === "empty";
      });
      const cvFile = getDocFile(cvDoc);
      const portfolioFile = getDocFile(portfolioDoc);
      const recommendationFile = getDocFile(recommendationDoc);
      const identityFile = getDocFile(identityDoc);
      const transcriptFile = getDocFile(transcriptDoc);
      const hasUploadChanges = Boolean(
        cvFile ||
          portfolioFile ||
          recommendationFile ||
          identityFile ||
          transcriptFile,
      );
      const hasDeleteChanges = deletedDocs.length > 0;

      if (hasUploadChanges || hasDeleteChanges) {
        const payload = new FormData();
        if (cvFile) {
          payload.append("cv", cvFile);
          payload.append("cv_pdf", cvFile);
        }
        if (portfolioFile) {
          payload.append("portfolio", portfolioFile);
          payload.append("portofolio_pdf", portfolioFile);
        }
        if (recommendationFile) {
          payload.append("recommendation_letter", recommendationFile);
          payload.append("surat_rekomendasi_pdf", recommendationFile);
        }
        if (identityFile) {
          payload.append("ktp", identityFile);
          payload.append("ktp_pdf", identityFile);
        }
        if (transcriptFile) {
          payload.append("transcript", transcriptFile);
          payload.append("transkrip_nilai_pdf", transcriptFile);
        }

        deletedDocs.forEach((doc) => {
          const backendConfig = DOC_BACKEND_FIELDS[doc.id];
          if (!backendConfig) return;

          payload.append(backendConfig.fileField, "");
          backendConfig.aliases.forEach((alias) => {
            payload.append(alias, "");
          });
          backendConfig.deleteFlags.forEach((flag) => {
            payload.append(flag, "1");
          });
        });

        try {
          await updateInternProfile(payload);
        } catch (error) {
          throw new Error(
            getApiErrorMessage(error, "Gagal menyinkronkan dokumen."),
          );
        }
      }

      const response = await getInternProfile();
      const payloadData = response?.data?.data || {};
      const backendDocs = mapDocsFromBackend(payloadData);

      setDocs(backendDocs);
      setSavedDocs(backendDocs);
      setScopedItem(USER_STORAGE_KEYS.dokumen, JSON.stringify(backendDocs));
      window.dispatchEvent(new Event("career-journey-updated"));
      window.dispatchEvent(new Event("profile-updated"));

      setSaveMessage("Dokumen berhasil disimpan.");
    } catch (error) {
      console.error("Gagal menyimpan dokumen:", error);
      setSaveMessage(
        error instanceof Error && error.message
          ? error.message
          : "Gagal menyimpan dokumen.",
      );
    }
  };

  const previewDoc = useMemo(() => {
    return docs.find((item) => item.id === previewDocId) || null;
  }, [docs, previewDocId]);

  const hasUnsavedChanges = useMemo(() => {
    if (!isLoaded) return false;
    return JSON.stringify(docs) !== JSON.stringify(savedDocs);
  }, [docs, isLoaded, savedDocs]);

  const openFilePicker = (docId) => {
    if (fileInputRefs.current[docId]) {
      fileInputRefs.current[docId].click();
    }
  };

  const handleUpload = (docId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = getFileType(file);

    if (fileType !== "pdf") {
      alert("Format file hanya mendukung PDF.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const fileData = reader.result;

      setDocs((prev) =>
        prev.map((item) =>
          item.id === docId
            ? {
                ...item,
                filename: file.name,
                uploadedAt: getNowLabel(),
                status: "uploaded",
                type: fileType,
                previewUrl: fileData,
                fileData,
              }
            : item,
        ),
      );
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleShowFile = (docId) => {
    const selected = docs.find((item) => item.id === docId);
    if (!selected || selected.status !== "uploaded") return;
    setPreviewDocId(docId);
  };

  const handleDeleteFile = (docId) => {
    setDocs((prev) =>
      prev.map((item) =>
        item.id === docId
          ? {
              ...item,
              filename: "Belum ada file yang diunggah",
              uploadedAt: "",
              status: "empty",
              type: "",
              previewUrl: "",
              fileData: "",
            }
          : item,
      ),
    );

    if (previewDocId === docId) {
      setPreviewDocId(null);
    }
  };

  const closePreview = () => {
    setPreviewDocId(null);
  };

  const completed = isDokumenComplete(docs);

  return (
    <section className="dcm-wrap">
      <div className="dcm-head">
        <h2 className="dcm-title">Dokumen Pendukung</h2>
        <p className="dcm-subtitle">
          Unggah dokumen yang dibutuhkan dalam format PDF agar profil siap
          diverifikasi.
        </p>
        {completed && (
          <p className="dcm-status dcm-statusSuccess">
            Semua dokumen utama sudah lengkap.
          </p>
        )}
        {hasUnsavedChanges && (
          <p className="dcm-status dcm-statusWarning">
            Ada perubahan yang belum disimpan.
          </p>
        )}
        {saveMessage && (
          <p
            className={`dcm-status ${
              saveMessage.includes("berhasil")
                ? "dcm-statusSuccess"
                : "dcm-statusError"
            }`}
          >
            {saveMessage}
          </p>
        )}
      </div>

      <div className="dcm-list">
        {docs.map((d) => {
          const isEmpty = d.status === "empty";

          return (
            <div
              key={d.id}
              className={`dcm-row ${isEmpty ? "dcm-rowEmpty" : ""}`}
            >
              <input
                ref={(el) => {
                  fileInputRefs.current[d.id] = el;
                }}
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: "none" }}
                onChange={(e) => handleUpload(d.id, e)}
              />

              <div
                className={`dcm-leftIcon ${isEmpty ? "dcm-leftIconMuted" : ""}`}
              >
                {FileIconByType(d.label)}
              </div>

              <div className="dcm-info">
                <div
                  className={`dcm-docLabel ${isEmpty ? "dcm-docLabelMuted" : ""}`}
                >
                  {d.label}
                </div>
                <div
                  className={`dcm-fileName ${isEmpty ? "dcm-fileNameMuted" : ""}`}
                >
                  {formatDocumentDisplayName(d.label, d.filename)}
                </div>
                {!isEmpty && d.uploadedAt && (
                  <div className="dcm-uploadedAt">{d.uploadedAt}</div>
                )}
              </div>

              <div className="dcm-actions">
                {isEmpty ? (
                  <button
                    className="dcm-btnUpload"
                    type="button"
                    onClick={() => openFilePicker(d.id)}
                  >
                    Upload File
                  </button>
                ) : (
                  <>
                    <button
                      className="dcm-link"
                      type="button"
                      onClick={() => handleShowFile(d.id)}
                    >
                      Lihat
                    </button>

                    <button
                      className="dcm-iconBtn"
                      type="button"
                      aria-label="Ganti file"
                      title="Ganti file"
                      onClick={() => openFilePicker(d.id)}
                    >
                      <IconCloud />
                    </button>

                    <button
                      className="dcm-iconBtn"
                      type="button"
                      aria-label="Hapus file"
                      title="Hapus file"
                      onClick={() => handleDeleteFile(d.id)}
                    >
                      <IconTrash />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="dcm-footer">
        <button
          type="button"
          className="dcm-saveButton"
          onClick={saveDocuments}
          disabled={!hasUnsavedChanges}
        >
          Simpan Perubahan
        </button>
      </div>

      {previewDoc && (
        <div
          onClick={closePreview}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "980px",
              maxHeight: "90vh",
              background: "#fff",
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #eef0f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#2b2f33",
                    marginBottom: "4px",
                  }}
                >
                  {previewDoc.label}
                </div>
                <div
                  style={{
                    fontSize: "12.5px",
                    color: "#9aa0a6",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {previewDoc.filename}
                </div>
              </div>

              <button
                type="button"
                onClick={closePreview}
                style={{
                  border: "1px solid #eef0f2",
                  background: "#fff",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Tutup
              </button>
            </div>

            <div
              style={{
                padding: "16px",
                overflow: "auto",
                background: "#f8fafc",
                minHeight: "300px",
              }}
            >
              {previewDoc.previewUrl ? (
                previewDoc.type === "image" ? (
                  <img
                    src={previewDoc.previewUrl}
                    alt={previewDoc.filename}
                    style={{
                      width: "100%",
                      maxHeight: "75vh",
                      objectFit: "contain",
                      display: "block",
                      background: "#fff",
                      borderRadius: "12px",
                    }}
                  />
                ) : previewDoc.type === "pdf" ? (
                  <iframe
                    src={previewDoc.previewUrl}
                    title={previewDoc.filename}
                    style={{
                      width: "100%",
                      height: "75vh",
                      border: 0,
                      borderRadius: "12px",
                      background: "#fff",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: "12px",
                      padding: "32px",
                      textAlign: "center",
                      color: "#6b7280",
                    }}
                  >
                    Preview file ini belum didukung.
                  </div>
                )
              ) : (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "32px",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  Preview belum tersedia untuk data ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
