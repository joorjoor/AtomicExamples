"atomic component";

var component = function (self) {

    var game = Atomic.game;
    var input = game.input;
    var node = self.node;

    var contactCount = 0;
    var jumpDelta = 0;

    var status = 0;

    var anim ;
    var body;

	self.start = function() {
        sprite = node.getComponent('AnimatedSprite2D');
        body = node.getComponent('RigidBody2D');

        setAnimation('run');

         //subscribe to PhysicsBeginContact2D
        self.subscribeToEvent("PhysicsBeginContact2D", function(event) {
            //if bodyB is our body, so increment contactCount
            if (event.bodyA == body)
                contactCount++;
        });
        //subscribe to
        self.subscribeToEvent("PhysicsEndContact2D", function(event) {
            //if bodyB is our body, so decrement contactCount
            if (event.bodyA == body)
                contactCount--;
        });

	}

    self.update = function(timeStep) {
        handleStatus(timeStep);
        handleInput(timeStep);
        handleAnimation(timeStep);
    }

    function setAnimation(animName)
    {
        if (anim == animName)
            return;
        sprite.setAnimation(animName);
        anim = animName;
    }

    function handleStatus(timeStep){
        var nodePos = node.getPosition2D();
        if ((nodePos[0] <= -3.5 ||  nodePos[1] <= -1) && !status)
        {
            game.restart();
            status++;
        }
    }

     function handleAnimation(timeStep) {
        var vel = body.linearVelocity;
        //if we have a contact with something
        if (contactCount) {
            //if our velocity equals to zero, so set current animation to Idle animation
            setAnimation("run");
        } else {
            //if velocity by Y greater than 1, so we are jumping
            if (vel[1] > 1.0) {
                setAnimation("jump");
            //if velocity by Y is less than 1, so we are falling
            } else if (vel[1] < -1.0) {
                setAnimation("landing");
            }

        }
     }

    function handleInput(timeStep) {

        jumpDelta -= timeStep;
        var pos =  node.position2D;
        var vel = body.linearVelocity;

        var jump =  input.getKeyDown(Atomic.KEY_SPACE);
        
        if (Atomic.platform == "Android" || Atomic.platform == "iOS") {
            var numTouches = input.getNumTouches();
            //we want use only one finger, so return if there's more
            if (numTouches != 1) return;
            jump = true;
        }

        //if we are jumping and colliding with something
        if (jump && jumpDelta <= 0 && contactCount) {

            jumpDelta = .25;
            /*//is sound exists
            if (self.jumpSound) {
                soundSource.gain = 0.45;
                //playing sound
                soundSource.play(self.jumpSound);
            }*/
            
            vel[1] = 0;
            body.linearVelocity = vel;
            //applying linear impuls to the Y
            body.applyLinearImpulse([0, 3], pos, true);
        }

    

  }

}

exports.component = component;
