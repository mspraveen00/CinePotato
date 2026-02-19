import { NextRequest, NextResponse } from 'next/server';
import { fetchIGDB } from '@/lib/api/igdb';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const endpoint = path.join('/');

    // Validate that we have a body (IGDB queries are always POST with a body)
    let body: string;
    try {
        body = await request.text();
    } catch (e) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    try {
        const data = await fetchIGDB(endpoint, body);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("IGDB Proxy Error:", error);

        // Simple error parsing
        const status = error.message?.includes('401') ? 401 : 500;
        return NextResponse.json(
            { error: error.message || "Failed to fetch from IGDB" },
            { status }
        );
    }
}
