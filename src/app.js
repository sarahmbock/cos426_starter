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
import music from './sound.mp3';


// Initialize core ThreeJS components
const scene = new SeedScene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });

window.addEventListener('click', function() {
  const listener = new THREE.AudioListener();
  camera.add(listener);
  // Your Three.js audio initialization code here
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load(music, function (buffer) {
    const sound = new THREE.Audio(listener);
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    sound.play();
    scene.add(sound);
  });
});

let gamePhase = 'start'

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
controls.maxDistance = 14;
controls.update();
controls.maxPolarAngle =  Math.PI / 2.3; 
controls.minAzimuthAngle = Math.PI/1.1; 
controls.maxAzimuthAngle = -Math.PI/1.1;  


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
let intersects_bag;
let intersects_water;
const bag_z = scene.bag.position.z;
const water_z = scene.water.position.z;
let water_hover = false;

window.addEventListener('mousemove', function(e) {
    //console.log(scene.game_state)
    if(scene.game_state == 'death'){
      showGameOverPopup();
    }
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    intersects = raycaster.intersectObject(scene.soilMesh);
    intersects_bag = raycaster.intersectObject(scene.bag);
    intersects_water = raycaster.intersectObject(scene.water);
    if (intersects_water.length > 0) {
      //if (scene.water.position.z == water_z){
      document.body.style.cursor = 'pointer';
      scene.water.position.z = water_z - 0.6;
      water_hover = true;
      //}
    }
    else if (intersects_bag.length > 0){
      document.body.style.cursor = 'pointer';
      scene.bag.position.z = bag_z - 0.6;
    }
    else {
      document.body.style.cursor = 'default';
      if (water_hover){
        scene.water.position.z = water_z;
        water_hover = false;
      }
      scene.bag.position.z = bag_z;
      //scene.water.position.z = water_z;

      //scene.water.position.z = water_z;
    }
    if(intersects.length > 0) {
        const intersect = intersects[0];
        const highlightPos = new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
        scene.highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);

        const objectExist = objects.find(function(object) {
            return (object.position.x === scene.highlightMesh.position.x)
            && (object.position.z === scene.highlightMesh.position.z)
        });

        if(gamePhase != 'start'){
            if(!objectExist){
                scene.highlightMesh.material.color.setHex(0xFFFFFF);
            }
            else {
                scene.highlightMesh.material.color.setHex(0xFF0000);
            }  
        }
        
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
    if(gamePhase != 'start'){
        const new_obj = scene.screenClick(raycaster);
        if (new_obj) {
            objects.push(new_obj);
        }
    }
});

// -------------------------------------------------
// Add this line to create and append the points display div
const pointsDisplayDiv = document.createElement('div');
pointsDisplayDiv.id = 'pointsDisplay';
pointsDisplayDiv.style.position = 'absolute';
pointsDisplayDiv.style.top = '40px';
pointsDisplayDiv.style.left = '80px';
pointsDisplayDiv.style.color = 'purple';
pointsDisplayDiv.style.fontSize = '30px';
pointsDisplayDiv.style.fontFamily = 'Comic Sans MS';
document.body.appendChild(pointsDisplayDiv);

// Create and append the timer display HTML dynamically
const timerDisplayDiv = document.createElement('div');
timerDisplayDiv.id = 'timerDisplay';
timerDisplayDiv.className = 'timer-display';
timerDisplayDiv.style.position = 'absolute';
timerDisplayDiv.style.top = '20px';
timerDisplayDiv.style.left = '50%';
timerDisplayDiv.style.transform = 'translateX(-50%)';
timerDisplayDiv.style.color = 'purple';
timerDisplayDiv.style.fontSize = '24px';
timerDisplayDiv.style.fontFamily = 'Comic Sans MS';
document.body.appendChild(timerDisplayDiv);

// Create and append the modal HTML dynamically
const modalDiv = document.createElement('div');
modalDiv.id = 'myModal';
modalDiv.className = 'modal';

const modalContentDiv = document.createElement('div');
modalContentDiv.className = 'modal-content';

// Create and append the info box HTML dynamically
const infoBox = document.createElement('div');
infoBox.id = 'infoBox';
infoBox.className = 'info-box';

// Set the width, height, and styling of the info box
infoBox.style.width = '500px';
infoBox.style.height = '360px';
infoBox.style.border = '5px solid #000'; // Add a border
infoBox.style.margin = 'auto'; // Center the box horizontally
infoBox.style.padding = '10px'; // Add padding to the content for better appearance

const instruction = document.createElement('p');
instruction.innerText = 'Instructions';
instruction.style.fontSize = '24px';
instruction.style.fontFamily = 'Comic Sans MS';
instruction.style.textDecoration = 'underline';
infoBox.appendChild(instruction);

// Create an unordered list for bullet points
const bulletList = document.createElement('ul');
bulletList.style.listStyleType = 'circle'; // Bullet point style
// bulletList.style.paddingLeft = '20px'; // Set padding-left for the list
bulletList.style.fontSize = '18px';
bulletList.style.fontFamily = 'Comic Sans MS';
bulletList.style.textAlign = 'left'; // Align the bullet points to the left


// Add bullet points
const bulletPoint1 = document.createElement('li');
bulletPoint1.innerText = 'Click on the seed bag to grab a seed';

const bulletPoint2 = document.createElement('li');
bulletPoint2.innerText = 'Click on a plot of land to plant the seed';

const bulletPoint3 = document.createElement('li');
bulletPoint3.innerText = 'Click on the watering can';

const bulletPoint4 = document.createElement('li');
bulletPoint4.innerText = 'Click on your seed to water it';

const bulletPoint5 = document.createElement('li');
bulletPoint5.innerText = 'Continue to water your flower until it blossoms!';

// Append bullet points to the list
bulletList.appendChild(bulletPoint1);
bulletList.appendChild(bulletPoint2);
bulletList.appendChild(bulletPoint3);
bulletList.appendChild(bulletPoint4);
bulletList.appendChild(bulletPoint5);


// Append the list to the info box
infoBox.appendChild(bulletList);

// Note
const note = document.createElement('p');
note.innerText = 'Different flowers will get you a different number of points. Rare flowers will get you more points, so try to plant as many flowers as you can before the time runs out! And hope that you don\'t get a bad seed \;\)';
note.style.fontSize = '18px';
note.style.fontFamily = 'Comic Sans MS';
// note.style.textAlign = 'left'; // Align the bullet points to the left
infoBox.appendChild(note);


// Append the box to the modal content
modalContentDiv.appendChild(infoBox);

const readyParagraph = document.createElement('p');
readyParagraph.innerText = 'Ready?';
readyParagraph.style.fontSize = '24px';
readyParagraph.style.fontFamily = 'Comic Sans MS';

const startButton = document.createElement('button');
startButton.id = 'startButton';
startButton.innerText = 'Start';
startButton.style.backgroundColor = 'SeaShell'
startButton.style.fontSize = '20px';
startButton.style.fontFamily = 'Comic Sans MS';

modalContentDiv.appendChild(readyParagraph);
modalContentDiv.appendChild(startButton);
modalDiv.appendChild(modalContentDiv);
modalContentDiv.style.backgroundColor = 'rgba(255, 245, 238, 0.8)'
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

// Create and append the game over popup HTML dynamically
const gameOverDiv = document.createElement('div');
gameOverDiv.id = 'gameOverPopup';
gameOverDiv.className = 'popup';
//gameOverDiv.innerHTML = '<p>Game Over! <br> Total points: ' + scene.points + '</p>';

// Create and append the refresh button dynamically
const refreshButton = document.createElement('button');
refreshButton.id = 'refreshButton';
refreshButton.innerText = 'Refresh Page';
refreshButton.style.backgroundColor = 'SeaShell';
refreshButton.style.fontSize = '20px';
refreshButton.style.fontFamily = 'Comic Sans MS';

// Add event listener to the refresh button
refreshButton.addEventListener('click', function() {
    location.reload(); // Reload the page when the button is clicked
});

document.body.appendChild(gameOverDiv);

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
  #refreshButton {
    margin-top: 150px;
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
      gamePhase = 'start'

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
  gamePhase = 'playing'
  hideModal(); // Hide the "Ready?" modal
  resetGame(); // Start the game (reset timer)
});

// Add this function to show the "Game Over" popup
function showGameOverPopup() {
    //console.log('game over');
    if (scene.game_state == 'death'){
      gameOverDiv.innerHTML = '<p>You got a bad seed! <br> Total points: ' + scene.points + '</p>';
    }
    else{
      gameOverDiv.innerHTML = '<p>You ran out of time! <br> Total points: ' + scene.points + '</p>';
    }
  refreshButton.style.backgroundColor = 'SeaShell'
  gameOverDiv.style.fontFamily = 'Comic Sans MS';
  gameOverDiv.appendChild(refreshButton);
  gameOverDiv.style.textAlign = 'center';
  gameOverDiv.style.display = 'flex'; // Change to 'flex' to center the content
}

// Add this function to hide the "Game Over" popup
function hideGameOverPopup() {
  gameOverDiv.style.display = 'none';
}

document.head.appendChild(styleElement);
// -------------------------------------------------
