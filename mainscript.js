let scene, camera, renderer, controls;

function initViewer() {
    const container = document.getElementById("viewer");

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(2, 2, 2);

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function clearModels() {
    scene.children.forEach(obj => {
        if (obj.type !== "DirectionalLight") scene.remove(obj);
    });
}

function loadPreloaded(filename) {
    clearModels();

    const ext = filename.split('.').pop().toLowerCase();

    if (ext === "stl") loadSTLFile(filename);
    else if (ext === "glb" || ext === "gltf") loadGLBFile(filename);
}

function loadSTLFile(url) {
    const loader = new THREE.STLLoader();
    loader.load(url, geometry => {
        const material = new THREE.MeshStandardMaterial({ color: 0x999999 });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        autoCenterAndScale(mesh);
    });
}

function loadGLBFile(url) {
    const loader = new THREE.GLTFLoader();
    loader.load(url, gltf => {
        const model = gltf.scene;
        scene.add(model);
        autoCenterAndScale(model);
    });
}

function autoCenterAndScale(object) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    object.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1 / maxDim;

    object.scale.setScalar(scale);
}

window.onload = initViewer;
