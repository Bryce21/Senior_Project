import React  from 'react';


export default class Info extends React.Component {
    render(){
        console.log('In info')
        console.log(this.props)
        return (
            <div>
                <div class="text-monospace p-3 mb-2 bg-warning text-dark text-left font-weight-bolder">X of selected rectangle: {Math.abs(this.props.values.x)}</div>
                <div class="text-monospace p-3 mb-2 bg-warning text-dark text-left font-weight-bolder">Y of selected rectangle: {Math.abs(this.props.values.y)}</div>
                <div class="text-monospace p-3 mb-2 bg-warning text-dark text-left font-weight-bolder">Width of selected rectangle: {Math.abs(this.props.values.width)}</div>
                <div class="text-monospace p-3 mb-2 bg-warning text-dark text-left font-weight-bolder">Height of selected rectangle: {Math.abs(this.props.values.height)}</div>
            </div>
        )
    }
}