
"atomic component";

var component = function (self) {

    var game = Atomic.game;
    var input = game.input;
    var key = game.key;

    var node = self.node;
    var ground = [];

     var index = 0;

    self.start = function() {
        scene = node.getScene();
        ground[0] = scene.getChildrenWithName('Ground0')[0];
        ground[1] = scene.getChildrenWithName('Ground')[0];
    }

    self.update = function(timeStep) {
        moveShip(timeStep);
    }


    function moveShip(timeStep) {
        var speed = 3.0 * timeStep;

        var pos = node.position2D;
        var gpos = ground[index].getPosition2D();

       if (gpos[0] + 4 < pos[0])
        {
            index = index == 0 ? 1 : 0;
            ground[index].setPosition2D([gpos[0]+8.5, gpos[1]]); 
            ground[index].getComponent('TileMap2D').setTmxFile(game.cache.getResource('TmxFile2D', 'Sprites/jungle_tileset/ground' + game.getRandomInt(4) + '.tmx'));
            //ground[index].
        }
        /*if (input.getKeyDown(Atomic.KEY_A))
        pos[0] -= speed;

        if (input.getKeyDown(Atomic.KEY_W))
        pos[1]+=0.1;
        */
        pos[0] += speed;

        node.position2D = pos;

  }
}

exports.component = component;
