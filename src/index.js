import { GUI } from 'dat.gui';

import backgroundSrc from './assets/image.png';
import ImagePlaneCanvas from './components/ImagePlaneCanvas';

const scene = new ImagePlaneCanvas();
scene.addImagePlane(backgroundSrc, 40, 40);

const gui = new GUI();
gui.add(scene, 'bright', -1, 1).name('brightness').listen();
gui.add(scene, 'contrast', -1, 2).name('contrast').listen();
gui.add(scene, 'flip');
gui.add(scene, 'mirror');
gui.open();
