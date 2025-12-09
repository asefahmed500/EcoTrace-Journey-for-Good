import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { deleteAccount } from '@/app/actions';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await deleteAccount();
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error('Error in user delete API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting account.' },
      { status: 500 }
    );
  }
}