export {includeBones,excludeBones}

// Bone inclusion and exclusion functions by user mjurczyk on THREEJS Discours
// https://discourse.threejs.org/t/animation-replace-blend-mode/51804

function includeBones(action, filterBones){
    // function by mjurczyk on https://discourse.threejs.org/t/animation-replace-blend-mode/51804

    const filteredBindings = [];
    const filteredInterpolants = [];
    const bindings = action._propertyBindings || [];
    const interpolants = action._interpolants || [];
  
    bindings.forEach((propertyMixer, index) => {
  
       const { binding } = propertyMixer;
  
      if ((binding && binding.node && !filterBones.includes(binding.node.name))) {
        return;
      } else {
        filteredBindings.push(propertyMixer);
        filteredInterpolants.push(interpolants[index]);
  
      }
      });
  
    action._propertyBindings = filteredBindings;
    action._interpolants = filteredInterpolants;
  }
  
  function excludeBones(action, exculdeBones){
      // function by mjurczyk on https://discourse.threejs.org/t/animation-replace-blend-mode/51804
      const filteredBindings = [];
      const filteredInterpolants = [];
      const bindings = action._propertyBindings || [];
      const interpolants = action._interpolants || [];
    
      bindings.forEach((propertyMixer, index) => {
        const { binding } = propertyMixer;
    
        if (!(binding &&  binding.node && exculdeBones.includes( binding.node.name))) {
          filteredBindings.push(propertyMixer);
          filteredInterpolants.push(interpolants[index]);
        }
      });
    
      action._propertyBindings = filteredBindings;
      action._interpolants = filteredInterpolants;
  }