import { NextRequest, NextResponse } from 'next/server';
import { 
  fetchWordsFromNotion, 
  createWordInNotion, 
  updateWordInNotion, 
  deleteWordInNotion 
} from '@/lib/notion';
import { Word } from '@/types';

// GET - 모든 단어 가져오기
export async function GET() {
  try {
    const words = await fetchWordsFromNotion();
    return NextResponse.json({ success: true, words });
  } catch (error) {
    console.error('GET /api/notion/words error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch words' },
      { status: 500 }
    );
  }
}

// POST - 새 단어 생성
export async function POST(request: NextRequest) {
  try {
    const word: Word = await request.json();
    
    // 입력 검증
    if (!word.english?.trim() || !word.korean?.trim()) {
      return NextResponse.json(
        { success: false, error: 'English and Korean fields are required' },
        { status: 400 }
      );
    }

    // 입력 데이터 정화 (XSS 방지)
    const sanitizedWord: Word = {
      ...word,
      english: word.english.trim().substring(0, 500),
      korean: word.korean.trim().substring(0, 500),
      korean2: word.korean2 ? word.korean2.trim().substring(0, 500) : undefined,
    };

    const notionPageId = await createWordInNotion(sanitizedWord);
    
    return NextResponse.json({ 
      success: true, 
      word: { ...sanitizedWord, notionPageId } 
    });
  } catch (error) {
    console.error('POST /api/notion/words error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create word' },
      { status: 500 }
    );
  }
}

// PUT - 단어 업데이트
export async function PUT(request: NextRequest) {
  try {
    const word: Word = await request.json();
    
    if (!word.notionPageId) {
      return NextResponse.json(
        { success: false, error: 'Notion page ID is required for update' },
        { status: 400 }
      );
    }

    // 입력 검증
    if (!word.english?.trim() || !word.korean?.trim()) {
      return NextResponse.json(
        { success: false, error: 'English and Korean fields are required' },
        { status: 400 }
      );
    }

    // 입력 데이터 정화
    const sanitizedWord: Word = {
      ...word,
      english: word.english.trim().substring(0, 500),
      korean: word.korean.trim().substring(0, 500),
      korean2: word.korean2 ? word.korean2.trim().substring(0, 500) : undefined,
    };

    await updateWordInNotion(sanitizedWord);
    
    return NextResponse.json({ success: true, word: sanitizedWord });
  } catch (error) {
    console.error('PUT /api/notion/words error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update word' },
      { status: 500 }
    );
  }
}

// DELETE - 단어 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { notionPageId } = await request.json();
    
    if (!notionPageId) {
      return NextResponse.json(
        { success: false, error: 'Notion page ID is required' },
        { status: 400 }
      );
    }

    await deleteWordInNotion(notionPageId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/notion/words error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete word' },
      { status: 500 }
    );
  }
}