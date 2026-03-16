const API = import.meta.env.VITE_API_URL;

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API}/api/files/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return response.json();
};

export const getFiles = async () => {
  const response = await fetch(`${API}/api/files`);

  if (!response.ok) {
    throw new Error("Failed to fetch files");
  }

  return response.json();
};

export const anonymizeFile = async (id: number) => {
  const response = await fetch(`${API}/api/files/${id}/anonymize`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Anonymization failed");
  }

  return response.json();
};

export const downloadOriginal = (id: number) => {
  window.open(`${API}/api/files/${id}/download`);
};

export const downloadAnonymized = (id: number) => {
  window.open(`${API}/api/files/${id}/download-anonymized`);
};
