import { apiRequest, apiRequestBlob } from "./client";
import type { StorageUploadResponse } from "./types";

export async function uploadFile(
    file: File | Blob,
    contentType: string,
    filename?: string
): Promise<StorageUploadResponse> {
    const headers: Record<string, string> = {
        "Content-Type": contentType,
    };

    if (filename) {
        headers["x-filename"] = filename;
    }

    return apiRequest<StorageUploadResponse>("/api/storage", {
        method: "POST",
        headers,
        body: file,
    });
}

export async function getFileUrl(storageId: string): Promise<{ url: string }> {
    return apiRequest<{ url: string }>(`/api/storage?id=${storageId}`);
}

export async function downloadFile(storageId: string): Promise<Blob> {
    return apiRequestBlob(`/api/storage/${storageId}`);
}

export async function deleteFile(storageId: string): Promise<{ ok: boolean }> {
    return apiRequest<{ ok: boolean }>(`/api/storage?id=${storageId}`, {
        method: "DELETE",
    });
}
