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
  
    // Callback function to update the timer display from the animation loop
    function updateTimerDisplayFromAnimationLoop(time) {
        updateTimerDisplay(time);
    }
  
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
        
            // Make water move
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
    const new_obj = scene.screenClick(raycaster);
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

// Create and append the timer display HTML dynamically
const timerDisplayDiv = document.createElement('div');
timerDisplayDiv.id = 'timerDisplay';
timerDisplayDiv.className = 'timer-display';
timerDisplayDiv.style.position = 'absolute';
timerDisplayDiv.style.top = '20px';
timerDisplayDiv.style.left = '50%';
timerDisplayDiv.style.transform = 'translateX(-50%)';
timerDisplayDiv.style.color = 'white';
timerDisplayDiv.style.fontSize = '24px';
document.body.appendChild(timerDisplayDiv);

// Create and append the modal HTML dynamically
const modalDiv = document.createElement('div');
modalDiv.id = 'myModal';
modalDiv.className = 'modal';

const modalContentDiv = document.createElement('div');
modalContentDiv.className = 'modal-content';

const readyParagraph = document.createElement('p');
readyParagraph.innerText = 'Ready?';

const startButton = document.createElement('button');
startButton.id = 'startButton';
startButton.innerText = 'Start';

modalContentDiv.appendChild(readyParagraph);
modalContentDiv.appendChild(startButton);
modalDiv.appendChild(modalContentDiv);
document.body.appendChild(modalDiv);

// Add this function to show the modal
function showModal() {
  modalDiv.style.display = 'block';
}

// Add this function to hide the modal
function hideModal() {
  modalDiv.style.display = 'none';
}

// Show the modal when the page loads
window.addEventListener('load', showModal);

// Append the styles to the document head
const styleElement = document.createElement('style');
styleElement.innerHTML = `
  .modal {
    display: none;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    text-align: center;
  }

  #startButton {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }

  .popup {
    display: none;
    position: fixed;
    z-index: 2;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 24px;
  }
`;

// add timer
// Create and append the game over popup HTML dynamically
const gameOverDiv = document.createElement('div');
gameOverDiv.id = 'gameOverPopup';
gameOverDiv.className = 'popup';
gameOverDiv.innerHTML = '<p>Game Over! <br> Total points: ' + scene.points + '</p>';
document.body.appendChild(gameOverDiv);

let timerId;

// Update the timer display based on the remaining time
let remainingTime = 60; // Initial time in seconds

// Add this function to update the timer display
function updateTimerDisplay() {
  timerDisplayDiv.innerText = `Time Left: ${remainingTime}s`;
}

// Add this function to start the timer
function startTimer() {
  // Set the timer to 60 seconds (60,000 milliseconds)
  timerId = setInterval(() => {
    if (remainingTime > 0) {
        remainingTime--;
    }

    // Update the timer display
    updateTimerDisplay();

    if (remainingTime === 0) {
      // Show the "Game Over" popup when the timer reaches zero
      showGameOverPopup();

      // Stop the timer interval
      clearInterval(timerId);
    }
  }, 1000); // Update every 1 second
}

// Add this function to hide the "Game Over" popup and reset the timer
function resetGame() {
  hideGameOverPopup();
  remainingTime = 60; // Reset the timer to 60 seconds
  updateTimerDisplay();
  startTimer(); // Start the timer again
}

// Add event listener to the Start button
startButton.addEventListener('click', () => {
  hideModal(); // Hide the "Ready?" modal
  resetGame(); // Start the game (reset timer)
});

// Add this function to show the "Game Over" popup
function showGameOverPopup() {
    console.log('game over');
    gameOverDiv.innerHTML = '<p>Game Over! <br> Total points: ' + scene.points + '</p>';;
  gameOverDiv.style.display = 'flex'; // Change to 'flex' to center the content
}

// Add this function to hide the "Game Over" popup
function hideGameOverPopup() {
  gameOverDiv.style.display = 'none';
}

document.head.appendChild(styleElement);
// -------------------------------------------------
