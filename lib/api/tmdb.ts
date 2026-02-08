const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_READ_ACCESS_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;

export async function fetchTMDB<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
    }

    const res = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${TMDB_READ_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour by default
    });

    if (!res.ok) {
        throw new Error(`TMDB Error: ${res.status} ${res.statusText}`);
    }

    return res.json();
}

// Types will be added as needed
