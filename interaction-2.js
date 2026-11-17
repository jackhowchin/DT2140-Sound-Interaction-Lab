//==========================================================================================
// AUDIO SETUP
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit just where you're asked to!
//------------------------------------------------------------------------------------------
//
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;

// Change here to ("tuono") depending on your wasm file name
const dspName = "door";
const instance = new FaustWasm2ScriptProcessor(dspName);

// output to window or npm package module
if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}

// The name should be the same as the WASM file, so change tuono with brass if you use brass.wasm
door.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        console.log('params: ', dspNode.getParams());
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams
        // const exampleMinMaxParam = findByAddress(dspNodeParams, "/thunder/rumble");
        // // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
        // const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
        // console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    });


//==========================================================================================
// INTERACTIONS
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit the next functions to create interactions
// Decide which parameters you're using and then use playAudio to play the Audio
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function accelerationChange(accx, accy, accz) {
    // playAudio()
}

// CREAKING DOOR: spin the phone while it lies flat on a table.
// rotz is the turn angle around the Z axis (0 to 360 degrees). How fast it changes = how fast we spin.
// Faster spin = more force on the hinge = stronger creak. No spin = silent.
let prevRotZ = null;
let spinSmooth = 0;

function rotationChange(rotx, roty, rotz) {
    if (!dspNode) return;
    if (prevRotZ === null) { prevRotZ = rotz; return; }
    // turn since the last frame, fixing the jump from 359 to 0
    let diff = rotz - prevRotZ;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    prevRotZ = rotz;
    // speed in degrees per frame (direction ignored), smoothed
    spinSmooth = spinSmooth + 0.1 * (abs(diff) - spinSmooth);
    if (spinSmooth > 0.5) {
        // 0.5 degrees per frame (about 30 deg/s) = barely spinning, 5 or more = fast
        dspNode.setParamValue("/door/door/position", constrain(map(spinSmooth, 0.5, 5, 0, 0.5), 0, 0.5));
        dspNode.setParamValue("/door/volume", 0.7);
    } else {
        dspNode.setParamValue("/door/volume", 0);
    }
}

function mousePressed() {
    // playAudio()
    // Use this for debugging from the desktop!
}

function deviceMoved() {
    movetimer = millis();
    statusLabels[2].style("color", "pink");
}

function deviceTurned() {
    threshVals[1] = turnAxis;
}
function deviceShaken() {
    shaketimer = millis();
    statusLabels[0].style("color", "pink");
}

function getMinMaxParam(address) {
    const exampleMinMaxParam = findByAddress(dspNodeParams, address);
    // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
    const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
    console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    return [exampleMinValue, exampleMaxValue]
}

//==========================================================================================
// AUDIO INTERACTION
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit here to define your audio controls 
//------------------------------------------------------------------------------------------
//
//==========================================================================================

// The door is controlled continuously from rotationChange above, so there is no playAudio here.
// Parameters used: "/door/door/position" (0 to 0.5) and "/door/volume" (0 to 1, kept at 0.7 or less).

//==========================================================================================
// END
//==========================================================================================