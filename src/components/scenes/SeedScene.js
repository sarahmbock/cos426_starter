import * as Dat from 'dat.gui';
import * as THREE from 'three';
import { Scene, Color } from 'three';
import { Flower, Water, Sprout, Seed, FlowerOne, FlowerTwo, Rain, Bag, Shelf, Fence, BadFlower } from 'objects';
import { BasicLights } from 'lights';
//import { TextureLoader } from 'three';
//import TWEEN from '@tweenjs/tween.js'
//import {Soil} from '../textures';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();
    
        // Add state of game
        this.game_state = 'neutral' // neutral, planting, watering

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 0,
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0xFED2F8);
    
        // Set up grid
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
        
        this.grid = new THREE.GridHelper(20, 20);

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

        this.grid_states = new Map(); // Map from grid squares positions to their states
        this.raindrops = []; // Rain list
        this.points = 0; // Total points
        
        this.water = new Water();
        this.water.position.set(-1,3.7,0)
        this.water.scale.set(0.4,0.4,0.4)
        
        this.lights = new BasicLights();
      
        this.bag = new Bag();
        this.bag.scale.set(.25,.25,.25);
        this.bag.position.set(3,1.8,1);
        this.bag.position.set(0.5,.8,1);

        this.shelf = new Shelf();
        this.shelf.scale.set(.012,.006,.006);
        this.shelf.position.set(-0.3,3.6,0);
       
        // Seed to follow mouse while planting
        this.trackingSeed = null;
        
        this.add(this.planeMesh, this.grid, this.highlightMesh, this.water, this.lights, this.bag, this.shelf);

    // -----------------------------------------
    const numfences = 8;
    const fence_offset = 2.4;
    const init_position = new THREE.Vector3(-8.4, 1, 10);
    
    // Set up back fences
    for (let i = 0; i < numfences; i++) {
        const fence = new Fence();
        fence.scale.set(.3,.3,.3);
        fence.rotateY(Math.PI/2);
        fence.position.set(init_position.x + i * fence_offset, init_position.y, init_position.z);
        this.add(fence);

    }

    // Right fence
    const init_position2 = new THREE.Vector3(-10, 1, 8.5);
    for (let i = 0; i < numfences; i++) {
        const fence = new Fence();
        fence.scale.set(.3,.3,.3);
        fence.position.set(init_position2.x, init_position2.y, init_position2.z - i * fence_offset);
        this.add(fence);
    }
    
    // Left fence
    const init_position3 = new THREE.Vector3(10, 1, 8.5);
    for (let i = 0; i < numfences; i++) {
        const fence = new Fence();
        fence.scale.set(.3,.3,.3);
        fence.position.set(init_position3.x, init_position3.y, init_position3.z - i * fence_offset);
        this.add(fence);
    }

    // -----------------------------------------
    const offset = 10;
    this.shelf.translateZ(offset);
    this.bag.translateZ(offset);
    this.water.translateZ(offset);

    // Populate GUI
    this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        this.rotation.y = (rotationSpeed * timeStamp) / 10000;

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
        const random = Math.floor(Math.random() * 20)
        const rand = Math.floor(random);
        let flower;
        if(rand < 0){
                flower = new Flower(this);
                flower.scale.set(.4,.4,.4);
                flower.position.set(grid_square.x, grid_square.y + 0.5, grid_square.z);
                this.points += 1;
            }
        else if (rand < 0){
            flower = new FlowerOne();
            flower.scale.set(.015,.015,.015);
            flower.position.set(grid_square.x, grid_square.y, grid_square.z);
            this.points += 2;
        }
        else if (rand < 20){
            flower = new BadFlower();
            flower.scale.set(.15,.15,.15);
            flower.position.set(grid_square.x, grid_square.y, grid_square.z);
            this.game_state = 'death';
            //console.log(this.game_state)
            this.points == 0;
        }
        else{
            flower = new FlowerTwo();
            flower.scale.set(.015,.015,.015);
            flower.position.set(grid_square.x, grid_square.y, grid_square.z);
            this.points += 10;
        }

        this.remove(sprout)
        this.add(flower);
        return flower
    }
    
    addSprout(grid_square){
        this.points += 1;
        const sprout = new Sprout();
        sprout.scale.set(.25,.25,.25);
        sprout.position.set(grid_square.x +.4, grid_square.y + 1, grid_square.z+.1);
        this.add(sprout); 
        return sprout   
    }
    
    // Handle mouse click on screen
    screenClick(raycaster){
        let new_obj;
        // Case 1: Grid click
        const intersects_grid = raycaster.intersectObject(this.planeMesh);
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

        // Case 3: click outside grid/ watering can, set state to neutral
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
            const clickPosition = new THREE.Vector3(this.highlightMesh.position.x, this.highlightMesh.position.y + 5, this.highlightMesh.position.z);
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
