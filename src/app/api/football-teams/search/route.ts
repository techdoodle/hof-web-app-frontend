import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json([]);
    }
    
    const response = await fetch(`${BACKEND_URL}/football-teams/search?q=${encodeURIComponent(query)}`, {
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
    console.error('Error searching teams:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search teams',
        details: error instanceof Error ? error.message : 'Unknown error',
        backendUrl: BACKEND_URL
      },
      { status: 500 }
    );
  }
} 