// *********************************************************
// Snowflakes
const snowScene = new THREE.Scene();
let particles;
let positions = [], velocities = []; // snowflake positions(x, y, z) and velocities(x, y, z) 

const numSnowflakes = 160000;

const maxRange = 1000, minRange = maxRange/2; // snowflakes placed from -500 to 500 x & z axes
const minHeight = 90; // snowflakes placed from 150 to 500 on y axis

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

  renderer.render(snowScene, camera);
}
 
addSnowflakes();
// console.log(snowGeometry);
animate();
// *********************************************************














// *********************************************************
// Parallax
const parallaxCamera = new THREE.OrthographicCamera(
    window.innerWidth / -2, window.innerWidth / 2,
    window.innerHeight / 2, window.innerHeight / -2,
    0.1, 1000
  );
  const parallaxScene = new THREE.Scene();
  const imageLoader = new THREE.ImageLoader();
  
  // Load all assets and create basic materials for them
  const bgMaterial = new THREE.MeshBasicMaterial({ map: imageLoader.load('images/parallax-assets/background.png') });
  // const leftMountainBgMaterial = new THREE.MeshBasicMaterial({ map: imageLoader.load('images/parallax-assets/left-mountain-background.png') });
  // const leftMountainFgMaterial = new THREE.MeshBasicMaterial({ map: imageLoader.load('images/parallax-assets/left-mountain-foreground.png') });
  // const mainMountainMaterial = new THREE.MeshBasicMaterial({ map: imageLoader.load('images/parallax-assets/main-mountain.png') });
  // const middleMountainMaterial = new THREE.MeshBasicMaterial({ map: imageLoader.load('images/parallax-assets/middle-mountain.png') });
  // const rightMountainBgMaterial = new THREE.MeshBasicMaterial({ map: imageLoader.load('images/parallax-assets/right-mountain-background.png') });
  // const rightMountainPreBgMaterial = new THREE.MeshBasicMaterial({ map: imageLoader.load('images/parallax-assets/right-mountain-pre-background.png') });
  // const rightMountainPreFgMaterial = new THREE.MeshBasicMaterial({ map: imageLoader.load('images/parallax-assets/right-mountain-pre-forground.png') });
  // const rightRockFgMaterial = new THREE.MeshBasicMaterial({ map: imageLoader.load('images/parallax-assets/right-rock-foreground.png') });
  // const santaMaterial = new THREE.MeshBasicMaterial({ map: imageLoader.load('images/parallax-assets/santa.png') });
  
  // Background geometry
  const bgGeometry = new THREE.PlaneGeometry(20,20);
  
  // Create meshes from image materials
  const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
  
  // Set position for each mesh
  bgMesh.position.set(0, 0, 0);
  
  // Add meshes to scene
  parallaxScene.add(bgMesh);
  // *********************************************************



// **********************************************
// GUI controls object
const parallaxControls = {
    bgMesh: {
      size: 476,
      aspectRatio: 1920 / 1080,
      positionX: 0,
      positionY: 0,
      positionZ: -40,
    },
    santaMesh: {
      size: 476,
      aspectRatio: 1920 / 455,
      positionX: -5.4,
      positionY: 61,
      positionZ: -30,
    },
    leftMountainBgMesh: {
      size: 205,
      aspectRatio: 941 / 429,
      positionX: -133,
      positionY: -14.2,
      positionZ: -36,
    },
    rightMountainBgMesh: {
      size: 194,
      aspectRatio: 939 / 429,
      positionX: 162,
      positionY: -20,
      positionZ: -36,
    },
    mainMountainMesh: {
      size: 411,
      aspectRatio: 1710 / 951,
      positionX: 21,
      positionY: -18.6,
      positionZ: -30,
    },
    rightMountainPreBgMesh: {
      size: 184,
      aspectRatio: 782 / 628,
      positionX: 136,
      positionY: -50,
      positionZ: -24,
    },
    middleMountainMesh: {
      size: 146,
      aspectRatio: 555 / 469,
      positionX: 48,
      positionY: -67.2,
      positionZ: -18,
    },
    rightMountainPreFgMesh: {
      size: 156,
      aspectRatio: 738 / 678,
      positionX: 136,
      positionY: -49.5,
      positionZ: -12,
    },
    rightRockFgMesh: {
      size: 135,
      aspectRatio: 670 / 174,
      positionX: 127,
      positionY: -84.8,
      positionZ: -6,
    },
    leftMountainFgMesh: {
      size: 211,
      aspectRatio: 1038 / 759,
      positionX: -98,
      positionY: -53.9,
      positionZ: -6,
    },
  
  };
  
  // Create GUI controls for background mesh
  gui.add(parallaxControls.bgMesh, 'size', 10, 500).onChange(updateMesh);
  gui.add(parallaxControls.bgMesh, 'positionX', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.bgMesh, 'positionY', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.bgMesh, 'positionZ', -50, 50).onChange(updateMesh);
  
  gui.add(parallaxControls.santaMesh, 'size', 10, 500).onChange(updateMesh);
  gui.add(parallaxControls.santaMesh, 'positionX', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.santaMesh, 'positionY', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.santaMesh, 'positionZ', -50, 50).onChange(updateMesh);
  
  gui.add(parallaxControls.leftMountainBgMesh, 'size', 10, 500).onChange(updateMesh);
  gui.add(parallaxControls.leftMountainBgMesh, 'positionX', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.leftMountainBgMesh, 'positionY', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.leftMountainBgMesh, 'positionZ', -50, 50).onChange(updateMesh);
  
  gui.add(parallaxControls.rightMountainBgMesh, 'size', 10, 500).onChange(updateMesh);
  gui.add(parallaxControls.rightMountainBgMesh, 'positionX', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.rightMountainBgMesh, 'positionY', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.rightMountainBgMesh, 'positionZ', -50, 50).onChange(updateMesh);
  
  gui.add(parallaxControls.mainMountainMesh, 'size', 10, 500).onChange(updateMesh);
  gui.add(parallaxControls.mainMountainMesh, 'positionX', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.mainMountainMesh, 'positionY', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.mainMountainMesh, 'positionZ', -50, 50).onChange(updateMesh);
  
  gui.add(parallaxControls.rightMountainPreBgMesh, 'size', 10, 500).onChange(updateMesh);
  gui.add(parallaxControls.rightMountainPreBgMesh, 'positionX', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.rightMountainPreBgMesh, 'positionY', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.rightMountainPreBgMesh, 'positionZ', -50, 50).onChange(updateMesh);
  
  gui.add(parallaxControls.middleMountainMesh, 'size', 10, 500).onChange(updateMesh);
  gui.add(parallaxControls.middleMountainMesh, 'positionX', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.middleMountainMesh, 'positionY', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.middleMountainMesh, 'positionZ', -50, 50).onChange(updateMesh);
  
  gui.add(parallaxControls.rightMountainPreFgMesh, 'size', 10, 500).onChange(updateMesh);
  gui.add(parallaxControls.rightMountainPreFgMesh, 'positionX', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.rightMountainPreFgMesh, 'positionY', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.rightMountainPreFgMesh, 'positionZ', -50, 50).onChange(updateMesh);
  
  gui.add(parallaxControls.rightRockFgMesh, 'size', 10, 500).onChange(updateMesh);
  gui.add(parallaxControls.rightRockFgMesh, 'positionX', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.rightRockFgMesh, 'positionY', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.rightRockFgMesh, 'positionZ', -50, 50).onChange(updateMesh);
  
  gui.add(parallaxControls.leftMountainFgMesh, 'size', 10, 500).onChange(updateMesh);
  gui.add(parallaxControls.leftMountainFgMesh, 'positionX', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.leftMountainFgMesh, 'positionY', -200, 200).onChange(updateMesh);
  gui.add(parallaxControls.leftMountainFgMesh, 'positionZ', -50, 50).onChange(updateMesh);
  // Function to update mesh properties
  function updateMesh() {
    // ***********************************************************************************
    const newSize0 = parallaxControls.bgMesh.size;
    const newAspectRatio0 = parallaxControls.bgMesh.aspectRatio;
  
    // Calculate width and height based on the aspect ratio
    const newWidth0 = newSize0;
    const newHeight0 = newSize0 / newAspectRatio0;
  
    bgMesh.geometry = new THREE.PlaneGeometry(newWidth0, newHeight0);
    bgMesh.position.set(parallaxControls.bgMesh.positionX, parallaxControls.bgMesh.positionY, parallaxControls.bgMesh.positionZ);
    
    // ***********************************************************************************
    const newSize1 = parallaxControls.santaMesh.size;
    const newAspectRatio1 = parallaxControls.santaMesh.aspectRatio;
  
    // Calculate width and height based on the aspect ratio
    const newWidth1 = newSize1;
    const newHeight1 = newSize1 / newAspectRatio1;
  
    santaMesh.geometry = new THREE.PlaneGeometry(newWidth1, newHeight1);
    santaMesh.position.set(parallaxControls.santaMesh.positionX, parallaxControls.santaMesh.positionY, parallaxControls.santaMesh.positionZ);
  
    // ***********************************************************************************
    const newSize2 = parallaxControls.leftMountainBgMesh.size;
    const newAspectRatio2 = parallaxControls.leftMountainBgMesh.aspectRatio;
  
    // Calculate width and height based on the aspect ratio
    const newWidth2 = newSize2;
    const newHeight2 = newSize2 / newAspectRatio2;
  
    leftMountainBgMesh.geometry = new THREE.PlaneGeometry(newWidth2, newHeight2);
    leftMountainBgMesh.position.set(parallaxControls.leftMountainBgMesh.positionX, parallaxControls.leftMountainBgMesh.positionY, parallaxControls.leftMountainBgMesh.positionZ);
  
    // ***********************************************************************************
    const newSize3 = parallaxControls.rightMountainBgMesh.size;
    const newAspectRatio3 = parallaxControls.rightMountainBgMesh.aspectRatio;
  
    // Calculate width and height based on the aspect ratio
    const newWidth3 = newSize3;
    const newHeight3 = newSize3 / newAspectRatio3;
  
    rightMountainBgMesh.geometry = new THREE.PlaneGeometry(newWidth3, newHeight3);
    rightMountainBgMesh.position.set(parallaxControls.rightMountainBgMesh.positionX, parallaxControls.rightMountainBgMesh.positionY, parallaxControls.rightMountainBgMesh.positionZ);
  
    // ***********************************************************************************
    const newSize4 = parallaxControls.mainMountainMesh.size;
    const newAspectRatio4 = parallaxControls.mainMountainMesh.aspectRatio;
  
    // Calculate width and height based on the aspect ratio
    const newWidth4 = newSize4;
    const newHeight4 = newSize4 / newAspectRatio4;
  
    mainMountainMesh.geometry = new THREE.PlaneGeometry(newWidth4, newHeight4);
    mainMountainMesh.position.set(parallaxControls.mainMountainMesh.positionX, parallaxControls.mainMountainMesh.positionY, parallaxControls.mainMountainMesh.positionZ);
  
    // ***********************************************************************************
    const newSize5 = parallaxControls.rightMountainPreBgMesh.size;
    const newAspectRatio5 = parallaxControls.rightMountainPreBgMesh.aspectRatio;
  
    // Calculate width and height based on the aspect ratio
    const newWidth5 = newSize5;
    const newHeight5 = newSize5 / newAspectRatio5;
  
    rightMountainPreBgMesh.geometry = new THREE.PlaneGeometry(newWidth5, newHeight5);
    rightMountainPreBgMesh.position.set(parallaxControls.rightMountainPreBgMesh.positionX, parallaxControls.rightMountainPreBgMesh.positionY, parallaxControls.rightMountainPreBgMesh.positionZ);
  
    // ***********************************************************************************
    const newSize6 = parallaxControls.middleMountainMesh.size;
    const newAspectRatio6 = parallaxControls.middleMountainMesh.aspectRatio;
  
    // Calculate width and height based on the aspect ratio
    const newWidth6 = newSize6;
    const newHeight6 = newSize6 / newAspectRatio6;
  
    middleMountainMesh.geometry = new THREE.PlaneGeometry(newWidth6, newHeight6);
    middleMountainMesh.position.set(parallaxControls.middleMountainMesh.positionX, parallaxControls.middleMountainMesh.positionY, parallaxControls.middleMountainMesh.positionZ);
  
    // ***********************************************************************************
    const newSize7 = parallaxControls.rightMountainPreFgMesh.size;
    const newAspectRatio7 = parallaxControls.rightMountainPreFgMesh.aspectRatio;
  
    // Calculate width and height based on the aspect ratio
    const newWidth7 = newSize7;
    const newHeight7 = newSize7 / newAspectRatio7;
  
    rightMountainPreFgMesh.geometry = new THREE.PlaneGeometry(newWidth7, newHeight7);
    rightMountainPreFgMesh.position.set(parallaxControls.rightMountainPreFgMesh.positionX, parallaxControls.rightMountainPreFgMesh.positionY, parallaxControls.rightMountainPreFgMesh.positionZ);
  
    // ***********************************************************************************
    const newSize8 = parallaxControls.rightRockFgMesh.size;
    const newAspectRatio8 = parallaxControls.rightRockFgMesh.aspectRatio;
  
    // Calculate width and height based on the aspect ratio
    const newWidth8 = newSize8;
    const newHeight8 = newSize8 / newAspectRatio8;
  
    rightRockFgMesh.geometry = new THREE.PlaneGeometry(newWidth8, newHeight8);
    rightRockFgMesh.position.set(parallaxControls.rightRockFgMesh.positionX, parallaxControls.rightRockFgMesh.positionY, parallaxControls.rightRockFgMesh.positionZ);
  
    // ***********************************************************************************
    const newSize9 = parallaxControls.leftMountainFgMesh.size;
    const newAspectRatio9 = parallaxControls.leftMountainFgMesh.aspectRatio;
  
    // Calculate width and height based on the aspect ratio
    const newWidth9 = newSize9;
    const newHeight9 = newSize9 / newAspectRatio9;
  
    leftMountainFgMesh.geometry = new THREE.PlaneGeometry(newWidth9, newHeight9);
    leftMountainFgMesh.position.set(parallaxControls.leftMountainFgMesh.positionX, parallaxControls.leftMountainFgMesh.positionY, parallaxControls.leftMountainFgMesh.positionZ);
  }