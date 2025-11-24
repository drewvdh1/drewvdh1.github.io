let scene, camera, renderer, controls, currentModel = null;

const viewer = document.getElementById("viewer");
const emptyMessage = document.getElementById("emptyMessage");

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(
    60,
    viewer.clientWidth / viewer.clientHeight,
    0.1,
    1000
  );
  camera.position.set(2, 2, 2);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  viewer.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Lighting setup for general PBR/MeshStandardMaterial visibility
  const lightA = new THREE.DirectionalLight(0xffffff, 1.5);
  lightA.position.set(5, 5, 5);
  scene.add(lightA);

  const lightB = new THREE.DirectionalLight(0xffffff, 1);
  lightB.position.set(-5, -5, -5);
  scene.add(lightB);
  
  const ambient = new THREE.AmbientLight(0x404040, 3); 
  scene.add(ambient);


  window.addEventListener('resize', onWindowResize, false);
  animate();
}

function onWindowResize() {
    camera.aspect = viewer.clientWidth / viewer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
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
  
  // Adjust camera position based on the bounding box size
  const maxDim = Math.max(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z);
  const cameraDistance = maxDim * 1.5;

  camera.position.set(cameraDistance, cameraDistance, cameraDistance);
  camera.lookAt(0, 0, 0);
  controls.target.set(0, 0, 0); // Reset controls target to center
  controls.update();
}

function loadModel(file) {
  if (!file) {
    emptyMessage.style.display = "block";
    return;
  }

  emptyMessage.style.display = "none";
  if (currentModel) scene.remove(currentModel);

  const extension = file.split(".").pop().toLowerCase();

  if (extension === 'glb' || extension === 'gltf') {
    // Use GLTF Loader for GLTF/GLB files
    const loader = new THREE.GLTFLoader();
    loader.load(
      file,
      function (gltf) {
        currentModel = gltf.scene;
        scene.add(currentModel);
        centerAndZoom(currentModel);
      },
      undefined,
      function (err) {
        console.error("Error loading GLTF model:", err);
        emptyMessage.innerText = "Error loading GLTF model.";
        emptyMessage.style.display = "block";
      }
    );
  } else if (extension === 'stl') {
    // Use STL Loader for STL files
    if (typeof THREE.STLLoader === 'undefined') {
        console.error("STLLoader not loaded. Check your HTML script tags.");
        emptyMessage.innerText = "Error: Missing STLLoader script.";
        emptyMessage.style.display = "block";
        return;
    }
    const loader = new THREE.STLLoader();
    loader.load(
      file,
      function (geometry) {
        // STL Loader provides BufferGeometry, we must create a Mesh from it
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x808080, // Gray color for the Reactor Vessel
            roughness: 0.5,
            metalness: 0.5
        }); 
        currentModel = new THREE.Mesh(geometry, material);
        scene.add(currentModel);
        centerAndZoom(currentModel);
      },
      undefined,
      function (err) {
        console.error("Error loading STL model:", err);
        emptyMessage.innerText = "Error loading STL model. Ensure the file is present and you are using a local server (http://localhost:8000).";
        emptyMessage.style.display = "block";
      }
    );
  } else {
    console.error("Unsupported file extension:", extension);
    emptyMessage.innerText = "Unsupported file type.";
    emptyMessage.style.display = "block";
  }
}

window.onload = init;