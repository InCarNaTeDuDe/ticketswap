import { useEffect, useRef, useCallback } from "react";

interface FetchOptions extends RequestInit {
  body?: any;
}

export function useFetch() {
  const activeControllersRef = useRef<AbortController[]>([]);

  // Cancel any pending requests on unmount
  useEffect(() => {
    const controllers = activeControllersRef.current;
    return () => {
      controllers.forEach((controller) => {
        try {
          controller.abort();
        } catch (e) {
          // Ignore errors during clean up
        }
      });
    };
  }, []);

  const request = useCallback(async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
    // Instantiate AbortController
    const controller = new AbortController();
    activeControllersRef.current.push(controller);

    try {
      const headers = new Headers(options.headers || {});
      let bodyData = options.body;

      if (bodyData && typeof bodyData === "object" && !(bodyData instanceof FormData)) {
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }
        bodyData = JSON.stringify(bodyData);
      }

      const response = await fetch(url, {
        ...options,
        headers,
        body: bodyData,
        signal: controller.signal,
      });

      let responseData: any;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = { text: await response.text() };
      }

      if (!response.ok) {
        throw new Error(responseData?.error || `HTTP error! Status: ${response.status}`);
      }

      return responseData as T;
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log(`Fetch request to ${url} was aborted.`);
      }
      throw err;
    } finally {
      activeControllersRef.current = activeControllersRef.current.filter((c) => c !== controller);
    }
  }, []);

  return { request };
}
