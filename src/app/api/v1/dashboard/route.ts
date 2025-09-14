import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';

export async function GET(request: NextRequest) {
  try {
    // Forward request to FastAPI backend
    const response = await fetch(`${BACKEND_URL}/api/v1/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend dashboard API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch dashboard data from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Dashboard API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching dashboard data' },
      { status: 500 }
    );
  }
}
