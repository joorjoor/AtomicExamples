
"atomic component";

var component = function (self) {

    var inspectorFields = {
        parallaxEffect: 0.1
    }

    var node = self.node; // get node
    var startPos, length, camera, temp, dist, child;

    var game = Atomic.game;
    var camera = game.getCameraNode();


    self.start = function() {
        startPos = node.getPosition2D()[0]; // get position x
        length = 3.84;
    }

    self.update = function(timeStep) {
        x = camera.getPosition2D()[0];
        posY = camera.getPosition2D()[1];

        temp = x * (1 - self.parallaxEffect);
        dist  = x * self.parallaxEffect;

        posX = startPos + dist;
        //move background
        node.setPosition2D([posX, posY]);
        if (temp > startPos + length)
            startPos += length;
        else if (temp < startPos - length)
            startPos -= length;
        
    }
}

exports.component = component;
