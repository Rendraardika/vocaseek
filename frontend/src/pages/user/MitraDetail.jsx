import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import mitraData from "../../components/user/MitraData";
import "../../styles/mitradetail.css";
import {
  getScopedItem,
  setScopedItem,
  USER_STORAGE_KEYS,
} from "../../utils/userScopedStorage";
import { translatePhrase } from "../../i18n/phrases";
import { getSavedLanguage } from "../../utils/languagePreference";
import FooterBrandLogo from "../../components/common/FooterBrandLogo";

function MitraHeroLogo({ name, logoUrl }) {
  const [hasError, setHasError] = useState(false);
  const fallback = String(name || "VS")
    .trim()
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`mitra-detail-logo ${
        !logoUrl || hasError ? "is-fallback" : ""
      }`}
    >
      {logoUrl && !hasError ? (
        <img
          src={logoUrl}
          alt={name || "Logo perusahaan"}
          onError={() => setHasError(true)}
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}

function parseMissionItems(mission) {
  return String(mission || "")
    .split(/\r?\n|•/)
    .map((item) => item.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean);
}

function translateDynamicText(text, locale) {
  return translatePhrase(text, locale) || text;
}

function hasValue(value) {
  return String(value || "").trim().length > 0;
}

function isPlaceholderText(value) {
  const normalized = String(value || "").trim().toLowerCase();

  return [
    "profil perusahaan belum dilengkapi oleh perusahaan.",
    "profil perusahaan belum dilengkapi oleh perusahaan",
  ].includes(normalized);
}

function displayText(value, locale) {
  if (!hasValue(value) || isPlaceholderText(value)) {
    return translatePhrase("Belum diisi", locale) || "Belum diisi";
  }

  return translateDynamicText(value, locale);
}

export default function MitraDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [locale, setLocale] = useState(getSavedLanguage());

  useEffect(() => {
    const syncLanguage = () => {
      setLocale(getSavedLanguage());
    };

    window.addEventListener("language-changed", syncLanguage);
    return () => {
      window.removeEventListener("language-changed", syncLanguage);
    };
  }, []);

  const dynamicPartners = (() => {
    try {
      return JSON.parse(getScopedItem(USER_STORAGE_KEYS.publicPartnerDirectory)) || [];
    } catch {
      return [];
    }
  })();

  const routedMitra = location.state?.mitra;
  const dynamicMitra =
    routedMitra ||
    dynamicPartners.find((item) => String(item.id) === String(id));

  const staticMitra =
    mitraData.find((item) => String(item.id) === String(id)) ||
    mitraData.find((item) => item.id === parseInt(id, 10));

  const mitra = dynamicMitra || staticMitra;

  if (!mitra) {
    return (
      <h2 style={{ padding: "40px" }}>
        {translatePhrase("Mitra tidak ditemukan", locale) ||
          "Mitra tidak ditemukan"}
      </h2>
    );
  }

  const activeJobs = Array.isArray(mitra.jobs) ? mitra.jobs : [];
  const missionItems = parseMissionItems(mitra.mission || mitra.misi);
  const descriptionText = mitra.description || mitra.deskripsi;
  const visionText = mitra.vision || mitra.visi;

  const handleApply = (job) => {
    if (!job || typeof job === "string" || !job.id) {
      navigate("/searchlowongan");
      return;
    }

    const companyProfile = job.companyProfile || {};
    const applicationDraft = {
      id: job.id,
      title: job.title,
      company: job.company || mitra.name,
      location: job.location || mitra.location,
      type: job.type || "",
      duration: job.duration || "",
      work: job.work || "",
      description: job.description || "",
      qualifications: job.qualifications || [],
      benefits: job.benefits || [],
      education: job.education || {},
      documents: job.documents || [],
      dates: job.dates || {},
      companyProfile: {
        name: companyProfile.name || mitra.name,
        industry: companyProfile.industry || mitra.industry,
        size: companyProfile.size || mitra.size,
        website: companyProfile.website || mitra.website,
        description: companyProfile.description || descriptionText || "",
        vision: companyProfile.vision || visionText || "",
        mission: companyProfile.mission || mitra.mission || mitra.misi || "",
        address: companyProfile.address || mitra.location,
        phone: companyProfile.phone || mitra.phone,
        status: companyProfile.status || mitra.status,
        logoUrl: companyProfile.logoUrl || mitra.logoUrl,
      },
      motivation: "",
    };

    setScopedItem(
      USER_STORAGE_KEYS.applicationDraft,
      JSON.stringify(applicationDraft),
    );
    navigate("/daftar-magang");
  };

  return (
    <div className="mitra-detail-page">
      <div className="mitra-detail-hero">
        <div className="mitra-detail-hero-content">
          <MitraHeroLogo name={mitra.name} logoUrl={mitra.logoUrl} />

          <div>
            <h1>{mitra.name}</h1>
            <p>
              {translateDynamicText(mitra.industry, locale)} |{" "}
              {translateDynamicText(mitra.location, locale)}
            </p>
          </div>
        </div>
      </div>

      <div className="mitra-detail-container">
        <div>
          <div className="mitra-card-box">
            <h2>
              {translatePhrase("Tentang Perusahaan", locale) ||
                "Tentang Perusahaan"}
            </h2>
            <p>{displayText(descriptionText, locale)}</p>
          </div>

          <div className="mitra-vision-mission">
            <div className="mitra-card-box">
              <h3>{translatePhrase("Visi", locale) || "Visi"}</h3>
              <p>{displayText(visionText, locale)}</p>
            </div>

            <div className="mitra-card-box">
              <h3>{translatePhrase("Misi", locale) || "Misi"}</h3>
              {missionItems.length > 0 ? (
                <ul>
                  {missionItems.map((item, index) => (
                    <li key={`${item}-${index}`}>
                      {translateDynamicText(item, locale)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  {translatePhrase("Belum diisi", locale) || "Belum diisi"}
                </p>
              )}
            </div>
          </div>

          <div className="mitra-card-box" style={{ marginTop: "30px" }}>
            <h3>
              {translatePhrase("Lowongan Aktif", locale) || "Lowongan Aktif"}
            </h3>

            {activeJobs.length > 0 ? (
              activeJobs.map((job, i) => (
                <div
                  className="mitra-job-item"
                  key={typeof job === "string" ? `${job}-${i}` : job.id || i}
                >
                  <div>
                    <strong>{typeof job === "string" ? job : job.title}</strong>
                    <br />
                    <span>
                      {translateDynamicText(
                        typeof job === "string" ? mitra.location : job.location,
                        locale
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="mitra-apply-btn"
                    onClick={() => handleApply(job)}
                  >
                    {translatePhrase("Lamar", locale) || "Lamar"}
                  </button>
                </div>
              ))
            ) : (
              <p>
                {translatePhrase("Belum ada lowongan aktif", locale) ||
                  "Belum ada lowongan aktif"}
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="mitra-sidebar-box">
            <h3>{translatePhrase("Informasi", locale) || "Informasi"}</h3>
            <p>
              <strong>{translatePhrase("Industri:", locale) || "Industri:"}</strong>{" "}
              {translateDynamicText(mitra.industry, locale)}
            </p>
            <p>
              <strong>{translatePhrase("Lokasi:", locale) || "Lokasi:"}</strong>{" "}
              {translateDynamicText(mitra.location, locale)}
            </p>
            <p>
              <strong>{translatePhrase("Karyawan:", locale) || "Karyawan:"}</strong>{" "}
              {mitra.size || "500 - 1000"}
            </p>
          </div>

          <div className="mitra-sidebar-box">
            <h3>{translatePhrase("Kontak", locale) || "Kontak"}</h3>
            <p>Email: {mitra.website || "hr@company.com"}</p>
            <p>
              {translatePhrase("Telepon:", locale) || "Telepon:"}{" "}
              {mitra.phone || "+62 812 3456 7890"}
            </p>
          </div>

          <div className="mitra-sidebar-box mitra-verified">Business Verified</div>
        </div>
      </div>

      <div className="mitra-back-wrapper">
        <button onClick={() => navigate(-1)} className="mitra-back-btn">
          {"<- "}
          {translatePhrase("Kembali ke Mitra", locale) || "Kembali ke Mitra"}
        </button>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-about">
            <h3>About Us</h3>
            <span className="footer-line"></span>
            <p>
              Vocaseek berdedikasi dalam mengembangkan kapasitas talenta muda
              Indonesia melalui program pelatihan, mentoring, dan penyaluran
              karir yang terintegrasi.
            </p>

            <div className="footer-logo">
              <FooterBrandLogo />
            </div>
          </div>

          <div className="footer-contact">
            <h3>Contact Info</h3>
            <span className="footer-line"></span>

            <ul>
              <li>Jl. Pahlawan No.1, Surabaya, Jawa Timur</li>
              <li>+628517159231</li>
              <li>admin@vocaseek.id</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 Vocaseek. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
