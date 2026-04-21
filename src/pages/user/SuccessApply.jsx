import { useNavigate } from "react-router-dom";
import "../../styles/successapply.css";

export default function SuccessApply() {
  const navigate = useNavigate();

  return (
    <div className="sa-page">
      <main className="sa-main">
        <div className="sa-card">
          <div className="sa-icon">
            <img src="/logovocaseek2.png" alt="Vocaseek Logo" />
          </div>

          <h2>Lamaran Berhasil!</h2>

          <p>
            Terima kasih sudah melamar. Kami akan meninjau lamaran kamu
            dan menghubungi jika lolos ke tahap berikutnya.
          </p>

          <div className="sa-buttons">
            <button className="sa-back" onClick={() => navigate("/home")}>
              Kembali ke Beranda
            </button>

            <button className="sa-next" onClick={() => navigate("/searchlowongan")}>
              Lihat Lowongan Lain
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
