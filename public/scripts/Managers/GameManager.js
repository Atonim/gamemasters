import { MapManager } from "./MapManager.js";
import { PhysicManager } from "./PhysicManager.js";
import { SpriteManager } from "./SpriteManager.js";

import { AnimalManager } from "./AnimalManager.js";
import { sm } from "./SoundManager.js";

import { Player } from "../Entities/Player.js"
import { Animal } from "../Entities/Animal.js"
import { Bonus } from "../Entities/Bonus.js"
import { Actions, Directions, GameStates, AnimalStates, Levels, PlayerStates, Sounds } from "../enums.js";


export class GameManager {
  canvas = null;
  ctx = null;

  level = null;
  state = null;

  factory = {};

  sprite_manager = new SpriteManager();
  sound_manager = sm;
  events_manager = null;


  constructor(event_manager) {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.factory['Player'] = Player;
    this.factory['Animal'] = Animal;
    this.factory['Bonus'] = Bonus;

    this.events_manager = event_manager;
    this.level = event_manager.level;
    this.state = event_manager.game_state;

    this.sprite_manager.loadAtlas("images/tale/tale.json", "images/tale/tale.png", 'tale');
    this.sprite_manager.loadAtlas("images/animals/cat.json", "images/animals/cat.png", 'cat');
    this.sprite_manager.loadAtlas("images/animals/bird.json", "images/animals/bird.png", 'bird');
    this.sprite_manager.loadAtlas("images/animals/raccoon.json", "images/animals/raccoon.png", 'raccoon');
    this.sprite_manager.loadAtlas("images/animals/fox.json", "images/animals/fox.png", 'fox');
    this.sprite_manager.loadAtlas("images/objects/atlas.json", "images/objects/atlas.png", 'cherry');

    this.sound_manager.loadArray([Sounds.animal, Sounds.win, Sounds.loose, Sounds.start]);
    this.loadAll();
  }

  initPlayer(obj) {
    this.player = obj;
    this.player.speed = 8;
    this.player.sound_manager = this.sound_manager;
    let self = this;
    let animation_id = 0;
    this.playerIntervalId = setInterval(function () {
      self.player.animation_id = animation_id++;
      animation_id %= 3;
    }, 100);
  }

  deleteObject(id) {
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i].id == id) {
        if (this.objects[i] instanceof Animal) {
          this.sound_manager.play(Sounds.animal, { 'volume': 0.7 });
          let animal_id = this.objects[i].id;

        } else if (this.objects[i] instanceof Player) {
          this.kill_player();
          break;
        }
        this.objects.splice(i, 1);
      }
    }
  }

  createGameObject(obj_type, id, name, x, y, w, h) {
    let game_object = new this.factory[obj_type];
    game_object.id = id
    game_object.name = name;
    game_object.pos_x = x;
    game_object.pos_y = y - h;
    game_object.size_x = w;
    game_object.size_y = h;
    game_object.sprite_manager = this.sprite_manager;
    game_object.game_manager = this;

    if (obj_type !== "Bonus") {
      game_object.physic_manager = this.physic_manager;
    } else {
      game_object.type = name;
    }

    if (obj_type === "Animal") {
      game_object.animal_manager = this.animal_manager;
      game_object.speed = 8;
      if (this.player && this.player.power) {
        game_object.state = AnimalStates.afraid;
      }
    }

    this.objects.push(game_object)
    if (obj_type === "Player") {
      this.initPlayer(game_object);
    }
    game_object.draw(this.ctx);
  }

  draw() {
    this.objects.forEach((object) => {
      object.draw(this.ctx)
    })
  }

  update() {
    //console.log(this.state)
    this.showInfo();
    this.check_game_state();

    if (this.state == GameStates.stop) {
      //console.log('stop');
      return;
    }

    if (this.player === null) {
      return;
    }

    if (this.is_end_game()) {
      this.game_win();
    }

    if (this.player.state !== PlayerStates.dead) {
      if (this.events_manager.action !== Actions.stay) {
        this.player.state = PlayerStates.move;
      } else {
        this.player.state = PlayerStates.stay;
      }

      switch (this.events_manager.action) {
        case Actions.move_up:
          this.player.request_direction = Directions.up;
          break;
        case Actions.move_down:
          this.player.request_direction = Directions.down;
          break;
        case Actions.move_left:
          this.player.request_direction = Directions.left;
          break;
        case Actions.move_right:
          this.player.request_direction = Directions.right;
          break;
      }
    }

    this.objects.forEach(function (e) {
      try {
        e.update();
      } catch (ex) { }
    });

    this.map_manager.draw(this.canvas, this.ctx);
    //this.map_manager.centerAt(this.player.pos_x, this.player.pos_y);
    this.draw();
  }

  loadAll() {
    clearTimeout(this.powerTimerId_1);
    clearTimeout(this.powerTimerId_2);
    clearInterval(this.animalIntervalId);
    this.sound_manager.stopAll();
    this.objects = [];
    this.player = null;

    this.powerTimerId_1 = null;
    this.powerTimerId_2 = null;
    this.animalIntervalId = null;

    //console.log('load all');
    this.map_manager = new MapManager();
    this.physic_manager = new PhysicManager();
    this.animal_manager = new AnimalManager();

    // Настройка менеджеров игры
    this.map_manager.loadMap(this.level);
    this.sprite_manager.map_manager = this.map_manager;
    this.physic_manager.map_manager = this.map_manager;
    this.physic_manager.game_manager = this;
    this.animal_manager.map_manager = this.map_manager;
    this.animal_manager.game_manager = this;

    this.map_manager.draw(this.canvas, this.ctx);
    this.map_manager.parseEntities(this);
    this.draw();
  }

  power_mode() {
    let self = this;

    if (this.player.power) {
      clearTimeout(this.powerTimerId_1);
      clearTimeout(this.powerTimerId_2);
      clearInterval(this.animalIntervalId);
      this.sound_manager.stopAll();
    }

    this.player.power = true;
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i] instanceof Animal) {
        this.objects[i].state = AnimalStates.afraid;
        this.objects[i].animation_id = 0;
      }
    }
    this.powerTimerId_1 = setTimeout(() => {
      let animal_animation_id = 0;
      this.animalIntervalId = setInterval(function () {
        for (let i = 0; i < self.objects.length; i++) {
          if (self.objects[i] instanceof Animal) {
            self.objects[i].animation_id = animal_animation_id;
          }
        }
        animal_animation_id++;
        animal_animation_id %= 2;
      }, 300);
      this.powerTimerId_2 = setTimeout(() => {
        for (let i = 0; i < self.objects.length; i++) {
          if (self.objects[i] instanceof Animal) {
            self.objects[i].state = AnimalStates.search;
          }
        }
        self.player.power = false;
        clearInterval(self.animalIntervalId);
        this.sound_manager.stopAll();
      }, 2000);
    }, 3000);
  }

  kill_player() {
    console.log('kill')
    this.sound_manager.play(Sounds.loose, { 'volume': 0.7 });
    this.state = GameStates.stop;
    this.events_manager.game_state = this.state;
    //console.log(this.state === GameStates.stop)
    setTimeout(() => {
      this.stop_game();
      this.end_level();
      window.location.href = '/score';
    }, 3000)

  }

  revive_animal(animal_id) {
    let self = this;
    setTimeout(() => {
      this.map_manager.parseAnimal(this, animal_id);
    }, 5000);
  }

  play(updateWorld) {
    //console.log('playing')

    let self = this;
    //self.sound_manager.play(Sounds.start, { 'volume': 0.7 });
    this.gameIntervalId = setInterval(updateWorld, 50);
  }

  is_end_game() {
    //console.log('checking')
    let is_end_game = true;
    this.objects.forEach((object) => {
      if (object instanceof Bonus || object instanceof Animal) {
        is_end_game = false;
      }
    })
    return is_end_game;
  }

  game_win() {
    //console.log('win')
    //clearInterval(this.gameIntervalId);
    this.state = GameStates.stop;
    this.events_manager.game_state = this.state;
    let self = this;
    self.sound_manager.stopAll();
    self.sound_manager.play(Sounds.win, { 'volume': 0.7 });
    setTimeout(() => {
      this.stop_game();
      this.end_level();
      window.location.href = '/score';
    }, 3000)
  }

  check_game_state() {
    //console.log('checkstate')
    //console.log(this.events_manager.game_state)
    //console.log(this.events_manager.is_end_game)
    if (this.state !== this.events_manager.game_state) {
      this.state = this.events_manager.game_state;
    }
    if (this.level !== this.events_manager.level) {
      console.log('change_level')
      this.end_level();
      this.level = this.events_manager.level;
      this.loadAll();
    }
    if (this.events_manager.is_end_game && this.is_end_game()) {
      this.stop_game();
      this.end_level();
      window.location.href = '/score';
    }
  }

  end_level() {
    let scores = JSON.parse(localStorage['game.scoreTable']);
    if (scores.length < 11 || parseInt(this.player.points) >= parseInt(scores[scores.length - 1])) {
      this.username = localStorage["game.username"];
      let flag = false;
      scores.forEach(temp => {
        if (temp.name === this.username) {
          if (temp.score < this.player.points) {
            temp.score = this.player.points;
          }
          flag = true;
        }
      })
      if (!flag) {
        let temp = {
          'score': this.player.points,
          'name': this.username
        }
        scores.push(temp);
      }
      scores.sort((a, b) => b.score - a.score);
      localStorage['game.scoreTable'] = JSON.stringify(scores);
    }



    //console.log('end_level')
    //let score_table = JSON.parse(localStorage["game.scoreTable"]);
    //let is_exists_username = false;
    //let level = (this.level == Levels.level_1) ? 1 : 2;
    //let score = this.player.points;

    ///* Updating a user's result or creating a new entry */
    //for (let i = 0; i < score_table.length; i++) {
    //  if (score_table[i].name == localStorage["game.username"] && score_table[i].level == level) {
    //    score_table[i].score = score;
    //    is_exists_username = true;
    //    break
    //  }
    //}

    //if (!is_exists_username) {
    //  score_table.push({
    //    name: localStorage["game.username"],
    //    level: level,
    //    score: score
    //  })
    //}

    //localStorage["game.scoreTable"] = JSON.stringify(score_table)
  }

  stop_game() {
    console.log('stop game')
    clearInterval(this.gameIntervalId);
    clearTimeout(this.powerTimerId_1);
    clearTimeout(this.powerTimerId_2);
    clearInterval(this.animalIntervalId);
    clearInterval(this.animalIntervalId);
    clearInterval(this.playerIntervalId);
  }

  showInfo() {
    if (this.player) {
      document.getElementById('username').innerHTML = `Username: ${window.localStorage['game.username']}`;
      document.getElementById('level').innerHTML = `Level: ${(this.level === Levels.level_1) ? 1 : 2}`;
      document.getElementById('score').innerHTML = `Score: ${this.player.points}`;
    }
  }
}