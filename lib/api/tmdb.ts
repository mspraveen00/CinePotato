const TMDB_API_URL = 'https://api.themoviedb.org/3';

export async function fetchTMDB<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = process.env.TMDB_READ_ACCESS_TOKEN;
    if (!token) {
        throw new Error("Missing TMDB_READ_ACCESS_TOKEN");
    }

    const url = `${TMDB_API_URL}${path.startsWith('/') ? path : `/${path}`}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                ...options.headers,
            },
            next: { revalidate: 3600, ...options.next },
        });

        if (!response.ok) {
            throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error(`TMDB Fetch Error for ${path}:`, error);
        throw error;
    }
}
