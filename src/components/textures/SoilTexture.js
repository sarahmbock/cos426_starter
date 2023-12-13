// Import necessary modules
import * as THREE from 'three';

// Create and export the soilTexture
const textureLoader = new THREE.TextureLoader();
const SoilTexture = textureLoader.load('soil_texture.jpeg');

// Additional texture configurations (if needed)
SoilTexture.repeat.set(3, 3);
SoilTexture.wrapS = THREE.RepeatWrapping;
SoilTexture.wrapT = THREE.RepeatWrapping;

export default SoilTexture;

