/**
 * HBD — HOME BOARD DESIGNER (V6.0.0)
 * Canvas de Renderizado 3D con Three.js (ThreeDCanvas)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Scene3DData,
  CameraPreset,
  SceneLightingMode,
  Scene3DLayerVisibility,
  Wall3D,
  Floor3D,
  Door3D,
  Window3D,
  Furniture3D,
} from '@hbd/shared';
import { Tool3D } from './Toolbox3D.js';
import { Selected3DEntity } from './PropertiesPanel3D.js';

interface ThreeDCanvasProps {
  sceneData: Scene3DData;
  activeTool: Tool3D;
  lightingMode: SceneLightingMode;
  activePreset?: CameraPreset;
  layerVisibility: Scene3DLayerVisibility;
  selectedEntity: Selected3DEntity;
  onSelectEntity: (entity: Selected3DEntity) => void;
  onFurnitureMoved?: (placementId: string, posX: number, posZ: number, rotationDeg: number) => void;
  onSnapshotReady?: (dataUrl: string) => void;
}

export const ThreeDCanvas: React.FC<ThreeDCanvasProps> = ({
  sceneData,
  activeTool,
  lightingMode,
  activePreset,
  layerVisibility,
  selectedEntity,
  onSelectEntity,
  onFurnitureMoved,
  onSnapshotReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Referencias a los componentes del motor Three.js
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Grupos de la escena
  const wallsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const floorsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const ceilingsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const doorsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const windowsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const furnitureGroupRef = useRef<THREE.Group>(new THREE.Group());
  const lightsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const measurementGroupRef = useRef<THREE.Group>(new THREE.Group());
  const selectionHelperRef = useRef<THREE.BoxHelper | null>(null);

  // Estados interactivos
  const [measurementPoints, setMeasurementPoints] = useState<THREE.Vector3[]>([]);
  const [laserDistanceM, setLaserDistanceM] = useState<number | null>(null);

  // Control de cámara Orbit (customizado sin dependencias externas)
  const orbitState = useRef({
    isDragging: false,
    isPanning: false,
    previousMouseX: 0,
    previousMouseY: 0,
    spherical: { radius: 15, theta: Math.PI / 4, phi: Math.PI / 3 },
    target: new THREE.Vector3(0, 0.8, 0),
  });

  // Control de Primera Persona (Walkthrough WASD)
  const fpsState = useRef({
    enabled: false,
    keys: { forward: false, backward: false, left: false, right: false },
    position: new THREE.Vector3(0, 1.7, 0),
    rotationY: 0,
    pitch: 0,
    speed: 3.5, // metros por segundo
  });

  // Mover muebles en 3D
  const dragFurnitureState = useRef<{
    active: boolean;
    placementId: string | null;
    plane: THREE.Plane;
    offset: THREE.Vector3;
    mesh: THREE.Object3D | null;
  }>({
    active: false,
    placementId: null,
    plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    offset: new THREE.Vector3(),
    mesh: null,
  });

  // 1. INICIALIZACIÓN DE LA ESCENA Y RENDERER THREE.JS
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // Escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(lightingMode === 'night' ? 0x090d16 : 0xf1f5f9);
    sceneRef.current = scene;

    // Cámara Perspectiva
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 14, 12);
    camera.lookAt(0, 0.8, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Añadir grupos a la escena
    scene.add(floorsGroupRef.current);
    scene.add(ceilingsGroupRef.current);
    scene.add(wallsGroupRef.current);
    scene.add(doorsGroupRef.current);
    scene.add(windowsGroupRef.current);
    scene.add(furnitureGroupRef.current);
    scene.add(lightsGroupRef.current);
    scene.add(measurementGroupRef.current);

    // Suelo infinito con rejilla suave
    const gridHelper = new THREE.GridHelper(50, 50, 0x94a3b8, 0xe2e8f0);
    gridHelper.position.y = -0.005;
    scene.add(gridHelper);

    // Loop de animación
    let lastTime = performance.now();
    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Actualizar control en primera persona si está activo
      if (fpsState.current.enabled && cameraRef.current) {
        const moveDist = fpsState.current.speed * delta;
        const forward = new THREE.Vector3(
          Math.sin(fpsState.current.rotationY),
          0,
          Math.cos(fpsState.current.rotationY)
        );
        const right = new THREE.Vector3(
          Math.sin(fpsState.current.rotationY + Math.PI / 2),
          0,
          Math.cos(fpsState.current.rotationY + Math.PI / 2)
        );

        const moveVec = new THREE.Vector3();
        if (fpsState.current.keys.forward) moveVec.add(forward.clone().multiplyScalar(-moveDist));
        if (fpsState.current.keys.backward) moveVec.add(forward.clone().multiplyScalar(moveDist));
        if (fpsState.current.keys.left) moveVec.add(right.clone().multiplyScalar(-moveDist));
        if (fpsState.current.keys.right) moveVec.add(right.clone().multiplyScalar(moveDist));

        // Comprobación de colisión del usuario con paredes 3D (evitar atravesar muros)
        const proposedPos = fpsState.current.position.clone().add(moveVec);
        let collides = false;

        sceneData.walls.forEach((w) => {
          const dist = distanceToSegment2D(
            proposedPos.x,
            proposedPos.z,
            w.startPoint.x,
            w.startPoint.z,
            w.endPoint.x,
            w.endPoint.z
          );
          if (dist < w.thicknessM / 2 + 0.35) {
            collides = true;
          }
        });

        if (!collides) {
          fpsState.current.position.copy(proposedPos);
        }

        cameraRef.current.position.copy(fpsState.current.position);
        const lookTarget = fpsState.current.position.clone().add(
          new THREE.Vector3(
            -Math.sin(fpsState.current.rotationY) * Math.cos(fpsState.current.pitch),
            Math.sin(fpsState.current.pitch),
            -Math.cos(fpsState.current.rotationY) * Math.cos(fpsState.current.pitch)
          )
        );
        cameraRef.current.lookAt(lookTarget);
      } else if (cameraRef.current) {
        // Orbit Controls Camera Update
        const s = orbitState.current.spherical;
        const x = s.radius * Math.sin(s.phi) * Math.sin(s.theta);
        const y = s.radius * Math.cos(s.phi);
        const z = s.radius * Math.sin(s.phi) * Math.cos(s.theta);

        cameraRef.current.position.set(
          orbitState.current.target.x + x,
          orbitState.current.target.y + y,
          orbitState.current.target.z + z
        );
        cameraRef.current.lookAt(orbitState.current.target);
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      renderer.dispose();
    };
  }, []);

  // 2. CONSTRUCCIÓN DE GEOMETRÍA Y ELEMENTOS 3D
  useEffect(() => {
    if (!sceneRef.current) return;

    // A. Actualizar Iluminación
    lightsGroupRef.current.clear();
    const isNight = lightingMode === 'night';
    sceneRef.current.background = new THREE.Color(isNight ? 0x0a0f1d : 0xf8fafc);

    sceneData.lights.forEach((l) => {
      if (l.type === 'ambient') {
        const amb = new THREE.AmbientLight(l.color, l.intensity);
        lightsGroupRef.current.add(amb);
      } else if (l.type === 'directional' && l.position) {
        const dir = new THREE.DirectionalLight(l.color, l.intensity);
        dir.position.set(l.position.x, l.position.y, l.position.z);
        dir.castShadow = l.castShadow ?? true;
        dir.shadow.mapSize.width = 2048;
        dir.shadow.mapSize.height = 2048;
        lightsGroupRef.current.add(dir);
      } else if (l.type === 'point' && l.position) {
        const pt = new THREE.PointLight(l.color, l.intensity, l.distance || 8, 2);
        pt.position.set(l.position.x, l.position.y, l.position.z);
        pt.castShadow = true;
        lightsGroupRef.current.add(pt);
      }
    });

    // B. Paredes 3D (Volumétricas con Grosor y Altura)
    wallsGroupRef.current.clear();
    sceneData.walls.forEach((w) => {
      const wallGeom = new THREE.BoxGeometry(w.lengthM, w.heightM, w.thicknessM);
      const wallMat = new THREE.MeshStandardMaterial({
        color: w.color || 0xf1f5f9,
        roughness: 0.85,
        metalness: 0.05,
        wireframe: layerVisibility.wireframe,
      });

      const wallMesh = new THREE.Mesh(wallGeom, wallMat);
      wallMesh.position.set(w.center.x, w.center.y, w.center.z);
      wallMesh.rotation.y = -w.rotationYRad;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      wallMesh.userData = { entityType: 'wall', data: w };

      wallsGroupRef.current.add(wallMesh);
    });

    // C. Suelos de Habitaciones (Polígonos 2D Triangulados)
    floorsGroupRef.current.clear();
    ceilingsGroupRef.current.clear();

    sceneData.floors.forEach((f) => {
      if (f.polygonVertices3D.length < 3) return;

      const shape = new THREE.Shape();
      f.polygonVertices3D.forEach((v, idx) => {
        if (idx === 0) shape.moveTo(v.x, v.z);
        else shape.lineTo(v.x, v.z);
      });
      shape.closePath();

      // Suelo
      const floorGeom = new THREE.ShapeGeometry(shape);
      const floorMat = new THREE.MeshStandardMaterial({
        color: f.floorColor || 0xb48a60,
        roughness: 0.45,
        metalness: 0.1,
        side: THREE.DoubleSide,
        wireframe: layerVisibility.wireframe,
      });

      const floorMesh = new THREE.Mesh(floorGeom, floorMat);
      floorMesh.rotation.x = Math.PI / 2;
      floorMesh.position.y = 0.01;
      floorMesh.receiveShadow = true;
      floorMesh.userData = { entityType: 'room', data: f };
      floorsGroupRef.current.add(floorMesh);

      // Techo
      const ceilingGeom = new THREE.ShapeGeometry(shape);
      const ceilingMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.95,
        side: THREE.DoubleSide,
      });
      const ceilingMesh = new THREE.Mesh(ceilingGeom, ceilingMat);
      ceilingMesh.rotation.x = Math.PI / 2;
      ceilingMesh.position.y = f.heightM;
      ceilingMesh.userData = { entityType: 'ceiling', data: f };
      ceilingsGroupRef.current.add(ceilingMesh);
    });

    // D. Puertas 3D (Marco + Hoja con Ángulo de Apertura)
    doorsGroupRef.current.clear();
    sceneData.doors.forEach((d) => {
      const doorGroup = new THREE.Group();
      doorGroup.position.set(d.position.x, 0, d.position.z);
      doorGroup.rotation.y = -d.rotationYRad;

      // Marco
      const frameGeom = new THREE.BoxGeometry(d.widthM + 0.06, d.heightM + 0.03, d.thicknessM + 0.04);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
      const frameMesh = new THREE.Mesh(frameGeom, frameMat);
      frameMesh.position.y = d.heightM / 2;

      // Hoja de la puerta (pivota sobre la bisagra)
      const swingRad = (d.swingAngleDeg * Math.PI) / 180;
      const leafGroup = new THREE.Group();
      leafGroup.position.set(-d.widthM / 2, 0, 0); // Posición del eje bisagra
      leafGroup.rotation.y = swingRad;

      const leafGeom = new THREE.BoxGeometry(d.widthM, d.heightM, d.thicknessM);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0xb48a60, roughness: 0.5 });
      const leafMesh = new THREE.Mesh(leafGeom, leafMat);
      leafMesh.position.set(d.widthM / 2, d.heightM / 2, 0);
      leafMesh.castShadow = true;

      // Picaporte
      const handleGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.1);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
      const handleMesh = new THREE.Mesh(handleGeom, handleMat);
      handleMesh.rotation.z = Math.PI / 2;
      handleMesh.position.set(d.widthM * 0.85, d.heightM * 0.48, 0.04);

      leafGroup.add(leafMesh);
      leafGroup.add(handleMesh);
      doorGroup.add(frameMesh);
      doorGroup.add(leafGroup);

      doorGroup.userData = { entityType: 'door', data: d };
      doorsGroupRef.current.add(doorGroup);
    });

    // E. Ventanas 3D (Marco + Cristal Translúcido)
    windowsGroupRef.current.clear();
    sceneData.windows.forEach((w) => {
      const winGroup = new THREE.Group();
      winGroup.position.set(w.position.x, w.position.y, w.position.z);
      winGroup.rotation.y = -w.rotationYRad;

      // Marco
      const frameGeom = new THREE.BoxGeometry(w.widthM, w.heightM, w.thicknessM);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
      const frameMesh = new THREE.Mesh(frameGeom, frameMat);

      // Cristal
      const glassGeom = new THREE.BoxGeometry(w.widthM * 0.9, w.heightM * 0.9, 0.015);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.4,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.85,
      });
      const glassMesh = new THREE.Mesh(glassGeom, glassMat);

      winGroup.add(frameMesh);
      winGroup.add(glassMesh);
      winGroup.userData = { entityType: 'window', data: w };
      windowsGroupRef.current.add(winGroup);
    });

    // F. Mobiliario 3D Paramétrico
    furnitureGroupRef.current.clear();
    sceneData.furniture.forEach((f) => {
      const furnGroup = new THREE.Group();
      furnGroup.position.set(f.position.x, f.position.y, f.position.z);
      furnGroup.rotation.y = -(f.rotationYDeg * Math.PI) / 180;
      furnGroup.name = `furniture_${f.placementId}`;

      // Renderizar partes procedurales del mueble
      f.parts.forEach((p) => {
        const partGeom = new THREE.BoxGeometry(p.dimensions.x, p.dimensions.y, p.dimensions.z);
        const partMat = new THREE.MeshStandardMaterial({
          color: p.color || f.color || 0x475569,
          roughness: p.roughness ?? 0.6,
          metalness: p.metalness ?? 0.1,
          wireframe: layerVisibility.wireframe,
        });

        const partMesh = new THREE.Mesh(partGeom, partMat);
        partMesh.position.set(p.position.x, p.position.y, p.position.z);
        partMesh.castShadow = true;
        partMesh.receiveShadow = true;
        furnGroup.add(partMesh);
      });

      furnGroup.userData = { entityType: 'furniture', data: f };
      furnitureGroupRef.current.add(furnGroup);
    });

    // Visibilidad de Capas
    wallsGroupRef.current.visible = layerVisibility.walls;
    floorsGroupRef.current.visible = layerVisibility.floors;
    ceilingsGroupRef.current.visible = layerVisibility.ceilings;
    doorsGroupRef.current.visible = layerVisibility.doors;
    windowsGroupRef.current.visible = layerVisibility.windows;
    furnitureGroupRef.current.visible = layerVisibility.furniture;
  }, [sceneData, lightingMode, layerVisibility]);

  // 3. SELECCIÓN VISUAL (Bounding Box Highlight)
  useEffect(() => {
    if (!sceneRef.current) return;

    if (selectionHelperRef.current) {
      sceneRef.current.remove(selectionHelperRef.current);
      selectionHelperRef.current = null;
    }

    if (selectedEntity && selectedEntity.type === 'furniture') {
      const furnMesh = furnitureGroupRef.current.getObjectByName(`furniture_${selectedEntity.data.placementId}`);
      if (furnMesh) {
        const helper = new THREE.BoxHelper(furnMesh, 0x10b981);
        sceneRef.current.add(helper);
        selectionHelperRef.current = helper;
      }
    }
  }, [selectedEntity]);

  // 4. ACTUALIZAR PRESET DE CÁMARA
  useEffect(() => {
    if (!activePreset || !cameraRef.current) return;

    if (activePreset.mode === 'first_person') {
      fpsState.current.enabled = true;
      fpsState.current.position.set(activePreset.position.x, activePreset.position.y, activePreset.position.z);
      cameraRef.current.position.copy(fpsState.current.position);
    } else {
      fpsState.current.enabled = false;
      const p = activePreset.position;
      const t = activePreset.target;
      orbitState.current.target.set(t.x, t.y, t.z);

      const dx = p.x - t.x;
      const dy = p.y - t.y;
      const dz = p.z - t.z;
      const radius = Math.hypot(dx, dy, dz);
      const phi = Math.acos(Math.min(1, Math.max(-1, dy / radius)));
      const theta = Math.atan2(dx, dz);

      orbitState.current.spherical = { radius, theta, phi };
    }
  }, [activePreset]);

  // 5. GESTIÓN DE EVENTOS DE RATÓN Y TECLADO (Orbit, Drag Muebles, Medir, WASD)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast para interacción
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    if (activeTool === 'measure') {
      const intersects = raycaster.intersectObjects(
        [...wallsGroupRef.current.children, ...floorsGroupRef.current.children, ...furnitureGroupRef.current.children],
        true
      );
      if (intersects.length > 0) {
        const pt = intersects[0].point;
        if (measurementPoints.length === 0) {
          setMeasurementPoints([pt]);
          setLaserDistanceM(null);
        } else {
          const ptA = measurementPoints[0];
          const dist = ptA.distanceTo(pt);
          setLaserDistanceM(dist);
          setMeasurementPoints([ptA, pt]);

          // Dibujar línea láser 3D
          measurementGroupRef.current.clear();
          const lineGeom = new THREE.BufferGeometry().setFromPoints([ptA, pt]);
          const lineMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 3 });
          const line = new THREE.Line(lineGeom, lineMat);
          measurementGroupRef.current.add(line);
        }
      }
      return;
    }

    if (activeTool === 'move' && selectedEntity?.type === 'furniture') {
      const furnMesh = furnitureGroupRef.current.getObjectByName(`furniture_${selectedEntity.data.placementId}`);
      if (furnMesh) {
        const intersects = raycaster.intersectObjects([furnMesh], true);
        if (intersects.length > 0) {
          dragFurnitureState.current.active = true;
          dragFurnitureState.current.placementId = selectedEntity.data.placementId;
          dragFurnitureState.current.mesh = furnMesh;
          dragFurnitureState.current.plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), furnMesh.position);

          const planeIntersect = new THREE.Vector3();
          raycaster.ray.intersectPlane(dragFurnitureState.current.plane, planeIntersect);
          dragFurnitureState.current.offset.subVectors(furnMesh.position, planeIntersect);
          return;
        }
      }
    }

    // Selección de entidad con Raycast
    const interactiveObjects = [
      ...furnitureGroupRef.current.children,
      ...doorsGroupRef.current.children,
      ...windowsGroupRef.current.children,
      ...wallsGroupRef.current.children,
      ...floorsGroupRef.current.children,
    ];

    const intersects = raycaster.intersectObjects(interactiveObjects, true);
    if (intersects.length > 0) {
      let topObj: THREE.Object3D | null = intersects[0].object;
      while (topObj && !topObj.userData.entityType && topObj.parent) {
        topObj = topObj.parent;
      }

      if (topObj && topObj.userData.entityType) {
        const type = topObj.userData.entityType;
        const data = topObj.userData.data;

        if (type === 'furniture') onSelectEntity({ type: 'furniture', data });
        else if (type === 'room') onSelectEntity({ type: 'room', data });
        else if (type === 'wall') onSelectEntity({ type: 'wall', data });
        else if (type === 'door') onSelectEntity({ type: 'door', data });
        else if (type === 'window') onSelectEntity({ type: 'window', data });
      }
    } else {
      if (e.button === 0) onSelectEntity(null);
    }

    // Iniciar arrastre de cámara Orbit
    if (e.button === 0) orbitState.current.isDragging = true;
    if (e.button === 2) orbitState.current.isPanning = true;
    orbitState.current.previousMouseX = e.clientX;
    orbitState.current.previousMouseY = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current) return;

    // Arrastre activo de Mueble en plano X/Z
    if (dragFurnitureState.current.active && dragFurnitureState.current.mesh) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);
      const intersection = new THREE.Vector3();

      if (raycaster.ray.intersectPlane(dragFurnitureState.current.plane, intersection)) {
        const newPos = intersection.add(dragFurnitureState.current.offset);
        dragFurnitureState.current.mesh.position.x = newPos.x;
        dragFurnitureState.current.mesh.position.z = newPos.z;

        if (selectionHelperRef.current) selectionHelperRef.current.update();
      }
      return;
    }

    // Orbit Navigation
    const deltaX = e.clientX - orbitState.current.previousMouseX;
    const deltaY = e.clientY - orbitState.current.previousMouseY;
    orbitState.current.previousMouseX = e.clientX;
    orbitState.current.previousMouseY = e.clientY;

    if (fpsState.current.enabled && orbitState.current.isDragging) {
      fpsState.current.rotationY -= deltaX * 0.005;
      fpsState.current.pitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, fpsState.current.pitch - deltaY * 0.005));
    } else if (orbitState.current.isDragging) {
      orbitState.current.spherical.theta -= deltaX * 0.008;
      orbitState.current.spherical.phi = Math.max(
        0.05,
        Math.min(Math.PI / 2 - 0.02, orbitState.current.spherical.phi - deltaY * 0.008)
      );
    } else if (orbitState.current.isPanning) {
      const panSpeed = 0.015 * (orbitState.current.spherical.radius / 10);
      orbitState.current.target.x -= deltaX * panSpeed;
      orbitState.current.target.z += deltaY * panSpeed;
    }
  };

  const handlePointerUp = () => {
    if (dragFurnitureState.current.active && dragFurnitureState.current.mesh && dragFurnitureState.current.placementId) {
      const mesh = dragFurnitureState.current.mesh;
      const pid = dragFurnitureState.current.placementId;
      const newX = mesh.position.x;
      const newZ = mesh.position.z;
      const rotDeg = Math.round((-mesh.rotation.y * 180) / Math.PI);

      if (onFurnitureMoved) onFurnitureMoved(pid, newX, newZ, rotDeg);

      dragFurnitureState.current.active = false;
      dragFurnitureState.current.placementId = null;
      dragFurnitureState.current.mesh = null;
    }

    orbitState.current.isDragging = false;
    orbitState.current.isPanning = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    orbitState.current.spherical.radius = Math.max(1.5, Math.min(100, orbitState.current.spherical.radius * zoomFactor));
  };

  // 6. TECLAS PARA PRIMERA PERSONA (WASD)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') fpsState.current.keys.forward = true;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') fpsState.current.keys.backward = true;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') fpsState.current.keys.left = true;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') fpsState.current.keys.right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') fpsState.current.keys.forward = false;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') fpsState.current.keys.backward = false;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') fpsState.current.keys.left = false;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') fpsState.current.keys.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none outline-none"
    >
      {/* Cota láser flotante */}
      {laserDistanceM !== null && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-300 shadow-2xl flex items-center gap-2">
          <span>Distancia Láser:</span>
          <span className="font-mono text-sm text-white">{laserDistanceM.toFixed(2)} m</span>
          <span className="text-slate-400 font-normal">({Math.round(laserDistanceM * 100)} cm)</span>
        </div>
      )}

      {/* Indicador Modo Recorrido */}
      {activeTool === 'walkthrough' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-amber-950/90 border border-amber-500/50 px-4 py-2 rounded-xl text-xs text-amber-200 shadow-2xl flex items-center gap-3">
          <span className="font-semibold">🚶 Modo Recorrido Activo:</span>
          <span>Usa [W][A][S][D] para caminar y arrastra el ratón para mirar.</span>
        </div>
      )}
    </div>
  );
};

function distanceToSegment2D(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}
