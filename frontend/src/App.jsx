import "./index.css";
import "./App.css";
import "./styles/StatCard.css";
import "./styles/ActivityTable.css";
import "./styles/responsiveglobalsuper.css";
import "./styles/admin/global-responsive.css";

import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import ScrollToTop from "./components/common/ScrollToTop";
import FloatingLanguageSwitcher from "./components/common/FloatingLanguageSwitcher";
import GlobalTranslator from "./components/common/GlobalTranslator";
import GlobalModalAlert from "./components/common/GlobalModalAlert";
import Beranda from "./pages/user/Beranda";
import Lowongan from "./pages/user/Lowongan";
import Mitra from "./pages/user/Mitra";
import Kontak from "./pages/user/Kontak";
import Login from "./pages/auth/Login";
import LoginCompany from "./pages/auth/LoginCompany";
import RegisterPelamar from "./pages/auth/RegisterPelamar";
import RegisterCompany from "./pages/auth/RegisterCompany";
import RegisterSuccess from "./pages/auth/RegisterSuccess";
import AdminActivateAccount from "./pages/auth/AdminActivateAccount";
import CheckEmailNotice from "./pages/auth/CheckEmailNotice";
import EmailVerificationStatus from "./pages/auth/EmailVerificationStatus";
import ForgetPassword from "./pages/auth/ForgetPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ResetSuccess from "./pages/auth/ResetSuccess";
import Home from "./pages/user/Home";
import SearchLowongan from "./pages/user/SearchLowongan";
import SearchMitra from "./pages/user/SearchMitra";
import Contact from "./pages/user/Contact";
import MitraDetail from "./pages/user/MitraDetail";
import DaftarPerusahaan from "./pages/user/DaftarPerusahaan";
import DaftarMagang from "./pages/user/DaftarMagang";
import SuccessApply from "./pages/user/SuccessApply";
import ReviewLamaran from "./pages/user/ReviewLamaran";
import ProfilLayout from "./components/layout/ProfilLayout";
import DataDiri from "./pages/user/DataDiri";
import Akademik from "./pages/user/Akademik";
import Dokumen from "./pages/user/Dokumen";
import StatusLamaran from "./pages/user/StatusLamaran";
import Histori from "./pages/user/Histori";
import Pretest from "./pages/user/Pretest";
import Soal from "./pages/user/Soal1";
import SelesaiTest from "./pages/user/SelesaiTest";
import SimpanAkademik from "./pages/user/SimpanAkademik";
import TampilanProfil from "./pages/user/TampilanProfil";
import AfterTest from "./pages/user/AfterTest";
import ReviewJawaban from "./pages/user/ReviewJawaban";

import Dashboard from "./pages/admin/super/Dashboard";
import TalentManagementSuper from "./pages/admin/super/TalentManagement";
import TalentDetail from "./pages/admin/super/TalentDetail";
import ReviewDokumenSuper from "./pages/admin/super/ReviewDokumen";
import PartnerManagement from "./pages/admin/super/PartnerManagement";
import PartnerDetail from "./pages/admin/super/PartnerDetail";
import ReviewDokumenMitra from "./pages/admin/super/ReviewDokumenMitra";
import AddCompany from "./pages/admin/super/AddCompany";
import UserManagement from "./pages/admin/super/UserManagement";
import AddAdmin from "./pages/admin/super/AddAdmin";
import EditAdmin from "./pages/admin/super/EditAdmin";
import CompanyVerification from "./pages/admin/super/CompanyVerification";
import CompanyVerificationReview from "./pages/admin/super/CompanyVerificationReview";
import CompanyDocumentPreview from "./pages/admin/super/CompanyDocumentPreview";
import Profile from "./pages/admin/super/Profile";
import EditProfile from "./pages/admin/super/EditProfile";

import DashboardMitra from "./pages/admin/mitra/DashboardMitra";
import JobPostings from "./pages/admin/mitra/JobPostings";
import CreateJob from "./pages/admin/mitra/CreateJob";
import JobApplicants from "./pages/admin/mitra/JobApplicants";
import TalentManagement from "./pages/admin/mitra/TalentManagementMitra";
import DetailTalent from "./pages/admin/mitra/DetailTalent";
import ReviewDokumen from "./pages/admin/mitra/ReviewDokumenCompany";
import AssessmentReviewAdmin from "./pages/admin/shared/AssessmentReviewAdmin";
import AdminJobPostings from "./pages/admin/shared/AdminJobPostings";
import CompanyProfile from "./pages/admin/mitra/CompanyProfile";
import CompanyProfileSettings from "./pages/admin/mitra/CompanyProfileSettings";

import DashboardStaff from "./pages/admin/staff/DashboardStaff";
import TalentManagementStaff from "./pages/admin/staff/TalentManagement_Staff";
import TalentDetailStaff from "./pages/admin/staff/TalentDetail_Staff";
import ReviewDokumenStaff from "./pages/admin/staff/ReviewDokumen_Staff";

import PartnerManagementStaff from "./pages/admin/staff/PartnerManagement_Staff";
import PartnerDetailStaff from "./pages/admin/staff/PartnerDetail_Staff";
import ReviewDokumenMitraStaff from "./pages/admin/staff/ReviewDokumenMitra_Staff";
import AddCompanyStaff from "./pages/admin/staff/AddCompany_Staff";

import ProfileStaff from "./pages/admin/staff/Profile_Staff";
import EditProfileStaff from "./pages/admin/staff/EditProfile_Staff";
import {
  getUserRole,
  isAuthenticated,
  resolveUserHomeRoute,
} from "./utils/authStorage";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => isAuthenticated(),
  );
  const [role, setRole] = useState(() => getUserRole());
  const normalizedAllowedRoles = allowedRoles.map((allowedRole) =>
    String(allowedRole).toLowerCase(),
  );

  useEffect(() => {
    const syncLoginState = () => {
      setIsLoggedIn(isAuthenticated());
      setRole(getUserRole());
    };

    window.addEventListener("storage", syncLoginState);
    window.addEventListener("auth-changed", syncLoginState);

    return () => {
      window.removeEventListener("storage", syncLoginState);
      window.removeEventListener("auth-changed", syncLoginState);
    };
  }, []);

  if (!isLoggedIn) {
    const loginPath = normalizedAllowedRoles.includes("company")
      ? "/login-company"
      : "/login";

    return <Navigate to={loginPath} replace />;
  }

  if (allowedRoles.length > 0) {
    const normalizedRole = String(role).toLowerCase();
    const hasAccess = normalizedAllowedRoles.some((allowedRole) =>
      normalizedRole === allowedRole,
    );

    if (!hasAccess) {
      return <Navigate to={resolveUserHomeRoute(role)} replace />;
    }
  }

  return children;
}

function GuestRoute({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated());
  const [role, setRole] = useState(() => getUserRole());

  useEffect(() => {
    const syncLoginState = () => {
      setIsLoggedIn(isAuthenticated());
      setRole(getUserRole());
    };

    window.addEventListener("storage", syncLoginState);
    window.addEventListener("auth-changed", syncLoginState);

    return () => {
      window.removeEventListener("storage", syncLoginState);
      window.removeEventListener("auth-changed", syncLoginState);
    };
  }, []);

  if (isLoggedIn) {
    return <Navigate to={resolveUserHomeRoute(role)} replace />;
  }

  return children;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <GlobalTranslator />
      <GlobalModalAlert />
      <FloatingLanguageSwitcher />
      <Routes>
        {/* Route utama dari app pertama */}
        <Route path="/" element={<Beranda />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/login-company"
          element={
            <GuestRoute>
              <LoginCompany />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPelamar />
            </GuestRoute>
          }
        />
        <Route
          path="/register-company"
          element={
            <GuestRoute>
              <RegisterCompany />
            </GuestRoute>
          }
        />
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/admin/activate" element={<AdminActivateAccount />} />
        <Route path="/check-email" element={<CheckEmailNotice />} />
        <Route path="/email-verification" element={<EmailVerificationStatus />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-success" element={<ResetSuccess />} />
        <Route path="/lowongan" element={<Lowongan />} />
        <Route path="/mitra" element={<Mitra />} />
        <Route path="/kontak" element={<Kontak />} />
        <Route path="/daftarperusahaan" element={<DaftarPerusahaan />} />
        <Route
          path="/daftar-magang"
          element={
            <ProtectedRoute allowedRoles={["intern"]}>
              <DaftarMagang />
            </ProtectedRoute>
          }
        />
        <Route
          path="/success-apply"
          element={
            <ProtectedRoute allowedRoles={["intern"]}>
              <SuccessApply />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review-lamaran"
          element={
            <ProtectedRoute allowedRoles={["intern"]}>
              <ReviewLamaran />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil/data-diri"
          element={
            <ProtectedRoute allowedRoles={["intern"]}>
              <DataDiri />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["intern"]}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/searchlowongan"
          element={
            <ProtectedRoute allowedRoles={["intern"]}>
              <SearchLowongan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/searchmitra"
          element={
            <ProtectedRoute allowedRoles={["intern"]}>
              <SearchMitra />
            </ProtectedRoute>
          }
        />
        <Route path="/mitra/:id" element={<MitraDetail />} />
        <Route
          path="/contact"
          element={
            <ProtectedRoute allowedRoles={["intern"]}>
              <Contact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil"
          element={
            <ProtectedRoute allowedRoles={["intern"]}>
              <ProfilLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DataDiri />} />
          <Route path="tampilan" element={<TampilanProfil />} />
          <Route path="data-akademik" element={<Akademik />} />
          <Route path="data-akademik/simpan" element={<SimpanAkademik />} />
          <Route path="dokumen" element={<Dokumen />} />
        </Route>
        <Route
          path="/tampilan-profil"
          element={
            <ProtectedRoute allowedRoles={["intern"]}>
              <TampilanProfil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/status-lamaran"
          element={
            <ProtectedRoute allowedRoles={["intern"]}>
              <StatusLamaran />
            </ProtectedRoute>
          }
        />
        <Route
          path="/after-test"
          element={
            <ProtectedRoute allowedRoles={["intern"]}>
              <AfterTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review-jawaban"
          element={
            <ProtectedRoute allowedRoles={["intern"]}>
              <ReviewJawaban />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pretest"
          element={
            <ProtectedRoute allowedRoles={["intern"]}>
              <Pretest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/histori-lamaran"
          element={
            <ProtectedRoute allowedRoles={["intern"]}>
              <Histori />
            </ProtectedRoute>
          }
        />
        <Route
          path="/soal"
          element={
            <ProtectedRoute allowedRoles={["intern"]}>
              <Navigate to="/soal/1" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/soal/:no"
          element={
            <ProtectedRoute allowedRoles={["intern"]}>
              <Soal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/selesai-test"
          element={
            <ProtectedRoute allowedRoles={["intern"]}>
              <SelesaiTest />
            </ProtectedRoute>
          }
        />
        <Route path="/soal-1" element={<Navigate to="/soal/1" replace />} />
        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/talent-management"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <TalentManagementSuper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/talent/:id"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <TalentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/talent/:id/assessment-review"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <AssessmentReviewAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/talent/:id/review-dokumen"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <ReviewDokumenSuper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/partners"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <PartnerManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/lowongan"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <AdminJobPostings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/partners/add-company"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <AddCompany />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/partners/:id"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <PartnerDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/partners/:id/review-dokumen-mitra"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <ReviewDokumenMitra />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/user-management"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/user-management/add-admin"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <AddAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/user-management/edit-admin/:id"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <EditAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verifikasi-perusahaan"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <CompanyVerification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verifikasi-perusahaan/:id/review"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <CompanyVerificationReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verifikasi-perusahaan/:id/review/dokumen/:docType"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <CompanyDocumentPreview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profil"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profil/edit"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        {/* Legacy redirects for old admin links without /admin prefix */}
        <Route
          path="/talent-management"
          element={<Navigate to="/admin/talent-management" replace />}
        />
        <Route
          path="/partners"
          element={<Navigate to="/admin/partners" replace />}
        />
        <Route
          path="/partners/add-company"
          element={<Navigate to="/admin/partners/add-company" replace />}
        />
        <Route
          path="/user-management"
          element={<Navigate to="/admin/user-management" replace />}
        />
        <Route
          path="/user-management/add-admin"
          element={<Navigate to="/admin/user-management/add-admin" replace />}
        />
        <Route
          path="/verifikasi-perusahaan"
          element={<Navigate to="/admin/verifikasi-perusahaan" replace />}
        />
        <Route path="*" element={<div style={{ padding: 16 }}>404</div>} />
        
        {/* MITRA ROUTES */}
        <Route
          path="/admin/mitra"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <Navigate to="/admin/mitra/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mitra/dashboard"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <DashboardMitra />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mitra/lowongan"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <JobPostings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mitra/lowongan/tambah"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <CreateJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mitra/lowongan/pratinjau"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <Navigate to="/admin/mitra/lowongan/tambah" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mitra/lowongan/applicants"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <JobApplicants />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mitra/company-profile"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <CompanyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mitra/company-profile/settings"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <CompanyProfileSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mitra/talent"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <Navigate to="/admin/mitra/talent/semua-kandidat" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mitra/talent/semua-kandidat"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <TalentManagement mode="all" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mitra/talent/kandidat-terpilih"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <TalentManagement mode="shortlisted" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mitra/talent/:id"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <DetailTalent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mitra/talent/:id/review-dokumen"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <ReviewDokumen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mitra/talent/:id/assessment-review"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <AssessmentReviewAdmin mode="company" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff/talent/:id/assessment-review"
          element={
            <ProtectedRoute allowedRoles={["staff_admin"]}>
              <AssessmentReviewAdmin mode="staff" />
            </ProtectedRoute>
          }
        />
        {/* STAFF ADMIN ROUTES */}
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute allowedRoles={["staff_admin"]}>
              <Navigate to="/admin/staff/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={["staff_admin"]}>
              <DashboardStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff/talent-management"
          element={
            <ProtectedRoute allowedRoles={["staff_admin"]}>
              <TalentManagementStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff/talent/:id"
          element={
            <ProtectedRoute allowedRoles={["staff_admin"]}>
              <TalentDetailStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff/talent/:id/review-dokumen"
          element={
            <ProtectedRoute allowedRoles={["staff_admin"]}>
              <ReviewDokumenStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff/partners"
          element={
            <ProtectedRoute allowedRoles={["staff_admin"]}>
              <PartnerManagementStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff/lowongan"
          element={
            <ProtectedRoute allowedRoles={["staff_admin"]}>
              <AdminJobPostings mode="staff" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff/partners/add-company"
          element={
            <ProtectedRoute allowedRoles={["staff_admin"]}>
              <AddCompanyStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff/partners/:id"
          element={
            <ProtectedRoute allowedRoles={["staff_admin"]}>
              <PartnerDetailStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff/partners/:id/review-dokumen-mitra"
          element={
            <ProtectedRoute allowedRoles={["staff_admin"]}>
              <ReviewDokumenMitraStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff/profil"
          element={
            <ProtectedRoute allowedRoles={["staff_admin"]}>
              <ProfileStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff/profil/edit"
          element={
            <ProtectedRoute allowedRoles={["staff_admin"]}>
              <EditProfileStaff />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
