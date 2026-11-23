import GameCollection from "@/components/GameCollection";
export const metadata = {title:"Learning Arcade | WebGameArena", description:"Play hands-on activities in maths, biology, geography and physical science.", alternates:{canonical:"/learning-arcade"}};
export default function LearningArcade() {
  return <GameCollection title="Learning Arcade" intro="Pick a question and try it inside the game. These opening activities are drawn from the Grade 4 missions." games={[
    {slug:"math-sprint-arena", screenshot:"math.png", alt:"The four place-value columns for building 3 245", title:"Build a number", goal:"How do you make 3 245 from thousands, hundreds, tens and ones?", controls:"Choose Start Adventure in Math Sprint Arena for the untimed place-value activity."},
    {slug:"map-master-africa", screenshot:"geography.png", alt:"The interactive grid in The Missing Map Key", title:"Read a map key", goal:"Use symbols and a map key to interpret what an explorer sees.", controls:"Open The Missing Map Key in Map Master Africa. Use the map controls to pan, zoom and select."},
    {slug:"science-lab-dash", screenshot:"science.jpg", alt:"The Cold-Room Trail mission after resuming the campaign", title:"Investigate changes of state", goal:"What happens when a material heats up or cools down? Follow the evidence in the Cold-Room Trail.", controls:"Start with the first investigation in Science Lab Dash to unlock this second mission."},
    {slug:"bioquest-guardians-of-life", screenshot:"biology.png", alt:"The Grade 4 research garden investigation", title:"Investigate a living garden", goal:"Study a research garden and collect observations in a field journal.", controls:"Choose Start exploring in BioQuest, then begin The Garden Awakens."}
  ]}/>;
}
