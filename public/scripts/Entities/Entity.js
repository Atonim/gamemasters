import { GameObject } from "./GameObject.js";
import { Directions } from "../enums.js";

export class Entity extends GameObject {
  /* Класс игровой сущности */

  direction = Directions.right;
  request_direction = Directions.right;
  animation_id = 0;
  speed = 0;
  physic_manager = null;
  tale = [];
  maxTaleLength = 12;

}