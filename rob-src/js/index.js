import * as THREE from 'three'
import { gsap, Power1 } from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'


const counterLoading = document.querySelector(".counterLoading")
const header = document.querySelector("header")
const h1 = document.querySelector("h1")
const footer = document.querySelector("footer")
const loading = document.querySelector(".loading")
const started = document.querySelector(".started")
const startedBtn = document.querySelector(".started-btn")

let videoLook = false
let scrollI = 0.0
let initialPositionMeshY = -1
let initialRotationMeshY = Math.PI * 0.9

let isLoading = false


// Debug
const debugObject = {}

// Canvas
const canvas = document.querySelector(".main-webgl")

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("#ffff");

// background scene
const backgroundScene = new THREE.Scene()

// Sizes
const sizesCanvas = {
  width: window.innerWidth,
  height: window.innerHeight
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
const music = new Audio("sounds/christmas.mp3")
music.volume = 0.3


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
      gsap.to(counterLoading, 0.5, {
        delay: 0.5,
        opacity: 0,
        ease: Power1.easeIn,
      })
      // Started
      gsap.to(started, 0.5, {
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
  // Started
  gsap.to(started, 0.5, {
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
    // Changing the visibility of the 'loading and started' element to 'hidden'.
    // Also setting the visibility of the 'groupPlane' and 'groupText' elements to 'visible'.
    loading.style.visibility = "hidden"
    started.style.visibility = "hidden"
    groupPlane.visible = true
    groupText.visible = true
    // Setting the 'isLoading' variable to true.
    // This is likely a flag used to track whether the scene or application is still loading.
    isLoading = true
  }, 250);
}

// Addiing images to the scene
const textureLoader = new THREE.TextureLoader(loadingManager)

const imagesLoad1 = textureLoader.load("./images/cozy_room.jpg")
const imagesLoad2 = textureLoader.load("./images/light_made_tree.jpg")
const imagesLoad3 = textureLoader.load("./images/lightpost.jpg")
const imagesLoad4 = textureLoader.load("./images/sleeping_dog.jpg")

// Create a new GLTFLoader instance, passing the loadingManager to handle loading events.
const gltfLoader = new GLTFLoader(loadingManager)
// Array to store the loaded models.
let models = []

// Loading Santa Model
// Initialize the GLTFLoader with the loadingManager.
gltfLoader.load(
  "models/santa/scene.gltf",
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
    "models/rock/scene.gltf", // Path to the .glb file
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
const backgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 0)

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


// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
})

renderer.setSize(sizesCanvas.width, sizesCanvas.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.autoClear = false


// Animation
const animationScroll = (eventObject, touchEvent, valuse, downOrUp) => {
  let deltaY
  
  if (touchEvent) deltaY = value
  else deltaY = eventObject.deltaY
  
  if (videoLook === false && isLoading) {
    // Known up or down
    if (toucheEvent && downOrUp === "down" && scrollI > 0) scrollI--
    else if (!toucheEvent && deltaY < 0 && scrollI > 0) scrollI00
    
    if (scrollI <= 435 && scrollI >= 0 && models.length === 2) {
      if (touchEvent && downOrUp === "up") scrollI++
      else if (!touchEvent && deltaY > 0) scrollI++
      const speed = 0.005
      
      
      // Update Mesh
      
      models.forEach((model, index) => {
        // rotation
        model.rotation.y = (initialRotationMeshY) - scrollI * 0.01355 // End front of camera
    
        // position
        if (index === 0) model.position.y = (initialPositionMeshY) - scrollI * (speed * 0.8)
        else if (index === 1) model.position.y = (initialPositionMeshY - 1.73) - scrollI * (speed * 0.8)

        model.position.z = - scrollI * (speed * 0.75)
    })
    
    // Update group of planes
    
    for (let i = 0; i < groupPlane.children.length; i++) {
      const plane = groupPlane.children[i]
      const text = groupText.children[i]

      // Planes -------
      // Position
      plane.position.z = - Math.sin(i + 1 * scrollI * (speed * 10)) * Math.PI
      plane.position.x = - Math.cos(i + 1 * scrollI * (speed * 10)) * Math.PI
      plane.position.y = (i - 14.2) + (scrollI * (speed * 10))

      // Rotation
      plane.lookAt(0, plane.position.y, 0)

      // Text -------
      // Position
      text.position.z = plane.position.z - 0.5
      text.position.x = plane.position.x
      text.position.y = plane.position.y - 0.3

      // Rotation
      text.lookAt(plane.position.x * 2, plane.position.y - 0.3, plane.position.z * 2)
  }
}
}
}

const clock = new THREE.Clock()

let callChangeTouchValue = 0
let touchI = - 1

const init = () => {
    const elapsedTime = clock.getElapsedTime()
        
    // Upadate raycaster
    if(!("ontouchstart" in window)) raycatser.setFromCamera(mouse, camera)

    // black and white to colo animation with raycaster
    if (isLoading) {
        if (intersects.length === 1) {
            if (currentIntersect === null) {
                currentIntersect = intersects[0]
            } else {
                for (let i = 0; i < groupPlane.children.length; i++) {
                    if (groupPlane.children[i] === currentIntersect.object) {
                        if (callChangeTouchValue === 0) {
                            touchI = i
                            changeTouchValue(i)
                            callChangeTouchValue = 1
                            document.body.style.cursor = "pointer"               
                        }
                    }
                }
            }
        } else {
            if (callChangeTouchValue === 1 && touchI >= 0) {
                changeTouchValue(touchI)
                callChangeTouchValue = 0
                document.body.style.cursor = "auto" 
                currentIntersect = null
                touchI = - 1
            }
        }
    }

    // Update renderer
    renderer.render(scene, camera)
    renderer.render(backgroundScene, backgroundCamera)

    // Call this function
    window.requestAnimationFrame(init)
}

init()
