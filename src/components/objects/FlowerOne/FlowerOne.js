import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './flower.glb';

class FlowerOne extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'flowerone';

        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });
    }
}

export default FlowerOne;
