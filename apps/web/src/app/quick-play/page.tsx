import GameCollection from "@/components/GameCollection";
export const metadata = {title:"Quick Play | WebGameArena", description:"Choose a browser game by its first challenge and controls.", alternates:{canonical:"/quick-play"}};
export default function QuickPlay(){
  return <GameCollection title="Quick Play" intro="Choose one thing to master in your next round." games={[
    {slug:"bubble-pop-arena",title:"Pop a chain",goal:"Coral Kingdom starts with a countdown. Keep the combo going and watch for bubbles that add time.",controls:"Tap or drag to pop. Avoid red bombs."},
    {slug:"stack-tower",title:"Land a perfect drop",goal:"Harbour Heights opens with a three-perfect-drop contract. Line up each moving block with the one below.",controls:"Tap to drop when the edges meet."},
    {slug:"fruit-slice",title:"Slice your first 13 fruit",goal:"First Slice starts with 50 seconds, a 270-point target and 13 fruit to slice.",controls:"Drag or swipe across fruit. Let bombs pass."},
    {slug:"word-dash",title:"Light the first beacon",goal:"Salvage six targets in Amber Relay, including its beacon word.",controls:"Type or tap letters to shoot. Spell a whole comet to break it."}
  ]}/>;
}
