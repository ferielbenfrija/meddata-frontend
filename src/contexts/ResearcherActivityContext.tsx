import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ResearcherActivityStats {
  filesViewed: number;
  downloads: number;
  savedSearches: number;
}

interface ResearcherActivityContextValue {
  stats: ResearcherActivityStats;
  recordView: (fileId?: string) => void;
  recordDownload: (fileId?: string) => void;
  recordSearch: (term?: string) => void;
}

const ResearcherActivityContext = createContext<ResearcherActivityContextValue | undefined>(undefined);

const emptyStats: ResearcherActivityStats = {
  filesViewed: 0,
  downloads: 0,
  savedSearches: 0,
};

export function ResearcherActivityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const storageKey = `medical-platform-researcher-activity:${user?.id || 'guest'}`;
  const [stats, setStats] = useState<ResearcherActivityStats>(() => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return emptyStats;
    try {
      return JSON.parse(stored) as ResearcherActivityStats;
    } catch {
      return emptyStats;
    }
  });

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      setStats(emptyStats);
      return;
    }
    try {
      setStats(JSON.parse(stored) as ResearcherActivityStats);
    } catch {
      setStats(emptyStats);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(stats));
  }, [storageKey, stats]);

  const recordView = useCallback(() => {
    setStats((prev) => ({ ...prev, filesViewed: prev.filesViewed + 1 }));
  }, []);

  const recordDownload = useCallback(() => {
    setStats((prev) => ({ ...prev, downloads: prev.downloads + 1 }));
  }, []);

  const recordSearch = useCallback((term?: string) => {
    if (term !== undefined && term.trim().length === 0) return;
    setStats((prev) => ({ ...prev, savedSearches: prev.savedSearches + 1 }));
  }, []);

  const value = useMemo(
    () => ({
      stats,
      recordView,
      recordDownload,
      recordSearch,
    }),
    [stats, recordView, recordDownload, recordSearch]
  );

  return (
    <ResearcherActivityContext.Provider value={value}>
      {children}
    </ResearcherActivityContext.Provider>
  );
}

export function useResearcherActivity() {
  const context = useContext(ResearcherActivityContext);
  if (!context) {
    throw new Error('useResearcherActivity must be used within a ResearcherActivityProvider');
  }
  return context;
}
