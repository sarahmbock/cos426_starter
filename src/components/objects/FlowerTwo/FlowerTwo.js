import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './flower.glb';

class FlowerTwo extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'flower';

        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });
    }
}

export default FlowerTwo;
