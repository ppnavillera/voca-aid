import { Client } from '@notionhq/client';
import { AppData, Word, NotionWord } from '@/types';

// Notion 설정 (선택적) - 환경변수가 없어도 오류 없이 동작
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

export const notion = NOTION_TOKEN ? new Client({ auth: NOTION_TOKEN }) : null;
export { DATABASE_ID };

// Notion 데이터를 Word 형식으로 변환
export function convertNotionToWord(notionPage: NotionWord): Word {
  const english = notionPage.properties.English.title[0]?.text.content || '';
  const korean = notionPage.properties.Korean.rich_text[0]?.text.content || '';
  const korean2 = notionPage.properties.Korean2?.rich_text[0]?.text.content;
  const folderId = notionPage.properties.FolderId?.rich_text[0]?.text.content || null;
  const isStarred = notionPage.properties.IsStarred?.checkbox || false;

  return {
    id: notionPage.id,
    english,
    korean,
    korean2,
    folderId,
    isStarred,
    notionPageId: notionPage.id
  };
}

// Word 데이터를 Notion 형식으로 변환
export function convertWordToNotionProperties(word: Word) {
  return {
    English: {
      title: [{ text: { content: word.english } }]
    },
    Korean: {
      rich_text: [{ text: { content: word.korean } }]
    },
    ...(word.korean2 && {
      Korean2: {
        rich_text: [{ text: { content: word.korean2 } }]
      }
    }),
    ...(word.folderId && {
      FolderId: {
        rich_text: [{ text: { content: word.folderId } }]
      }
    }),
    IsStarred: { checkbox: word.isStarred || false }
  };
}

// 로컬 ID 생성 함수
function generateLocalId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 다음 함수들은 추후 Notion 연결 시 사용 예정
export async function fetchWordsFromNotion(): Promise<Word[]> {
  console.log('Notion sync not yet implemented');
  return [];
}

export async function createWordInNotion(word: Word): Promise<string> {
  console.log('Notion word creation not yet implemented:', word);
  return generateLocalId();
}

export async function updateWordInNotion(word: Word): Promise<void> {
  console.log('Notion word update not yet implemented:', word);
}

export async function deleteWordFromNotion(wordId: string): Promise<void> {
  console.log('Notion word deletion not yet implemented:', wordId);
}

// 전체 데이터 동기화
export async function syncDataToNotion(appData: AppData): Promise<void> {
  console.log('Notion sync not yet implemented:', appData);
}