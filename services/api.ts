import { API_BASE_URL } from "@/constants/app";
import type { ApiResult } from "@/types/api";

export async function getJson<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`);

    if (!response.ok) {
      return {
        data: null,
        error: `Request failed with status ${response.status}`,
      };
    }

    const data = (await response.json()) as T;
    return { data, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown network error";
    return { data: null, error: message };
  }
}
