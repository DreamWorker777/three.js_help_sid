import { GUI } from 'dat.gui';
import { Vector3 } from 'three';
import backgroundSrc1 from './assets/1.png';
import backgroundSrc2 from './assets/2.png';
import ImagePlaneCanvas from './components/ImagePlaneCanvas';

const scene = new ImagePlaneCanvas();
scene.addImagePlane(backgroundSrc1, 30, 30, new Vector3(-30, 15, 0), 0);
scene.addImagePlane(backgroundSrc2, 20, 20, new Vector3(20, 10, 0), 1);

const gui = new GUI();
gui.add(scene, 'bright', -1, 1).name('brightness').listen();
gui.add(scene, 'contrast', -1, 2).name('contrast').listen();
gui.add(scene, 'opacity', 0, 1).name('opacity').listen();
gui.add(scene, 'flip');
gui.add(scene, 'mirror');
gui.open();
