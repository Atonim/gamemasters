import { Entity } from "./Entity.js";
import { Bonus } from "./Bonus.js"
import { Animal } from "./Animal.js"
import { Bonuses, PlayerStates, Sounds } from "../enums.js";


export class Player extends Entity {
  /* Класс игрока */

  lifetime = 0;
  points = 0;
  power = false;
  state = PlayerStates.stay;
  sound_manager = null;

  update() {
    this.physic_manager.update(this);
  }

  kill() {
    this.game_manager.deleteObject(this.id);
  }

  take_bonus(bonus) {
    switch (bonus.type) {

      case Bonuses.cherry:
        this.points += 300;
        this.maxTaleLength += 2;
        break;
    }
  }

  onTouchObject(obj) {
    if (obj instanceof Bonus) {
      this.take_bonus(obj);
      obj.kill();
    } else if (obj instanceof Animal) {
      if (this.power) {
        obj.kill();
        this.sound_manager.play(Sounds.animal);
        this.points += 500;
      } else {
        this.kill();
      }
    } else if (obj instanceof Tale) {
      this.kill();
    }
  }

  draw(ctx) {
    this.sprite_manager.drawSprite(ctx, this);
  }

}