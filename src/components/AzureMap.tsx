import React from 'react'
import {
    AzureMap, 
    AzureMapsProvider, 
    IAzureMapOptions, 
    AzureMapDataSourceProvider,
    AzureMapFeature,
    AzureMapLayerProvider
} from 'react-azure-maps'
import {AuthenticationType, data} from 'azure-maps-control'

import mockData from '../assets/mockData.json'

const option: IAzureMapOptions = {
    authOptions: {
        authType: AuthenticationType.subscriptionKey,
        subscriptionKey:  process.env.REACT_APP_AZURE_MAP_KEY
    },
    style: 'grayscale_dark',
    center: [-5.3919, 28.1240],
    zoom: 2,
    view: 'Auto',
}

const DefaultMap: React.FC = (props: any) => {

    const [mockFeatures, setMockFeatures] = React.useState<data.Position[]>([])

    React.useEffect(() => {

        if(!props.poseName)
          return
    
        console.log(props.poseName)
    
        const mockPoints2 = mockData.find(m => m.name === props.poseName)
        addMock(mockPoints2)
        
      },[props.poseName])
    
      const addMock = async (points: any) => {
    
        let geoData: data.Position[] = []
    
        await Promise.all(
          points.coordinates.map(async (p: any) => {
            await geoData.push(new data.Position(p.lng, p.lat))
          })
        )
        
        console.log(geoData)
        setMockFeatures(geoData)
      }

    return (
        <AzureMapsProvider>
            <AzureMap options={option}>

                <AzureMapDataSourceProvider id={'LayerExample2 DataSource'}>
                    <AzureMapLayerProvider
                    id={'LayerExample2 HeatMap'}
                    options={{}}
                    type={'HeatLayer'}
                    />
                    {
                        mockFeatures.map((p: data.Position, idx: number) => 
                            <AzureMapFeature
                            id={'LayerExample2 MapFeature2'}
                            key={idx}
                            type="Point"
                            coordinate={p}
                            />
                        )
                    }
                </AzureMapDataSourceProvider>


            </AzureMap>
        </AzureMapsProvider>
    )
}

export default DefaultMap


/* 
const point = new data.Position(-80.01, 35.01);
const point1 = new data.Position(16.688313, 58.688455);
<AzureMapFeature
id={'LayerExample2 MapFeature2'}
key={'dddd'}
type="Point"
coordinate={point}
/>
<AzureMapFeature
id={'LayerExample2 MapFeature2'}
key={'dddd'}
type="Point"
coordinate={point1}
/> */