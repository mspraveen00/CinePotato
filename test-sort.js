const artworks = [
    { artwork_type: 6, image_id: 'C_black' },
    { artwork_type: 5, image_id: 'B_white' },
    { artwork_type: 7, image_id: 'A_color' }
];

const sorted = artworks.filter(a => [7, 5, 6].includes(a.artwork_type)).sort((a, b) => {
    const priority = { 7: 0, 5: 1, 6: 2 };
    return (priority[a.artwork_type] || 9) - (priority[b.artwork_type] || 9);
});

console.log(sorted);
