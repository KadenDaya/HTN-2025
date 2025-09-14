import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE || process.env.BACKEND_URL || 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authorization = request.headers.get('authorization');
    
    // Get the request body
    const body = await request.json();
    
    // Validate required fields
    const { monthly_income, monthly_rent, risk_tolerance } = body;
    if (!monthly_income || !monthly_rent || !risk_tolerance) {
      return NextResponse.json(
        { error: 'Missing required fields: monthly_income, monthly_rent, risk_tolerance' },
        { status: 400 }
      );
    }

    // Forward request to FastAPI backend with validated data
    const response = await fetch(`${BACKEND_URL}/api/v1/house-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { 'Authorization': authorization }),
      },
      body: JSON.stringify({
        monthly_income: parseFloat(monthly_income),
        monthly_rent: parseFloat(monthly_rent),
        risk_tolerance: risk_tolerance
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('House analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}