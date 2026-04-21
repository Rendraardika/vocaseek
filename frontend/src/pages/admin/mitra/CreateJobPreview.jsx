import "../../../styles/admin/CreateJobPreview.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/admin/SidebarMitra";
import {
  MapPin,
  Clock3,
  BriefcaseBusiness,
  CalendarDays,
  SendHorizontal,
  Building2,
  MonitorSmartphone,
  X,
} from "lucide-react";

function InfoChip({ icon, label, value }) {
  return (
    <div className="create-job-preview__chip">
      <div className="create-job-preview__chip-label">
        {icon}
        <span>{label}</span>
      </div>
      <div className="create-job-preview__chip-value">{value}</div>
    </div>
  );
}

function SectionBlock({ title, children }) {
  return (
    <div className="create-job-preview__section-block">
      <div className="create-job-preview__section-header">
        <div className="create-job-preview__section-bar" />
        <h3 className="create-job-preview__section-title">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function CreateJobPreview() {
  const navigate = useNavigate();
  const [showPublishModal, setShowPublishModal] = useState(false);
  const draftJob = null;

  const responsibilities = [
    "Membangun komponen UI yang dapat digunakan kembali dan pustaka frontend untuk penggunaan di masa mendatang.",
    "Menerjemahkan desain Figma menjadi kode yang berkualitas tinggi dan pixel-perfect.",
    "Mengoptimalkan komponen untuk kinerja maksimum di berbagai perangkat dan browser web.",
    "Berkolaborasi dengan tim backend untuk integrasi API RESTful yang efisien.",
  ];

  const requirements = [
    "Minimal 4 tahun pengalaman sebagai Frontend Developer atau peran serupa.",
    "Keahlian mendalam dalam React.js dan ekosistemnya (Redux/Zustand, React Query).",
    "Pemahaman kuat tentang HTML5, CSS3, dan CSS-in-JS atau Tailwind CSS.",
    "Pengalaman dengan TypeScript adalah nilai tambah yang besar.",
    "Memiliki portofolio yang menunjukkan kemampuan desain UI/UX yang baik.",
    "Lulusan S1 Teknik Informatika, Sistem Informasi, atau bidang terkait.",
  ];

  return (
    <div className="create-job-preview">
      <Sidebar />

      <main className="create-job-preview__main">

        <section className="create-job-preview__content">
          <div className="create-job-preview__breadcrumb">
            <span className="muted">ADMIN</span>
            <span className="muted">/</span>
            <span className="muted">MANAJEMEN LOWONGAN</span>
            <span className="muted">/</span>
            <span className="active">PRATINJAU</span>
          </div>

            <div>
              <h1 className="create-job-preview__page-title">
                Pratinjau Lowongan Kerja
              </h1>
              <p className="create-job-preview__page-subtitle">
                Lihat bagaimana kandidat melihat postingan lowongan Anda.
              </p>
            </div>

            <div className="create-job-preview__top-actions">
              <button
                onClick={() => navigate("/admin/mitra/lowongan/tambah")}
                className="create-job-preview__back-btn"
              >
                Kembali Edit
              </button>

              <button
                onClick={() => setShowPublishModal(true)}
                className="create-job-preview__publish-btn"
              >
                <SendHorizontal size={15} />
                Konfirmasi & Pasang Lowongan
              </button>
            </div>

          {draftJob ? (
            <div className="create-job-preview__grid">
              <div className="create-job-preview__left-card">
                <div className="create-job-preview__job-header">
                  <div className="create-job-preview__company-logo">
                    Bank Mdr
                  </div>

                  <div className="create-job-preview__job-header-content">
                    <h2 className="create-job-preview__job-title">
                      Senior Frontend Developer
                    </h2>
                    <div className="create-job-preview__company-name">
                      Bank Mandiri
                    </div>

                    <div className="create-job-preview__job-meta">
                      <div className="create-job-preview__job-meta-item">
                        <MapPin size={15} />
                        <span>Jakarta Selatan, Indonesia</span>
                      </div>

                      <div className="create-job-preview__job-meta-item">
                        <Clock3 size={15} />
                        <span>Posting 2 jam yang lalu</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="create-job-preview__divider" />

                <div className="create-job-preview__chip-row">
                  <InfoChip
                    icon={<Building2 size={12} />}
                    label="Kategori"
                    value="Teknologi Informasi"
                  />
                  <InfoChip
                    icon={<BriefcaseBusiness size={12} />}
                    label="Tipe Kerja"
                    value="Penuh Waktu (Full-time)"
                  />
                  <InfoChip
                    icon={<MonitorSmartphone size={12} />}
                    label="Pengaturan"
                    value="WFO (Di Kantor)"
                  />
                </div>

                <div className="create-job-preview__divider" />

                <SectionBlock title="Deskripsi Pekerjaan">
                  <div className="create-job-preview__rich-text">
                    <p>
                      Kami mencari Senior Frontend Developer yang berbakat untuk
                      bergabung dengan tim digital banking kami. Anda akan
                      bertanggung jawab untuk membangun antarmuka pengguna yang
                      responsif, berkinerja tinggi, dan intuitif menggunakan
                      teknologi web modern.
                    </p>

                    <ol className="create-job-preview__ordered-list">
                      {responsibilities.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ol>
                  </div>
                </SectionBlock>

                <SectionBlock title="Persyaratan">
                  <div className="create-job-preview__rich-text">
                    <ul className="create-job-preview__unordered-list">
                      {requirements.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </SectionBlock>
              </div>

              <div className="create-job-preview__right-column">
                <div className="create-job-preview__info-card">
                  <div className="create-job-preview__info-card-label">
                    Informasi Penting
                  </div>

                  <div className="create-job-preview__info-list">
                    <div className="create-job-preview__info-item">
                      <CalendarDays
                        size={16}
                        className="create-job-preview__info-item-icon"
                      />
                      <div>
                        <div className="create-job-preview__info-item-title">
                          Batas Lamaran
                        </div>
                        <div className="create-job-preview__info-item-value">
                          30 September 2026
                        </div>
                      </div>
                    </div>

                    <div className="create-job-preview__info-item">
                      <Clock3
                        size={16}
                        className="create-job-preview__info-item-icon"
                      />
                      <div>
                        <div className="create-job-preview__info-item-title">
                          Mulai Kerja
                        </div>
                        <div className="create-job-preview__info-item-value">
                          1 November 2026
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="create-job-preview__divider create-job-preview__divider--compact" />

                  <div>
                    <div className="create-job-preview__info-card-label">
                      Status Publikasi
                    </div>

                    <div className="create-job-preview__status-open">
                      <span className="create-job-preview__status-dot" />
                      BUKA (OPEN)
                    </div>
                  </div>
                </div>

                <div className="create-job-preview__notice-card">
                  <div className="create-job-preview__notice-header">
                    <div className="create-job-preview__notice-icon">!</div>
                    <div className="create-job-preview__notice-title">
                      Sudah Sesuai?
                    </div>
                  </div>

                  <p className="create-job-preview__notice-text">
                    Pastikan semua rincian pekerjaan dan persyaratan sudah benar
                    sebelum Anda mempublikasikan lowongan ini ke seluruh jaringan
                    talenta kami.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="create-job-preview__empty-card">
              <div className="create-job-preview__empty-icon">
                <BriefcaseBusiness size={28} />
              </div>
              <h2>Belum ada draft lowongan</h2>
              <p>
                Preview lowongan akan tampil di sini setelah Anda mengisi form
                tambah lowongan. UI preview akan tetap menggunakan tampilan ini
                ketika data lowongan sudah tersedia.
              </p>
              <button
                onClick={() => navigate("/admin/mitra/lowongan/tambah")}
                className="create-job-preview__back-btn"
              >
                Buat Lowongan
              </button>
            </div>
          )}

          <div className="create-job-preview__footer">
            <div className="create-job-preview__footer-links">
              <span>PRIVASI</span>
              <span>HELP DESK</span>
            </div>
          </div>
        </section>
      </main>

      {showPublishModal && (
        <div className="create-job-preview__modal-overlay">
          <div className="create-job-preview__modal">
            <button
              onClick={() => setShowPublishModal(false)}
              className="create-job-preview__modal-close"
            >
              <X size={20} />
            </button>

            <div className="create-job-preview__modal-icon-wrap">
              <div className="create-job-preview__modal-icon-inner">?</div>
            </div>

            <h2 className="create-job-preview__modal-title">
              Konfirmasi Pemasangan Lowongan
            </h2>

            <p className="create-job-preview__modal-text">
              Apakah Anda yakin ingin memasang lowongan ini?
              <br />
              Lowongan yang dipasang akan dapat dilihat oleh
              <br />
              semua calon pelamar.
            </p>

            <div className="create-job-preview__modal-actions">
              <button
                onClick={() => setShowPublishModal(false)}
                className="create-job-preview__modal-cancel"
              >
                Tidak
              </button>

              <button
                onClick={() => navigate("/admin/mitra/lowongan")}
                className="create-job-preview__modal-confirm"
              >
                Iya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
