import { useState } from "react";

export default function ProcessSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const data = [
    {
      title: "Pendaftaran & Pembuatan Profil",
      desc: "Pengguna membuat akun dan melengkapi profil.",
    },
    {
      title: "Eksplorasi & Lamar Posisi",
      desc: "Pengguna menjelajahi lowongan dan melamar posisi.",
    },
    {
      title: "Proses Seleksi",
      desc: "Perusahaan melakukan seleksi kandidat.",
    },
    {
      title: "Wawancara & Penempatan",
      desc: "Kandidat mengikuti wawancara hingga penempatan.",
    },
  ];

  return (
    <div className="process-left">
      <span className="process-label">PROSES KERJA VOCASEEK</span>
      <h2>Bagaimana Vocaseek Bekerja</h2>

      <div className="process-list">
        {data.map((item, index) => (
          <div
            key={index}
            className={`process-item ${
              activeIndex === index ? "active" : ""
            }`}
          >
            <div
              className="process-header"
              onClick={() => setActiveIndex(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}.</span>
              <h4>{item.title}</h4>
              <span>{activeIndex === index ? "−" : "+"}</span>
            </div>

            {activeIndex === index && <p>{item.desc}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}