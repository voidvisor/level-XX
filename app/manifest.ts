import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'LEVEL XX // CLASSIFIED',
        short_name: 'LEVEL XX',
        description: 'SECURE MISSION INTERFACE // AUTHORIZED PERSONNEL ONLY',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
            {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
        ],
    }
}
