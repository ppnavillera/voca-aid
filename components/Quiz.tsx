import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Word, AppData } from '../types';
import { FolderIcon } from './icons/FolderIcon';
import { StarIcon } from './icons/StarIcon';

interface QuizProps {
  appData: AppData;
  onUpdateWord: (word: Word) => void;
}

type QuizResult = {
    word: Word;
    userAnswer: string;
    isCorrect: boolean;
};

const Quiz: React.FC<QuizProps> = ({ appData, onUpdateWord }) => {
  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const answerInputRef = React.useRef<HTMLInputElement>(null);
  const nextWordButtonRef = React.useRef<HTMLButtonElement>(null);

  const [wordIndex, setWordIndex] = useState(0);
  const [lastQuizFolder, setLastQuizFolder] = useState<string | 'all' | 'unassigned' | null>(null);


  const selectNextWord = useCallback(() => {
    if (quizWords.length === 0) {
      setCurrentWord(null);
      return;
    }
    
    const nextIndex = wordIndex + 1;
    if (nextIndex < quizWords.length) {
      setWordIndex(nextIndex);
      setCurrentWord(quizWords[nextIndex]);
      setUserAnswer('');
      setIsCorrect(null);
      setShowAnswer(false);
    }
  }, [quizWords, wordIndex]);

  useEffect(() => {
    if(quizStarted && !quizFinished && quizWords.length > 0) {
      setCurrentWord(quizWords[0]);
      setWordIndex(0);
    } else {
      setCurrentWord(null);
    }
  }, [quizStarted, quizFinished, quizWords]);

  useEffect(() => {
    // Handles focusing the correct element based on quiz state.
    // When the answer is shown, focus the "Next" button for easy progression.
    if (showAnswer) {
      nextWordButtonRef.current?.focus();
    } 
    // When a new question is presented (including the first one), focus the input field.
    else if (quizStarted && !quizFinished && currentWord) {
      answerInputRef.current?.focus();
    }
  }, [showAnswer, quizStarted, quizFinished, currentWord]);

  const startQuiz = (folderId: string | 'all' | 'unassigned' | null) => {
    let wordsForQuiz: Word[];
    if (folderId === 'all' || folderId === null) {
      wordsForQuiz = appData.words;
    } else if (folderId === 'unassigned') {
      wordsForQuiz = appData.words.filter(w => w.folderId === null);
    } else {
      wordsForQuiz = appData.words.filter(w => w.folderId === folderId);
    }

    if (wordsForQuiz.length === 0) {
      alert("이 폴더에는 퀴즈를 풀 단어가 없습니다.");
      return;
    }

    setLastQuizFolder(folderId);
    setQuizWords([...wordsForQuiz].sort(() => Math.random() - 0.5));
    setQuizStarted(true);
    setQuizFinished(false);
    setQuizResults([]);
  };

  const handleCheckAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWord || userAnswer.trim() === '') return;
    
    const answer = userAnswer.trim().toLowerCase();
    const correct = answer === currentWord.korean.toLowerCase() ||
                    (!!currentWord.korean2 && answer === currentWord.korean2.toLowerCase());
    
    setIsCorrect(correct);
    setShowAnswer(true);
    setQuizResults(prev => [...prev, { word: currentWord, userAnswer: userAnswer.trim(), isCorrect: correct }]);
  };

  const handleToggleStar = (wordId: string) => {
    const wordToUpdate = appData.words.find(w => w.id === wordId);
    if (!wordToUpdate) return;
    
    const updatedWord = { ...wordToUpdate, isStarred: !wordToUpdate.isStarred };
    onUpdateWord(updatedWord);

    setQuizResults(prevResults => 
        prevResults.map(result => 
            result.word.id === wordId 
            ? { ...result, word: updatedWord }
            : result
        )
    );
  };
  
  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizFinished(false);
    setQuizWords([]);
    setQuizResults([]);
    setWordIndex(0);
  }

  if (quizFinished) {
    const correctAnswers = quizResults.filter(r => r.isCorrect);
    const incorrectAnswers = quizResults.filter(r => !r.isCorrect);

    const ResultItem = ({ result }: { result: QuizResult }) => (
      <div className="flex items-start justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50">
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{result.word.english}</p>
          <p className="text-sm text-green-600 dark:text-green-400">정답: {result.word.korean}{result.word.korean2 ? `, ${result.word.korean2}` : ''}</p>
          {!result.isCorrect && <p className="text-sm text-red-500 dark:text-red-400">내 답변: {result.userAnswer}</p>}
        </div>
        <button
          onClick={() => handleToggleStar(result.word.id)}
          className={`p-1 rounded-full transition-colors ${result.word.isStarred ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-400 hover:text-yellow-400'}`}
          aria-label={`Toggle star for ${result.word.english}`}
        >
          <StarIcon filled={!!result.word.isStarred} className="h-5 w-5" />
        </button>
      </div>
    );
    
    return (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-2 text-center">퀴즈 결과</h2>
            <p className="text-center text-lg text-slate-500 dark:text-slate-400 mb-6">
                총 <span className="font-bold text-indigo-500">{quizResults.length}</span>개 중 <span className="font-bold text-green-500">{correctAnswers.length}</span>개 정답
            </p>
            
            <div className="flex justify-center gap-4 mb-6">
              <button onClick={() => startQuiz(lastQuizFolder)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">다시하기</button>
              <button onClick={resetQuiz} className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold">폴더 선택으로</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-bold mb-3 text-red-500 dark:text-red-400">틀린 단어 ({incorrectAnswers.length})</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {incorrectAnswers.length > 0 ? incorrectAnswers.map(r => <ResultItem key={r.word.id} result={r} />) : <p className="text-sm text-slate-500">틀린 단어가 없습니다!</p>}
                    </div>
                </div>
                <div>
                    <h3 className="font-bold mb-3 text-green-500 dark:text-green-400">맞은 단어 ({correctAnswers.length})</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                         {correctAnswers.length > 0 ? correctAnswers.map(r => <ResultItem key={r.word.id} result={r} />) : <p className="text-sm text-slate-500">맞은 단어가 없습니다.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
  }
  
  if (!quizStarted) {
     return (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">퀴즈 시작하기</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">퀴즈를 볼 폴더를 선택해주세요.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => startQuiz('all')} className="flex items-center justify-center gap-2 p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                    <FolderIcon /> 모든 단어 ({appData.words.length})
                </button>
                <button onClick={() => startQuiz('unassigned')} className="flex items-center justify-center gap-2 p-4 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold">
                    <FolderIcon /> 미분류 ({appData.words.filter(w => w.folderId === null).length})
                </button>
                {appData.folders.map(folder => (
                    <button key={folder.id} onClick={() => startQuiz(folder.id)} className="flex items-center justify-center gap-2 p-4 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold">
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

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg text-center relative">
      {currentWord ? (
        <>
          <button onClick={resetQuiz} className="absolute top-4 right-4 text-sm text-slate-400 hover:text-slate-200">폴더 선택으로</button>
          <div className="absolute top-4 left-4 text-sm text-slate-500 font-medium">
             {wordIndex + 1} / {quizWords.length}
          </div>
          <form onSubmit={handleCheckAnswer}>
            <p className="text-sm text-indigo-500 font-semibold mb-2 mt-6">다음 단어의 뜻은 무엇인가요?</p>
            <div className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-white mb-6 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
              {currentWord.english}
            </div>
            
            <input
              ref={answerInputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="정답을 입력하세요"
              className="w-full text-center px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-slate-900 dark:text-white text-lg"
              disabled={showAnswer}
              required
              autoComplete="off"
            />

            {showAnswer ? (
              <div className="mt-4">
                <div className={`p-4 rounded-lg font-bold text-white ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                  {isCorrect ? '정답입니다!' : '틀렸습니다!'}
                </div>
                <p className="mt-2 text-slate-600 dark:text-slate-300">정답: <span className="font-bold">{currentWord.korean}{currentWord.korean2 ? `, ${currentWord.korean2}` : ''}</span></p>

                {wordIndex < quizWords.length - 1 ? (
                   <button
                    ref={nextWordButtonRef}
                    type="button"
                    onClick={selectNextWord}
                    className="w-full mt-4 bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-slate-500 transition-transform transform active:scale-95 shadow-md"
                  >
                    다음 단어
                  </button>
                ) : (
                   <button
                    ref={nextWordButtonRef}
                    type="button"
                    onClick={() => setQuizFinished(true)}
                    className="w-full mt-4 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-indigo-500 transition-transform transform active:scale-95 shadow-md"
                  >
                    결과 보기
                  </button>
                )}
              </div>
            ) : (
              <button
                type="submit"
                className="w-full mt-4 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-indigo-500 transition-transform transform active:scale-95 shadow-md"
              >
                확인하기
              </button>
            )}
          </form>
        </>
      ) : (
        <p>단어를 불러오는 중...</p>
      )}
    </div>
  );
};

export default Quiz;