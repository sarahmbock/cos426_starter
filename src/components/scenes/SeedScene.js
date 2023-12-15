import * as Dat from 'dat.gui';
import * as THREE from 'three';
import { Scene, Color } from 'three';
import { Flower, Water, Sprout, Seed, FlowerOne, FlowerTwo, Rain, Bag, Shelf, Fence, BadFlower, Cloud } from 'objects';
import { BasicLights } from 'lights';
import { TextureLoader } from 'three';
import soilBaseColorImage from './soil/Ground_Dirt_007_basecolor.jpg';
import soilNormalMapImage from './soil/Ground_Dirt_007_normal.jpg';
import soilHeightMapImage from './soil/Ground_Dirt_007_height.png';
import soilRoughnessMapImage from './soil/Ground_Dirt_007_roughness.jpg';
import soilOcclusionMapImage from './soil/Ground_Dirt_007_ambientOcclusion.jpg';
import grassBaseColorImage from './soil/Grass_001_COLOR.jpg';
import grassNormalMapImage from './soil/Grass_001_NORM.jpg';
import grassHeightMapImage from './soil/Grass_001_DISP.png';
import grassRoughnessMapImage from './soil/Grass_001_ROUGH.jpg';
import grassOcclusionMapImage from './soil/Grass_001_OCC.jpg';
class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();
    
        // Add state of game
        this.game_state = 'neutral' // neutral, planting, watering

        // Init state
        this.state = {
            //gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 0,
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        const textureLoader = new TextureLoader();
        const soilBaseColor = textureLoader.load(soilBaseColorImage);
        const soilNormalMap = textureLoader.load(soilNormalMapImage);
        const soilHeightMap = textureLoader.load(soilHeightMapImage);
        const soilRoughnessMap = textureLoader.load(soilRoughnessMapImage);
        const soilOcclusionMap = textureLoader.load(soilOcclusionMapImage);
        const grassBaseColor = textureLoader.load(grassBaseColorImage);
        const grassNormalMap = textureLoader.load(grassNormalMapImage);
        const grassHeightMap = textureLoader.load(grassHeightMapImage);
        const grassRoughnessMap = textureLoader.load(grassRoughnessMapImage);
        const grassOcclusionMap = textureLoader.load(grassOcclusionMapImage);

        this.soilMesh = new THREE.Mesh(new THREE.PlaneGeometry(20,20, 100, 100), new THREE.MeshStandardMaterial ({
            map: soilBaseColor,
            normalMap: soilNormalMap,
            displacementMap: soilHeightMap,
            roughnessMap: soilRoughnessMap,
            aoMap: soilOcclusionMap,
        }));
        this.soilMesh.rotateX(-Math.PI / 2);
        this.soilMesh.position.y = -0.6;

        this.grassMesh = new THREE.Mesh(new THREE.PlaneGeometry(50,50, 100, 100), new THREE.MeshStandardMaterial ({
            map: grassBaseColor,
            normalMap: grassNormalMap,
            displacementMap: grassHeightMap,
            roughnessMap: grassRoughnessMap,
            aoMap: grassOcclusionMap,
        }));
        this.grassMesh.rotateX(-Math.PI / 2);
        this.grassMesh.position.y = -1;

        
        const grid = new THREE.GridHelper(20, 20);

        this.highlightMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.5,  // Set the opacity value (0 is fully transparent, 1 is fully opaque)
                alphaTest: 0.5, // Adjust the alpha test value as needed
            })
        );
        
        this.highlightMesh.rotateX(-Math.PI / 2);
        this.highlightMesh.position.set(.5, -1, .5);

        this.grid_states = new Map(); // Map from grid squares positions to their states
        this.raindrops = []; // Rain list
        this.points = 0; // Total points
        
        this.water = new Water();
        this.water.position.set(-1,3.7,0)
        this.water.scale.set(0.4,0.4,0.4)
        
        this.lights = new BasicLights();
      
        this.bag = new Bag();
        this.bag.scale.set(.25,.25,.25);
        // this.bag.position.set(3,1.8,1);
        this.bag.position.set(0.5,.8,1);

        this.shelf = new Shelf();
        this.shelf.scale.set(.012,.006,.006);
        this.shelf.position.set(-0.3,3.6,0);

        this.cloud1 = new Cloud();
        this.cloud1.scale.set(0.012,.006,-.006);
        this.cloud1.position.set(1, 6, 15);

        this.cloud2 = new Cloud();
        this.cloud2.scale.set(0.012,.006,-.006);
        this.cloud2.position.set(-12, 4, 25);
       
        // Seed to follow mouse while planting
        this.trackingSeed = null;
        
        this.add(this.soilMesh, this.grassMesh, this.grid, this.highlightMesh, this.water, this.lights, this.bag, this.shelf, this.cloud1, this.cloud2);

    // -----------------------------------------
    const numfences = 8;
    const fence_offset = 2.4;
    const init_position = new THREE.Vector3(-8.4, 1, 10);
    
// Set up back fences
for (let i = 0; i < numfences; i++) {
    const fence = new Fence();
    fence.scale.set(.3, .3, .3);
    fence.rotateY(Math.PI / 2);
    fence.position.set(init_position.x + i * fence_offset, 0.5, init_position.z); // Adjusted the y value
    this.add(fence);
}

// Right fence
const init_position2 = new THREE.Vector3(-10, 1, 8.5);
for (let i = 0; i < numfences; i++) {
    const fence = new Fence();
    fence.scale.set(.3, .3, .3);
    fence.position.set(init_position2.x, 0.5, init_position2.z - i * fence_offset); // Adjusted the y value
    this.add(fence);
}

// Left fence
const init_position3 = new THREE.Vector3(10, 1, 8.5);
for (let i = 0; i < numfences; i++) {
    const fence = new Fence();
    fence.scale.set(.3, .3, .3);
    fence.position.set(init_position3.x, 0.5, init_position3.z - i * fence_offset); // Adjusted the y value
    this.add(fence);
}


    // -----------------------------------------
    const offset = 10;
    this.shelf.translateZ(offset);
    this.bag.translateZ(offset);
    this.water.translateZ(offset);

    // Populate GUI
    //this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        this.rotation.y = (rotationSpeed * timeStamp) / 10000;
        
        // Move the cloud across the screen
        this.cloud1.position.x += 0.005;
        this.cloud2.position.x += 0.003;


        // If the cloud goes beyond a certain position, reset its position
        if (this.cloud1.position.x > 20) {
            this.cloud1.position.x = -20;
        }
        if (this.cloud2.position.x > 20) {
            this.cloud2.position.x = -20;
        }

        // Custom animation logic (if any)
        this.animateRaindrops();

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }

    // Add a random flower to scene
    addFlower(grid_square, sprout){
        // generate random number
        const random = Math.floor(Math.random() * 100)
        const rand = Math.floor(random);
        let flower;
        if(rand < 40){
            flower = new FlowerTwo();
            flower.scale.set(.015,.015,.015);
            flower.position.set(grid_square.x, grid_square.y, grid_square.z);
            this.points += 1;
            }
        else if (rand < 60){
            flower = new FlowerOne();
            flower.scale.set(.015,.015,.015);
            flower.position.set(grid_square.x, grid_square.y, grid_square.z);
            this.points += 2;
        }
        else if (rand < 80){
            flower = new BadFlower();
            flower.scale.set(.15,.15,.15);
            flower.position.set(grid_square.x, grid_square.y, grid_square.z);
            this.game_state = 'death';
        }
        else{
            flower = new Flower(this);
            flower.scale.set(.4,.4,.4);
            flower.position.set(grid_square.x, grid_square.y + 0.5, grid_square.z);
            this.points += 10;
        }

        this.remove(sprout)
        this.add(flower);
        return flower
    }
    
    addSprout(grid_square){
        this.points += 1;
        const sprout = new Sprout();
        this.addToUpdateList(sprout)
        sprout.scale.set(.25,.25,.25);
        sprout.position.set(grid_square.x +.4, grid_square.y + 1, grid_square.z+.1);
        this.add(sprout); 
        setTimeout(() => {
            sprout.spin();
        }, 2000); // 1000 milliseconds = 1 second
        return sprout   
    }
    
    // Handle mouse click on screen
    screenClick(raycaster){
        let new_obj;
        // Case 1: Grid click
        const intersects_grid = raycaster.intersectObject(this.soilMesh);
        const intersects_water = raycaster.intersectObject(this.water); // check if intersected with water
        const intersects_bag = raycaster.intersectObject(this.bag); // check if intersected with seed bag

        if(intersects_grid.length > 0) {
            this.gridClick();
        
        }

        // Case 2: watering can click
        else if(intersects_water.length > 0) {
            if (this.trackingSeed){
                this.remove(this.trackingSeed);
            }
            new_obj = this.waterClick()
        }
        
        // Case 3: seed bag click
        else if(intersects_bag.length > 0) {
            if (this.trackingSeed){
                this.remove(this.trackingSeed);
            }
            this.game_state = 'planting';
            
            // Create seed for tracking
            const new_seed = new Seed();
            new_seed.scale.set(.1,.1,.1);
            this.trackingSeed = new_seed;
            new_seed.position.set(0,4.3,-1);
            this.add(new_seed);
        }
   
        // Case 5: click outside grid/ watering can, set state to neutral
        else{
            if (this.game_state == 'planting'){
                // remove tracking seed
                this.remove(this.trackingSeed);
            }
            else if(this.game_state == 'watering'){
                this.water.position.set(-1,3.7,10)
                this.water.scale.set(0.4,0.4,0.4)
            
            }
            this.game_state = 'neutral';
        }
    }
    
    waterClick(){
        this.game_state = 'watering';
        console.log('watering can clicked');
    }
    
    shovelClick(){
        this.game_state = 'planting';
        console.log('shovel can clicked');
    }
    
    gridClick(){
        // Get state of the square
        let grid_state;
        let grid_code = this.highlightMesh.position.x + this.highlightMesh.position.y * 20 + this.highlightMesh.position.z * 20 * 20
        
        if (this.grid_states.has(grid_code)){
            grid_state = this.grid_states.get(grid_code)[0];
        }
        else{
            this.grid_states.set(grid_code, ['empty', null]);
            grid_state = 'empty';
        }
       
        if(this.game_state == 'planting'){
            // Plant seed
            if(grid_state == 'empty'){
                this.points += 1;
                const seed = new Seed();
                seed.scale.set(.1,.1,.1);
                seed.position.set(this.highlightMesh.position.x, this.highlightMesh.position.y, this.highlightMesh.position.z-.2);
                this.add(seed);
                this.grid_states.set(grid_code, ['seed', seed]);
                // remove tracking seed
                this.remove(this.trackingSeed);
                // reset state
                this.game_state = 'neutral';
            }
        }
        else if (this.game_state == 'watering'){
            // Add rain 
            const clickPosition = new THREE.Vector3(this.highlightMesh.position.x, this.highlightMesh.position.y + 4, this.highlightMesh.position.z);
            console.log(grid_state);
        
            this.createRaindropParticles(clickPosition);

            // If seed, grow to sprout
            if (grid_state == 'seed'){
                
                const old_seed = this.grid_states.get(grid_code)[1];
                const sprout = this.addSprout(this.highlightMesh.position);
                this.grid_states.set(grid_code, ['sprout', sprout]);
                this.remove(old_seed);
            }

            // if sprout, grow to flower
            if (grid_state == 'sprout'){
                const old_sprout = this.grid_states.get(grid_code)[1];
                const flower = this.addFlower(this.highlightMesh.position, old_sprout);
                this.grid_states.set(grid_code, ['flower', flower]);
            }
            // reset state
            if(this.game_state != 'death'){
                this.game_state = 'neutral';
            }
        }
    }

    // Create Raindrop Particles
    createRaindropParticles(position) {
        const numberOfDrops = 25; // Adjust as needed
        let raindropMesh;

        for (let i = 0; i < numberOfDrops; i++) {
            raindropMesh = new Rain();
            raindropMesh.scale.set(.002,.002,.002);
            raindropMesh.position.copy(position);
        
            // Add some randomness to the raindrop positions
            raindropMesh.position.x += Math.random() - .5;
            raindropMesh.position.y += Math.random() * 2 - 1;
        
            this.add(raindropMesh);
        
            // Add the raindrop to the array
            this.raindrops.push({ mesh: raindropMesh, startY: position.y });
        }
  
        // Remove raindrop after 2 seconds
        setTimeout(() => {
        for (const drop of this.raindrops) {
            this.remove(drop.mesh);
        }
        this.raindrops.length = 0; // Clear the array
      
        this.water.position.set(-1,3.7,10)
        this.water.scale.set(0.4,0.4,0.4)
        }, 1500);
    }
  
  // Update function for animation loop
  animateRaindrops() {
    for (const drop of this.raindrops) {
      // Update raindrop position
      drop.mesh.position.y -= 0.1; // Adjust the speed as needed
    }
  }      
}

export default SeedScene;
