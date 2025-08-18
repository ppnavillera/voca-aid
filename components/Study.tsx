import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Word, AppData } from '../types';
import { FolderIcon } from './icons/FolderIcon';
import { StarIcon } from './icons/StarIcon';

interface StudyProps {
  appData: AppData;
  onUpdateWord: (word: Word) => void;
}

const Study: React.FC<StudyProps> = ({ appData, onUpdateWord }) => {
  const [studyWords, setStudyWords] = useState<Word[]>([]);
  const [studyStarted, setStudyStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  
  const [lastStudiedFolder, setLastStudiedFolder] = useState<string | 'all' | 'unassigned' | 'starred' | null>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === ' ') {
      event.preventDefault();
      if (!isRevealed) {
        setIsRevealed(true);
      } else {
        if (currentIndex < studyWords.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setIsRevealed(false);
        } else {
          setCurrentIndex(prev => prev + 1);
        }
      }
    }
  }, [isRevealed, currentIndex, studyWords.length]);

  useEffect(() => {
    if (studyStarted) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [studyStarted, handleKeyDown]);

  const startStudy = (folderId: string | 'all' | 'unassigned' | 'starred' | null) => {
    let wordsForStudy: Word[];
     if (folderId === 'starred') {
        wordsForStudy = appData.words.filter(w => w.isStarred);
    } else if (folderId === 'all' || folderId === null) {
      wordsForStudy = appData.words;
    } else if (folderId === 'unassigned') {
      wordsForStudy = appData.words.filter(w => w.folderId === null);
    } else {
      wordsForStudy = appData.words.filter(w => w.folderId === folderId);
    }

    if (wordsForStudy.length === 0) {
      alert("이 그룹에는 학습할 단어가 없습니다.");
      return;
    }
    
    setLastStudiedFolder(folderId);
    setStudyWords([...wordsForStudy].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsRevealed(false);
    setStudyStarted(true);
  };
  
  const resetStudy = () => {
      setStudyStarted(false);
      setStudyWords([]);
      setCurrentIndex(0);
  }

  const handleToggleStar = (wordId: string) => {
    const wordToUpdate = studyWords.find(w => w.id === wordId);
    if (!wordToUpdate) return;
    
    const updatedWord = { ...wordToUpdate, isStarred: !wordToUpdate.isStarred };
    onUpdateWord(updatedWord);
    
    setStudyWords(prevWords => 
        prevWords.map(w => w.id === updatedWord.id ? updatedWord : w)
    );
  };
  
  const starredWordsCount = useMemo(() => appData.words.filter(w => w.isStarred).length, [appData.words]);

  if (!studyStarted) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">단어 외우기</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">학습할 폴더를 선택해주세요.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button onClick={() => startStudy('all')} className="flex items-center justify-center gap-2 p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
            <FolderIcon /> 모든 단어 ({appData.words.length})
          </button>
           <button onClick={() => startStudy('starred')} className="flex items-center justify-center gap-2 p-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold">
            <StarIcon filled /> 별표 단어 ({starredWordsCount})
          </button>
          <button onClick={() => startStudy('unassigned')} className="flex items-center justify-center gap-2 p-4 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold">
            <FolderIcon /> 미분류 ({appData.words.filter(w => w.folderId === null).length})
          </button>
          {appData.folders.map(folder => (
            <button key={folder.id} onClick={() => startStudy(folder.id)} className="flex items-center justify-center gap-2 p-4 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold">
              <FolderIcon /> {folder.name} ({appData.words.filter(w => w.folderId === folder.id).length})
            </button>
          ))}
        </div>
        {appData.words.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400 mt-8">단어를 먼저 추가해주세요.</p>
        )}
      </div>
    );
  }
  
  const currentWord = studyWords[currentIndex];
  const studiedWords = studyWords.slice(0, currentIndex);

  if (currentIndex >= studyWords.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">학습 완료!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">모든 단어를 학습했습니다.</p>
        <div className="flex justify-center gap-4">
            <button onClick={() => startStudy(lastStudiedFolder)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">다시하기</button>
            <button onClick={resetStudy} className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold">폴더 선택으로</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Main Study Card */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg relative">
          <div className="absolute top-4 left-6 text-sm text-slate-500 font-medium">
             {currentIndex + 1} / {studyWords.length}
          </div>
           <button onClick={resetStudy} className="absolute top-4 right-6 text-sm text-slate-400 hover:text-slate-200">폴더 선택으로</button>
        <div className="grid grid-cols-2 gap-8 min-h-[200px] items-center mt-8">
          <div className="text-center">
             <div className="flex items-center justify-center gap-3">
                <p className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white break-words">
                  {currentWord?.english}
                </p>
                <button 
                  onClick={() => currentWord && handleToggleStar(currentWord.id)} 
                  className={`p-1 rounded-full transition-colors ${currentWord?.isStarred ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-400 hover:text-yellow-400'}`}
                  aria-label="Toggle Star"
                >
                    <StarIcon filled={!!currentWord?.isStarred} />
                </button>
             </div>
          </div>
          <div className="text-center text-xl sm:text-2xl text-slate-700 dark:text-slate-300">
            {isRevealed && (
              <div className="animate-fade-in">
                <p>{currentWord?.korean}</p>
                {currentWord?.korean2 && <p className="text-slate-500 dark:text-slate-400 mt-1">{currentWord.korean2}</p>}
              </div>
            )}
          </div>
        </div>
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>스페이스바를 눌러 뜻을 확인하고 다음 단어로 넘어가세요.</p>
        </div>
      </div>

      {/* Studied Words Section */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold mb-3 text-slate-800 dark:text-slate-100">학습한 단어</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
              {studiedWords.length > 0 ? (
                  studiedWords.slice().reverse().map(word => (
                      <div key={word.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 animate-fade-in">
                          <div>
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{word.english}</p>
                            <p className="text-slate-500 dark:text-slate-400">{word.korean}</p>
                          </div>
                          <button
                            onClick={() => handleToggleStar(word.id)}
                            className={`p-1 rounded-full transition-colors ${word.isStarred ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-400 hover:text-yellow-400'}`}
                            aria-label={`Toggle star for ${word.english}`}
                           >
                            <StarIcon filled={!!word.isStarred} className="h-5 w-5" />
                          </button>
                      </div>
                  ))
              ) : (
                  <p className="text-sm text-center text-slate-500 dark:text-slate-400 py-8">첫 단어입니다!</p>
              )}
          </div>
      </div>
    </div>
  );
};

export default Study;