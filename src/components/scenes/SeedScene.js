import * as Dat from 'dat.gui';
import * as THREE from 'three';
import { Scene, Color } from 'three';
import { Flower, Land, Water } from 'objects';
import { BasicLights } from 'lights';
import { TextureLoader } from 'three';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 0,
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        // const land = new Land();

        // --------------------------------------------------------------
        // const textureLoader = new TextureLoader();
        // const soilTexture = textureLoader.load('soil.jpg');

        this.planeMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshBasicMaterial({
                // map: soilTexture,
                side: THREE.DoubleSide,
                // metalness: 0.2, // Adjust these values based on your scene and lighting
                // roughness: 0.8,
                visible: false
            })
        );
        this.planeMesh.rotateX(-Math.PI / 2);
        
        const grid = new THREE.GridHelper(20, 20);

        this.highlightMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                transparent: true
            })
        );
        this.highlightMesh.rotateX(-Math.PI / 2);
        this.highlightMesh.position.set(.5, 0, .5);
        this.sphereMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 4, 2),
            new THREE.MeshBasicMaterial({
                wireframe: true,
                color: 0xFFEA00
            })
        );
        
        // ------------------------------------------------------------------
        this.flowers = []

        const flower = new Flower(this);
        // this.flowers.push(flower);
        const water = new Water();
        water.position.set(-1,3.7,0)
        water.scale.set(0.25,0.25,0.25)
        const lights = new BasicLights();
        // this.add(land, flower, water, lights);
        this.add(this.planeMesh, grid, this.highlightMesh, flower, water, lights);

        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }
    getPlaneMesh(){
        
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
    addFlower(grid_square){
        const flower = new Flower(this);
        console.log(grid_square);
        //this.state.updateList.push(flower);
        flower.position.set(grid_square.x, grid_square.y, grid_square.z);
        this.add(flower);
        return flower;
    }
}

export default SeedScene;
