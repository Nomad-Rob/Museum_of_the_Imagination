// Import necessary modules from three.js and GSAP
import * as THREE from 'three';
import { gsap, Power1 } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// DOM Elements
const player = document.querySelector('.player');
const playerClose = document.querySelector('.player-close');
const playerSource = document.querySelector('.player-source');
const counterLoading = document.querySelector('.counterLoading');
const header = document.querySelector('header');
const h1 = document.querySelector('h1');
const footer = document.querySelector('footer');
const loading = document.querySelector('.loading');
const started = document.querySelector('.started');
const startedBtn = document.querySelector('.started-btn');

// Scene variables
let touchValue = 1;
let videoLook = false;
let scroll = 0.0;
let initialPositionMeshY = -1;
let initialRotationMeshY = Math.PI * 0.9;
let planeClickedIndex = -1;
let isLoading = false;
let lastPosition = {
    px: null,
    py: null,
    pz: null,
    rx: null,
    ry: null,
    rz: null
};

// Debug object for future enhancements
const debugObject = {};

// Canvas setup
const canvas = document.querySelector('.main-webgl');

// Main Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('#ff69b4');

// Background Scene
const backgroundScene = new THREE.Scene();

// Canvas Sizes
const sizesCanvas = {
  width: window.innerWidth,
  height: window.innerHeight
};

// Event Listener for window resize
window.addEventListener('resize', onWindowResize);

// Raycaster for interaction
const raycaster = new THREE.Raycaster();
let currentIntersect = null;

// Mouse move tracking
let mouse = new THREE.Vector2();
window.addEventListener('mousemove', onMouseMove);

// Audio setup
const music = new Audio('sounds/party.mp3');
music.volume = 0.05;

// Loaders setup
const loadingManager = new THREE.LoadingManager(onLoadComplete, onProgress);
const textureLoader = new THREE.TextureLoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);

// Array to store loaded models
let models = [];

// Load models (Santa and Sleigh)
loadModels();

// Axes Helper for development
const axesHelper = new THREE.AxesHelper(250);
scene.add(axesHelper);

// Initialize the canvas on DOMContentLoaded
window.addEventListener('DOMContentLoaded', initializeCanvas);

// Environment map intensity (Debugging and Material Enhancement)
debugObject.envMapIntensity = 2;

// Camera setup
const camera = setupCamera();
scene.add(camera);

// Background camera setup (Orthographic)
const backgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 0);

// Controls setup
const controls = new OrbitControls(camera, canvas);
setupControls();

// Lighting setup
setupLighting();

// Renderer setup
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});
setupRenderer();

// Event listener for player close
playerClose.addEventListener('click', onClosePlayer);

// Clock for animations and updates
const clock = new THREE.Clock();

// Start the animation loop
init();

// Event handler functions and other function definitions below...

function onWindowResize() {
  // Update canvas size, camera aspect ratio, and renderer on window resize
  sizesCanvas.width = window.innerWidth;
  sizesCanvas.height = window.innerHeight;

  camera.aspect = sizesCanvas.width / sizesCanvas.height;
  camera.updateProjectionMatrix();

  backgroundCamera.left = -sizesCanvas.width / 2;
  backgroundCamera.right = sizesCanvas.width / 2;
  backgroundCamera.top = sizesCanvas.height / 2;
  backgroundCamera.bottom = -sizesCanvas.height / 2;
  backgroundCamera.updateProjectionMatrix();

  renderer.setSize(sizesCanvas.width, sizesCanvas.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function onMouseMove(event) {
  // Update mouse position
  mouse.x = event.clientX / sizesCanvas.width * 2 - 1;
  mouse.y = -(event.clientY / sizesCanvas.height) * 2 + 1;
}

function onLoadComplete() {
  // Hide the loading percentage counter and display the main elements
  gsap.to(counterLoading, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
          counterLoading.style.display = 'none';
      }
  });

  // Animate header, h1, and footer into view
  gsap.to(header, {
      top: 10,
      left: 10,
      transform: 'translate(0, 0)',
      ease: Power1.easeIn,
      duration: 0.5
  });

  gsap.to(h1, {
      fontSize: 25,
      top: 10,
      left: 10,
      transform: 'translate(0, 0)',
      width: 150,
      ease: Power1.easeIn,
      duration: 0.5
  });

  gsap.to(footer, {
      delay: 0.5,
      opacity: 1,
      ease: Power1.easeIn,
      duration: 0.5
  });

  // Reveal the 'started' button with an animation
  gsap.to(started, {
      delay: 0.9,
      opacity: 1,
      duration: 0.5
  });

  // Add an event listener to the 'startedBtn' element
  startedBtn.addEventListener('click', () => {
      continueAnimation();
      console.log('startedBtn clicked');
  });

  // Setting a timeout to ensure that certain actions only happen after the rest of the script has loaded
  setTimeout(() => {
      isLoading = true; // Flag indicating loading is complete
  }, 50);
}


function onProgress(itemUrl, itemsLoaded, itemsTotal) {
  // Update progress for loading resources
  const progressRatio = itemsLoaded / itemsTotal;
  counterLoading.innerHTML = `${(progressRatio * 100).toFixed(0)}%`;
  header.style.width = `${progressRatio * 550}px`;
}

function loadModels() {
  // Load Santa Model
  gltfLoader.load(
      "models/santa.glb",
      (gltf) => {
          gltf.scene.scale.set(5, 5, 5);
          gltf.scene.position.y = initialPositionMeshY - 2;
          gltf.scene.position.z = -2;
          gltf.scene.rotation.y = initialRotationMeshY;

          scene.add(gltf.scene);
          models.push(gltf.scene);

          scene.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                  child.material.envMapIntensity = debugObject.envMapIntensity;
                  child.material.needsUpdate = true;
              }
          });
      },
      undefined,
      (error) => {
          console.error('An error occurred while loading the Santa model:', error);
      }
  );

  // Load Sleigh Model
  gltfLoader.load(
      "models/sleigh.glb",
      (gltf) => {
          gltf.scene.scale.set(0.05, 0.05, 0.05);
          gltf.scene.position.y = initialPositionMeshY - 5;
          gltf.scene.position.x = -0.5;
          gltf.scene.rotation.y = initialRotationMeshY - 1.6;

          scene.add(gltf.scene);
          models.push(gltf.scene);
      },
      undefined,
      (error) => {
          console.error('An error occurred while loading the Sleigh model:', error);
      }
  );
}

function initializeCanvas() {
  // Initialize the canvas size and camera settings
  camera.aspect = sizesCanvas.width / sizesCanvas.height;
  camera.updateProjectionMatrix();

  backgroundCamera.left = -sizesCanvas.width / 2;
  backgroundCamera.right = sizesCanvas.width / 2;
  backgroundCamera.top = sizesCanvas.height / 2;
  backgroundCamera.bottom = -sizesCanvas.height / 2;
  backgroundCamera.updateProjectionMatrix();

  renderer.setSize(sizesCanvas.width, sizesCanvas.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function setupCamera() {
  // Set up and return the main camera
  const camera = new THREE.PerspectiveCamera(90, sizesCanvas.width / sizesCanvas.height, 0.1, 300);
  camera.position.set(1, 20, -40);
  return camera;
}

function setupControls() {
  // Set up orbit controls
  controls.enabled = true;
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
}

function setupLighting() {
  // Set up scene lighting (ambient and point lights)
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 15);
  pointLight.position.set(-5.5, 5.5, -5);
  scene.add(pointLight);
}

function setupRenderer() {
  // Configure the WebGL renderer
  renderer.setSize(sizesCanvas.width, sizesCanvas.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.autoClear = false;
}

function continueAnimation() {
  // Music and sounds here, continuous playing
  music.loop = true;
  music.play();

  // Animate the opacity of 'started' to 0
  gsap.to(started, {
      opacity: 0,
      duration: 0.5
  });

  // Animate the opacity of 'loading' to 0
  gsap.to(loading, {
      opacity: 0,
      duration: 0.5
  });

  // Animate the camera position
  gsap.to(camera.position, {
      delay: 1,
      x: 3.0,
      y: 10,
      z: -20,
      duration: 2.5
  });

  // Set a timeout to execute the following block of code after a delay of 250 milliseconds
  setTimeout(() => {
      // Changing the visibility of the 'loading' and 'started' elements to 'hidden'
      loading.style.visibility = "hidden";
      started.style.visibility = "hidden";

      // Uncomment the below lines if you have groupPlane and groupText elements
      // groupPlane.visible = true;
      // groupText.visible = true;

      // Setting the 'isLoading' variable to true
      isLoading = true;
  }, 250);
}


function onClosePlayer() {
  // Reset the source of the player to stop any playing media
  playerSource.src = "";

  // Resume music and other background sounds, if any
  music.play();

  // Animate the closing of the player
  gsap.to(player, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
          player.style.visibility = "hidden";
      }
  });

  // Reset the position and rotation of the clicked plane, if any
  if (planeClickedIndex !== -1) {
      gsap.to(groupPlane.children[planeClickedIndex].position, {
          x: lastPosition.px,
          y: lastPosition.py,
          z: lastPosition.pz,
          duration: 0.5
      });

      gsap.to(groupPlane.children[planeClickedIndex].rotation, {
          x: lastPosition.rx,
          y: lastPosition.ry,
          z: lastPosition.rz,
          duration: 0.5
      });

      planeClickedIndex = -1;
  }

  // Set a timeout to ensure video look is disabled after the animations
  setTimeout(() => {
      videoLook = false;
  }, 500);
}


function init() {
  // The main animation loop
  const animate = () => {
    renderer.render(scene, camera);
    renderer.render(backgroundScene, backgroundCamera);
    window.requestAnimationFrame(animate);
  };

  animate();
}
