import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Soal1.css";
import { getApiErrorMessage } from "../../services/auth";
import { submitInternTest } from "../../services/intern";
import {
  PRETEST_DURATION_MS,
  PRETEST_QUESTION_BANK,
  PRETEST_STORAGE_KEYS,
} from "../../utils/pretestAssessment";
import { getScopedItem, setScopedItem } from "../../utils/userScopedStorage";

function getPretestStartedAt() {
  const savedStartedAt = Number(getScopedItem(PRETEST_STORAGE_KEYS.startedAt));

  if (Number.isFinite(savedStartedAt) && savedStartedAt > 0) {
    return savedStartedAt;
  }

  const now = Date.now();
  setScopedItem(PRETEST_STORAGE_KEYS.startedAt, String(now));
  return now;
}

function getRemainingTime(startedAt) {
  return Math.max(0, PRETEST_DURATION_MS - (Date.now() - startedAt));
}

function formatRemainingTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function Soal1() {
  const navigate = useNavigate();
  const total = 20;
  const [startedAt] = useState(() => getPretestStartedAt());
  const [remainingMs, setRemainingMs] = useState(() =>
    getRemainingTime(getPretestStartedAt()),
  );
  const [activeNo, setActiveNo] = useState(1);
  const [answers, setAnswers] = useState(() => {
    const saved = PRETEST_STORAGE_KEYS.readAnswers();
    return saved ? JSON.parse(saved) : {};
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = useMemo(() => PRETEST_QUESTION_BANK, []);

  const finishTest = useCallback(async () => {
    if (isSubmitting) return;

    const questionIds = Object.keys(questions)
      .map(Number)
      .sort((first, second) => first - second);
    const unansweredQuestions = questionIds.filter(
      (questionId) => !["Ya", "Tidak"].includes(answers[questionId]),
    );

    if (unansweredQuestions.length > 0) {
      window.alert("Semua soal pre-test harus dijawab sebelum dikirim.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitInternTest({
        answers: questionIds.map((questionId) => ({
          question_id: questionId,
          selected_option: answers[questionId],
        })),
      });

      setScopedItem(PRETEST_STORAGE_KEYS.completed, "true");
      setScopedItem(PRETEST_STORAGE_KEYS.answers, JSON.stringify(answers));
      setScopedItem(PRETEST_STORAGE_KEYS.questions, JSON.stringify(questions));
      navigate("/selesai-test");
    } catch (error) {
      window.alert(
        getApiErrorMessage(error, "Gagal mengirim jawaban pre-test."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, isSubmitting, navigate, questions]);

  const timeText = formatRemainingTime(remainingMs);

  useEffect(() => {
    setScopedItem(PRETEST_STORAGE_KEYS.answers, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    setScopedItem(PRETEST_STORAGE_KEYS.questions, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    const tick = () => {
      const nextRemainingMs = getRemainingTime(startedAt);
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs <= 0) {
        finishTest();
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [finishTest, startedAt]);

  const currentQuestion = questions[activeNo];

  const handlePickNumber = (n) => {
    setActiveNo(n);
  };

  const handleAnswer = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [activeNo]: value,
    }));
  };

  const handlePrev = () => {
    setActiveNo((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    if (activeNo < total) {
      setActiveNo((prev) => prev + 1);
    } else {
      finishTest();
    }
  };

  const isLast = activeNo === total;
  const currentAnswer = answers[activeNo] || "";

  return (
    <div className="assessPage">
      <header className="assessHeader">
        <div className="assessHeaderInner">
          <div className="assessLogo">
            <img
              src="/logovocaseek.png"
              alt="Vocaseek"
              className="assessLogoImg"
            />
          </div>

          <div className="assessHeaderRight">
            <div className="assessTimer" role="status" aria-label="Timer">
              <span className="assessTimerDot" aria-hidden="true" />
              <span className="assessTimerText">{timeText}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="assessBody">
        <aside className="assessAside" aria-label="Navigasi Soal">
          <div className="assessAsideInner">
            <div className="assessAsideLabel">KATEGORI SOAL</div>
            <div className="assessAsideTitle">Cognitive &amp; Problem Solving</div>

            <div className="assessAsideDivider" />

            <div className="assessNumGrid">
              {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
                const isActiveBtn = n === activeNo;
                const isAnswered = !!answers[n];

                return (
                  <button
                    key={n}
                    type="button"
                    className={`assessNumBtn ${isActiveBtn ? "isActive" : ""} ${
                      isAnswered ? "isAnswered" : ""
                    }`}
                    onClick={() => handlePickNumber(n)}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            <div className="assessAsideFooter">
              © 2026 Vocaseek Education. Seluruh hak cipta dilindungi.
            </div>
          </div>
        </aside>

        <main className="assessMain">
          <div className="assessMainInner">
            <div className="assessQuestionWrap">
              <h1 className="assessQuestion">{currentQuestion.title}</h1>
            </div>

            <div className="assessAnswerGrid">
              <button
                type="button"
                className={`answerCard ${currentAnswer === "Ya" ? "selected" : ""}`}
                onClick={() => handleAnswer("Ya")}
              >
                <div className="answerIcon yesIcon" aria-hidden="true">
                  ✓
                </div>
                <div className="answerTitle">Iya</div>
                <div className="answerDesc">Saya setuju pernyataan</div>
              </button>

              <button
                type="button"
                className={`answerCard ${currentAnswer === "Tidak" ? "selected" : ""}`}
                onClick={() => handleAnswer("Tidak")}
              >
                <div className="answerIcon noIcon" aria-hidden="true">
                  ✕
                </div>
                <div className="answerTitle">Tidak</div>
                <div className="answerDesc">Tidak sesuai dengan pernyataan</div>
              </button>
            </div>

            <div className="assessBottomBar">
              <button
                className="backLink"
                type="button"
                onClick={handlePrev}
                disabled={activeNo === 1}
              >
                ‹ Sebelumnya
              </button>

              <button
                className="assessNextBtn"
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {isLast ? "Selesai" : "Selanjutnya"} <span>›</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
