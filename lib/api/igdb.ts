const IGDB_BASE_URL = 'https://api.igdb.com/v4';
const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/token';

const CLIENT_ID = process.env.IGDB_CLIENT_ID;
const CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;

// Module-level cache for the access token
let tokenCache: { accessToken: string; expiresAt: number } | null = null;

async function getValidAccessToken(): Promise<string> {
    const now = Date.now();

    // Check if we have a valid token (refresh 60s before expiry)
    if (tokenCache && tokenCache.expiresAt > now + 60000) {
        return tokenCache.accessToken;
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error("Missing IGDB/Twitch credentials. check IGDB_CLIENT_ID and IGDB_CLIENT_SECRET.");
    }

    try {
        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'client_credentials',
        });

        const res = await fetch(`${TWITCH_AUTH_URL}?${params.toString()}`, {
            method: 'POST',
        });

        if (!res.ok) {
            throw new Error(`Twitch Auth Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        // data.expires_in is in seconds
        tokenCache = {
            accessToken: data.access_token,
            expiresAt: now + (data.expires_in * 1000),
        };

        return tokenCache.accessToken;
    } catch (error) {
        console.error("Failed to authenticate with Twitch:", error);
        throw error;
    }
}

export async function fetchIGDB<T>(endpoint: string, query: string): Promise<T> {
    const accessToken = await getValidAccessToken();
    const url = `${IGDB_BASE_URL}/${endpoint}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Client-ID': CLIENT_ID!,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'text/plain',
            'Accept': 'application/json',
        },
        body: query,
        // IGDB queries update frequently enough, but for search/details we can cache briefly
        // However, since this is a server-side call often behind another next api route,
        // we might rely on the next api route cache.
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error(`IGDB Error (${endpoint}): ${res.status} ${res.statusText}`);
    }

    return res.json();
}
