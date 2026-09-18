import { api } from "./client";
export const notificationApi = { list: () => api.get<{ notifications: import("../types/api").Notification[] }>("/notifications"), read: (id: number) => api.patch(`/notifications/${id}/read`), readAll: () => api.patch("/notifications/read-all") };
