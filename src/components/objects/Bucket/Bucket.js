import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js';
import MODEL from './Can_OBJ.obj';


class Bucket extends Group {
    constructor() {
        // // Call parent Group() constructor
        super();
        const loader = new OBJLoader();
        this.name = 'bucket';
        //console.log(this);
        // Load the OBJ model
        loader.load(MODEL, (group) => {
            // Add each child of the loaded group to the current group
            group.children.forEach(child => {
                this.add(child);
            });
        });
        //// loader.load(MODEL, (object) => {
        //     this.add(object.scene);
        // });
    }
}


export default Bucket;


