import "../../../styles/admin/AssessmentReview.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardCheck,
  ChevronDown,
  Check,
  User,
} from "lucide-react";
import Sidebar from "../../../components/admin/Sidebar";
import SidebarStaff from "../../../components/admin/SidebarStaff";
import SidebarMitra from "../../../components/admin/SidebarMitra";
import { getAdminTalent } from "../../../services/admin";
import { getApiErrorMessage } from "../../../services/auth";
import {
  mapTalentDetailPayload,
  normalizeList,
  pickFirstValue,
} from "../../../utils/talentProfile";
import { resolveCompanyCandidateDetail } from "../../../utils/companyCandidateDetail";

function normalizeAnswerValue(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (["iya", "ya", "yes", "true", "1"].includes(normalized)) return "Iya";
  if (["tidak", "no", "false", "0"].includes(normalized)) return "Tidak";

  return "Belum dijawab";
}

function getOtherOption(answer) {
  if (answer === "Iya") return "Tidak";
  if (answer === "Tidak") return "Iya";
  return "-";
}

function buildReviewAnswers(rawTalent = {}) {
  const rawAnswers = normalizeList(
    rawTalent?.review_jawaban ||
      rawTalent?.pretest_answers ||
      rawTalent?.assessment_answers ||
      rawTalent?.answers ||
      rawTalent?.assessment?.answers ||
      rawTalent?.assessment?.pretest_answers ||
      rawTalent?.assessment?.review_jawaban ||
      rawTalent?.hasil_online_assessment?.answers ||
      rawTalent?.test_result?.answers ||
      rawTalent?.profile?.assessment?.answers ||
      rawTalent?.profile?.pretest_answers,
  );

  return rawAnswers
    .map((item, index) => {
      const question = pickFirstValue(
        item?.question,
        item?.question_text,
        item?.pertanyaan,
        `Pertanyaan ${index + 1}`,
      );
      const selected = normalizeAnswerValue(
        pickFirstValue(
          item?.answer,
          item?.user_answer,
          item?.selected,
          item?.pilihan,
        ),
      );

      return {
        id: item?.id || index + 1,
        number: Number(item?.nomor || item?.no || index + 1),
        question,
        selected,
        other: getOtherOption(selected),
        isAnswered: selected === "Iya" || selected === "Tidak",
      };
    })
    .sort((first, second) => first.number - second.number);
}

function buildSummary(reviewList) {
  const totalQuestions = reviewList.length;
  const answeredCount = reviewList.filter((item) => item.isAnswered).length;
  const yesCount = reviewList.filter((item) => item.selected === "Iya").length;
  const noCount = reviewList.filter((item) => item.selected === "Tidak").length;

  let summaryText =
    "Belum ada jawaban pre-test yang tersimpan untuk kandidat ini.";

  if (answeredCount > 0) {
    summaryText =
      yesCount >= noCount
        ? "Kandidat menunjukkan respons yang cenderung positif dan proaktif dari jawaban pre-test yang sudah dikirim."
        : "Kandidat menunjukkan respons yang cenderung lebih berhati-hati dari jawaban pre-test yang sudah dikirim.";
  }

  return {
    totalQuestions,
    answeredCount,
    yesCount,
    noCount,
    summaryText,
  };
}

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

export default function AssessmentReviewAdmin({ mode = "super" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [talent, setTalent] = useState(null);
  const [reviewList, setReviewList] = useState([]);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadTalentAssessment = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        let rawTalent = {};

        if (mode === "company") {
          rawTalent = (await resolveCompanyCandidateDetail(id)) || {};
        } else {
          const response = await getAdminTalent(id);
          rawTalent = response?.data?.data || response?.data || {};
        }

        if (!isMounted) return;

        setTalent(mapTalentDetailPayload(rawTalent));
        setReviewList(buildReviewAnswers(rawTalent));
      } catch (error) {
        if (!isMounted) return;

        setTalent(null);
        setReviewList([]);
        setErrorMessage(
          getApiErrorMessage(error, "Gagal memuat review jawaban kandidat."),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTalentAssessment();

    return () => {
      isMounted = false;
    };
  }, [id, mode]);

  const summary = useMemo(() => buildSummary(reviewList), [reviewList]);
  const visibleQuestions = showAllQuestions
    ? reviewList
    : reviewList.slice(0, 4);
  const remainingQuestions = Math.max(
    reviewList.length - visibleQuestions.length,
    0,
  );

  const candidateName = talent?.name || "Kandidat Vocaseek";
  const candidateRole = talent?.position || "Candidate Assessment Result";
  const backPath =
    mode === "staff"
      ? `/admin/staff/talent/${id}`
      : mode === "company"
        ? `/admin/mitra/talent/${id}`
        : `/admin/talent/${id}`;

  const SidebarComponent =
    mode === "staff" ? SidebarStaff : mode === "company" ? SidebarMitra : Sidebar;
  return (
    <div className="assessment-review">
      <SidebarComponent />

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
              onClick={() => navigate(backPath)}
              className="assessment-review__back-btn"
              type="button"
            >
              <ArrowLeft size={24} />
            </button>

            <h1 className="assessment-review__title">
              Assessment Character Profile
            </h1>
          </div>

          {errorMessage && (
            <div style={{ marginBottom: 16, color: "#d93025", fontWeight: 500 }}>
              {errorMessage}
            </div>
          )}

          <div className="assessment-review__grid">
            <div className="assessment-review__summary-card">
              <div className="assessment-review__profile-wrap">
                <div className="assessment-review__avatar-wrap">
                  <div className="assessment-review__avatar">
                    {talent?.photo ? (
                      <img
                        src={talent.photo}
                        alt={candidateName}
                        className="assessment-review__avatar-image"
                      />
                    ) : (
                      <div className="assessment-review__avatar-fallback">
                        <User size={34} />
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
                    {isLoading ? "Memuat ringkasan assessment..." : summary.summaryText}
                  </p>
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
                        key={item.id}
                        number={item.number}
                        question={item.question}
                        selected={item.selected}
                        other={item.other}
                        isAnswered={item.isAnswered}
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
                  {isLoading
                    ? "Memuat jawaban pre-test..."
                    : "Belum ada jawaban pre-test yang tersimpan dari kandidat."}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
