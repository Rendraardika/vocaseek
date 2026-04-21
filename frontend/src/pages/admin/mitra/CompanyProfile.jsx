import "../../../styles/admin/CompanyProfile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/admin/SidebarMitra";
import { getApiErrorMessage } from "../../../services/auth";
import {
  getCompanyFallbackLogo,
  getCompanyProfile,
  getCompanyProfileData,
} from "../../../services/companyProfile";
import { getCompanyJobs } from "../../../services/jobs";
import { updateAuthSession } from "../../../utils/authStorage";
import { setStoredCompanyProfile } from "../../../utils/profileStorage";
import {
  Eye,
  MapPin,
  Building2,
  Users,
  Globe,
  Phone,
  Mail,
  ShieldCheck,
  BriefcaseBusiness,
  Clock3,
} from "lucide-react";
import { FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

function InfoCard({ children, className = "" }) {
  return (
    <div className={`company-profile__info-card ${className}`}>{children}</div>
  );
}

function EmptyValue({ children = "Belum diisi" }) {
  return <span className="company-profile__empty-value">{children}</span>;
}

function CompanyLogo({ src, name, className = "" }) {
  const fallback = getCompanyFallbackLogo(name);

  if (src) {
    return <img src={src} alt={name} className={className} />;
  }

  return <span className="company-profile__logo-fallback">{fallback}</span>;
}

function ActiveJobCard({ title, location, meta }) {
  return (
    <div className="company-profile__job-card">
      <div className="company-profile__job-card-content">
        <div className="company-profile__job-meta">
          <span className="company-profile__job-type company-profile__job-type--internship">
            Internship
          </span>
          <span>Aktif</span>
        </div>

        <div className="company-profile__job-title">{title}</div>

        <div className="company-profile__job-info">
          <div className="company-profile__job-info-item">
            <MapPin size={14} />
            <span>{location}</span>
          </div>
          <div className="company-profile__job-info-item">
            <Clock3 size={14} />
            <span>{meta}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function syncCompanyProfileStorage(profile) {
  setStoredCompanyProfile(profile || {});
  window.dispatchEvent(new Event("profileUpdated"));
}

export default function CompanyProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [profileResponse, jobsResponse] = await Promise.all([
          getCompanyProfile(),
          getCompanyJobs(),
        ]);

        if (!isMounted) return;

        const jobs = jobsResponse?.data?.jobs || jobsResponse?.data?.data || [];

        const normalizedProfile = getCompanyProfileData(profileResponse);
        setProfile(normalizedProfile);
        syncCompanyProfileStorage(normalizedProfile);
        updateAuthSession((current) => ({
          ...current,
          user: {
            ...(current?.user || {}),
            nama_perusahaan: normalizedProfile.nama_perusahaan || "",
            company_name: normalizedProfile.nama_perusahaan || "",
            logo_url: normalizedProfile.logo_url || "",
            logo_perusahaan: normalizedProfile.logo_url || "",
          },
          raw: {
            ...(current?.raw || {}),
            nama_perusahaan: normalizedProfile.nama_perusahaan || "",
            company_name: normalizedProfile.nama_perusahaan || "",
            logo_url: normalizedProfile.logo_url || "",
            logo_perusahaan: normalizedProfile.logo_url || "",
          },
        }));
        setActiveJobs(
          jobs.filter(
            (job) => String(job?.status || "").toUpperCase() === "ACTIVE",
          ),
        );
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          getApiErrorMessage(error, "Gagal memuat profil perusahaan."),
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

  const companyName = profile?.nama_perusahaan || "Profil Perusahaan";
  const websiteLabel = (profile?.website_url || "")
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");

  return (
    <div className="company-profile">
      <Sidebar />

      <main className="company-profile__main">
        <section className="company-profile__section">
          <div className="company-profile__breadcrumb">
            <p className="dashboard-mitra__breadcrumb">
              <span>ADMIN &gt; </span>
              <span className="dashboard-mitra__breadcrumb-active">
                COMPANY PROFILE
              </span>
            </p>
          </div>

          <div className="company-profile__actions">
            <button
              onClick={() => navigate("/admin/mitra/company-profile/settings")}
              className="company-profile__edit-btn"
            >
              <Eye size={16} />
              Edit Profile
            </button>
          </div>

          {errorMessage && (
            <div className="company-profile__alert">{errorMessage}</div>
          )}

          <InfoCard className="company-profile__header-card">
            <div
              className="company-profile__banner"
              style={{
                backgroundImage: `url(${profile?.banner_url || "/BackgroundProfileMitra.jpeg"})`,
              }}
            >
              <div className="company-profile__banner-overlay" />
            </div>
            <div className="company-profile__header-body">
              <div className="company-profile__header-content">
                <div className="company-profile__header-left">
                  <div className="company-profile__logo-box">
                    <div className="company-profile__logo-inner">
                      <CompanyLogo
                        src={profile?.logo_url}
                        name={companyName}
                        className="company-profile__logo-image"
                      />
                    </div>
                  </div>

                  <div className="company-profile__company-info">
                    <h1 className="company-profile__company-name">
                      {isLoading ? "Memuat profil..." : companyName}
                    </h1>

                    <div className="company-profile__company-meta">
                      <span className="company-profile__industry-badge">
                        {profile?.industri || <EmptyValue />}
                      </span>
                      <div className="company-profile__location-inline">
                        <MapPin size={14} />
                        <span>
                          {profile?.alamat_kantor_pusat || <EmptyValue />}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="company-profile__header-right">
                  <div className="company-profile__active-job-badge">
                    <BriefcaseBusiness size={16} />
                    {activeJobs.length} Lowongan Aktif
                  </div>
                </div>
              </div>
            </div>
          </InfoCard>

          <div className="company-profile__grid">
            <div className="company-profile__left-column">
              <InfoCard className="company-profile__card-padding-lg">
                <div className="company-profile__office-title-row">
                  <MapPin
                    size={18}
                    className="company-profile__office-title-icon"
                  />
                  <h2 className="company-profile__section-title">
                    Office Location
                  </h2>
                </div>

                <div className="company-profile__label-small">
                  Alamat Lengkap
                </div>
                <div className="company-profile__headquarter-address">
                  {profile?.alamat_kantor_pusat ? (
                    <p className="company-profile__address-detail">
                      {profile.alamat_kantor_pusat}
                    </p>
                  ) : (
                    <EmptyValue />
                  )}
                </div>
              </InfoCard>

              <div className="company-profile__jobs-section">
                <div className="company-profile__jobs-header">
                  <h2 className="company-profile__jobs-title">
                    Lowongan Aktif
                  </h2>
                  <button
                    onClick={() => navigate("/admin/mitra/lowongan")}
                    className="company-profile__see-all-btn"
                  >
                    Lihat Semua →
                  </button>
                </div>

                <div className="company-profile__jobs-list">
                  {activeJobs.length > 0 ? (
                    activeJobs
                      .slice(0, 3)
                      .map((job) => (
                        <ActiveJobCard
                          key={job.id}
                          title={job.judul_posisi || "Lowongan"}
                          location={job.lokasi || "Lokasi belum diisi"}
                          meta={job.tipe_magang || "onsite"}
                        />
                      ))
                  ) : (
                    <InfoCard className="company-profile__card-padding-md">
                      <div style={{ textAlign: "center", color: "#6b7280" }}>
                        Belum ada lowongan aktif.
                      </div>
                    </InfoCard>
                  )}
                </div>
              </div>
            </div>

            <div className="company-profile__right-column">
              <InfoCard className="company-profile__card-padding-md">
                <div className="company-profile__profile-top">
                  <div className="company-profile__profile-logo-box">
                    <CompanyLogo
                      src={profile?.logo_url}
                      name={companyName}
                      className="company-profile__profile-logo-image"
                    />
                  </div>

                  <div>
                    <div className="company-profile__profile-name">
                      {companyName}
                    </div>
                    <div className="company-profile__profile-rating">
                      Status: {profile?.status_mitra || "pending"}
                    </div>
                  </div>
                </div>

                <div className="company-profile__profile-info-list">
                  <div className="company-profile__profile-info-item">
                    <Building2
                      size={16}
                      className="company-profile__profile-info-icon-muted"
                    />
                    <div>
                      <div className="company-profile__info-label">
                        Industri
                      </div>
                      <div className="company-profile__info-value">
                        {profile?.industri || <EmptyValue />}
                      </div>
                    </div>
                  </div>

                  <div className="company-profile__profile-info-item">
                    <Users
                      size={16}
                      className="company-profile__profile-info-icon-muted"
                    />
                    <div>
                      <div className="company-profile__info-label">
                        Ukuran Perusahaan
                      </div>
                      <div className="company-profile__info-value">
                        {profile?.ukuran_perusahaan || <EmptyValue />}
                      </div>
                    </div>
                  </div>

                  <div className="company-profile__profile-info-item">
                    <Globe
                      size={16}
                      className="company-profile__profile-info-icon-muted"
                    />
                    <div>
                      <div className="company-profile__info-label">Website</div>
                      <div className="company-profile__info-value-highlight">
                        {websiteLabel || <EmptyValue />}
                      </div>
                    </div>
                  </div>
                </div>
              </InfoCard>

              <InfoCard className="company-profile__card-padding-md">
                <h3 className="company-profile__side-title">
                  Informasi Kontak
                </h3>

                <div className="company-profile__contact-list">
                  <div className="company-profile__contact-item">
                    <Phone
                      size={16}
                      className="company-profile__contact-icon-accent"
                    />
                    <div>
                      <div className="company-profile__contact-label">
                        Telepon
                      </div>
                      <div className="company-profile__contact-value">
                        {profile?.notelp || <EmptyValue />}
                      </div>
                    </div>
                  </div>

                  <div className="company-profile__contact-item">
                    <Mail
                      size={16}
                      className="company-profile__contact-icon-accent"
                    />
                    <div>
                      <div className="company-profile__contact-label">NIB</div>
                      <div className="company-profile__contact-value">
                        {profile?.nib || <EmptyValue />}
                      </div>
                    </div>
                  </div>
                </div>
              </InfoCard>

              <InfoCard className="company-profile__card-padding-md">
                <h3 className="company-profile__side-title">Social Presence</h3>

                <div className="company-profile__social-row">
                  <button
                    disabled={!profile?.linkedin_url}
                    onClick={() => window.open(profile.linkedin_url, "_blank")}
                    className="company-profile__social-btn company-profile__social-btn--linkedin"
                  >
                    <FaLinkedinIn size={16} />
                  </button>
                  <button
                    disabled={!profile?.twitter_url}
                    onClick={() => window.open(profile.twitter_url, "_blank")}
                    className="company-profile__social-btn company-profile__social-btn--twitter"
                  >
                    <FaTwitter size={16} />
                  </button>
                  <button
                    disabled={!profile?.instagram_url}
                    onClick={() => window.open(profile.instagram_url, "_blank")}
                    className="company-profile__social-btn company-profile__social-btn--instagram"
                  >
                    <FaInstagram size={16} />
                  </button>
                </div>
              </InfoCard>

              <InfoCard className="company-profile__card-padding-md">
                <div className="company-profile__verification-label">
                  Verification
                </div>

                <div className="company-profile__verification-status">
                  <ShieldCheck size={18} />
                  <span>
                    {profile?.status_mitra === "active"
                      ? "Mitra terverifikasi"
                      : "Menunggu verifikasi"}
                  </span>
                </div>
              </InfoCard>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
