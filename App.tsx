import React, { useState, useCallback, useEffect } from 'react';
import type { Word, AppData } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import WordManagement from './components/WordManagement';
import Quiz from './components/Quiz';
import WordList from './components/WordList';
import Study from './components/Study';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { QuestionMarkCircleIcon } from './components/icons/QuestionMarkCircleIcon';
import { ListBulletIcon } from './components/icons/ListBulletIcon';
import { EyeIcon } from './components/icons/EyeIcon';

type Tab = 'manage' | 'study' | 'quiz' | 'list';

const App: React.FC = () => {
  const [appData, setAppData] = useLocalStorage<AppData>('vocab-app-data', { folders: [], words: [] });
  const [activeTab, setActiveTab] = useState<Tab>('manage');

  useEffect(() => {
    const oldWordsRaw = localStorage.getItem('vocab-words');
    if (oldWordsRaw) {
      try {
        const oldWords = JSON.parse(oldWordsRaw);
        if (Array.isArray(oldWords) && oldWords.length > 0) {
          setAppData(currentData => {
            if (currentData.words.length === 0 && currentData.folders.length === 0) {
              const migratedWords = oldWords.map(w => ({ ...w, folderId: null }));
              return { folders: [], words: migratedWords };
            }
            return currentData;
          });
        }
      } catch (e) {
        console.error("Failed to migrate old words", e);
      } finally {
        localStorage.removeItem('vocab-words');
      }
    }
  }, []);

  const addWord = useCallback((english: string, korean: string, korean2: string, folderId: string | null) => {
    if (english.trim() === '' || korean.trim() === '') return;
    const newWord: Word = {
      id: Date.now().toString(),
      english: english.trim(),
      korean: korean.trim(),
      korean2: korean2.trim() !== '' ? korean2.trim() : undefined,
      folderId,
    };
    setAppData(prev => ({ ...prev, words: [newWord, ...prev.words] }));
  }, [setAppData]);

  const deleteWord = useCallback((id: string) => {
    setAppData(prev => ({ ...prev, words: prev.words.filter(word => word.id !== id) }));
  }, [setAppData]);
  
  const updateWord = useCallback((updatedWord: Word) => {
    setAppData(prev => ({
      ...prev,
      words: prev.words.map(word => word.id === updatedWord.id ? updatedWord : word)
    }));
  }, [setAppData]);

  const moveWords = useCallback((wordIds: string[], destinationFolderId: string | null) => {
    const wordIdSet = new Set(wordIds);
    setAppData(prev => ({
      ...prev,
      words: prev.words.map(word => 
        wordIdSet.has(word.id)
          ? { ...word, folderId: destinationFolderId }
          : word
      )
    }));
  }, [setAppData]);

  const addFolder = useCallback((name: string) => {
    if (name.trim() === '') return;
    const newFolder = { id: Date.now().toString(), name: name.trim() };
    setAppData(prev => ({ ...prev, folders: [...prev.folders, newFolder] }));
  }, [setAppData]);

  const deleteFolder = useCallback((folderId: string) => {
    if (!window.confirm('폴더를 삭제하면 폴더 안의 단어들은 "미분류" 상태가 됩니다. 정말 삭제하시겠습니까?')) {
      return;
    }
    setAppData(prev => {
      const newFolders = prev.folders.filter(f => f.id !== folderId);
      const newWords = prev.words.map(w => {
        if (w.folderId === folderId) {
          return { ...w, folderId: null };
        }
        return w;
      });
      return { folders: newFolders, words: newWords };
    });
  }, [setAppData]);


  const TabButton = ({ tab, children }: { tab: Tab; children: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-indigo-500 ${
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
              appData={appData}
              onAddWord={addWord}
              onDeleteWord={deleteWord}
              onUpdateWord={updateWord}
              onMoveWords={moveWords}
              onAddFolder={addFolder}
              onDeleteFolder={deleteFolder}
              onImportData={setAppData}
            />
          )}
          {activeTab === 'study' && <Study appData={appData} onUpdateWord={updateWord} />}
          {activeTab === 'quiz' && <Quiz appData={appData} onUpdateWord={updateWord} />}
          {activeTab === 'list' && <WordList appData={appData} onUpdateWord={updateWord} />}
        </div>
      </main>
      <footer className="text-center p-4 text-xs text-slate-500">
        © {new Date().getFullYear()} VocaAid
      </footer>
    </div>
  );
};

export default App;