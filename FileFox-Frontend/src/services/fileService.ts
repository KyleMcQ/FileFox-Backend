import api from "../api/apiClient";

export async function listFiles() {
  const res = await api.get("/files");
  return res.data;
}

export async function getFileMetadata(id: string) {
  const res = await api.get(`/files/${id}`);
  return res.data;
}

export async function deleteFile(id: string) {
  await api.delete(`/files/${id}`);
}