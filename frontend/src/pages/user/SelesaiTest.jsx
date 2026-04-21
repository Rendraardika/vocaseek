import { useNavigate } from "react-router-dom";
import "../../styles/SelesaiTest.css";
import { setScopedItem, USER_STORAGE_KEYS } from "../../utils/userScopedStorage";

export default function SelesaiTest() {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    setScopedItem(USER_STORAGE_KEYS.pretestCompleted, "true");
    navigate("/pretest");
  };

  return (
    <div className="selesai-page">
      <header className="selesai-header">
        <div className="selesai-header-inner">
          <div className="selesai-logo-wrap">
            <img
              src="/vocaseeklogo.png"
              alt="Vocaseek"
              className="selesai-logo"
            />
          </div>

          <div className="selesai-badge">SELESAI</div>
        </div>
      </header>

      <main className="selesai-main">
        <section className="selesai-card">
          <h1 className="selesai-title">
            Selamat, Anda Telah Menyelesaikan Tes!
          </h1>

          <div className="selesai-status">
            <span className="selesai-status-text">Sangat Baik</span>
          </div>

          <p className="selesai-desc">
            Hasil asesmen Anda menunjukkan potensi yang sangat kuat dalam
            penyelesaian masalah dan perilaku profesional. Tim rekrutmen kami
            akan meninjau profil Anda dan menghubungi Anda kembali dalam waktu
            3-5 hari kerja untuk tahap wawancara magang selanjutnya.
          </p>

          <button
            type="button"
            className="selesai-dashboard-btn"
            onClick={handleBackToDashboard}
          >
            Kembali
          </button>
        </section>
      </main>

      <footer className="selesai-footer">
        © 2024 Vocaseek Education. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  );
}
