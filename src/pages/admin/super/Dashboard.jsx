import Sidebar from "../../../components/admin/Sidebar";
import StatCard from "../../../components/admin/StatCard";
import ActivityTable from "../../../components/admin/ActivityTable";
import "../../../styles/Dashboard.css";
import { useEffect, useState } from "react";
import { GraduationCap, Building2, Briefcase } from "lucide-react";
import { getApiErrorMessage } from "../../../services/auth";
import {
  getAdminOverview,
  getAdminTalent,
  getAdminTalents,
} from "../../../services/admin";
import { pickFirstMediaValue } from "../../../utils/media";
import { mapTalentDetailPayload } from "../../../utils/talentProfile";

function pickStatValue(stat) {
  if (typeof stat === "number" || typeof stat === "string") {
    return String(stat);
  }

  if (stat?.value !== undefined && stat?.value !== null) {
    return String(stat.value);
  }

  return "0";
}

function pickStatNote(stat, fallbackNote) {
  return stat?.growth || stat?.label || fallbackNote;
}

function getInitials(name) {
  return String(name || "NA")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function extractActivityCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.activities)) return payload.activities;
  if (Array.isArray(payload?.recent_activity)) return payload.recent_activity;
  if (Array.isArray(payload?.recentActivities)) return payload.recentActivities;
  if (Array.isArray(payload?.dashboard_data?.activities)) {
    return payload.dashboard_data.activities;
  }
  if (Array.isArray(payload?.dashboard_data?.recent_activity)) {
    return payload.dashboard_data.recent_activity;
  }
  if (Array.isArray(payload?.dashboard_data?.recentActivities)) {
    return payload.dashboard_data.recentActivities;
  }
  if (Array.isArray(payload?.overview?.activities)) return payload.overview.activities;
  if (Array.isArray(payload?.overview?.recent_activity)) {
    return payload.overview.recent_activity;
  }
  if (Array.isArray(payload?.overview?.recentActivities)) {
    return payload.overview.recentActivities;
  }
  return [];
}

function extractTalentCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.talents)) return payload.talents;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function pickFirstText(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function isPlaceholderText(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return !normalized || ["unknown", "n/a", "-", "null", "undefined"].includes(normalized);
}

function getActivityStatus(item) {
  const status = String(
    item?.status ||
      item?.application_status ||
      item?.review_status ||
      item?.state ||
      "REVIEWING",
  ).toUpperCase();

  if (["ACCEPTED", "SHORTLISTED", "ACTIVE"].includes(status)) return "ACCEPTED";
  if (["REJECTED", "DECLINED", "INACTIVE"].includes(status)) return "DECLINED";
  return "REVIEWING";
}

function getAppliedCompanyName(item) {
  return pickFirstText(
    item?.perusahaan,
    item?.company_name,
    item?.nama_perusahaan,
    item?.company?.nama_perusahaan,
    item?.company?.company_name,
    item?.company_profile?.nama_perusahaan,
    item?.company_profile?.company_name,
    item?.application?.company_name,
    item?.application?.nama_perusahaan,
    item?.application?.company?.nama_perusahaan,
    item?.application?.company?.company_name,
    item?.application?.company_profile?.nama_perusahaan,
    item?.application?.company_profile?.company_name,
    item?.lowongan?.company_name,
    item?.lowongan?.nama_perusahaan,
    item?.lowongan?.company?.nama_perusahaan,
    item?.lowongan?.company?.company_name,
    item?.lowongan?.company_profile?.nama_perusahaan,
    item?.lowongan?.company_profile?.company_name,
    item?.job?.company_name,
    item?.job?.nama_perusahaan,
    item?.job?.company?.nama_perusahaan,
    item?.job?.company?.company_name,
    item?.job?.company_profile?.nama_perusahaan,
    item?.job?.company_profile?.company_name,
    item?.lowongan?.companyProfile?.nama_perusahaan,
    item?.lowongan?.companyProfile?.company_name,
    item?.lowongan?.mitra?.nama_perusahaan,
    item?.lowongan?.mitra?.company_name,
  );
}

function getTalentTimestamp(item) {
  const value =
    item?.created_at ||
    item?.createdAt ||
    item?.registered_at ||
    item?.registeredAt ||
    item?.tanggal_daftar ||
    item?.user?.created_at ||
    item?.user?.createdAt ||
    "";
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeNameKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getActivityName(item) {
  return pickFirstText(
    item?.name,
    item?.nama,
    item?.identity,
    item?.full_name,
    item?.talent_name,
    item?.candidate_name,
    item?.user?.nama,
    item?.user?.name,
  );
}

function buildActivityLookup(items = []) {
  const byId = new Map();
  const byName = new Map();

  items.forEach((item) => {
    const name = getActivityName(item);
    const mapped = {
      organization: isPlaceholderText(getAppliedCompanyName(item))
        ? "-"
        : getAppliedCompanyName(item),
      status: getActivityStatus(item),
      name,
    };

    [
      item?.user_id,
      item?.id,
      item?.talent_id,
      item?.candidate_id,
      item?.user?.id,
      item?.user?.user_id,
    ]
      .filter(Boolean)
      .forEach((key) => byId.set(String(key), mapped));

    if (!isPlaceholderText(name)) {
      byName.set(normalizeNameKey(name), mapped);
    }
  });

  return { byId, byName };
}

function mapTalentToActivity(item, lookup) {
  const normalizedTalent = mapTalentDetailPayload(item);
  const name = pickFirstText(
    item?.nama,
    item?.name,
    item?.full_name,
    item?.talent_name,
    item?.candidate_name,
    item?.user?.nama,
    item?.user?.name,
    item?.user?.full_name,
  );

  if (isPlaceholderText(name)) return null;

  const matchedActivity =
    lookup.byId.get(String(item?.user_id || "")) ||
    lookup.byId.get(String(item?.id || "")) ||
    lookup.byId.get(String(item?.talent_id || "")) ||
    lookup.byId.get(String(item?.candidate_id || "")) ||
    lookup.byId.get(String(item?.user?.id || "")) ||
    lookup.byId.get(String(item?.user?.user_id || "")) ||
    lookup.byName.get(normalizeNameKey(name));

  return {
    backendId: String(item?.user_id || item?.id || item?.talent_id || ""),
    initials: getInitials(name),
    photo: pickFirstMediaValue(
      normalizedTalent?.photo,
      item?.foto,
      item?.photo,
      item?.avatar,
      item?.profile_image,
      item?.nama_talenta?.foto,
      item?.nama_talenta?.photo,
      item?.nama_talenta?.avatar,
      item?.nama_talenta?.foto,
      item?.personal?.foto,
      item?.personal?.photo,
      item?.personal?.avatar,
      item?.user?.foto,
      item?.user?.photo,
      item?.user?.avatar,
      item?.profile?.foto,
      item?.profile?.photo,
      item?.profile?.avatar,
    ),
    name,
    organization:
      matchedActivity?.organization ||
      (isPlaceholderText(getAppliedCompanyName(item)) ? "-" : getAppliedCompanyName(item)),
    status: matchedActivity?.status || getActivityStatus(item),
  };
}

export default function Dashboard() {
  const [overview, setOverview] = useState({});
  const [activities, setActivities] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      setErrorMessage("");

      try {
        const [overviewResponse, talentsResponse] = await Promise.all([
          getAdminOverview(),
          getAdminTalents(),
        ]);
        const payload =
          overviewResponse?.data?.data || overviewResponse?.data || {};
        const statsPayload =
          payload?.dashboard_data ||
          payload?.stats ||
          payload?.overview ||
          payload;
        const activityLookup = buildActivityLookup(extractActivityCollection(payload));
        const talentCollection = extractTalentCollection(
          talentsResponse?.data?.data || talentsResponse?.data || {},
        );
        let syncedActivities = [...talentCollection]
          .sort((left, right) => getTalentTimestamp(right) - getTalentTimestamp(left))
          .map((item) => mapTalentToActivity(item, activityLookup))
          .filter(Boolean)
          .slice(0, 5);

        const missingPhotoActivities = syncedActivities.filter(
          (item) => !item.photo && item.backendId,
        );

        if (missingPhotoActivities.length > 0) {
          const detailPhotos = await Promise.all(
            missingPhotoActivities.map(async (item) => {
              try {
                const detailResponse = await getAdminTalent(item.backendId);
                const detailPayload =
                  detailResponse?.data?.data || detailResponse?.data || {};
                const normalizedDetail = mapTalentDetailPayload(detailPayload);

                return [
                  item.backendId,
                  pickFirstMediaValue(
                    normalizedDetail?.photo,
                    detailPayload?.foto,
                    detailPayload?.photo,
                    detailPayload?.avatar,
                    detailPayload?.nama_talenta?.foto,
                    detailPayload?.nama_talenta?.photo,
                    detailPayload?.nama_talenta?.avatar,
                    detailPayload?.personal?.foto,
                    detailPayload?.personal?.photo,
                    detailPayload?.personal?.avatar,
                    detailPayload?.user?.foto,
                    detailPayload?.user?.photo,
                    detailPayload?.user?.avatar,
                    detailPayload?.profile?.foto,
                    detailPayload?.profile?.photo,
                    detailPayload?.profile?.avatar,
                  ),
                ];
              } catch {
                return [item.backendId, ""];
              }
            }),
          );

          const photoMap = new Map(detailPhotos);
          syncedActivities = syncedActivities.map((item) => ({
            ...item,
            photo: item.photo || photoMap.get(item.backendId) || "",
          }));
        }

        setOverview(statsPayload);
        setActivities(syncedActivities);
      } catch (error) {
        setOverview({});
        setActivities([]);
        setErrorMessage(
          getApiErrorMessage(error, "Gagal memuat overview dashboard.")
        );
      }
    };

    loadOverview();
  }, []);

  const stats = [
    {
      title: "TOTAL TALENTS",
      value: pickStatValue(
        overview?.total_talents ?? overview?.totalTalents ?? overview?.talents,
      ),
      note: pickStatNote(
        overview?.total_talents ?? overview?.totalTalents ?? overview?.talents,
        "Data talenta dari backend",
      ),
      type: "positive",
      icon: <GraduationCap size={20} />,
    },
    {
      title: "PARTNERS",
      value: pickStatValue(
        overview?.partners ?? overview?.total_partners ?? overview?.mitra,
      ),
      note: pickStatNote(
        overview?.partners ?? overview?.total_partners ?? overview?.mitra,
        "Data mitra dari backend",
      ),
      type: "positive",
      icon: <Building2 size={20} />,
    },
    {
      title: "OPENINGS",
      value: pickStatValue(
        overview?.openings ?? overview?.total_openings ?? overview?.lowongan,
      ),
      note: pickStatNote(
        overview?.openings ?? overview?.total_openings ?? overview?.lowongan,
        "Data lowongan dari backend",
      ),
      type: "warning",
      icon: <Briefcase size={20} />,
    },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="main-content">

        <section className="content-area">
          <div className="breadcrumb">
            <span>ADMIN</span>
            <span>›</span>
            <span className="active">MASTER DASHBOARD</span>
          </div>

          <h1 className="page-title">Overview Dashboard</h1>

          {errorMessage && (
            <div className="dashboard-alert error">{errorMessage}</div>
          )}

          <div className="stats-grid">
            {stats.map((item, index) => (
              <StatCard key={index} {...item} />
            ))}
          </div>

          <ActivityTable activities={activities} />
        </section>
      </main>
    </div>
  );
}
