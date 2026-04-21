import {
  getCompanyCandidateDetail,
  getCompanyCandidates,
} from "../services/companyTalent";

function extractCandidateCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.candidates)) return payload.candidates;
  if (Array.isArray(payload?.talents)) return payload.talents;
  return [];
}

function buildDisplayId(item, fallbackIndex = 0) {
  const displayId =
    item?.id_talenta ||
    item?.candidate_code ||
    item?.kode_kandidat ||
    item?.candidate_label ||
    item?.candidate_code ||
    item?.candidate_id ||
    item?.application_id ||
    item?.lamaran_id ||
    item?.job_application_id ||
    item?.application_id ||
    item?.user_id ||
    item?.id ||
    fallbackIndex + 1;

  if (typeof displayId === "string" && displayId.toUpperCase().startsWith("KDT-")) {
    return displayId.toUpperCase();
  }

  return `KDT-${String(displayId).padStart(3, "0")}`;
}

function parseDisplayId(value) {
  const normalized = String(value || "").trim().toUpperCase();
  const match = normalized.match(/^KDT-(\d+)$/);
  return match ? String(Number(match[1])) : "";
}

function extractCandidateDetail(payload) {
  if (!payload || Array.isArray(payload)) {
    return payload;
  }

  return (
    payload?.data?.candidate ||
    payload?.data?.applicant ||
    payload?.data?.talent ||
    payload?.data?.application ||
    payload?.data?.user ||
    payload?.candidate ||
    payload?.applicant ||
    payload?.talent ||
    payload?.application ||
    payload?.user ||
    payload?.data ||
    payload
  );
}

function resolveCanonicalId(item, fallbackId) {
  return (
    item?.application_id ||
    item?.lamaran_id ||
    item?.job_application_id ||
    item?.application?.application_id ||
    item?.id ||
    parseDisplayId(item?.candidate_code) ||
    parseDisplayId(item?.id_talenta) ||
    parseDisplayId(item?.kode_kandidat) ||
    parseDisplayId(item?.id) ||
    parseDisplayId(item?.candidate_id) ||
    parseDisplayId(item?.application_id) ||
    parseDisplayId(item?.user_id) ||
    item?.candidate_id ||
    item?.talent_id ||
    item?.user_id ||
    item?.user?.user_id ||
    parseDisplayId(fallbackId) ||
    fallbackId
  );
}

function collectIdentifiers(item, index = 0) {
  return [
    item?.application_id,
    item?.lamaran_id,
    item?.job_application_id,
    item?.application?.application_id,
    item?.id_talenta,
    item?.candidate_code,
    item?.kode_kandidat,
    item?.candidate_id,
    item?.talent_id,
    item?.user_id,
    item?.id,
    item?.user?.user_id,
    buildDisplayId(item, index),
  ]
    .filter(Boolean)
    .map((value) => String(value).toUpperCase());
}

function mergeCandidateData(primary = {}, fallback = {}) {
  const primaryUser = primary?.user || {};
  const fallbackUser = fallback?.user || {};
  const primaryPersonal = primary?.personal || {};
  const fallbackPersonal = fallback?.personal || {};
  const primaryAcademic = primary?.academic || {};
  const fallbackAcademic = fallback?.academic || {};
  const primaryAssessment = primary?.assessment || {};
  const fallbackAssessment = fallback?.assessment || {};
  const primaryDocuments = primary?.documents || {};
  const fallbackDocuments = fallback?.documents || {};
  const mergedUser = {
    ...fallbackUser,
    ...primaryUser,
  };

  return {
    ...fallback,
    ...primary,
    user: mergedUser,
    internProfile:
      primary?.internProfile ||
      primary?.intern_profile ||
      primaryUser?.internProfile ||
      primaryUser?.intern_profile ||
      fallback?.internProfile ||
      fallback?.intern_profile ||
      fallbackUser?.internProfile ||
      fallbackUser?.intern_profile,
    intern_profile:
      primary?.intern_profile ||
      primary?.internProfile ||
      primaryUser?.intern_profile ||
      primaryUser?.internProfile ||
      fallback?.intern_profile ||
      fallback?.internProfile ||
      fallbackUser?.intern_profile ||
      fallbackUser?.internProfile,
    profile:
      primary?.profile ||
      primary?.internProfile ||
      primary?.intern_profile ||
      primaryUser?.internProfile ||
      primaryUser?.intern_profile ||
      fallback?.profile ||
      fallback?.internProfile ||
      fallback?.intern_profile ||
      fallbackUser?.internProfile ||
      fallbackUser?.intern_profile,
    personal: {
      ...fallbackPersonal,
      ...primaryPersonal,
      socials: {
        ...(fallbackPersonal?.socials || {}),
        ...(primaryPersonal?.socials || {}),
      },
    },
    academic:
      Object.keys(primaryAcademic).length || Object.keys(fallbackAcademic).length
        ? {
            ...fallbackAcademic,
            ...primaryAcademic,
            education: {
              ...(fallbackAcademic?.education || {}),
              ...(primaryAcademic?.education || {}),
            },
          }
        : primary?.academic ||
          primary?.akademik ||
          primary?.profile?.academic ||
          primaryUser?.academic ||
          primaryUser?.akademik ||
          fallback?.academic ||
          fallback?.akademik ||
          fallback?.profile?.academic ||
          fallbackUser?.academic ||
          fallbackUser?.akademik,
    assessment: {
      ...fallbackAssessment,
      ...primaryAssessment,
      answers:
        primaryAssessment?.answers ||
        primaryAssessment?.pretest_answers ||
        primaryAssessment?.review_jawaban ||
        fallbackAssessment?.answers ||
        fallbackAssessment?.pretest_answers ||
        fallbackAssessment?.review_jawaban,
    },
    documents: {
      ...fallbackDocuments,
      ...primaryDocuments,
    },
  };
}

export async function resolveCompanyCandidateDetail(id) {
  const normalizedId = String(id || "").toUpperCase();
  const listResponse = await getCompanyCandidates();
  const payload = listResponse?.data?.data || listResponse?.data || {};
  const collection = extractCandidateCollection(payload);

  const matchedFromList =
    collection.find((item, index) =>
      collectIdentifiers(item, index).includes(normalizedId),
    ) || null;

  const idsToTry = [
    matchedFromList?.application_id,
    matchedFromList?.lamaran_id,
    matchedFromList?.job_application_id,
    matchedFromList?.application?.application_id,
    matchedFromList?.id,
    parseDisplayId(id),
    matchedFromList?.candidate_id,
    matchedFromList?.talent_id,
    matchedFromList?.user_id,
    matchedFromList?.user?.user_id,
    id,
  ]
    .filter(Boolean)
    .map((value) => String(value));

  let detailPayload = null;
  let lastError = null;

  for (const candidateId of idsToTry) {
    try {
      const detailResponse = await getCompanyCandidateDetail(candidateId);
      detailPayload = extractCandidateDetail(detailResponse?.data);
      if (detailPayload) {
        break;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (!detailPayload && !matchedFromList && lastError) {
    throw lastError;
  }

  if (!detailPayload) {
    return matchedFromList
      ? {
          ...matchedFromList,
          __resolvedId: resolveCanonicalId(matchedFromList, id),
        }
      : matchedFromList;
  }

  return {
    ...mergeCandidateData(detailPayload, matchedFromList),
    __resolvedId: resolveCanonicalId(detailPayload, resolveCanonicalId(matchedFromList, id)),
  };
}
