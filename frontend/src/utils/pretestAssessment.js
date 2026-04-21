import { getScopedItem, USER_STORAGE_KEYS } from "./userScopedStorage";

export const PRETEST_STORAGE_KEYS = {
  answers: USER_STORAGE_KEYS.pretestAnswers,
  questions: USER_STORAGE_KEYS.pretestQuestions,
  completed: USER_STORAGE_KEYS.pretestCompleted,
  startedAt: USER_STORAGE_KEYS.pretestStartedAt,
  readAnswers: () => getScopedItem(USER_STORAGE_KEYS.pretestAnswers),
  readStartedAt: () => getScopedItem(USER_STORAGE_KEYS.pretestStartedAt),
};

export const PRETEST_DURATION_MS = 30 * 60 * 1000;

export const PRETEST_QUESTION_BANK = {
  1: {
    title:
      "Ketika melihat ada pekerjaan yang belum selesai, saya bersedia membantu meskipun itu bukan tugas utama saya.",
    trait: "kolaborasi",
  },
  2: {
    title:
      "Jika saya tidak memahami instruksi kerja, saya akan bertanya untuk memastikan pekerjaan dilakukan dengan benar.",
    trait: "komunikasi",
  },
  3: {
    title:
      "Saya merasa nyaman menyampaikan ide atau pendapat kepada anggota tim.",
    trait: "komunikasi",
  },
  4: {
    title:
      "Jika terjadi perbedaan pendapat dalam tim, saya mencoba berdiskusi untuk mencari solusi terbaik.",
    trait: "kolaborasi",
  },
  5: {
    title:
      "Saya selalu berusaha menyelesaikan tugas tepat waktu sesuai dengan deadline yang diberikan.",
    trait: "disiplin",
  },
  6: {
    title:
      "Ketika menghadapi masalah dalam pekerjaan, saya mencoba mencari solusi terlebih dahulu sebelum meminta bantuan.",
    trait: "inisiatif",
  },
  7: {
    title:
      "Saya terbuka menerima kritik atau saran untuk memperbaiki hasil kerja saya.",
    trait: "adaptabilitas",
  },
  8: {
    title:
      "Saya dapat menyesuaikan diri dengan cepat terhadap lingkungan kerja atau tugas baru.",
    trait: "adaptabilitas",
  },
  9: {
    title:
      "Saya biasanya memeriksa kembali pekerjaan sebelum mengumpulkannya.",
    trait: "ketelitian",
  },
  10: {
    title:
      "Jika tim tidak memiliki pemimpin dalam suatu tugas, saya bersedia membantu mengoordinasikan pekerjaan.",
    trait: "kepemimpinan",
  },
  11: {
    title:
      "Jika saya sudah menyelesaikan pekerjaan lebih cepat dari anggota tim lain, saya biasanya membantu pekerjaan mereka.",
    trait: "kolaborasi",
  },
  12: {
    title:
      "Ketika menerima kritik terhadap pekerjaan saya, saya mencoba memahami maksudnya sebelum merespons.",
    trait: "adaptabilitas",
  },
  13: {
    title:
      "Jika ada tugas yang sulit, saya tetap berusaha menyelesaikannya sebelum meminta bantuan untuk menyerah.",
    trait: "resiliensi",
  },
  14: {
    title:
      "Saya tetap berusaha bekerja dengan baik meskipun tugas yang diberikan tidak terlalu saya sukai.",
    trait: "disiplin",
  },
  15: {
    title:
      "Jika saya melakukan kesalahan dalam pekerjaan, saya akan mengakuinya dan berusaha memperbaikinya.",
    trait: "integritas",
  },
  16: {
    title:
      "Dalam bekerja, saya berusaha memahami tujuan pekerjaan agar hasilnya sesuai dengan yang diharapkan.",
    trait: "ketelitian",
  },
  17: {
    title:
      "Saya merasa penting untuk menjaga komunikasi yang baik dengan anggota tim selama bekerja.",
    trait: "komunikasi",
  },
  18: {
    title:
      "Jika terdapat cara yang lebih efektif untuk menyelesaikan pekerjaan, saya bersedia mencoba cara tersebut.",
    trait: "inisiatif",
  },
  19: {
    title:
      "Saya tetap berusaha menyelesaikan pekerjaan dengan baik meskipun berada dalam tekanan waktu.",
    trait: "resiliensi",
  },
  20: {
    title:
      "Saya merasa bertanggung jawab terhadap hasil pekerjaan yang saya kerjakan, baik secara individu maupun dalam tim.",
    trait: "integritas",
  },
};

const TRAIT_LABELS = {
  adaptabilitas: "adaptabilitas",
  disiplin: "disiplin kerja",
  inisiatif: "inisiatif",
  integritas: "integritas",
  ketelitian: "ketelitian",
  kolaborasi: "kolaborasi",
  komunikasi: "komunikasi",
  kepemimpinan: "kepemimpinan",
  resiliensi: "daya tahan kerja",
};

function readStoredJson(key, fallbackValue) {
  try {
    const storedValue = getScopedItem(key);
    return storedValue ? JSON.parse(storedValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function normalizeAnswer(answer) {
  const normalized = String(answer || "").trim().toLowerCase();

  if (normalized === "iya" || normalized === "ya") return "Iya";
  if (normalized === "tidak") return "Tidak";
  return "Belum dijawab";
}

function getOtherOption(answer) {
  const normalized = String(answer || "").trim().toLowerCase();

  if (normalized === "iya" || normalized === "ya") return "Tidak";
  if (normalized === "tidak") return "Iya";
  return "-";
}

function getTraitBreakdown(reviewList) {
  const traitStats = reviewList.reduce((accumulator, item) => {
    if (!item.trait) return accumulator;

    if (!accumulator[item.trait]) {
      accumulator[item.trait] = {
        key: item.trait,
        label: TRAIT_LABELS[item.trait] || item.trait,
        total: 0,
        yes: 0,
      };
    }

    accumulator[item.trait].total += 1;
    const normalizedAnswer = String(item.rawAnswer || "").trim().toLowerCase();

    if (normalizedAnswer === "iya" || normalizedAnswer === "ya") {
      accumulator[item.trait].yes += 1;
    }

    return accumulator;
  }, {});

  return Object.values(traitStats)
    .map((item) => ({
      ...item,
      score: item.total ? item.yes / item.total : 0,
    }))
    .sort((first, second) => second.score - first.score);
}

export function getPretestReviewList() {
  const storedQuestions = readStoredJson(
    PRETEST_STORAGE_KEYS.questions,
    PRETEST_QUESTION_BANK,
  );
  const storedAnswers = readStoredJson(PRETEST_STORAGE_KEYS.answers, {});

  const mergedQuestions = {
    ...PRETEST_QUESTION_BANK,
    ...storedQuestions,
  };

  return Object.keys(mergedQuestions)
    .map((key) => {
      const number = Number(key);
      const question = mergedQuestions[key] || PRETEST_QUESTION_BANK[key] || {};
      const rawAnswer = storedAnswers[key] || "";

      return {
        number,
        no: number,
        trait: question.trait || PRETEST_QUESTION_BANK[key]?.trait || "",
        question: question.title || "Pertanyaan tidak tersedia",
        pertanyaan: question.title || "Pertanyaan tidak tersedia",
        rawAnswer,
        selected: normalizeAnswer(rawAnswer),
        pilihan: normalizeAnswer(rawAnswer),
        other: getOtherOption(rawAnswer),
        opsiLain: getOtherOption(rawAnswer),
      };
    })
    .sort((first, second) => first.number - second.number);
}

export function getPretestSummary(reviewList = getPretestReviewList()) {
  const totalQuestions = reviewList.length;
  const answeredCount = reviewList.filter(
    (item) => {
      const normalizedAnswer = String(item.rawAnswer || "").trim().toLowerCase();
      return normalizedAnswer === "iya" || normalizedAnswer === "ya" || normalizedAnswer === "tidak";
    },
  ).length;
  const yesCount = reviewList.filter((item) => {
    const normalizedAnswer = String(item.rawAnswer || "").trim().toLowerCase();
    return normalizedAnswer === "iya" || normalizedAnswer === "ya";
  }).length;
  const noCount = reviewList.filter((item) => {
    const normalizedAnswer = String(item.rawAnswer || "").trim().toLowerCase();
    return normalizedAnswer === "tidak";
  }).length;
  const traitBreakdown = getTraitBreakdown(reviewList);
  const strongestTraits = traitBreakdown.filter((item) => item.score >= 0.75);
  const growingTraits = traitBreakdown.filter((item) => item.score <= 0.5);

  let summaryText =
    "Belum ada cukup data jawaban untuk membentuk ringkasan karakter kandidat.";

  if (answeredCount > 0) {
    const answeredRatio = answeredCount / totalQuestions;
    const strongestLabels = strongestTraits
      .slice(0, 3)
      .map((item) => item.label);
    const growingLabels = growingTraits
      .slice(0, 2)
      .map((item) => item.label);

    const opening =
      yesCount >= noCount
        ? "Kandidat cenderung menunjukkan respons yang positif dan proaktif selama pre-test."
        : "Kandidat menunjukkan kecenderungan yang cukup berhati-hati dalam merespons situasi kerja pada pre-test.";

    const coverage =
      answeredRatio === 1
        ? "Seluruh pertanyaan assessment telah dijawab."
        : `Sebanyak ${answeredCount} dari ${totalQuestions} pertanyaan sudah dijawab.`;

    const strengths =
      strongestLabels.length > 0
        ? `Area yang paling menonjol terlihat pada ${strongestLabels.join(", ")}.`
        : "Belum ada area dominan yang benar-benar konsisten muncul dari jawaban saat ini.";

    const development =
      growingLabels.length > 0
        ? `Sisi yang masih perlu diamati lebih lanjut adalah ${growingLabels.join(", ")}.`
        : "Tidak terlihat area lemah yang menonjol dari jawaban yang sudah masuk.";

    summaryText = [opening, coverage, strengths, development].join(" ");
  }

  return {
    totalQuestions,
    answeredCount,
    yesCount,
    noCount,
    traitBreakdown,
    strongestTraits,
    growingTraits,
    summaryText,
  };
}
