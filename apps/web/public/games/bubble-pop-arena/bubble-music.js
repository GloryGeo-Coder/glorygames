/* Original Bubble Pop Arena arena soundtrack catalogue. */
(function(root){
  const tracks=[{"id":1,"title":"Coral Kingdom","bpm":104,"duration":73.846,"url":"./assets/music/bubble-01.mp3"},{"id":2,"title":"Moonlit Lagoon","bpm":108,"duration":71.111,"url":"./assets/music/bubble-02.mp3"},{"id":3,"title":"Cosmic Drift","bpm":112,"duration":68.571,"url":"./assets/music/bubble-03.mp3"},{"id":4,"title":"Jellylight Grotto","bpm":106,"duration":72.453,"url":"./assets/music/bubble-04.mp3"},{"id":5,"title":"Aurora Garden","bpm":110,"duration":69.818,"url":"./assets/music/bubble-05.mp3"},{"id":6,"title":"Solar Oasis","bpm":116,"duration":66.207,"url":"./assets/music/bubble-06.mp3"}];
  if(typeof module==="object"&&module.exports)module.exports=tracks;else root.BubbleMusic=tracks;
})(typeof window!=="undefined"?window:globalThis);
