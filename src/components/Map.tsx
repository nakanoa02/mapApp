import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// デフォルトの位置（東京）
const DEFAULT_POSITION = { lat: 35.6895, lng: 139.6917 };

// マップの中心を変更するコンポーネント
const ChangeMapCenter: React.FC<{ position: { lat: number; lng: number } }> = ({
  position,
}) => {
  const map = useMap();
  map.setView(position, 13);
  return null;
};

const Map: React.FC = () => {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [input, setInput] = useState("");

  // 住所または郵便番号をジオコーディング
  const handleSearch = async () => {
    if (!input.trim()) return;

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          input
        )}`
      );

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setPosition({ lat: parseFloat(lat), lng: parseFloat(lon) });
      } else {
        alert("場所が見つかりませんでした");
      }
    } catch (error) {
      console.error("ジオコーディングエラー:", error);
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* 検索ボックス */}
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="住所または郵便番号を入力"
          style={{ padding: "5px", marginRight: "5px" }}
        />
        <button onClick={handleSearch}>検索</button>
      </div>

      {/* 地図コンポーネント */}
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} />
        <ChangeMapCenter position={position} />
      </MapContainer>
    </div>
  );
};

export default Map;
