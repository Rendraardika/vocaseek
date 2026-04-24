import "../../../styles/admin/DashboardMitra.css";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../components/admin/SidebarMitra";
import StatCard from "../../../components/admin/StatCardMitra";
import ApplicantsTable from "../../../components/admin/ApplicantsTableMitra";
import { getApiErrorMessage } from "../../../services/auth";
import {
  getCompanyDashboard,
  mapCompanyDashboardApplicant,
} from "../../../services/jobs";
import {
  getCompanyCandidateDetail,
  getCompanyCandidates,
} from "../../../services/companyTalent";
import { pickFirstMediaValue } from "../../../utils/media";
import { mapTalentDetailPayload } from "../../../utils/talentProfile";
import { translatePhrase } from "../../../i18n/phrases";
import { getSavedLanguage } from "../../../utils/languagePreference";

function extractCandidateCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.candidates)) return payload.candidates;
  if (Array.isArray(payload?.talents)) return payload.talents;
  return [];
}

function resolveCandidatePhoto(source = {}) {
  const normalizedTalent = mapTalentDetailPayload(source);
  if (normalizedTalent?.photo) {
    return normalizedTalent.photo;
  }

  const user = source?.user || source?.intern || source?.candidate || {};
  const profile =
    user?.intern_profile ||
    user?.internProfile ||
    source?.intern_profile ||
    source?.internProfile ||
    source?.profile ||
    source?.personal ||
    {};

  return pickFirstMediaValue(
    source?.foto,
    source?.photo,
    source?.avatar,
    source?.image,
    source?.photo_url,
    source?.avatar_url,
    source?.personal?.photo,
    source?.personal?.foto,
    source?.profile?.foto,
    source?.profile?.photo,
    source?.profile?.avatar,
    profile?.foto,
    profile?.photo,
    profile?.avatar,
    user?.foto,
    user?.photo,
    user?.avatar,
  );
}

export default function DashboardMitra() {
  const [locale, setLocale] = useState(getSavedLanguage());
  const [dashboardData, setDashboardData] = useState({
    totalApplicants: 0,
    activeJobs: 0,
    shortlisted: 0,
    recentApplicants: [],
  });
  const [errorMessage, setErrorMessage] = useState("");

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
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setErrorMessage("");
        const response = await getCompanyDashboard();
        const payload = response?.data || {};
        const stats = payload?.stats || payload?.data?.stats || {};
        const recentApplicantsSource =
          payload?.recent_applicants ||
          payload?.recentApplicants ||
          payload?.data?.recent_applicants ||
          payload?.data?.recentApplicants ||
          [];
        let recentApplicants = Array.isArray(recentApplicantsSource)
          ? recentApplicantsSource.map(mapCompanyDashboardApplicant)
          : [];

        const candidateListResponse = await getCompanyCandidates();
        const candidateListPayload =
          candidateListResponse?.data?.data || candidateListResponse?.data || {};
        const candidateList = extractCandidateCollection(candidateListPayload);
        const candidatePhotoMap = new Map(
          candidateList.map((candidate) => [
            String(
              candidate?.application_id ||
                candidate?.lamaran_id ||
                candidate?.job_application_id ||
                candidate?.id ||
                candidate?.candidate_id ||
                "",
            ),
            resolveCandidatePhoto(candidate),
          ]),
        );

        const recentApplicantsMissingPhoto = recentApplicants.filter(
          (applicant) => !applicant.image,
        );

        if (recentApplicantsMissingPhoto.length > 0) {
          const detailPhotos = await Promise.all(
            recentApplicantsMissingPhoto.map(async (applicant) => {
              const matchedFromList = candidateList.find((candidate) => {
                const candidateId = String(
                  candidate?.application_id ||
                    candidate?.lamaran_id ||
                    candidate?.job_application_id ||
                    candidate?.id ||
                    candidate?.candidate_id ||
                    "",
                );

                return (
                  candidateId === String(applicant.id || "") ||
                  (candidate?.name || candidate?.nama || candidate?.user?.nama || "")
                    .toLowerCase() === applicant.name.toLowerCase()
                );
              });

              const directPhoto =
                candidatePhotoMap.get(String(applicant.id || "")) ||
                resolveCandidatePhoto(matchedFromList);

              if (directPhoto) {
                return [String(applicant.id || applicant.name), directPhoto];
              }

              try {
                const detailResponse = await getCompanyCandidateDetail(applicant.id);
                const detailPayload = detailResponse?.data?.data || detailResponse?.data || {};
                return [String(applicant.id || applicant.name), resolveCandidatePhoto(detailPayload)];
              } catch {
                return [String(applicant.id || applicant.name), ""];
              }
            }),
          );

          const detailMap = new Map(detailPhotos);
          recentApplicants = recentApplicants.map((applicant) => ({
            ...applicant,
            image:
              applicant.image ||
              detailMap.get(String(applicant.id || applicant.name)) ||
              "",
          }));
        }

        if (!isMounted) return;

        setDashboardData({
          totalApplicants: Number(stats?.total_applicants || stats?.totalApplicants || 0),
          activeJobs: Number(stats?.active_jobs || stats?.activeJobs || 0),
          shortlisted: Number(stats?.shortlisted || stats?.shortlisted_count || 0),
          recentApplicants,
        });
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          getApiErrorMessage(
            error,
            "Gagal memuat dashboard company.",
          ),
        );
        setDashboardData({
          totalApplicants: 0,
          activeJobs: 0,
          shortlisted: 0,
          recentApplicants: [],
        });
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = useMemo(
    () => [
      {
        title: "TOTAL APPLICANTS",
        value: dashboardData.totalApplicants,
        subtitle:
          dashboardData.totalApplicants > 0
            ? `${dashboardData.totalApplicants} ${
                translatePhrase("pelamar pada company ini", locale) ||
                "pelamar pada company ini"
              }`
            : translatePhrase("Belum ada pelamar", locale) || "Belum ada pelamar",
      },
      {
        title: "ACTIVE JOB POSTS",
        value: dashboardData.activeJobs,
        subtitle:
          dashboardData.activeJobs > 0
            ? `${dashboardData.activeJobs} ${
                translatePhrase("lowongan aktif", locale) || "lowongan aktif"
              }`
            : translatePhrase("Belum ada lowongan aktif", locale) ||
              "Belum ada lowongan aktif",
      },
      {
        title: "SHORTLISTED",
        value: dashboardData.shortlisted,
        subtitle:
          dashboardData.shortlisted > 0
            ? `${dashboardData.shortlisted} ${
                translatePhrase("kandidat shortlisted", locale) ||
                "kandidat shortlisted"
              }`
            : translatePhrase("Belum ada kandidat direview", locale) ||
              "Belum ada kandidat direview",
      },
    ],
    [dashboardData, locale],
  );

  return (
    <div className="dashboard-mitra">
      <Sidebar />

      <div className="dashboard-mitra__main">
        <div className="dashboard-mitra__content">
          <p className="dashboard-mitra__breadcrumb">
            <span>ADMIN &gt; </span>
            <span className="dashboard-mitra__breadcrumb-active">
              OVERVIEW DASHBOARD
            </span>
          </p>

          <h1 className="dashboard-mitra__title">
            {translatePhrase("Company Overview", locale) || "Company Overview"}
          </h1>
          {errorMessage ? (
            <div className="dashboard-mitra__error">{errorMessage}</div>
          ) : null}

          <div className="dashboard-mitra__stats">
            {statCards.map((card) => (
              <StatCard
                key={card.title}
                title={translatePhrase(card.title, locale) || card.title}
                value={card.value}
                subtitle={card.subtitle}
              />
            ))}
          </div>

          <ApplicantsTable
            data={dashboardData.recentApplicants}
          />
        </div>
      </div>
    </div>
  );
}
