const CLIENT_ID = 'vpbiqhozzauvjl4ahsbzu3gdb0ilgm';
const ACCESS_TOKEN = 'zx73dlznj5m30p5hfqtinposgoyd74';

async function test() {
    const res = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
            'Client-ID': CLIENT_ID,
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Accept': 'application/json'
        },
        body: 'search "Elden Ring"; fields name, artworks.*; limit 1;'
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

test();
