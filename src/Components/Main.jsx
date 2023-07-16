import React, { useState, useRef, useEffect } from "react";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";

import axios from "axios";
import "../Components/Styles/Main.css";
import {
  Scene,
  Engine,
  Animation,
  Texture,
  MeshBuilder,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";

const Main = () => {
  const apiKey = process.env.GOOGLE_API_key;
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const sceneRef = useRef(null);
  const boxRef = useRef(null);
  const lightRef = useRef(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCX89qv9sY_W4tmANF6ObP-FztIAZSg3yo",
  });

  useEffect(() => {
    if (sceneRef.current) {
      engineRef.current.runRenderLoop(() => {
        sceneRef.current.render();
      });
    }
  }, [selectedLocation]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  const captureVisibleRegion = () => {
    if (selectedLocation) {
      const url = `https://maps.googleapis.com/maps/api/staticmap?center=${selectedLocation.lat},${selectedLocation.lng}&zoom=15&size=400x400&maptype=roadmap&format=png&visual_refresh=true&key=AIzaSyCX89qv9sY_W4tmANF6ObP-FztIAZSg3yo`;

      axios
        .get(url, { responseType: "blob" })
        .then((res) => {
          const blob = res.data;
          const img = new Image();
          img.onload = () => {
            const texture = new Texture(img.src, sceneRef.current);
            const material = new StandardMaterial(
              "box-material",
              sceneRef.current
            );
            material.diffuseTexture = texture;

            if (boxRef.current) {
              boxRef.current.material = material;
            }
          };
          img.src = URL.createObjectURL(blob);
        })
        .catch((err) => {
          console.log("Error ", err);
        });
    }
  };

  const onMapClick = (event) => {
    const { latLng } = event;
    const lat = latLng.lat();
    const lng = latLng.lng();
    setSelectedLocation({ lat, lng });
  };

  const onGoogleMapLoad = (map) => {
    mapRef.current = map;
    engineRef.current = new Engine(canvasRef.current, true);
    sceneRef.current = new Scene(engineRef.current);
    const camera = new ArcRotateCamera(
      "camera",
      5,
      0,
      10,
      new Vector3(0, 0, 0),
      sceneRef.current
    );
    sceneRef.current.activeCamera = camera;
    camera.attachControl(canvasRef.current, true);
    lightRef.current = new HemisphericLight(
      "light",
      new Vector3(0, 2, 0),
      sceneRef.current
    );
    boxRef.current = MeshBuilder.CreateBox(
      "box",
      { size: 4 },
      sceneRef.current
    );

    const boxMaterial = new StandardMaterial("box-material", sceneRef.current);
    boxMaterial.diffuseColor = Color3.White(); // Set the initial color to white

    if (boxRef.current) {
      boxRef.current.material = boxMaterial;
    }

    // Add more animations to the cuboid
    const animation1 = new Animation(
      "scaleAnimation",
      "scaling",
      20,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const scaleKeys = [];
    scaleKeys.push({
      frame: 0,
      value: new Vector3(1, 1, 1),
    });
    scaleKeys.push({
      frame: 100,
      value: new Vector3(2, 2, 2),
    });
    animation1.setKeys(scaleKeys);
    boxRef.current.animations.push(animation1);

    const animation2 = new Animation(
      "positionAnimation",
      "position",
      20,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const positionKeys = [];
    positionKeys.push({
      frame: 0,
      value: new Vector3(0, 0, 0),
    });
    positionKeys.push({
      frame: 100,
      value: new Vector3(0, 5, 0),
    });
    animation2.setKeys(positionKeys);
    boxRef.current.animations.push(animation2);

    sceneRef.current.beginAnimation(boxRef.current, 0, 100, true);
  };

  return (
    <>
      <div className="main">
        <div style={{ height: "400px", width: "40%" }}>
          <GoogleMap
            zoom={12}
            onClick={onMapClick}
            onLoad={onGoogleMapLoad}
            center={
              {
                lat: 17.3850,
                lng: 78.4867,
              } || undefined
            }
            mapContainerStyle={{
              height: "100%",
              width: "100%",
            }}
          >
            {selectedLocation && <Marker position={selectedLocation} />}
          </GoogleMap>
        </div>
        <canvas
          ref={canvasRef}
          style={{ marginLeft: "2rem", height: "300px", width: "40%" }}
        />
      </div>
      <div className="btn-wrapper">
        <button
          className="capture-button"
          onClick={captureVisibleRegion}
          disabled={!selectedLocation}
        >
         Apply Image
        </button>
      </div>
    </>
  );
};

export default Main;
