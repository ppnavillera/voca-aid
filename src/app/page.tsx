'use client';

import React, { useState, useCallback } from 'react';
import type { Word } from '@/types';
import { useNotionSync } from '@/hooks/useNotionSync';
import WordManagement from '@/components/WordManagement';
import Quiz from '@/components/Quiz';
import WordList from '@/components/WordList';
import Study from '@/components/Study';
import SyncStatus from '@/components/SyncStatus';
import { BookOpenIcon } from '@/components/icons/BookOpenIcon';
import { QuestionMarkCircleIcon } from '@/components/icons/QuestionMarkCircleIcon';
import { ListBulletIcon } from '@/components/icons/ListBulletIcon';
import { EyeIcon } from '@/components/icons/EyeIcon';

type Tab = 'manage' | 'study' | 'quiz' | 'list';

export default function Home() {
  const { localData, setLocalData, syncStatus, syncToNotion, fetchFromNotion } = useNotionSync();
  const [activeTab, setActiveTab] = useState<Tab>('manage');

  // 안전한 ID 생성 함수 (충돌 방지)
  const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addWord = useCallback((english: string, korean: string, korean2: string, folderId: string | null) => {
    if (english.trim() === '' || korean.trim() === '') return;
    
    // 입력 검증 및 정화 (XSS 방지)
    const sanitizedEnglish = english.trim().substring(0, 500);
    const sanitizedKorean = korean.trim().substring(0, 500);
    const sanitizedKorean2 = korean2.trim() !== '' ? korean2.trim().substring(0, 500) : undefined;
    
    const newWord: Word = {
      id: generateId(),
      english: sanitizedEnglish,
      korean: sanitizedKorean,
      korean2: sanitizedKorean2,
      folderId,
    };
    
    setLocalData(prev => ({ ...prev, words: [newWord, ...prev.words] }));
  }, [setLocalData]);

  const deleteWord = useCallback((id: string) => {
    setLocalData(prev => ({ ...prev, words: prev.words.filter(word => word.id !== id) }));
  }, [setLocalData]);
  
  const updateWord = useCallback((updatedWord: Word) => {
    setLocalData(prev => ({
      ...prev,
      words: prev.words.map(word => word.id === updatedWord.id ? updatedWord : word)
    }));
  }, [setLocalData]);

  const moveWords = useCallback((wordIds: string[], destinationFolderId: string | null) => {
    const wordIdSet = new Set(wordIds);
    setLocalData(prev => ({
      ...prev,
      words: prev.words.map(word => 
        wordIdSet.has(word.id)
          ? { ...word, folderId: destinationFolderId }
          : word
      )
    }));
  }, [setLocalData]);

  const addFolder = useCallback((name: string) => {
    if (name.trim() === '') return;
    
    // 입력 정화
    const sanitizedName = name.trim().substring(0, 100);
    
    const newFolder = { id: generateId(), name: sanitizedName };
    setLocalData(prev => ({ ...prev, folders: [...prev.folders, newFolder] }));
  }, [setLocalData]);

  const deleteFolder = useCallback((folderId: string) => {
    if (!window.confirm('폴더를 삭제하면 폴더 안의 단어들은 "미분류" 상태가 됩니다. 정말 삭제하시겠습니까?')) {
      return;
    }
    setLocalData(prev => {
      const newFolders = prev.folders.filter(f => f.id !== folderId);
      const newWords = prev.words.map(w => {
        if (w.folderId === folderId) {
          return { ...w, folderId: null };
        }
        return w;
      });
      return { folders: newFolders, words: newWords };
    });
  }, [setLocalData]);

  const TabButton = ({ tab, children }: { tab: Tab; children: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-indigo-500 ${
        activeTab === tab
          ? 'bg-indigo-600 text-white shadow-md'
          : 'text-slate-400 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-sans">
      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            VocaAid
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">나만의 단어장으로 영단어를 정복하세요.</p>
          
          {/* 동기화 상태 표시 */}
          <SyncStatus 
            syncStatus={syncStatus} 
            onSync={syncToNotion}
            onRefresh={fetchFromNotion}
          />
        </header>

        <div className="bg-slate-800 p-2 rounded-xl flex gap-2 mb-6 shadow-lg max-w-xl mx-auto">
          <TabButton tab="manage">
            <BookOpenIcon />
            단어 관리
          </TabButton>
          <TabButton tab="study">
            <EyeIcon />
            단어 외우기
          </TabButton>
          <TabButton tab="quiz">
            <QuestionMarkCircleIcon />
            퀴즈 풀기
          </TabButton>
          <TabButton tab="list">
            <ListBulletIcon />
            전체 보기
          </TabButton>
        </div>

        <div className="transition-opacity duration-300">
          {activeTab === 'manage' && (
            <WordManagement 
              appData={localData}
              onAddWord={addWord}
              onDeleteWord={deleteWord}
              onUpdateWord={updateWord}
              onMoveWords={moveWords}
              onAddFolder={addFolder}
              onDeleteFolder={deleteFolder}
              onImportData={setLocalData}
            />
          )}
          {activeTab === 'study' && <Study appData={localData} onUpdateWord={updateWord} />}
          {activeTab === 'quiz' && <Quiz appData={localData} onUpdateWord={updateWord} />}
          {activeTab === 'list' && <WordList appData={localData} onUpdateWord={updateWord} />}
        </div>
      </main>
      <footer className="text-center p-4 text-xs text-slate-500">
        © {new Date().getFullYear()} VocaAid
      </footer>
    </div>
  );
}
