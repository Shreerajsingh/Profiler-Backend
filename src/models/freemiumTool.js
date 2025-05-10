const mongoose = require("mongoose");

const freemiumToolSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  simspy: { 
    type: Number, 
    default: 2
  },
  callspy: { 
    type: Number, 
    default: 2
  },
  mail2linkedin: { 
    type: Number, 
    default: 2
  },
  linkedin2mail: { 
    type: Number, 
    default: 0
  },
  xscan: { 
    type: Number, 
    default: 3
  },
  socialmediafinder: { 
    type: Number, 
    default: 2
  },
});


const FreemiumTool = mongoose.model("FreemiumTool", freemiumToolSchema);
module.exports = FreemiumTool;