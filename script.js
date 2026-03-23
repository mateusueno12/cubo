// Configuração da cena 3D
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a2a);
scene.fog = new THREE.FogExp2(0x0a0a2a, 0.002); // Névoa para profundidade

// Configuração da câmera
const canvas = document.getElementById('cuboCanvas');
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
camera.position.set(3, 3, 5);
camera.lookAt(0, 0, 0);

// Configuração do renderizador
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(600, 600);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true; // Habilitar sombras

// Ajustar tamanho responsivo
function resizeCanvas() {
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth, 600);
    renderer.setSize(size, size);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ========== CRIAR O CUBO ==========
const geometry = new THREE.BoxGeometry(2, 2, 2);

// Cores vibrantes para cada face
const cores = [
    0xff3333, // Direita - Vermelho
    0x33ff33, // Esquerda - Verde
    0x3399ff, // Cima - Azul
    0xffcc33, // Baixo - Amarelo
    0xff33ff, // Frente - Magenta
    0x33ffff  // Trás - Ciano
];

const materials = cores.map(cor => new THREE.MeshStandardMaterial({
    color: cor,
    transparent: true,
    opacity: 0.85,
    roughness: 0.3,
    metalness: 0.1,
    emissive: 0x000000,
    emissiveIntensity: 0
}));

const cube = new THREE.Mesh(geometry, materials);
cube.castShadow = true;
cube.receiveShadow = false;
scene.add(cube);

// ========== ADICIONAR ARESTAS ==========
const edgesGeometry = new THREE.EdgesGeometry(geometry);
const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
const wireframe = new THREE.LineSegments(edgesGeometry, edgesMaterial);
cube.add(wireframe);

// ========== ADICIONAR VÉRTICES (ESFERAS NOS CANTOS) ==========
const verticesPositions = [
    [-1, -1, -1], [ 1, -1, -1], [ 1, -1,  1], [-1, -1,  1], // Base
    [-1,  1, -1], [ 1,  1, -1], [ 1,  1,  1], [-1,  1,  1]  // Topo
];

const verticesGroup = [];
const sphereGeometry = new THREE.SphereGeometry(0.08, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffaa44, 
    emissive: 0x442200,
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2
});

verticesPositions.forEach(pos => {
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial.clone());
    sphere.position.set(pos[0], pos[1], pos[2]);
    cube.add(sphere);
    verticesGroup.push(sphere);
});

// ========== ILUMINAÇÃO ==========
// Luz ambiente
const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);

// Luz direcional principal
const mainLight = new THREE.DirectionalLight(0xffffff, 1);
mainLight.position.set(2, 3, 4);
mainLight.castShadow = true;
mainLight.receiveShadow = false;
scene.add(mainLight);

// Luz de preenchimento traseira
const backLight = new THREE.PointLight(0x4466ff, 0.5);
backLight.position.set(-2, -1, -3);
scene.add(backLight);

// Luz colorida lateral
const colorLight = new THREE.PointLight(0xff66cc, 0.4);
colorLight.position.set(2, 1, 2);
scene.add(colorLight);

// Luz de realce
const rimLight = new THREE.PointLight(0xffaa66, 0.3);
rimLight.position.set(1, 2, -2);
scene.add(rimLight);

// ========== PARTÍCULAS DE FUNDO ==========
const starCount = 1500;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
    starPositions[i*3] = (Math.random() - 0.5) * 400;
    starPositions[i*3+1] = (Math.random() - 0.5) * 400;
    starPositions[i*3+2] = (Math.random() - 0.5) * 200 - 100;
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ 
    color: 0xffffff, 
    size: 0.15,
    transparent: true,
    opacity: 0.6
});
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Adicionar algumas partículas coloridas
const colorStarCount = 500;
const colorStarGeometry = new THREE.BufferGeometry();
const colorStarPositions = new Float32Array(colorStarCount * 3);
const colorStarColors = new Float32Array(colorStarCount * 3);

for (let i = 0; i < colorStarCount; i++) {
    colorStarPositions[i*3] = (Math.random() - 0.5) * 300;
    colorStarPositions[i*3+1] = (Math.random() - 0.5) * 300;
    colorStarPositions[i*3+2] = (Math.random() - 0.5) * 150 - 75;
    
    colorStarColors[i*3] = Math.random();
    colorStarColors[i*3+1] = Math.random();
    colorStarColors[i*3+2] = Math.random();
}

colorStarGeometry.setAttribute('position', new THREE.BufferAttribute(colorStarPositions, 3));
colorStarGeometry.setAttribute('color', new THREE.BufferAttribute(colorStarColors, 3));
const colorStarMaterial = new THREE.PointsMaterial({ size: 0.1, vertexColors: true, transparent: true });
const colorStars = new THREE.Points(colorStarGeometry, colorStarMaterial);
scene.add(colorStars);

// ========== CONTROLES DE INTERAÇÃO ==========
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationX = 0;
let rotationY = 0;
let autoRotate = true;
let autoRotateAngle = 0;
let rotationSpeed = 0.008;
let showWireframe = true;
let showFaces = true;
let showVertices = true;

// Eventos de mouse para rotação manual
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
    canvas.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;
    
    rotationY += deltaX * 0.008;
    rotationX += deltaY * 0.008;
    
    // Limitar rotação X para evitar efeitos estranhos
    rotationX = Math.min(Math.max(rotationX, -Math.PI / 2), Math.PI / 2);
    
    cube.rotation.x = rotationX;
    cube.rotation.y = rotationY;
    
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
});

// ========== CONTROLES DOS BOTÕES ==========
// Auto-rotação
const toggleAutoRotateBtn = document.getElementById('toggleAutoRotate');
toggleAutoRotateBtn.addEventListener('click', () => {
    autoRotate = !autoRotate;
    toggleAutoRotateBtn.textContent = autoRotate ? '⏸️ Pausar' : '▶️ Iniciar';
    toggleAutoRotateBtn.classList.toggle('btn-primary');
});

// Rotação nos eixos
document.getElementById('rotateX').addEventListener('click', () => {
    rotationX += Math.PI / 4;
    cube.rotation.x = rotationX;
});

document.getElementById('rotateY').addEventListener('click', () => {
    rotationY += Math.PI / 4;
    cube.rotation.y = rotationY;
});

document.getElementById('rotateZ').addEventListener('click', () => {
    cube.rotation.z += Math.PI / 4;
});

// Controle de aparência
document.getElementById('toggleWireframe').addEventListener('click', () => {
    showWireframe = !showWireframe;
    wireframe.visible = showWireframe;
    document.getElementById('toggleWireframe').style.opacity = showWireframe ? '1' : '0.5';
});

document.getElementById('toggleFaces').addEventListener('click', () => {
    showFaces = !showFaces;
    cube.material.forEach(mat => mat.visible = showFaces);
    document.getElementById('toggleFaces').style.opacity = showFaces ? '1' : '0.5';
});

document.getElementById('toggleVertices').addEventListener('click', () => {
    showVertices = !showVertices;
    verticesGroup.forEach(v => v.visible = showVertices);
    document.getElementById('toggleVertices').style.opacity = showVertices ? '1' : '0.5';
});

// Resetar visualização
document.getElementById('resetView').addEventListener('click', () => {
    rotationX = 0;
    rotationY = 0;
    cube.rotation.x = 0;
    cube.rotation.y = 0;
    cube.rotation.z = 0;
    autoRotateAngle = 0;
    camera.position.set(3, 3, 5);
    camera.lookAt(0, 0, 0);
});

// Controle de velocidade
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');
speedControl.addEventListener('input', (e) => {
    rotationSpeed = parseFloat(e.target.value);
    speedValue.textContent = rotationSpeed.toFixed(3);
});

// ========== ANIMAÇÃO E EFEITOS ==========
let time = 0;

// Pulsar vértices
function animateVertices() {
    verticesGroup.forEach((vertex, index) => {
        const intensity = 0.3 + Math.sin(time * 3 + index) * 0.2;
        vertex.material.emissiveIntensity = intensity;
    });
}

// Animar luzes coloridas
function animateLights() {
    const hue = (time * 0.5) % (Math.PI * 2);
    colorLight.intensity = 0.4 + Math.sin(time) * 0.2;
    rimLight.intensity = 0.3 + Math.cos(time * 0.7) * 0.15;
}

// Função principal de animação
function animate() {
    requestAnimationFrame(animate);
    time += 0.02;
    
    // Auto-rotação
    if (autoRotate && !isDragging) {
        autoRotateAngle += rotationSpeed;
        cube.rotation.y = rotationY + autoRotateAngle;
        cube.rotation.x = rotationX + Math.sin(autoRotateAngle * 0.5) * 0.1;
    }
    
    // Animações visuais
    animateVertices();
    animateLights();
    
    // Rotação suave das partículas
    stars.rotation.y += 0.001;
    stars.rotation.x += 0.0005;
    colorStars.rotation.y -= 0.0008;
    colorStars.rotation.z += 0.0003;
    
    // Pequeno movimento na câmera para efeito dinâmico
    if (!isDragging && !autoRotate) {
        const breath = Math.sin(time * 0.5) * 0.02;
        camera.position.x = 3 + breath;
        camera.lookAt(0, 0, 0);
    }
    
    renderer.render(scene, camera);
}

// Iniciar animação
animate();

// Efeito de brilho nas faces (opcional)
setInterval(() => {
    if (showFaces) {
        cube.material.forEach(mat => {
            mat.emissiveIntensity = Math.random() * 0.1;
            setTimeout(() => {
                mat.emissiveIntensity = 0;
            }, 200);
        });
    }
}, 3000);

// Log de inicialização
console.log('🎲 Cubo 3D inicializado com sucesso!');
console.log('📐 8 vértices, 12 arestas, 6 faces');
console.log('🖱️ Clique e arraste para rotacionar manualmente');

// Tooltips para os botões (opcional)
const buttons = document.querySelectorAll('.btn');
buttons.forEach(btn => {
    btn.addEventListener('mouseenter', (e) => {
        btn.style.transform = 'translateY(-2px)';
    });
    btn.addEventListener('mouseleave', (e) => {
        btn.style.transform = 'translateY(0)';
    });
});
