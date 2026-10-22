/* Number City: selected CAPS Grade 4 skills. Learning state is independent of Sprint scores. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MathLearning = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const KEY = 'wga_math_sprint_learning_v1';
  const SOURCES = [
    'https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements%28CAPS%29/CAPSIntermediate/tabid/572/Default.aspx',
    'https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20IP%20%20MATHEMATICS%20GR%204-6%20web.pdf'
  ];
  const task = (kind, prompt, answer, hints, detail = {}) => ({ kind, prompt, answer: String(answer), hints, ...detail });
  const place = n => task('place', `Build ${n.toLocaleString('en-ZA').replace(/,/g, ' ')} using place value.`, n,
    ['Each column is worth ten times the column on its right.', `Read the digits from thousands to ones. Zero means there are none in that column.`, `${n} = ${Math.floor(n/1000)*1000} + ${Math.floor(n/100)%10*100} + ${Math.floor(n/10)%10*10} + ${n%10}.`],
    { value: n, explanation: `${n} has ${Math.floor(n/1000)} thousands, ${Math.floor(n/100)%10} hundreds, ${Math.floor(n/10)%10} tens and ${n%10} ones.`, worked: `${n} = ${Math.floor(n/1000)*1000} + ${Math.floor(n/100)%10*100} + ${Math.floor(n/10)%10*10} + ${n%10}` });
  const line = (a, b) => task('line', `Start at ${a}. Move ${Math.abs(b)} ${b>0?'forward':'backward'}. Where do you land?`, a+b,
    [`Moving ${b>0?'forward adds':'backward subtracts'}.`, `Break ${Math.abs(b)} into hundreds, tens and ones, then move in smaller jumps.`, `${a} ${b>0?'+':'−'} ${Math.abs(b)} = ${a+b}.`],
    { a, b, explanation: `A move of ${b} changes ${a} to ${a+b}. You can check by moving ${Math.abs(b)} in the opposite direction.`, worked: `${a} ${b>0?'+':'−'} ${Math.abs(b)} = ${a+b}` });
  const calc = (a, b, op) => {
    const add = op==='+'; const answer=add?a+b:a-b;
    return task('entry', `${a} ${add?'+':'−'} ${b} = ?`, answer,
      [`Line up thousands, hundreds, tens and ones. ${add?'Add':'Subtract'} from the ones column.`, add?'Ten ones can be exchanged for one ten. Regroup whenever a column reaches ten.':'If the top digit is too small, exchange one from the column on its left for ten in this column.', `${a} ${add?'+':'−'} ${b} = ${answer}. Check with ${add?'subtraction':'addition'}.`],
      { a,b,op,explanation: add?`${a} + ${b} = ${answer}. Check: ${answer} − ${b} = ${a}.`:`${a} − ${b} = ${answer}. Check: ${answer} + ${b} = ${a}.`,worked:`${a} ${add?'+':'−'} ${b} = ${answer}` });
  };
  const array = (groups,each) => task('array', `${groups} groups have ${each} energy cells each. How many cells altogether?`, groups*each,
    ['An array arranges equal groups into rows.', `Count ${groups} groups of ${each}, or multiply ${groups} × ${each}.`, `${groups} × ${each} = ${groups*each}.`],
    { groups,each,explanation:`${groups} equal groups of ${each} make ${groups*each}. Swapping the rows and columns gives the same total.`,worked:`${groups} × ${each} = ${groups*each}` });
  const share = (total,groups) => task('share', `Share ${total} cells equally between ${groups} generators. How many cells does each get?`, total/groups,
    ['Equal sharing gives every generator the same amount.', `Find the number that makes ${groups} × ? = ${total}.`, `${total} ÷ ${groups} = ${total/groups}.`],
    { total,groups,explanation:`Each generator gets ${total/groups} cells because ${groups} × ${total/groups} = ${total}. Nothing is left over.`,worked:`${total} ÷ ${groups} = ${total/groups}` });
  const pattern = (values,answer,rule) => task('pattern', `Complete the track: ${values.join(', ')}, ?`, answer,
    ['Compare each number with the next one.', `Use the same rule at every step: ${rule}.`, `The next number is ${answer}.`],
    { values,explanation:`The rule is ${rule}. Applying it once more gives ${answer}.`,worked:`${values.join(' → ')} → ${answer}` });
  const money = (prompt, cents,working) => task('money', prompt, (cents/100).toFixed(2),
    ['Keep rands and cents in the correct columns. There are 100 cents in R1.', 'Work out whether you need a total, change, or equal groups. Write the calculation first.', `${working}. The amount is R${(cents/100).toFixed(2)}.`],
    { explanation:`${working}. Answer: R${(cents/100).toFixed(2)}.`,worked:working });
  const fraction = (parts,take) => task('fraction', `Light up ${take}/${parts} of the bridge. Tap equal parts to turn them on or off.`, `${take}/${parts}`,
    [`The denominator ${parts} tells you how many equal parts make the whole.`, `The numerator ${take} tells you how many parts to light.`, `Light exactly ${take} out of the ${parts} equal parts.`],
    { parts,take,explanation:`${take} of ${parts} equal parts is ${take}/${parts} of the whole. The parts must all have the same size.`,worked:`${take} selected ÷ ${parts} equal parts = ${take}/${parts}` });
  const missions = [
    { id:'place-power',title:'Place Value Power',skill:'Place value',background:'arithmetic',story:'Pi-Bot needs four power columns to wake the city. Build each number to light the gate.',lesson:'A digit’s value depends on its position. Use + and − to build the number, then check it.',tasks:[3245,5082,6400,7036,9999].map(place) },
    { id:'number-bridge',title:'Number Line Bridge',skill:'Mental calculation',background:'arithmetic',story:'The bridge is missing its landing points. Help Pi-Bot navigate forward and backward safely.',lesson:'Break a move into smaller jumps. Adding moves forward; subtracting moves backward.',tasks:[[236,40],[470,125],[389,200],[650,-80],[1200,-350]].map(v=>line(...v)) },
    { id:'addition-workshop',title:'Addition Workshop',skill:'Whole-number addition',background:'arithmetic',story:'Engineers are combining energy supplies. Calculate the totals to restart the workshop.',lesson:'Line up place values. Exchange ten ones for a ten whenever a column needs regrouping.',tasks:[[1243,2135],[2468,1357],[3509,2186],[4075,3268],[5876,2947]].map(v=>calc(...v,'+')) },
    { id:'subtraction-station',title:'Subtraction Station',skill:'Whole-number subtraction',background:'arithmetic',story:'Find the energy left after each delivery. The station needs accurate readings to stay running.',lesson:'Subtract in place-value columns. Exchange from the next column when needed, then check by adding.',tasks:[[4865,1234],[5324,2187],[7000,2456],[8642,3758],[9030,4675]].map(v=>calc(...v,'−')) },
    { id:'array-engines',title:'Array Engines',skill:'Multiplication',background:'multiplication',story:'Activate equal rows of energy cells. Each complete array brings another engine online.',lesson:'Multiplication counts equal groups. Rows × cells in each row gives the total.',tasks:[[3,4],[4,6],[6,7],[5,12],[4,23]].map(v=>array(...v)) },
    { id:'sharing-station',title:'Sharing Station',skill:'Division',background:'multiplication',story:'Share the energy fairly between the generators. Every neighbourhood needs the same supply.',lesson:'Division can mean equal sharing. Check your share by multiplying it by the number of groups.',tasks:[[24,4],[42,6],[72,8],[96,4],[144,6]].map(v=>share(...v)) },
    { id:'pattern-tracks',title:'Pattern Tracks',skill:'Number patterns',background:'algebra',story:'The tram signals follow number patterns. Discover each rule to reconnect the city.',lesson:'A pattern follows a rule. Compare neighbouring numbers and check your rule on every step.',tasks:[pattern([12,16,20,24],28,'add 4'),pattern([95,90,85,80],75,'subtract 5'),pattern([125,150,175,200],225,'add 25'),pattern([3,6,12,24],48,'multiply by 2'),pattern([640,320,160,80],40,'divide by 2')] },
    { id:'market-mission',title:'Market Mission',skill:'Money problems',background:'multiplication',story:'Help the workshop shop buy supplies and return the correct change. Every rand counts.',lesson:'Read what is being asked. Use rands and cents, and estimate to check whether the result makes sense.',tasks:[money('Two cables cost R12.50 each. What is the total cost in rands?',2500,'R12.50 × 2 = R25.00'),money('A toolkit costs R37.50. You pay R50.00. How much change do you get in rands?',1250,'R50.00 − R37.50 = R12.50'),money('A lamp costs R18.75 and a switch costs R6.25. What is the total in rands?',2500,'R18.75 + R6.25 = R25.00'),money('Four friends share a R60.00 bill equally. How much does each pay in rands?',1500,'R60.00 ÷ 4 = R15.00'),money('You have R100.00. Three batteries cost R24.00 each. How many rands remain?',2800,'3 × R24.00 = R72.00; R100.00 − R72.00 = R28.00')] },
    { id:'fraction-bridge',title:'Fraction Bridge',skill:'Common fractions',background:'fractions',story:'Restore the bridge with equal sections of light. Pi-Bot will cross when the right fraction is ready.',lesson:'A fraction describes equal parts of a whole. The bottom number counts all parts; the top counts selected parts.',tasks:[[4,2],[3,1],[6,4],[8,3],[10,7]].map(v=>fraction(...v)) },
    { id:'city-champion',title:'Number City Champion',skill:'Mixed application',background:'geometry',story:'The final gate combines everything you have practised. Restore the city and celebrate with Pi-Bot.',lesson:'Choose a strategy for each task. Take your time, use a hint if needed, and check your reasoning.',tasks:[place(8064),array(7,12),money('A replacement part costs R46.50. You pay R100.00. Find your change in rands.',5350,'R100.00 − R46.50 = R53.50'),fraction(8,6),task('perimeter','A rectangular platform is 8 m long and 5 m wide. What is its perimeter in metres?',26,['Perimeter is the distance all the way around the outside.','A rectangle has two lengths and two widths. Add all four sides.','8 + 5 + 8 + 5 = 26 m.'],{length:8,width:5,explanation:'8 + 5 + 8 + 5 = 26 m. Perimeter uses units of length, not square units.',worked:'2 × (8 + 5) = 26 m'})] }
  ];
  missions.forEach((m,i)=>{m.grade=4;m.number=i+1;m.tasks.forEach((t,j)=>{t.id=`${m.id}-${j+1}`;});});
  const object = v => v && typeof v==='object' && !Array.isArray(v);
  const integer = (v,a,b) => Number.isInteger(v)&&v>=a&&v<=b;
  function rational(raw) {
    const s=String(raw??'').trim().replace(/−/g,'-').replace(/\s/g,'');
    if(s.length>24)return null;
    let m=s.match(/^([+-]?\d+)\/([+-]?\d+)$/);
    if(m){const n=BigInt(m[1]),d=BigInt(m[2]);return d===0n?null:{n,d};}
    m=s.match(/^([+-]?\d+)(?:[.,](\d{1,6}))?$/);if(!m)return null;
    const d=10n**BigInt((m[2]||'').length);const sign=m[1].startsWith('-')?-1n:1n;
    return {n:BigInt(m[1])*d+sign*BigInt(m[2]||'0'),d};
  }
  function equivalent(a,b){const x=rational(a),y=rational(b);return !!(x&&y&&x.n*y.d===y.n*x.d);}
  function fresh(mode='adventure',mission=0){return {mode,mission,index:0,steps:missions[mission].tasks.map(()=>({done:false,mistakes:0,hints:0})),draft:'',feedback:''};}
  function valid(s){
    if(!object(s)||!['learn','adventure'].includes(s.mode)||!integer(s.mission,0,missions.length-1)||!integer(s.index,0,5)||!Array.isArray(s.steps)||s.steps.length!==5)return false;
    if(!s.steps.every((v,i)=>object(v)&&typeof v.done==='boolean'&&integer(v.mistakes,0,1000)&&integer(v.hints,0,3)&&(i<s.index?v.done:i>s.index?!v.done:true)))return false;
    if(typeof s.draft!=='string'||s.draft.length>24||!['','wrong','correct','hint'].includes(s.feedback))return false;
    return s.index<5||s.steps.every(v=>v.done);
  }
  const empty = ()=>({version:1,results:{},sessions:{adventure:null,learn:null},activeMode:'adventure',settings:{music:.35,sfx:.65}});
  function unlocked(p){let n=0;while(n<missions.length-1&&p.results[missions[n].id])n++;return n;}
  function normalize(raw){
    const p=empty();if(!object(raw)||raw.version!==1)return p;
    if(object(raw.results))for(const m of missions){const r=raw.results[m.id];if(object(r)&&integer(r.independent,0,5)&&integer(r.assisted,0,5)&&r.independent+r.assisted===5)p.results[m.id]={independent:r.independent,assisted:r.assisted};}
    // Completed chapters must form a contiguous path. Never invent missing completion.
    let gap=false;for(const m of missions){if(!p.results[m.id])gap=true;if(gap)delete p.results[m.id];}
    if(object(raw.sessions))for(const mode of ['adventure','learn']){const s=raw.sessions[mode];if(valid(s)&&s.mode===mode&&(mode==='learn'||s.mission<=unlocked(p)))p.sessions[mode]=JSON.parse(JSON.stringify(s));}
    if(['adventure','learn'].includes(raw.activeMode))p.activeMode=raw.activeMode;
    if(object(raw.settings))for(const key of ['music','sfx'])if(Number.isFinite(raw.settings[key]))p.settings[key]=Math.max(0,Math.min(1,raw.settings[key]));
    return p;
  }
  const current=s=>s.index<5?missions[s.mission].tasks[s.index]:null;
  function submit(s,value){
    if(!valid(s)||s.index>=5||s.steps[s.index].done)return {ok:false,ignored:true};
    const t=current(s);if(!rational(value))return {ok:false,empty:true};
    const progress=s.steps[s.index];s.draft=String(value).slice(0,24);
    if(equivalent(value,t.answer)){progress.done=true;s.feedback='correct';return {ok:true,independent:progress.mistakes===0&&progress.hints===0};}
    progress.mistakes=Math.min(1000,progress.mistakes+1);s.feedback='wrong';return {ok:false};
  }
  function hint(s){if(!valid(s)||s.index>=5||s.steps[s.index].done)return null;const p=s.steps[s.index];p.hints=Math.min(3,p.hints+1);s.feedback='hint';return current(s).hints[p.hints-1];}
  function advance(profile,s){
    if(!valid(s)||s.index>=5||!s.steps[s.index].done)return false;
    s.index++;s.draft='';s.feedback='';
    if(s.index===5&&s.mode==='adventure'){
      const independent=s.steps.filter(p=>p.mistakes===0&&p.hints===0).length,m=missions[s.mission],old=profile.results[m.id];
      if(!old||old.independent<independent)profile.results[m.id]={independent,assisted:5-independent};
    }
    return true;
  }
  function stars(r){return !r?0:r.independent===5?3:r.independent>=3?2:1;}
  return {KEY,SOURCES,missions,rational,equivalent,fresh,valid,normalize,unlocked,current,submit,hint,advance,stars};
});
