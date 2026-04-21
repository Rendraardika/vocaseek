import api from "../lib/api";

const COMPANY_TALENT_BASE = "/company/talent";

export function getCompanyCandidates() {
  return api.get(`${COMPANY_TALENT_BASE}/candidates`);
}

export function getCompanyCandidateDetail(id) {
  return api.get(`${COMPANY_TALENT_BASE}/candidates/${id}/detail`);
}

export function createManualCompanyCandidate(payload) {
  return api.post(`${COMPANY_TALENT_BASE}/candidates/manual`, payload);
}

export function updateCompanyCandidateStatus(id, payload) {
  return api.put(`${COMPANY_TALENT_BASE}/candidates/${id}/status`, payload);
}

export function getSelectedCompanyCandidates() {
  return api.get(`${COMPANY_TALENT_BASE}/selected`);
}
