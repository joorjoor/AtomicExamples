"atomic component";

// a flickering light component
exports.component = function(self){
  var node = self.node;
  self.light = node.getComponent("Light");
  var baseRange = 45;
  var targetValue = baseRange;

  //define a flicker pattern
  var flicker = "mmmaaaammmaaaabcdefgabcdefg";
  var index = Math.random() * (flicker.length - 1);

  // make sure first update catches
  var time = 100;

  self.update = function(timestep) {

    time += timestep;
    if (time > .05)
    {
      index++;
      time = 0.0;
      if (index >= flicker.length)
        index = 0;

      targetValue = baseRange * (flicker.charCodeAt(index)/255);

    }

    if (self.light.range < targetValue)
      self.light.range += timestep * 10;

    if (self.light.range > targetValue)
      self.light.range -= timestep * 10;

  };
};
