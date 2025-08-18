import React, { useState, useMemo } from 'react';
import type { AppData, Word } from '../types';
import { FolderIcon } from './icons/FolderIcon';
import { StarIcon } from './icons/StarIcon';

interface WordListProps {
  appData: AppData;
  onUpdateWord: (word: Word) => void;
}

const WordList: React.FC<WordListProps> = ({ appData, onUpdateWord }) => {
  const { words, folders } = appData;
  const [selectedFolderId, setSelectedFolderId] = useState<'all' | 'unassigned' | 'starred' | string>('all');

  const folderMap = useMemo(() => {
    const map = new Map<string, string>();
    folders.forEach(folder => {
      map.set(folder.id, folder.name);
    });
    return map;
  }, [folders]);

  const filteredWords = useMemo(() => {
    if (selectedFolderId === 'all') return words;
    if (selectedFolderId === 'unassigned') return words.filter(word => word.folderId === null);
    if (selectedFolderId === 'starred') return words.filter(word => word.isStarred);
    return words.filter(word => word.folderId === selectedFolderId);
  }, [words, selectedFolderId]);
  
  const getWordCount = (folderId: string | 'all' | 'unassigned' | 'starred'): number => {
    if (folderId === 'all') return words.length;
    if (folderId === 'unassigned') return words.filter(w => w.folderId === null).length;
    if (folderId === 'starred') return words.filter(w => w.isStarred).length;
    return words.filter(w => w.folderId === folderId).length;
  };
  
  const handleToggleStar = (wordToToggle: Word) => {
    onUpdateWord({ ...wordToToggle, isStarred: !wordToToggle.isStarred });
  };

  const FilterButton: React.FC<{
    id: string | 'all' | 'unassigned' | 'starred';
    name: string;
    count: number;
    isStar?: boolean;
  }> = ({ id, name, count, isStar = false }) => (
    <button
      onClick={() => setSelectedFolderId(id)}
      className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors flex items-center gap-1.5 ${
        selectedFolderId === id
          ? isStar ? 'bg-yellow-500 text-white' : 'bg-indigo-600 text-white'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
      }`}
    >
      {isStar && <StarIcon filled={selectedFolderId === id} className="h-4 w-4" />}
      {name} <span className="text-xs opacity-80">{count}</span>
    </button>
  );

  if (words.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">단어 목록</h2>
        <p className="text-slate-500 dark:text-slate-400 py-8">단어장에 단어가 없습니다. '단어 관리' 탭에서 단어를 추가해주세요.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">단어 목록 ({filteredWords.length})</h2>
      
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
        <FilterButton id="all" name="모든 단어" count={getWordCount('all')} />
        <FilterButton id="starred" name="별표 단어" count={getWordCount('starred')} isStar />
        <FilterButton id="unassigned" name="미분류" count={getWordCount('unassigned')} />
        {folders.map(folder => (
          <FilterButton key={folder.id} id={folder.id} name={folder.name} count={getWordCount(folder.id)} />
        ))}
      </div>

      {/* Header */}
      <div className="grid grid-cols-2 gap-4 px-4 pb-2 border-b-2 border-slate-200 dark:border-slate-700 mb-4">
        <h3 className="font-bold text-slate-600 dark:text-slate-400">English</h3>
        <h3 className="font-bold text-slate-600 dark:text-slate-400">Korean</h3>
      </div>

      {/* Word List */}
      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
        {filteredWords.length > 0 ? (
          filteredWords.map(word => {
            const folderName = word.folderId ? folderMap.get(word.folderId) : '미분류';
            return (
              <div key={word.id} className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 animate-fade-in">
                {/* English Column */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{word.english}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <FolderIcon />
                      <span>{folderName}</span>
                    </div>
                  </div>
                   <button
                    onClick={() => handleToggleStar(word)}
                    className={`p-1 rounded-full transition-colors ${word.isStarred ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-400 hover:text-yellow-400'}`}
                    aria-label={`Toggle star for ${word.english}`}
                  >
                    <StarIcon filled={!!word.isStarred} className="h-5 w-5" />
                  </button>
                </div>

                {/* Korean Column */}
                <div className="text-slate-800 dark:text-slate-200 self-center">
                  <p>{word.korean}</p>
                  {word.korean2 && (
                    <p className="text-slate-500 dark:text-slate-400">{word.korean2}</p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">선택한 그룹에 표시할 단어가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default WordList;