import { Fragment, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Html } from "@react-three/drei";

function App() {
  const [selectedMesh, setSelectedMesh] = useState(null);

  return (
    <Canvas style={{ width: "100vw", height: "100vh" }}>
      <PerspectiveCamera makeDefault position={[0, -50, 20]} />
      <directionalLight castShadow position={[-20, 0, 20]} intensity={4} />
      <directionalLight castShadow position={[20, 0, -20]} intensity={4} />
      <ambientLight intensity={0.6} />
      <Scene boxCount={12} boxPosCount={2} mesh={selectedMesh} />
      <Raycaster setSelectedMesh={setSelectedMesh} />
      <OrbitControls
        enableDamping={true}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
      />
      {selectedMesh && <Detail mesh={selectedMesh} />}
      {selectedMesh && <HighlightMesh mesh={selectedMesh} color={0xff0000} />}
    </Canvas>
  );
}

function Scene({ boxCount, boxPosCount = 1, mesh }) {
  if (boxPosCount > 2) {
    throw new Error("The boxPosCount cannot exceed 2.");
  }
  if (boxCount < boxPosCount) {
    throw new Error("A boxCount must be equal to or greater than boxPosCount.");
  }

  const BOX_ARR = Array.from(
    { length: boxCount },
    (_, index) => `BOX${index + 1}`
  );
  const boxSize = 6;
  const boxHeight = boxSize * 2;
  const boxZCount = boxPosCount;
  const boxPosXCount = Math.floor(boxCount / boxZCount);
  const boxPosZOffset = 8;
  const boxPosXffset = 2;

  const floorPadding = 2;
  const containerWidth =
    (boxSize + boxPosXffset) * boxPosXCount - boxPosXffset + floorPadding * 2;
  const containerLength =
    (boxSize + boxPosZOffset) * boxZCount - boxPosZOffset + floorPadding * 2;

  const getBoxPosX = (index) => {
    return (
      Math.floor(index % boxPosXCount) * (boxSize + boxPosXffset) -
      Math.floor(containerWidth / 2) +
      Math.floor(boxSize / 2) +
      floorPadding
    );
  };
  const boxPosY = Math.floor(boxHeight / 2) + 0.5;
  const getBoxPosZ = (index) => {
    const value =
      -Math.floor(index / boxPosXCount) * (boxSize + boxPosZOffset) -
      Math.floor(containerLength / 2) +
      Math.floor(boxSize / 2) +
      floorPadding;
    return boxZCount > 1 ? value + (boxSize + boxPosZOffset) : value;
  };

  const props = {
    onPointerDown: (e) =>
      console.log(
        "pointer down " + e.object.name,
        e.object.position.x,
        e.object.position.y,
        e.object.position.z
      ),
    onPointerUp: (e) => console.log("pointer up " + e.object.name),
    onPointerOver: (e) => console.log("pointer over " + e.object.name),
    onPointerOut: (e) => console.log("pointer out " + e.object.name),
  };

  return (
    <group position={[0, -5, 0]} rotation={[0, -0.6, 0]}>
      {BOX_ARR.map((value, index) => (
        <Fragment key={value}>
          <Box
            name={value}
            position={[getBoxPosX(index), boxPosY, getBoxPosZ(index)]}
            size={boxSize}
            height={boxHeight}
            color="blue"
            userData={{ clickable: true }}
          />
          {mesh?.name === value && (
            <Name
              name={value}
              position={[getBoxPosX(index), boxPosY, getBoxPosZ(index)]}
            />
          )}
        </Fragment>
      ))}
      <Container
        width={containerWidth}
        length={containerLength}
        color="white"
        userData={{ clickable: false }}
      />
    </group>
  );
}

function Box({ name, position, size, height, color, ...props }) {
  return (
    <mesh visible name={name} position={position} {...props}>
      <boxGeometry args={[size, height, size]} />
      <meshStandardMaterial color={color} transparent />
    </mesh>
  );
}

function Container({ width, length, color, ...props }) {
  return (
    <>
      <mesh visible name={"floor"} position={[0, 0, 0]} {...props}>
        <boxGeometry args={[width, 1, length]} />
        <meshStandardMaterial color={color} transparent />
      </mesh>
    </>
  );
}

function Detail({ mesh }) {
  return (
    <Html
      position={new THREE.Vector2(0, 0)}
      style={{
        width: "100vw",
        background: "white",
        padding: "10px",
        color: "black",
      }}
    >
      {`${mesh.name} is selected`}
    </Html>
  );
}

function Name({ name, position }) {
  return (
    <Html
      position={position}
      style={{
        transform: "translate(-50%, -350%)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "150px",
          height: "40px",
          color: "white",
          backgroundColor: "black",
          padding: "10px",
        }}
      >
        {name}
      </div>
    </Html>
  );
}

function Raycaster({ setSelectedMesh }) {
  const { camera, gl, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const hoveredMesh = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const canvasBounds = gl.domElement.getBoundingClientRect();
      const canvasX = event.clientX - canvasBounds.left;
      const canvasY = event.clientY - canvasBounds.top;

      mouse.current.x = (canvasX / canvasBounds.width) * 2 - 1;
      mouse.current.y = -((canvasY / canvasBounds.height) * 2 - 1);
      // mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      // mouse.current.y = -((event.clientY / window.innerHeight) * 2 - 1);

      raycaster.current.setFromCamera(mouse.current, camera);

      const intersects = raycaster.current.intersectObjects(scene.children);
      if (intersects.length > 0 && intersects[0].object.userData.clickable) {
        document.body.style.cursor = "pointer";
        hoveredMesh.current = intersects[0].object;
      } else {
        document.body.style.cursor = "default";
        hoveredMesh.current = null;
      }
    };

    const handleMouseClick = (event) => {
      if (hoveredMesh.current) {
        setSelectedMesh(hoveredMesh.current);
      } else {
        setSelectedMesh(null);
      }
    };

    gl.domElement.addEventListener("mousemove", handleMouseMove);
    gl.domElement.addEventListener("click", handleMouseClick);

    return () => {
      gl.domElement.removeEventListener("mousemove", handleMouseMove);
      gl.domElement.removeEventListener("click", handleMouseClick);
    };
  }, [camera, gl, scene, hoveredMesh.current]);

  return null;
}

function HighlightMesh({ mesh, color }) {
  useEffect(() => {
    if (mesh) {
      mesh.material.emissive = new THREE.Color(color);
      mesh.material.emissiveIntensity = 0.9;
    }

    return () => {
      if (mesh) {
        mesh.material.emissive = new THREE.Color(0x000000);
        mesh.material.emissiveIntensity = 1.0;
      }
    };
  }, [mesh]);

  return null;
}

export default App;
