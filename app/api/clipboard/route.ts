import { NextRequest, NextResponse } from 'next/server';
import { createClipboard, getClipboard, cleanupExpiredClipboards } from '@/lib/storage-mongodb';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Run cleanup on each request
    cleanupExpiredClipboards();
    
    const body = await request.json();
    const content = body.content || '';
    
    const clipboard = await createClipboard(content);
    
    return NextResponse.json({
      success: true,
      clipboard,
    });
  } catch (error) {
    console.error('Error creating clipboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create clipboard. Please check your MongoDB connection.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Clipboard ID is required' },
        { status: 400 }
      );
    }
    
    // Run cleanup on each request
    cleanupExpiredClipboards();
    
    const clipboard = await getClipboard(id);
    
    if (!clipboard) {
      return NextResponse.json(
        { success: false, error: 'Clipboard not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      clipboard,
    });
  } catch (error) {
    console.error('Error getting clipboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get clipboard. Please check your MongoDB connection.' },
      { status: 500 }
    );
  }
}
