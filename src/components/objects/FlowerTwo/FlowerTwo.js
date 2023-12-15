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
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    // Check if the child is a mesh
                    const material = child.material;
       
                    // Check if the material is a MeshStandardMaterial (you may need to adjust this based on your model)
                    if (material.isMeshStandardMaterial) {
                        material.metalness = 0;
                    }
                }
            });
       
            // Add the modified GLB object to the scene
            this.add(gltf.scene);
        });
 
    }
}

export default FlowerTwo;
