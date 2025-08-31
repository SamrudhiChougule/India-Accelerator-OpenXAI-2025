'use client';

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { AccessLog } from "../types/access";

interface GlobeProps {
  accessLogs: AccessLog[];
  showLocations: boolean;
  alerts: AccessLog[];  // suspicious logs
}

export default function GlobeComponent({ accessLogs, showLocations, alerts }: GlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const existingMarkersRef = useRef<Set<string>>(new Set());
  const markerGroupRef = useRef<THREE.Group | null>(null);

  const branchCoords: Record<string, { lat: number; lng: number }> = {
    "New York": { lat: 40.7128, lng: -74.006 },
    "London": { lat: 51.5074, lng: -0.1278 },
    "Tokyo": { lat: 35.6895, lng: 139.6917 },
    "Mumbai": { lat: 19.076, lng: 72.8777 }
  };

  const R = 100;

useEffect(() => {
  if (!mountRef.current) return;

  // 🧹 Clear old canvas if it exists
  mountRef.current.innerHTML = "";

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    50,
    mountRef.current.clientWidth / mountRef.current.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 350;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  mountRef.current.appendChild(renderer.domElement);

  let GlobeClass: any;
  if (typeof window !== "undefined") {
    GlobeClass = require("three-globe").default;
  }

  const globe = new GlobeClass();
  globe.globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg");
  globe.bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png");
  scene.add(globe);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 1));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);

  // Stars
  const starsGeometry = new THREE.BufferGeometry();
  const starVertices: number[] = [];
  for (let i = 0; i < 5000; i++) {
    starVertices.push(
      (Math.random() - 0.5) * 3000,
      (Math.random() - 0.5) * 3000,
      (Math.random() - 0.5) * 3000
    );
  }
  starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3));
  const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3 });
  scene.add(new THREE.Points(starsGeometry, starsMaterial));

  // Marker group
  const markerGroup = new THREE.Group();
  markerGroupRef.current = markerGroup;
  scene.add(markerGroup);

  // Orbit controls
  const controls = new OrbitControls(camera, renderer.domElement) as any;
  controls.enableZoom = true;
  controls.enablePan = false;
  controls.zoomSpeed = 1.0;

  // Animation loop
// Animation loop
const animate = () => {
  requestAnimationFrame(animate);
  globe.rotation.y += 0.001;

  // Keep markers aligned with globe
  if (markerGroupRef.current) {
    markerGroupRef.current.rotation.y = globe.rotation.y;

    // Pulsing red markers
    markerGroupRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) {
          mat.forEach((m) => {
            if (m instanceof THREE.MeshBasicMaterial && m.color.getHexString() === "ff0000") {
              m.opacity = 0.5 + 0.5 * Math.sin(Date.now() * 0.005);
            }
          });
        } else if (mat instanceof THREE.MeshBasicMaterial && mat.color.getHexString() === "ff0000") {
          mat.opacity = 0.5 + 0.5 * Math.sin(Date.now() * 0.005);
        }
      }
    });
  }

  controls.update();
  renderer.render(scene, camera);
};

  animate();

  // ✅ Cleanup on unmount or re-render
  return () => {
    window.removeEventListener("resize", () => {});
    if (renderer && renderer.domElement && mountRef.current?.contains(renderer.domElement)) {
      mountRef.current.removeChild(renderer.domElement);
    }
    renderer.dispose();
  };
}, []);

  // Add markers
  useEffect(() => {
    if (!showLocations || !markerGroupRef.current) return;

    accessLogs.forEach((log) => {
      const markerId = log.user + log.timestamp;
      if (existingMarkersRef.current.has(markerId)) return;
      existingMarkersRef.current.add(markerId);

      const coords = branchCoords[log.branch];
      if (!coords) return;

      const phi = (90 - coords.lat) * (Math.PI / 180);
      const theta = (coords.lng + 180) * (Math.PI / 180);

      const x = R * Math.sin(phi) * Math.cos(theta);
      const y = R * Math.cos(phi);
      const z = R * Math.sin(phi) * Math.sin(theta);

      const isAlertActive = alerts.some(
        (alert) => alert.user === log.user && alert.timestamp === log.timestamp
      );

      // Marker
      const markerGeometry = new THREE.SphereGeometry(2.5, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: isAlertActive ? "red" : "lime",
        transparent: isAlertActive
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(x, y, z);

      // Label
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 128;
      const context = canvas.getContext("2d")!;
      context.font = "bold 40px Arial";
      context.fillStyle = "white";
      context.fillText(log.branch, 10, 60);
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(60, 30, 1);
      sprite.position.set(x * 1.05, y * 1.05, z * 1.05);

      markerGroupRef.current!.add(marker);
      markerGroupRef.current!.add(sprite);
    });
  }, [accessLogs, showLocations, alerts]);

  return <div ref={mountRef} className="w-full h-[600px]" />;
}
