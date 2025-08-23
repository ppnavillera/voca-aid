'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { Word, AppData, Folder } from '@/types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { FolderIcon } from './icons/FolderIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { UploadIcon } from './icons/UploadIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { PencilIcon } from './icons/PencilIcon';
import { SwitchHorizontalIcon } from './icons/SwitchHorizontalIcon';

interface WordManagementProps {
  appData: AppData;
  onAddWord: (english: string, korean: string, korean2: string, folderId: string | null) => void;
  onDeleteWord: (id: string) => void;
  onUpdateWord: (word: Word) => void;
  onMoveWords: (wordIds: string[], destinationFolderId: string | null) => void;
  onAddFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onImportData: (data: AppData) => void;
}

const EditWordModal: React.FC<{
  word: Word;
  folders: Folder[];
  onSave: (updatedWord: Word) => void;
  onClose: () => void;
}> = ({ word, folders, onSave, onClose }) => {
  const [editedEnglish, setEditedEnglish] = useState(word.english);
  const [editedKorean, setEditedKorean] = useState(word.korean);
  const [editedKorean2, setEditedKorean2] = useState(word.korean2 || '');
  const [editedFolderId, setEditedFolderId] = useState<string | null>(word.folderId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedEnglish.trim() === '' || editedKorean.trim() === '') return;

    onSave({
      ...word,
      english: editedEnglish.trim(),
      korean: editedKorean.trim(),
      korean2: editedKorean2.trim() !== '' ? editedKorean2.trim() : undefined,
      folderId: editedFolderId,
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{animationDuration: '0.15s'}}
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">단어 수정</h2>
        <form onSubmit={handleSave} className="space-y-4">
            <input type="text" value={editedEnglish} onChange={(e) => setEditedEnglish(e.target.value)} placeholder="English Word" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" required />
            <input type="text" value={editedKorean} onChange={(e) => setEditedKorean(e.target.value)} placeholder="뜻 (Korean)" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" required />
            <input type="text" value={editedKorean2} onChange={(e) => setEditedKorean2(e.target.value)} placeholder="두 번째 뜻 (선택)" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" />
            
            <div>
              <label htmlFor="folder-select" className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">폴더</label>
              <select
                id="folder-select"
                value={editedFolderId === null ? 'unassigned' : editedFolderId}
                onChange={(e) => setEditedFolderId(e.target.value === 'unassigned' ? null : e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="unassigned">미분류</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors cursor-pointer">
                취소
              </button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
                저장
              </button>
            </div>
        </form>
      </div>
    </div>
  );
};


const WordManagement: React.FC<WordManagementProps> = ({ appData, onAddWord, onDeleteWord, onUpdateWord, onMoveWords, onAddFolder, onDeleteFolder, onImportData }) => {
  const [newEnglish, setNewEnglish] = useState('');
  const [newKorean, setNewKorean] = useState('');
  const [newKorean2, setNewKorean2] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | 'all' | 'unassigned'>('all');
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());
  const [moveTargetFolderId, setMoveTargetFolderId] = useState<string>('');

  const englishInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredWords = useMemo(() => {
    if (selectedFolderId === 'all') return appData.words;
    if (selectedFolderId === 'unassigned') return appData.words.filter(w => w.folderId === null);
    return appData.words.filter(w => w.folderId === selectedFolderId);
  }, [appData.words, selectedFolderId]);

  useEffect(() => {
    setSelectedWordIds(new Set());
  }, [selectedFolderId, filteredWords.length]);


  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    const folderId = selectedFolderId === 'all' || selectedFolderId === 'unassigned' ? null : selectedFolderId;
    onAddWord(newEnglish, newKorean, newKorean2, folderId);
    setNewEnglish('');
    setNewKorean('');
    setNewKorean2('');
    englishInputRef.current?.focus();
  };

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    onAddFolder(newFolderName);
    setNewFolderName('');
  };

  const handleToggleWordSelection = (wordId: string) => {
    setSelectedWordIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(wordId)) {
            newSet.delete(wordId);
        } else {
            newSet.add(wordId);
        }
        return newSet;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedWordIds.size === filteredWords.length) {
        setSelectedWordIds(new Set());
    } else {
        setSelectedWordIds(new Set(filteredWords.map(w => w.id)));
    }
  };
  
  const handleMoveWords = () => {
    if (moveTargetFolderId === '' || selectedWordIds.size === 0) return;
    const destinationFolderId = moveTargetFolderId === 'unassigned' ? null : moveTargetFolderId;
    onMoveWords(Array.from(selectedWordIds), destinationFolderId);
    setSelectedWordIds(new Set());
    setMoveTargetFolderId('');
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'vocab_data.json';
        
        const linkElement = document.createElement('a');
        linkElement.href = url;
        linkElement.download = filename;
        linkElement.click();
        
        window.URL.revokeObjectURL(url);
      } else {
        alert('데이터 내보내기에 실패했습니다.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('데이터 내보내기 중 오류가 발생했습니다.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File content is not a string");
        const data = JSON.parse(text);
        if (data && Array.isArray(data.folders) && Array.isArray(data.words)) {
          if (window.confirm('현재 단어장을 덮어쓰시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            onImportData(data);
          }
        } else {
          alert('잘못된 파일 형식입니다.');
        }
      } catch (error) {
        console.error("Failed to import data:", error);
        alert('파일을 불러오는 데 실패했습니다.');
      } finally {
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const FolderListItem = ({id, name}: {id: string | 'all' | 'unassigned', name: string}) => (
    <button
      onClick={() => setSelectedFolderId(id)}
      className={`w-full flex items-center justify-between text-left p-2 rounded-md text-sm transition-colors cursor-pointer ${selectedFolderId === id ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-700'}`}
    >
      <div className="flex items-center gap-2">
        <FolderIcon />
        <span>{name}</span>
      </div>
      <ChevronRightIcon className={`h-4 w-4 transition-transform ${selectedFolderId === id ? 'translate-x-0' : '-translate-x-1'}`} />
    </button>
  );

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Folders & Actions */}
        <div className="md:w-1/3 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg">
            <h2 className="text-lg font-bold mb-3 text-slate-800 dark:text-slate-100">폴더</h2>
            <div className="space-y-1">
              <FolderListItem id="all" name="모든 단어" />
              <FolderListItem id="unassigned" name="미분류" />
              <hr className="border-slate-700 my-2" />
              {appData.folders.map(folder => (
                <div key={folder.id} className="group flex items-center">
                  <button onClick={() => setSelectedFolderId(folder.id)} className={`flex-1 flex items-center gap-2 text-left p-2 rounded-md text-sm transition-colors cursor-pointer ${selectedFolderId === folder.id ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-700'}`}>
                      <FolderIcon />
                      <span className="truncate">{folder.name}</span>
                  </button>
                  <button onClick={() => onDeleteFolder(folder.id)} className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity cursor-pointer" aria-label={`Delete ${folder.name}`}>
                      <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddFolder} className="mt-4 flex gap-2">
                <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="새 폴더 이름" required className="flex-grow px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" />
                <button type="submit" className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-indigo-500 cursor-pointer" aria-label="Add new folder">
                  <PlusIcon />
                </button>
            </form>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg">
              <h2 className="text-lg font-bold mb-3 text-slate-800 dark:text-slate-100">데이터 관리</h2>
              <div className="flex gap-2">
                  <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
                  <button onClick={handleImportClick} className="flex-1 flex items-center justify-center gap-2 text-sm bg-slate-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
                      <UploadIcon /> 가져오기
                  </button>
                  <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 text-sm bg-slate-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
                      <DownloadIcon /> 내보내기
                  </button>
              </div>
          </div>
        </div>

        {/* Right Column - Words */}
        <div className="md:w-2/3 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">새 단어 추가</h2>
            <form onSubmit={handleAddWord} className="space-y-4">
              <input ref={englishInputRef} type="text" value={newEnglish} onChange={(e) => setNewEnglish(e.target.value)} placeholder="English Word" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" required />
              <input type="text" value={newKorean} onChange={(e) => setNewKorean(e.target.value)} placeholder="뜻 (Korean)" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" required />
              <input type="text" value={newKorean2} onChange={(e) => setNewKorean2(e.target.value)} placeholder="두 번째 뜻 (선택)" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" />
              <div className="text-sm text-slate-500 dark:text-slate-400">
                추가할 폴더: <span className="font-semibold text-indigo-400">
                  {selectedFolderId === 'all' || selectedFolderId === 'unassigned' ? '미분류' : appData.folders.find(f => f.id === selectedFolderId)?.name}
                </span>
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-indigo-500 transition-transform transform active:scale-95 shadow-md cursor-pointer">
                <PlusIcon /> 추가하기
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">단어 목록 ({filteredWords.length})</h2>
                {filteredWords.length > 0 && (
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-200 dark:bg-slate-600 cursor-pointer"
                            checked={filteredWords.length > 0 && selectedWordIds.size === filteredWords.length}
                            onChange={handleToggleSelectAll}
                            id="selectAllCheckbox"
                            aria-label="Select all words"
                        />
                        <label htmlFor="selectAllCheckbox" className="text-sm text-slate-600 dark:text-slate-400 select-none cursor-pointer">전체 선택</label>
                    </div>
                )}
            </div>

            {selectedWordIds.size > 0 && (
                <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedWordIds.size}개 단어 선택됨</span>
                    <div className="flex items-center gap-2">
                        <select
                           value={moveTargetFolderId}
                           onChange={(e) => setMoveTargetFolderId(e.target.value)}
                           className="text-sm px-3 py-1.5 bg-slate-200 dark:bg-slate-600 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        >
                            <option value="" disabled>폴더 선택...</option>
                            <option value="unassigned">미분류</option>
                            {appData.folders.map(folder => (
                                <option key={folder.id} value={folder.id}>{folder.name}</option>
                            ))}
                        </select>
                        <button onClick={handleMoveWords} className="flex items-center gap-1.5 text-sm bg-indigo-600 text-white font-bold py-1.5 px-3 rounded-md hover:bg-indigo-700 transition-colors cursor-pointer disabled:cursor-not-allowed" disabled={!moveTargetFolderId}>
                            <SwitchHorizontalIcon />
                            <span>이동</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
              {filteredWords.length > 0 ? (
                filteredWords.map((word) => (
                  <div key={word.id} className="flex items-center justify-between bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg animate-fade-in">
                    <div className="flex items-center gap-3">
                       <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-200 dark:bg-slate-600 cursor-pointer"
                            checked={selectedWordIds.has(word.id)}
                            onChange={() => handleToggleWordSelection(word.id)}
                            aria-label={`Select ${word.english}`}
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{word.english}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{word.korean}</p>
                          {word.korean2 && <p className="text-sm text-slate-500 dark:text-slate-400/80">{word.korean2}</p>}
                        </div>
                    </div>
                    <div className="flex items-center shrink-0">
                      <button onClick={() => setEditingWord(word)} className="p-2 rounded-full text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-indigo-500/10 transition-colors cursor-pointer" aria-label={`Edit ${word.english}`}>
                          <PencilIcon />
                      </button>
                      <button onClick={() => onDeleteWord(word.id)} className="p-2 rounded-full text-slate-400 hover:bg-red-500/10 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-red-500/10 transition-colors cursor-pointer" aria-label={`Delete ${word.english}`}>
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">표시할 단어가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {editingWord && (
        <EditWordModal
          word={editingWord}
          folders={appData.folders}
          onSave={onUpdateWord}
          onClose={() => setEditingWord(null)}
        />
      )}
    </>
  );
};

export default WordManagement;