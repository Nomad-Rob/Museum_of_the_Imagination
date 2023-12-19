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
let imageGroup = new THREE.Group();
let imageGroupYPosition = 0; // Global variable to track the Y position of the image group
let cylinder; // Global variable to store the cylinder mesh



// Debug object for future enhancements
const debugObject = {};

// Canvas setup
const canvas = document.querySelector('.main-webgl');

// Main Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('#333333');



// Canvas Sizes
const sizesCanvas = {
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

// Start the animation loop
init();

// Event handler functions and other function definitions below...

function onWindowResize() {
  // Update canvas size, camera aspect ratio, and renderer on window resize
  sizesCanvas.width = window.innerWidth;
  sizesCanvas.height = window.innerHeight;

  // Update camera aspect ratio
  camera.aspect = sizesCanvas.width / sizesCanvas.height;
  camera.updateProjectionMatrix();

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
      
      fetch('images.json')
      .then(response => response.json())
      .then(data => {
        displayImagesAndText(data);
      })
  });
  
  
  function createCylinder() {
    const radius = 10;
    const height = 180;
    const radialSegments = 32; // Number of segments around the cylinder

    const geometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide, transparent: true, opacity: 0.0 });
    cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(0, -221, 0); // Set the position of the cylinder's bottom
    cylinder.rotation.y = -89.883; // Rotate on y axis to have first image lined properly
    window.addEventListener('wheel', () => {
      console.log(cylinder.rotation.y);
    })
    scene.add(cylinder);
  }
    

  function displayImagesAndText(data) {
    createCylinder();
    const numberOfImages = data.length;
    const circumference = 2 * Math.PI * cylinder.geometry.parameters.radiusTop;
    const spacing = circumference / numberOfImages; // Space between each image group

    data.reverse().forEach((item, index) => {
      // Load texture, create image plane and text sprite
      const texture = textureLoader.load(item.imageUrl);
      const imagePlane = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
      );

      // Position the image around the cylinder in a spiral
      const theta = (spacing * index) / cylinder.geometry.parameters.radiusTop; // Angle along the cylinder
      const spiralHeight = index * 13; // Adjust the amplitude of the y-axis movement
      const imageX = cylinder.geometry.parameters.radiusTop * Math.cos(theta) * 4.9;
      const imageY = spiralHeight;
      const imageZ = cylinder.geometry.parameters.radiusTop * Math.sin(theta) * 4.9;
      imagePlane.position.set(imageX, imageY, imageZ);
      imagePlane.lookAt(0, spiralHeight, 0);
      imagePlane.rotation.y += Math.PI;

      // Textsprite position
      const textSprite = createTextSprite(item.text, item.year);
      const textOffset = 0; // Horizontal offset (if needed)
      const textVerticalOffset = -2.75; // Adjust this value as needed to position below the image plane
      textSprite.position.set(
          imagePlane.position.x + textOffset, 
          imagePlane.position.y + textVerticalOffset, 
          imagePlane.position.z
      );
      textSprite.lookAt(0, spiralHeight + textVerticalOffset, 0);
      textSprite.rotation.y += Math.PI;
      
      // Create a group for the image and text and add to the cylinder
      const imageGroup = new THREE.Group();
      imageGroup.add(imagePlane);
      imageGroup.add(textSprite);
      cylinder.add(imageGroup);
    });
}

function createTextSprite(text, year) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 1600;
  canvas.height = 1300;

  context.font = 'bold 60px Arial';
  context.textAlign = 'center';

  const words = text.split(' ');
  const maxWordsPerLine = 5;
  const maxLines = 2;
  const lines = [];
  let currentLine = '';
  const lineHeight = 60;
  let textHeight = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + word + ' ';
    const metrics = context.measureText(testLine);
    const lineWidth = metrics.width;
    if (lineWidth > canvas.width && i > 0) {
      lines.push(currentLine);
      currentLine = word + ' ';
      textHeight += lineHeight;
    } else {
      currentLine = testLine;
    }
    if (lines.length >= maxLines) {
      break;
    }
  }
  lines.push(currentLine);
  textHeight += lineHeight * 3; // Additional space for year line and some padding

  // Create slightly black background for text area
  const startY = canvas.height - textHeight - lineHeight * 2; // Adjust the start position
  context.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black
  context.fillRect(0, startY, canvas.width, textHeight);

  // Draw text
  context.fillStyle = 'white';
  context.strokeStyle = 'black';
  context.lineWidth = 4;
  let y = startY + lineHeight; // Adjust the vertical positioning of text

  lines.forEach(line => {
    context.strokeText(line, canvas.width / 2, y);
    context.fillText(line, canvas.width / 2, y);
    y += lineHeight;
  });

  // Draw year
  const yearY = startY + textHeight - lineHeight; // Adjust the position of the year text
  context.strokeText(year, canvas.width / 2, yearY);
  context.fillText(year, canvas.width / 2, yearY);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
  const spriteGeometry = new THREE.PlaneGeometry(10, 10);
  const spriteMesh = new THREE.Mesh(spriteGeometry, spriteMaterial);

  return spriteMesh;
}




// Optional: Setting a timeout for certain actions, if necessary
setTimeout(() => {
  // Your delayed actions here
}, 50);
}


// SCROLLING EVENTS = Not fun!!!!!
window.addEventListener('wheel', (event) => {
    console.log('wheel event');
    const deltaY = event.deltaY;

    // Rotate the images and text around Santa
    const rotationAmount = 0.00273; // Adjust this value to control the rotation speed
    const rotationDirection = deltaY < 0 ? -1 : 1; // Determine rotation direction
    const rotationAngle = rotationAmount * -rotationDirection;

    models.forEach(model => {
        model.rotation.y += rotationAngle * 19; // Rotate the models
    });

    imageGroup.rotation.y += rotationAngle * 10; // Rotate the image group

    // Move the image group up or down
    const verticalMovementSpeed = 1.63; // Adjust this value to control the speed of vertical movement
    imageGroupYPosition += rotationDirection * verticalMovementSpeed;
    imageGroup.position.y = imageGroupYPosition;
    
    // Move the cylinder up or down on the y-axis
    cylinder.position.y += rotationDirection * verticalMovementSpeed;
    // rotate the cylinder
    cylinder.rotation.y += rotationAngle * 16;
    
});



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
          gltf.scene.scale.set(15, 15, 15);
          // gltf.scene.position.y = initialPositionMeshY 0;
          gltf.scene.position.z = 0;
          gltf.scene.position.y = -8.3;
          gltf.scene.position.x = 0;
          gltf.scene.rotation.x = 0;
          // gltf.scene.rotation.y = initialRotationMeshY 0

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
          gltf.scene.scale.set(0.15, 0.15, 0.15);
          gltf.scene.position.y = -23;
          // gltf.scene.position.y = initialPositionMeshY 0;
          gltf.scene.position.x = 0;
          gltf.scene.position.z = 6;
          gltf.scene.rotation.y = -1.6;
          
          // gltf.scene.rotation.y = initialRotationMeshY 0;

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

  renderer.setSize(sizesCanvas.width, sizesCanvas.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function setupCamera() {
  // Set up and return the main camera
  const camera = new THREE.PerspectiveCamera(69, sizesCanvas.width / sizesCanvas.height, 0.1, 250);
  camera.name = 'Main Camera';
  camera.position.x = -30;
  camera.position.y = 30;
  camera.position.z = 130;
  camera.lookAt(0, 0, 0);
  return camera;
}

function setupControls() {
  // Set up orbit controls
  controls.enabled = true;
  controls.enableRotate = true;
  controls.enablePan = false;
  controls.enableZoom = false;
}

function setupLighting() {
  // Set up scene lighting (ambient and point lights)
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 15);
  pointLight.position.set(0,0,0);
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

  // Animate the camera position after
  gsap.to(camera.position, {
      x: 0,
      y: 0,
      z: 60,
      duration: 2
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
    camera.lookAt(0, 0, 0)
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  animate();
}
