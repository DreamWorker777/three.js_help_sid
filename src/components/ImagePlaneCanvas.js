// import * as THREE from 'three';
import {
    Scene,
    Camera,
    Mesh,
    ShaderMaterial,
    WebGL1Renderer,
    PerspectiveCamera,
    AmbientLight,
    DirectionalLight,
    GridHelper,
    PlaneGeometry,
    DoubleSide,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import vertex from './shader/vertex.glsl';
import fragment from './shader/fragment.glsl';
import { LoadTexture } from '../utils/preLoader';

export default class ImagePlaneCanvas {
    constructor(width = window.innerWidth, height = window.innerHeight, color = 0xaaaaaa, opacity = 0.3) {
        this.scene = new Scene();
        this.camera = null;
        this.renderer = new WebGL1Renderer(); //GLSL version
        this.planeMesh = null;

        this.bright = 0.001;
        this.contrast = 1.0;

        this.contrast = 1.0;
        this.factor = (1.0156 * (this.contrast / 255 + 1.0)) / (1.0 * (1.0156 - this.contrast / 255));
        this.initCamera({ x: 5, y: 10, z: 30 });
        this.initLights();
        this.initRenderer(width, height, color, opacity);
        this.addGridHelper();
        this.addOrbitController();
        this.loop();
    }

    initCamera(pos) {
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(pos.x, pos.y, pos.z);
    }

    initLights() {
        const ambient = new AmbientLight(0xffffff, 1);
        this.scene.add(ambient);

        const p0 = new DirectionalLight(0xffffff, 0.5);
        p0.position.set(10, 10, 10);
        p0.lookAt(0, 0, 0);
        this.scene.add(p0);

        const directionalLight = new DirectionalLight(0xffffff, 1);
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

    addGridHelper() {
        const grid = new GridHelper(100, 20, 0x0000ff, 0x808080);
        this.scene.add(grid);
    }

    addOrbitController() {
        const orbitCcontrol = new OrbitControls(this.camera, this.renderer.domElement);
        orbitCcontrol.update();
        orbitCcontrol.addEventListener('change', this.loop.bind(this));
    }

    async addImagePlane(src, width, height) {
        const planeGeometry = new PlaneGeometry(width, height); //buffergeometry is integrated in geometry
        const planetexture = await LoadTexture(src);
        const planeMaterial = new ShaderMaterial({
            uniforms: {
                texture: { value: planetexture },
                bright: { value: this.bright },
                contrast: { value: this.factor },
            },
            vertexShader: vertex,
            fragmentShader: fragment,
            side: DoubleSide,
            transparent: true,
        });
        this.planeMesh = new Mesh(planeGeometry, planeMaterial);
        this.scene.add(this.planeMesh);
    }
    flip() {
        this.planeMesh.rotation.y += Math.PI;
    }
    mirror() {
        this.planeMesh.rotation.x += Math.PI;
    }
    loop() {
        requestAnimationFrame(this.loop.bind(this));
        this.renderer.render(this.scene, this.camera);
        if (this.planeMesh) {
            this.planeMesh.material.uniforms.bright.value = this.bright;
            this.planeMesh.material.uniforms.contrast.value = this.contrast;
        }
    }
}
