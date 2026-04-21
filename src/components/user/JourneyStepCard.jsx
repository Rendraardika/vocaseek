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
const REQUIRED_DOC_IDS = [
  "cv",
  "portfolio",
  "rekomendasi",
  "ktp",
  "transkrip",
  "ktm",
];

const isDataDiriComplete = (data) => {
  if (!data) return false;

  return Boolean(
    data.about?.trim() &&
    data.fullName?.trim() &&
    data.gender?.trim() &&
    data.birthDate?.trim() &&
    data.birthPlaceType?.trim() &&
    data.birthCity?.trim() &&
    data.email?.trim() &&
    data.phone?.trim() &&
    data.province?.trim() &&
    data.kabupaten?.trim() &&
    data.addressDetail?.trim(),
  );
};

const isAkademikComplete = (data) => {
  if (!data) return false;

  const pendidikan = data?.pendidikan || {};
  const pengalaman = Array.isArray(data?.pengalaman) ? data.pengalaman : [];
  const sertifikasi = Array.isArray(data?.sertifikasi) ? data.sertifikasi : [];

  return Boolean(
    pendidikan.institusi?.trim() &&
    pendidikan.jurusan?.trim() &&
    pengalaman.length > 0 &&
    sertifikasi.length > 0,
  );
};

const isDokumenComplete = (docs) => {
  if (!Array.isArray(docs)) return false;

  return REQUIRED_DOC_IDS.every((requiredId) => {
    const found = docs.find((item) => item.id === requiredId);
    return found?.status === "uploaded";
  });
};

export default function PerjalananKarirmu() {
  const navigate = useNavigate();
  const [journeyState, setJourneyState] = useState({
    step1Completed: false,
    step2Completed: false,
    step3Completed: false,
  });

  useEffect(() => {
    const syncJourneyState = () => {
      try {
        const dataDiri = JSON.parse(getScopedItem(USER_STORAGE_KEYS.dataDiri) || "null");
        const akademik = JSON.parse(getScopedItem(USER_STORAGE_KEYS.akademik) || "null");
        const dokumen = JSON.parse(getScopedItem(USER_STORAGE_KEYS.dokumen) || "null");
        const step2Completed =
          getScopedItem(USER_STORAGE_KEYS.pretestCompleted) === "true";
        const step3Completed = Boolean(getScopedItem(USER_STORAGE_KEYS.appliedJob));

        setJourneyState({
          step1Completed:
            isDataDiriComplete(dataDiri) &&
            isAkademikComplete(akademik) &&
            isDokumenComplete(dokumen),
          step2Completed,
          step3Completed,
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

    syncJourneyState();

    window.addEventListener("storage", syncJourneyState);
    window.addEventListener("profile-updated", syncJourneyState);
    window.addEventListener("career-journey-updated", syncJourneyState);

    return () => {
      window.removeEventListener("storage", syncJourneyState);
      window.removeEventListener("profile-updated", syncJourneyState);
      window.removeEventListener("career-journey-updated", syncJourneyState);
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
    if (
      (stepNumber === 1 && journeyState.step1Completed) ||
      (stepNumber === 2 && journeyState.step2Completed) ||
      (stepNumber === 3 && journeyState.step3Completed)
    ) {
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
            : "Kemampuan teknis teruji."}
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
            : "Temukan pekerjaan impian dan mulai daftar lowongan."}
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
        <h3>Pantau Status</h3>
        <p>Lacak proses lamaran.</p>
        {journeyState.step3Completed && (
          <button
            type="button"
            className="journey-btn"
            onClick={() => navigate("/status-lamaran")}
          >
            Lihat Status Lamaran
          </button>
        )}
      </div>
    </section>
  );
}
