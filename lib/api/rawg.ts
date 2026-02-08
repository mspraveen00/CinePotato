const RAWG_BASE_URL = 'https://api.rawg.io/api';
const RAWG_API_KEY = process.env.RAWG_API_KEY;

export async function fetchRAWG<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${RAWG_BASE_URL}/${endpoint}`);
    url.searchParams.append('key', RAWG_API_KEY!);

    if (params) {
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
    }

    const res = await fetch(url.toString(), {
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        throw new Error(`RAWG Error: ${res.status} ${res.statusText}`);
    }

    return res.json();
}
