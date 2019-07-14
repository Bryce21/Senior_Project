import React from 'react';
import {Rect} from 'react-konva';


export default class Rectangle extends React.Component {

    render() {
        return (
            <Rect
                x={this.props.x}
                y={this.props.y}
                width={this.props.width}
                height={this.props.height}
                fill={this.props.color}
                draggable={this.props.draggable}
                onClick={()=> {
                    this.props.handleClick({
                        x: this.props.x,
                        y: this.props.y,
                        width: this.props.width,
                        height: this.props.height})}
                }
            />
        )
    }
}
