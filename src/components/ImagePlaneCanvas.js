import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import vertex from './shader/vertex.glsl';
import fragment from './shader/fragment.glsl';
import { LoadTexture } from '../utils/preLoader';

import { EffectComposer } from 'three/examples/jsm/postprocessing/effectcomposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/renderpass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

const parameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: false,
    type: THREE.FloatType,
    samples: 1,
};

export default class ImagePlaneCanvas {
    constructor(width = window.innerWidth, height = window.innerHeight, color = 0x000000, opacity = 0.9) {
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = new THREE.WebGL1Renderer(); //GLSL version
        this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, parameters);
        this.raycaster = new THREE.Raycaster();

        this.imagePlanes = [];
        this.selectedPlane = null;

        this.bright = 0.001;
        this.contrast = 1.0;
        this.opacity = 1.0;

        this.contrast = 1.0;
        this.factor = (1.0156 * (this.contrast / 255 + 1.0)) / (1.0 * (1.0156 - this.contrast / 255));
        this.initCamera({ x: 0, y: 20, z: 60 });
        this.initLights();
        this.initRenderer(width, height, color, opacity);

        this.addGridHelper();
        this.addOrbitController();
        this.addEvent();

        this.loop();
    }

    addEvent() {
        document.addEventListener('click', (e) => {
            const position = new THREE.Vector2();
            position.x = (e.clientX / window.innerWidth) * 2 - 1;
            position.y = -(e.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(position, this.camera);
            const intersects = this.raycaster.intersectObjects(this.scene.children);
            if (intersects.length > 0) {
                if (intersects[0].object.type === 'Mesh') {
                    const object = intersects[0].object;
                    console.log(object);
                    this.imagePlanes.forEach((object, index) => {
                        object.material.uniforms.select.value = false;
                    });

                    object.material.uniforms.select.value = true;
                    this.selectedPlane = object;
                }
            }
        });

        document.addEventListener('mousemove', (e) => {
            const position = new THREE.Vector2();
            position.x = (e.clientX / window.innerWidth) * 2 - 1;
            position.y = -(e.clientY / window.innerHeight) * 2 + 1;

            this.imagePlanes.forEach((object) => {
                object.material.uniforms.hover.value = false;
            });

            this.raycaster.setFromCamera(position, this.camera);
            const intersects = this.raycaster.intersectObjects(this.scene.children);
            if (intersects.length > 0) {
                if (intersects[0].object.type === 'Mesh') {
                    const object = intersects[0].object;
                    object.material.uniforms.hover.value = true;
                }
            }
        });
    }

    initCamera(pos) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(pos.x, pos.y, pos.z);
    }

    initLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambient);

        const p0 = new THREE.DirectionalLight(0xffffff, 0.5);
        p0.position.set(10, 10, 10);
        p0.lookAt(0, 0, 0);
        this.scene.add(p0);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 15, 0);
        directionalLight.lookAt(0, 0, 0);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }

    initRenderer(width, height, color, opacity) {
        this.renderer.setClearColor(color, opacity);
        this.renderer.setSize(width, height);
        document.body.appendChild(this.renderer.domElement);
    }

    initComposer() {
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        const effect = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.7, 0.4, 0.85);
        this.composer.addPass(effect);
    }

    addGridHelper() {
        const grid = new THREE.GridHelper(100, 20, 0x0000ff, 0x808080);
        this.scene.add(grid);
    }

    addOrbitController() {
        const orbitCcontrol = new OrbitControls(this.camera, this.renderer.domElement);
        orbitCcontrol.update();
        orbitCcontrol.addEventListener('change', this.loop.bind(this));
    }

    async addImagePlane(src, width, height, position, bo) {
        const planeGeometry = new THREE.PlaneGeometry(width, height); //buffergeometry is integrated in geometry
        const planetexture = await LoadTexture(src);
        planetexture.encoding = THREE.sRGBEncoding;

        const planeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                texture: { value: planetexture },
                bright: { value: this.bright },
                contrast: { value: this.factor },
                opacity: { value: this.opacity },
                hover: { value: false },
                select: { value: false },
            },
            vertexShader: vertex,
            fragmentShader: fragment,
            side: THREE.DoubleSide,
            transparent: true,
        });
        const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        planeMesh.position.set(position.x, position.y, position.z);

        this.scene.add(planeMesh);

        this.imagePlanes.push(planeMesh);

        // const adjustOption = {
        //     opacity: this.opacity,
        //     bright: this.bright,
        //     contrast: this.contrast,
        // };

        // this.planeMesh.push({ planeMesh, id, adjustOption });
    }

    flip() {
        this.selectedPlane.rotation.y += Math.PI;
    }

    mirror() {
        this.selectedPlane.rotation.x += Math.PI;
    }

    loop() {
        requestAnimationFrame(this.loop.bind(this));

        if (this.selectedPlane) {
            this.selectedPlane.material.uniforms.bright.value = this.bright;
            this.selectedPlane.material.uniforms.contrast.value = this.contrast;
            this.selectedPlane.material.uniforms.opacity.value = this.opacity;
        }
        this.renderer.render(this.scene, this.camera);
    }
}
