let scene, camera, renderer, controls, currentModel = null;
const viewer = document.getElementById('viewer');

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(60, viewer.clientWidth / viewer.clientHeight, 0.1, 1000);
  camera.position.set(2, 2, 2);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  viewer.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(5, 5, 5);
  scene.add(light);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function centerAndZoom(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);

  const size = box.getSize(new THREE.Vector3()).length();
  camera.position.set(size * 1.5, size * 1.5, size * 1.5);
  camera.lookAt(0, 0, 0);
  controls.update();
}

function loadModel(file) {
  const loader = new THREE.GLTFLoader();
  if (currentModel) scene.remove(currentModel);

  loader.load(file, function (gltf) {
    currentModel = gltf.scene;
    scene.add(currentModel);
    centerAndZoom(currentModel);
  });
}

const stlLoader = new THREE.STLLoader();
document.getElementById('fileInput').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
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
      gltfLoader.parse(e.target.result, '', function (gltf) {
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

window.addEventListener('resize', () => {
  camera.aspect = viewer.clientWidth / viewer.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
});

window.onload = init();