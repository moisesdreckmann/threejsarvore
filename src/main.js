import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';


const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

let aspecto = window.innerWidth / window.innerHeight
const camera = new THREE.PerspectiveCamera(
  40, //campo de visao vertical
  aspecto, //aspecto da imagem (Largura/Altura)
  0.1, //Plano proximo
  1000//Plano distante
);

camera.position.z = 10

//Resimensionamento da camera ao redimensionar a tela
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  console.log(`Resize: ${camera.aspect}`)
  renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 10

const skyboxGeoCylinder = new THREE.CylinderGeometry(100, 100, 25, 64, 1, false, 0, 2 * Math.PI)

let skyColor = new THREE.Color("hsl(200, 70%, 70%)");
let seaColor = new THREE.Color("hsl(50, 50%, 50%)");

const skyMaterialCylinder = [
  new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), //WALL
  new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), //UP
  new THREE.MeshBasicMaterial({ color: seaColor, side: THREE.BackSide })  //DOWN
]

const skybox = new THREE.Mesh(skyboxGeoCylinder, skyMaterialCylinder);
scene.add(skybox);

//Luz
var light = new THREE.AmbientLight(0xffffff, 10);
scene.add(light);

//Ponto de Luz
var plight = new THREE.PointLight(0xffff00, 100);
scene.add(plight);

let model
const modelPath = 'models/Tree/'
const mtlFile = 'Tree.mtl'
const objFile = 'Tree.obj'

const manager = new THREE.LoadingManager();
manager.onProgress = function (item, loaded, total) {
  console.log(item, loaded, total);
};

const mtlLoader = new MTLLoader(manager);
const objLoader = new OBJLoader();

mtlLoader.setPath(modelPath)
  .load(mtlFile, (materials) => {
    materials.preload()
    objLoader.setMaterials(materials)
    objLoader.setPath(modelPath).load(objFile, (object) => {
      model = object
      model.position.x = .05
      model.rotation.z = .5
      model.position.y = -1.2
      scene.add(model)

      const textureLoader = new THREE.TextureLoader()
      const texture = textureLoader.load('models/Tree/DB2X2_L01.png')

      const texturedMaterial = new THREE.MeshBasicMaterial({ map: texture })

      // Aplicar o material com textura ao modelo
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = texturedMaterial;
        }
      });

      animate()
    })
  })

function animate() {
  controls.update();
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

//Simulando Controle do Joystick do Caça
window.addEventListener('mousemove', event => {
  if (!event.buttons) {
    let wh = window.innerHeight
    let ww = window.innerWidth
    let my = event.clientY
    let mx = event.clientX
    if (model) model.rotation.x += (my - wh / 2) / wh / 100
    if (model) model.rotation.z -= (mx - ww / 2) / ww / 100
  }
})