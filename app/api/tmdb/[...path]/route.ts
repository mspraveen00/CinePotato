import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_URL = 'https://api.themoviedb.org/3';
export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params

    // Validate Token presence server-side
    const token = process.env.TMDB_READ_ACCESS_TOKEN;
    if (!token) {
        // Safe debug: List keys (not values) to see what Vercel is actually providing
        const availableKeys = Object.keys(process.env).filter(k => !k.startsWith('VERCEL_') && !k.startsWith('SYSTEM_') && !k.startsWith('npm_'));
        const debugString = `Missing TMDB_READ_ACCESS_TOKEN. Available: ${availableKeys.join(', ')}`;
        console.error(debugString);
        return NextResponse.json({
            error: debugString,
            debug: {
                availableEnvKeys: availableKeys,
                nodeEnv: process.env.NODE_ENV,
                hasTmdbToken: !!process.env.TMDB_READ_ACCESS_TOKEN
            }
        }, { status: 500 });
    }

    // Reconstruct the path (e.g., ['search', 'multi'] -> '/search/multi')
    const endpoint = path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${TMDB_API_URL}/${endpoint}${searchParams ? `?${searchParams}` : ''}`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            next: { revalidate: 60 }, // Short cache for proxy
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("TMDB Proxy Error:", error);
        return NextResponse.json({ error: "Failed to fetch from TMDB" }, { status: 500 });
    }
}
