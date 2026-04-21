import { useParams, useNavigate, useLocation } from "react-router-dom";
import mitraData from "../../components/user/MitraData";
import "../../styles/mitradetail.css";
import {
  getScopedItem,
  USER_STORAGE_KEYS,
} from "../../utils/userScopedStorage";

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

  return (
    <div className="mitra-detail-page">
      <div className="mitra-detail-hero">
        <div>
          <h1>{mitra.name}</h1>
          <p>
            {mitra.industry} • {mitra.location}
          </p>
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
              <p>
                Menjadi perusahaan terdepan di bidang {mitra.industry} yang
                berdaya saing global.
              </p>
            </div>

            <div className="mitra-card-box">
              <h3>Misi</h3>
              <ul>
                <li>Menyediakan layanan berkualitas.</li>
                <li>Mengembangkan SDM profesional.</li>
                <li>Mendorong inovasi digital.</li>
              </ul>
            </div>
          </div>

          <div className="mitra-card-box" style={{ marginTop: "30px" }}>
            <h3>Lowongan Aktif</h3>

            {activeJobs.map((job, i) => (
              <div className="mitra-job-item" key={typeof job === "string" ? `${job}-${i}` : job.id || i}>
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
              <strong>Rating:</strong> ⭐ {mitra.rating || "4.8"}
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
