export interface Word {
  id: string;
  english: string;
  korean: string;
  korean2?: string; // 두 번째 뜻 (선택 사항)
  folderId: string | null; // null은 '미분류'를 의미합니다.
  isStarred?: boolean; // 별표 표시 여부
}

export interface Folder {
  id:string;
  name: string;
}

export interface AppData {
  folders: Folder[];
  words: Word[];
}