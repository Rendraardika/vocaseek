import api from "../lib/api";

export function getLandingStats() {
  return api.get("/landing-stats");
}

export function getPopularVacancies() {
  return api.get("/popular-vacancies");
}

export function testApiConnection() {
  return api.get("/test");
}
