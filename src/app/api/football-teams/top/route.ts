import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '9';
    
    const response = await fetch(`${BACKEND_URL}/football-teams/top?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend response: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching top teams:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch top teams',
        details: error instanceof Error ? error.message : 'Unknown error',
        backendUrl: BACKEND_URL
      },
      { status: 500 }
    );
  }
} 