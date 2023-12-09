

// Global variables
const player = document.querySelector(".player")
const playerClose = document.querySelector(".player-close")
const playerSource = document.querySelector(".player-source")
const counterLoading = document.querySelector(".counterLoading")
const header = document.querySelector("header")
const h1 = document.querySelector("h1")
const footer = document.querySelector("footer")
const loading = document.querySelector(".loading")
const started = document.querySelector(".started")
const startedBtn = document.querySelector(".started-btn")
let touchValue = 1
let videoLook = false
let scrollI = 0.0
let initialPositionMeshY = -1
let initialRotationMeshY = Math.PI * 0.9
let planeClickedIndex = -1
let isLoading = false
let lastPosition = {
    px: null,
    py: null,
    pz: null,
    rx: null,
    ry: null,
    rz: null
}

let detailsImage = {
  