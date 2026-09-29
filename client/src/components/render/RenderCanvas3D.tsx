/**
 * HBD — HOME BOARD DESIGNER (V7.0.0)
 * Canvas de Visualización y Renderizado Arquitectónico (RenderCanvas3D)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import {
  Scene3DData,
  SceneDefinition,
  RenderQuality,
  RenderResolution,
  ResolutionConfig,
  SceneEngine,
  RenderEngine,
} from '@hbd/shared';

export interface RenderCanvas3DHandle {
  captureRender: (
    resConfig: ResolutionConfig,
    quality: RenderQuality,
    onProgress: (pct: number, stage: string) => void
  ) => Promise<string>;
}

interface RenderCanvas3DProps {
  scene3D: Scene3DData;
  activeScene: SceneDefinition;
  isFullscreen: boolean;
  onExitFullscreen?: () => void;
}

export const RenderCanvas3D = forwardRef<RenderCanvas3DHandle, RenderCanvas3DProps>(
  ({ scene3D, activeScene, isFullscreen, onExitFullscreen }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const animFrameRef = useRef<number | null>(null);

    // Grupos de la escena
    const wallsGroupRef = useRef<THREE.Group>(new THREE.Group());
    const floorsGroupRef = useRef<THREE.Group>(new THREE.Group());
    const ceilingsGroupRef = useRef<THREE.Group>(new THREE.Group());
    const doorsGroupRef = useRef<THREE.Group>(new THREE.Group());
    const windowsGroupRef = useRef<THREE.Group>(new THREE.Group());
    const furnitureGroupRef = useRef<THREE.Group>(new THREE.Group());
    const lightsGroupRef = useRef<THREE.Group>(new THREE.Group());

    // Orbit State
    const orbitState = useRef({
      isDragging: false,
      isPanning: false,
      prevX: 0,
      prevY: 0,
      spherical: { radius: 14, theta: Math.PI / 4, phi: Math.PI / 3 },
      target: new THREE.Vector3(0, 0.8, 0),
    });

    // 1. INICIALIZACIÓN THREE.JS
    useEffect(() => {
      if (!containerRef.current) return;

      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(activeScene.camera.fov || 50, w / h, 0.1, 1000);
      camera.position.set(activeScene.camera.position.x, activeScene.camera.position.y, activeScene.camera.position.z);
      camera.lookAt(activeScene.camera.target.x, activeScene.camera.target.y, activeScene.camera.target.z);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0 + (activeScene.postProcessing?.exposure || 0) * 0.2;

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      scene.add(floorsGroupRef.current);
      scene.add(ceilingsGroupRef.current);
      scene.add(wallsGroupRef.current);
      scene.add(doorsGroupRef.current);
      scene.add(windowsGroupRef.current);
      scene.add(furnitureGroupRef.current);
      scene.add(lightsGroupRef.current);

      // Suelo reflectivo exterior sutil
      const groundGeom = new THREE.PlaneGeometry(100, 100);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.8,
        metalness: 0.1,
      });
      const groundMesh = new THREE.Mesh(groundGeom, groundMat);
      groundMesh.rotation.x = -Math.PI / 2;
      groundMesh.position.y = -0.01;
      groundMesh.receiveShadow = true;
      scene.add(groundMesh);

      // Animation loop
      const animate = () => {
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);

      const handleResize = () => {
        if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        renderer.dispose();
      };
    }, []);

    // 2. ACTUALIZACIÓN DE GEOMETRÍA, MATERIALES Y VARIANTES DE DISEÑO
    useEffect(() => {
      if (!sceneRef.current) return;

      // Obtener overrides de la variante activa
      const activeVariant = activeScene.designVariants.find(
        (v) => v.id === activeScene.activeVariantId
      );
      const overrides = activeVariant?.materialOverrides || {};

      // A. Iluminación y Sol
      lightsGroupRef.current.clear();
      const isNight = activeScene.lighting.mode === 'night';
      const isSunset = activeScene.lighting.mode === 'sunset';

      sceneRef.current.background = new THREE.Color(
        isNight ? 0x070b14 : isSunset ? 0x1e1b4b : 0xf8fafc
      );

      // Luz Ambiental
      const ambLight = new THREE.AmbientLight(
        activeScene.lighting.ambientColorHex || (isNight ? '#1e293b' : '#f8fafc'),
        activeScene.lighting.ambientIntensity
      );
      lightsGroupRef.current.add(ambLight);

      // Sol
      const sunPos = SceneEngine.calculateSunPosition(activeScene.lighting.timeOfDay);
      const sunRad = (sunPos.azimuthDeg * Math.PI) / 180;
      const elevRad = (sunPos.elevationDeg * Math.PI) / 180;
      const sunDist = 35;

      const sunX = sunDist * Math.cos(elevRad) * Math.sin(sunRad);
      const sunY = Math.max(2, sunDist * Math.sin(elevRad));
      const sunZ = sunDist * Math.cos(elevRad) * Math.cos(sunRad);

      const sunLight = new THREE.DirectionalLight(
        sunPos.colorHex,
        activeScene.lighting.sunIntensity * (isNight ? 0.15 : 1.2)
      );
      sunLight.position.set(sunX, sunY, sunZ);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 4096;
      sunLight.shadow.mapSize.height = 4096;
      sunLight.shadow.bias = -0.0001;
      lightsGroupRef.current.add(sunLight);

      // Luces Artificiales interiores
      (activeScene.lighting.artificialLights || []).forEach((art) => {
        const pLight = new THREE.PointLight(
          SceneEngine.colorTempToHex(art.colorTempK),
          isNight ? art.intensity * 1.5 : art.intensity,
          art.distanceM || 8,
          2
        );
        pLight.position.set(art.position.x, art.position.y, art.position.z);
        pLight.castShadow = true;
        lightsGroupRef.current.add(pLight);
      });

      // B. Paredes 3D con acabados
      wallsGroupRef.current.clear();
      const wallMatColor = overrides['all_walls'] || '#f1f5f9';

      scene3D.walls.forEach((w) => {
        const wallGeom = new THREE.BoxGeometry(w.lengthM, w.heightM, w.thicknessM);
        const wallMat = new THREE.MeshStandardMaterial({
          color: overrides[`wall_${w.id}`] || wallMatColor,
          roughness: 0.88,
          metalness: 0.05,
        });
        const wallMesh = new THREE.Mesh(wallGeom, wallMat);
        wallMesh.position.set(w.center.x, w.center.y, w.center.z);
        wallMesh.rotation.y = -w.rotationYRad;
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        wallsGroupRef.current.add(wallMesh);
      });

      // C. Suelos y Techos con acabados por habitación
      floorsGroupRef.current.clear();
      ceilingsGroupRef.current.clear();
      const defaultFloorColor = overrides['all_floors'] || '#b48a60';
      const defaultCeilingColor = overrides['all_ceilings'] || '#ffffff';

      scene3D.floors.forEach((f) => {
        if (f.polygonVertices3D.length < 3) return;
        const shape = new THREE.Shape();
        f.polygonVertices3D.forEach((v, idx) => {
          if (idx === 0) shape.moveTo(v.x, v.z);
          else shape.lineTo(v.x, v.z);
        });
        shape.closePath();

        const floorGeom = new THREE.ShapeGeometry(shape);
        const floorMat = new THREE.MeshStandardMaterial({
          color: overrides[`room_${f.id}`] || defaultFloorColor,
          roughness: 0.35,
          metalness: 0.1,
          side: THREE.DoubleSide,
        });
        const floorMesh = new THREE.Mesh(floorGeom, floorMat);
        floorMesh.rotation.x = Math.PI / 2;
        floorMesh.position.y = 0.01;
        floorMesh.receiveShadow = true;
        floorsGroupRef.current.add(floorMesh);

        // Techo
        const ceilingGeom = new THREE.ShapeGeometry(shape);
        const ceilingMat = new THREE.MeshStandardMaterial({
          color: defaultCeilingColor,
          roughness: 0.95,
          side: THREE.DoubleSide,
        });
        const ceilingMesh = new THREE.Mesh(ceilingGeom, ceilingMat);
        ceilingMesh.rotation.x = Math.PI / 2;
        ceilingMesh.position.y = f.heightM;
        ceilingsGroupRef.current.add(ceilingMesh);
      });

      // D. Puertas 3D
      doorsGroupRef.current.clear();
      scene3D.doors.forEach((d) => {
        const doorGroup = new THREE.Group();
        doorGroup.position.set(d.position.x, 0, d.position.z);
        doorGroup.rotation.y = -d.rotationYRad;

        const frameGeom = new THREE.BoxGeometry(d.widthM + 0.06, d.heightM + 0.03, d.thicknessM + 0.04);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
        const frameMesh = new THREE.Mesh(frameGeom, frameMat);
        frameMesh.position.y = d.heightM / 2;

        const swingRad = (d.swingAngleDeg * Math.PI) / 180;
        const leafGroup = new THREE.Group();
        leafGroup.position.set(-d.widthM / 2, 0, 0);
        leafGroup.rotation.y = swingRad;

        const leafGeom = new THREE.BoxGeometry(d.widthM, d.heightM, d.thicknessM);
        const leafMat = new THREE.MeshStandardMaterial({ color: 0xb48a60, roughness: 0.45 });
        const leafMesh = new THREE.Mesh(leafGeom, leafMat);
        leafMesh.position.set(d.widthM / 2, d.heightM / 2, 0);
        leafMesh.castShadow = true;

        leafGroup.add(leafMesh);
        doorGroup.add(frameMesh);
        doorGroup.add(leafGroup);
        doorsGroupRef.current.add(doorGroup);
      });

      // E. Ventanas 3D con Cristal y Luz Natural
      windowsGroupRef.current.clear();
      scene3D.windows.forEach((w) => {
        const winGroup = new THREE.Group();
        winGroup.position.set(w.position.x, w.position.y, w.position.z);
        winGroup.rotation.y = -w.rotationYRad;

        const frameGeom = new THREE.BoxGeometry(w.widthM, w.heightM, w.thicknessM);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
        const frameMesh = new THREE.Mesh(frameGeom, frameMat);

        const glassGeom = new THREE.BoxGeometry(w.widthM * 0.9, w.heightM * 0.9, 0.015);
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: 0xbae6fd,
          transparent: true,
          opacity: 0.45,
          roughness: 0.1,
          metalness: 0.1,
          transmission: 0.85,
        });
        const glassMesh = new THREE.Mesh(glassGeom, glassMat);

        winGroup.add(frameMesh);
        winGroup.add(glassMesh);
        windowsGroupRef.current.add(winGroup);
      });

      // F. Mobiliario 3D
      furnitureGroupRef.current.clear();
      const defaultFurnitureColor = overrides['all_furniture'] || '#475569';

      scene3D.furniture.forEach((f) => {
        const furnGroup = new THREE.Group();
        furnGroup.position.set(f.position.x, f.position.y, f.position.z);
        furnGroup.rotation.y = -(f.rotationYDeg * Math.PI) / 180;

        f.parts.forEach((p) => {
          const partGeom = new THREE.BoxGeometry(p.dimensions.x, p.dimensions.y, p.dimensions.z);
          const partMat = new THREE.MeshStandardMaterial({
            color: overrides[`furn_${f.placementId}`] || p.color || defaultFurnitureColor,
            roughness: 0.6,
            metalness: 0.1,
          });
          const partMesh = new THREE.Mesh(partGeom, partMat);
          partMesh.position.set(p.position.x, p.position.y, p.position.z);
          partMesh.castShadow = true;
          partMesh.receiveShadow = true;
          furnGroup.add(partMesh);
        });

        furnitureGroupRef.current.add(furnGroup);
      });
    }, [scene3D, activeScene]);

    // 3. ACTUALIZACIÓN DE CÁMARA Y POSTPROCESADO
    useEffect(() => {
      if (!cameraRef.current || !rendererRef.current) return;

      const c = activeScene.camera;
      cameraRef.current.position.set(c.position.x, c.position.y, c.position.z);
      cameraRef.current.lookAt(c.target.x, c.target.y, c.target.z);
      cameraRef.current.fov = c.fov || 50;
      cameraRef.current.updateProjectionMatrix();

      // Ajustar Exposición
      rendererRef.current.toneMappingExposure =
        1.0 + (activeScene.postProcessing?.exposure || 0) * 0.2;
    }, [activeScene.camera, activeScene.postProcessing]);

    // 4. MÉTODO EXPORTADO PARA RENDER DE ALTA CALIDAD ASÍNCRONO
    useImperativeHandle(ref, () => ({
      async captureRender(resConfig, quality, onProgress) {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
          throw new Error('Renderer no inicializado.');
        }

        const originalWidth = rendererRef.current.domElement.width;
        const originalHeight = rendererRef.current.domElement.height;
        const originalPixelRatio = rendererRef.current.getPixelRatio();

        try {
          onProgress(15, 'Preparando Geometría & Escena 3D...');
          await new Promise((r) => setTimeout(r, 100));

          onProgress(40, 'Calculando Iluminación Global & Sombras...');
          await new Promise((r) => setTimeout(r, 150));

          // Ajustar resolución de render temporal
          const targetW = resConfig.width;
          const targetH = resConfig.height;

          rendererRef.current.setPixelRatio(1);
          rendererRef.current.setSize(targetW, targetH, false);
          cameraRef.current.aspect = targetW / targetH;
          cameraRef.current.updateProjectionMatrix();

          onProgress(70, 'Muestreo PBR & Oclusión Ambiental...');
          await new Promise((r) => setTimeout(r, 150));

          rendererRef.current.render(sceneRef.current, cameraRef.current);

          onProgress(90, 'Aplicando Postprocesado & Corrección de Color...');
          await new Promise((r) => setTimeout(r, 100));

          const dataUrl = rendererRef.current.domElement.toDataURL('image/png');

          onProgress(100, 'Renderizado Completado.');
          return dataUrl;
        } finally {
          // Restaurar viewport interactivo
          if (containerRef.current && rendererRef.current && cameraRef.current) {
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            rendererRef.current.setPixelRatio(originalPixelRatio);
            rendererRef.current.setSize(w, h);
            cameraRef.current.aspect = w / h;
            cameraRef.current.updateProjectionMatrix();
          }
        }
      },
    }));

    // Interacción Orbit con ratón
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button === 0) orbitState.current.isDragging = true;
      if (e.button === 2) orbitState.current.isPanning = true;
      orbitState.current.prevX = e.clientX;
      orbitState.current.prevY = e.clientY;
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!cameraRef.current) return;
      const dx = e.clientX - orbitState.current.prevX;
      const dy = e.clientY - orbitState.current.prevY;
      orbitState.current.prevX = e.clientX;
      orbitState.current.prevY = e.clientY;

      if (orbitState.current.isDragging) {
        orbitState.current.spherical.theta -= dx * 0.008;
        orbitState.current.spherical.phi = Math.max(
          0.05,
          Math.min(Math.PI / 2 - 0.05, orbitState.current.spherical.phi - dy * 0.008)
        );

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
      } else if (orbitState.current.isPanning) {
        const panSpeed = 0.015 * (orbitState.current.spherical.radius / 10);
        orbitState.current.target.x -= dx * panSpeed;
        orbitState.current.target.z += dy * panSpeed;
      }
    };

    const handlePointerUp = () => {
      orbitState.current.isDragging = false;
      orbitState.current.isPanning = false;
    };

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
      if (!cameraRef.current) return;
      e.preventDefault();
      const zoom = e.deltaY > 0 ? 1.08 : 0.92;
      orbitState.current.spherical.radius = Math.max(
        1.5,
        Math.min(80, orbitState.current.spherical.radius * zoom)
      );

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
    };

    // Estilos de Postprocesado visual
    const pp = activeScene.postProcessing || {
      exposure: 0,
      contrast: 1,
      brightness: 0,
      saturation: 1,
      vignette: 0,
    };
    const filterStyle = `contrast(${pp.contrast}) brightness(${1 + pp.brightness}) saturate(${pp.saturation})`;

    return (
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        style={{ filter: filterStyle }}
        className="w-full h-full relative cursor-grab active:cursor-grabbing select-none outline-none overflow-hidden"
      >
        {/* Viñeta sutil si está configurada */}
        {pp.vignette > 0 && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              boxShadow: `inset 0 0 ${pp.vignette * 180}px rgba(0,0,0,0.85)`,
            }}
          />
        )}

        {isFullscreen && onExitFullscreen && (
          <button
            onClick={onExitFullscreen}
            className="absolute top-4 right-4 z-30 bg-slate-900/90 text-white border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xl hover:bg-slate-800 transition-colors"
          >
            Salir de Presentación (ESC)
          </button>
        )}
      </div>
    );
  }
);
