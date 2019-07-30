import React  from 'react';
import { Stage, Layer, Text } from 'react-konva';
import Rectangle from './rectangle'
import Konva from 'konva';



export default class Konva_Wrapper extends React.Component {

    constructor(props){
        super(props);
    }


    render(){
        let rectangles = [];
        // Maybe put this in BE and pass rect objects along? If possible instead of sending points.
        for(let rectangle of this.props.points){
            rectangles.push(
                <Rectangle
                    x={rectangle.x1}
                    y={rectangle.y1}
                    width={rectangle.x2 - rectangle.x1}
                    height={rectangle.y2 - rectangle.y1}
                    color={Konva.Util.getRandomColor()}
                    id={rectangle.id}
                    draggable={true}
                    handleClick={this.props.handleClick}
                />
            )
        }
        return (
            <Stage width={window.innerWidth} height={window.innerHeight}>
                <Layer>
                    <Rectangle
                        x={0}
                        y={0}
                        width={this.props.area_length}
                        height={this.props.area_height}
                        draggable={false}
                        color={Konva.Util.getRandomColor()}
                        handleClick={()=>{}}
                    />
                    {rectangles}
                </Layer>
            </Stage>
        )
    }
}