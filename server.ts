/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Server-side Gemini AI route: Cermin Refleksi 360° & Pesan Moral Pengawas
  app.post('/api/gemini/moral-reflection', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim().length < 10) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY_NOT_CONFIGURED',
          message: 'Kunci API Gemini belum dikonfigurasi pada server.'
        });
      }

      const { supervisorName, feedbacks, records } = req.body as {
        supervisorName?: string;
        feedbacks?: Array<{
          schoolName?: string;
          senderRole: string;
          category: string;
          averageScore?: number;
          barometer?: { menenangkan: number; mendengarkan: number; solutif: number; memuliakan: number };
          message: string;
          specificMoment?: string;
        }>;
        records?: Array<{
          schoolName?: string;
          senderRole: string;
          category: string;
          averageScore?: number;
          barometer?: { menenangkan: number; mendengarkan: number; solutif: number; memuliakan: number };
          message: string;
          specificMoment?: string;
        }>;
      };

      const items = Array.isArray(records) && records.length > 0 ? records : feedbacks;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          error: 'EMPTY_FEEDBACKS',
          message: 'Belum ada data pesan moral untuk direfleksikan.'
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const condensedList = items
        .slice(0, 25)
        .map((f, idx) => {
          const score =
            typeof f.averageScore === 'number'
              ? f.averageScore
              : f.barometer
              ? (f.barometer.menenangkan + f.barometer.mendengarkan + f.barometer.solutif + f.barometer.memuliakan) / 4
              : 5;
          return `${idx + 1}. [${f.schoolName || 'Sekolah Binaan'} | ${f.senderRole} | Kategori: ${f.category} | Skor Rasa: ${score.toFixed(1)}/5]${f.specificMoment ? ` (Momen: ${f.specificMoment})` : ''}: "${f.message}"`;
        })
        .join('\n');

      const prompt = `Anda adalah mentor refleksi etik dan kepemimpinan pelayan (servant leadership) bagi seorang Pengawas Sekolah Pembina bernama ${supervisorName || 'HERIANSYAH, S.Si., S.Pd., M.Pd'} di Kabupaten Sidenreng Rappang.

Berikut adalah kumpulan pesan moral, nasihat hati, kesan psikologis, dan apresiasi jujur dari para guru dan kepala sekolah binaan:
${condensedList}

Tugas Anda:
Susunlah "Cermin Refleksi 360°" yang menyentuh hati, rendah hati, objektif, dan berorientasi perbaikan sikap pengawas di lapangan (BUKAN menggurui guru/sekolah).
Gunakan bahasa Indonesia yang santun, dewasa, reflektif, dan mendalam.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Berikan analisis reflektif terstruktur dalam format JSON untuk membantu pengawas sekolah menjaga adab, kerendahan hati, dan dampak pendampingan.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallTone: {
                type: Type.STRING,
                description: 'Ringkasan suasana batin dan nada keseluruhan pesan dari sekolah binaan (2-3 kalimat).'
              },
              keyStrengthsToKeep: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 sikap baik pengawas yang paling dirasakan dan perlu terus dirawat.'
              },
              blindSpotsToWatch: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2-3 titik rawan atau masukan halus dari guru/kepsek yang perlu disadari dengan rendah hati.'
              },
              personalCommitments: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 komitmen nyata perubahan sikap pengawas saat berkunjung ke sekolah berikutnya.'
              },
              closingReflection: {
                type: Type.STRING,
                description: 'Kalimat penguat nurani dan doa profesional untuk pengawas sekolah (1-2 kalimat).'
              }
            },
            required: [
              'overallTone',
              'keyStrengthsToKeep',
              'blindSpotsToWatch',
              'personalCommitments',
              'closingReflection'
            ]
          }
        }
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      return res.json({
        ...parsed,
        generatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Server /api/gemini/moral-reflection error:', err);
      return res.status(500).json({
        error: 'GEMINI_REFLECTION_FAILED',
        message: err instanceof Error ? err.message : 'Gagal menyusun cermin refleksi AI.'
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`INSPIRO server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start INSPIRO server:', err);
  process.exit(1);
});
