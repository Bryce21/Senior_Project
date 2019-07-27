const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
const path = require('path')


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// Serve static files from the React frontend app
// app.use(express.static(path.join(__dirname, '/build')))// Anything that doesn't match the above, send back index.html
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname + '/build/index.html'))
// });
//
// app.use((req, res, next) => {
//     res.header(
//         "Access-Control-Allow-Origin",
//         "http://deploytestomega.herokuapp.com"
//     );
//     res.header(
//         "Access-Control-Allow-Headers",
//         "Origin, X-Requested-With, Content-Type, Accept"
//     );
//     next();
// });


app.post('/api/algorithms', (req, res) => {
    console.log('recieve post request');
    console.log(req.body);
    let result = null;
    console.log(req.body);
    let rectangles_to_use = [];


    for (let i = 0; i < req.body.rectangles.length; i++) {
        for (let x = 0; x < parseInt(req.body.rectangles[i].quantity); x++) {
            rectangles_to_use.push(req.body.rectangles[i])
        }
    }
    

    if(req.body.presort_descending){
        rectangles_to_use = rectangles_to_use.sort(function(a, b) {
            return parseFloat(b.length * b.height) - parseFloat(a.length * a.height);
        });
    }

    switch (req.body.algoSelectorValue) {
        case 'Guillotine':
            result = guillotine(rectangles_to_use, parseInt(req.body.area_length), parseInt(req.body.area_height), 'Horizontal');
            break;
        case 'GuillotineBAF' :
            result = guillotineBestAreaFit(rectangles_to_use, parseInt(req.body.area_length), parseInt(req.body.area_height), 'Horizontal');
            break;
        case 'Shelf_nf':
            result = shelf_nf(rectangles_to_use, parseInt(req.body.area_length), parseInt(req.body.area_height));
            break;
    }
    res.send(result)
});


function shelf_nf(rectangles, W, H) {
    let shelf = null;
    let points = [];


    for (let rectangle of rectangles) {
        let to_add = [Math.max(rectangle.length, rectangle.height), Math.min(rectangle.length, rectangle.height)];
        // Need this null check? Just define shelf up top. Check later
        if (shelf == null) shelf = new Shelf(0, 0, W, parseInt(rectangles[0].height));
        if (Math.max(rectangle.length, rectangle.height) <= shelf.height) {
            to_add = [Math.min(rectangle.length, rectangle.height), Math.max(rectangle.length, rectangle.height)]
        }

        if (to_add[0] + shelf.vertical > shelf.width || to_add[1] > shelf.height) {
            shelf = new Shelf(0, shelf.horizontal + shelf.height, W, to_add[1]);
        }
        // Try to fit on open shelf
        if (to_add[0] + shelf.vertical <= shelf.width && to_add[1] <= shelf.height) {
            shelf.vertical += to_add[0];
            let start_x = shelf.vertical - to_add[0];
            if (start_x < 0) start_x = 0;
            points.push(new Rectangle(start_x, shelf.horizontal + to_add[1], shelf.vertical, shelf.horizontal))
        }
    }

    let used_area = points.reduce(function(prev, cur) {
        return prev + cur.area;
    }, 0);


    return{
        points: points,
        remaining_area: W*H - used_area
    }
}


function guillotine(rectangles, W, H, split) {
    let free_rectangles = [new Rectangle(0, 0, W, H)];
    let points = []
    for (let rectangle of rectangles) {

        let to_use = null;
        let fr_index = 0;
        let values = null;

        console.log('Available:');
        console.log(free_rectangles);

        for (let free_rectangle of free_rectangles) {
            values = free_rectangle.getOrientation(rectangle.length, rectangle.height);
            if (values.fit) {
                to_use = free_rectangle;
                break
            }
            fr_index += 1;
        }

        if (to_use == null) {
            continue
        }



        points.push(new Rectangle(to_use.x1, to_use.y1, to_use.x1 + values.length, to_use.y1 + values.height));
        let split_rectangles = to_use.split(values.length, values.height, split);

        free_rectangles.splice(fr_index, 1);
        free_rectangles = free_rectangles.concat(split_rectangles);

        free_rectangles = mergeRectangles(free_rectangles);


    }
    let remaining_area = free_rectangles.reduce(function(prev, cur) {
        return prev + cur.area;
    }, 0);



    return {
        remaining_area: remaining_area,
        points: points
    }
}


function mergeRectangles(free_rectangles) {
    for (let c = 0; c < free_rectangles.length; c++) {

        let current = free_rectangles[c];
        if(current === undefined) continue;

        for (let k = 0; k < free_rectangles.length; k++) {

            let r = free_rectangles[k];
            if (r === undefined) continue;

            if (k !== c ) {
                let adjacentVertical = current.checkAdjacentVertical(r);
                let adjacentHorizontal = current.checkAdjacentHorizontal(r);
                if(adjacentVertical.adj){
                    free_rectangles.push(adjacentVertical.new_rect);
                    delete free_rectangles[k];
                    delete free_rectangles[c];
                } else if(adjacentHorizontal.adj){
                    free_rectangles.push(adjacentHorizontal.new_rect);
                    delete free_rectangles[k];
                    delete free_rectangles[c];
                }

            }
        }
    }

    return free_rectangles.filter(n => n)
}

function guillotineBestAreaFit(rectangles, W, H, split) {
    let free_rectangles = [new Rectangle(0, 0, W, H)];
    let points = [];

    for (let rectangle of rectangles) {
        let to_use = null;
        let values = null;
        let selected = null;
        let correct_values = null;

        for(let x = 0; x < free_rectangles.length; x++){
            values = free_rectangles[x].getOrientation(rectangle.length, rectangle.height);
            if (values.fit){
                if(to_use === null || free_rectangles[x].area < to_use.area){
                    to_use = free_rectangles[x];
                    selected = x;
                    correct_values = values;
                }
            }
        }

        if (to_use == null) {
            continue
        }
        points.push(new Rectangle(to_use.x1, to_use.y1, to_use.x1 + correct_values.length, to_use.y1 + correct_values.height));

        let split_rectangles = to_use.split(correct_values.length, correct_values.height, split);
        free_rectangles.splice(selected, 1);
        free_rectangles = free_rectangles.concat(split_rectangles);
        free_rectangles = mergeRectangles(free_rectangles);
    }

    let remaining_area = free_rectangles.reduce(function(prev, cur) {
        return prev + cur.area;
    }, 0);

    return {
        points: points,
        remaining_area: remaining_area
    }
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

class Shelf {
    constructor(vertical, horizontal, width, height) {
        this.vertical = vertical;
        this.horizontal = horizontal;
        this.width = width;
        this.height = height;
    }
}


class Rectangle {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.W = this.x2 - this.x1;
        this.H = this.y2 - this.y1;
        this.area = this.W * this.H;
    }


    checkAdjacentVertical(r){
        let adjacentVertical = {adj: false, new_rect: ''};
        if( this.x1 === r.x1 && this.x2 === r.x2){
            //console.log('Eureka 6')
            if(this.y1 < r.y1){
                if(this.y1 === r.y1+r.H && this.y2-this.H === r.y2){
                    adjacentVertical.adj = true;
                    adjacentVertical.new_rect = new Rectangle(this.x1, this.y1, this.x2, this.y2 + r.y2);
                    console.log('Eureka3!');
                    console.log(this);
                    console.log(r);
                    return adjacentVertical
                }

            } else if(this.y1 > r.y1){
                if(this.y1 + this.H === r.y1 && this.y2 === r.y2 - r.H){
                    console.log('Eureka4!');
                    console.log(this);
                    console.log(r);
                    adjacentVertical.adj = true;
                    adjacentVertical.new_rect = new Rectangle(r.x1, r.y1, r.x2, this.y2 + r.y2);
                    return adjacentVertical
                }
            }
        }

        return adjacentVertical

    }


    checkAdjacentHorizontal(r){
        let adjacentHorizontal = {adj: false, new_rect: ''};
        if( this.y1 === r.y1 && this.y2 === r.y2){
            if(this.x1 < r.x1){

                if(this.x1 === r.x1+r.length && this.x2-this.W === r.x2){
                    console.log('Eureka1!');
                    console.log(this);
                    console.log(r);
                    adjacentHorizontal.adj = true;
                    adjacentHorizontal.new_rect = new Rectangle(this.x1, this.y1, this.x2+r.length, r.y2);
                    return adjacentHorizontal
                }

            } else if(this.x1 > r.x1){
                if(this.x1 + this.W === r.x1 && this.x2 === r.x2 - r.W){
                    console.log('Eureka2!');
                    console.log(this);
                    console.log(r);
                    adjacentHorizontal.adj = true;
                    adjacentHorizontal.new_rect = new Rectangle(r.x1, r.y1, r.x2+this.W, this.y2);
                    return adjacentHorizontal
                }
            }
        }

        return adjacentHorizontal
    }


    getOrientation(in_W, in_H) {
        let values = {fit: false, length: '', height: ''}
        let to_check = [Math.max(in_W, in_H), Math.min(in_W, in_H)];
        if (to_check[0] <= this.W && to_check[1] <= this.H) {
            values.fit = true;
            values.length = to_check[0];
            values.height = to_check[1];
            return values
        }

        to_check = [Math.min(in_W, in_H), Math.max(in_W, in_H)];
        if (to_check[0] <= this.H && to_check[1] <= this.W) {
            values.fit = true;
            values.length = to_check[0];
            values.height = to_check[1];
            return values
        }
        return values
    }

    splitRectangleV(in_W, in_H) {
        let return_array = [];
        let r1 = new Rectangle(this.x1, parseInt(in_H + this.y1), this.x1 + in_W, this.y2);
        let r2 = new Rectangle(this.x1 + in_W, this.y1, this.x2, this.y2);

        if(r1.area > 0) return_array.push(r1);
        if(r2.area > 0) return_array.push(r2);

        return return_array
    }

    splitRectangleH(in_W, in_H) {
        let return_array = [];
        let r1 = new Rectangle(this.x1 + in_W, this.y1, this.x2, this.y1 + in_H);
        let r2 = new Rectangle(this.x1, this.y1 + in_H, this.x2, this.y2);

        if(r1.area > 0) return_array.push(r1);
        if(r2.area > 0) return_array.push(r2);

        return return_array
    }


    split(in_W, in_H, split_choice) {
        switch (split_choice) {
            case('Vertical'):
                return this.splitRectangleV(parseFloat(in_W), parseFloat(in_H));
                break;
            case('Horizontal'):
                return this.splitRectangleH(parseFloat(in_W), parseFloat(in_H));
                break;
        }
    }
}


app.listen(port, () => console.log(`Listening on port ${port}`));




