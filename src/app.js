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
camera.position.set(6, 3, -10);
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
    }
});
window.addEventListener('mousedown', function() {
    const objectExist = objects.find(function(object) {
        return (object.position.x === scene.highlightMesh.position.x)
        && (object.position.z === scene.highlightMesh.position.z)
    });

    if(!objectExist) {
        if(intersects.length > 0) {
            // const sphereClone = scene.sphereMesh.clone();
            // sphereClone.position.copy(scene.highlightMesh.position);
            // scene.add(sphereClone);
            // objects.push(sphereClone);
            // scene.highlightMesh.material.color.setHex(0xFF0000);


            // create new flower
            const new_flower = scene.addFlower(scene.highlightMesh.position);
            // console.log(scene.highlightMesh.position);
            objects.push(new_flower);
            scene.highlightMesh.material.color.setHex(0xFF0000);
        }
    }
    console.log(scene.children.length);
});
// -------------------------------------------------
