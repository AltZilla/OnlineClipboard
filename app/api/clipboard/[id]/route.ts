import { NextRequest, NextResponse } from 'next/server';
import { getClipboard, updateClipboard, deleteClipboard, cleanupExpiredClipboards } from '@/lib/storage-mongodb';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
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
      { success: false, error: 'Failed to get clipboard' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { content } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Clipboard ID is required' },
        { status: 400 }
      );
    }
    
    const success = await updateClipboard(id, content);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Clipboard not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Clipboard updated successfully',
    });
  } catch (error) {
    console.error('Error updating clipboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update clipboard' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Clipboard ID is required' },
        { status: 400 }
      );
    }
    
    const success = await deleteClipboard(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Clipboard not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Clipboard deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting clipboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete clipboard' },
      { status: 500 }
    );
  }
}
