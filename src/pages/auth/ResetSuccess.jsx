import "../../styles/resetsuccess.css";
import { Link } from "react-router-dom";

export default function ResetSuccess(){

return(

<div className="rsu-page">

  <div className="rsu-logo">
    <img src="/vocaseeklogo.png" alt="Vocaseek"/>
  </div>

  <div className="rsu-card">

    <div className="rsu-icon">
      ✓
    </div>

    <h2>Kata Sandi <br/> Berhasil Diperbarui</h2>

    <p>
      Kata sandi berhasil diubah. Anda dapat masuk
      menggunakan kata sandi baru.
    </p>

    <Link to="/login" className="rsu-btn">
      Kembali Ke Login
    </Link>

  </div>

  <div className="rsu-footer">
    © 2026 VOKASIK INC. ALL RIGHTS RESERVED.
  </div>

</div>

)

}