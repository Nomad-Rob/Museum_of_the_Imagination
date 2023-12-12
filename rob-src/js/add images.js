// Create an array to store the image boxes
const imageBoxes = [];

// Create and position 20 image boxes in a helix pattern
for (let i = 0; i < 20; i++) {
  const imageTexture = textureLoader.load("images/your_image.jpg"); // Adjust the image path
  const imageMaterial = new THREE.MeshBasicMaterial({ map: imageTexture });
  const imageGeometry = new THREE.BoxGeometry(1, 1, 1); // Adjust the size as needed
  const imageBox = new THREE.Mesh(imageGeometry, imageMaterial);

  // Calculate the position based on the helix equation
  const radius = 5; // Adjust the radius of the helix
  const height = i * 0.5; // Adjust the vertical separation
  const angle = i * (Math.PI / 10); // Distribute boxes evenly in a circle
  const x = radius * Math.cos(angle);
  const z = radius * Math.sin(angle);

  // Position the image box
  imageBox.position.set(x, height, z);

  // Add the image box to the scene
  scene.add(imageBox);

  // Push the image box to the array for future reference
  imageBoxes.push(imageBox);
}

// Animate the Image Boxes into Focus as you scroll
function animateImageBoxes(scrollAmount) {
  // Calculate the animation effect based on scrollAmount
  // You can adjust the animation logic here to control the focus effect
  const focusAmount = scrollAmount * 0.1; // Adjust the speed of focus

  for (let i = 0; i < imageBoxes.length; i++) {
    const imageBox = imageBoxes[i];

    // Adjust the scale based on the focusAmount to make the boxes come into focus
    const scale = 1 / (1 + Math.abs(focusAmount - i));
    imageBox.scale.set(scale, scale, scale);
  }
}

// Listen for scroll events
window.addEventListener("scroll", () => {
  const scrollAmount = window.scrollY; // Get the scroll amount
  animateImageBoxes(scrollAmount);
});
