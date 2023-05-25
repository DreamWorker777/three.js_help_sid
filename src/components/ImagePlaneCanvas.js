import {
    Scene,
    Mesh,
    ShaderMaterial,
    WebGL1Renderer,
    PerspectiveCamera,
    AmbientLight,
    DirectionalLight,
    GridHelper,
    PlaneGeometry,
    DoubleSide,
    WebGLRenderTarget,
    sRGBEncoding,
    LinearFilter,
    RGBAFormat,
    FloatType,
    Color,
    MeshBasicMaterial,
    NearestFilter,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/effectcomposer';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import vertex from './shader/vertex.glsl';
import fragment from './shader/fragment.glsl';
import { LoadTexture } from '../utils/preLoader';

import { RenderPass } from 'three/examples/jsm/postprocessing/renderpass';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

const parameters = {
    minFilter: LinearFilter,
    magFilter: NearestFilter,
    format: RGBAFormat,
    stencilBuffer: false,
    type: FloatType,
    samples: 1,
};

export default class ImagePlaneCanvas {
    constructor(width = window.innerWidth, height = window.innerHeight, color = 0xaaaaaa, opacity = 0.3) {
        this.scene = new Scene();
        this.camera = null;
        this.renderer = new WebGL1Renderer({ antialias: true }); //GLSL version
        this.renderTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight, parameters); //this is setted to get texel of rendered canvas
        this.planeMesh = null;
        this.composer = null;
        this.bright = 0.001;
        this.contrast = 1.0;
        this.opacity = 1;
        this.factor = (1.0156 * (this.contrast / 255 + 1.0)) / (1.0 * (1.0156 - this.contrast / 255));
        this.mouse = { x: 0, y: 0 };
        this.read = new Uint8Array(1 * 1 * 4);
        this.initCamera({ x: 0, y: 0, z: 30 });
        this.initLights();
        this.initRenderer(width, height, color, opacity);
        this.addGridHelper();
        this.addOrbitController();
        this.loop();
        // this.setEvent();
    }

    setEvent() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        document.addEventListener('click', (e) => {
            // console.log('r:' + this.read[0] + ' g:' + this.read[1] + ' b:' + this.read[2]);
            console.log('outcome value in the shader code >>>', this.read[0]);
        });
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

        this.composer = new EffectComposer(this.renderer, this.renderTarget);
        const renderPass = new RenderPass(this.scene, this.camera);
        renderPass.clearColor = new Color(0xffffff);
        this.composer.addPass(renderPass);
        const effect = new ShaderPass(GammaCorrectionShader);
        this.composer.addPass(effect);
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
        const planeGeometry = new PlaneGeometry(width, height); // buffergeometry is integrated in geometry
        const planetexture = await LoadTexture(src);
        planetexture.encoding = sRGBEncoding;

        // start of the renderertarget
        // const textureScene = new Scene();
        // textureScene.background = new Color(0xffffff);
        // const textureCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        // textureCamera.position.set(0, 0, 30);
        // textureCamera.lookAt(0, 0, 0);
        // const renderTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight);
        // const ambient = new AmbientLight(0xffffff, 1);
        // textureScene.add(ambient);

        // const textureGeometry = new PlaneGeometry(width, height); // buffergeometry is integrated in geometry
        // const textureMaterial = new ShaderMaterial({
        //     uniforms: {
        //         texture: { value: planetexture },
        //         bright: { value: this.bright },
        //         contrast: { value: this.factor },
        //         opacity: { value: this.opacity },
        //     },
        //     vertexShader: vertex,
        //     fragmentShader: fragment,
        //     side: DoubleSide,
        //     transparent: true,
        // });
        // const textureMesh = new Mesh(textureGeometry, textureMaterial);
        // textureScene.add(textureMesh);
        // this.renderer.setRenderTarget(renderTarget);
        // this.renderer.clear();
        // this.renderer.setRenderTarget(null);
        // this.renderer.render(textureScene, textureCamera);
        // const targetTexture = renderTarget.texture;
        // end of the renderertarget

        const planeMaterial = new ShaderMaterial({
            uniforms: {
                texture: { value: planetexture },
                bright: { value: this.bright },
                contrast: { value: this.factor },
                opacity: { value: this.opacity },
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
        // if (this.planeMesh) {
        //     this.planeMesh.material.uniforms.bright.value = this.bright;
        //     this.planeMesh.material.uniforms.contrast.value = this.contrast;
        //     this.planeMesh.material.uniforms.opacity.value = this.opacity;
        // }
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.scene, this.camera);
        this.renderer.clear();
        this.renderer.setRenderTarget(null);
        const targetTexture = this.renderTarget.texture;

        if (this.planeMesh) {
            this.planeMesh.material = new ShaderMaterial({
                uniforms: {
                    texture: { value: targetTexture },
                },
                vertexShader: vertex,
                fragmentShader: fragment,
                side: DoubleSide,
                transparent: true,
            });
        }
        this.renderer.render(this.scene, this.camera);
        // this.composer.render();

        // set the (0,0) uv position to mouse position => the (0,0) position is became to (mouse.x, mouse.y)
        // this.camera.setViewOffset(
        //     window.innerWidth,
        //     window.innerHeight,
        //     (this.mouse.x * window.devicePixelRatio) | 0,
        //     (this.mouse.y * window.devicePixelRatio) | 0,
        //     1,
        //     1
        // );
        // this.renderer.setRenderTarget(this.renderTarget);

        // this.renderer.setRenderTarget(null); // clear renderer target (without this  we can't see the rendered canvas in the screen)
        // this.camera.clearViewOffset(); // clear camera
        // this.renderer.render(this.scene, this.camera);

        // this.renderer.readRenderTargetPixels(this.renderTarget, 0, 0, 1, 1, this.read); // get the texel at the mouse position.
    }
}
