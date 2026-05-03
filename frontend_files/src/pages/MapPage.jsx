import Map from "../components/Map.jsx";

export default function MapPage() {
  return (
    <div style={{ padding: "20px", color: "blue" }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>
        Find a Chef Near You
      </h1>
      
      <Map />
     
    </div>
  );
}