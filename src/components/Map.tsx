import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const DEFAULT_POSITION = { lat: 35.6895, lng: 139.6917 };

// マップの中心を変更するコンポーネント（ズームレベルを維持）
const ChangeMapCenter: React.FC<{ position: { lat: number; lng: number } }> = ({
  position,
}) => {
  const map = useMap();
  map.setView(position, map.getZoom()); // 現在のズームレベルを維持
  return null;
};

// クリックでピンを立てるコンポーネント
const ClickToAddPin: React.FC<{
  onAddPin: (lat: number, lng: number) => void;
}> = ({ onAddPin }) => {
  let clickTimeout: NodeJS.Timeout | null = null;

  useMapEvents({
    click: (event) => {
      if (clickTimeout) clearTimeout(clickTimeout);

      clickTimeout = setTimeout(() => {
        onAddPin(event.latlng.lat, event.latlng.lng);
      }, 250); // 250ms 以内に dblclick が発生しなければピンを設置
    },
    dblclick: () => {
      if (clickTimeout) clearTimeout(clickTimeout); // ダブルクリック時はピン設置をキャンセル
    },
  });

  return null;
};

const Map: React.FC = () => {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [input, setInput] = useState("");
  const [pins, setPins] = useState<
    { lat: number; lng: number; note: string }[]
  >([]);
  const [searchResult, setSearchResult] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

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
        const newPosition = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setPosition(newPosition);
        setSearchResult(newPosition); // 検索結果を保存
      } else {
        alert("場所が見つかりませんでした");
      }
    } catch (error) {
      console.error("ジオコーディングエラー:", error);
    }
  };

  // ピンの追加処理
  const handleAddPin = (lat: number, lng: number) => {
    const note = prompt("メモを入力してください:");
    if (note !== null) {
      setPins((prevPins) => [...prevPins, { lat, lng, note }]);
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
        center={DEFAULT_POSITION} // 初期位置を固定
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* シングルクリックでピン設置 */}
        <ClickToAddPin onAddPin={handleAddPin} />
        {/* 検索時の地図移動（ズームレベル維持） */}
        <ChangeMapCenter position={position} />

        {/* 検索結果のマーカー（クリックでピン追加） */}
        {searchResult && (
          <Marker
            position={searchResult}
            eventHandlers={{
              click: () => handleAddPin(searchResult.lat, searchResult.lng),
            }}
          >
            <Popup>検索結果（クリックでピン追加）</Popup>
          </Marker>
        )}

        {/* 設置したピンを表示 */}
        {pins.map((pin, index) => (
          <Marker key={index} position={{ lat: pin.lat, lng: pin.lng }}>
            <Popup>{pin.note}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
