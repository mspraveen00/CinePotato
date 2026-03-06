const fs = require('fs');
const https = require('http');

let env = fs.readFileSync('.env.local', 'utf-8');
let apiKey = env.split('\n').find(line => line.startsWith('OMDB_API_KEY=')).split('=')[1].trim();

https.get(`http://www.omdbapi.com/?apikey=${apiKey}&i=tt0468569`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(JSON.parse(data)));
});
