import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/DataDiri.css";
import {
  getScopedItem,
  removeScopedItem,
  setScopedItem,
  USER_STORAGE_KEYS,
} from "../../utils/userScopedStorage";
import { updateAuthSession } from "../../utils/authStorage";
import {
  getInternProfile,
  updateInternProfile,
} from "../../services/intern";
import { mapTalentDetailPayload } from "../../utils/talentProfile";
import {
  INDONESIA_PROVINCES,
  INDONESIA_REGIONS,
} from "../../data/indonesiaRegions";
import { normalizeAssetUrl } from "../../utils/media";

const defaultForm = {
  about: "",
  photo: "",
  fullName: "",
  gender: "",
  birthDate: "",
  birthPlaceType: "",
  birthCity: "",
  email: "",
  phone: "",
  province: "",
  kabupaten: "",
  addressDetail: "",
  linkedin: "",
  instagram: "",
};

const pickMeaningfulValue = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const normalized = String(value).trim();
    if (!normalized || normalized === "-") continue;
    return value;
  }

  return "";
};

const resolveProfilePhotoFromPayload = (payload, fallbackPhoto = "") => {
  const candidateSources = [
    payload?.foto,
    payload?.photo,
    payload?.profile?.foto,
    payload?.profile?.photo,
    payload?.personal?.foto,
    payload?.personal?.photo,
  ];

  const hasExplicitPhotoField = candidateSources.some(
    (value) => value === null || value === "" || (typeof value === "string" && value.trim() !== "")
  );

  if (hasExplicitPhotoField) {
    return pickMeaningfulValue(...candidateSources);
  }

  return fallbackPhoto;
};

const isDataDiriComplete = (data) => {
  if (!data) return false;

  return Boolean(
    data.about?.trim() &&
    data.fullName?.trim() &&
    data.gender?.trim() &&
    data.birthDate?.trim() &&
    data.birthPlaceType?.trim() &&
    data.birthCity?.trim() &&
    data.email?.trim() &&
    data.phone?.trim() &&
    data.province?.trim() &&
    data.kabupaten?.trim() &&
    data.addressDetail?.trim(),
  );
};

const SUPPORTED_PROFILE_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
];

const isSupportedProfileImage = (file) => {
  if (!file) return false;

  const mimeType = String(file.type || "").toLowerCase();
  if (mimeType.startsWith("image/")) {
    return true;
  }

  const lowerName = String(file.name || "").toLowerCase();
  return SUPPORTED_PROFILE_IMAGE_EXTENSIONS.some((extension) =>
    lowerName.endsWith(extension),
  );
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const convertImageFileToJpeg = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;
        const context = canvas.getContext("2d");

        if (!context) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Canvas tidak tersedia untuk mengonversi gambar."));
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);

            if (!blob) {
              reject(new Error("Gagal mengonversi gambar ke JPEG."));
              return;
            }

            const nextName = String(file.name || "profile")
              .replace(/\.[^.]+$/, "")
              .concat(".jpg");
            resolve(
              new File([blob], nextName, {
                type: "image/jpeg",
                lastModified: Date.now(),
              }),
            );
          },
          "image/jpeg",
          0.92,
        );
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    image.onerror = (error) => {
      URL.revokeObjectURL(objectUrl);
      reject(error);
    };

    image.src = objectUrl;
  });

export default function DataDiri() {
  const [form, setForm] = useState(() => {
    const saved = getScopedItem(USER_STORAGE_KEYS.dataDiri);
    if (!saved) return defaultForm;

    try {
      const parsed = JSON.parse(saved);
      return { ...defaultForm, ...parsed };
    } catch (error) {
      console.error("Gagal membaca data localStorage:", error);
      return defaultForm;
    }
  });
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isPhotoPreviewBroken, setIsPhotoPreviewBroken] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const maxAbout = 1500;
  const fileRef = useRef(null);
  const kabupatenOptions = useMemo(() => {
    return form.province ? INDONESIA_REGIONS[form.province] || [] : [];
  }, [form.province]);

  const readSavedProfile = () => {
    try {
      const saved = getScopedItem(USER_STORAGE_KEYS.dataDiri);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Gagal membaca data localStorage:", error);
      return null;
    }
  };

  const mapBackendProfileToForm = (payload, fallbackProfile = defaultForm) => {
    const normalizedProfile = mapTalentDetailPayload(payload || {});

    return {
      ...fallbackProfile,
      photo: resolveProfilePhotoFromPayload(payload, fallbackProfile.photo),
      about: pickMeaningfulValue(normalizedProfile.about, fallbackProfile.about),
      fullName: pickMeaningfulValue(normalizedProfile.name, fallbackProfile.fullName),
      gender: pickMeaningfulValue(
        payload?.jenis_kelamin,
        payload?.gender,
        payload?.profile?.jenis_kelamin,
        payload?.profile?.gender,
        normalizedProfile.gender,
        fallbackProfile.gender,
      ),
      birthDate: pickMeaningfulValue(
        payload?.tanggal_lahir,
        payload?.date_of_birth,
        payload?.birth_date,
        payload?.profile?.tanggal_lahir,
        payload?.profile?.date_of_birth,
        payload?.profile?.birth_date,
        normalizedProfile.birthDate,
        fallbackProfile.birthDate,
      ),
      birthCity: pickMeaningfulValue(
        payload?.tempat_lahir,
        payload?.place_of_birth,
        payload?.birth_place,
        payload?.profile?.tempat_lahir,
        payload?.profile?.place_of_birth,
        payload?.profile?.birth_place,
        normalizedProfile.birthPlace,
        fallbackProfile.birthCity,
      ),
      email: pickMeaningfulValue(normalizedProfile.email, fallbackProfile.email),
      phone: pickMeaningfulValue(normalizedProfile.phone, fallbackProfile.phone),
      province:
        pickMeaningfulValue(
          payload?.provinsi,
          payload?.province,
          fallbackProfile.province,
        ),
      kabupaten:
        pickMeaningfulValue(
          payload?.kabupaten,
          payload?.city,
          payload?.kota,
          fallbackProfile.kabupaten,
        ),
      addressDetail:
        pickMeaningfulValue(
          payload?.detail_alamat,
          payload?.alamat,
          payload?.address_detail,
          payload?.address,
          fallbackProfile.addressDetail,
        ),
      linkedin: pickMeaningfulValue(normalizedProfile.linkedin, fallbackProfile.linkedin),
      instagram: pickMeaningfulValue(normalizedProfile.instagram, fallbackProfile.instagram),
      birthPlaceType:
        fallbackProfile.birthPlaceType ||
        (pickMeaningfulValue(
          payload?.tempat_lahir,
          payload?.place_of_birth,
          payload?.birth_place,
          normalizedProfile.birthPlace,
        )
          ? "Dalam Negeri"
          : ""),
    };
  };

  const syncProfileFromBackend = async () => {
    const response = await getInternProfile();
    const payload = response?.data?.data || {};
    const savedProfile = readSavedProfile() || defaultForm;
    const nextForm = mapBackendProfileToForm(payload, savedProfile);

    setForm(nextForm);
    syncProfileStorage(nextForm);

    return nextForm;
  };

  const syncProfileStorage = (nextForm) => {
    const normalizedProfile = {
      ...defaultForm,
      ...(nextForm || {}),
    };

    setScopedItem(
      USER_STORAGE_KEYS.dataDiri,
      JSON.stringify(normalizedProfile),
    );
    updateAuthSession((current) => ({
      ...current,
      user: {
        ...(current?.user || {}),
        nama: normalizedProfile.fullName || current?.user?.nama || "",
        email: normalizedProfile.email || current?.user?.email || "",
        foto: normalizedProfile.photo || current?.user?.foto || "",
      },
      raw: {
        ...(current?.raw || {}),
        nama: normalizedProfile.fullName || current?.raw?.nama || "",
        email: normalizedProfile.email || current?.raw?.email || "",
        foto: normalizedProfile.photo || current?.raw?.foto || "",
      },
    }));

    // Dispatch events untuk update UI
    window.dispatchEvent(new Event("profile-updated"));
    window.dispatchEvent(new Event("career-journey-updated"));

    // Juga trigger akademik-updated karena perubahan profile bisa mempengaruhi step completion
    window.dispatchEvent(new Event("akademik-updated"));
  };

  useEffect(() => {
    const saved = readSavedProfile();
    const isEditMode =
      getScopedItem(USER_STORAGE_KEYS.dataDiriEditMode) === "true";

    if (saved && !isEditMode && location.pathname === "/profil") {
      navigate("/profil/tampilan", { replace: true });
      return;
    }

    if (saved && isEditMode) {
      return;
    }

    if (!saved) return;
  }, [location.pathname, navigate]);

  useEffect(() => {
    let isMounted = true;

    const loadProfileFromBackend = async () => {
      try {
        const response = await getInternProfile();
        const payload = response?.data?.data || {};
        const savedProfile = readSavedProfile() || defaultForm;
        const nextForm = mapBackendProfileToForm(payload, savedProfile);

        if (!isMounted) return;

        setForm(nextForm);
        syncProfileStorage(nextForm);
      } catch (error) {
        console.error("Gagal memuat profil intern dari backend:", error);
      }
    };

    loadProfileFromBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  const aboutCount = useMemo(() => form.about.length, [form.about]);
  const normalizedPhotoPreview = useMemo(() => {
    return normalizeAssetUrl(form.photo);
  }, [form.photo]);

  const openFile = () => {
    fileRef.current?.click();
  };

  const handleChange = (field, value) => {
    if (field === "photo") {
      setIsPhotoPreviewBroken(false);
    }

    setForm((prev) => ({
      ...prev,
      ...(field === "province"
        ? {
            kabupaten:
              value === prev.province
                ? prev.kabupaten
                : "",
          }
        : {}),
      [field]: value,
    }));
  };

  const changePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupportedProfileImage(file)) {
      alert("File foto harus berupa JPG, JPEG, PNG, WEBP, atau GIF.");
      e.target.value = "";
      return;
    }

    try {
      const normalizedUploadFile =
        String(file.type || "").toLowerCase() === "image/jpeg" ||
        String(file.type || "").toLowerCase() === "image/jpg"
          ? file
          : await convertImageFileToJpeg(file);
      const previewUrl = await readFileAsDataUrl(file);

      setSelectedPhotoFile(normalizedUploadFile);
      handleChange("photo", previewUrl);
    } catch (error) {
      console.error("Gagal memproses foto profil:", error);
      alert("Gagal memproses foto profil. Silakan coba file lain.");
    } finally {
      e.target.value = "";
    }
  };

  const resetProfile = () => {
    removeScopedItem(USER_STORAGE_KEYS.dataDiri);
    removeScopedItem(USER_STORAGE_KEYS.dataDiriEditMode);
    setForm(defaultForm);
    setShowDeleteModal(false);
    window.dispatchEvent(new Event("profile-updated"));
    window.dispatchEvent(new Event("career-journey-updated"));
    navigate("/profil", { replace: true });
  };

  const saveProfile = (nextForm = form) => {
    syncProfileStorage(nextForm);
    removeScopedItem(USER_STORAGE_KEYS.dataDiriEditMode);
  };

  const saveProfileToBackend = async () => {
    const payload = new FormData();

    payload.append("tentang_saya", form.about);
    payload.append("nama", form.fullName);
    payload.append("email", form.email);
    payload.append("tempat_lahir", form.birthCity);
    payload.append("tanggal_lahir", form.birthDate);
    payload.append("jenis_kelamin", form.gender);
    payload.append("provinsi", form.province);
    payload.append("kabupaten", form.kabupaten);
    payload.append("detail_alamat", form.addressDetail);
    payload.append("linkedin", form.linkedin);
    payload.append("instagram", form.instagram);
    payload.append("notelp", form.phone);

    if (selectedPhotoFile) {
      payload.append("foto", selectedPhotoFile);
      payload.append("photo", selectedPhotoFile);
      payload.append("avatar", selectedPhotoFile);
    }

    await updateInternProfile(payload);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitter = e.nativeEvent.submitter;
    const action = submitter?.value || "save";

    try {
      if (action === "reset") {
        setShowDeleteModal(true);
        return;
      }

      if (!isDataDiriComplete(form)) {
        alert("Mohon lengkapi semua data wajib terlebih dahulu.");
        return;
      }

      await saveProfileToBackend();
      const syncedForm = await syncProfileFromBackend();
      saveProfile(syncedForm);
      navigate("/profil/tampilan", { replace: true });
    } catch (error) {
      console.error("Gagal memproses data:", error);
      alert(
        error?.response?.data?.message ||
          "Terjadi kesalahan saat memproses data",
      );
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = () => {
    resetProfile();
  };

  return (
    <>
      <form id="dataDiriForm" className="dpWrap" onSubmit={handleSubmit}>
        <div className="dpSection">
          <div className="dpSectionTitle">FOTO PROFIL</div>

          <div className="dpPhotoRow">
            <div className="dpPhotoCard">
              {form.photo ? (
                <img
                  src={normalizedPhotoPreview}
                  alt="foto profil"
                  className="dpPhotoPreview"
                  onError={() => setIsPhotoPreviewBroken(true)}
                />
              ) : null}

              {!normalizedPhotoPreview || isPhotoPreviewBroken ? (
                <>
                  <div className="dpPhotoAvatar" />
                  <div className="dpPhotoBadge">!</div>
                </>
              ) : null}
            </div>

            <div className="dpPhotoInfo">
              <div className="dpPhotoHint">Unggah foto 1:1 (square)</div>

              <button className="dpLinkBtn" type="button" onClick={openFile}>
                Ganti Foto
              </button>

              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
                style={{ display: "none" }}
                onChange={changePhoto}
              />
            </div>
          </div>
        </div>

        <div className="dpSection">
          <label className="dpLabel" htmlFor="about">
            Tentang Saya <span className="dpReq">*</span>
          </label>

          <div className="dpTextareaWrap">
            <textarea
              id="about"
              className="dpTextarea"
              placeholder="Ceritakan tentang diri Anda, minat, dan keahlian Anda..."
              value={form.about}
              onChange={(e) =>
                handleChange("about", e.target.value.slice(0, maxAbout))
              }
            />

            <div className="dpCounter">
              {aboutCount} / {maxAbout} Karakter
            </div>
          </div>
        </div>

        <div className="dpGrid">
          <div className="dpField dpFieldFull">
            <label className="dpLabel">
              Nama Lengkap <span className="dpReq">*</span>
            </label>
            <input
              className="dpInput"
              type="text"
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
            />
          </div>

          <div className="dpField">
            <label className="dpLabel">
              Jenis Kelamin <span className="dpReq">*</span>
            </label>

            <div className="dpSelectWrap">
              <select
                className="dpSelect"
                value={form.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
              >
                <option value="" disabled>
                  Pilih jenis kelamin
                </option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>

          <div className="dpField">
            <label className="dpLabel">
              Tanggal Lahir <span className="dpReq">*</span>
            </label>
            <input
              className="dpInput"
              type="date"
              value={form.birthDate}
              onChange={(e) => handleChange("birthDate", e.target.value)}
            />
          </div>

          <div className="dpField">
            <label className="dpLabel">
              Tempat Lahir <span className="dpReq">*</span>
            </label>

            <div className="dpSelectWrap">
              <select
                className="dpSelect"
                value={form.birthPlaceType}
                onChange={(e) => handleChange("birthPlaceType", e.target.value)}
              >
                <option value="" disabled>
                  Pilih tempat lahir
                </option>
                <option value="Dalam Negeri">Dalam Negeri</option>
                <option value="Luar Negeri">Luar Negeri</option>
              </select>
            </div>
          </div>

          <div className="dpField">
            <label className="dpLabel">
              Kota Lahir <span className="dpReq">*</span>
            </label>
            <input
              className="dpInput"
              type="text"
              value={form.birthCity}
              onChange={(e) => handleChange("birthCity", e.target.value)}
            />
          </div>

          <div className="dpField">
            <label className="dpLabel">
              Email <span className="dpReq">*</span>
            </label>
            <input
              className="dpInput"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className="dpField">
            <label className="dpLabel">
              No Handphone <span className="dpReq">*</span>
            </label>
            <input
              className="dpInput"
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          <div className="dpField dpFieldFull">
            <label className="dpLabel">Alamat Sesuai KTP</label>
          </div>

          <div className="dpField">
            <label className="dpLabel">
              Provinsi <span className="dpReq">*</span>
            </label>

            <div className="dpSelectWrap">
              <select
                className="dpSelect"
                value={form.province}
                onChange={(e) => handleChange("province", e.target.value)}
              >
                <option value="" disabled>
                  Pilih provinsi
                </option>
                {INDONESIA_PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="dpField">
            <label className="dpLabel">
              Kabupaten <span className="dpReq">*</span>
            </label>

            <div className="dpSelectWrap">
              <select
                className="dpSelect"
                value={form.kabupaten}
                onChange={(e) => handleChange("kabupaten", e.target.value)}
                disabled={!form.province}
              >
                <option value="" disabled>
                  {form.province ? "Pilih kabupaten / kota" : "Pilih provinsi dulu"}
                </option>
                {kabupatenOptions.map((kabupaten) => (
                  <option key={kabupaten} value={kabupaten}>
                    {kabupaten}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="dpField dpFieldFull">
            <label className="dpLabel">
              Detail Alamat <span className="dpReq">*</span>
            </label>
            <textarea
              className="dpTextarea"
              value={form.addressDetail}
              onChange={(e) => handleChange("addressDetail", e.target.value)}
            />
          </div>
        </div>

        <div className="dpDivider" />

        <div className="dpSection dpSocialSection">
          <div className="dpSubTitle">Media Sosial</div>

          <div className="dpSocialList">
            <div className="dpSocialRow">
              <div className="dpSocialIcon">
                <img src="/LinkedIn.png" alt="LinkedIn" />
              </div>

              <input
                className="dpInput"
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={form.linkedin}
                onChange={(e) => handleChange("linkedin", e.target.value)}
              />
            </div>

            <div className="dpSocialRow">
              <div className="dpSocialIcon">
                <img src="/Instagram.png" alt="Instagram" />
              </div>

              <input
                className="dpInput"
                type="url"
                placeholder="Instagram URL"
                value={form.instagram}
                onChange={(e) => handleChange("instagram", e.target.value)}
              />
            </div>
          </div>
        </div>
      </form>

      {showDeleteModal && (
        <div className="dpModalOverlay" onClick={handleCloseDeleteModal}>
          <div className="dpDeleteModal" onClick={(e) => e.stopPropagation()}>
            <div className="dpDeleteIconWrap">
              <div className="dpDeleteIcon">!</div>
            </div>

            <h3 className="dpDeleteTitle">Hapus seluruh isi profil?</h3>

            <p className="dpDeleteDesc">
              Semua data yang sudah disimpan seperti foto profil, biodata,
              email, nomor handphone, alamat, dan media sosial akan dihapus dan
              dikosongkan kembali.
            </p>

            <div className="dpDeleteActions">
              <button
                type="button"
                className="dpDeleteCancelBtn"
                onClick={handleCloseDeleteModal}
              >
                Batal
              </button>

              <button
                type="button"
                className="dpDeleteConfirmBtn"
                onClick={handleConfirmDelete}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
