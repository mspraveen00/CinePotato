async function test() {
    const queryBody = `
        fields name, cover.image_id, first_release_date, total_rating;
        sort popularity desc;
        limit 20;
    `;

    try {
        const res = await fetch('http://localhost:3000/api/igdb/games', {
            method: 'POST',
            body: queryBody
        });

        console.log("Status:", res.status);
        const data = await res.json();
        console.log("Data length:", data.length);
        if (data.error) {
            console.log("Error:", data);
        } else {
            console.log("First item:", data[0]);
        }
    } catch (e) {
        console.error(e);
    }
}
test();
