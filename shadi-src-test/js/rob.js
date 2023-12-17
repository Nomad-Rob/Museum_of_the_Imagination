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
const footer = document.querySelector('footer');
const loading = document.querySelector('.loading');
const started = document.querySelector('.started');
const startBtn = document.querySelector('.started-btn');

// // Debug object for future enhancements
// const debugObject = {};

// // Canvas setup
// const canvas = document.querySelector('.main-webgl');

// Main santaScene
const santaScene = new THREE.Scene();
santaScene.background = new THREE.Color('#333333');



// Canvas Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

// Event Listener for window resize
window.addEventListener('resize', onWindowResize);



// Mouse move tracking
let mouse = new THREE.Vector2();
window.addEventListener('mousemove', onMouseMove);

// Audio setup
const music = new Audio('sounds/christmas.mp3');
music.volume = 0.00;

// Loaders setup
const loadingManager = new THREE.LoadingManager(onLoadComplete, onProgress);
const textureLoader = new THREE.TextureLoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);

// Array to store loaded models
let models = [];

// Load models (Santa and Sleigh)
loadModels();

// // Axes Helper for development
// const axesHelper = new THREE.AxesHelper(250);
// santaScene.add(axesHelper);

// // Initialize the canvas on DOMContentLoaded
// window.addEventListener('DOMContentLoaded', initializeCanvas);

// // Environment map intensity (Debugging and Material Enhancement)
// debugObject.envMapIntensity = 2;

// Santa Camera setup
const santaCamera = setupSantaCamera();
santaScene.add(santaCamera);

// Background camera setup (Orthographic)
const backgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 0);

// Controls setup
const controls = new OrbitControls(santaCamera, canvas);
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

// Start the animation loop
init();

// Event handler functions and other function definitions below...

function onWindowResize() {
  // Update canvas size, santaCamera aspect ratio, and renderer on window resize
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update santaCamera aspect ratio
  santaCamera.aspect = sizes.width / sizes.height;
  santaCamera.updateProjectionMatrix();
  // Update background camera aspect ratio
  backgroundCamera.left = -sizes.width / 2;
  backgroundCamera.right = sizes.width / 2;
  backgroundCamera.top = sizes.height / 2;
  backgroundCamera.bottom = -sizes.height / 2;
  backgroundCamera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function onMouseMove(event) {
  // Update mouse position
  mouse.x = event.clientX / sizes.width * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
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

  // Add an event listener to the 'startBtn' element
  startBtn.addEventListener('click', () => {
      continueAnimation();
      console.log('startBtn clicked');
      
      fetch('images.json')
      .then(response => response.json())
      .then(data => {
        displayImagesAndText(data);
      })
  });

  function displayImagesAndText(data) {
    // Create a group to hold the images and text
    const imageGroup = new THREE.Group();
    santaScene.add(imageGroup);

    const numImages = data.length;
    const radius = 50; // Adjust the radius for spacing between images
    const angleIncrement = (2 * Math.PI) / numImages;

    // Get the position of the santa.glb model
    const santaPosition = models[0].position;

    data.forEach((item, index) => {
        // Calculate the position of the image based on polar coordinates
        const angle = angleIncrement * index;
        const imageX = santaPosition.x + radius * Math.cos(angle);
        const imageY = santaPosition.y * (index + 1); // Adjust the Y position
        const imageZ = santaPosition.z + radius * Math.sin(angle);

        // Load image texture
        const texture = textureLoader.load(item.imageUrl);

        // Create a plane with the image texture
        const imagePlane = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10), // Adjust the size as needed
            new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
        );

        // Set the position and rotation of the image
        imagePlane.position.set(imageX, imageY, imageZ);
        imagePlane.lookAt(santaPosition);

        // Create a text sprite
        const textSprite = createTextSprite(item.text, item.year);

        // Set the position of the text relative to the image
        const textOffsetX = 5; // Adjust this value as needed
        const textOffsetZ = 5;
        textSprite.position.set(imageX + textOffsetX, imageY, imageZ + textOffsetZ);

        // Set the rotation of the text to match the image
        textSprite.lookAt(santaPosition);

        // Add the image and text to the group
        imageGroup.add(imagePlane);
        imageGroup.add(textSprite);
    });
}
  

function createTextSprite(text, year) {
  // Create a canvas element to generate the text sprite
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 600;

  // Customize the appearance of the text
  context.font = '60px Arial'; // Adjust font size and style as needed
  context.fillStyle = 'white'; // Adjust text color as needed
  context.textAlign = 'center';

  // Split the text into words
  const words = text.split(' ');

  // Calculate the maximum number of words that can fit in a line
  const maxWordsPerLine = 5; // Adjust as needed

  // Calculate the maximum number of lines that can fit in the canvas
  const maxLines = 2; // Adjust as needed

  // Calculate the maximum number of words that can fit in the text sprite
  const maxWords = maxWordsPerLine * maxLines;

  // Create an array to store the lines of text
  const lines = [];

  // Iterate through the words and create lines of text
  let currentLine = '';
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + word + ' ';
    const metrics = context.measureText(testLine);
    const lineWidth = metrics.width;

    if (lineWidth > canvas.width && i > 0) {
      lines.push(currentLine);
      currentLine = word + ' ';
    } else {
      currentLine = testLine;
    }

    if (lines.length >= maxLines) {
      break;
    }
  }

  // Push the remaining words as the last line
  lines.push(currentLine);

  // Draw the lines of text on the canvas
  const lineHeight = 60; // Adjust line height as needed
  const startY = (canvas.height - (lines.length * lineHeight)) / 2;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const y = startY + (i * lineHeight);
    context.fillText(line, canvas.width / 2, y);
  }

  // Draw the year underneath the text
  context.font = '40px Arial'; // Adjust font size and style as needed
  const yearLineHeight = 40; // Adjust line height for the year
  const yearY = startY + (lines.length * lineHeight) + yearLineHeight; // Adjust the vertical position of the year
  context.fillText(year, canvas.width / 2, yearY);

  // Create a texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);

  // Create a sprite with the texture
  const spriteMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
  const spriteGeometry = new THREE.PlaneGeometry(10, 10);
  const spriteMesh = new THREE.Mesh(spriteGeometry, spriteMaterial);

  // Scale the sprite to match the canvas size
  spriteMesh.rotateX(180);

  return spriteMesh;
}

  // Setting a timeout to ensure that certain actions only happen after the rest of the script has loaded
  setTimeout(() => {
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
          gltf.santaScene.scale.set(5, 5, 5);
          // gltf.santaScene.position.y = initialPositionMeshY 0;
          gltf.santaScene.position.z = 0;
          gltf.santaScene.position.y = -5;
          gltf.santaScene.position.x = 0;
          gltf.santaScene.rotation.x = 0;
          // gltf.santaScene.rotation.y = initialRotationMeshY 0

          santaScene.add(gltf.santaScene);
          models.push(gltf.santaScene);

          santaScene.traverse((child) => {
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
          gltf.santaScene.scale.set(0.05, 0.05, 0.05);
          gltf.santaScene.position.y = -7.8;
          // gltf.santaScene.position.y = initialPositionMeshY 0;
          gltf.santaScene.position.x = 0;
          gltf.santaScene.position.z = -1.8;
          gltf.santaScene.rotation.y = -1.6;
          
          // gltf.santaScene.rotation.y = initialRotationMeshY 0;

          santaScene.add(gltf.santaScene);
          models.push(gltf.santaScene);
      },
      undefined,
      (error) => {
          console.error('An error occurred while loading the Sleigh model:', error);
      }
  );
}



// function initializeCanvas() {
//   // Initialize the canvas size and camera settings
//   santaCamera.aspect = sizes.width / sizes.height;
//   santaCamera.updateProjectionMatrix();

//   backgroundCamera.left = -sizes.width / 2;
//   backgroundCamera.right = sizes.width / 2;
//   backgroundCamera.top = sizes.height / 2;
//   backgroundCamera.bottom = -sizes.height / 2;
//   backgroundCamera.updateProjectionMatrix();

//   renderer.setSize(sizes.width, sizes.height);
//   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// }

function setupSantaCamera() {
  // Set up and return the main santaCamera
  const santaCamera = new THREE.PerspectiveCamera(80, sizes.width / sizes.height, 0.1, 250);
  santaCamera.name = 'Santa Camera';
  santaCamera.position.x = 0;
  santaCamera.position.y = 5;
  santaCamera.position.z = 30;
  return santaCamera;
}

function setupControls() {
  // Set up orbit controls
  controls.enabled = true;
  controls.enableZoom = true;
}

function setupLighting() {
  // Set up santaScene lighting (ambient and point lights)
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  santaScene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 15);
  pointLight.position.set(0,0,0);
  santaScene.add(pointLight);
}

function setupRenderer() {
  // Configure the WebGL renderer
  renderer.setSize(sizes.width, sizes.height);
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

  // Animate the santaCamera position after
  gsap.to(santaCamera.position, {
      delay: 1,
      x: 0,
      y: 5,
      z: 18,
      duration: 1
  });
  
  setTimeout(() => {
    loading.style.visibility = "hidden"
    started.style.visibility = "hidden"
  }, 250);
  

  // Set a timeout to execute the following block of code after a delay of 250 milliseconds
  setTimeout(() => {
      // Changing the visibility of the 'loading' and 'started' elements to 'hidden'
      loading.style.visibility = "hidden";
      started.style.visibility = "hidden";
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

  // Set a timeout to ensure video look is disabled after the animations
  setTimeout(() => {
      videoLook = false;
  }, 500);
}


function init() {
  // The main animation loop
  const animate = () => {
    renderer.render(santaScene, santaCamera);
    window.requestAnimationFrame(animate);
  };

  animate();
}
