import React from 'react';
import Konva_Wrapper from './konva_wrapper'
import Info from './info.js'


export default class Main extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            area_length: '',
            processing: false,
            area_height: '',
            rectangles: [{length: "", height: "", quantity: '1'}],
            algo_results: {
                points: [],
                remaining_area: 0
            },
            values: {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            },
            algoSelectorValue: 'Guillotine',
            presort_descending: false

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

            {this.state.rectangles.map((rectangle, idx) => (
                <div className="rectangle">
                    <label>
                        Length:
                        <input
                            type="number"
                            min="0"
                            value={rectangle.length}
                            name={"length"}
                            onChange={this.handleRectangleNameChange(idx)}
                        />
                    </label>


                    <label>
                        Height:
                        <input
                            type="number"
                            min="0"
                            value={rectangle.height}
                            name={"height"}
                            onChange={this.handleRectangleNameChange(idx)}
                        />
                    </label>

                    <label>
                        Quantity:
                        <input
                            type="number"
                            min="0"
                            value={rectangle.quantity}
                            name={"quantity"}
                            onChange={this.handleRectangleNameChange(idx)}
                        />
                    </label>



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
                    <div class="text-monospace p-3 mb-2 bg-warning text-dark text-center font-weight-bolder">Material Site Application</div>

                    <label>
                        Area to fill length:
                        <input type="text" min="0" name="area_length" onChange={this.handleChangeAbstract}/>
                    </label>

                    <label>
                        Area to fill length:
                        <input type="text" min="0" name="area_height" onChange={this.handleChangeAbstract}/>
                    </label>


                    <label>
                        API level:
                        <select value={this.state.algoSelectorValue} onChange={this.handleChangeAbstract}
                                name={'algoSelectorValue'}>
                            <option value="Shelf_nf">Shelf Next fit</option>
                            <option value="Guillotine">Guillotine</option>
                            <option value="GuillotineBAF">Guillotine Best Area</option>
                        </select>
                    </label>

                    <label>
                        Pre-sort descending:
                        <input
                            name="presort_descending"
                            type="checkbox"
                            checked={this.state.presort_descending}
                            onChange={this.handleInputChange}
                        />
                    </label>

                    <hr/>

                    {this.renderRectangleInput()}

                    <hr/>

                    <button
                        type="button"
                        onClick={this.handleAddRectangle}
                        className="small"
                    >Add Rectangle
                    </button>
                    <button className="small">Compute Algorithm</button>
                </form>
                <Info values={this.state.values}/>
                <Konva_Wrapper points={this.state.algo_results.points} area_length={this.state.area_length}
                               area_height={this.state.area_height} handleClick={this.handleClick.bind(this)}/>
            </div>

        );

    }

    handleInputChange = (event) =>  {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }


    handleSubmit = async e => {
        e.preventDefault();
        console.log('Handle submit called');

        await fetch('/api/algorithms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                area_length: this.state.area_length,
                area_height: this.state.area_height,
                rectangles: this.state.rectangles,
                algoSelectorValue: this.state.algoSelectorValue,
                presort_descending: this.state.presort_descending
            }),
        }).then((response) => {
            response.text().then((text) => {
                console.log(text);
                let data = JSON.parse(text);
                this.setState({algo_results: data})
            });
        });
    };
}



