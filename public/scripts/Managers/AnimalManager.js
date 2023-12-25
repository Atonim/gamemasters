import { AnimalStates, Directions } from "../enums.js";
import { AStar } from "./HelperClasses/A*.js";



export class AnimalManager {
  map_manager = null;
  game_manager = null;

  search(animal) {
    //console.log('search')
    let direction = Math.floor(Math.random() * Object.keys(Directions).length);
    //console.log(direction)
    animal.request_direction = direction;
    //console.log(animal.request_direction)
  }

  chase(animal, animal_pos, player_pos, player_tale) {
    console.log('chase')
    let path = AStar(this.map_manager.mapMatrix, animal_pos, player_pos, player_tale);
    console.log(path)
    let next_tile = path[0];
    //console.log(next_tile)
    let dir_x = next_tile.x - animal_pos.x;
    let dir_y = next_tile.y - animal_pos.y;
    switch (dir_x) {
      case 1:
        animal.request_direction = Directions.right;
        break;
      case -1:
        animal.request_direction = Directions.left;
        break;
    }

    switch (dir_y) {
      case 1:
        animal.request_direction = Directions.down;
        break;
      case -1:
        animal.request_direction = Directions.up;
        break;
    }
    console.log(next_tile, animal.request_direction)
  }

  update(animal) {
    //console.log('update', animal);
    let animal_pos = { 'x': Math.round(animal.pos_x / this.map_manager.tSize.x), 'y': Math.round(animal.pos_y / this.map_manager.tSize.x) };
    let player_dir = this.game_manager.player.direction;
    let player_pos = { 'x': Math.round(this.game_manager.player.pos_x / this.map_manager.tSize.x), 'y': Math.round(this.game_manager.player.pos_y / this.map_manager.tSize.x) };

    if (animal.state !== AnimalStates.afraid) {
      if (Math.sqrt((player_pos.x - animal_pos.x) ** 2 + (player_pos.y - animal_pos.y) ** 2) <= 8) {
        //console.log(animal_pos, player_pos, Math.sqrt((player_pos.x - animal_pos.x)**2 + (player_pos.y - animal_pos.y)**2) <= 3)
        animal.state = AnimalStates.chase;
      } else {
        animal.state = AnimalStates.search;
      }
    }
    switch (animal.state) {
      case AnimalStates.search:
        this.search(animal);
        break;
      case AnimalStates.chase:
        this.chase(animal, animal_pos, player_pos, this.game_manager.player.tale);
        break;
      case AnimalStates.afraid:
        this.search(animal);
        break;
    }
  }
}