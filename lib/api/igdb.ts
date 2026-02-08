const IGDB_BASE_URL = 'https://api.igdb.com/v4';
const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID;
const IGDB_ACCESS_TOKEN = process.env.IGDB_ACCESS_TOKEN;

export async function fetchIGDB<T>(endpoint: string, query: string): Promise<T> {
    const url = `${IGDB_BASE_URL}/${endpoint}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Client-ID': IGDB_CLIENT_ID!,
            'Authorization': `Bearer ${IGDB_ACCESS_TOKEN}`,
            'Content-Type': 'text/plain',
        },
        body: query,
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        throw new Error(`IGDB Error: ${res.status} ${res.statusText}`);
    }

    return res.json();
}
