import dns from "node:dns";

try {
    dns.setDefaultResultOrder("ipv4first");
} catch {
    // Ignore in edge/browser environments if any
}

const TMDB_API_URL = 'https://api.themoviedb.org/3';

export async function fetchTMDB<T>(path: string, options: RequestInit = {}, retries = 2): Promise<T> {
    const token = process.env.TMDB_READ_ACCESS_TOKEN;
    if (!token) {
        throw new Error("Missing TMDB_READ_ACCESS_TOKEN");
    }

    const url = `${TMDB_API_URL}${path.startsWith('/') ? path : `/${path}`}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
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

            return await response.json();
        } catch (error) {
            if (attempt < retries) {
                await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
                continue;
            }
            console.error(`TMDB Fetch Error for ${path}:`, error);
            throw error;
        }
    }

    throw new Error(`TMDB Fetch failed for ${path} after retries`);
}

