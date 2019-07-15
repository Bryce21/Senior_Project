const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/api/algorithms', (req, res) => {
    console.log('recieve post request');
    console.log(req.body);
    let result = guillotine(req.body.rectangles, parseInt(req.body.area_length), parseInt(req.body.area_height))
    console.log('result:')
    console.log(result);
    res.send(result)
});


function shelf_nf(rectangles, W, H){
    let shelf = null;
    let shelf_count = 0;
    let points = [];


    for(let rectangle of rectangles){
        let to_add = [Math.max(rectangle.length, rectangle.height), Math.min(rectangle.length, rectangle.height)];
        // Need this null check? Just define shelf up top. Check later
        if(shelf == null) shelf = new Shelf(0, 0, W, parseInt(rectangles[0].height));
        if(Math.max(rectangle.length, rectangle.height) <= shelf.height){to_add = [Math.min(rectangle.length, rectangle.height), Math.max(rectangle.length, rectangle.height)]}

        if(to_add[0] + shelf.vertical > shelf.width || to_add[1] > shelf.height) {
            shelf = new Shelf(0, shelf.horizontal + shelf.height, W, to_add[1]);
            shelf_count += 1
        }
        // Try to fit on open shelf
        if(to_add[0] + shelf.vertical <= shelf.width && to_add[1] <= shelf.height) {
            shelf.vertical += to_add[0];
            let start_x = shelf.vertical - to_add[0];
            if(start_x < 0) start_x = 0;
            points.push(new Rectangle(start_x, shelf.horizontal + to_add[1], shelf.vertical, shelf.horizontal))
        }
    }
    console.log(points);
    return points
}


function guillotine(rectangles, W, H){
    let free_rectangles = [new Rectangle(0,0, W, H)];
    let points = []
    for(let rectangle of rectangles){
        let to_use = null;
        let fr_index = 0;


        for(let free_rectangle of free_rectangles){
            if(free_rectangle.canFit(rectangle.length, rectangle.height)){
                to_use = free_rectangle;
                break
            }
            fr_index += 1;
        }
        // console.log('choosing: ')
        // console.log(free_rectangles[fr_index])
        // Exit condition, return early/continue, not sure which rn
        if(to_use == null){continue}
        let orientated = to_use.orientate(rectangle.length, rectangle.height);
        let n_r = new Rectangle(to_use.x1, to_use.y1, to_use.x1 + orientated[0], to_use.y1 + orientated[1]);
        points.push(n_r);
        let split_rectangles = to_use.splitRectangleV(orientated[0], orientated[1]);

        free_rectangles.splice(fr_index, 1);
        free_rectangles = free_rectangles.concat(split_rectangles);
        // console.log('free_rectangles');
        // console.log(free_rectangles)
        // console.log()
    }
    return points
}

class Shelf {
    constructor(vertical, horizontal, width, height){
        this.vertical = vertical;
        this.horizontal = horizontal;
        this.width = width;
        this.height = height;
    }
}


class Rectangle {
    constructor(x1, y1, x2, y2){
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.W = this.x2 - this.x1;
        this.H = this.y2 - this.y1;
        this.area = this.W * this.H;
    }

    canFit(in_W, in_H){
        let to_check = [Math.max(in_W, in_H), Math.min(in_W, in_H)];
        if( to_check[0] <= this.W && to_check[1] <= this.H) return true;
        to_check = [Math.min(in_W, in_H), Math.max(in_W, in_H)];
        if(to_check[0] <= this.H && to_check[1] <= this.W) return true;
        return false
    }

    splitRectangleV(in_W, in_H){
        // return [new Rectangle(this.x1, in_H, this.x1 + in_W, this.y2),
        // new Rectangle(in_W, this.y1, this.x2, this.y2)]
        return [new Rectangle(this.x1, in_H+this.y1, this.x1 + in_W, this.y2),
            new Rectangle(this.x1 + in_W, this.y1, this.x2, this.y2)]
    }

    splitRectangleH(in_W, in_H){
        return [new Rectangle(this.W, this.H - in_H), new Rectangle(in_W, this.H - in_H)]
    }

    orientate(in_W, in_H) {
        let orientate = [Math.max(in_W, in_H), Math.min(in_W, in_H)]
        if (orientate[0] > in_W) orientate = [Math.min(in_W, in_H), Math.max(in_W, in_H)]
        return orientate
    }
}


app.listen(port, () => console.log(`Listening on port ${port}`));




