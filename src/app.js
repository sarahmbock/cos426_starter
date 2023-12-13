/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SeedScene } from 'scenes';
import * as THREE from 'three';


// Initialize core ThreeJS components
const scene = new SeedScene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });

// Set up camera
//camera.position.set(6, 3, -10);
camera.position.set(0, 3, -13);
camera.lookAt(new Vector3(0, 0, 0));

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// Set up controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 16;
controls.update();

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    controls.update();
    renderer.render(scene, camera);
    scene.update && scene.update(timeStamp);

    // Update the points display
    pointsDisplayDiv.innerText = `Points: ${scene.points}`;

   
    
    window.requestAnimationFrame(onAnimationFrameHandler);
    
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);

// -------------------------------------------------
const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersects;
let objects = [];

window.addEventListener('mousemove', function(e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    intersects = raycaster.intersectObject(scene.planeMesh);
    if(intersects.length > 0) {
        const intersect = intersects[0];
        const highlightPos = new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
        scene.highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);

        const objectExist = objects.find(function(object) {
            return (object.position.x === scene.highlightMesh.position.x)
            && (object.position.z === scene.highlightMesh.position.z)
        });

        if(!objectExist)
            scene.highlightMesh.material.color.setHex(0xFFFFFF);
        else
            scene.highlightMesh.material.color.setHex(0xFF0000);
        
            // make water move?
            if (scene.game_state == 'watering'){

                const targetPosition = new THREE.Vector3(scene.highlightMesh.position.x, 3, scene.highlightMesh.position.z);
                scene.water.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
                scene.water.scale.set(0.25,0.25,0.25);
                
            }
            else if (scene.game_state == 'planting'){

                const targetPosition = new THREE.Vector3(scene.highlightMesh.position.x, scene.highlightMesh.position.y, scene.highlightMesh.position.z);
                scene.trackingSeed.position.set(targetPosition.x, 0.1, targetPosition.z);
                
            }
    }
    // move water back to starting position if not hovering over shelf
    else if (scene.game_state == 'watering'){
            scene.water.position.set(-1,3.7,0);
        }
    else if (scene.game_state == 'planting'){
        scene.trackingSeed.position.set(0,4.3,-1);
    }
});
// Mouse click on screen
window.addEventListener('mousedown', function(e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera, objects);
    const new_obj = scene.screenClick(mousePosition, raycaster);
    if (new_obj) {
        objects.push(new_obj);
    }

});





// -------------------------------------------------
// Add this line to create and append the points display div
const pointsDisplayDiv = document.createElement('div');
pointsDisplayDiv.id = 'pointsDisplay';
pointsDisplayDiv.style.position = 'absolute';
pointsDisplayDiv.style.top = '40px';
pointsDisplayDiv.style.left = '80px';
pointsDisplayDiv.style.color = 'white';
pointsDisplayDiv.style.fontSize = '30px';
document.body.appendChild(pointsDisplayDiv);
// -------------------------------------------------
