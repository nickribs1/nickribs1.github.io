//import "./style.css";
//had to npm install gsap for this
//import gsap from './node_modules/gsap' 
//import { gsap } from 'https://cdn.skypack.dev/gsap' 
//Latest version at https://unpkg.com/three
//import * as THREE from "./three.js";
//import * as THREE from 'https://unpkg.com/three@0.126.1/build.three.module.js' 
//import * as THREE from 'https://unpkg.com/three@0.148.0/build/three.js'
//import * as THREE from './three.js';
//import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.148.0-ZdnPTf2EskNtHkVhjjpp/mode=imports/optimized/three.js';
//might have to import in a script tag in html
//import * as dat from 'dat.gui'
//import * as THREE from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js'
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//import { Raycaster } from 'https://unpkg.com/three@0.148.0/src/core/Raycaster.js'

//const gui = new dat.GUI()
//Change these vals here and when initializing planeGeometry
const world = {
  plane: {
    width: 600,
    height: 600,
    widthSegments: 75,
    heightSegments: 75
  }
}
//1 and 100 is min and max on the slider
//gui.add(world.plane, 'width', 1, 2000).onChange(generatePlane)

//gui.add(world.plane, 'height', 1, 2000).onChange(generatePlane)

//gui.add(world.plane, 'widthSegments', 1, 200).onChange(generatePlane)

//gui.add(world.plane, 'heightSegments', 1, 200).onChange(generatePlane)

function generatePlane() {
  planeMesh.geometry.dispose()
  planeMesh.geometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments)

  //Cleaner way of getting array length with object 
//Vertex position randomization
const {array} = planeMesh.geometry.attributes.position
const randomValues = []
for (let i = 0; i < array.length; i ++) {
  if (i % 3 === 0) {
    const x = array[i]
    const y = array[i + 1]
    const z = array[i + 2]

    //array[i] = x + 3 Can translate everything right 3 units (might want to translate everything a certain way to make it rotate 90 degrees if there is not a plane rotation function)
    //Can multiply (Math.random() - 0.5) to alter how extreme the random generation is
    array[i] = x + (Math.random() - 0.5) * 3
    array[i + 1] = y + (Math.random() - 0.5) * 3
    array[i + 2] = z + (Math.random() - 0.5) * 2.5
  }

  //Can replace * Math.PI * 2 with - 0.5
  randomValues.push(Math.random() * Math.PI * 2)
  }

  planeMesh.geometry.attributes.position.randomValues = randomValues
  planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position.array


  const colors = []
  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
  //Changing the color of the mesh with (0, 1, 0) rgb value going from 0-1
    colors.push(0, 0.19, 0.4)
  }

  planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
}

const raycaster = new THREE.Raycaster()
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()

const bgTexture = new THREE.TextureLoader().load('background1.jpg');
scene.background = bgTexture;

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)

/////Addition
function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial( { color: 0xffffff })
  const star = new THREE.Mesh (geometry, material);

  const x = THREE.MathUtils.randFloatSpread(2000);
  const y = THREE.MathUtils.randFloatSpread(1000) + 650;
  const z = THREE.MathUtils.randFloatSpread(500);

  star.position.set(x, y, z);
  scene.add(star)
}
//For loop, 200 times run addStar function to generate all these diff star positions
Array(500).fill().forEach(addStar)

/////End of Addition

//Allows for mouse click and drag to move the camera to rotate plane, might not want this if doing transition
//new OrbitControls(camera, renderer.domElement)

camera.position.z = 50

//Change the second 5 to longer since this is the height of the plane
const planeGeometry = new THREE.PlaneGeometry(600, 600, 75, 75)
const planeMaterial = new THREE.MeshPhongMaterial({side: THREE.DoubleSide, flatShading: true, vertexColors: true})
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(planeMesh)

generatePlane()

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, -1, 1)
scene.add(light)

//Lights up back side of plane, might want to dim to show differentiation with lighting so yk which is front
const backLight = new THREE.DirectionalLight(0xffffff, 1)
backLight.position.set(0, 0, -1)
scene.add(backLight)

const mouse = {
  x: undefined,
  y: undefined
}

//To count number of frames in animate function
let frame = 0
function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  //To rotate plane (would want this to rotate 90 deg the other way, neg numbers, for goal transition). Would also need to set a background image like the space one in orig tutorial as well as a zoom component that will happen on scroll (similar to orig tutorial but need to rotate plane/camera viewing angle 90 deg first)
  //planeMesh.rotation.x += 0.01

  raycaster.setFromCamera(mouse, camera)
  frame += 0.01

  //Makes vertices pulse/move
  const { array, originalPosition, randomValues } = planeMesh.geometry.attributes.position
  for (let i = 0; i < array.length; i += 3) {
    //altering x coord
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01
    //altering y coord
    array[i + 1] = originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.01
  }

  planeMesh.geometry.attributes.position.needsUpdate = true

  const intersects = raycaster.intersectObject(planeMesh)
  if (intersects.length > 0) {
    const { color } = intersects[0].object.geometry.attributes
    //the 0 after the comma is what 0-1scale val it is being set to
    //setX corresponds to changing the red value, setY for changing green value
    //Vertex 1
    color.setX(intersects[0].face.a, 0.1)
    color.setY(intersects[0].face.a, 0.5)
    color.setZ(intersects[0].face.a, 1)

    //Vertex 2
    color.setX(intersects[0].face.b, 0.1)
    color.setY(intersects[0].face.b, 0.5)
    color.setZ(intersects[0].face.b, 1)

    //Vertex 3
    color.setX(intersects[0].face.c, 0.1)
    color.setY(intersects[0].face.c, 0.5)
    color.setZ(intersects[0].face.c, 1)

    intersects[0].object.geometry.attributes.color.needsUpdate = true

    const initialColor = {
      r: 0,
      g: 0.19,
      b: 0.4
    }

    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1
    }

    gsap.to(hoverColor, { 
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      duration: 1,
      onUpdate: () => {
        //Vertex 1
        color.setX(intersects[0].face.a, hoverColor.r)
        color.setY(intersects[0].face.a, hoverColor.g)
        color.setZ(intersects[0].face.a, hoverColor.b)

        //Vertex 2
        color.setX(intersects[0].face.b, hoverColor.r)
        color.setY(intersects[0].face.b, hoverColor.g)
        color.setZ(intersects[0].face.b, hoverColor.b)

        //Vertex 3
        color.setX(intersects[0].face.c, hoverColor.r)
        color.setY(intersects[0].face.c, hoverColor.g)
        color.setZ(intersects[0].face.c, hoverColor.b)
      }
    })
  }
}

animate()

addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1
  mouse.y = -(event.clientY / innerHeight) * 2 + 1
})

function moveCameraTilt() {
  const distScrolled = document.body.getBoundingClientRect().top
  if (((-1 * distScrolled) / (document.documentElement.scrollHeight - innerHeight)) == 0) {
    camera.position.z = 50
    camera.position.x = 0
    camera.position.y = 0
  }

  if (((-1 * distScrolled) / (document.documentElement.scrollHeight - innerHeight)) < 0.20) {
    //5 is the inverse of 0.20, 50 is initial camera z-val, 30 is dist desired to move down
    camera.position.z = 50 + (30 * Math.sin(((((distScrolled / (document.documentElement.scrollHeight - innerHeight)) * 5) * (Math.PI / 2)) * -1) + Math.PI))
    camera.rotation.x = ((-1 * distScrolled) / (document.documentElement.scrollHeight - innerHeight)) * 7
    //console.log(camera.position.z)
    //console.log(Math.sin(((distScrolled * (10 / 3)) * (Math.PI / 2)) + ((3 * Math.PI) / 2)))
  }

  if (((-1 * distScrolled) / (document.documentElement.scrollHeight - innerHeight)) < 0.24 && ((-1 * distScrolled) / (document.documentElement.scrollHeight - innerHeight)) >= 0.20) {
    camera.position.z = 20
    camera.position.x = 0
    camera.position.y = 0
  }

  if (((-1 * distScrolled) / (document.documentElement.scrollHeight - innerHeight)) < 0.40 && ((-1 * distScrolled) / (document.documentElement.scrollHeight - innerHeight)) >= 0.24) {
    camera.position.y = (((-1 * distScrolled) / (document.documentElement.scrollHeight - innerHeight)) * (5000 * (((-1 * distScrolled) / (document.documentElement.scrollHeight - innerHeight)) - 0.24)))
  }

  if (((-1 * distScrolled) / (document.documentElement.scrollHeight - innerHeight)) >= 0.40) {
    camera.position.z = 20
    camera.position.x = 1.4
    camera.position.y = 320
  }

}

document.body.onscroll = moveCameraTilt


//Skills Circle
$(document).ready(function (){
  if(!$("#myCanvas").tagcanvas({
    textColour : '#08FDD8',
    outlineThickness : 0.5,
    outlineColour : '#FE0853',
    maxSpeed : 0.03,
    freezeActive:true,
    shuffleTags:true,
    shape:'sphere',
    zoom:0.8,
    noSelect:true,
    textFont:null,
    pinchZoom:true,
    wheelZoom:false,
    freezeDecel:true,
    fadeIn:3000,
    initial: [0.3,-0.1],
    depth : 1.1
  }, "tags")){ 
    $("#myCanvasContainer");
  }
})

$('a[href^=\\#aboutarea]').on('click', function(event){     
  event.preventDefault();
  $('html,body').animate({scrollTop:$(this.hash).offset().top - 70}, 500);
});

$('a[href^=\\#skillsarea]').on('click', function(event){     
  event.preventDefault();
  $('html,body').animate({scrollTop:$(this.hash).offset().top - 70}, 500);
});

//Smooth scrolling with links
$('a[href^=\\#experiencesarea]').on('click', function(event){     
  event.preventDefault();
  $('html,body').animate({scrollTop:$(this.hash).offset().top - 270}, 500);
});

$('a[href^=\\#projectsarea]').on('click', function(event){     
  event.preventDefault();
  $('html,body').animate({scrollTop:$(this.hash).offset().top - 70}, 500);
});
