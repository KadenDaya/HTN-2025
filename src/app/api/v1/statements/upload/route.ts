import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    
    // Get the authorization header
    const authorization = request.headers.get('authorization');
    
    // Forward the request to the FastAPI backend
    const response = await fetch(`${BACKEND_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(authorization && { 'Authorization': authorization }),
      },
      body: formData,
    });

    // Get the response data
    const data = await response.json();

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}
