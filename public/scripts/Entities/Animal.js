import { AnimalStates } from "../enums.js";
import { Entity } from "./Entity.js";
import { Bonus } from "./Bonus.js"
import { Player } from "./Player.js"
import { Bonuses, PlayerStates, Sounds } from "../enums.js";


export class Animal extends Entity {
  /* Класс привидения */

  lifetime = 0;
  state = AnimalStates.stay;
  animal_manager = null;

  draw(ctx) {
    this.sprite_manager.drawSprite(ctx, this);
  }

  update() {
    if (Number.isInteger(this.pos_x / 32) && Number.isInteger(this.pos_y / 32)) {

      this.animal_manager.update(this);
    }

    this.physic_manager.update(this);
  }

  take_bonus(bonus) {
    switch (bonus.type) {
      case Bonuses.cherry:
        this.maxTaleLength += 5;
        break;
    }
  }

  onTouchObject(obj) {
    if (obj instanceof Bonus) {
      console.log('bonus')
      this.take_bonus(obj);
      obj.kill();
    } else if (obj instanceof Player || obj instanceof Animal)
      this.kill()

  }

  kill() {
    this.game_manager.deleteObject(this.id);
  }
}