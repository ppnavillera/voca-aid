import { NextRequest, NextResponse } from 'next/server';
import { AppData } from '@/types';

// POST - 데이터 내보내기 (안전한 JSON 생성)
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

    // 데이터 정화 및 검증 (XSS 방지)
    const sanitizedData: AppData = {
      folders: appData.folders.map(folder => ({
        id: folder.id,
        name: folder.name.replace(/[<>]/g, '').trim().substring(0, 100),
        notionPageId: folder.notionPageId,
      })),
      words: appData.words.map(word => ({
        id: word.id,
        english: word.english.replace(/[<>]/g, '').trim().substring(0, 500),
        korean: word.korean.replace(/[<>]/g, '').trim().substring(0, 500),
        korean2: word.korean2 ? word.korean2.replace(/[<>]/g, '').trim().substring(0, 500) : undefined,
        folderId: word.folderId,
        isStarred: word.isStarred,
        notionPageId: word.notionPageId,
      })),
    };

    // 메타데이터 추가
    const exportData = {
      ...sanitizedData,
      exportedAt: new Date().toISOString(),
      version: '2.0',
      source: 'VocaAid-NextJS',
    };

    // JSON 문자열 생성
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Response 헤더 설정
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Content-Disposition', `attachment; filename="vocab_data_${new Date().toISOString().split('T')[0]}.json"`);
    
    return new NextResponse(jsonString, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('POST /api/export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}