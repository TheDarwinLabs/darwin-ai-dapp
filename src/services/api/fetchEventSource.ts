import {
  EventSourceMessage,
  fetchEventSource,
} from "@microsoft/fetch-event-source";
// import { API_BASE_URL } from "@/lib/config";
const API_BASE_URL = "";

export async function fetchEventSourceWrapper(
  endpoint: string = "chat",
  options: {
    method?: "GET" | "POST";
    body?: any;
    onmessage: (event: EventSourceMessage) => void;
    onerror?: (error: any) => void;
  }
): Promise<void> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const { method = "POST", body, onmessage, onerror } = options;
  try {
    await fetchEventSource(`${API_BASE_URL}/${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      onmessage,
      onerror: (err) => {
        if (onerror) {
          onerror(err);
        } else {
          console.error("SSE Error:", err);
        }
      },
    });
  } catch (error) {
    console.error("Failed to fetch SSE:", error);
    if (onerror) {
      onerror(error);
    }
  }
}
