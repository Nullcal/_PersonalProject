let jsonBlock, jsonPreset;
//
$.getJSON("data/presets_NewCOSMOS.json", function(data) {
  jsonPreset = data;
});
$.getJSON("data/blocks_NewCOSMOS.json", function(data) {
  jsonBlock = data;
});
