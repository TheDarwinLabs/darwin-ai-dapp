import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

interface ErrorResponse {
  status: string;
  message: string;
}

export async function fetcher(
  endpoint: string,
  options: {
    method: "GET" | "POST" | "PUT" | "DELETE";
    data?: any;
    params?: Record<string, string | number | boolean>;
  }
): Promise<any> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const { method = "GET", data, params } = options;

  const queryString = params
    ? "?" +
      Object.entries(params)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
        )
        .join("&")
    : "";
  const response = await fetch(`${API_BASE_URL}/${endpoint}${queryString}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response?.ok) {
    let errorMessage = "An error occurred";

    try {
      const errorData: ErrorResponse = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (jsonError) {}

    throw new Error(errorMessage);
  }

  return response.json();
}
