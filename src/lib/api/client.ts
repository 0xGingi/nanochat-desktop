// HTTP client for NanoChat API
import { getConfig } from '../stores/config';
import type { ApiError } from './types';

/**
 * Make an authenticated API request
 * @param endpoint - API endpoint (e.g., '/api/db/conversations')
 * @param options - Standard fetch options
 * @returns Parsed JSON response
 * @throws ApiError on failure
 */
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    try {
        // Get configuration
        const config = await getConfig();

        if (!config.server_url || !config.api_key) {
            throw {
                message: 'API configuration not set. Please configure server URL and API key in settings.',
                type: 'unknown',
            } as ApiError;
        }

        // Build full URL
        const baseUrl = config.server_url.replace(/\/$/, ''); // Remove trailing slash
        const url = `${baseUrl}${endpoint}`;

        // Prepare headers
        const headers = new Headers(options.headers);
        headers.set('Authorization', `Bearer ${config.api_key}`);

        // Set Content-Type to JSON if body is present and not already set
        if (options.body && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        // Make request
        const response = await fetch(url, {
            ...options,
            headers,
        });

        // Handle HTTP errors
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

            // Try to get error details from response body
            try {
                const errorBody = await response.json();
                if (errorBody.error || errorBody.message) {
                    errorMessage = errorBody.error || errorBody.message;
                }
            } catch {
                // If response body is not JSON, use status text
            }

            throw {
                message: errorMessage,
                status: response.status,
                type: 'http',
            } as ApiError;
        }

        // Parse response
        try {
            const data = await response.json();
            return data as T;
        } catch (err) {
            throw {
                message: 'Failed to parse response as JSON',
                type: 'parse',
            } as ApiError;
        }
    } catch (err) {
        // Re-throw ApiError as-is
        if ((err as ApiError).type) {
            throw err;
        }

        // Handle network errors
        if (err instanceof TypeError) {
            throw {
                message: 'Network error. Please check your connection and server URL.',
                type: 'network',
            } as ApiError;
        }

        // Unknown error
        throw {
            message: err instanceof Error ? err.message : 'An unknown error occurred',
            type: 'unknown',
        } as ApiError;
    }
}
