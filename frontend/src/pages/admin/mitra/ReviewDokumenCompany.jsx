import "../../../styles/admin/ReviewDokumenCompany.css";
import Sidebar from "../../../components/admin/SidebarMitra";
import {
  ArrowLeft,
  BriefcaseBusiness,
  FileText,
  FolderOpen,
  BadgeCheck,
  GraduationCap,
  ShieldCheck,
  Search,
  ZoomIn,
  Printer,
  Download,
  FileBadge,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

function DocMenuItem({
  title,
  subtitle,
  active = false,
  icon,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`review-dokumen__doc-menu-item ${
        active
          ? "review-dokumen__doc-menu-item--active"
          : "review-dokumen__doc-menu-item--default"
      }`}
    >
      <div
        className={`review-dokumen__doc-icon-box ${
          active
            ? "review-dokumen__doc-icon-box--active"
            : "review-dokumen__doc-icon-box--default"
        }`}
      >
        {icon}
      </div>

      <div>
        <div
          className={`review-dokumen__doc-title ${
            active
              ? "review-dokumen__doc-title--active"
              : "review-dokumen__doc-title--default"
          }`}
        >
          {title}
        </div>

        <div
          className={`review-dokumen__doc-subtitle ${
            active
              ? "review-dokumen__doc-subtitle--active"
              : "review-dokumen__doc-subtitle--default"
          }`}
        >
          {subtitle}
        </div>
      </div>
    </button>
  );
}

export default function ReviewDokumen() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="review-dokumen">
      <Sidebar />

      <main className="review-dokumen__main">

        <section className="review-dokumen__section">
          <div className="review-dokumen__breadcrumb">
            <span className="review-dokumen__breadcrumb-muted">ADMIN</span>
            <span className="review-dokumen__breadcrumb-muted">›</span>
            <span className="review-dokumen__breadcrumb-muted">
              TALENT MANAGEMENT
            </span>
            <span className="review-dokumen__breadcrumb-muted">›</span>
            <span className="review-dokumen__breadcrumb-muted">
              DETAIL PROFIL
            </span>
            <span className="review-dokumen__breadcrumb-muted">›</span>
            <span className="review-dokumen__breadcrumb-active">
              REVIEW DOKUMEN
            </span>
          </div>

          <div className="review-dokumen__header">
            <div className="review-dokumen__candidate">
              <div className="review-dokumen__avatar-box">
                <img
                  src="/Sarah_Jenkins.png"
                  alt="Kandidat"
                  className="review-dokumen__avatar-image"
                />
              </div>

              <div>
                <h1 className="review-dokumen__title">Johnathan Doe</h1>

                <div className="review-dokumen__role-row">
                  <BriefcaseBusiness size={15} />
                  <span>Senior UI/UX Designer Candidate</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/admin/mitra/talent/${id}`)}
              className="review-dokumen__back-btn"
            >
              <ArrowLeft size={22} />
              Kembali
            </button>
          </div>

          <div className="review-dokumen__grid">
            <div className="review-dokumen__left-column">
              <div className="review-dokumen__menu-label">
                Application Documents
              </div>

              <div className="review-dokumen__menu-list">
                <DocMenuItem
                  title="Curriculum Vitae"
                  subtitle="Active Viewing"
                  active
                  icon={<FileText size={18} />}
                />

                <DocMenuItem
                  title="Portfolio"
                  subtitle="PDF, 12.4 MB"
                  icon={<FolderOpen size={18} />}
                />

                <DocMenuItem
                  title="KTP / ID Card"
                  subtitle="JPG, 1.2 MB"
                  icon={<BadgeCheck size={18} />}
                />

                <DocMenuItem
                  title="Transkrip Nilai"
                  subtitle="PDF, 4.8 MB"
                  icon={<GraduationCap size={18} />}
                />
              </div>

              <div className="review-dokumen__verified-box">
                <div className="review-dokumen__verified-row">
                  <div className="review-dokumen__verified-icon-box">
                    <ShieldCheck size={18} />
                  </div>

                  <div>
                    <div className="review-dokumen__verified-title">
                      Verified Document
                    </div>

                    <p className="review-dokumen__verified-text">
                      This document has been automatically verified by our system
                      for authenticity and malware safety.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="review-dokumen__right-column">
              <div className="review-dokumen__toolbar">
                <div className="review-dokumen__toolbar-info">
                  <div className="review-dokumen__toolbar-file-icon">
                    <FileBadge size={20} />
                  </div>

                  <div>
                    <div className="review-dokumen__toolbar-file-name">
                      CV_Johnathan_Doe_2024.pdf
                    </div>

                    <div className="review-dokumen__toolbar-file-meta">
                      Uploaded on: Oct 12, 2023 &nbsp;&nbsp; · &nbsp;&nbsp; Size:
                      2.4 MB
                    </div>
                  </div>
                </div>

                <div className="review-dokumen__toolbar-actions">
                  <div className="review-dokumen__zoom-box">
                    <button className="review-dokumen__icon-btn">
                      <Search size={16} />
                    </button>

                    <span className="review-dokumen__zoom-text">100%</span>

                    <button className="review-dokumen__icon-btn">
                      <ZoomIn size={16} />
                    </button>
                  </div>

                  <button className="review-dokumen__secondary-btn">
                    <Printer size={18} />
                    Print
                  </button>

                  <button className="review-dokumen__primary-btn">
                    <Download size={18} />
                    Download
                  </button>
                </div>
              </div>

              <div className="review-dokumen__preview-shell">
                <div className="review-dokumen__preview-page">
                  <div className="review-dokumen__resume-top">
                    <div>
                      <h2 className="review-dokumen__resume-name">
                        Johnathan Doe
                      </h2>

                      <div className="review-dokumen__resume-role">
                        Senior UI/UX Designer
                      </div>

                      <div className="review-dokumen__resume-contact">
                        <span>✉ john.doe@email.com</span>
                        <span>📞 +62 812 3456 7890</span>
                        <span>📍 Jakarta, ID</span>
                      </div>
                    </div>

                    <div className="review-dokumen__resume-avatar">
                      <img
                        src="/Sarah_Jenkins.png"
                        alt="Kandidat"
                        className="review-dokumen__resume-avatar-image"
                      />
                    </div>
                  </div>

                  <div className="review-dokumen__resume-bar" />

                  <div className="review-dokumen__resume-grid">
                    <div>
                      <div className="review-dokumen__resume-section">
                        <div className="review-dokumen__resume-section-head">
                          <div className="review-dokumen__resume-section-bar" />
                          <h3 className="review-dokumen__resume-section-title">
                            Professional Summary
                          </h3>
                        </div>

                        <p className="review-dokumen__resume-text">
                          Innovative UI/UX Designer with over 8 years of experience
                          building digital products. Proven track record of improving
                          user engagement and retention through human-centric design
                          patterns. Expert in Figma, Prototyping, and Design Systems.
                        </p>
                      </div>

                      <div className="review-dokumen__resume-section">
                        <div className="review-dokumen__resume-section-head review-dokumen__resume-section-head--mb">
                          <div className="review-dokumen__resume-section-bar" />
                          <h3 className="review-dokumen__resume-section-title">
                            Experience
                          </h3>
                        </div>

                        <div className="review-dokumen__timeline">
                          <div className="review-dokumen__timeline-item">
                            <span className="review-dokumen__timeline-dot review-dokumen__timeline-dot--active" />
                            <div className="review-dokumen__timeline-title">
                              Lead Product Designer
                            </div>
                            <div className="review-dokumen__timeline-company review-dokumen__timeline-company--active">
                              TechNova Solutions | 2020 - Present
                            </div>
                            <p className="review-dokumen__timeline-text">
                              Spearheaded the redesign of the main SaaS platform,
                              resulting in a 35% increase in user productivity.
                            </p>
                            <p className="review-dokumen__timeline-text review-dokumen__timeline-text--mt">
                              Managed a team of 5 designers and collaborated with
                              stakeholders to align product vision.
                            </p>
                          </div>

                          <div className="review-dokumen__timeline-item">
                            <span className="review-dokumen__timeline-dot review-dokumen__timeline-dot--inactive" />
                            <div className="review-dokumen__timeline-title">
                              Senior UI Designer
                            </div>
                            <div className="review-dokumen__timeline-company">
                              DesignFlow Agency | 2017 - 2020
                            </div>
                            <p className="review-dokumen__timeline-text">
                              Delivered high-fidelity mockups and interactive
                              prototypes for Fortune 500 clients.
                            </p>
                            <p className="review-dokumen__timeline-text review-dokumen__timeline-text--mt">
                              Established the company&apos;s internal design system
                              used across 12+ projects.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="review-dokumen__resume-side">
                      <div>
                        <div className="review-dokumen__resume-side-title">
                          Core Skills
                        </div>

                        <div className="review-dokumen__skill-list">
                          {[
                            "User Research",
                            "Prototyping",
                            "Interaction Design",
                            "Design Systems",
                            "Wireframing",
                          ].map((skill) => (
                            <div
                              key={skill}
                              className="review-dokumen__skill-chip"
                            >
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="review-dokumen__resume-side-block">
                        <div className="review-dokumen__resume-side-title">
                          Tools
                        </div>

                        <div className="review-dokumen__tools-list">
                          <div>
                            <div className="review-dokumen__tool-label">
                              <span>Figma</span>
                            </div>
                            <div className="review-dokumen__tool-bar-bg">
                              <div className="review-dokumen__tool-bar review-dokumen__tool-bar--figma" />
                            </div>
                          </div>

                          <div>
                            <div className="review-dokumen__tool-label">
                              <span>Adobe CC</span>
                            </div>
                            <div className="review-dokumen__tool-bar-bg">
                              <div className="review-dokumen__tool-bar review-dokumen__tool-bar--adobe" />
                            </div>
                          </div>

                          <div>
                            <div className="review-dokumen__tool-label">
                              <span>Frammer</span>
                            </div>
                            <div className="review-dokumen__tool-bar-bg">
                              <div className="review-dokumen__tool-bar review-dokumen__tool-bar--frammer" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="review-dokumen__resume-side-block">
                        <div className="review-dokumen__resume-side-title">
                          Education
                        </div>

                        <div className="review-dokumen__education-degree">
                          B.A. Graphic Design
                        </div>
                        <div className="review-dokumen__education-meta">
                          Binus University | 2013-2017
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="review-dokumen__resume-footer">
                    <span>Page 1 of 2</span>
                    <span>Generated via Vocaseek Portfolio Builder</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
