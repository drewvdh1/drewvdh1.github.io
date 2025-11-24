let scene, camera, renderer, controls, currentModel;

initViewer();

function initViewer() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 100);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth - 280, window.innerHeight);
    document.getElementById("viewer").appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);

    // Basic lighting
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(1, 1, 1);
    scene.add(light1);

    const light2 = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(light2);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

window.selectModel = function (fileName) {
    if (!fileName) return;

    // Remove previous model
    if (currentModel) {
        scene.remove(currentModel);
        currentModel = null;
    }

    const extension = fileName.split('.').pop().toLowerCase();

    if (extension === "stl") {
        loadSTL(fileName);
    } else if (extension === "glb" || extension === "gltf") {
        loadGLB(fileName);
    }
};

function loadSTL(file) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".stl";

    input.onchange = (e) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(e.target.files[0]);

        reader.onload = () => {
            const loader = new STLLoader();
            const geometry = loader.parse(reader.result);

            const material = new THREE.MeshStandardMaterial({
                color: 0x888888,
                metalness: 0.1,
                roughness: 0.6
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.scale.set(0.1, 0.1, 0.1);
            mesh.position.set(0, -20, 0);

            scene.add(mesh);
            currentModel = mesh;
        };
    };

    input.click();
}

function loadGLB(file) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".glb,.gltf";

    input.onchange = (e) => {
        const url = URL.createObjectURL(e.target.files[0]);

        const loader = new GLTFLoader();
        loader.load(url, (gltf) => {
            const model = gltf.scene;
            model.scale.set(10, 10, 10);
            scene.add(model);

            currentModel = model;
        });
    };

    input.click();
}
