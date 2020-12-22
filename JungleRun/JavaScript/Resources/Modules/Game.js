/* global __js_atomicgame_update */
Atomic.editor = null;

function Game() {
    this.engine = Atomic.getEngine();
	this.cache = Atomic.getResourceCache();
	this.renderer = Atomic.getRenderer();
	this.graphics = Atomic.getGraphics();
	this.input = Atomic.getInput();
    this.player = Atomic.player;
}


Game.prototype.init = function() {
};

Game.prototype.getCameraNode = function() {
    return this.renderer.getViewport(0).getCamera().getNode();
};
//From low to hight (Float)
Game.prototype.random = function(low, high) {
  return Math.random() * (high - low) + low
}
//From 0 to max-1 (Int)
Game.prototype.getRandomInt = function(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

Game.prototype.restart = function() {
    this.player.unloadAllScenes();
    this.player.loadScene("Scenes/Scene.scene");
    //scene = this.player.getScene(0);
    //this.player.setCurrentScene(scene);
    
}

Atomic.game = exports.game = new Game();
