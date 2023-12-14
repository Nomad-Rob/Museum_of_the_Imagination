import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap';
import * as dat from 'dat.gui';

// Scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color('#ffffff');

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

// Sphere Lights
// const sphereLight = new THREE.PointLight(0xffffff, .8, 100);
// sphereLight.position.set(0, 100, 10);
// sphereLight.intensity = 300
// scene.add(sphereLight);

// dat.Gui instantiation
const gui = new dat.GUI();

// Camera
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 600);
camera.position.z = 160;
// camera.lookAt(0, 83, 0);
scene.add(camera);

// Import canvas
const canvas = document.querySelector(".webgl");

// Renderer
const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(3);

// Controls, set initally to false when page is loaded
const controls = new OrbitControls(camera, canvas);
controls.enabled = false;


// *********************************************************
// Snowflakes
const snowScene = new THREE.Scene();
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
const bgGeometry = new THREE.PlaneGeometry(476, 288);
const santaGeometry = new THREE.PlaneGeometry(476, 113);
const leftMountainBgGeometry = new THREE.PlaneGeometry(205, 93);
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
leftMountainBgMesh.position.set(-133, -14.2, -36);
rightMountainBgMesh.position.set(162, -20, -36);
mainMountainMesh.position.set(21, -18.6, -30);
rightMountainPreBgMesh.position.set(136, -50, -24);
middleMountainMesh.position.set(39, -72, -18);
rightMountainPreFgMesh.position.set(136, -49.5, -12);
rightRockFgMesh.position.set(127, -84.8, -6);
leftMountainFgMesh.position.set(-98, -53.9, -6);
console.log(bgMesh);

// Add meshes to scene
snowScene.add(bgMesh, santaMesh, leftMountainBgMesh, rightMountainBgMesh, mainMountainMesh, rightMountainPreBgMesh, middleMountainMesh, rightMountainPreFgMesh, rightRockFgMesh, leftMountainFgMesh);
// *********************************************************

// Axis helper
const axesHelper = new THREE.AxesHelper(300);
snowScene.add(axesHelper);

// Calling loops 
function animate() {
  requestAnimationFrame(animate);

  // Update snow particles
  updateSnowParticles();

  // Render snow scene
  renderer.render(snowScene, camera);
  
  controls.update();
}
animate();
// parallaxLoop();

// Resize
window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
})

// Timeline magic
const tl = gsap.timeline({defaults: {duration: 2}});
tl.fromTo('nav', {y: "-100%"}, {y: "0%"});
tl.fromTo('.title-image', {opacity: 0}, {opacity: 1});