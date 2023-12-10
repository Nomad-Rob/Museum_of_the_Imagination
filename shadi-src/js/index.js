import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap';

// Scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color('#ffffff');

// Create our sphere
const geometry = new THREE.SphereGeometry(3, 64, 64);
const material = new THREE.MeshStandardMaterial({ 
  color: '#00ff83',
  roughness: .6
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

// Sphere Lights
const sphereLight = new THREE.PointLight(0xffffff, .8, 100);
sphereLight.position.set(0, 10, 10);
sphereLight.intensity = 1.3
scene.add(sphereLight);


// Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 20;
scene.add(camera);

// Renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(2);
renderer.render(scene, camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.autoRotate = true;

// *********************************************************
// Snowflakes
let particles;
let positions = [], velocities = []; // snowflake positions(x, y, z) and velocities(x, y, z)

const numSnowflakes = 33000;

const maxRange = 1000, minRange = maxRange/2; // snowflakes placed from -500 to 500 x & z axes
const minHeight = 3; // snowflakes placed from 150 to 500 on y axis

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
    size: 4,
    map: new THREE.TextureLoader().load("/images/snowflake.png"),
    blending: THREE.AdditiveBlending, // makes snowflake vibrant white
    depthTest: false, // do not determine if object is in front of another for performance
    transparent: true, // enable opacity changes
    opacity: 1,
  });

  particles = new THREE.Points(snowGeometry, flakeMaterial);
  scene.add(particles);
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
    if (snowGeometry.attributes.position.array[i+1] < 0) {
      snowGeometry.attributes.position.array[i] = Math.floor(Math.random() * maxRange - minRange); // x
      snowGeometry.attributes.position.array[i+1] = Math.floor(Math.random() * minRange + minHeight); // y
      snowGeometry.attributes.position.array[i+2] = Math.floor(Math.random() * maxRange - minRange); // z
    }
  }
  // since attribute changes, needs to be present for gpu to update position of array of particles
  snowGeometry.attributes.position.needsUpdate = true;
}

// Function animates paritcles
function animate() {
  requestAnimationFrame(animate);

  updateSnowParticles(); //updates position of snowflakes

  renderer.render(scene, camera);
}
 
addSnowflakes();
// console.log(snowGeometry);
animate();
// *********************************************************

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

// Re-render sphere for resizing
const loop = () => {
  controls.update();
  renderer.render(scene,camera);
  window.requestAnimationFrame(loop);
}
loop();

// Timeline magic
const tl = gsap.timeline({defaults: {duration: 1}});
tl.fromTo(mesh.scale, {z:0, x:0, y:0}, {z:1, x:1, y:1});
tl.fromTo('nav', {y: "-100%"}, {y: "0%"});
tl.fromTo('.title', {opacity: 0}, {opacity: 1});

// Mouse animation color
let mouseDown = false;
let rgb = []
window.addEventListener('mousedown', () => (mouseDown = true));
window.addEventListener('mouseup', () => (mouseDown = false));
window.addEventListener('mousemove', (e) => {
  if(mouseDown) {
    rgb = [
      Math.round((e.pageX / sizes.width) * 255),
      Math.round((e.pageY / sizes.height) * 255),
      150
    ]
    // Animate color
    let newColor = new THREE.Color(`rgb(${rgb.join(",")})`);
    gsap.to(mesh.material.color, {r: newColor.r, g: newColor.g, b: newColor.b});
  }
});