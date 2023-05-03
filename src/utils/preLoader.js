// import { ObjectLoader } from 'three';
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

// export const LoadModel = (src, shadow = true) => {
//     return new Promise((resolve) => {
//         const loader = new GLTFLoader();

//         loader.load(src, function (gltf) {
//             const model = gltf;

//             model.scene.traverse((obj) => {
//                 if (shadow && (obj.isMesh || obj.isSkinnedMesh)) {
//                     obj.castShadow = true;
//                     obj.receiveShadow = true;
//                     if (obj.material.map) obj.material.map.anisotropy = 16;
//                 }
//             });
//             resolve(model);
//         });
//     });
// };
