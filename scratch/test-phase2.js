const fs = require('fs');

async function test() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const token = env.split('\n').find(l => l.startsWith('TMDB_READ_ACCESS_TOKEN=')).split('=')[1].trim().replace(/^["']|["']$/g, '');

  const res = await fetch('https://api.themoviedb.org/3/movie/671?append_to_response=images,credits,videos,release_dates,watch/providers,recommendations,similar,keywords', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const keys = Object.keys(data).filter(k => ['images', 'credits', 'videos', 'release_dates', 'watch/providers', 'recommendations', 'similar', 'keywords'].includes(k));
  console.log('Movie matched appended keys:', keys);

  const tvRes = await fetch('https://api.themoviedb.org/3/tv/1399?append_to_response=images,credits,episode_groups,external_ids,videos,content_ratings,watch/providers,recommendations,similar,keywords', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const tvData = await tvRes.json();
  const tvKeys = Object.keys(tvData).filter(k => ['images', 'credits', 'episode_groups', 'external_ids', 'videos', 'content_ratings', 'watch/providers', 'recommendations', 'similar', 'keywords'].includes(k));
  console.log('TV matched appended keys:', tvKeys);
}

test().catch(console.error);
