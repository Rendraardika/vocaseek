import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import mitraData from "../../components/user/MitraData";
import "../../styles/mitradetail.css";
import {
  getScopedItem,
  USER_STORAGE_KEYS,
} from "../../utils/userScopedStorage";

function MitraHeroLogo({ name, logoUrl }) {
  const [hasError, setHasError] = useState(false);
  const fallback = String(name || "VS")
    .trim()
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`mitra-detail-logo ${!logoUrl || hasError ? "is-fallback" : ""}`}>
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

export default function MitraDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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
    return <h2 style={{ padding: "40px" }}>Mitra tidak ditemukan</h2>;
  }

  const activeJobs = mitra.jobs?.length
    ? mitra.jobs
    : ["Software Engineer", "Data Analyst", "UI/UX Designer"];
  const missionItems = parseMissionItems(mitra.mission || mitra.misi);
  const visionText =
    mitra.vision ||
    mitra.visi ||
    `Menjadi perusahaan terdepan di bidang ${mitra.industry} yang berdaya saing global.`;

  return (
    <div className="mitra-detail-page">
      <div className="mitra-detail-hero">
        <div className="mitra-detail-hero-content">
          <MitraHeroLogo name={mitra.name} logoUrl={mitra.logoUrl} />

          <div>
            <h1>{mitra.name}</h1>
            <p>
              {mitra.industry} • {mitra.location}
            </p>
          </div>
        </div>
      </div>

      <div className="mitra-detail-container">
        <div>
          <div className="mitra-card-box">
            <h2>Tentang Perusahaan</h2>
            <p>{mitra.description}</p>
            <p>
              Perusahaan ini berkomitmen menghadirkan inovasi berkelanjutan dan
              menciptakan dampak positif bagi masyarakat serta industri nasional.
            </p>
          </div>

          <div className="mitra-vision-mission">
            <div className="mitra-card-box">
              <h3>Visi</h3>
              <p>{visionText}</p>
            </div>

            <div className="mitra-card-box">
              <h3>Misi</h3>
              {missionItems.length > 0 ? (
                <ul>
                  {missionItems.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>Misi perusahaan belum diisi.</p>
              )}
            </div>
          </div>

          <div className="mitra-card-box" style={{ marginTop: "30px" }}>
            <h3>Lowongan Aktif</h3>

            {activeJobs.map((job, i) => (
              <div
                className="mitra-job-item"
                key={typeof job === "string" ? `${job}-${i}` : job.id || i}
              >
                <div>
                  <strong>{typeof job === "string" ? job : job.title}</strong>
                  <br />
                  <span>{typeof job === "string" ? mitra.location : job.location}</span>
                </div>
                <button className="mitra-apply-btn">Lamar</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mitra-sidebar-box">
            <h3>Informasi</h3>
            <p>
              <strong>Industri:</strong> {mitra.industry}
            </p>
            <p>
              <strong>Lokasi:</strong> {mitra.location}
            </p>
            <p>
              <strong>Karyawan:</strong> {mitra.size || "500 - 1000"}
            </p>
          </div>

          <div className="mitra-sidebar-box">
            <h3>Kontak</h3>
            <p>Email: {mitra.website || "hr@company.com"}</p>
            <p>Telepon: {mitra.phone || "+62 812 3456 7890"}</p>
          </div>

          <div className="mitra-sidebar-box mitra-verified">
            ✔ Business Verified
          </div>
        </div>
      </div>

      <div className="mitra-back-wrapper">
        <button onClick={() => navigate(-1)} className="mitra-back-btn">
          ← Kembali ke Mitra
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
              <img src="/logovocaseek2.png" alt="Vocaseek" />
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
