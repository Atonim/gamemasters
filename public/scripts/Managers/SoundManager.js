export const sm = new class SoundManager {
  clips = {};
  context = null;
  gainNode = null;
  loaded = false;
  path_array = [];

  constructor() {
    this.context = new AudioContext();
    this.gainNode = this.context.createGain ? this.context.createGain() : this.context.createGainNode();
    this.gainNode.connect(this.context.destination);
  }

  load(path, callback) {
    let self = this;
    console.log(this.clips[path])
    if (this.clips[path]) {
      callback(this.clips[path]);
      return;
    }
    let clip = { path: path, buffer: null, loaded: false };

    clip.play = function (volume, loop) {
      self.play(this.path, {
        looping: loop ? loop : false,
        volume: volume ? volume : 1
      });
    };
    this.clips[path] = clip;
    let request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
      self.context.decodeAudioData(request.response, function (buffer) {
        clip.buffer = buffer;
        clip.loaded = true;
        callback(clip);
      });
    };
    console.log(request)
    request.send();
  }

  loadArray(array) {
    this.path_array = array;
    let self = this;

    for (let i = 0; i < array.length; i++) {
      this.load(array[i], function () {
        if (array.length === Object.keys(self.clips).length) {
          for (let sd in self.clips) {
            if (!self.clips[sd].loaded) return;
          }
          console.log('zagruzhaem')
          self.loaded = true;
        }
      });
    }
  }

  play(path, settings) {
    console.log('mda')
    let self = this;

    if (!this.loaded) {
      console.log('mb tut')
      setTimeout(function () {
        self.play(path, settings);
      }, 1000);
    }
    let looping = false;
    let volume = 1;
    if (settings) {
      if (settings.looping) {
        looping = settings.looping;
      }
      if (settings.volume) {
        volume = settings.volume;
      }
    }
    let sd = this.clips[path];
    console.log(sd)
    if (sd === null)
      return false;

    let sound = this.context.createBufferSource();
    sound.buffer = sd.buffer;
    sound.connect(this.gainNode);
    sound.loop = looping;
    this.gainNode.gain.value = volume;
    //console.log(volume);
    sound.start(0);

    return true;
  }

  stopAll() {
    this.gainNode.disconnect();
    this.gainNode = this.context.createGain ? this.context.createGain() : this.context.createGainNode();
    this.gainNode.connect(this.context.destination);

    this.loadArray(this.path_array);
  }
}