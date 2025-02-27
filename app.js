import * as THREE from "three";
import { OrbitControls } from "./js/OrbitControls.js";

window.updateCuboidSize = updateCuboidSize;

// Create a container for the whole layout
const container = document.createElement('div');
container.style.display = 'flex';
container.style.width = '100%';
container.style.height = '100vh';
container.style.backgroundColor = '#222';
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(container);

// Left container for main view
const mainViewContainer = document.createElement('div');
mainViewContainer.style.flex = '3';
mainViewContainer.style.position = 'relative';
mainViewContainer.style.border = '1px solid #444';
container.appendChild(mainViewContainer);

// Right container for orthographic views
const orthoViewsContainer = document.createElement('div');
orthoViewsContainer.style.flex = '1';
orthoViewsContainer.style.display = 'flex';
orthoViewsContainer.style.flexDirection = 'column';
container.appendChild(orthoViewsContainer);

// Create containers for each orthographic view
const topViewContainer = createOrthoViewContainer("top view");
const sideViewContainer = createOrthoViewContainer("side view");
const frontViewContainer = createOrthoViewContainer("front view");

orthoViewsContainer.appendChild(topViewContainer);
orthoViewsContainer.appendChild(sideViewContainer);
orthoViewsContainer.appendChild(frontViewContainer);

// Function to create orthographic view containers
function createOrthoViewContainer(title) {
    const viewContainer = document.createElement('div');
    viewContainer.style.flex = '1';
    viewContainer.style.position = 'relative';
    viewContainer.style.border = '1px solid #f00';
    
    const label = document.createElement('div');
    label.textContent = title;
    label.style.position = 'absolute';
    label.style.top = '10px';
    label.style.left = '10px';
    label.style.color = '#f00';
    label.style.fontFamily = 'Arial, sans-serif';
    label.style.fontSize = '18px';
    label.style.zIndex = '10';
    
    viewContainer.appendChild(label);
    return viewContainer;
}

// Create main view label
const mainViewLabel = document.createElement('div');
mainViewLabel.textContent = "main 3d view";
mainViewLabel.style.position = 'absolute';
mainViewLabel.style.top = '10px';
mainViewLabel.style.left = '10px';
mainViewLabel.style.color = '#f00';
mainViewLabel.style.fontFamily = 'Arial, sans-serif';
mainViewLabel.style.fontSize = '18px';
mainViewLabel.style.zIndex = '10';
mainViewContainer.appendChild(mainViewLabel);

// Scene and Renderer Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Main renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(mainViewContainer.offsetWidth, mainViewContainer.offsetHeight);
mainViewContainer.appendChild(renderer.domElement);

// Orthographic renderers
const topRenderer = new THREE.WebGLRenderer({ antialias: true });
topRenderer.setSize(topViewContainer.offsetWidth, topViewContainer.offsetHeight);
topViewContainer.appendChild(topRenderer.domElement);

const sideRenderer = new THREE.WebGLRenderer({ antialias: true });
sideRenderer.setSize(sideViewContainer.offsetWidth, sideViewContainer.offsetHeight);
sideViewContainer.appendChild(sideRenderer.domElement);

const frontRenderer = new THREE.WebGLRenderer({ antialias: true });
frontRenderer.setSize(frontViewContainer.offsetWidth, frontViewContainer.offsetHeight);
frontViewContainer.appendChild(frontRenderer.domElement);

// Cameras for different views
const topCamera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
topCamera.position.set(0, 20, 0);
topCamera.lookAt(0, 0, 0);

const sideCamera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
sideCamera.position.set(20, 0, 0);
sideCamera.lookAt(0, 0, 0);

const frontCamera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
frontCamera.position.set(0, 0, 20);
frontCamera.lookAt(0, 0, 0);

// OrbitControls for interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 5;
controls.maxDistance = 50;
controls.update();

// Function to Create a Material
function createMaterial(color, opacity = 1.0, isTransparent = false) {
    return new THREE.MeshBasicMaterial({
        color,
        opacity,
        transparent: isTransparent
    });
}

// Predefined Materials
const materialRedTransparent = createMaterial(0xff0000, 0.15, true);
const materialBlueTransparent = createMaterial(0x0000ff, 0.15, true);
const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });

// Cuboid Dimensions (Default)
const dimensions = {
    biggerCuboid: { width: 2.35, height: 2.39, depth: 12.03 },
    insideCuboid: { width: 2.35, height: 0.5, depth: 2.0 },
    topCuboid: { width: 1.5, height: 1.0, depth: 3.0 }
};

// Function to Create a Cuboid
function createCuboid({ width, height, depth }, material, position = { x: 0, y: 0, z: 0 }, addWireframe = false) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, position.z);

    if (addWireframe) {
        const edges = new THREE.EdgesGeometry(geometry);
        const wireframe = new THREE.LineSegments(edges, wireframeMaterial);
        mesh.add(wireframe);
    }

    return mesh;
}

// Create Cuboids
let insideCuboid = createCuboid(dimensions.insideCuboid, materialRedTransparent, {
    x: dimensions.biggerCuboid.width / 2 - dimensions.insideCuboid.width / 2,
    y: -dimensions.insideCuboid.height,
    z: 0
}, true);

let topCuboid = createCuboid(dimensions.topCuboid, materialBlueTransparent, {
    x: dimensions.biggerCuboid.width / 2 - dimensions.topCuboid.width / 2 - 5,
    y: dimensions.insideCuboid.height + dimensions.topCuboid.height / 2,
    z: 0
}, true);

let bigCuboid = createCuboid(dimensions.biggerCuboid, materialBlueTransparent, { x: 0, y: 0, z: 0 }, true);

// Grouping for Rotation
const group = new THREE.Group();
group.add(insideCuboid, topCuboid, bigCuboid);
scene.add(group);

// Position Camera
camera.position.set(0, 5, 15);

// Function to Check if One Cuboid Fits Inside Another
function doesCuboidFit(inner, outer) {
    const fits = inner.width <= outer.width && inner.height <= outer.height && inner.depth <= outer.depth;
    console.log(fits ? "The inside cuboid fits inside the bigger cuboid." : "The inside cuboid does NOT fit inside the bigger cuboid.");
    return fits;
}
doesCuboidFit(dimensions.insideCuboid, dimensions.biggerCuboid);

// Function to Update Cuboid Sizes Dynamically
function updateCuboidSize() {
    const newWidth = parseFloat(document.getElementById("widthInput").value);
    const newHeight = parseFloat(document.getElementById("heightInput").value);
    const newDepth = parseFloat(document.getElementById("depthInput").value);

    if (isNaN(newWidth) || isNaN(newHeight) || isNaN(newDepth)) return;

    dimensions.insideCuboid.width = newWidth;
    dimensions.insideCuboid.height = newHeight;
    dimensions.insideCuboid.depth = newDepth;

    group.remove(insideCuboid);
    insideCuboid = createCuboid(dimensions.insideCuboid, materialRedTransparent, {
        x: dimensions.biggerCuboid.width / 2 - dimensions.insideCuboid.width / 2,
        y: -dimensions.insideCuboid.height,
        z: 0
    }, true);

    group.add(insideCuboid);
    doesCuboidFit(dimensions.insideCuboid, dimensions.biggerCuboid);
}

// Handle window resize
window.addEventListener('resize', () => {
    // Update main camera aspect ratio
    camera.aspect = mainViewContainer.offsetWidth / mainViewContainer.offsetHeight;
    camera.updateProjectionMatrix();
    
    // Resize renderers
    renderer.setSize(mainViewContainer.offsetWidth, mainViewContainer.offsetHeight);
    topRenderer.setSize(topViewContainer.offsetWidth, topViewContainer.offsetHeight);
    sideRenderer.setSize(sideViewContainer.offsetWidth, sideViewContainer.offsetHeight);
    frontRenderer.setSize(frontViewContainer.offsetWidth, frontViewContainer.offsetHeight);
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    //group.rotation.y += 0.005;
    controls.update();
    renderer.render(scene, camera);
    topRenderer.render(scene, topCamera);
    sideRenderer.render(scene, sideCamera);
    frontRenderer.render(scene, frontCamera);
}
animate();