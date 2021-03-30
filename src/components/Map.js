import * as React from 'react';
import ReactMapGL, {Source, Layer} from 'react-map-gl';

function Map() {
  const [viewport, setViewport] = React.useState({
    latitude: 58.588455,
    longitude: 16.188313,
    zoom: 8
  });

  // const mockPoints = [{ "lat": 44.49524062917086, "lng": 5.14568969384305 }]

  // const mockFeatures = mockPoints.map(p => {
  //   return {type: 'Feature', geometry: {type: 'Point', coordinates: [16.188313, 58.588455]}} 
  // })

  const geojson = {
    type: 'FeatureCollection',
    features: [
      {type: 'Feature', geometry: {type: 'Point', coordinates: [16.188313, 58.588455]}},
      {type: 'Feature', geometry: {type: 'Point', coordinates: [5.14568969384305, 44.49524062917086]}}
    ]
  };
  
  const layerStyle = {
    id: 'point',
    type: 'circle',
    paint: {
      'circle-radius': 10,
      'circle-color': '#FFECC2'
    }
  };

  return (
    <ReactMapGL
      {...viewport}
      width="100%"
      height="100%"
      onViewportChange={(viewport) => setViewport(viewport)}
      mapStyle="mapbox://styles/sarakolsson/ckmvzf1dv03mc17o3wppcz5tn"
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
    >
      <Source id="my-data" type="geojson" data={geojson}>
        <Layer {...layerStyle} />
      </Source>
    </ReactMapGL>
  );
}

export default Map