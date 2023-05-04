import * as THREE from 'three';

export const LoadTexture = (src, doubleSide = true) => {
    return new Promise((resolve) => {
        const loader = new THREE.TextureLoader();

        loader.load(
            src,
            (texture) => {
                resolve(texture);
            },
            undefined,
            (err) => console.error('en error happened>>>', err)
        );
    });
};