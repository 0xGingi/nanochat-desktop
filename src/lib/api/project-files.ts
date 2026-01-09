import { apiRequest } from "./client";
import type { ProjectFile, ProjectMember, ProjectRole } from "./types";

// Project Files

export async function listProjectFiles(projectId: string): Promise<ProjectFile[]> {
    return apiRequest<ProjectFile[]>(`/api/projects/${projectId}/files`);
}

export async function uploadProjectFile(projectId: string, file: File): Promise<ProjectFile> {
    const formData = new FormData();
    formData.append("file", file);

    return apiRequest<ProjectFile>(`/api/projects/${projectId}/files`, {
        method: "POST",
        body: formData,
    });
}

export async function deleteProjectFile(projectId: string, fileId: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/api/projects/${projectId}/files?fileId=${fileId}`, {
        method: "DELETE",
    });
}

// Project Members

export async function listProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return apiRequest<ProjectMember[]>(`/api/projects/${projectId}/members`);
}

export async function addProjectMember(
    projectId: string,
    email: string,
    role: ProjectRole = "viewer"
): Promise<ProjectMember> {
    return apiRequest<ProjectMember>(`/api/projects/${projectId}/members`, {
        method: "POST",
        body: JSON.stringify({ email, role }),
    });
}

export async function removeProjectMember(projectId: string, userId: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/api/projects/${projectId}/members?userId=${userId}`, {
        method: "DELETE",
    });
}
