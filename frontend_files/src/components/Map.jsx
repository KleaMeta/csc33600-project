import { MapContainer, TileLayer, Marker, Popup, useMapEvents} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '@luomus/leaflet-smooth-wheel-zoom';
import L from 'leaflet';
import { useEffect, useState } from 'react';


const createChefIcon = (name, zoom) => {
const w = Math.max(6, (zoom - 8) * 4);
const h = w * 1.64; // maintain pin aspect ratio


  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center;">
        <img 
          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png"
          style="width:${w}px; height:${h}px; opacity:0.75; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));"        />
        ${zoom >= 11 ? `<span style="
          margin-top: 2px;
          font-size: ${Math.max(9, zoom - 2)}px;
          font-weight: 600;
          color: #1a1a1a;
          white-space: nowrap;
          text-shadow: 0 0 3px white, 0 0 3px white;
        ">${name}</span>` : ''}
      </div>
    `,
    iconAnchor: [w / 2, h],
  });
};


function ChefMarkers({ chefs }) {
  const [zoom, setZoom] = useState(10);

  useMapEvents({
    zoomend: (e) => setZoom(e.target.getZoom()),
  });

  return chefs.map(chef => (
    <Marker
      key={chef.chef_id}
      position={[chef.latitude, chef.longitude]}
      icon={createChefIcon(chef.name, zoom)}
    >
      <Popup>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'}}>
            <img 
                src={chef.profile_pic_file_path}
                style={{width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover'}}
            />
            
            <strong>{chef.name}</strong>
                <span>{chef.address}</span>
            </div>
        </Popup>
    </Marker>
  ));
}

export default function Map() {
    const [chefs, setChefs] = useState([]);

    useEffect(() => {
    fetch('http://localhost:8000/api/chefs')
      .then(res => res.json())
      .then(data => setChefs(data));
  }, []);
  

    return (
    <MapContainer 
        center={[40.8196, -73.9496]}//ccny
        zoom={10}
        zoomDelta={0.25}//make zooming slower
        zoomAnimation={true}
        scrollWheelZoom={false}        // ← disable default
        smoothWheelZoom={true}         // ← enable smooth
        smoothSensitivity={5}          // ← adjust 1–5, lower = slower
        markerZoomAnimation={true}
        style={{ height: '50vh', width: '50%' }}
    >
    
    <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    />

    <ChefMarkers chefs={chefs} />
      
    </MapContainer>
  );
}