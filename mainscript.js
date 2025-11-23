<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>3D Model Viewer</title>
<style>
  body { margin:0; display:flex; height:100vh; font-family:Arial; background:#111; color:white; }
  #sidebar { width:250px; background:#1a1a1a; padding:20px; overflow-y:auto; }
  #viewer { flex:1; position:relative; }
  canvas { display:block; width:100%; height:100%; }
  .thumb { margin-bottom:10px; padding:10px; background:#222; cursor:pointer; border-radius:6px; }
  .thumb:hover { background:#333; }
  input[type="file"] { margin-bottom:15px; width:100%; padding:5px; }
</style>
</head>
<body>

<div id="sidebar">
  <h2>3D Gallery</h2>
  <input type="file" id="fileInput" accept=".stl,.glb,.gltf" />
  <div class="thumb" onclick="loadModel('model1.glb')">Model 1</div>
  <div class="thumb" onclick="loadModel('model2.glb')">Model 2</div>
  <div class="thumb" onclick="loadModel('model3.glb')">Model 3</div>
</div>

<div id="viewer"></div>

<script src="https://cdn.jsdelivr.net/npm/three@0.159/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.159/examples/js/controls/OrbitControls.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.159/examples/js/loaders/GLTFLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.159/examples/js/loaders/STLLoader.js"></script>

<script>
let scene, camera, renderer, controls, currentModel = null;

const viewer = document.getElementById('viewer');

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(60, viewer.clientWidth/viewer.clientHeight, 0.1, 1000);
  camera.position.set(2,2,2);

  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  viewer.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const light = new THREE.DirectionalLight(0xffffff,2);
  light.position.set(5,5,5);
  scene.add(light);

  animate();
}

// Animate loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene,camera);
}

// Center and zoom model
function centerAndZoom(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);

  const size = box.getSize(new THREE.Vector3()).length();
  camera.position.set(size*1.5, size*1.5, size*1.5);
  camera.lookAt(0,0,0);
  controls.update();
}

// Load preloaded GLB/GLTF model
function loadModel(file) {
  const loader = new THREE.GLTFLoader();
  if (currentModel) scene.remove(currentModel);

  loader.load(file, function(gltf){
    currentModel = gltf.scene;
    scene.add(currentModel);
    centerAndZoom(currentModel);
  });
}

// Handle file upload
const stlLoader = new THREE.STLLoader();
document.getElementById('fileInput').addEventListener('change', function(event){
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e){
    const ext = file.name.split('.').pop().toLowerCase();

    if (currentModel) scene.remove(currentModel);

    if (ext === 'stl') {
      const geometry = stlLoader.parse(e.target.result);
      const material = new THREE.MeshNormalMaterial();
      currentModel = new THREE.Mesh(geometry, material);
      scene.add(currentModel);
      centerAndZoom(currentModel);
    } else if (ext === 'glb' || ext === 'gltf') {
      const gltfLoader = new THREE.GLTFLoader();
      gltfLoader.parse(e.target.result, '', function(gltf){
        currentModel = gltf.scene;
        scene.add(currentModel);
        centerAndZoom(currentModel);
      });
    } else {
      alert('Unsupported file type!');
    }
  };
  reader.readAsArrayBuffer(file);
});

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = viewer.clientWidth / viewer.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
});

window.onload = init;
</script>

</body>
</html>
