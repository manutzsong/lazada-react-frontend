import React from 'react';
import { Map, CircleMarker, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";


export default ({dataCity}) => {
    const generateColor = (dataCount) => {
        if (dataCount <3) {
            
            return "#0163FF"
        }
        else if (dataCount <5) {
            return "#3ACDBB"
        }
        else if (dataCount <10) {
            return "#7A932A"
        }
        else {
            return "#EEF033"
        }
    }

    const renderCircle = () => {
        let renderThis = dataCity.map(x => {
                let radius = x.count * 10;
                let fillColor = generateColor(x.count);
                console.log(x.count);
                return (
                <CircleMarker
                    key={x.postalCode.zip}
                    center={[x.postalCode.lat, x.postalCode.lng]}
                    radius={radius}
                    fillColor={fillColor}
                    fillOpacity={0.5}
                    stroke={false}
                >
                    <Tooltip direction="right" offset={[-8, -2]} opacity={1}>
                        <span>{`${x.postalCode.province}, ${x.postalCode.district}. ${x.postalCode.zip}`}</span>
                        <h5>{`${x.count} orders`}</h5>
                    </Tooltip>
                </CircleMarker>)
            });
        return renderThis;
}

    
    return (
        <div>
          <Map
            style={{ height: "480px", width: "100%" }}
            zoom={6}
            center={[13.7563, 100.5018]}>
                <TileLayer url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {renderCircle()}
          </Map>
        </div>
      );
}