// This script is the main entry point of the game

var halfWidth = Atomic.graphics.width * Atomic.PIXEL_SIZE * 0.5;
var halfHeight = Atomic.graphics.height * Atomic.PIXEL_SIZE * 0.5;


var maxX = halfWidth;
var minX = -halfWidth;
var maxY = halfHeight;
var minY = -halfHeight;


Atomic.player.loadScene("Scenes/Scene.scene");

var scene = Atomic.player.currentScene;

var sheet = Atomic.cache.getResource("SpriteSheet2D", "Sprites/bunnys_sheet.xml");

var bunny1 = sheet.getSprite("bunny1");
var bunny2 = sheet.getSprite("bunny2");
var bunny3 = sheet.getSprite("bunny3");
var bunny4 = sheet.getSprite("bunny4");
var bunny5 = sheet.getSprite("bunny5");

var bunnyTextures = [bunny1, bunny2, bunny3, bunny4, bunny5];
var bunnyType = 2;
var currentTexture = bunnyTextures[bunnyType];

var bunnys = [];
var count = 0;
var amount = 3;
var gravity = -0.5;

// TODO: we hold a reference to the node in script, otherwise it is GC'd
// and the object rewrapped every time bunny.node is accessed!

var nodes = [];

var isAdding = false;

scene.subscribeToEvent(Atomic.MouseButtonDownEvent(function() {

    isAdding = true;

}));

scene.subscribeToEvent(Atomic.MouseButtonUpEvent(function() {

    isAdding = false;
    bunnyType++;
    bunnyType %= 5;
    currentTexture = bunnyTextures[bunnyType];
}));


exports.update = function() {

    var scale = [0, 0];

    if (isAdding) {

        if (count < 200000) {

            for (var i = 0; i < amount; i++) {

                var node = scene.createChild();
                nodes.push(node);
                var bunny = node.createComponent("StaticSprite2D");
                bunny.blendMode = Atomic.BlendMode.BLEND_ALPHA;
                bunny.sprite = currentTexture;

                bunny.position = [minX, maxY];
                bunny.speedX = Math.random() * 10;
                bunny.speedY = (Math.random() * 10) - 5;

                //bunny.anchor.y = 1;

                bunnys.push(bunny);


                scale[0] = scale[1] = (0.5 + Math.random() * 0.5);
                bunny.scale2D = scale;

                bunny.rotation2D = (Math.random() - 0.5);
                count++;
            }
        }

    }

    var len = bunnys.length;
    
    for (var i = 0; i < len; i++) {

        var bunny = bunnys[i];
        var p = bunny.position;

        var px = p[0];
        var py = p[1];

        var speedX = bunny.speedX;
        var speedY = bunny.speedY;

        px += speedX * .002;
        py += speedY * .002;

        if (px > maxX) {
            speedX *= -1;
            px = maxX;
        } else if (px < minX) {
            speedX *= -1;
            px = minX;
        }

        if (py > maxY) {
            speedY = 0;
            py = maxY;

        } else if (py < minY) {

            speedY *= -0.95;

            if (Math.random() > 0.5) {
                speedY -= Math.random() * 6;
            }

            py = minY;
        }

        bunny.speedX = speedX;
        bunny.speedY = speedY + gravity;

        p[0] = px;
        p[1] = py;
        nodes[i].position2D = p;

    }

};

createInstructions();

function createInstructions() {

  var view = new Atomic.UIView();

  // Create a layout, otherwise child widgets won't know how to size themselves
  // and would manually need to be sized
  var layout = new Atomic.UILayout();

  // specify the layout region
  layout.rect = view.rect;

  view.addChild(layout);

  // we're laying out on the X axis so "position" controls top and bottom alignment
  layout.layoutPosition = Atomic.UI_LAYOUT_POSITION.UI_LAYOUT_POSITION_RIGHT_BOTTOM;
  // while "distribution" handles the Y axis
  layout.layoutDistributionPosition = Atomic.UI_LAYOUT_DISTRIBUTION_POSITION.UI_LAYOUT_DISTRIBUTION_POSITION_RIGHT_BOTTOM;
    
  var fd = new Atomic.UIFontDescription();
  fd.id = "Vera";
  fd.size = 18;
    
  var scoreText = new Atomic.UIEditField();
  scoreText.fontDescription = fd;
  scoreText.readOnly = true;
  scoreText.multiline = true;
  scoreText.adaptToContentSize = true;
  scoreText.text = "BunnyMark\nLeft Click - Spawn Bunnies";
  layout.addChild(scoreText);
  }

