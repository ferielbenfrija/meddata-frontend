import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { deleteFileBlob, getFileBlob, saveFileBlob } from '@/lib/adminFilesStore';
import { useAuth } from '@/contexts/AuthContext';

/** Copy a blob from one store scope to another (e.g. admin scope → global). */
const copyBlobToGlobal = async (fromScope: string, fileId: string): Promise<boolean> => {
  const blob = await getFileBlob(fromScope, fileId);
  if (!blob) return false;
  await saveFileBlob('global', fileId, blob);
  return true;
};

export type FileKind =
  | 'PDF'
  | 'Word'
  | 'Excel'
  | 'Text'
  | 'Image'
  | 'Video'
  | 'DICOM'
  | 'Other';
export type FileStatus = 'uploaded' | 'anonymized';

export interface AdminFile {
  id: string;
  name: string;
  size: number;
  type: string;
  kind: FileKind;
  uploadedAt: string;
  status: FileStatus;
  anonymizedAt?: string;
  textPreview?: string;
  previewUrl?: string;
}

export interface FileActivity {
  id: string;
  action: 'upload' | 'anonymize' | 'delete';
  fileName: string;
  timestamp: string;
}

interface AdminFilesContextValue {
  files: AdminFile[];
  activities: FileActivity[];
  addFiles: (files: FileList | File[]) => Promise<void>;
  removeFile: (fileId: string) => void;
  anonymizeFile: (fileId: string) => Promise<void>;
  ensurePreviewUrl: (fileId: string) => Promise<string | null>;
  clearPreviewUrl: (fileId: string) => void;
}

const AdminFilesContext = createContext<AdminFilesContextValue | undefined>(undefined);

const STORAGE_KEY_PREFIX_FILES = 'medical-platform-admin-files';
const STORAGE_KEY_PREFIX_ACTIVITY = 'medical-platform-admin-activity';

/** Each admin has isolated data; researchers use 'global' scope for shared dataset. */
function getStorageScope(user: { id: string; role: string } | null): string {
  return user?.role === 'admin' ? user.id : 'global';
}

function getFilesStorageKey(scope: string): string {
  return scope === 'global' ? STORAGE_KEY_PREFIX_FILES : `${STORAGE_KEY_PREFIX_FILES}-${scope}`;
}

function getActivityStorageKey(scope: string): string {
  return scope === 'global' ? STORAGE_KEY_PREFIX_ACTIVITY : `${STORAGE_KEY_PREFIX_ACTIVITY}-${scope}`;
}

const getFileKind = (mimeType: string, name: string): FileKind => {
  const lower = name.toLowerCase();

  // Documents
  if (mimeType.includes('pdf') || lower.endsWith('.pdf')) return 'PDF';
  if (mimeType.includes('word') || lower.endsWith('.doc') || lower.endsWith('.docx')) return 'Word';
  if (
    mimeType.includes('sheet') ||
    mimeType.includes('excel') ||
    lower.endsWith('.xls') ||
    lower.endsWith('.xlsx')
  ) {
    return 'Excel';
  }
  if (mimeType.startsWith('text/') || lower.endsWith('.txt') || lower.endsWith('.csv')) return 'Text';

  // Medical images (e.g. radiology)
  if (mimeType.startsWith('image/') || /\.(jpg|jpeg|png|tif|tiff)$/.test(lower)) return 'Image';

  // Medical videos (e.g. MRI cine loops)
  if (mimeType.startsWith('video/') || /\.(mp4|avi|mov|mkv)$/.test(lower)) return 'Video';

  // DICOM (single-file MRI / CT / other modalities)
  if (mimeType.includes('dicom') || lower.endsWith('.dcm')) return 'DICOM';

  return 'Other';
};

const readStoredFiles = (scope: string): AdminFile[] => {
  const key = getFilesStorageKey(scope);
  const stored = localStorage.getItem(key);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as AdminFile[];
    return parsed.map((file) => ({ ...file }));
  } catch {
    return [];
  }
};

const readStoredActivities = (scope: string): FileActivity[] => {
  const stored = localStorage.getItem(getActivityStorageKey(scope));
  if (!stored) return [];
  try {
    return JSON.parse(stored) as FileActivity[];
  } catch {
    return [];
  }
};

/** Update the global files list so researchers see all admins' files. */
const writeGlobalFiles = (updater: (prev: AdminFile[]) => AdminFile[]) => {
  const key = getFilesStorageKey('global');
  const prev = (() => {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    try {
      return JSON.parse(stored) as AdminFile[];
    } catch {
      return [];
    }
  })();
  const next = updater(prev).map(({ previewUrl, ...rest }) => rest);
  localStorage.setItem(key, JSON.stringify(next));
};

export function AdminFilesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const scope = getStorageScope(user);
  const isAdmin = user?.role === 'admin';

  const [files, setFiles] = useState<AdminFile[]>([]);
  const [activities, setActivities] = useState<FileActivity[]>([]);

  // When scope changes (e.g. admin logs in/out or switches account), load that scope's data
  useEffect(() => {
    setFiles(readStoredFiles(scope));
    setActivities(readStoredActivities(scope));
  }, [scope]);

  useEffect(() => {
    const toStore = files.map(({ previewUrl, ...rest }) => rest);
    localStorage.setItem(getFilesStorageKey(scope), JSON.stringify(toStore));
  }, [scope, files]);

  useEffect(() => {
    if (files.length === 0) return;
    const missing = files.filter((file) => !file.previewUrl);
    if (missing.length === 0) return;
    let cancelled = false;

    const hydratePreviews = async () => {
      const updates = await Promise.all(
        missing.map(async (file) => {
          const blob = await getFileBlob(scope, file.id);
          if (!blob) return null;
          return { id: file.id, url: URL.createObjectURL(blob) };
        })
      );

      if (cancelled) return;

      const available = updates.filter((item): item is { id: string; url: string } => !!item);
      if (available.length === 0) return;

      setFiles((prev) =>
        prev.map((file) => {
          const match = available.find((item) => item.id === file.id);
          return match ? { ...file, previewUrl: match.url } : file;
        })
      );
    };

    hydratePreviews();

    return () => {
      cancelled = true;
    };
  }, [scope, files]);

  useEffect(() => {
    localStorage.setItem(getActivityStorageKey(scope), JSON.stringify(activities));
  }, [scope, activities]);

  const addActivity = useCallback((action: FileActivity['action'], fileName: string) => {
    setActivities((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        action,
        fileName,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ].slice(0, 20));
  }, []);

  const addFiles = useCallback(async (inputFiles: FileList | File[]) => {
    const list = Array.from(inputFiles);
    const created = await Promise.all(
      list.map(async (file) => {
        const kind = getFileKind(file.type, file.name);
        const textPreview = kind === 'Text' ? await file.text() : undefined;
        const previewUrl = URL.createObjectURL(file);
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        await saveFileBlob(scope, id, file);
        if (isAdmin) {
          await saveFileBlob('global', id, file);
        }
        return {
          id,
          name: file.name,
          size: file.size,
          type: file.type,
          kind,
          uploadedAt: new Date().toISOString(),
          status: 'uploaded' as FileStatus,
          textPreview,
          previewUrl,
        } satisfies AdminFile;
      })
    );

    setFiles((prev) => [...created, ...prev]);
    created.forEach((file) => addActivity('upload', file.name));

    if (isAdmin) {
      writeGlobalFiles((prev) =>
        [...created.map((f) => ({ ...f, previewUrl: undefined })), ...prev]
      );
    }
  }, [addActivity, scope, isAdmin]);

  const removeFile = useCallback((fileId: string) => {
    const removed = files.find((item) => item.id === fileId);
    if (removed?.previewUrl) {
      URL.revokeObjectURL(removed.previewUrl);
    }
    deleteFileBlob(scope, fileId);
    if (isAdmin) {
      deleteFileBlob('global', fileId);
      writeGlobalFiles((prev) => prev.filter((f) => f.id !== fileId));
    }

    setFiles((prev) => prev.filter((item) => item.id !== fileId));

    if (removed) {
      addActivity('delete', removed.name);
    }
  }, [addActivity, files, scope, isAdmin]);

  const anonymizeFile = useCallback(async (fileId: string) => {
    const target = files.find((item) => item.id === fileId);
    const anonymizedAt = new Date().toISOString();
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? {
              ...file,
              status: 'anonymized' as FileStatus,
              anonymizedAt,
            }
          : file
      )
    );

    if (isAdmin && target) {
      const key = getFilesStorageKey('global');
      const stored = localStorage.getItem(key);
      let globalList: AdminFile[] = [];
      try {
        if (stored) globalList = JSON.parse(stored) as AdminFile[];
      } catch {
        /* ignore */
      }
      const wasInGlobal = globalList.some((f) => f.id === fileId);
      if (!wasInGlobal) {
        await copyBlobToGlobal(scope, fileId);
      }
      const fileMeta = { ...target, status: 'anonymized' as FileStatus, anonymizedAt, previewUrl: undefined };
      writeGlobalFiles((prev) => {
        const exists = prev.some((f) => f.id === fileId);
        if (exists) {
          return prev.map((f) => (f.id === fileId ? { ...f, status: 'anonymized' as FileStatus, anonymizedAt } : f));
        }
        return [fileMeta, ...prev];
      });
    }

    if (target) {
      addActivity('anonymize', target.name);
    }
  }, [addActivity, files, isAdmin, scope]);

  const ensurePreviewUrl = useCallback(
    async (fileId: string) => {
      const target = files.find((file) => file.id === fileId);
      const existing = target?.previewUrl;
      if (existing) return existing;
      const blob = await getFileBlob(scope, fileId);
      if (!blob) {
        if (target?.kind === 'Text' && target.textPreview) {
          const textBlob = new Blob([target.textPreview], { type: target.type || 'text/plain' });
          const url = URL.createObjectURL(textBlob);
          setFiles((prev) =>
            prev.map((file) => (file.id === fileId ? { ...file, previewUrl: url } : file))
          );
          return url;
        }
        return null;
      }
      const url = URL.createObjectURL(blob);
      setFiles((prev) =>
        prev.map((file) => (file.id === fileId ? { ...file, previewUrl: url } : file))
      );
      return url;
    },
    [files, scope]
  );

  const clearPreviewUrl = useCallback((fileId: string) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === fileId ? { ...file, previewUrl: undefined } : file))
    );
  }, []);

  const value = useMemo(
    () => ({
      files,
      activities,
      addFiles,
      removeFile,
      anonymizeFile,
      ensurePreviewUrl,
      clearPreviewUrl,
    }),
    [files, activities, addFiles, removeFile, anonymizeFile, ensurePreviewUrl, clearPreviewUrl]
  );

  return <AdminFilesContext.Provider value={value}>{children}</AdminFilesContext.Provider>;
}

export function useAdminFiles() {
  const context = useContext(AdminFilesContext);
  if (!context) {
    throw new Error('useAdminFiles must be used within an AdminFilesProvider');
  }
  return context;
}
