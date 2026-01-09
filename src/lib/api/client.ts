import { getConfig } from "../stores/config";
import type { ApiError } from "./types";

interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const config = await getConfig();

    // Normalize server URL (remove trailing slash)
    const baseUrl = config.server_url.replace(/\/$/, "");
    const url = `${baseUrl}${endpoint}`;

    const headers = new Headers(options.headers);

    // Add Content-Type if body is present and not FormData
    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    // Add Authorization header
    if (!options.skipAuth && config.api_key) {
        headers.set("Authorization", `Bearer ${config.api_key}`);
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
                errorMessage = errorData.error;
            } else if (errorData && errorData.message) {
                errorMessage = errorData.message;
            }
        } catch (e) {
            // Ignore non-JSON error bodies
        }

        const error: ApiError = {
            message: errorMessage,
            status: response.status,
        };
        throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}
