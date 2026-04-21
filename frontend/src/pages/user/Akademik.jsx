import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Akademik.css";
import Pendidikan from "./Pendidikan";
import Pengalaman from "./Pengalaman";
import Sertifikasi from "./Sertifikasi";
import { Pencil, Trash2, Briefcase, Award, FileText } from "lucide-react";
import { getApiErrorMessage } from "../../services/auth";
import { getInternProfile, updateInternProfile } from "../../services/intern";
import {
  getScopedItem,
  removeScopedItem,
  setScopedItem,
  USER_STORAGE_KEYS,
} from "../../utils/userScopedStorage";
import { normalizeList, pickFirstValue } from "../../utils/talentProfile";

const defaultAkademik = {
  pendidikan: {
    institusi: "",
    jurusan: "",
    statusPendidikan: "Saya Masih Kuliah Disini",
    semester: "",
    tahunLulus: "",
    ipk: "",
  },
  pengalaman: [],
  sertifikasi: [],
};

const hasAnyAcademicData = (data) => {
  if (!data) return false;

  const pendidikan = data?.pendidikan || {};
  const pengalaman = Array.isArray(data?.pengalaman) ? data.pengalaman : [];
  const sertifikasi = Array.isArray(data?.sertifikasi)
    ? data.sertifikasi
    : [];

  return Boolean(
    pendidikan.institusi ||
      pendidikan.jurusan ||
      pendidikan.ipk ||
      pendidikan.tahunLulus ||
      pendidikan.semester ||
      pendidikan.documentName ||
      pengalaman.length > 0 ||
      sertifikasi.length > 0,
  );
};

const hasMeaningfulDraftData = (data) => {
  if (!data) return false;

  const pendidikan = data?.pendidikan || {};
  const pengalaman = Array.isArray(data?.pengalaman) ? data.pengalaman : [];
  const sertifikasi = Array.isArray(data?.sertifikasi)
    ? data.sertifikasi
    : [];

  return Boolean(
    pendidikan.institusi ||
      pendidikan.jurusan ||
      pendidikan.ipk ||
      pendidikan.tahunLulus ||
      pendidikan.semester ||
      pendidikan.documentName ||
      pengalaman.some((item) =>
        item?.jabatan ||
        item?.perusahaan ||
        item?.jenis ||
        item?.documentName ||
        item?.documentUrl,
      ) ||
      sertifikasi.some((item) =>
        item?.nama ||
        item?.penerbit ||
        item?.nomor ||
        item?.documentName ||
        item?.documentUrl,
      ),
  );
};

const mergeCollectionByIndex = (localItems = [], backendItems = []) => {
  const maxLength = Math.max(localItems.length, backendItems.length);

  return Array.from({ length: maxLength }, (_, index) => {
    const localItem = localItems[index] || {};
    const backendItem = backendItems[index] || {};

    return {
      ...localItem,
      ...backendItem,
      documentUrl: backendItem.documentUrl || localItem.documentUrl || "",
      documentPath: backendItem.documentPath || localItem.documentPath || "",
      documentName: backendItem.documentName || localItem.documentName || "",
    };
  }).filter((item) => Object.values(item || {}).some(Boolean));
};

export default function Akademik() {
  const [openPendidikan, setOpenPendidikan] = useState(false);
  const [openPengalaman, setOpenPengalaman] = useState(false);
  const [openSertifikasi, setOpenSertifikasi] = useState(false);
  const [editingPengalamanIndex, setEditingPengalamanIndex] = useState(null);
  const [editingSertifikasiIndex, setEditingSertifikasiIndex] = useState(null);
  const navigate = useNavigate();

  const [akademikData, setAkademikData] = useState(defaultAkademik);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const normalizeAkademikData = useCallback((data) => ({
    ...defaultAkademik,
    ...(data || {}),
    pendidikan: {
      ...defaultAkademik.pendidikan,
      ...((data && data.pendidikan) || {}),
    },
    pengalaman: Array.isArray(data?.pengalaman) ? data.pengalaman : [],
    sertifikasi: Array.isArray(data?.sertifikasi) ? data.sertifikasi : [],
  }), []);

  const notifyJourneyUpdated = () => {
    window.dispatchEvent(new Event("akademik-updated"));
    window.dispatchEvent(new Event("career-journey-updated"));
  };

  const isBrowserFile = (value) =>
    typeof File !== "undefined" && value instanceof File;

  const serializeAkademikData = useCallback((data) => ({
    ...data,
    pendidikan: data?.pendidikan
      ? (({ documentFile, ...item }) => ({
          ...item,
          documentName: item.documentName || documentFile?.name || "",
        }))(data.pendidikan)
      : defaultAkademik.pendidikan,
    pengalaman: (data?.pengalaman || []).map(({ documentFile, ...item }) => ({
      ...item,
      documentName: item.documentName || documentFile?.name || "",
    })),
    sertifikasi: (data?.sertifikasi || []).map(({ documentFile, ...item }) => ({
      ...item,
      documentName: item.documentName || documentFile?.name || "",
    })),
  }), []);

  const getDocumentName = useCallback((item = {}) => {
    const directName = pickFirstValue(
      item?.documentName,
      item?.document_name,
      item?.file_name,
      item?.filename,
      item?.dokumen,
    );

    if (directName) return directName;

    const urlValue = pickFirstValue(
      item?.document_url,
      item?.preview_url,
      item?.file_url,
      item?.url,
      item?.document,
      item?.document_file,
      item?.document_pdf,
      item?.document_path,
      item?.file,
      item?.file_path,
      item?.path,
      item?.supporting_document_url,
    );

    if (!urlValue) return "";

    try {
      return decodeURIComponent(String(urlValue).split("/").pop() || "");
    } catch {
      return String(urlValue).split("/").pop() || "";
    }
  }, []);

  const getDocumentUrl = useCallback((item = {}) =>
    pickFirstValue(
      item?.documentUrl,
      item?.document_url,
      item?.previewUrl,
      item?.preview_url,
      item?.fileUrl,
      item?.file_url,
      item?.url,
      item?.document,
      item?.document_file,
      item?.document_pdf,
      item?.supporting_document_url,
      item?.attachmentUrl,
      item?.attachment_url,
    ), []);

  const normalizeStoredDocumentPath = useCallback((value) => {
    if (!value) return "";

    const rawValue = String(value).trim();
    if (!rawValue) return "";

    const stripStoragePrefix = (pathname) => {
      const cleanedPath = String(pathname || "")
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");

      if (!cleanedPath) return "";
      if (cleanedPath.startsWith("storage/")) {
        return cleanedPath.slice("storage/".length);
      }

      return cleanedPath;
    };

    if (/^https?:\/\//i.test(rawValue)) {
      try {
        const parsedUrl = new URL(rawValue);
        return stripStoragePrefix(parsedUrl.pathname);
      } catch {
        return rawValue;
      }
    }

    return stripStoragePrefix(rawValue);
  }, []);

  const getDocumentPath = useCallback((item = {}) =>
    pickFirstValue(
      normalizeStoredDocumentPath(item?.documentPath),
      normalizeStoredDocumentPath(item?.document_path),
      normalizeStoredDocumentPath(item?.filePath),
      normalizeStoredDocumentPath(item?.file_path),
      normalizeStoredDocumentPath(item?.path),
      normalizeStoredDocumentPath(item?.supporting_document),
      normalizeStoredDocumentPath(item?.document),
      normalizeStoredDocumentPath(item?.document_file),
      normalizeStoredDocumentPath(item?.document_pdf),
      normalizeStoredDocumentPath(item?.documentUrl),
      normalizeStoredDocumentPath(item?.document_url),
      normalizeStoredDocumentPath(item?.previewUrl),
      normalizeStoredDocumentPath(item?.preview_url),
      normalizeStoredDocumentPath(item?.fileUrl),
      normalizeStoredDocumentPath(item?.file_url),
      normalizeStoredDocumentPath(item?.url),
      normalizeStoredDocumentPath(item?.supporting_document_url),
      normalizeStoredDocumentPath(item?.attachmentUrl),
      normalizeStoredDocumentPath(item?.attachment_url),
    ), [normalizeStoredDocumentPath]);

  const buildFileFromExistingDocument = useCallback(async (item = {}) => {
    if (isBrowserFile(item?.documentFile)) {
      return item.documentFile;
    }

    const documentUrl = getDocumentUrl(item);
    if (!documentUrl) return null;

    try {
      const response = await fetch(documentUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const fileName = getDocumentName(item) || "document.pdf";
      const mimeType = blob.type || "application/pdf";

      return new File([blob], fileName, { type: mimeType });
    } catch (error) {
      console.error("Gagal mengambil dokumen lama untuk dikirim ulang:", error);
      return null;
    }
  }, [getDocumentName, getDocumentUrl]);

  const mapBackendExperience = useCallback((item = {}) => ({
    id: item?.id,
    title: pickFirstValue(item?.title, item?.jabatan, item?.posisi),
    type: pickFirstValue(
      item?.type,
      item?.jenis,
      item?.category,
      item?.subtitle,
    ),
    company: pickFirstValue(
      item?.company,
      item?.perusahaan,
      item?.organisasi,
      item?.organization,
    ),
    start_date: pickFirstValue(item?.start_date, item?.mulai, item?.started_at),
    end_date: pickFirstValue(item?.end_date, item?.akhir, item?.ended_at),
    period: pickFirstValue(
      item?.period,
      item?.periode,
      [
        pickFirstValue(item?.start_date, item?.mulai, item?.started_at),
        pickFirstValue(item?.end_date, item?.akhir, item?.ended_at),
      ]
        .filter(Boolean)
        .join(" - "),
    ),
    periode: pickFirstValue(
      item?.periode,
      item?.period,
      [
        pickFirstValue(item?.start_date, item?.mulai, item?.started_at),
        pickFirstValue(item?.end_date, item?.akhir, item?.ended_at),
      ]
        .filter(Boolean)
        .join(" - "),
    ),
    jabatan: pickFirstValue(item?.jabatan, item?.posisi, item?.title),
    jenis: pickFirstValue(
      item?.jenis,
      item?.type,
      item?.category,
      item?.subtitle,
    ),
    perusahaan: pickFirstValue(
      item?.perusahaan,
      item?.company,
      item?.organisasi,
      item?.organization,
    ),
    mulai: pickFirstValue(item?.mulai, item?.start_date, item?.started_at),
    akhir: pickFirstValue(item?.akhir, item?.end_date, item?.ended_at),
    documentUrl: getDocumentUrl(item),
    documentPath: getDocumentPath(item),
    documentName: getDocumentName(item),
  }), [getDocumentName, getDocumentPath, getDocumentUrl]);

  const mapBackendCertification = useCallback((item = {}) => ({
    id: item?.id,
    name: pickFirstValue(item?.name, item?.nama, item?.title, item?.sertifikasi),
    issuer: pickFirstValue(
      item?.issuer,
      item?.penerbit,
      item?.organisasi,
      item?.organization,
    ),
    issue_date: pickFirstValue(item?.issue_date, item?.tanggal, item?.date),
    certificate_number: pickFirstValue(
      item?.certificate_number,
      item?.nomor,
      item?.number,
    ),
    description: pickFirstValue(item?.description, item?.deskripsi),
    nama: pickFirstValue(item?.nama, item?.name, item?.title, item?.sertifikasi),
    penerbit: pickFirstValue(
      item?.penerbit,
      item?.issuer,
      item?.organisasi,
      item?.organization,
    ),
    tanggal: pickFirstValue(item?.tanggal, item?.issue_date, item?.date),
    nomor: pickFirstValue(
      item?.nomor,
      item?.certificate_number,
      item?.number,
    ),
    deskripsi: pickFirstValue(item?.deskripsi, item?.description),
    documentUrl: getDocumentUrl(item),
    documentPath: getDocumentPath(item),
    documentName: getDocumentName(item),
  }), [getDocumentName, getDocumentPath, getDocumentUrl]);

  const mapBackendAkademik = useCallback((backendProfile = {}) => {
    const academic =
      backendProfile?.academic ||
      backendProfile?.akademik ||
      backendProfile?.education ||
      {};
    const education = academic?.education || {};

    const pendidikan = {
      institusi: pickFirstValue(
        backendProfile?.universitas,
        academic?.university,
        academic?.universitas,
        education?.universitas,
        education?.university,
      ),
      jurusan: pickFirstValue(
        backendProfile?.jurusan,
        academic?.major,
        academic?.jurusan,
        education?.jurusan,
        education?.major,
      ),
      statusPendidikan: pickFirstValue(
        backendProfile?.tahun_lulus,
        academic?.graduation,
        education?.tahun_lulus,
      )
        ? "Sudah Lulus"
        : "Saya Masih Kuliah Disini",
      semester: pickFirstValue(
        backendProfile?.semester,
        academic?.semester,
        education?.semester,
      ),
      tahunLulus: pickFirstValue(
        backendProfile?.tahun_lulus,
        academic?.graduation,
        education?.tahun_lulus,
        education?.graduation,
      ),
      ipk: pickFirstValue(
        backendProfile?.ipk,
        academic?.ipk,
        education?.ipk,
      ),
      documentName: pickFirstValue(
        backendProfile?.pendidikan_document_name,
        backendProfile?.education_document_name,
        getDocumentName({
          document_url: pickFirstValue(
            backendProfile?.dokumen_pendidikan_pdf,
            backendProfile?.education_document,
            backendProfile?.education_document_url,
            education?.document,
            education?.document_url,
            education?.file,
            education?.file_url,
          ),
        }),
      ),
    };

    const pengalaman = normalizeList(
      backendProfile?.pengalaman ||
        backendProfile?.experiences ||
        backendProfile?.experience ||
        backendProfile?.work_experiences ||
        backendProfile?.intern_experiences ||
        academic?.experiences ||
        academic?.experience ||
        academic?.pengalaman,
    )
      .filter((item) => item && typeof item === "object")
      .map(mapBackendExperience)
      .filter(
        (item) => item.jabatan || item.perusahaan || item.jenis || item.documentName,
      );

    const sertifikasi = normalizeList(
      backendProfile?.sertifikasi ||
        backendProfile?.certifications ||
        backendProfile?.certification ||
        backendProfile?.licenses ||
        backendProfile?.intern_certifications ||
        academic?.certifications ||
        academic?.certification ||
        academic?.sertifikasi,
    )
      .filter((item) => item && typeof item === "object")
      .map(mapBackendCertification)
      .filter(
        (item) => item.nama || item.penerbit || item.nomor || item.documentName,
      );

    return {
      pendidikan,
      pengalaman,
      sertifikasi,
    };
  }, [getDocumentName, mapBackendCertification, mapBackendExperience]);

  useEffect(() => {
    let isMounted = true;

    const loadAkademik = async () => {
      try {
        const draftData = getScopedItem(USER_STORAGE_KEYS.akademikDraft);
        const savedData = getScopedItem(USER_STORAGE_KEYS.akademik);
        const isEditMode =
          getScopedItem(USER_STORAGE_KEYS.akademikEditMode) === "true";

        if (draftData && isEditMode) {
          const parsedDraft = normalizeAkademikData(JSON.parse(draftData));

          if (hasMeaningfulDraftData(parsedDraft)) {
            if (isMounted) {
              setAkademikData(parsedDraft);
            }
            return;
          }
        }

        let mergedData = savedData
          ? normalizeAkademikData(JSON.parse(savedData))
          : defaultAkademik;

        try {
          const response = await getInternProfile();
          const backendProfile = response?.data?.data || {};
          const backendAkademik = mapBackendAkademik(backendProfile);

          mergedData = normalizeAkademikData({
            ...mergedData,
            pendidikan: {
              ...mergedData.pendidikan,
              ...backendAkademik.pendidikan,
              institusi:
                backendAkademik.pendidikan.institusi ||
                mergedData.pendidikan.institusi,
              jurusan:
                backendAkademik.pendidikan.jurusan ||
                mergedData.pendidikan.jurusan,
              ipk: backendAkademik.pendidikan.ipk || mergedData.pendidikan.ipk,
            },
            pengalaman:
              backendAkademik.pengalaman.length > 0
                ? mergeCollectionByIndex(
                    mergedData.pengalaman,
                    backendAkademik.pengalaman,
                  )
                : mergedData.pengalaman,
            sertifikasi:
              backendAkademik.sertifikasi.length > 0
                ? mergeCollectionByIndex(
                    mergedData.sertifikasi,
                    backendAkademik.sertifikasi,
                  )
                : mergedData.sertifikasi,
          });

          setScopedItem(
            USER_STORAGE_KEYS.akademik,
            JSON.stringify(serializeAkademikData(mergedData)),
          );
        } catch (error) {
          console.error("Gagal memuat data akademik dari backend:", error);
        }

        if (isMounted) {
          if (hasAnyAcademicData(mergedData) && !isEditMode) {
            navigate("/profil/data-akademik/simpan", { replace: true });
            return;
          }

          setAkademikData(mergedData);
        }
      } catch (error) {
        console.error("Gagal membaca data akademik:", error);
        if (isMounted) {
          setAkademikData(defaultAkademik);
        }
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    loadAkademik();

    return () => {
      isMounted = false;
    };
  }, [mapBackendAkademik, navigate, normalizeAkademikData, serializeAkademikData]);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      setScopedItem(
        USER_STORAGE_KEYS.akademikDraft,
        JSON.stringify(serializeAkademikData(akademikData))
      );
    } catch (error) {
      console.error("Gagal menyimpan draft data akademik:", error);
    }
  }, [akademikData, isLoaded, serializeAkademikData]);

  const handleSubmitPendidikan = (data) => {
    if (!data) return;

      setAkademikData((prev) => ({
        ...prev,
        pendidikan: {
          ...prev.pendidikan,
          ...data,
      },
    }));
    setOpenPendidikan(false);
  };

  const handleDeletePendidikan = () => {
    setAkademikData((prev) => ({
      ...prev,
      pendidikan: {
        institusi: "",
        jurusan: "",
        statusPendidikan: "Saya Masih Kuliah Disini",
        semester: "",
        tahunLulus: "",
        ipk: "",
      },
    }));
  };

  const handleSubmitPengalaman = (data) => {
    if (!data) return;

    setAkademikData((prev) => ({
      ...prev,
      pengalaman:
        editingPengalamanIndex !== null
          ? prev.pengalaman.map((item, index) =>
              index === editingPengalamanIndex ? data : item,
            )
          : [...(prev.pengalaman || []), data],
    }));
    setEditingPengalamanIndex(null);
    setOpenPengalaman(false);
  };

  const handleEditPengalaman = (index) => {
    setEditingPengalamanIndex(index);
    setOpenPengalaman(true);
  };

  const handleDeletePengalaman = (index) => {
    setAkademikData((prev) => ({
      ...prev,
      pengalaman: prev.pengalaman.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitSertifikasi = (data) => {
    if (!data) return;

    setAkademikData((prev) => ({
      ...prev,
      sertifikasi:
        editingSertifikasiIndex !== null
          ? prev.sertifikasi.map((item, index) =>
              index === editingSertifikasiIndex ? data : item,
            )
          : [...(prev.sertifikasi || []), data],
    }));
    setEditingSertifikasiIndex(null);
    setOpenSertifikasi(false);
  };

  const handleEditSertifikasi = (index) => {
    setEditingSertifikasiIndex(index);
    setOpenSertifikasi(true);
  };

  const handleDeleteSertifikasi = (index) => {
    setAkademikData((prev) => ({
      ...prev,
      sertifikasi: prev.sertifikasi.filter((_, i) => i !== index),
    }));
  };

  const appendCollectionToPayload = (payload, fieldNames, items, aliasMap = {}) => {
    const normalizedFieldNames = Array.isArray(fieldNames)
      ? fieldNames
      : [fieldNames];

    (items || []).forEach((item, index) => {
      const entries = Object.entries(item || {});
      const documentFile = item?.documentFile;

      normalizedFieldNames.forEach((fieldName) => {
        entries.forEach(([key, value]) => {
          if (isBrowserFile(value)) return;
          if (value === null || value === undefined || value === "") return;
          payload.append(`${fieldName}[${index}][${key}]`, value);
        });

        Object.entries(aliasMap).forEach(([sourceKey, targetKey]) => {
          const value = item?.[sourceKey];
          if (value === null || value === undefined || value === "") return;
          payload.append(`${fieldName}[${index}][${targetKey}]`, value);
        });

        if (isBrowserFile(documentFile)) {
          payload.append(`${fieldName}[${index}][document]`, documentFile);
          payload.append(`${fieldName}[${index}][document_file]`, documentFile);
          payload.append(`${fieldName}[${index}][file]`, documentFile);
          payload.append(
            `${fieldName}[${index}][supporting_document]`,
            documentFile,
          );
        }
      });
    });
  };

  const appendEducationDocumentToPayload = (payload, pendidikanPayload) => {
    const documentFile = pendidikanPayload?.documentFile;
    const documentName = pendidikanPayload?.documentName || documentFile?.name || "";

    if (documentName) {
      payload.append("pendidikan_document_name", documentName);
      payload.append("education_document_name", documentName);
    }

    if (!isBrowserFile(documentFile)) return;

    payload.append("pendidikan_document", documentFile);
    payload.append("pendidikan_document_file", documentFile);
    payload.append("education_document", documentFile);
    payload.append("education_document_file", documentFile);
    payload.append("dokumen_pendidikan_pdf", documentFile);
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);

      const pendidikanPayload = akademikData?.pendidikan || {};
      const pengalamanWithDocuments = await Promise.all(
        (akademikData?.pengalaman || []).map(async (item) => ({
          ...item,
          documentFile: await buildFileFromExistingDocument(item),
        })),
      );
      const sertifikasiWithDocuments = await Promise.all(
        (akademikData?.sertifikasi || []).map(async (item) => ({
          ...item,
          documentFile: await buildFileFromExistingDocument(item),
        })),
      );
      const payload = new FormData();
      payload.append("universitas", pendidikanPayload.institusi || "");
      payload.append("university", pendidikanPayload.institusi || "");
      payload.append("jurusan", pendidikanPayload.jurusan || "");
      payload.append("major", pendidikanPayload.jurusan || "");
      payload.append("ipk", pendidikanPayload.ipk || "");
      payload.append("semester", pendidikanPayload.semester || "");
      payload.append("tahun_lulus", pendidikanPayload.tahunLulus || "");
      payload.append("graduation", pendidikanPayload.tahunLulus || "");
      payload.append("status_pendidikan", pendidikanPayload.statusPendidikan || "");
      appendEducationDocumentToPayload(payload, pendidikanPayload);

      const pengalamanPayload = pengalamanWithDocuments.map((item) => {
        const startDate =
          item?.start_date || item?.mulai || item?.started_at || "";
        const endDate = item?.end_date || item?.akhir || item?.ended_at || "";
        const period =
          item?.period ||
          item?.periode ||
          [startDate, endDate].filter(Boolean).join(" - ");

        return {
          ...item,
          title: item?.title || item?.jabatan || "",
          company: item?.company || item?.perusahaan || "",
          start_date: startDate,
          end_date: endDate,
          period,
          periode: item?.periode || period,
          document_name: item?.documentName || item?.document_name || "",
          document_path: normalizeStoredDocumentPath(
            item?.documentPath ||
              item?.document_path ||
              item?.documentUrl ||
              item?.document_url,
          ),
        };
      });

      appendCollectionToPayload(
        payload,
        ["pengalaman", "experiences"],
        pengalamanPayload,
        {
          jabatan: "position",
          perusahaan: "company",
          mulai: "start_date",
          akhir: "end_date",
        },
      );

      appendCollectionToPayload(
        payload,
        "certifications",
        sertifikasiWithDocuments.map((item) => ({
          ...item,
          name: item?.name || item?.nama || "",
          issuer: item?.issuer || item?.penerbit || "",
          issue_date: item?.issue_date || item?.tanggal || "",
          certificate_number:
            item?.certificate_number || item?.nomor || "",
          description: item?.description || item?.deskripsi || "",
          document_name: item?.documentName || item?.document_name || "",
          document_path: normalizeStoredDocumentPath(
            item?.documentPath ||
              item?.document_path ||
              item?.documentUrl ||
              item?.document_url,
          ),
        })),
      );

      await updateInternProfile(payload);

      let syncedAkademikData = akademikData;

      try {
        const profileResponse = await getInternProfile();
        const backendProfile = profileResponse?.data?.data || {};
        const backendAkademik = normalizeAkademikData(
          mapBackendAkademik(backendProfile),
        );

        syncedAkademikData = {
          ...normalizeAkademikData(akademikData),
          pendidikan: {
            ...normalizeAkademikData(akademikData).pendidikan,
            ...backendAkademik.pendidikan,
          },
          pengalaman:
            backendAkademik.pengalaman.length > 0
              ? mergeCollectionByIndex(
                  normalizeAkademikData(akademikData).pengalaman,
                  backendAkademik.pengalaman,
                )
              : normalizeAkademikData(akademikData).pengalaman,
          sertifikasi:
            backendAkademik.sertifikasi.length > 0
              ? mergeCollectionByIndex(
                  normalizeAkademikData(akademikData).sertifikasi,
                  backendAkademik.sertifikasi,
                )
              : normalizeAkademikData(akademikData).sertifikasi,
        };
      } catch (syncError) {
        console.error("Gagal sinkron ulang data akademik setelah simpan:", syncError);
      }

      setAkademikData(syncedAkademikData);
      setScopedItem(
        USER_STORAGE_KEYS.akademik,
        JSON.stringify(serializeAkademikData(syncedAkademikData)),
      );
      removeScopedItem(USER_STORAGE_KEYS.akademikDraft);
      removeScopedItem(USER_STORAGE_KEYS.akademikEditMode);
      notifyJourneyUpdated();
      navigate("/profil/data-akademik/simpan", { replace: true });
    } catch (error) {
      console.error("Gagal menyimpan data akademik:", error);
      alert(
        getApiErrorMessage(
          error,
          "Terjadi kesalahan saat menyimpan data akademik.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    try {
      const data = getScopedItem(USER_STORAGE_KEYS.akademik);
      removeScopedItem(USER_STORAGE_KEYS.akademikDraft);

      if (data) {
        const normalizedData = normalizeAkademikData(JSON.parse(data));

        setAkademikData(normalizedData);

        if (hasAnyAcademicData(normalizedData)) {
          removeScopedItem(USER_STORAGE_KEYS.akademikEditMode);
          navigate("/profil/data-akademik/simpan", { replace: true });
          return;
        }
      } else {
        setAkademikData(defaultAkademik);
      }
    } catch (error) {
      console.error("Gagal reset data akademik:", error);
      setAkademikData(defaultAkademik);
    }
  };

  if (!isLoaded) return null;

  const pendidikan = akademikData?.pendidikan || defaultAkademik.pendidikan;
  const pengalamanList = Array.isArray(akademikData?.pengalaman)
    ? akademikData.pengalaman
    : [];
  const sertifikasiList = Array.isArray(akademikData?.sertifikasi)
    ? akademikData.sertifikasi
    : [];

  const hasPendidikan = Boolean(pendidikan.institusi || pendidikan.jurusan);
  const isMasihKuliah =
    pendidikan.statusPendidikan === "Saya Masih Kuliah Disini";

  return (
    <div className="ak-wrap">
      <div className="ak-divider" />

      <section className="ak-section">
        <h2 className="ak-title">Pendidikan</h2>
        <p className="ak-subtitle">
          Tambah riwayat pendidikan kamu untuk menambah peluang di Vocaseek
        </p>

        <button
          type="button"
          className="ak-addBtn"
          onClick={() => setOpenPendidikan(true)}
        >
          <span className="ak-plus">+</span>
          <span>{hasPendidikan ? "Edit Pendidikan" : "Tambah Pendidikan"}</span>
        </button>

        {hasPendidikan && (
          <div className="card-pendidikan">
            <div className="card-left">
              <div className="card-icon">
                <FileText size={20} />
              </div>

              <div className="card-content">
                <strong>{pendidikan.institusi}</strong>
                <p>{pendidikan.jurusan}</p>
                <p>IPK: {pendidikan.ipk || "-"}</p>
                <p>
                  {isMasihKuliah ? "Semester" : "Tahun Lulus"}:{" "}
                  {isMasihKuliah
                    ? pendidikan.semester || "-"
                    : pendidikan.tahunLulus || "-"}
                </p>
                {pendidikan.documentName && (
                  <p>Dokumen: {pendidikan.documentName}</p>
                )}
              </div>
            </div>

            <div className="card-action">
              <button type="button" onClick={() => setOpenPendidikan(true)}>
                <Pencil size={18} />
              </button>

              <button type="button" onClick={handleDeletePendidikan}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="ak-section">
        <h2 className="ak-title">Pengalaman</h2>

        <button
          type="button"
          className="ak-addBtn"
          onClick={() => {
            setEditingPengalamanIndex(null);
            setOpenPengalaman(true);
          }}
        >
          <span className="ak-plus">+</span>
          <span>Tambah Pengalaman</span>
        </button>

        {pengalamanList.map((item, index) => (
          <div className="card-pendidikan" key={index}>
            <div className="card-left">
              <div className="card-icon">
                <Briefcase size={20} />
              </div>

              <div className="card-content">
                <strong>{item.perusahaan || "-"}</strong>
                <p>{item.jabatan || "-"}</p>
                <p>{item.jenis || "-"}</p>
                <p>
                  {item.mulai || "-"} - {item.akhir || "-"}
                </p>
              </div>
            </div>

            <div className="card-action">
              <button type="button" onClick={() => handleEditPengalaman(index)}>
                <Pencil size={18} />
              </button>

              <button
                type="button"
                onClick={() => handleDeletePengalaman(index)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="ak-section">
        <h2 className="ak-title">Lisensi dan Sertifikasi</h2>

        <button
          type="button"
          className="ak-addBtn"
          onClick={() => {
            setEditingSertifikasiIndex(null);
            setOpenSertifikasi(true);
          }}
        >
          <span className="ak-plus">+</span>
          <span>Tambah Sertifikasi</span>
        </button>

        {sertifikasiList.map((item, index) => (
          <div className="card-pendidikan" key={index}>
            <div className="card-left">
              <div className="card-icon">
                <Award size={20} />
              </div>

              <div className="card-content">
                <strong>{item.nama || "-"}</strong>
                <p>{item.penerbit || "-"}</p>
                <p>{item.tanggal || "-"}</p>
                <p>No. Sertifikat: {item.nomor || "-"}</p>
              </div>
            </div>

            <div className="card-action">
              <button type="button" onClick={() => handleEditSertifikasi(index)}>
                <Pencil size={18} />
              </button>

              <button
                type="button"
                onClick={() => handleDeleteSertifikasi(index)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </section>

      <div className="ak-bottomDivider" />

      <div className="ak-footer">
        <button type="button" className="ak-cancel" onClick={handleCancel}>
          Batalkan
        </button>

        <button
          type="button"
          className="ak-saveChanges"
          onClick={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      {openPendidikan && (
        <Pendidikan
          key="pendidikan"
          open={openPendidikan}
          onClose={() => setOpenPendidikan(false)}
          onSubmit={handleSubmitPendidikan}
          initialData={pendidikan}
        />
      )}

      {openPengalaman && (
        <Pengalaman
          key={`pengalaman-${editingPengalamanIndex ?? "new"}`}
          open={openPengalaman}
          onClose={() => {
            setEditingPengalamanIndex(null);
            setOpenPengalaman(false);
          }}
          onSubmit={handleSubmitPengalaman}
          initialData={
            editingPengalamanIndex !== null
              ? pengalamanList[editingPengalamanIndex]
              : null
          }
        />
      )}

      {openSertifikasi && (
        <Sertifikasi
          key={`sertifikasi-${editingSertifikasiIndex ?? "new"}`}
          open={openSertifikasi}
          onClose={() => {
            setEditingSertifikasiIndex(null);
            setOpenSertifikasi(false);
          }}
          onSubmit={handleSubmitSertifikasi}
          initialData={
            editingSertifikasiIndex !== null
              ? sertifikasiList[editingSertifikasiIndex]
              : null
          }
        />
      )}
    </div>
  );
}
