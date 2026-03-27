import api from "./client";

export const notificationApi = {
  sendPush(data: { topic: string; title: string; body: string; data?: Record<string, string>; imageUrl?: string }) {
    return api.post<{ success: boolean; messageId: string }>("/notifications/push/topic", data);
  },

  sendEmail(data: { to: string; subject: string; html: string; text?: string }) {
    return api.post<{ success: boolean; emailId: string }>("/notifications/email", data);
  },
};
