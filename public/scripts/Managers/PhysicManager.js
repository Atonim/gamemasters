import { PlayerStates, Directions, CellStates } from "../enums.js";
import { Player } from "../Entities/Player.js";


export class PhysicManager {
    map_manager = null;
    game_manager = null;

    update(obj) {

        if (obj instanceof Player && (obj.state === PlayerStates.stay || obj.state === PlayerStates.dead)) {
            return;
        }

        if (obj.direction !== obj.request_direction) {
            if (obj.pos_x % this.map_manager.tSize.x == 0 && obj.pos_y % this.map_manager.tSize.y == 0) {
                if (!this.is_wall_collision(obj.pos_x, obj.pos_y, { 'x': obj.speed, 'y': obj.speed }, obj.request_direction)) {
                    obj.direction = obj.request_direction;
                }
            }
        }

        if (this.is_wall_collision(obj.pos_x, obj.pos_y, { 'x': obj.speed, 'y': obj.speed }, obj.direction)) {
            obj.tale.pop()
            return;
        }
        let next_position = this.getNextPosition(obj.pos_x, obj.pos_y, obj.speed, obj.direction);
        let object = this.objectAtXY(obj, next_position.x, next_position.y);
        console.log(object)
        if (object !== null && obj.onTouchObject) {

            obj.onTouchObject(object);
        }

        if (obj.pos_x % this.map_manager.tSize.x == 0 && obj.pos_y % this.map_manager.tSize.y == 0) {
            if (obj.tale.unshift({ x: obj.pos_x, y: obj.pos_y }) > obj.maxTaleLength) obj.tale.pop()
        }
        obj.pos_x = next_position.x;
        obj.pos_y = next_position.y;
    }

    getNextPosition(x, y, offset, direction) {
        let newX = x;
        let newY = y;

        switch (direction) {
            case Directions.up:
                newY -= offset;
                break;
            case Directions.down:
                newY += offset;
                break;
            case Directions.left:
                newX -= offset;
                break;
            case Directions.right:
                newX += offset;
                break;
        }
        if (newX > this.map_manager.mapSize.x - this.map_manager.tSize.x) {
            newX %= this.map_manager.mapSize.x - this.map_manager.tSize.x;
        } else if (newX < 0) {
            newX = this.map_manager.mapSize.x - this.map_manager.tSize.x;
        }
        newY %= this.map_manager.mapSize.y;
        return { 'x': newX, 'y': newY };
    }

    is_wall_collision(x, y, offset, direction) {
        let tile_position = { 'x': x, 'y': y };
        let round_func;
        switch (direction) {
            case Directions.up:
                tile_position.y -= offset.y;
                round_func = Math.floor;
                break;
            case Directions.down:
                tile_position.y += offset.y;
                round_func = Math.ceil;
                break;
            case Directions.left:
                tile_position.x -= offset.x;
                round_func = Math.floor;
                break;
            case Directions.right:
                tile_position.x += offset.x;
                round_func = Math.ceil;
                break;
        }
        tile_position.x %= this.map_manager.mapSize.x;

        if (tile_position.x > this.map_manager.mapSize.x - this.map_manager.tSize.x) {
            tile_position.x %= this.map_manager.mapSize.x - this.map_manager.tSize.x;
        } else if (tile_position.x < 0) {
            tile_position.x = this.map_manager.mapSize.x - this.map_manager.tSize.x;
        }
        //console.log(tile_position)
        //console.log(this.map_manager.getTilesetIdx(tile_position.x, tile_position.y, round_func));
        return CellStates.free !== this.map_manager.getTilesetIdx(tile_position.x, tile_position.y, round_func);
    }

    objectAtXY(obj, x, y) {

        for (let i = 0; i < this.game_manager.objects.length; i++) {
            let e = this.game_manager.objects[i];
            if (e.name !== obj.name) {
                if (e.tale) {
                    for (let j = 0; j < e.tale.length; j++) {

                        if (!(x + obj.size_x - 1 < e.tale[j].x || y + obj.size_y - 1 < e.tale[j].y ||
                            x > e.tale[j].x + e.size_x - 1 || y > e.tale[j].y + e.size_y - 1)) {

                            return e;
                        }

                    }
                }

                if (x + obj.size_x - 1 < e.pos_x || y + obj.size_y - 1 < e.pos_y ||
                    x > e.pos_x + e.size_x - 1 || y > e.pos_y + e.size_y - 1) {
                    continue;
                }
                return e;
            }
        }

        return null;
    }
}