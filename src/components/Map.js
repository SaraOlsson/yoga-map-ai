import * as React from 'react';
import ReactMapGL, {Source, Layer} from 'react-map-gl';
import mockData from '../assets/mockData.json'

function Map(props) {
  const [viewport, setViewport] = React.useState({
    latitude: 58.588455,
    longitude: 16.188313,
    zoom: 2
  });

  const [mockFeatures, setMockFeatures] = React.useState({
    type: "FeatureCollection",
    features: [],
  })
  // console.log(mockData)

  React.useEffect(() => {

    if(!props.poseName)
      return

    console.log(props.poseName)

    const mockPoints2 = mockData.find(m => m.name === props.poseName)
    addMock(mockPoints2)
    
  },[props.poseName])

  const addMock = async (points) => {

    let geojson = {
      type: "FeatureCollection",
      features: [],
    };

    await Promise.all(
      points.coordinates.map(async (p) => {
      
      await geojson.features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [p.lng, p.lat] }
      });
    })
    )
    
    console.log(geojson)
    setMockFeatures(geojson)
  }
  
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
      renderWorldCopies={false} // not working
    >
      <Source id="my-data" type="geojson" data={mockFeatures}>
        <Layer {...layerStyle} />
      </Source>
    </ReactMapGL>
  );
}

export default Map