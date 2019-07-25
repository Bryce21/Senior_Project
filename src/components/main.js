import React from 'react';
import Konva_Wrapper from './konva_wrapper'
import Info from './info.js'
import * as algos from '../algos.js'


export default class Main extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            area_length: '',
            processing: false,
            area_height: '',
            rectangles: [{length: "", height: "", quantity: '1'}],
            points: [],
            values: {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            },
            algoSelectorValue: 'Guillotine'

        };
    }


    handleRectangleNameChange = idx => evt => {
        const newRectangles = this.state.rectangles.map((rectangle, sidx) => {
            if (idx !== sidx) return rectangle;
            let returnObject = {...rectangle};
            returnObject[evt.target.name] = evt.target.value;
            console.log(rectangle)
            console.log(returnObject)
            return returnObject
        });

        this.setState({rectangles: newRectangles});
    };


    handleAddRectangle = () => {
        this.setState({
            rectangles: this.state.rectangles.concat([{length: "", height: "", quantity: '1'}])
        });
    };

    handleRemoveRectangle = idx => () => {
        this.setState({
            rectangles: this.state.rectangles.filter((s, sidx) => idx !== sidx)
        });
    };


    handleClick(values) {
        this.setState({values: values})
    }


    renderRectangleInput() {
        return <div>
            <style>{'body { background-color: white; }'}</style>
            <div class="text-monospace p-3 mb-2 bg-warning text-dark text-left font-weight-bolder">Rectangle(s) Inputs</div>
            <div class="text-monospace p-3 mb-2 bg-warning text-dark text-left font-weight-bolder">Length, Height, Quantity:</div>

            {this.state.rectangles.map((rectangle, idx) => (
                <div className="rectangle">
                    <box><input
                        type="number"
                        min="0"
                        value={rectangle.length}
                        name={"length"}
                        onChange={this.handleRectangleNameChange(idx)}
                    /></box>
                    <input
                        type="number"
                        min="0"
                        value={rectangle.height}
                        name={"height"}
                        onChange={this.handleRectangleNameChange(idx)}
                    />

                    <box><input
                        type="number"
                        min="0"
                        value={rectangle.quantity}
                        name={"quantity"}
                        onChange={this.handleRectangleNameChange(idx)}
                    /></box>

                    <button
                        type="button"
                        onClick={this.handleRemoveRectangle(idx)}
                        className="small"
                    >
                        -
                    </button>

                </div>

            ))}
        </div>

    }


    handleChangeAbstract = (event) => {
        this.setState({[event.target.name]: event.target.value});
    };

    render() {
        console.log(this.state);

        return (
            <div>
                
                <form onSubmit={this.handleSubmit}>
                    <div class="text-monospace p-3 mb-2 bg-warning text-dark text-center font-weight-bolder">Material
                        Site Application
                    </div>
                    <div class="text-monospace p-3 mb-2 bg-warning text-dark text-left font-weight-bolder">
                        Area to fill length:
                        <input type="text" min="0" name="area_length" onChange={this.handleChangeAbstract}/>
                    </div>

                    <div class="text-monospace p-3 mb-2 bg-warning text-dark text-left font-weight-bolder">
                        Area to fill height:
                        <input type="text" min="0" name="area_height" onChange={this.handleChangeAbstract}/>
                    </div>

                    <label>
                        API level:
                        <select value={this.state.algoSelectorValue} onChange={this.handleChangeAbstract}
                                name={'algoSelectorValue'}>
                            <option value="Shelf_nf">Shelf Next fit</option>
                            <option value="Guillotine">Guillotine</option>
                            <option value="GuillotineBAF">Guillotine Best Area</option>
                        </select>
                    </label>
                    {this.renderRectangleInput()}
                    <button
                        type="button"
                        onClick={this.handleAddRectangle}
                        className="small"
                    >Add Rectangle
                    </button>
                    <button className="small">Compute Algorithm</button>
                </form>
                <Info values={this.state.values}/>
                <Konva_Wrapper points={this.state.points} area_length={this.state.area_length}
                               area_height={this.state.area_height} handleClick={this.handleClick.bind(this)}/>
            </div>

        );

    }


    handleSubmit = async e => {
        e.preventDefault();
        console.log('Handle submit called');
        let rectangles_to_use = []
        for(let i = 0; i < this.state.rectangles.length; i++){
            for(let x=0; x < parseInt(this.state.rectangles[i].quantity); x++){
                rectangles_to_use.push(this.state.rectangles[i])
            }
        }

        let body = {
            area_length: this.state.area_length,
            area_height: this.state.area_height,
            rectangles: rectangles_to_use,
            algoSelectorValue: this.state.algoSelectorValue
        };
        console.log(body)


        console.log(typeof(body))
        // switch(body.algoSelectorValue){
        //     case(''): break;
        //     case(''): break;
        //     case(''): break
        // }
        let points = algos.guillotine(body.rectangles, body.area_length, body.area_height);
        console.log(points)
        console.log(typeof(points))
        this.setState({points: points})
        // await fetch('/api/algorithms', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: body,
        // }).then((response) => {
        //     response.text().then((text) => {
        //         console.log(text);
        //         let data = JSON.parse(text);
        //         this.setState({points: data})
        //     });
        //
        // });


    };
}



