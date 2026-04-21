import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/SimpanAkademik.css";
import {
  getScopedItem,
  setScopedItem,
  USER_STORAGE_KEYS,
} from "../../utils/userScopedStorage";

const defaultAkademik = {
  pendidikan: {
    institusi: "",
    jurusan: "",
    tahunLulus: "",
    ipk: "",
  },
  pengalaman: [],
  sertifikasi: [],
};

export default function SimpanAkademik() {
  const navigate = useNavigate();
  const location = useLocation();
  const [akademikData, setAkademikData] = useState(defaultAkademik);

  useEffect(() => {
    const loadAkademik = () => {
      const savedData = getScopedItem(USER_STORAGE_KEYS.akademik);

      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setAkademikData({
            ...defaultAkademik,
            ...parsedData,
            pendidikan: {
              ...defaultAkademik.pendidikan,
              ...(parsedData.pendidikan || {}),
            },
            pengalaman: Array.isArray(parsedData.pengalaman)
              ? parsedData.pengalaman
              : [],
            sertifikasi: Array.isArray(parsedData.sertifikasi)
              ? parsedData.sertifikasi
              : [],
          });
        } catch (error) {
          console.error("Gagal membaca data akademik tersimpan:", error);
          setAkademikData(defaultAkademik);
        }
      } else {
        setAkademikData(defaultAkademik);
      }
    };

    loadAkademik();
  }, [location.key]);

  const handleEditAkademik = () => {
    setScopedItem(USER_STORAGE_KEYS.akademikEditMode, "true");
    navigate("/profil/data-akademik");
  };

  const pendidikan = useMemo(
    () => akademikData.pendidikan || defaultAkademik.pendidikan,
    [akademikData]
  );

  return (
    <div className="sa-wrap">
      <div className="sa-card">
        <div className="sa-headerRow">
          <div>
            <h1 className="sa-title">Informasi Akademik</h1>
            <p className="sa-desc">
              Pastikan informasi akademik terisi dengan benar untuk mempermudah
              proses pendaftaran dan verifikasi profil Anda oleh mitra
              perusahaan kami.
            </p>
          </div>

          <button
            type="button"
            className="sa-editBtn"
            onClick={handleEditAkademik}
            aria-label="Edit data akademik"
            title="Edit data akademik"
          >
            ✎
          </button>
        </div>

        <div className="sa-grid">
          <div className="sa-item">
            <div className="sa-label">INSTITUSI PENDIDIKAN</div>
            <div className="sa-value">{pendidikan.institusi || "-"}</div>
          </div>

          <div className="sa-item">
            <div className="sa-label">JURUSAN</div>
            <div className="sa-value">{pendidikan.jurusan || "-"}</div>
          </div>

          <div className="sa-item">
            <div className="sa-label">TAHUN LULUS / PERKIRAAN</div>
            <div className="sa-value">{pendidikan.tahunLulus || "-"}</div>
          </div>

          <div className="sa-item">
            <div className="sa-label">IPK / GPA</div>
            <div className="sa-value">{pendidikan.ipk || "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
