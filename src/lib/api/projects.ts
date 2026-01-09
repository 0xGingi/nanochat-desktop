import { apiRequest } from "./client";
import type { Project } from "./types";

export async function listProjects(): Promise<Project[]> {
    return apiRequest<Project[]>("/api/projects");
}

export async function getProject(id: string): Promise<Project> {
    return apiRequest<Project>(`/api/projects/${id}`);
}

export async function createProject(
    name: string,
    options?: {
        description?: string;
        systemPrompt?: string;
        color?: string;
    }
): Promise<Project> {
    return apiRequest<Project>("/api/projects", {
        method: "POST",
        body: JSON.stringify({
            name,
            ...options,
        }),
    });
}

export async function updateProject(
    id: string,
    updates: {
        name?: string;
        description?: string;
        systemPrompt?: string;
        color?: string;
    }
): Promise<Project> {
    return apiRequest<Project>(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
    });
}

export async function deleteProject(id: string): Promise<void> {
    return apiRequest<void>(`/api/projects/${id}`, {
        method: "DELETE",
    });
}
