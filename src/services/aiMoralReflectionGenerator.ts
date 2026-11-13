/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MoralAISynthesis,
  MoralFeedbackRecord,
  MORAL_CATEGORY_LABELS
} from '../types/inspiro';

/**
 * Menghasilkan Cermin Refleksi AI Pengawas dari kumpulan pesan moral & barometer 360°.
 * Memanggil endpoint backend aman `/api/gemini/moral-reflection` agar API key tidak pernah
 * terekspos di browser, dengan fallback sintesis kontekstual empatik apabila offline/terbatas.
 */
export async function generateMoralReflectionSynthesis(
  records: MoralFeedbackRecord[],
  supervisorName: string
): Promise<MoralAISynthesis> {
  if (!records || records.length === 0) {
    return buildContextualFallbackSynthesis([], supervisorName);
  }

  try {
    const response = await fetch('/api/gemini/moral-reflection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        supervisorName,
        records: records.slice(0, 30).map((r) => ({
          category: MORAL_CATEGORY_LABELS[r.category]?.label || r.category,
          sourceChannel: r.sourceChannel,
          senderRole: r.senderRole,
          barometer: r.barometer,
          message: r.message,
          specificMoment: r.specificMoment || ''
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const parsed = (await response.json()) as Partial<MoralAISynthesis>;
    return {
      generatedAt: parsed.generatedAt || new Date().toISOString(),
      overallTone:
        parsed.overallTone ||
        'Kehadiran pengawas dirasakan hangat, namun ruang dialog empatik perlu terus dirawat.',
      keyStrengthsToKeep:
        Array.isArray(parsed.keyStrengthsToKeep) && parsed.keyStrengthsToKeep.length > 0
          ? parsed.keyStrengthsToKeep
          : ['Menjaga sikap tenang dan memuliakan guru di dalam kelas.'],
      blindSpotsToWatch:
        Array.isArray(parsed.blindSpotsToWatch) && parsed.blindSpotsToWatch.length > 0
          ? parsed.blindSpotsToWatch
          : ['Mengelola tempo kunjungan agar guru tidak merasa terburu-buru saat refleksi.'],
      personalCommitments:
        Array.isArray(parsed.personalCommitments) && parsed.personalCommitments.length > 0
          ? parsed.personalCommitments
          : ['Mengawali setiap sesi pasca-observasi dengan 10 menit mendengarkan aktif tanpa gawai.'],
      closingReflection:
        parsed.closingReflection ||
        'Supervisi yang paling membekas adalah ketika pendidik merasa dimanusiakan, didengar, dan pulang dengan harapan baru.'
    };
  } catch (err) {
    console.warn('Cermin Refleksi AI menggunakan sintesis kontekstual lokal:', err);
    return buildContextualFallbackSynthesis(records, supervisorName);
  }
}

function buildContextualFallbackSynthesis(
  records: MoralFeedbackRecord[],
  supervisorName: string
): MoralAISynthesis {
  const count = records.length;
  if (count === 0) {
    return {
      generatedAt: new Date().toISOString(),
      overallTone: `Belum ada suara hati yang masuk untuk ${supervisorName}. Bagikan Pintu Mandiri Guru atau rekam catatan lapangan agar Cermin Refleksi dapat bekerja.`,
      keyStrengthsToKeep: [
        'Membuka ruang aman tanpa penghakiman sejak menit pertama tiba di sekolah.',
        'Menghargai ikhtiar kecil guru sebelum membahas area pengembangan.'
      ],
      blindSpotsToWatch: [
        'Waspadai kecenderungan langsung membuka instrumen penilaian sebelum membangun keakraban psikologis.'
      ],
      personalCommitments: [
        'Membuka Pintu Suara Hati di akhir setiap kunjungan agar umpan balik jujur tetap mengalir.'
      ],
      closingReflection:
        'Kualitas pengawas pembina diukur bukan dari banyaknya kesalahan yang ditemukan, melainkan dari seberapa besar keberanian bertumbuh yang tumbuh di hati para pendidik.'
    };
  }

  const avg = (key: keyof MoralFeedbackRecord['barometer']) =>
    records.reduce((acc, r) => acc + (r.barometer[key] || 0), 0) / count;

  const scores = [
    { key: 'menenangkan', label: 'Menenangkan & Aman Psikologis', val: avg('menenangkan') },
    { key: 'mendengarkan', label: 'Mau Mendengarkan Sebelum Menilai', val: avg('mendengarkan') },
    { key: 'solutif', label: 'Memberi Solusi Nyata (Tanpa Beban Tambahan)', val: avg('solutif') },
    { key: 'memuliakan', label: 'Memuliakan Profesi & Martabat Pendidik', val: avg('memuliakan') }
  ].sort((a, b) => b.val - a.val);

  const strongest = scores[0];
  const lowest = scores[scores.length - 1];
  const nasihatCount = records.filter((r) => r.category === 'nasihat_pengingat').length;
  const baruCount = records.filter((r) => r.status === 'baru').length;

  return {
    generatedAt: new Date().toISOString(),
    overallTone: `Dari ${count} suara hati pendidik yang terekam, kehadiran ${supervisorName} dirasakan paling kuat pada dimensi "${strongest.label}" (rerata ${strongest.val.toFixed(
      2
    )}/5.00), sementara dimensi "${lowest.label}" (${lowest.val.toFixed(
      2
    )}/5.00) menjadi ruang penyempurnaan adab pendampingan berikutnya.`,
    keyStrengthsToKeep: [
      `Dimensi ${strongest.label} mendapat kepercayaan tertinggi (${strongest.val.toFixed(
        2
      )}/5.00) dan menumbuhkan rasa aman guru saat didampingi.`,
      'Pendekatan dialogis yang mengedepankan solusi praktis kelas dibandingkan beban administrasi tambahan.',
      'Keterbukaan menerima pesan moral secara anonim maupun terbuka menunjukkan teladan kepemimpinan pembelajar.'
    ],
    blindSpotsToWatch: [
      `Berikan perhatian lebih pada aspek "${lowest.label}" (${lowest.val.toFixed(
        2
      )}/5.00) agar ritme kunjungan tidak terasa terburu-buru.`,
      nasihatCount > 0
        ? `Terdapat ${nasihatCount} pesan kategori Nasihat & Pengingat Moral yang perlu dibaca perlahan sebagai cermin kerendahan hati.`
        : 'Pastikan guru di kelas terpencil atau guru junior mendapat kesempatan bicara yang setara dengan tim inti sekolah.',
      baruCount > 0
        ? `Masih ada ${baruCount} pesan berstatus "Baru" yang menanti refleksi dan komitmen pribadi pengawas.`
        : 'Jaga konsistensi menuliskan komitmen tindak lanjut agar suara hati pendidik tidak berhenti sebagai catatan pasif.'
    ],
    personalCommitments: [
      'Menyediakan minimal 10–15 menit jeda mendengarkan cerita batin guru tanpa membuka rubrik atau laptop pada awal sesi pasca-observasi.',
      'Mengakhiri setiap kunjungan dengan satu apresiasi tulus yang spesifik dan satu langkah kecil paling ringan untuk dipraktikkan besok.',
      'Meninjau ulang komitmen refleksi diri sebelum memasuki gerbang sekolah binaan berikutnya.'
    ],
    closingReflection:
      'Menjadi pengawas yang dijiwai berarti datang sebagai sahabat bertumbuh, mendengar dengan hati yang lapang, dan pulang meninggalkan ketenangan serta harapan baru di ruang kelas.'
  };
}
