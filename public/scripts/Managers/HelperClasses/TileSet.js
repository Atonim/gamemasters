export class TileSet {
  /* Класс набора тайлов */

  constructor (firstgid, img, name, imagewidth, imageheight, tSizeX, tSizeY) {
      this.firstgid = firstgid;
      this.image = img;
      this.name = name;
      this.xCount = Math.floor(imagewidth / tSizeX);
      this.yCount = Math.floor(imageheight / tSizeY);
  }
};