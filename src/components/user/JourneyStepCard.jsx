import React, { useEffect, useMemo, useState } from "react";
import {
  FiClipboard,
  FiFileText,
  FiSearch,
  FiUserCheck,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "../../styles/JourneyStepCard.css";
import {
  getScopedItem,
  USER_STORAGE_KEYS,
} from "../../utils/userScopedStorage";
import {
  isDataDiriComplete,
  isAkademikComplete,
  isDokumenComplete,
} from "../../utils/journeyValidation";
import { translatePhrase } from "../../i18n/phrases";
import { getSavedLanguage } from "../../utils/languagePreference";


export default function PerjalananKarirmu() {
  const navigate = useNavigate();
  const [locale, setLocale] = useState(getSavedLanguage());
  const [journeyState, setJourneyState] = useState({
    step1Completed: false,
    step2Completed: false,
    step3Completed: false,
  });

  useEffect(() => {
    const syncLanguage = () => {
      setLocale(getSavedLanguage());
    };

    window.addEventListener("language-changed", syncLanguage);

    return () => {
      window.removeEventListener("language-changed", syncLanguage);
    };
  }, []);

  useEffect(() => {
    const syncJourneyState = () => {
      try {
        const dataDiriRaw = getScopedItem(USER_STORAGE_KEYS.dataDiri);
        const akademikRaw = getScopedItem(USER_STORAGE_KEYS.akademik);
        const dokumenRaw = getScopedItem(USER_STORAGE_KEYS.dokumen);

        let dataDiri = null;
        let akademik = null;
        let dokumen = null;

        try {
          dataDiri = dataDiriRaw ? JSON.parse(dataDiriRaw) : null;
        } catch (e) {
          console.error("Error parsing dataDiri:", e);
        }

        try {
          akademik = akademikRaw ? JSON.parse(akademikRaw) : null;
        } catch (e) {
          console.error("Error parsing akademik:", e);
        }

        try {
          dokumen = dokumenRaw ? JSON.parse(dokumenRaw) : null;
        } catch (e) {
          console.error("Error parsing dokumen:", e);
        }

        const step1Completed =
          isDataDiriComplete(dataDiri) &&
          isAkademikComplete(akademik) &&
          isDokumenComplete(dokumen);

        const step2Completed =
          getScopedItem(USER_STORAGE_KEYS.pretestCompleted) === "true";

        const step3Completed = Boolean(
          getScopedItem(USER_STORAGE_KEYS.appliedJob)
        );

        // Debug logging
        console.log("🔍 Journey State Check:", {
          dataDiriComplete: isDataDiriComplete(dataDiri),
          akademikComplete: isAkademikComplete(akademik),
          dokumenComplete: isDokumenComplete(dokumen),
          step1Completed,
          step2Completed,
          step3Completed,
        });

        setJourneyState((prevState) => {
          if (
            prevState.step1Completed === step1Completed &&
            prevState.step2Completed === step2Completed &&
            prevState.step3Completed === step3Completed
          ) {
            return prevState;
          }

          console.log("✅ Journey State Updated:", {
            step1Completed,
            step2Completed,
            step3Completed,
          });

          return {
            step1Completed,
            step2Completed,
            step3Completed,
          };
        });
      } catch (error) {
        console.error("Gagal membaca status perjalanan karir:", error);
        setJourneyState({
          step1Completed: false,
          step2Completed: false,
          step3Completed: false,
        });
      }
    };

    // Sync on mount
    console.log("📌 JourneyStepCard mounted, syncing journey state...");
    syncJourneyState();

    // Listen to all relevant events
    window.addEventListener("storage", syncJourneyState);
    window.addEventListener("profile-updated", syncJourneyState);
    window.addEventListener("career-journey-updated", syncJourneyState);
    window.addEventListener("akademik-updated", syncJourneyState);

    // Cleanup
    return () => {
      window.removeEventListener("storage", syncJourneyState);
      window.removeEventListener("profile-updated", syncJourneyState);
      window.removeEventListener("career-journey-updated", syncJourneyState);
      window.removeEventListener("akademik-updated", syncJourneyState);
    };
  }, []);

  const activeStep = useMemo(() => {
    if (!journeyState.step1Completed) return 1;
    if (!journeyState.step2Completed) return 2;
    if (!journeyState.step3Completed) return 3;
    return 4;
  }, [
    journeyState.step1Completed,
    journeyState.step2Completed,
    journeyState.step3Completed,
  ]);

  const getStepCardClass = (stepNumber) => {
    const isCompleted =
      (stepNumber === 1 && journeyState.step1Completed) ||
      (stepNumber === 2 && journeyState.step2Completed) ||
      (stepNumber === 3 && journeyState.step3Completed);

    if (isCompleted) {
      return "journey-card journey-card--completed";
    }

    if (stepNumber === activeStep) {
      return "journey-card journey-card--active";
    }

    return "journey-card";
  };

  return (
    <section className="journey-wrap">
      <div className={getStepCardClass(1)}>
        <div className="journey-icon">
          <FiUserCheck />
        </div>
        <div className="journey-step-label">LANGKAH 1</div>
        <h3>Lengkapi Profil</h3>
        <p>
          {journeyState.step1Completed
            ? "Data pribadi, akademik, dan dokumen sudah lengkap."
            : "Lengkapi data pribadi, akademik, dan dokumenmu."}
        </p>

        {!journeyState.step1Completed && (
          <button
            type="button"
            className="journey-btn"
            onClick={() => navigate("/profil")}
          >
            Ayo Lengkapi Profilmu!
          </button>
        )}
      </div>

      <div className={getStepCardClass(2)}>
        <div className="journey-icon">
          <FiClipboard />
        </div>
        <div className="journey-step-label">LANGKAH 2</div>
        <h3>Kerjakan Pre-Test</h3>
        <p>
          {journeyState.step2Completed
            ? "Pre-test selesai. Kamu siap lanjut ke tahap berikutnya."
            : journeyState.step1Completed
            ? "Profil sudah lengkap. Sekarang lanjut kerjakan pre-test."
            : "Selesaikan profilmu dulu untuk membuka pre-test."}
        </p>

        {journeyState.step1Completed && !journeyState.step2Completed && (
          <button
            type="button"
            className="journey-btn"
            onClick={() => navigate("/pretest")}
          >
            Ayo Kerjakan Pre-Test!
          </button>
        )}
      </div>

      <div className={getStepCardClass(3)}>
        <div className="journey-icon">
          <FiSearch />
        </div>
        <div className="journey-step-label">LANGKAH 3</div>
        <h3>Apply Lowongan</h3>
        <p>
          {journeyState.step3Completed
            ? "Lamaran sudah dibuat. Kamu bisa lanjut memantau statusnya."
            : journeyState.step2Completed
            ? "Pre-test selesai. Sekarang cari dan apply lowongan."
            : "Selesaikan pre-test terlebih dahulu."}
        </p>

        {journeyState.step2Completed && !journeyState.step3Completed && (
          <button
            type="button"
            className="journey-btn"
            onClick={() => navigate("/searchlowongan")}
          >
            Ayo Apply Lowongan!
          </button>
        )}
      </div>

      <div className={getStepCardClass(4)}>
        <div className="journey-icon">
          <FiFileText />
        </div>
        <div className="journey-step-label">LANGKAH 4</div>
        <h3>{translatePhrase("Pantau Status", locale) || "Pantau Status"}</h3>
        <p>
          {translatePhrase(
            journeyState.step3Completed
              ? "Lacak proses lamaranmu di sini."
              : "Pantau status setelah kamu berhasil apply lowongan.",
            locale
          ) ||
            (journeyState.step3Completed
              ? "Lacak proses lamaranmu di sini."
              : "Pantau status setelah kamu berhasil apply lowongan.")}
        </p>

        {journeyState.step3Completed && (
          <button
            type="button"
            className="journey-btn"
            onClick={() => navigate("/status-lamaran")}
          >
            {translatePhrase("Lihat Status Lamaran", locale) ||
              "Lihat Status Lamaran"}
          </button>
        )}
      </div>
    </section>
  );
}
