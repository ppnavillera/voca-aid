'use client';

import React, { useState, useEffect } from 'react';
import { SyncStatus as SyncStatusType } from '@/types';

interface SyncStatusProps {
  syncStatus: SyncStatusType;
  onSync: () => void;
  onRefresh: () => void;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ syncStatus, onSync, onRefresh }) => {
  const { isOnline, lastSyncTime, hasLocalChanges, isLoading } = syncStatus;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusText = () => {
    if (isLoading) return '동기화 중...';
    if (!isOnline) return '오프라인';
    if (hasLocalChanges) return '동기화 필요';
    if (lastSyncTime && mounted) {
      const timeDiff = Date.now() - lastSyncTime.getTime();
      const minutes = Math.floor(timeDiff / (1000 * 60));
      if (minutes < 1) return '방금 동기화됨';
      if (minutes < 60) return `${minutes}분 전 동기화`;
      return '동기화 필요';
    }
    return 'Notion 연결 안됨';
  };

  const getStatusColor = () => {
    if (isLoading) return 'text-blue-500';
    if (!isOnline) return 'text-red-500';
    if (hasLocalChanges) return 'text-yellow-500';
    if (lastSyncTime) return 'text-green-500';
    return 'text-gray-500';
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-2">
      {/* 상태 표시 */}
      <div className={`text-xs ${getStatusColor()}`}>
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isOnline && '📱 '}
        {hasLocalChanges && !isLoading && '⚠️ '}
        {lastSyncTime && !hasLocalChanges && !isLoading && '✅ '}
        {getStatusText()}
      </div>

      {/* 동기화 버튼들 */}
      {isOnline && (
        <div className="flex gap-1">
          {hasLocalChanges && (
            <button
              onClick={onSync}
              disabled={isLoading}
              className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? '동기화 중...' : '동기화'}
            </button>
          )}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="text-xs px-2 py-1 bg-slate-600 text-white rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            새로고침
          </button>
        </div>
      )}

      {/* 오프라인 알림 */}
      {!isOnline && (
        <div className="text-xs text-slate-500">
          (로컬 저장만 가능)
        </div>
      )}
    </div>
  );
};

export default SyncStatus;