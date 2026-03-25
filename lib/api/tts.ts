import api from "./client";

export const ttsApi = {
  generate(type: "news" | "gallery", id: string, lang?: "en" | "te") {
    const url = lang ? `/tts/${type}/${id}/${lang}` : `/tts/${type}/${id}`;
    return api.post<{
      success: boolean;
      audio: Record<string, unknown>;
    }>(url);
  },

  getVoices(lang?: string) {
    return api.get<{
      success: boolean;
      voices: Array<{ name: string; languageCodes: string[]; gender: string }>;
    }>("/tts/voices", { params: { lang } });
  },
};
