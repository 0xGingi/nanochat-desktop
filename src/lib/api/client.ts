import { getConfig } from "../stores/config";
import type { ApiError } from "./types";

interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
}

async function getBaseUrl(): Promise<string> {
    const config = await getConfig();
    return config.server_url.replace(/\/$/, "");
}

async function getAuthHeaders(skipAuth: boolean = false): Promise<Headers> {
    const headers = new Headers();
    if (!skipAuth) {
        const config = await getConfig();
        if (config.api_key) {
            headers.set("Authorization", `Bearer ${config.api_key}`);
        }
    }
    return headers;
}

function handleError(response: Response, errorData?: { error?: string; message?: string }): never {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    if (errorData?.error) {
        errorMessage = errorData.error;
    } else if (errorData?.message) {
        errorMessage = errorData.message;
    }
    const error: ApiError = {
        message: errorMessage,
        status: response.status,
    };
    throw error;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const baseUrl = await getBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    const headers = await getAuthHeaders(options.skipAuth);

    // Copy any existing headers
    if (options.headers) {
        const existingHeaders = new Headers(options.headers);
        existingHeaders.forEach((value, key) => headers.set(key, value));
    }

    // Add Content-Type if body is present and not FormData
    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            // Ignore non-JSON error bodies
        }
        handleError(response, errorData);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

/**
 * Make an API request that returns a Blob (for file downloads)
 */
export async function apiRequestBlob(endpoint: string, options: RequestOptions = {}): Promise<Blob> {
    const baseUrl = await getBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    const headers = await getAuthHeaders(options.skipAuth);

    if (options.headers) {
        const existingHeaders = new Headers(options.headers);
        existingHeaders.forEach((value, key) => headers.set(key, value));
    }

    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            // Ignore non-JSON error bodies
        }
        handleError(response, errorData);
    }

    return response.blob();
}

/**
 * Make an API request and return the raw Response (for streaming or custom handling)
 */
export async function apiRequestRaw(endpoint: string, options: RequestOptions = {}): Promise<Response> {
    const baseUrl = await getBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    const headers = await getAuthHeaders(options.skipAuth);

    if (options.headers) {
        const existingHeaders = new Headers(options.headers);
        existingHeaders.forEach((value, key) => headers.set(key, value));
    }

    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorData;
        try {
            const cloned = response.clone();
            errorData = await cloned.json();
        } catch (e) {
            // Ignore non-JSON error bodies
        }
        handleError(response, errorData);
    }

    return response;
}

