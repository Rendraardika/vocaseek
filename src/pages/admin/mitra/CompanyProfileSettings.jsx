import "../../../styles/admin/CompanyProfileSettings.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/admin/SidebarMitra";
import { getApiErrorMessage } from "../../../services/auth";
import {
  getCompanyFallbackLogo,
  getCompanyProfile,
  getCompanyProfileData,
  updateCompanyProfile,
} from "../../../services/companyProfile";
import { updateAuthSession } from "../../../utils/authStorage";
import { setStoredCompanyProfile } from "../../../utils/profileStorage";
import {
  Eye,
  Info,
  Image as ImageIcon,
  Share2,
  Phone,
  MapPin,
  Save,
  X,
  Link as LinkIcon,
} from "lucide-react";

function Card({ children, className = "" }) {
  return (
    <div className={`company-settings__card ${className}`}>{children}</div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="company-settings__section-title">
      <div className="company-settings__section-icon">{icon}</div>
      <h2 className="company-settings__section-heading">{title}</h2>
    </div>
  );
}

function Input({
  label,
  placeholder,
  helper,
  icon,
  value,
  onChange,
  type = "text",
  required = false,
  readOnly = false,
}) {
  return (
    <div>
      <label className="company-settings__label">{label}</label>

      <div className="company-settings__input-wrap">
        {icon ? (
          <span className="company-settings__input-icon">{icon}</span>
        ) : null}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          className={`company-settings__input ${icon ? "has-icon" : ""}`}
        />
      </div>

      {helper ? <p className="company-settings__helper">{helper}</p> : null}
    </div>
  );
}

const emptyForm = {
  nama_perusahaan: "",
  industri: "",
  jumlah_karyawan: "",
  website_url: "",
  deskripsi: "",
  visi: "",
  misi: "",
  notelp: "",
  alamat_kantor_pusat: "",
  linkedin_url: "",
  instagram_url: "",
  twitter_url: "",
};

function syncCompanyProfileStorage(profile) {
  setStoredCompanyProfile(profile || {});
  window.dispatchEvent(new Event("profileUpdated"));
}

export default function CompanyProfileSettings() {
  const navigate = useNavigate();
  const logoInputRef = useRef(null);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [profileMeta, setProfileMeta] = useState({
    logo_url: "",
    banner_url: "",
    nib: "",
    status_mitra: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!logoPreview?.startsWith("blob:")) {
      return undefined;
    }

    return () => {
      URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getCompanyProfile();
        if (!isMounted) return;

        const data = getCompanyProfileData(response);
        setForm({
          nama_perusahaan: data.nama_perusahaan || "",
          industri: data.industri || "",
          ukuran_perusahaan: data.ukuran_perusahaan || "",
          website_url: data.website_url || "",
          deskripsi: data.deskripsi || "",
          visi: data.visi || "",
          misi: data.misi || "",
          notelp: data.notelp || "",
          alamat_kantor_pusat: data.alamat_kantor_pusat || "",
          linkedin_url: data.linkedin_url || "",
          instagram_url: data.instagram_url || "",
          twitter_url: data.twitter_url || "",
        });
        setProfileMeta({
          logo_url: data.logo_url || "",
          banner_url: data.banner_url || "",
          nib: data.nib || "",
          status_mitra: data.status_mitra || "",
        });
        setLogoPreview(data.logo_url || "");
        syncCompanyProfileStorage(data);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          getApiErrorMessage(error, "Gagal memuat pengaturan profil."),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const fallbackLogo = useMemo(
    () => getCompanyFallbackLogo(form.nama_perusahaan),
    [form.nama_perusahaan],
  );

  const handleInputChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setMessage("");
    setErrorMessage("");
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Logo perusahaan harus berupa file gambar.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setErrorMessage("");
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(profileMeta.logo_url || "");
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const normalizeUrl = (value) => {
    const trimmedValue = String(value || "").trim();

    if (!trimmedValue) {
      return "";
    }

    if (/^https?:\/\//i.test(trimmedValue)) {
      return trimmedValue;
    }

    return `https://${trimmedValue}`;
  };

  const handleSaveProfile = async () => {
    if (!form.nama_perusahaan.trim()) {
      setErrorMessage("Nama perusahaan wajib diisi.");
      setShowSaveModal(false);
      return;
    }

    setIsSaving(true);
    setMessage("");
    setErrorMessage("");

    const payload = new FormData();
    payload.append("nama_perusahaan", form.nama_perusahaan.trim());
    payload.append("industri", form.industri.trim());
    payload.append("ukuran_perusahaan", form.ukuran_perusahaan.trim());
    payload.append("website_url", normalizeUrl(form.website_url));
    payload.append("deskripsi", form.deskripsi.trim());
    payload.append("visi", form.visi.trim());
    payload.append("misi", form.misi.trim());
    payload.append("notelp", form.notelp.trim());
    payload.append("alamat_kantor_pusat", form.alamat_kantor_pusat.trim());
    payload.append("linkedin_url", normalizeUrl(form.linkedin_url));
    payload.append("instagram_url", normalizeUrl(form.instagram_url));
    payload.append("twitter_url", normalizeUrl(form.twitter_url));

    if (logoFile) {
      payload.append("logo", logoFile);
      payload.append("logo_perusahaan", logoFile);
      payload.append("company_logo", logoFile);
    }

    try {
      const response = await updateCompanyProfile(payload);
      const updatedProfile = getCompanyProfileData(response);

      setForm((prev) => ({
        ...prev,
        nama_perusahaan: updatedProfile.nama_perusahaan || prev.nama_perusahaan,
        industri: updatedProfile.industri || prev.industri,
        ukuran_perusahaan: updatedProfile.ukuran_perusahaan || prev.ukuran_perusahaan,
        website_url: updatedProfile.website_url || prev.website_url,
        deskripsi: updatedProfile.deskripsi || prev.deskripsi,
        visi: updatedProfile.visi || prev.visi,
        misi: updatedProfile.misi || prev.misi,
        notelp: updatedProfile.notelp || prev.notelp,
        alamat_kantor_pusat:
          updatedProfile.alamat_kantor_pusat || prev.alamat_kantor_pusat,
        linkedin_url: updatedProfile.linkedin_url || prev.linkedin_url,
        instagram_url: updatedProfile.instagram_url || prev.instagram_url,
        twitter_url: updatedProfile.twitter_url || prev.twitter_url,
      }));
      setProfileMeta((prev) => ({
        ...prev,
        logo_url: updatedProfile.logo_url || prev.logo_url,
        banner_url: updatedProfile.banner_url || prev.banner_url,
        nib: updatedProfile.nib || prev.nib,
        status_mitra: updatedProfile.status_mitra || prev.status_mitra,
      }));
      setLogoPreview(updatedProfile.logo_url || logoPreview || "");
      setLogoFile(null);
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
      syncCompanyProfileStorage(updatedProfile);
      updateAuthSession((current) => ({
        ...current,
        user: {
          ...(current?.user || {}),
          nama_perusahaan:
            updatedProfile.nama_perusahaan || form.nama_perusahaan.trim(),
          company_name:
            updatedProfile.nama_perusahaan || form.nama_perusahaan.trim(),
          logo_url: updatedProfile.logo_url || logoPreview || "",
          logo_perusahaan: updatedProfile.logo_url || logoPreview || "",
        },
        raw: {
          ...(current?.raw || {}),
          nama_perusahaan:
            updatedProfile.nama_perusahaan || form.nama_perusahaan.trim(),
          company_name:
            updatedProfile.nama_perusahaan || form.nama_perusahaan.trim(),
          logo_url: updatedProfile.logo_url || logoPreview || "",
          logo_perusahaan: updatedProfile.logo_url || logoPreview || "",
        },
      }));
      setMessage("Profil perusahaan berhasil disimpan.");
      setShowSaveModal(false);
      navigate("/admin/mitra/company-profile");
    } catch (error) {
      setShowSaveModal(false);
      setErrorMessage(
        getApiErrorMessage(error, "Gagal menyimpan profil perusahaan."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="company-settings">
      <Sidebar />

      <main className="company-settings__main">
        <section className="company-settings__section">
          <p className="company-settings__breadcrumb">
            <span className="muted">ADMIN &gt;</span>
            <span className="separator"></span>
            <span className="muted">COMPANY PROFILE</span>
            <span className="separator"></span>
            <span>›</span>
            <span className="dashboard-mitra__breadcrumb-active">
              COMPANY PROFILE SETTINGS
            </span>
          </p>

          <div className="company-settings__header">
            <h1 className="company-settings__page-title">Profile Settings</h1>

            <button
              onClick={() => navigate("/admin/mitra/company-profile")}
              className="company-settings__preview-btn"
            >
              <Eye size={16} />
              Preview Public Profile
            </button>
          </div>

          {isLoading && (
            <div className="company-settings__alert company-settings__alert--info">
              Memuat profil perusahaan...
            </div>
          )}

          {errorMessage && (
            <div className="company-settings__alert">{errorMessage}</div>
          )}

          {message && (
            <div className="company-settings__alert company-settings__alert--success">
              {message}
            </div>
          )}

          <div className="company-settings__grid">
            <div className="company-settings__left">
              <Card className="company-settings__card-padding-lg">
                <SectionTitle
                  icon={<Info size={18} />}
                  title="General Information"
                />

                <div className="company-settings__stack-lg">
                  <Input
                    label="Company Name"
                    placeholder="Nama perusahaan"
                    value={form.nama_perusahaan}
                    onChange={handleInputChange("nama_perusahaan")}
                    required
                  />

                  <div className="company-settings__two-col">
                    <Input
                      label="Industry"
                      placeholder="Contoh: Teknologi, Finance, Edukasi"
                      value={form.industri}
                      onChange={handleInputChange("industri")}
                    />
                    <Input
                      label="Company Size"
                      placeholder="Contoh: 51-200 karyawan"
                      value={form.ukuran_perusahaan}
                      onChange={handleInputChange("ukuran_perusahaan")}
                    />
                  </div>

                  <Input
                    label="Website URL"
                    placeholder="https://company.com"
                    value={form.website_url}
                    onChange={handleInputChange("website_url")}
                  />

                  <div>
                    <label className="company-settings__label">
                      Company Description
                    </label>
                    <p className="company-settings__helper company-settings__helper--mb">
                      Informasi ini akan tampil di profil perusahaan.
                    </p>
                    <textarea
                      value={form.deskripsi}
                      onChange={handleInputChange("deskripsi")}
                      placeholder="Ceritakan profil, budaya kerja, dan keunggulan perusahaan..."
                      className="company-settings__textarea"
                    />
                  </div>

                  <div className="company-settings__two-col">
                    <div>
                      <label className="company-settings__label">Visi Perusahaan</label>
                      <p className="company-settings__helper company-settings__helper--mb">
                        Teks ini akan tampil di halaman mitra publik.
                      </p>
                      <textarea
                        value={form.visi}
                        onChange={handleInputChange("visi")}
                        placeholder="Tuliskan visi perusahaan..."
                        className="company-settings__textarea"
                        rows={5}
                      />
                    </div>

                    <div>
                      <label className="company-settings__label">Misi Perusahaan</label>
                      <p className="company-settings__helper company-settings__helper--mb">
                        Pisahkan poin misi dengan baris baru jika lebih dari satu.
                      </p>
                      <textarea
                        value={form.misi}
                        onChange={handleInputChange("misi")}
                        placeholder="Tuliskan misi perusahaan..."
                        className="company-settings__textarea"
                        rows={5}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="company-settings__card-padding-lg">
                <SectionTitle
                  icon={<Phone size={18} />}
                  title="Contact Information"
                />

                <div className="company-settings__two-col">
                  <Input
                    label="Phone Number"
                    placeholder="+62..."
                    helper="Nomor kontak utama perusahaan."
                    icon={<Phone size={16} />}
                    value={form.notelp}
                    onChange={handleInputChange("notelp")}
                  />
                  <Input
                    label="NIB"
                    placeholder="Nomor induk berusaha"
                    helper="NIB dari pendaftaran perusahaan."
                    value={profileMeta.nib}
                    onChange={() => {}}
                    readOnly
                  />
                </div>
              </Card>

              <Card className="company-settings__card-padding-lg">
                <SectionTitle
                  icon={<MapPin size={18} />}
                  title="Office Location"
                />

                <div>
                  <label className="company-settings__label">
                    Headquarters Address
                  </label>
                  <p className="company-settings__helper company-settings__helper--mb">
                    Masukkan alamat lengkap kantor pusat perusahaan.
                  </p>
                  <textarea
                    value={form.alamat_kantor_pusat}
                    onChange={handleInputChange("alamat_kantor_pusat")}
                    placeholder="Alamat kantor pusat lengkap"
                    className="company-settings__textarea"
                    rows={5}
                  />
                </div>
              </Card>
            </div>

            <div className="company-settings__right">
              <Card className="company-settings__card-padding-md">
                <SectionTitle
                  icon={<ImageIcon size={18} />}
                  title="Branding Assets"
                />

                <div>
                  <label className="company-settings__label">
                    Company Logo
                  </label>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="company-settings__hidden-input"
                    onChange={handleLogoUpload}
                  />

                  <div className="company-settings__logo-row">
                    <div className="company-settings__logo-preview">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Company logo"
                          className="company-settings__logo-image"
                        />
                      ) : (
                        fallbackLogo
                      )}
                    </div>

                    <div className="company-settings__logo-info">
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="company-settings__upload-link"
                      >
                        Upload New Logo
                      </button>
                      <p className="company-settings__logo-note">
                        Rasio 1:1, maksimal 2MB, JPG atau PNG.
                      </p>

                      {logoFile && (
                        <div className="company-settings__logo-file-row">
                          <span className="company-settings__logo-file-name">
                            {logoFile.name}
                          </span>
                          <button
                            onClick={removeLogo}
                            className="company-settings__logo-file-remove"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="company-settings__card-padding-md">
                <SectionTitle
                  icon={<Share2 size={18} />}
                  title="Social Presence"
                />

                <div className="company-settings__stack-sm">
                  <div className="company-settings__social-input-wrap">
                    <input
                      type="url"
                      value={form.linkedin_url}
                      onChange={handleInputChange("linkedin_url")}
                      placeholder="LinkedIn URL"
                      className="company-settings__social-input"
                    />
                    <span className="company-settings__social-prefix">IN</span>
                  </div>

                  <div className="company-settings__social-input-wrap">
                    <input
                      type="url"
                      value={form.twitter_url}
                      onChange={handleInputChange("twitter_url")}
                      placeholder="Twitter URL"
                      className="company-settings__social-input"
                    />
                    <span className="company-settings__social-prefix">TW</span>
                  </div>

                  <div className="company-settings__social-input-wrap">
                    <LinkIcon
                      size={14}
                      className="company-settings__social-link-icon"
                    />
                    <input
                      type="url"
                      value={form.instagram_url}
                      onChange={handleInputChange("instagram_url")}
                      placeholder="Instagram URL"
                      className="company-settings__social-input company-settings__social-input--link"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="company-settings__footer-actions">
            <div className="company-settings__saved-text">
              Status mitra: {profileMeta.status_mitra || "pending"}
            </div>

            <div className="company-settings__action-buttons">
              <button
                onClick={() => navigate("/admin/mitra/company-profile")}
                className="company-settings__cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={isSaving}
                className="company-settings__save-btn"
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </section>
      </main>

      {showSaveModal && (
        <div className="company-settings__modal-overlay">
          <div className="company-settings__modal">
            <div className="company-settings__modal-icon-wrap">
              <div className="company-settings__modal-icon-inner">?</div>
            </div>

            <h2 className="company-settings__modal-title">Simpan Perubahan?</h2>

            <p className="company-settings__modal-text">
              Apakah Anda yakin ingin menyimpan perubahan pada pengaturan profil
              ini?
            </p>

            <div className="company-settings__modal-actions">
              <button
                onClick={() => setShowSaveModal(false)}
                className="company-settings__modal-cancel"
              >
                Batal
              </button>

              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="company-settings__modal-save"
              >
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
