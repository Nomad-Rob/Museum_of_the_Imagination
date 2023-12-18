import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap';
import { Power1 } from 'gsap';
import * as dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

// DOM Elements
const player = document.querySelector('.player');
const playerClose = document.querySelector('.player-close');
const playerSource = document.querySelector('.player-source');
const counterLoading = document.querySelector('.counterLoading');
const footer = document.querySelector('footer');
const loading = document.querySelector('.loading');
const started = document.querySelector('.started');
const startBtn = document.querySelector('.start-btn');

// Debug object for future enhancements
const debugObject = {};

// dat.Gui instantiation
const gui = new dat.GUI();

// Timeline instantiation
const tl = gsap.timeline({defaults: {duration: 1}});

// Main page Camera
const mainCamera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 600);
mainCamera.position.z = 160;
// mainCamera.lookAt(0, 83, 0);

// Import canvas
const canvas = document.querySelector(".webgl");

// Rob's Santa Scene
const santaScene = new THREE.Scene();
santaScene.background = new THREE.Color('#333333');

// Main Snow Scene
const snowScene = new THREE.Scene();

// Renderer
const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(3);

// Controls, set initally to false when page is loaded
const controls = new OrbitControls(mainCamera, canvas);
setupControls();
controls.enabled = false;

// Mouse move tracking
let mouse = new THREE.Vector2();
window.addEventListener('mousemove', onMouseMove);

// Audio setup
const music = new Audio('sounds/silent-night.mp3');
music.volume = 0.5;

// Loaders setup
const loadingManager = new THREE.LoadingManager(onLoadComplete, onProgress);
const textureLoader = new THREE.TextureLoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);

// Array to store loaded models
let models = [];

// Load models (Santa and Sleigh)
loadModels();

// Santa Camera setup
const santaCamera = setupSantaCamera();
santaScene.add(santaCamera);

// Background camera setup (Orthographic)
const backgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 0);

// Choose correct camera to display
switchCamera('mainCamera');

// Lighting setup
setupLighting();

// Event listener for player close
playerClose.addEventListener('click', onClosePlayer);

// *********************************************************
// Snowflakes
let particles;
let positions = [], velocities = []; // snowflake positions(x, y, z) and velocities(x, y, z) 

const numSnowflakes = 45000;

const maxRange = 1000, minRange = maxRange/2; // snowflakes placed from -500 to 500 x & z axes
const minHeight = 150; // snowflakes placed from 150 to 500 on y axis

// BufferGeometry stores data as an array with individual attributes (position, color, size, faces, etc)
const snowGeometry = new THREE.BufferGeometry();

// Function fills position and velocities arrays with values
function addSnowflakes () {
  // 1) Create snowflake geometry
  for(let i=0; i<numSnowflakes; i++) {
    positions.push(
      Math.floor(Math.random() * maxRange - minRange),
      Math.floor(Math.random() * minRange + minHeight),
      Math.floor(Math.random() * maxRange - minRange)
    );

    velocities.push(
      Math.floor(Math.random() * 6 - 3) * .01,
      Math.floor(Math.random() * 5 + 0.12) * 0.18,
      Math.floor(Math.random() * 6 - 3) * 0.1
    );
  }

  // each attribute in BufferGeometry has an array of values
  snowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  snowGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

  // 2) Create snowflake material
  // console.log(snowflakePNG);

  const flakeMaterial = new THREE.PointsMaterial({
    size: 3,
    map: new THREE.TextureLoader().load("/images/snowflake.png"),
    blending: THREE.AdditiveBlending, // makes snowflake vibrant white
    depthTest: false, // do not determine if object is in front of another for performance
    transparent: true, // enable opacity changes
    opacity: .7,
  });

  particles = new THREE.Points(snowGeometry, flakeMaterial);
  snowScene.add(particles);
}

// Function updates position of snowflakes
function updateSnowParticles() {
  for (let i = 0; i < numSnowflakes * 3; i += 3) {
    // Add velocity to position of each snowflake
    // change x position by x velocity
    snowGeometry.attributes.position.array[i] -= snowGeometry.attributes.velocity.array[i];
    // change y position by y velocity
    snowGeometry.attributes.position.array[i+1] -= snowGeometry.attributes.velocity.array[i+1];
    // change z position by z velocity
    snowGeometry.attributes.position.array[i+2] -= snowGeometry.attributes.velocity.array[i+2];
    
    // check to see if snowflake is off screen, if so, move to new starting position
    if (snowGeometry.attributes.position.array[i+1] < -160) {
      snowGeometry.attributes.position.array[i] = Math.floor(Math.random() * maxRange - minRange); // x
      snowGeometry.attributes.position.array[i+1] = Math.floor(Math.random() * minRange + minHeight); // y
      snowGeometry.attributes.position.array[i+2] = Math.floor(Math.random() * maxRange - minRange); // z
    }
  }
  // since attribute changes, needs to be present for gpu to update position of array of particles
  snowGeometry.attributes.position.needsUpdate = true;
}
 
addSnowflakes();
// console.log(snowGeometry);
// *********************************************************


// *********************************************************
// Parallax

// Loader for images
const parallaxLoader = new THREE.TextureLoader();

// Load all assets and create basic materials for them
const bgMaterial = new THREE.MeshBasicMaterial({ map: parallaxLoader.load('images/parallax-assets/background.png') });
const santaMaterial = new THREE.MeshBasicMaterial({ map: parallaxLoader.load('images/parallax-assets/santa.png'), transparent: true, side: THREE.DoubleSide });
const leftMountainBgMaterial = new THREE.MeshBasicMaterial({ map: parallaxLoader.load('images/parallax-assets/left-mountain-background.png'), transparent: true, side: THREE.DoubleSide });
const rightMountainBgMaterial = new THREE.MeshBasicMaterial({ map: parallaxLoader.load('images/parallax-assets/right-mountain-background.png'), transparent: true, side: THREE.DoubleSide });
const mainMountainMaterial = new THREE.MeshBasicMaterial({ map: parallaxLoader.load('images/parallax-assets/main-mountain.png'), transparent: true, side: THREE.DoubleSide });
const rightMountainPreBgMaterial = new THREE.MeshBasicMaterial({ map: parallaxLoader.load('images/parallax-assets/right-mountain-pre-background.png'), transparent: true });
const middleMountainMaterial = new THREE.MeshBasicMaterial({ map: parallaxLoader.load('images/parallax-assets/middle-mountain.png'), transparent: true });
const rightMountainPreFgMaterial = new THREE.MeshBasicMaterial({ map: parallaxLoader.load('images/parallax-assets/right-mountain-pre-foreground.png'), transparent: true });
const rightRockFgMaterial = new THREE.MeshBasicMaterial({ map: parallaxLoader.load('images/parallax-assets/right-rock-foreground.png'), transparent: true });
const leftMountainFgMaterial = new THREE.MeshBasicMaterial({ map: parallaxLoader.load('images/parallax-assets/left-mountain-foreground.png'), transparent: true });

// Background geometry
const bgGeometry = new THREE.PlaneGeometry(530, 321);
const santaGeometry = new THREE.PlaneGeometry(476, 113);
const leftMountainBgGeometry = new THREE.PlaneGeometry(230, 104);
const rightMountainBgGeometry = new THREE.PlaneGeometry(194, 89);
const mainMountainGeometry = new THREE.PlaneGeometry(411, 229);
const rightMountainPreBgGeometry = new THREE.PlaneGeometry(184, 148);
const middleMountainGeometry = new THREE.PlaneGeometry(146, 123);
const rightMountainPreFgGeometry = new THREE.PlaneGeometry(156, 143);
const rightRockFgGeometry = new THREE.PlaneGeometry(135, 35);
const leftMountainFgGeometry = new THREE.PlaneGeometry(211, 154);

// Create meshes from image materials
const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
const santaMesh = new THREE.Mesh(santaGeometry, santaMaterial);
const leftMountainBgMesh = new THREE.Mesh(leftMountainBgGeometry, leftMountainBgMaterial);
const rightMountainBgMesh = new THREE.Mesh(rightMountainBgGeometry, rightMountainBgMaterial);
const mainMountainMesh = new THREE.Mesh(mainMountainGeometry, mainMountainMaterial);
const rightMountainPreBgMesh = new THREE.Mesh(rightMountainPreBgGeometry, rightMountainPreBgMaterial);
const middleMountainMesh = new THREE.Mesh(middleMountainGeometry, middleMountainMaterial);
const rightMountainPreFgMesh = new THREE.Mesh(rightMountainPreFgGeometry, rightMountainPreFgMaterial);
const rightRockFgMesh = new THREE.Mesh(rightRockFgGeometry, rightRockFgMaterial);
const leftMountainFgMesh = new THREE.Mesh(leftMountainFgGeometry, leftMountainFgMaterial);

// Set position for each mesh
bgMesh.position.set(0, 0, -40);
santaMesh.position.set(-5.4, 61, -30);
leftMountainBgMesh.position.set(-130, 0, -36);
rightMountainBgMesh.position.set(162, -20, -36);
mainMountainMesh.position.set(21, -18.6, -30);
rightMountainPreBgMesh.position.set(136, -50, -24);
middleMountainMesh.position.set(39, -72, -18);
rightMountainPreFgMesh.position.set(136, -49.5, -12);
rightRockFgMesh.position.set(127, -84.8, -6);
leftMountainFgMesh.position.set(-98, -53.9, -6);
// console.log(bgMesh);

// Add meshes to scene
snowScene.add(bgMesh, santaMesh, leftMountainBgMesh, rightMountainBgMesh, mainMountainMesh, rightMountainPreBgMesh, middleMountainMesh, rightMountainPreFgMesh, rightRockFgMesh, leftMountainFgMesh);
// *********************************************************

// *********************************************************
// Santa page functions (integrating Rob's code)

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

  // Reveal the 'started' button with an animation
  gsap.to(started, {
      delay: 4,
      opacity: 1,
      duration: 1
  });

  // Add an event listener to the 'startBtn' element
  startBtn.addEventListener('click', () => {
      switchCamera('santaCamera');
      gsap.to(footer, {opacity: 1, duration: 1});
      continueAnimation();
      // console.log('startBtn clicked');
      controls.enabled = true;
      // console.log(controls.enabled);

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
              new THREE.MeshBasicMaterial({
                  map: texture,
                  side: THREE.DoubleSide
              })
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
      const spriteMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide
      });
      const spriteGeometry = new THREE.PlaneGeometry(10, 10);
      const spriteMesh = new THREE.Mesh(spriteGeometry, spriteMaterial);

      // Scale the sprite to match the canvas size
      spriteMesh.rotateX(180);

      return spriteMesh;
  }

  // Setting a timeout to ensure that certain actions only happen after the rest of the script has loaded
  setTimeout(() => {}, 50);
}

function onProgress(itemUrl, itemsLoaded, itemsTotal) {
  // Update progress for loading resources
  const progressRatio = itemsLoaded / itemsTotal;
  counterLoading.innerHTML = `${(progressRatio * 100).toFixed(0)}%`;
}

function loadModels() {
  // Load Santa Model
  gltfLoader.load(
      "models/santa.glb",
      (gltf) => {
          gltf.scene.scale.set(5, 5, 5);
          // gltf.santaScene.position.y = initialPositionMeshY 0;
          gltf.scene.position.z = 0;
          gltf.scene.position.y = -5;
          gltf.scene.position.x = 0;
          gltf.scene.rotation.x = 0;
          // gltf.santaScene.rotation.y = initialRotationMeshY 0

          santaScene.add(gltf.scene);
          models.push(gltf.scene);

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
          gltf.scene.scale.set(0.05, 0.05, 0.05);
          gltf.scene.position.y = -7.8;
          // gltf.santaScene.position.y = initialPositionMeshY 0;
          gltf.scene.position.x = 0;
          gltf.scene.position.z = -1.8;
          gltf.scene.rotation.y = -1.6;
          
          // gltf.santaScene.rotation.y = initialRotationMeshY 0;

          santaScene.add(gltf.scene);
          models.push(gltf.scene);
      },
      undefined,
      (error) => {
          console.error('An error occurred while loading the Sleigh model:', error);
      }
  );
}

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
// *********************************************************

// Axis helper
// const axesHelper = new THREE.AxesHelper(300);
// snowScene.add(axesHelper);

// Function switches between cameras when "Enter Museum" button is clicked
function switchCamera(cameraToSelect) {
  if (cameraToSelect === 'santaCamera') {
    controls.object = santaCamera;
    santaScene.add(particles);
    renderer.camera = santaCamera;
    renderer.scene = santaScene;

    // Clearing current html elements
    const navBar = document.querySelector('.nav-bar');
    const titleImage = document.querySelector('.title-image');
    const vignetteDiv = document.querySelector('.vignette');
  
    navBar.style.display = 'none';
    titleImage.style.display = 'none';
    vignetteDiv.style.display = 'none';
  } else {
    controls.object = mainCamera;
    renderer.camera = mainCamera;
    renderer.scene = snowScene;
  }
}

// Creating and calling animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update snow particles
  updateSnowParticles();

  // Render scene and camera based on current user interaction
  renderer.render(renderer.scene, renderer.camera);
  
  controls.update();
}
animate();
// parallaxLoop();

// Resize
window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update main camera
  mainCamera.aspect = sizes.width / sizes.height;
  mainCamera.updateProjectionMatrix();
  
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
});

// Removing disply: none attribute on title image and nav bar
document.addEventListener("DOMContentLoaded", () => {
  const navBar = document.querySelector('.nav-bar');
  const titleImage = document.querySelector('.title-image');

  navBar.style.display = 'flex';
  titleImage.style.display = 'block';
});

// Timeline magic *****************************************************

// Add opacity animations for all meshes using fromTo with staggered delays
tl.fromTo(santaMesh.position, { y: 180 }, { y: 61, delay: 1 });
tl.fromTo(rightMountainPreBgMesh.position, { x: 236 }, { x: 136, delay: -.5 });
tl.fromTo(rightRockFgMesh.position, { y: -200 }, { y: -84.8, delay: -.9 });
tl.fromTo(leftMountainFgMesh.position, { x: -290 }, { x: -98, delay: -.8 });
tl.fromTo(middleMountainMesh.position, { y: -200 }, { y: -72, delay: -.5 });
tl.fromTo(rightMountainPreFgMesh.position, { y: -180 }, { y: -49.5, delay: -.7 });

// Title, nav bar, and footer animation
tl.fromTo('.nav-bar', {y: "-100%"}, {y: "0%"});
tl.fromTo('.title-image', {opacity: 0}, {opacity: 1, delay: -.6});

// onComplete callback allows parallax to only work after timeline is finished
tl.eventCallback("onComplete", () => {
  // Parallax logic
  let xValue = 0;
  let yValue = 0;

  // Storying the current positions to be updated in the event lister, and the original positions array copy to compare parallax position vs original position
  let meshPositionArray = [bgMesh, santaMesh, leftMountainBgMesh, rightMountainBgMesh, mainMountainMesh, rightMountainPreBgMesh, middleMountainMesh, rightMountainPreFgMesh, rightRockFgMesh, leftMountainFgMesh];
  meshPositionArray.reverse();
  const originalPositions = meshPositionArray.map(mesh => mesh.position.clone());

  window.addEventListener("mousemove", (e) => {
    xValue = (e.clientX - sizes.width / 2) / 100;
    yValue = (e.clientY - sizes.height / 2) / 100;

    meshPositionArray.forEach((meshElement, index) => {
      let parallaxFactor = index * 0.2;
      if(index === 0) {
        parallaxFactor = .2
      }

      // Calculate the new position based on the parallax effect
      let newX = originalPositions[index].x + xValue * parallaxFactor;
      let newY = originalPositions[index].y - yValue * parallaxFactor;

      // Calculate maximum allowed positions
      const maxX = sizes.width / 2 - meshElement.geometry.parameters.width / 2;
      const maxY = sizes.height / 2 - meshElement.geometry.parameters.height / 2;

      // Clamp the new positions to limit movement
      newX = Math.max(-maxX, Math.min(maxX, newX));
      newY = Math.max(-maxY, Math.min(maxY, newY));

      // Update the mesh position
      meshElement.position.set(newX, newY, meshElement.position.z);
    });
  });
});
// ********************************************************************