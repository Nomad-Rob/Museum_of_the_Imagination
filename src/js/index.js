// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap';
// import * as dat from 'dat.gui';
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

// dat.Gui instantiation
// const gui = new dat.GUI();

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
santaScene.background = new THREE.Color('#B6B6B6');

// Main Snow Scene
const snowScene = new THREE.Scene();

// Renderer
const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(3);

// Controls, set initally to false when page is loaded
// const controls = new OrbitControls(mainCamera, canvas);
// setupControls();
// controls.enabled = false;

// Mouse move tracking
let mouse = new THREE.Vector2();
window.addEventListener('mousemove', onMouseMove);

// Audio setup
const music = new Audio('sounds/silent-night.mp3');
music.volume = 0.05;

// Loaders setup
const loadingManager = new THREE.LoadingManager(onLoadComplete, onProgress);
const textureLoader = new THREE.TextureLoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);

// Array to store loaded models
let models = [];

// Load models (Santa and Sleigh)
const modelsGroup = new THREE.Group();
loadModels();

// Santa Camera setup
const santaCamera = setupSantaCamera();
santaScene.add(santaCamera);

// Background camera setup (Orthographic)
const backgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 0);

// Choose correct camera to display
switchCamera('mainCamera');

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
function addSnowflakes (snowflakeOpacity) {
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
    opacity: snowflakeOpacity,
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
 
addSnowflakes(.7);
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
// Global scope variables for santa page:
let cylinder;
let imageGroup;
let imageGroupYPosition = 0;

// Create cylinder first to make sure the object is available globally
function createCylinder() {
  const radius = 10;
  const height = 180;
  const radialSegments = 32; // Number of segments around the cylinder

  const geometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments);
  const material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide, transparent: true, opacity: 0.0 });
  cylinder = new THREE.Mesh(geometry, material);
  cylinder.position.set(0, 160, 0); // Set the position of the cylinder's bottom
  cylinder.rotation.y = -95; // Rotate on y axis to have first image lined properly
  window.addEventListener('wheel', () => {
    console.log(cylinder.rotation.y);
  })
  santaScene.add(cylinder);
}
createCylinder();

function onMouseMove(event) {
  // Update mouse position
  mouse.x = event.clientX / sizes.width * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
}

function onProgress(itemUrl, itemsLoaded, itemsTotal) {
  // Update progress for loading resources
  const progressRatio = itemsLoaded / itemsTotal;
  counterLoading.innerHTML = `${(progressRatio * 100).toFixed(0)}%`;
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
      top: '13%',
      delay: 1.6,
      duration: 2,
      onComplete: () => {
        counterLoading.style.display = 'none';
    }
  });

  // Add an event listener to the 'startBtn' element
  startBtn.addEventListener('click', () => {
    switchCamera('santaCamera');
    gsap.to(footer, {
      opacity: 1,
      duration: 1
    });
    continueAnimation();
    // console.log('startBtn clicked');
    // controls.enabled = true;
    // console.log(controls.enabled);

    fetch('/images.json')
      .then(response => response.json())
      .then(data => {
        displayImagesAndText(data);
      })
  });
  
  function displayImagesAndText(data) {
    const numberOfImages = data.length;
    const circumference = 2 * Math.PI * cylinder.geometry.parameters.radiusTop;
    const spacing = circumference / numberOfImages; // Space between each image group

    data.reverse().forEach((item, index) => {
      // Load texture, create image plane and text sprite
      const texture = textureLoader.load(item.imageUrl);
      const imagePlane = new THREE.Mesh(
        new THREE.PlaneGeometry(11, 10),
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

      
      // Create text sprite
      const textSprite = createTextSprite(item.text, item.year);
      textSprite.position.set(imagePlane.position.x, imagePlane.position.y - 6.6, imagePlane.position.z);
      textSprite.lookAt(0, spiralHeight - 6.6, 0);
      textSprite.rotation.y += Math.PI;

      // Create a group for the image and text and add to the cylinder
      imageGroup = new THREE.Group();
      imageGroup.add(imagePlane);
      imageGroup.add(textSprite);
      cylinder.add(imageGroup);
    });
  }

  // SCROLLING EVENTS = Not fun!!!!!
  window.addEventListener('wheel', (event) => {
    // const minRotationY = -96.39;
    // const maxRotationY = -89.12;

    // console.log('wheel event');
    const deltaY = event.deltaY;

    // Rotate the images and text around Santa
    const rotationAmount = 0.00272; // Adjust this value to control the rotation speed
    const rotationDirection = deltaY < 0 ? -1 : 1; // Determine rotation direction
    const rotationAngle = rotationAmount * -rotationDirection;

    // Rotate models as a group
    modelsGroup.rotation.y += rotationAngle * 19; // Rotate the models
    // console.log('models y:', modelsGroup.rotation.y);

    imageGroup.rotation.y += rotationAngle * 10; // Rotate the image group
    // console.log('images y:', imageGroup.rotation.y);

    // Move the image group up or down
    const verticalMovementSpeed = 1.63; // Adjust this value to control the speed of vertical movement
    imageGroupYPosition += rotationDirection * verticalMovementSpeed;
    imageGroup.position.y = imageGroupYPosition;
    
    // Move the cylinder up or down on the y-axis
    cylinder.position.y += rotationDirection * verticalMovementSpeed;
    // rotate the cylinder
    cylinder.rotation.y += rotationAngle * 16;
  });

  function createTextSprite(text, year) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 560;
    canvas.height = 130;
  
    context.fillStyle = 'rgba(0, 0, 0, .4)'; // Transparent fill
    context.fillRect(0, 0, canvas.width, canvas.height);
  
    context.font = 'bold 23px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
  
    const words = text.split(' ');
    const maxLines = 2;
    const lines = [];
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
    lines.push(currentLine);
  
    const lineHeight = 30;
    const startY = (canvas.height - (lines.length * lineHeight)) / 2;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const y = startY + (i * lineHeight);
      context.fillText(line, canvas.width / 2, y);
    }
  
    context.font = 'bold 30px Arial';
    const yearLineHeight = 23;
    const yearY = startY + (lines.length * lineHeight) + yearLineHeight;
    context.fillText(year, canvas.width / 2, yearY);
  
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide
    });
    const spriteGeometry = new THREE.PlaneGeometry(11, 2.9);
    const spriteMesh = new THREE.Mesh(spriteGeometry, spriteMaterial);
  
    return spriteMesh;
  }

  // Setting a timeout to ensure that certain actions only happen after the rest of the script has loaded
  setTimeout(() => {}, 50);
}

function loadModels() {
  // Load Santa Model
  gltfLoader.load(
      "models/santa.glb",
      (gltf) => {
        gltf.scene.scale.set(15, 15, 15);
        // gltf.santaScene.position.y = initialPositionMeshY 0;
        gltf.scene.position.z = 0;
        gltf.scene.position.y = -8.3;
        gltf.scene.position.x = 0;
        gltf.scene.rotation.x = 0;

        // santaScene.add(gltf.scene);
        models.push(gltf.scene);

        santaScene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.envMapIntensity = debugObject.envMapIntensity;
                child.material.needsUpdate = true;
            }
        });
        
        modelsGroup.add(gltf.scene);
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
          gltf.scene.position.y = -24;
          gltf.scene.position.x = 0;
          gltf.scene.position.z = 3.9;
          gltf.scene.rotation.y = -1.586;
          gltf.scene.rotation.x = 0.039;

          models.push(gltf.scene);

          modelsGroup.add(gltf.scene);
      },
      undefined,
      (error) => {
          console.error('An error occurred while loading the Sleigh model:', error);
      }
  );

  // Load Mountains
  gltfLoader.load(
    "models/mountain.glb",
    (gltf) => {
        gltf.scene.scale.set(2300, 2300, 2300);
        gltf.scene.position.y = 110.9;
        gltf.scene.position.x = -193;
        gltf.scene.position.z = 90;
        
        // Set name for forest model to add point light to it
        gltf.scene.name = "Mountain";

        models.push(gltf.scene);

        modelsGroup.add(gltf.scene);

        // Add lighting to forest model
        setupMountainLighting();
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the Mountains:', error);
    }
  );

  // Load Green/Red Candy Model
  gltfLoader.load(
    "models/candy_cane_1.glb",
    (gltf) => {
        gltf.scene.scale.set(90, 90, 90);
        gltf.scene.position.y = 3;
        gltf.scene.position.x = 88;
        gltf.scene.position.z = -81;
        gltf.scene.rotation.y = -2.9;
        gltf.scene.rotation.z = -.3;

        models.push(gltf.scene);

        modelsGroup.add(gltf.scene);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the Red/Green Candy model:', error);
    }
  );

  // Load Green/Red 2 Candy Model
  gltfLoader.load(
    "models/candy_cane_1.glb",
    (gltf) => {
        gltf.scene.scale.set(90, 90, 90);
        gltf.scene.position.x = -84;
        gltf.scene.position.y = 3;
        gltf.scene.position.z = 96;
        gltf.scene.rotation.y = 2.4;
        gltf.scene.rotation.z = -.3;

        models.push(gltf.scene);

        modelsGroup.add(gltf.scene);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the Red/Green 2 Candy model:', error);
    }
  );

  // Load Green/Red 2 Candy Model
  gltfLoader.load(
    "models/candy.glb",
    (gltf) => {
        gltf.scene.scale.set(.3, .3, .3);
        gltf.scene.position.x = -45;
        gltf.scene.position.y = -20.7;
        gltf.scene.position.z = 189;
        gltf.scene.rotation.y = -.8;
        gltf.scene.rotation.z = -.1;

        models.push(gltf.scene);

        modelsGroup.add(gltf.scene);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the Red Candy model:', error);
    }
  );

  // Load Green/Red 2 Candy Model
  gltfLoader.load(
    "models/candy.glb",
    (gltf) => {
        gltf.scene.scale.set(.3, .3, .3);
        gltf.scene.position.x = 107;
        gltf.scene.position.y = -3.2;
        gltf.scene.position.z = -21;
        gltf.scene.rotation.y = 0;
        gltf.scene.rotation.z = -.1;

        models.push(gltf.scene);

        modelsGroup.add(gltf.scene);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the Red Candy 2 model:', error);
    }
  );

  // Load Christmas Tree Model
  gltfLoader.load(
    "models/christmas_tree.glb",
    (gltf) => {
        gltf.scene.scale.set(.06, .06, .06);
        gltf.scene.position.y = 40;
        gltf.scene.position.x = -78;
        gltf.scene.position.z = -160;

        models.push(gltf.scene);

        modelsGroup.add(gltf.scene);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the Christmas Tree model:', error);
    }
  );

  // Load Christmas Tree Model
  gltfLoader.load(
    "models/christmas_tree_2.glb",
    (gltf) => {
        gltf.scene.scale.set(23, 26, 23);
        gltf.scene.position.y = -24;
        gltf.scene.position.x = 98;
        gltf.scene.position.z = 149;

        models.push(gltf.scene);

        modelsGroup.add(gltf.scene);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the Christmas Tree 2 model:', error);
    }
  );

  // Load Gift Model
  gltfLoader.load(
    "models/gifts_1.glb",
    (gltf) => {
        gltf.scene.scale.set(3, 3, 3);
        gltf.scene.position.x = -84;
        gltf.scene.position.y = -16;
        gltf.scene.position.z = -58;
        gltf.scene.rotation.y = -0.067;

        models.push(gltf.scene);

        modelsGroup.add(gltf.scene);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the Gift 1 model:', error);
    }
  );

  // Load Gift Model
  gltfLoader.load(
    "models/gifts_1.glb",
    (gltf) => {
        gltf.scene.scale.set(3, 3, 3);
        gltf.scene.position.x = -42;
        gltf.scene.position.y = -19;
        gltf.scene.position.z = -71;
        gltf.scene.rotation.y = .36;

        models.push(gltf.scene);

        modelsGroup.add(gltf.scene);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the Gift 2 model:', error);
    }
  );

  // Load Gift Model
  gltfLoader.load(
    "models/gifts_1.glb",
    (gltf) => {
        gltf.scene.scale.set(3, 3, 3);
        gltf.scene.position.x = 82;
        gltf.scene.position.y = -26;
        gltf.scene.position.z = 126;
        gltf.scene.rotation.y = -2.8;

        models.push(gltf.scene);

        modelsGroup.add(gltf.scene);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the Gift 3 model:', error);
    }
  );

  // Load Deer Model
  gltfLoader.load(
    "models/christmas_light_deer.glb",
    (gltf) => {
        gltf.scene.scale.set(11, 11, 11);
        gltf.scene.position.x = 201;
        gltf.scene.position.y = -24;
        gltf.scene.position.z = 67;
        gltf.scene.rotation.y = 1.5;

        models.push(gltf.scene);

        modelsGroup.add(gltf.scene);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the Deer model:', error);
    }
  );

  // Load Snowman Model
  gltfLoader.load(
    "models/snowman.glb",
    (gltf) => {
        gltf.scene.scale.set(39, 39, 39);
        gltf.scene.position.x = 231;
        gltf.scene.position.y = -32;
        gltf.scene.position.z = 142;
        gltf.scene.rotation.y = 2.53;

        models.push(gltf.scene);

        modelsGroup.add(gltf.scene);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the Snowman model:', error);
    }
  );

  // Rotate models group
  modelsGroup.rotation.y = -6;

  // Add all three models as a group to santa scene
  santaScene.add(modelsGroup);
}

function setupSantaCamera() {
  // Set up and return the main camera
  const santaCamera = new THREE.PerspectiveCamera(69, sizes.width / sizes.height, 0.1, 3000);
  santaCamera.name = 'Santa Camera';
  santaCamera.position.x = 1300;
  santaCamera.position.y = 660;
  santaCamera.position.z = 330;
  santaCamera.lookAt(0, 0, 0);
  return santaCamera;
}

// function setupControls() {
//   // Set up orbit controls
//   controls.enabled = true;
//   controls.enableRotate = false;
//   controls.enablePan = false;
//   controls.enableZoom = false;
// }

function setupMountainLighting () {
  // Point For mountain background
  const forestPointLight = new THREE.PointLight(0x404040, 1.3);
  const forestAmbientLight = new THREE.AmbientLight(0x404040, 1.9);
  forestPointLight.position.set(0, 900, 360);
  const forestModel = models.find(model => model.name === "Mountain");
  // console.log(forestModel);
  forestModel.add(forestPointLight, forestAmbientLight);
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
      x: 0,
      y: 0,
      z: 60,
      duration: 3
  });

  // Animate cylinder
  gsap.to(cylinder.position, {
    x: 0,
    y: -219.9,
    z: 0,
    duration: 3
  });
  gsap.to(cylinder.rotation, {
    x: 0,
    y: -89.889,
    z: 0,
    duration: 3
  });

  // Animate models group
  gsap.to(modelsGroup.rotation, {
    x: 0,
    y: 0,
    z: 0,
    duration: 3
  })
  
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

  // Add snow to santa scene
  santaScene.add(particles);
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
const axesHelper = new THREE.AxesHelper(300);
santaScene.add(axesHelper);

// Function switches between cameras when "Enter Museum" button is clicked
function switchCamera(cameraToSelect) {
  if (cameraToSelect === 'santaCamera') {
    // controls.object = santaCamera;
    renderer.camera = santaCamera;
    renderer.scene = santaScene;

    // Clearing current html elements
    const titleImage = document.querySelector('.title-image');
    const vignetteDiv = document.querySelector('.vignette');
  
    titleImage.style.display = 'none';
    vignetteDiv.style.display = 'none';
  } else {
    // controls.object = mainCamera;
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
  
  // Ensure santacamera is looking at x y z of 0 0 0
  if (renderer.camera == santaCamera) {
    // console.log('yup santa cam');
    santaCamera.lookAt(0, 0, 0);
  }

  // Update the control each iteration of loop
  // controls.update();
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
  started.style.display = 'flex';
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
tl.fromTo('.nav-bar', {opacity: 0}, {opacity: 1});
tl.fromTo('.title-image', {opacity: 0}, {opacity: 1, delay: -.9});

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
