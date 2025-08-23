'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppData, SyncStatus } from '@/types';
import { useLocalStorage } from './useLocalStorage';

export const useNotionSync = () => {
  const [localData, setLocalData] = useLocalStorage<AppData>('vocab-data', { folders: [], words: [] });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: typeof window !== 'undefined' ? navigator.onLine : false,
    hasLocalChanges: false,
    isLoading: false,
  });

  // 온라인 상태 감지
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setSyncStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSyncStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Notion에서 데이터 가져오기
  const fetchFromNotion = useCallback(async () => {
    if (!syncStatus.isOnline) return;

    setSyncStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch('/api/notion/words');
      if (response.ok) {
        await response.json();
        // TODO: Notion 데이터를 AppData 형식으로 변환
        setSyncStatus(prev => ({ 
          ...prev, 
          lastSyncTime: new Date(),
          hasLocalChanges: false,
          isLoading: false 
        }));
      }
    } catch (error) {
      console.error('Failed to fetch from Notion:', error);
      setSyncStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, [syncStatus.isOnline]);

  // Notion에 데이터 동기화
  const syncToNotion = useCallback(async () => {
    if (!syncStatus.isOnline || !syncStatus.hasLocalChanges) return;

    setSyncStatus(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(localData),
      });

      if (response.ok) {
        setSyncStatus(prev => ({ 
          ...prev, 
          lastSyncTime: new Date(),
          hasLocalChanges: false,
          isLoading: false 
        }));
      }
    } catch (error) {
      console.error('Failed to sync to Notion:', error);
      setSyncStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, [localData, syncStatus.isOnline, syncStatus.hasLocalChanges]);

  // 로컬 데이터 변경 시 hasLocalChanges 플래그 설정
  const updateLocalData = useCallback((newData: AppData | ((prev: AppData) => AppData)) => {
    setLocalData(newData);
    setSyncStatus(prev => ({ ...prev, hasLocalChanges: true }));
  }, [setLocalData]);

  // 자동 동기화 (온라인 상태가 되면 실행)
  useEffect(() => {
    if (syncStatus.isOnline && syncStatus.hasLocalChanges) {
      const timer = setTimeout(() => {
        syncToNotion();
      }, 2000); // 2초 후 자동 동기화

      return () => clearTimeout(timer);
    }
  }, [syncStatus.isOnline, syncStatus.hasLocalChanges, syncToNotion]);

  return {
    localData,
    setLocalData: updateLocalData,
    syncStatus,
    syncToNotion,
    fetchFromNotion,
  };
};