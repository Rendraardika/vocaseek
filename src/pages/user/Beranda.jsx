import "../../styles/beranda.css";
import { Link, NavLink } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import FooterSocialIcons from "../../components/common/FooterSocialIcons";
import {
  FaBolt,
  FaBrain,
  FaBriefcase,
  FaBuilding,
  FaBullhorn,
  FaChartBar,
  FaCode,
  FaFileUpload,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaMusic,
  FaPaintBrush,
  FaPaperPlane,
  FaRegClock,
  FaSearch,
  FaStethoscope,
  FaUserPlus,
  FaUsers,
  FaVideo,
} from "react-icons/fa";
import { getLandingStats, getPublicJobs } from "../../services/jobs";
import { pickFirstMediaValue } from "../../utils/media";

const CATEGORY_ICONS = [
  FaPaintBrush,
  FaCode,
  FaBullhorn,
  FaVideo,
  FaMusic,
  FaChartBar,
  FaStethoscope,
  FaBrain,
];

function formatCompactNumber(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

function formatRelativeJobTime(value) {
  if (!value) return "Baru dipublikasikan";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Baru dipublikasikan";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;

  return `${Math.floor(diffHours / 24)} hari lalu`;
}

function formatJobSalary(value) {
  return value ? String(value) : "Insentif tidak disebutkan";
}

function getCompanyInitials(name) {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "VS";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function getCompanyProfile(job) {
  return job?.company_profile || job?.companyProfile || {};
}

function getCompanyName(job) {
  const companyProfile = getCompanyProfile(job);

  return (
    companyProfile?.nama_perusahaan ||
    companyProfile?.name ||
    companyProfile?.company_name ||
    job?.nama_perusahaan ||
    "Perusahaan"
  );
}

function getCompanyLogoUrl(job) {
  const companyProfile = getCompanyProfile(job);

  return pickFirstMediaValue(
    companyProfile?.logo_url,
    companyProfile?.logo,
    companyProfile?.logo_perusahaan,
    companyProfile?.company_logo,
    companyProfile?.display?.image,
    job?.logo_url,
    job?.logo,
    job?.company_logo,
  );
}

function CompanyLogo({ job, index }) {
  const [hasImageError, setHasImageError] = useState(false);
  const companyName = getCompanyName(job);
  const logoUrl = getCompanyLogoUrl(job);
  const canShowLogo = logoUrl && !hasImageError;
  const fallbackClass = index === 0 ? "green" : index === 1 ? "dark" : "pink";

  return (
    <div className={`company-logo ${canShowLogo ? "has-image" : fallbackClass}`}>
      {canShowLogo ? (
        <img
          src={logoUrl}
          alt={`${companyName} logo`}
          onError={() => setHasImageError(true)}
        />
      ) : (
        getCompanyInitials(companyName)
      )}
    </div>
  );
}

function getBadgeClass(job, index) {
  const workType = String(job?.tipe_magang || "").toLowerCase();
  if (workType === "remote" || workType === "hybrid") return "contract";
  if (workType === "onsite") return "fulltime";
  return index % 2 === 0 ? "fulltime" : "contract";
}

function getBadgeLabel(job) {
  const workType = String(job?.tipe_magang || "").toLowerCase();
  if (workType === "remote") return "Remote";
  if (workType === "hybrid") return "Hybrid";
  if (workType === "onsite") return "On Site";
  return "Active";
}

function buildPopularVacancies(jobs) {
  const grouped = jobs.reduce((accumulator, job) => {
    const title = String(job?.judul_posisi || "").trim();
    if (!title) return accumulator;

    if (!accumulator[title]) {
      accumulator[title] = { title, count: 0 };
    }

    accumulator[title].count += 1;
    return accumulator;
  }, {});

  return Object.values(grouped)
    .sort(
      (left, right) =>
        right.count - left.count || left.title.localeCompare(right.title),
    )
    .slice(0, 12);
}

function buildCategoryStats(jobs) {
  const grouped = jobs.reduce((accumulator, job) => {
    const industry = String(
      job?.companyProfile?.industri ||
        job?.company_profile?.industri ||
        "Umum",
    ).trim();

    if (!industry) return accumulator;

    if (!accumulator[industry]) {
      accumulator[industry] = { title: industry, count: 0 };
    }

    accumulator[industry].count += 1;
    return accumulator;
  }, {});

  return Object.values(grouped)
    .sort(
      (left, right) =>
        right.count - left.count || left.title.localeCompare(right.title),
    )
    .slice(0, 8)
    .map((item, index) => ({
      ...item,
      Icon: CATEGORY_ICONS[index % CATEGORY_ICONS.length],
    }));
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    live_jobs: 0,
    companies: 0,
    candidates: 0,
    new_jobs: 0,
  });
  const [publicJobs, setPublicJobs] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadLandingData = async () => {
      try {
        const [statsResponse, jobsResponse] = await Promise.all([
          getLandingStats(),
          getPublicJobs(),
        ]);

        if (!isMounted) return;

        setStats(statsResponse?.data?.data || {});
        setPublicJobs(jobsResponse?.data?.data || []);
      } catch {
        if (!isMounted) return;

        setStats({
          live_jobs: 0,
          companies: 0,
          candidates: 0,
          new_jobs: 0,
        });
        setPublicJobs([]);
      }
    };

    loadLandingData();

    return () => {
      isMounted = false;
    };
  }, []);

  const popularVacancies = useMemo(
    () => buildPopularVacancies(publicJobs),
    [publicJobs],
  );
  const categoryStats = useMemo(
    () => buildCategoryStats(publicJobs),
    [publicJobs],
  );
  const featuredJobs = useMemo(() => publicJobs.slice(0, 3), [publicJobs]);

  return (
    <div className="beranda-page user-nav-shell">
      <header className="header">
        <div className="header-inner">
          <div className="nav-left">
            <div className="logo">
              <img
                src="/vocaseeklogo.png"
                alt="Vocaseek Logo"
                className="logo-img"
              />
            </div>

            <div
              className={`hamburger ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <nav className={`nav ${menuOpen ? "show" : ""}`}>
            <NavLink to="/" onClick={() => setMenuOpen(false)}>
              Beranda
            </NavLink>
            <NavLink to="/lowongan" onClick={() => setMenuOpen(false)}>
              Lowongan
            </NavLink>
            <NavLink to="/mitra" onClick={() => setMenuOpen(false)}>
              Mitra
            </NavLink>
            <NavLink to="/kontak" onClick={() => setMenuOpen(false)}>
              Kontak
            </NavLink>

            <Link
              to="/login"
              className="mobile-login"
              onClick={() => setMenuOpen(false)}
            >
              Masuk
            </Link>
          </nav>

          <Link to="/login" className="btn-login">
            Masuk
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-container">
          <div className="hero-left">
            <h1>
              Temukan pekerjaan <br />
              sesuai <span>skill kalian!</span>
            </h1>

            <p>
              Platform pencarian kerja modern untuk membantu kamu mendapatkan
              pekerjaan impian lebih cepat.
            </p>
          </div>

          <div className="hero-right">
            <div className="hero-img-wrapper">
              <img src="beranda1.webp" alt="Hero" />
            </div>
          </div>
        </div>
      </section>

      <section className="home-stats">
        <div className="home-stats-grid">
          <div className="home-stats-card">
            <div className="home-stats-icon">
              <FaBriefcase />
            </div>
            <h3>{formatCompactNumber(stats.live_jobs)}</h3>
            <p>Lowongan</p>
          </div>

          <div className="home-stats-card">
            <div className="home-stats-icon">
              <FaBuilding />
            </div>
            <h3>{formatCompactNumber(stats.companies)}</h3>
            <p>Perusahaan</p>
          </div>

          <div className="home-stats-card">
            <div className="home-stats-icon">
              <FaUsers />
            </div>
            <h3>{formatCompactNumber(stats.candidates)}</h3>
            <p>Kandidat</p>
          </div>

          <div className="home-stats-card">
            <div className="home-stats-icon">
              <FaBolt />
            </div>
            <h3>{formatCompactNumber(stats.new_jobs)}</h3>
            <p>Lowongan Baru</p>
          </div>
        </div>
      </section>

      <section className="popular">
        <h2>Lowongan Paling Populer</h2>

        <div className="popular-grid">
          {popularVacancies.length > 0 ? (
            popularVacancies.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className={`popular-item ${index === 0 ? "active" : ""}`}
              >
                <h4>{item.title}</h4>
                <p>{formatCompactNumber(item.count)} Posisi Terbuka</p>
              </div>
            ))
          ) : (
            <div className="popular-item active">
              <h4>Belum ada lowongan aktif</h4>
              <p>Data populer akan tampil otomatis dari database.</p>
            </div>
          )}
        </div>
      </section>

      <section className="steps-section">
        <h2>Langkah Kerja</h2>

        <div className="steps-panel">
          <div className="steps-container">
            <div className="step">
              <div className="step-icon">
                <FaUserPlus />
              </div>
              <h3>Create account</h3>
              <p>Daftar dan lengkapi profil kamu.</p>
            </div>

            <div className="step">
              <div className="step-icon">
                <FaFileUpload />
              </div>
              <h3>Upload CV/Resume</h3>
              <p>Unggah CV terbaikmu.</p>
            </div>

            <div className="step">
              <div className="step-icon">
                <FaSearch />
              </div>
              <h3>Find suitable job</h3>
              <p>Pilih pekerjaan sesuai minat.</p>
            </div>

            <div className="step">
              <div className="step-icon">
                <FaPaperPlane />
              </div>
              <h3>Apply job</h3>
              <p>Lamar pekerjaan dengan mudah.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="category-section">
        <div className="category-header">
          <h2>Bidang Kategori</h2>
          <Link to="/login" className="view-all">
            Tampilkan semua →
          </Link>
        </div>

        <div className="category-grid">
          {categoryStats.length > 0 ? (
            categoryStats.map((item) => {
              const Icon = item.Icon;
              return (
                <div className="category-card" key={item.title}>
                  <div className="category-icon">
                    <Icon />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{formatCompactNumber(item.count)} Posisi Terbuka</p>
                </div>
              );
            })
          ) : (
            <div className="category-card active">
              <div className="category-icon">
                <FaBriefcase />
              </div>
              <h3>Belum ada kategori aktif</h3>

            </div>
          )}
        </div>
      </section>

      <section className="featured-section">
        <div className="featured-header">
          <h2>Lowongan Terbaru</h2>
          <Link to="/login" className="view-all">
            View All →
          </Link>
        </div>

        <div className="job-list">
          {featuredJobs.length > 0 ? (
            featuredJobs.map((job, index) => (
              <div className="job-card" key={job.id || `${job.judul_posisi}-${index}`}>
                <div className="job-left">
                  <CompanyLogo job={job} index={index} />

                  <div className="job-info">
                    <div className="job-title-row">
                      <h3>{job?.judul_posisi || "Lowongan Aktif"}</h3>
                      <span className={`badge ${getBadgeClass(job, index)}`}>
                        {getBadgeLabel(job)}
                      </span>
                    </div>

                    <div className="job-meta">
                      <span>
                        <FaMapMarkerAlt /> {job?.lokasi || "Lokasi belum diisi"}
                      </span>
                      <span>
                        <FaMoneyBillWave /> {formatJobSalary(job?.gaji_per_bulan)}
                      </span>
                      <span>
                        <FaRegClock /> {formatRelativeJobTime(job?.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <Link to="/login">
                  <button className="apply-btn">Gabung Sekarang! →</button>
                </Link>
              </div>
            ))
          ) : (
            <div className="job-card">
              <div className="job-left">
                <div className="company-logo dark">VS</div>

                <div className="job-info">
                  <div className="job-title-row">
                    <h3>Belum ada featured job</h3>
                    <span className="badge contract">Menunggu data</span>
                  </div>

                  <div className="job-meta">
                    <span>
                      <FaMapMarkerAlt /> Data lowongan akan muncul dari database
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="cta">
        <div className="cta-container">
          <div className="cta-card candidate">
            <h3>Jadilah Kandidat!</h3>
            <p>
              Kamu bisa menjadi salah satu kandidat terpilih Vocaseek. Cobalah
              mendaftar segera!
            </p>
            <Link to="/login" className="cta-btn">
              Daftar Sekarang →
            </Link>
          </div>

          <div className="cta-card employer">
            <h3>Gabung Menjadi Mitra</h3>
            <p>
              Calon mitra yang mendaftar, dipersilahkan untuk segera mendaftar
              sesuai ketentuan yang tertera!
            </p>
            <Link to="/login" className="cta-btn">
              Daftar Sekarang →
            </Link>
          </div>
        </div>
      </section>

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

            <FooterSocialIcons />
          </div>
        </div>

        <div className="footer-bottom">
          (c) 2026 Vocaseek. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

