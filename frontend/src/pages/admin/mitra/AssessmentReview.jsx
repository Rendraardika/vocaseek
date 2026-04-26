import "../../../styles/admin/AssessmentReview.css";
import { useMemo, useState } from "react";
import Sidebar from "../../../components/admin/SidebarMitra";
import { ArrowLeft, ClipboardCheck, ChevronDown, Check } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { readProfileFromStorage } from "../../../components/user/ProfileStorage";
import { PRETEST_QUESTION_BANK } from "../../../utils/pretestAssessment";

function getPretestStorageKeys(talentId) {
  return [
    `PRETEST_GLOBAL_ANSWERS_${talentId}`,
    `PRETEST_ANSWERS_${talentId}`,
    `pretest_answers_${talentId}`,
  ];
}

function normalizeOption(value) {
  const val = String(value || "").trim().toLowerCase();

  if (val === "iya" || val === "ya") return "iya";
  if (val === "tidak") return "tidak";

  return "belum dijawab";
}

function normalizeAnswerValue(value) {
  const normalized = normalizeOption(value);

  if (normalized === "iya") return "Iya";
  if (normalized === "tidak") return "Tidak";

  return "Belum dijawab";
}

const ANSWER_WEIGHTS = {
  iya: 1,
  tidak: 0,
  "belum dijawab": 0,
};

function getPretestCategory(score) {
  if (score >= 17) return "Sangat Baik";
  if (score >= 13) return "Baik";
  if (score >= 9) return "Cukup";
  if (score >= 5) return "Kurang";
  return "Tidak Siap";
}

function getCategorySummary(category) {
  if (category === "Sangat Baik") {
    return "Kandidat menunjukkan kesiapan kerja yang sangat baik. Respons yang diberikan menggambarkan perilaku kerja yang konsisten, proaktif, bertanggung jawab, mampu bekerja sama, serta cukup kuat dalam menghadapi tuntutan dan dinamika pekerjaan.";
  }

  if (category === "Baik") {
    return "Kandidat menunjukkan kesiapan kerja yang baik. Secara umum kandidat cukup konsisten dalam tanggung jawab, kerja sama, komunikasi, dan inisiatif, namun masih terdapat beberapa area pengembangan ringan agar adaptasi dan ketahanan kerja semakin optimal.";
  }

  if (category === "Cukup") {
    return "Kandidat menunjukkan potensi dasar dalam kesiapan kerja. Beberapa perilaku positif sudah terlihat, namun kandidat masih membutuhkan pembinaan pada aspek tanggung jawab, komunikasi, inisiatif, adaptasi, atau ketahanan dalam menyelesaikan pekerjaan.";
  }

  if (category === "Kurang") {
    return "Kandidat masih membutuhkan pendampingan dan penguatan kesiapan kerja. Respons yang diberikan menunjukkan perlunya peningkatan pada beberapa aspek perilaku kerja seperti tanggung jawab, kerja sama, komunikasi, inisiatif, dan konsistensi dalam menjalankan tugas.";
  }

  return "Kandidat belum menunjukkan kesiapan perilaku kerja yang memadai untuk konteks intern. Diperlukan pembinaan lebih lanjut terkait tanggung jawab, adaptasi, komunikasi, kerja sama, inisiatif, dan ketahanan dalam menghadapi pekerjaan.";
}

function readPretestAnswersByTalent(talentId) {
  if (!talentId) return [];

  for (const key of getPretestStorageKeys(talentId)) {
    const stored = localStorage.getItem(key);

    if (!stored) continue;

    try {
      const parsed = JSON.parse(stored);

      return Array.isArray(parsed)
        ? parsed
        : Object.entries(parsed).map(([questionId, value]) => ({
            question_id: Number(questionId),
            selected_option: value,
          }));
    } catch {
      return [];
    }
  }

  return [];
}

function buildPretestSummary(answersArray = []) {
  const answeredAnswers = answersArray.filter((item) => {
    const normalized = normalizeOption(item?.selected_option);
    return normalized === "iya" || normalized === "tidak";
  });

  if (answeredAnswers.length === 0) {
    return null;
  }

  const totalQuestions = 20;

  const normalizedAnswers = answeredAnswers.map((item) => ({
    ...item,
    normalized: normalizeOption(item.selected_option),
  }));

  const totalScore = normalizedAnswers.reduce(
    (sum, item) => sum + ANSWER_WEIGHTS[item.normalized],
    0,
  );

  const yesCount = normalizedAnswers.filter(
    (item) => item.normalized === "iya",
  ).length;

  const noCount = normalizedAnswers.filter(
    (item) => item.normalized === "tidak",
  ).length;

  const answeredCount = normalizedAnswers.length;
  const category = getPretestCategory(totalScore);

  return {
    answersArray: normalizedAnswers,
    totalQuestions,
    answeredCount,
    yesCount,
    noCount,
    totalScore,
    category,
    subtitle: `Skor ${totalScore}/${totalQuestions} • ${category}`,
    summaryText: getCategorySummary(category),
    strongestTraits: [
      { key: "responsibility", label: "Tanggung Jawab" },
      { key: "teamwork", label: "Kerja Sama" },
      { key: "communication", label: "Komunikasi" },
      { key: "initiative", label: "Inisiatif" },
    ],
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

export default function AssessmentReview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  const profile = useMemo(() => readProfileFromStorage(), []);
  const answersArray = useMemo(() => readPretestAnswersByTalent(id), [id]);
  const summary = useMemo(() => buildPretestSummary(answersArray), [answersArray]);

  const reviewList = useMemo(() => {
    if (!summary) return [];

    return summary.answersArray
      .map((item, index) => {
        const selected = normalizeAnswerValue(item.selected_option);

        const questionId = Number(
          item.question_id || item.questionId || item.id || index + 1,
        );

        const questionData = PRETEST_QUESTION_BANK[questionId];

        return {
          number: questionId,
          question:
            questionData?.titleId ||
            questionData?.titleEn ||
            `Pertanyaan ${questionId}`,
          selected,
          other: selected === "Iya" ? "Tidak" : "Iya",
          rawAnswer: item.selected_option,
          isAnswered: selected === "Iya" || selected === "Tidak",
        };
      })
      .filter((item) => item.isAnswered)
      .sort((first, second) => first.number - second.number);
  }, [summary]);

  const visibleQuestions = showAllQuestions
    ? reviewList
    : reviewList.slice(0, 4);

  const candidateName = profile.fullName || "Kandidat Vocaseek";
  const candidateRole = "Candidate Assessment Result";
  const remainingQuestions = Math.max(
    reviewList.length - visibleQuestions.length,
    0,
  );

  const strongestTraitsText =
    summary?.strongestTraits?.length > 0
      ? summary.strongestTraits
          .slice(0, 3)
          .map((item) => item.label)
          .join(", ")
      : "Belum ada hasil pre-test";

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
              onClick={() => navigate(`/admin/mitra/talent/${id}`)}
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
                  <span className="assessment-review__stat-label">
                    Terjawab
                  </span>
                  <strong className="assessment-review__stat-value">
                    {summary ? summary.answeredCount : 0}/
                    {summary ? summary.totalQuestions : 20}
                  </strong>
                </div>

                <div className="assessment-review__stat-box">
                  <span className="assessment-review__stat-label">
                    Jawaban Iya
                  </span>
                  <strong className="assessment-review__stat-value">
                    {summary ? summary.yesCount : 0}
                  </strong>
                </div>

                <div className="assessment-review__stat-box">
                  <span className="assessment-review__stat-label">
                    Jawaban Tidak
                  </span>
                  <strong className="assessment-review__stat-value">
                    {summary ? summary.noCount : 0}
                  </strong>
                </div>
              </div>

              <div className="assessment-review__summary-section">
                <div className="assessment-review__summary-label">
                  Summary Karakter
                </div>

                <div className="assessment-review__summary-box">
                  {summary ? (
                    <>
                      <p className="assessment-review__summary-text">
                        {summary.subtitle}
                      </p>
                      <p className="assessment-review__summary-text">
                        {summary.summaryText}
                      </p>
                    </>
                  ) : (
                    <p className="assessment-review__summary-text">
                      Belum ada hasil pre-test untuk kandidat ini.
                    </p>
                  )}
                </div>
              </div>

              <div className="assessment-review__summary-section assessment-review__summary-section--compact">
                <div className="assessment-review__summary-label">
                  Karakter Dominan
                </div>

                <div className="assessment-review__trait-pill-wrap">
                  {summary?.strongestTraits?.length > 0 ? (
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
                    Detail tanggapan yang diambil langsung dari hasil pre-test
                    kandidat
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
                  Belum ada jawaban pre-test yang tersimpan dari kandidat ini.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}