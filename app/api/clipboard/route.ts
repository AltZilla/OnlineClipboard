import { NextRequest, NextResponse } from 'next/server';
import { createClipboard, getClipboard, getAllClipboards, cleanupExpiredClipboards } from '@/lib/storage-mongodb';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Run cleanup on each request
    await cleanupExpiredClipboards();
    
    const body = await request.json();
    const content = body.content || '';
    const isPublic = body.isPublic === true; // Default to false
    
    console.log('API: Creating clipboard - isPublic from body:', body.isPublic, 'parsed as:', isPublic);
    
    // Note: Files are uploaded after clipboard creation
    // Frontend should validate that either text or files are present before creating
    // Backend allows empty content to support file-only clipboards
    
    const clipboard = await createClipboard(content, isPublic);
    console.log('API: Created clipboard - returned isPublic:', clipboard.isPublic);
    
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
    const all = searchParams.get('all');
    
    // Run cleanup on each request
    await cleanupExpiredClipboards();
    
    // If 'all' parameter is present, return all clipboards
    if (all === 'true') {
      const publicOnly = searchParams.get('public') === 'true';
      const clipboards = await getAllClipboards(50, publicOnly);
      console.log(`Fetching clipboards - publicOnly: ${publicOnly}, found: ${clipboards.length}`);
      return NextResponse.json({
        success: true,
        clipboards,
      });
    }
    
    // Otherwise, require an ID
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Clipboard ID is required' },
        { status: 400 }
      );
    }
    
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
