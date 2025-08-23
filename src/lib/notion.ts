import { Client } from '@notionhq/client';
import { AppData, Word, NotionWord } from '@/types';

if (!process.env.NOTION_TOKEN) {
  throw new Error('NOTION_TOKEN is required');
}

if (!process.env.NOTION_DATABASE_ID) {
  throw new Error('NOTION_DATABASE_ID is required');
}

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Notion 데이터를 Word 형식으로 변환
export function convertNotionToWord(notionPage: NotionWord): Word {
  const english = notionPage.properties.English.title[0]?.text.content || '';
  const korean = notionPage.properties.Korean.rich_text[0]?.text.content || '';
  const korean2 = notionPage.properties.Korean2?.rich_text[0]?.text.content;
  const folderId = notionPage.properties.FolderId?.rich_text[0]?.text.content || null;
  const isStarred = notionPage.properties.IsStarred?.checkbox || false;

  return {
    id: generateLocalId(), // 로컬 ID 생성
    english,
    korean,
    korean2,
    folderId,
    isStarred,
    notionPageId: notionPage.id,
  };
}

// Word를 Notion 형식으로 변환
export function convertWordToNotion(word: Word) {
  return {
    parent: { database_id: DATABASE_ID },
    properties: {
      English: {
        title: [{ text: { content: word.english } }],
      },
      Korean: {
        rich_text: [{ text: { content: word.korean } }],
      },
      ...(word.korean2 && {
        Korean2: {
          rich_text: [{ text: { content: word.korean2 } }],
        },
      }),
      ...(word.folderId && {
        FolderId: {
          rich_text: [{ text: { content: word.folderId } }],
        },
      }),
      IsStarred: {
        checkbox: word.isStarred || false,
      },
    },
  };
}

// 로컬 ID 생성 (충돌 방지)
function generateLocalId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Notion에서 모든 단어 가져오기
export async function fetchWordsFromNotion(): Promise<Word[]> {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      page_size: 100,
    });

    return response.results.map((page) => 
      convertNotionToWord(page as NotionWord)
    );
  } catch (error) {
    console.error('Error fetching words from Notion:', error);
    throw error;
  }
}

// Notion에 단어 생성
export async function createWordInNotion(word: Word): Promise<string> {
  try {
    const response = await notion.pages.create(convertWordToNotion(word));
    return response.id;
  } catch (error) {
    console.error('Error creating word in Notion:', error);
    throw error;
  }
}

// Notion에서 단어 업데이트
export async function updateWordInNotion(word: Word): Promise<void> {
  if (!word.notionPageId) {
    throw new Error('Notion page ID is required for update');
  }

  try {
    await notion.pages.update({
      page_id: word.notionPageId,
      properties: convertWordToNotion(word).properties,
    });
  } catch (error) {
    console.error('Error updating word in Notion:', error);
    throw error;
  }
}

// Notion에서 단어 삭제 (아카이브)
export async function deleteWordInNotion(notionPageId: string): Promise<void> {
  try {
    await notion.pages.update({
      page_id: notionPageId,
      archived: true,
    });
  } catch (error) {
    console.error('Error deleting word in Notion:', error);
    throw error;
  }
}

// 전체 데이터 동기화
export async function syncDataToNotion(appData: AppData): Promise<void> {
  const promises: Promise<void>[] = [];

  // 새로운 단어들을 Notion에 생성
  for (const word of appData.words) {
    if (!word.notionPageId) {
      promises.push(createWordInNotion(word));
    }
  }

  // 기존 단어들 업데이트
  for (const word of appData.words) {
    if (word.notionPageId) {
      promises.push(updateWordInNotion(word));
    }
  }

  try {
    await Promise.all(promises);
  } catch (error) {
    console.error('Error syncing data to Notion:', error);
    throw error;
  }
}