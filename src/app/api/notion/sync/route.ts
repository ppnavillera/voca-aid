import { NextRequest, NextResponse } from 'next/server';
import { syncDataToNotion } from '@/lib/notion';
import { AppData } from '@/types';

// POST - 전체 데이터 동기화
export async function POST(request: NextRequest) {
  try {
    const appData: AppData = await request.json();
    
    // 데이터 구조 검증
    if (!appData || !Array.isArray(appData.folders) || !Array.isArray(appData.words)) {
      return NextResponse.json(
        { success: false, error: 'Invalid data structure' },
        { status: 400 }
      );
    }

    // 입력 데이터 검증 및 정화
    const sanitizedData: AppData = {
      folders: appData.folders.map(folder => ({
        ...folder,
        name: folder.name.trim().substring(0, 100),
      })),
      words: appData.words.map(word => ({
        ...word,
        english: word.english.trim().substring(0, 500),
        korean: word.korean.trim().substring(0, 500),
        korean2: word.korean2 ? word.korean2.trim().substring(0, 500) : undefined,
      })),
    };

    await syncDataToNotion(sanitizedData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data synced successfully',
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('POST /api/notion/sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync data' },
      { status: 500 }
    );
  }
}