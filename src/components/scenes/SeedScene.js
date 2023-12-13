import * as Dat from 'dat.gui';
import * as THREE from 'three';
import { Scene, Color } from 'three';
import { Flower, Land, Water, Sprout, Dig, Seed, FlowerOne, FlowerTwo, Rain, Bag, Shelf, Fence } from 'objects';
import { BasicLights } from 'lights';
import { TextureLoader } from 'three';
import TWEEN from '@tweenjs/tween.js'
import {Soil} from '../textures';
//import { Sprout } from '../objects';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();
        // -----------------
        // add state of game
        this.game_state = 'neutral' // neutral, planting, watering


        // --------------

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

        // map from grid squares positions to their states, initialize all states to 'empty'
        this.grid_states = new Map();
        // for(let i = 0; i < 20; i++){
        //     for(let j = 0; j < 20; j++){
        //         // get grid square position
                

        //     }
        // }
        
        // ------------------------------------------------------------------
       // rain
        this.raindrops = [];
        // points
        this.points = 0;
        // ------------------------------------------------------------------

        
        this.flowers = []

        const flower = new Flower(this);
        // this.flowers.push(flower);
        const water = new Water();
        //water.rotateY(-Math.PI/4);
        this.water = water;
        water.position.set(-1,3.7,0)
        //water.scale.set(0.25,0.25,0.25)
        water.scale.set(0.4,0.4,0.4)
        const lights = new BasicLights();
        // const dig = new Dig();
        // dig.scale.set(.025,.025,.025);
        // dig.position.set(2,4,0);
        const flow1 = new FlowerTwo();
        flow1.scale.set(.015,.015,.015);
        this.add(this.planeMesh, grid, this.highlightMesh, this.water, lights);
        //this.add(this.shovel);
        //this.add(dig);

        const bag = new Bag();
        this.bag = bag;
         bag.scale.set(.25,.25,.25);
        bag.position.set(3,1.8,1);
        bag.position.set(0.5,.8,1);
       this.add(bag); 

       const shelf = new Shelf();
       this.add(shelf);
         shelf.scale.set(.012,.006,.006);
         shelf.position.set(-0.3,3.6,0);
        // seed to follow mouse while planting
        this.trackingSeed = null;

        // const water2 = new Water();
        // water2.scale.set(0.4,0.4,0.4);
        // // rotate slightly towards camera
        // water2.rotateY(-Math.PI/4);
        // this.add(water2);

        


    // -----------------------------------------
    // fences
    const numfences = 8;
    const fence_offset = 2.4;
    const init_position = new THREE.Vector3(-8.4, 1, 10);
    // back fences
    for (let i = 0; i < numfences; i++) {
        const fence = new Fence();
        fence.scale.set(.3,.3,.3);
        fence.rotateY(Math.PI/2);
        fence.position.set(init_position.x + i * fence_offset, init_position.y, init_position.z);
        this.add(fence);

    }

    // side fence on right side
    const init_position2 = new THREE.Vector3(-10, 1, 8.5);
    for (let i = 0; i < numfences; i++) {
        const fence = new Fence();
        fence.scale.set(.3,.3,.3);
        fence.position.set(init_position2.x, init_position2.y, init_position2.z - i * fence_offset);
        this.add(fence);
    }
    // side fence on left side
    const init_position3 = new THREE.Vector3(10, 1, 8.5);
    for (let i = 0; i < numfences; i++) {
        const fence = new Fence();
        fence.scale.set(.3,.3,.3);
        fence.position.set(init_position3.x, init_position3.y, init_position3.z - i * fence_offset);
        this.add(fence);
    }

    // -----------------------------------------


    //const offset = new THREE.Vector3(0, 0.5, 0);
    const offset = 10;
    shelf.translateZ(offset);
    bag.translateZ(offset);
    water.translateZ(offset);


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

        // rain
        // Custom animation logic (if any)
        this.animateRaindrops();

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }

        
    }
    addFlower(grid_square, sprout){
        // generate random number
    const random = Math.floor(Math.random() * 3)
    console.log(random);
    const rand = Math.floor(random);
    let flower;
    if(rand == 0){
         flower = new Flower(this);
         this.points += 2;
        }
    else if (rand == 1){
         flower = new FlowerOne();
        flower.scale.set(.015,.015,.015);
        this.points += 3;
    }
    else{
            flower = new FlowerTwo();
            flower.scale.set(.015,.015,.015);
            this.points += 3;
    }

        //console.log(grid_square);
        //this.state.updateList.push(flower);
        
        flower.position.set(grid_square.x, grid_square.y, grid_square.z);
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
    screenClick(mousePosition, raycaster, objects){
        let new_obj;
        // Case 1: Grid click// CASE 1: Check for grid click
        const intersects_grid = raycaster.intersectObject(this.planeMesh);
        const intersects_water = raycaster.intersectObject(this.water); // check if intersected with water
        const intersects_bag = raycaster.intersectObject(this.bag); // check if intersected with seed bag

    
        if(intersects_grid.length > 0) {
            // this.gridClick(objectExist);
            // if(!objectExist) {
            // create new flower
            //const new_flower = this.addFlower(this.highlightMesh.position);
            // }
            this.gridClick();
        
    }

        // Case 2: watering can click
        // check for mouse intersection with water can
        // if watering can is clicked
        else if(intersects_water.length > 0) {
            //console.log('water')
            if (this.trackingSeed){
                this.remove(this.trackingSeed);
            }
            new_obj = this.waterClick()
        }
        // case 3: seed back click
        else if(intersects_bag.length > 0) {
            if (this.trackingSeed){
                this.remove(this.trackingSeed);
            }
            console.log('bag');
            this.game_state = 'planting';
            // create seed for tracking
            const new_seed = new Seed();
            new_seed.scale.set(.1,.1,.1);
            this.trackingSeed = new_seed;
            new_seed.position.set(0,4.3,-1);
            this.add(new_seed);
            //new_obj = this.seedClick()
        }

        // Case 3: click on shovel
        //const intersects_shovel = raycaster.intersectObject(this.shovel); // check if intersected with water
        


        // case 3: click outside grid/ watering can, set state to neutral
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
        // get state of the square
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
            // plant seed
            if(grid_state == 'empty'){
                console.log('plant seed');
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
            // water flower
            console.log('water this plant');
            // rain 
        const clickPosition = new THREE.Vector3(this.highlightMesh.position.x, this.highlightMesh.position.y + 5, this.highlightMesh.position.z);
        console.log(grid_state);
        
        this.createRaindropParticles(clickPosition, //() => {
        //     this.waterSquare(grid_state, grid_code, this.highlightMesh.position.clone()); // Ensure that this is being called correctly
        //   }
          );

            // Define the target position and rotation
            //grid_square = this.highlightMesh.position;
            // const targetPosition = this.highlightMesh.position.clone();
            // targetPosition.y += 3;
            // //const targetRotation = new THREE.Euler(0, Math.PI / 4, 0);
            

            // this.water.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
            // if seed, grow to sprout
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
            this.game_state = 'neutral';
            
        }
    }


    // rain functions
    // Create Raindrop Particles
 createRaindropParticles(position, onComplete) {
    // const raindropMesh = new THREE.Mesh(this.raindropGeometry, this.raindropMaterial);
    // raindropMesh.position.copy(position);
    // this.add(raindropMesh);
    const numberOfDrops = 25; // Adjust as needed
    let raindropMesh;

    for (let i = 0; i < numberOfDrops; i++) {
      //raindropMesh = new THREE.Mesh(this.raindropGeometry, this.raindropMaterial);
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
  
    // // Add the raindrop to the array
    // this.raindrops.push({ mesh: raindropMesh, startY: position.y });
  
    // Remove raindrop after 2 seconds
    setTimeout(() => {
    //   this.remove(raindropMesh);
    //   // Remove raindrop from the array
    //   const index = this.raindrops.findIndex((drop) => drop.mesh === raindropMesh);
    //   if (index !== -1) {
    //     this.raindrops.splice(index, 1);
    //   }
    for (const drop of this.raindrops) {
        this.remove(drop.mesh);
      }
      this.raindrops.length = 0; // Clear the array
      // Call the onComplete callback (e.g., createFlower) after the rain is finished
    // if (typeof onComplete === 'function') {
    //     console.log('here 1');
    //     onComplete();
        
    //   }
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
