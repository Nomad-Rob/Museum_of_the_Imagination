import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {Text} from 'troika-three-text'
import {gsap, Power1} from 'gsap'


// Debug
const debugObject = {}

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("#ffff");

// background scene
const backgroundScene = new THREE.Scene()

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

// Event Listener

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    })
    
// Raycaster
const raycaster = new THREE.Raycaster()
let currentIntersect = null

// Mouse move
let mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
})

// Audio
const music = new Audio("/sounds/christmas.mp3")
music.volume = 0.3
``
// Loaders
const loadingManager = new THREE.LoadingManager(
  () => {
    window.setTimeout(() => {
      // Animation to HTML elements
      // Header
      gsap.to(header, 0.5, {
        top: 10,
        left: 10,
        transform: "translate(0, 0)",
        ease: Power1.easeIn,
      })
      // H1
      gsap.to(h1, 0.5, {
        fontSize: 25,
        top: 10,
        left: 10,
        transform: "translate(0, 0)",
        width: 150,
        ease: Power1.easeIn,
      })
      // Footer
      gsap.to(footer, 0.5, {
        delay: 0.5,
        opacity: 1,
        ease: Power1.easeIn,
      })
      // Loading Percentage Counter
      gsap.to(loadingLoading, 0.5, {
        delay: 0.5,
        opacity: 0,
        ease: Power1.easeIn,
      })
      // Starter
      gsap.to(starter, 0.5, {
        delay: 0.9,
        opacity: 1,
      })
      // Adding an event listener to the 'startedBtn' element.
      // When the button is clicked, it triggers the 'continueAnimation' function.
      startedBtn.addEventListener('click', () => continueAnimation())
    // The above line is wrapped inside a setTimeout with a 50ms delay.
    // This is typically done to ensure that certain actions (like animations or DOM updates)
    // only happen after the rest of the script has loaded, or to introduce a brief pause.
    }, 50)
  },
  // The following is a function defined as part of the loadingManager.
  // It's a progress handler that updates as resources are loaded.
  // 'itemUrl' represents the URL of the current item being loaded,
  // 'itemsLoaded' is the number of items already loaded, and
  // 'itemsTotal' is the total number of items to load.
  (itemUrl, itemsLoaded, itemsTotal) => {
    // Calculating the percentage of items loaded.
    const progressRatio = itemsLoaded / itemsTotal
    // Updating the inner HTML of the 'counterLoading' element with the percentage loaded.
    // The percentage is rounded to the nearest whole number.
    // ` = String Interpolation: They enable the creation of strings with embedded expressions, 
    // which are enclosed in ${}. The expression inside the curly braces is evaluated and the result is included in the string.
    counterLoading.innerHTML = `${(progressRatio * 100).toFixed(0)}%`
    // Updating the width of the 'header' element based on the loading progress.
    // This creates a visual effect that represents the loading progress.
    header.style.width = `${progressRatio * 550}.toFixed(0)px`
  }
)

// Continue Animation Loading

const continueAnimation = () => {
  // Music and sounds here
  music.play()
  // Starter
  gsap.to(starter, 0.5, {
    opacity: 0
  })
  // Loading
  gsap.to(loading, 0.5, {
    opacity: 0
  })
  // Camera Position
  gsap.to(camera.position, 1.5, {
    delay: 0.5,
    x: 4.0,
    y: 3.0,
    z: -8.5
  })
  //// Setting a timeout to execute the following block of code after a delay of 250 milliseconds.
  setTimeout(() => {
    // Changing the visibility of the 'loading and starter' element to 'hidden'.
    // Also setting the visibility of the 'groupPlane' and 'groupText' elements to 'visible'.
    loading.style.visibility = "hidden"
    starter.style.visibility = "hidden"
    groupPlane.visible = true
    groupText.visible = true
    // Setting the 'isLoading' variable to true.
    // This is likely a flag used to track whether the scene or application is still loading.
    isLoading = true
  }, 250);
}

// Addiing images to the scene
const textureLoader = new THREE.TextureLoader(loadingManager)

const imagesLoad1 = textureLoader.load("/images/cozy_room.jpg")
const imagesLoad2 = textureLoader.load("/images/light_made_tree.jpg")
const imagesLoad3 = textureLoader.load("/images/lightpost.jpg")
const imagesLoad4 = textureLoader.load("/images/sleeping_dog.jpg")

// Create a new GLTFLoader instance, passing the loadingManager to handle loading events.
const gltfLoader = new GLTFLoader(loadingManager)
// Array to store the loaded models.
let models = []

// Loading Santa Model
// Initialize the GLTFLoader with the loadingManager.
gltfLoader.load(
  "/models/santa/scene.gltf",
  (gltf) => { // Callback function that is executed once the model has loaded.
    // Set the scale of the model. This uniformly scales the model in all three dimensions.
    gltf.scene.scale.set(5, 5, 5)
    gltf.scene.position.y = intitialPositionMeshY
    gltf.scene.rotation.y = intitialRotationMeshY
    
    // Add the model to the scene.
    scene.add(gltf.scene)
    // Add the model to the 'models' array for later use.
    models.push(gltf.scene)
    
    // Traversing all the children of the loaded model
    scene.traverse((child) => {
      // Check if the child is a mesh and if its material is MeshStandardMaterial.
      if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        // Set the environment map intensity of the material.
        child.material.envMapIntensity = debugObject.envMapIntensity
        // Flag the material to be updated in the next render cycle.
        child.material.needsUpdate = true
      }
  })
  },
  undefined, // Placeholder for a progress callback function (not used here).
  (error) => { // Callback function that is executed if there is an error during loading.
    console.log(error)
  }
)

let startTouch = 0

// Load Rock model
gltfLoader.load(
    "models/rock.glb", // Path to the .glb file
    (gltf) => {
        // Scale, position, and rotation settings remain the same as before
        gltf.scene.scale.set(2.5, 2, 2.5)
        gltf.scene.position.y = initialPositionMeshY - 1.73
        gltf.scene.rotation.y = initialRotationMeshY

        // Add the loaded Rock GLB model to the scene
        scene.add(gltf.scene)

        // Store the model for later use
        models.push(gltf.scene)

        // Traverse through the model's children to adjust material properties
        scene.traverse((child) => {
            if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.envMapIntensity = debugObject.envMapIntensity
                child.material.needsUpdate = true
            }
        })

        // Touch and wheel event listeners for interaction
        if("ontouchstart" in window) {
            window.addEventListener('touchstart', (e) => {
                startTouch = e.touches[0].clientY
            }, false)

            window.addEventListener('touchmove', (e) => {
                if (e.touches[0].clientY < startTouch) {
                    startTouch = e.touches[0].clientY
                    animationScroll(e, true, startTouch, "up")
                } else {
                    startTouch = e.touches[0].clientY
                    animationScroll(e, true, startTouch, "down")
                }
            }, false)
        } else {
            window.addEventListener("wheel", (e) => animationScroll(e), false)
        }
    },
    undefined, // Placeholder for a progress callback function (not used here)
    (error) => {
        // Log any errors to the console
        console.log(error)
    }
)

// Set the environment map intensity to 5 in the debugObject.
// This value controls the strength of the environment map reflections on materials in the scene.
// A higher value results in more pronounced reflections, enhancing the visual impact of reflective surfaces.
// This setting is used later in the code to apply to materials that support environment mapping,
// like MeshStandardMaterial or MeshPhysicalMaterial, to increase their reflective quality.
debugObject.envMapIntensity = 5
  
// Camera Settings

const camera = new THREE.PerspectiveCamera(75, sizesCanvas.width / sizesCanvas.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = - 5
scene.add(camera)

// Background camera with orthographic camera
const backgroundCamera = new THREE.orthographicCamera(-1, 1, 1, -1, -1, 0)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enabled = false
controls.enableZoom = false

// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 15)
//position of the light
pointLight.position.set (-5.5, 5.5, -5)
scene.add(pointLight)


