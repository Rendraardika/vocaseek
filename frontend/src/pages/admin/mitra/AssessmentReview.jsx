import "../../../styles/admin/AssessmentReview.css";
import { useMemo, useState } from "react";
import Sidebar from "../../../components/admin/SidebarMitra";
import {
  ArrowLeft,
  ClipboardCheck,
  ChevronDown,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { readProfileFromStorage } from "../../../components/user/ProfileStorage";
import {
  getPretestReviewList,
  getPretestSummary,
} from "../../../utils/pretestAssessment";

function QuestionCard({
  number,
  question,
  selected = "Belum dijawab",
  other = "-",
  isAnswered = false,
}) {
  return (
    <div className="assessment-review__question-card">
      <div className="assessment-review__question-row">
        <div className="assessment-review__question-number">{number}</div>

        <div className="assessment-review__question-content">
          <h3 className="assessment-review__question-title">{question}</h3>

          <div className="assessment-review__answer-grid">
            <div
              className={`assessment-review__answer-box ${
                isAnswered
                  ? "assessment-review__answer-box--selected"
                  : "assessment-review__answer-box--empty"
              }`}
            >
              <div className="assessment-review__answer-label">
                Pilihan Terpilih
              </div>

              <div className="assessment-review__answer-value">{selected}</div>

              {isAnswered ? (
                <div className="assessment-review__answer-check">
                  <Check
                    size={16}
                    className="assessment-review__answer-check-icon"
                    strokeWidth={3}
                  />
                </div>
              ) : null}
            </div>

            <div className="assessment-review__answer-box assessment-review__answer-box--other">
              <div className="assessment-review__answer-label assessment-review__answer-label--muted">
                Opsi Lainnya
              </div>

              <div className="assessment-review__answer-value assessment-review__answer-value--muted">
                {other}
              </div>
            </div>
          </div>

          <div className="assessment-review__question-divider" />
        </div>
      </div>
    </div>
  );
}

export default function AssessmentReview() {
  const navigate = useNavigate();
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  const profile = useMemo(() => readProfileFromStorage(), []);
  const reviewList = useMemo(() => getPretestReviewList(), []);
  const summary = useMemo(() => getPretestSummary(reviewList), [reviewList]);

  const visibleQuestions = showAllQuestions
    ? reviewList
    : reviewList.slice(0, 4);

  const strongestTraitsText =
    summary.strongestTraits.length > 0
      ? summary.strongestTraits
          .slice(0, 3)
          .map((item) => item.label)
          .join(", ")
      : "belum terbaca";

  const candidateName = profile.fullName || "Kandidat Vocaseek";
  const candidateRole = "Candidate Assessment Result";
  const remainingQuestions = Math.max(reviewList.length - visibleQuestions.length, 0);

  const isAnswered = (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    return normalized === "iya" || normalized === "ya" || normalized === "tidak";
  };

  return (
    <div className="assessment-review">
      <Sidebar />

      <main className="assessment-review__main">

        <section className="assessment-review__section">
          <div className="assessment-review__breadcrumb">
            <span className="assessment-review__breadcrumb-muted">ADMIN</span>
            <span className="assessment-review__breadcrumb-muted">›</span>
            <span className="assessment-review__breadcrumb-muted">
              TALENT MANAGEMENT
            </span>
            <span className="assessment-review__breadcrumb-muted">›</span>
            <span className="assessment-review__breadcrumb-muted">
              DETAIL PROFIL
            </span>
            <span className="assessment-review__breadcrumb-muted">›</span>
            <span className="assessment-review__breadcrumb-active">
              ASSESSMENT REVIEW
            </span>
          </div>

          <div className="assessment-review__header">
            <button
              onClick={() => navigate("/admin/mitra/talent/kdt-001")}
              className="assessment-review__back-btn"
              type="button"
            >
              <ArrowLeft size={24} />
            </button>

            <h1 className="assessment-review__title">
              Assessment Character Profile
            </h1>
          </div>

          <div className="assessment-review__grid">
            <div className="assessment-review__summary-card">
              <div className="assessment-review__profile-wrap">
                <div className="assessment-review__avatar-wrap">
                  <div className="assessment-review__avatar">
                    {profile.photo ? (
                      <img
                        src={profile.photo}
                        alt={candidateName}
                        className="assessment-review__avatar-image"
                      />
                    ) : (
                      <div className="assessment-review__avatar-fallback">
                        {candidateName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="assessment-review__avatar-status" />
                </div>

                <div className="assessment-review__profile-text">
                  <div className="assessment-review__profile-name">
                    {candidateName}
                  </div>
                  <div className="assessment-review__profile-role">
                    {candidateRole}
                  </div>
                </div>
              </div>

              <div className="assessment-review__stats-grid">
                <div className="assessment-review__stat-box">
                  <span className="assessment-review__stat-label">Terjawab</span>
                  <strong className="assessment-review__stat-value">
                    {summary.answeredCount}/{summary.totalQuestions}
                  </strong>
                </div>
                <div className="assessment-review__stat-box">
                  <span className="assessment-review__stat-label">Jawaban Iya</span>
                  <strong className="assessment-review__stat-value">
                    {summary.yesCount}
                  </strong>
                </div>
                <div className="assessment-review__stat-box">
                  <span className="assessment-review__stat-label">Jawaban Tidak</span>
                  <strong className="assessment-review__stat-value">
                    {summary.noCount}
                  </strong>
                </div>
              </div>

              <div className="assessment-review__summary-section">
                <div className="assessment-review__summary-label">
                  Summary Karakter
                </div>

                <div className="assessment-review__summary-box">
                  <p className="assessment-review__summary-text">
                    {summary.summaryText}
                  </p>
                </div>
              </div>

              <div className="assessment-review__summary-section assessment-review__summary-section--compact">
                <div className="assessment-review__summary-label">
                  Karakter Dominan
                </div>

                <div className="assessment-review__trait-pill-wrap">
                  {summary.strongestTraits.length > 0 ? (
                    summary.strongestTraits.slice(0, 4).map((item) => (
                      <span
                        key={item.key}
                        className="assessment-review__trait-pill"
                      >
                        {item.label}
                      </span>
                    ))
                  ) : (
                    <span className="assessment-review__trait-pill assessment-review__trait-pill--muted">
                      {strongestTraitsText}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="assessment-review__content-card">
              <div className="assessment-review__content-header">
                <div className="assessment-review__content-icon-box">
                  <ClipboardCheck
                    size={24}
                    className="assessment-review__content-icon"
                  />
                </div>

                <div>
                  <h2 className="assessment-review__content-title">
                    Review Jawaban
                  </h2>
                  <p className="assessment-review__content-subtitle">
                    Detail tanggapan yang diambil langsung dari hasil pre-test kandidat
                  </p>
                </div>
              </div>

              {reviewList.length > 0 ? (
                <>
                  <div className="assessment-review__question-list">
                    {visibleQuestions.map((item) => (
                      <QuestionCard
                        key={item.number}
                        number={item.number}
                        question={item.question}
                        selected={item.selected}
                        other={item.other}
                        isAnswered={isAnswered(item.rawAnswer)}
                      />
                    ))}
                  </div>

                  {!showAllQuestions && remainingQuestions > 0 ? (
                    <div className="assessment-review__load-more-wrap">
                      <button
                        onClick={() => setShowAllQuestions(true)}
                        className="assessment-review__load-more-btn"
                        type="button"
                      >
                        {`Load ${remainingQuestions} More Questions`}
                        <ChevronDown size={18} />
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="assessment-review__empty-state">
                  Belum ada jawaban pre-test yang tersimpan dari sisi kandidat.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
