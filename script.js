// Cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Câmera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 2, 3);
camera.lookAt(0, 0, 0);

// Renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cubo branco
const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Luz branca
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 2, 1);
scene.add(light);

// Luz ambiente
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Animação
function animate() {
    requestAnimationFrame(animate);
    
    // Rotação suave
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    renderer.render(scene, camera);
}

animate();

// Ajustar ao redimensionar janela
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
