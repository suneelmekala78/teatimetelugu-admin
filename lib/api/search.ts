import api from "./client";

export const searchApi = {
  reindex() {
    return api.post<{ success: boolean; message: string; result: Record<string, unknown> }>(
      "/search/reindex"
    );
  },
};
