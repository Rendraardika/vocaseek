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
    titleId:
      "Ketika melihat ada pekerjaan yang belum selesai, saya bersedia membantu meskipun itu bukan tugas utama saya.",
    titleEn:
      "When I see unfinished work, I am willing to help even if it is not my main responsibility.",
    trait: "kolaborasi",
  },
  2: {
    titleId:
      "Jika saya tidak memahami instruksi kerja, saya akan bertanya untuk memastikan pekerjaan dilakukan dengan benar.",
    titleEn:
      "If I do not understand work instructions, I will ask questions to make sure the task is done correctly.",
    trait: "komunikasi",
  },
  3: {
    titleId:
      "Saya merasa nyaman menyampaikan ide atau pendapat kepada anggota tim.",
    titleEn: "I feel comfortable sharing ideas or opinions with team members.",
    trait: "komunikasi",
  },
  4: {
    titleId:
      "Jika terjadi perbedaan pendapat dalam tim, saya mencoba berdiskusi untuk mencari solusi terbaik.",
    titleEn:
      "If there is a difference of opinion within the team, I try to discuss it to find the best solution.",
    trait: "kolaborasi",
  },
  5: {
    titleId:
      "Saya selalu berusaha menyelesaikan tugas tepat waktu sesuai dengan deadline yang diberikan.",
    titleEn:
      "I always try to complete tasks on time according to the given deadline.",
    trait: "disiplin",
  },
  6: {
    titleId:
      "Ketika menghadapi masalah dalam pekerjaan, saya mencoba mencari solusi terlebih dahulu sebelum meminta bantuan.",
    titleEn:
      "When facing problems at work, I try to find a solution first before asking for help.",
    trait: "inisiatif",
  },
  7: {
    titleId:
      "Saya terbuka menerima kritik atau saran untuk memperbaiki hasil kerja saya.",
    titleEn:
      "I am open to receiving criticism or suggestions to improve my work.",
    trait: "adaptabilitas",
  },
  8: {
    titleId:
      "Saya dapat menyesuaikan diri dengan cepat terhadap lingkungan kerja atau tugas baru.",
    titleEn:
      "I can adapt quickly to a new work environment or new tasks.",
    trait: "adaptabilitas",
  },
  9: {
    titleId:
      "Saya biasanya memeriksa kembali pekerjaan sebelum mengumpulkannya.",
    titleEn: "I usually review my work before submitting it.",
    trait: "ketelitian",
  },
  10: {
    titleId:
      "Jika tim tidak memiliki pemimpin dalam suatu tugas, saya bersedia membantu mengoordinasikan pekerjaan.",
    titleEn:
      "If the team does not have a leader for a task, I am willing to help coordinate the work.",
    trait: "kepemimpinan",
  },
  11: {
    titleId:
      "Jika saya sudah menyelesaikan pekerjaan lebih cepat dari anggota tim lain, saya biasanya membantu pekerjaan mereka.",
    titleEn:
      "If I finish my work faster than other team members, I usually help with their work.",
    trait: "kolaborasi",
  },
  12: {
    titleId:
      "Ketika menerima kritik terhadap pekerjaan saya, saya mencoba memahami maksudnya sebelum merespons.",
    titleEn:
      "When receiving criticism about my work, I try to understand it before responding.",
    trait: "adaptabilitas",
  },
  13: {
    titleId:
      "Jika ada tugas yang sulit, saya tetap berusaha menyelesaikannya sebelum meminta bantuan untuk menyerah.",
    titleEn:
      "If there is a difficult task, I still try to complete it before asking for help or giving up.",
    trait: "resiliensi",
  },
  14: {
    titleId:
      "Saya tetap berusaha bekerja dengan baik meskipun tugas yang diberikan tidak terlalu saya sukai.",
    titleEn:
      "I still try to work well even when the assigned task is not something I particularly like.",
    trait: "disiplin",
  },
  15: {
    titleId:
      "Jika saya melakukan kesalahan dalam pekerjaan, saya akan mengakuinya dan berusaha memperbaikinya.",
    titleEn:
      "If I make a mistake at work, I will admit it and try to fix it.",
    trait: "integritas",
  },
  16: {
    titleId:
      "Dalam bekerja, saya berusaha memahami tujuan pekerjaan agar hasilnya sesuai dengan yang diharapkan.",
    titleEn:
      "At work, I try to understand the goal of the task so the result matches expectations.",
    trait: "ketelitian",
  },
  17: {
    titleId:
      "Saya merasa penting untuk menjaga komunikasi yang baik dengan anggota tim selama bekerja.",
    titleEn:
      "I believe it is important to maintain good communication with team members while working.",
    trait: "komunikasi",
  },
  18: {
    titleId:
      "Jika terdapat cara yang lebih efektif untuk menyelesaikan pekerjaan, saya bersedia mencoba cara tersebut.",
    titleEn:
      "If there is a more effective way to complete a task, I am willing to try that approach.",
    trait: "inisiatif",
  },
  19: {
    titleId:
      "Saya tetap berusaha menyelesaikan pekerjaan dengan baik meskipun berada dalam tekanan waktu.",
    titleEn:
      "I continue trying to complete work well even when under time pressure.",
    trait: "resiliensi",
  },
  20: {
    titleId:
      "Saya merasa bertanggung jawab terhadap hasil pekerjaan yang saya kerjakan, baik secara individu maupun dalam tim.",
    titleEn:
      "I feel responsible for the outcomes of the work I do, both individually and as part of a team.",
    trait: "integritas",
  },
};

export function getPretestQuestionText(question, locale = "id") {
  if (!question) {
    return locale === "en" ? "Question unavailable" : "Pertanyaan tidak tersedia";
  }

  if (locale === "en") {
    return question.titleEn || question.title || question.titleId || "Question unavailable";
  }

  return question.titleId || question.title || question.titleEn || "Pertanyaan tidak tersedia";
}

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
        question: getPretestQuestionText(question, "id"),
        questionId: getPretestQuestionText(question, "id"),
        questionEn: getPretestQuestionText(question, "en"),
        pertanyaan: getPretestQuestionText(question, "id"),
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
