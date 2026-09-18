import { apiMessage } from "../api/client";
export function useApiError(error: unknown) { return apiMessage(error); }
