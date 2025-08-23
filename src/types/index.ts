export interface Word {
  id: string;
  english: string;
  korean: string;
  korean2?: string; // 두 번째 뜻 (선택 사항)
  folderId: string | null; // null은 '미분류'를 의미합니다.
  isStarred?: boolean; // 별표 표시 여부
  notionPageId?: string; // Notion page ID for sync
}

export interface Folder {
  id: string;
  name: string;
  notionPageId?: string; // Notion page ID for sync
}

export interface AppData {
  folders: Folder[];
  words: Word[];
}

// Notion API 관련 타입
export interface NotionWord {
  id: string;
  properties: {
    English: {
      title: Array<{
        text: {
          content: string;
        };
      }>;
    };
    Korean: {
      rich_text: Array<{
        text: {
          content: string;
        };
      }>;
    };
    Korean2?: {
      rich_text: Array<{
        text: {
          content: string;
        };
      }>;
    };
    FolderId?: {
      rich_text: Array<{
        text: {
          content: string;
        };
      }>;
    };
    IsStarred?: {
      checkbox: boolean;
    };
  };
}

export interface NotionResponse {
  results: NotionWord[];
  has_more: boolean;
  next_cursor?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime?: Date;
  hasLocalChanges: boolean;
  isLoading: boolean;
}