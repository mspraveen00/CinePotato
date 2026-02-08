import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'CinePotato',
        short_name: 'CinePotato',
        description: 'Your Movies, TV & Games Tracker',
        start_url: '/explore',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
            {
                src: '/icon.jpg',
                sizes: 'any',
                type: 'image/jpeg',
            },
        ],
    }
}
