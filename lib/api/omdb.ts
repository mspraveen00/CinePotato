const OMDB_BASE_URL = 'http://www.omdbapi.com';
const OMDB_API_KEY = process.env.OMDB_API_KEY;

export async function fetchOMDb<T>(params: Record<string, string>): Promise<T> {
    const url = new URL(OMDB_BASE_URL);
    url.searchParams.append('apikey', OMDB_API_KEY!);

    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

    const res = await fetch(url.toString(), {
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        throw new Error(`OMDb Error: ${res.status}`);
    }

    return res.json();
}
