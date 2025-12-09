import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-wrapper';
import { handleCalculateCarbon } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { origin, destination, modeOfTransport, vehicleType, originCoords, destinationCoords, departureTime, includeAlternatives } = body;

    if (!origin || !destination || !modeOfTransport) {
      return NextResponse.json(
        { error: 'Missing required fields: origin, destination, modeOfTransport' },
        { status: 400 }
      );
    }

    // Convert to FormData format expected by the server action
    const formData = new FormData();
    formData.append('origin', origin);
    formData.append('destination', destination);
    formData.append('modeOfTransport', modeOfTransport);
    if (vehicleType) {
      formData.append('vehicleType', vehicleType);
    }
    if (originCoords) {
      formData.append('originCoords', JSON.stringify(originCoords));
    }
    if (destinationCoords) {
      formData.append('destinationCoords', JSON.stringify(destinationCoords));
    }
    if (departureTime) {
      formData.append('departureTime', departureTime);
    }
    if (includeAlternatives !== undefined) {
      formData.append('includeAlternatives', includeAlternatives.toString());
    }

    const result = await handleCalculateCarbon({}, formData);
    
    if (result.error) {
      return NextResponse.json({ error: result.error, fieldErrors: result.fieldErrors }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in carbon calculate API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while calculating carbon emissions.' },
      { status: 500 }
    );
  }
}