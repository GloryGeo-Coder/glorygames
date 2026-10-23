/* Number City: selected CAPS Grade 4–9 skills. Learning state is independent of Sprint scores. */
(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./learning-extension.js') : root.MathLearningExtension, typeof module === 'object' && module.exports ? require('./learning-grade5.js') : root.MathGrade5, typeof module === 'object' && module.exports ? require('./learning-grade6.js') : root.MathGrade6, typeof module === 'object' && module.exports ? require('./learning-grade7.js') : root.MathGrade7, typeof module === 'object' && module.exports ? require('./learning-grade8.js') : root.MathGrade8, typeof module === 'object' && module.exports ? require('./learning-grade9.js') : root.MathGrade9);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MathLearning = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (extension, grade5, grade6, grade7, grade8, grade9) {
  'use strict';
  const KEY = 'wga_math_sprint_learning_v1';
  const SOURCES = [
    'https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements%28CAPS%29/CAPSIntermediate/tabid/572/Default.aspx',
    'https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20IP%20%20MATHEMATICS%20GR%204-6%20web.pdf',
    'https://www.education.gov.za/LinkClick.aspx?fileticket=HINtK497f94%3D&mid=10739&portalid=0&tabid=3207',
    'https://www.education.gov.za/LinkClick.aspx?fileticket=Zcwzy598npw%3D&mid=10742&portalid=0&tabid=3207',
    'https://www.education.gov.za/LinkClick.aspx?fileticket=cT8nlsKsBAs%3D&mid=10744&portalid=0&tabid=3207',
    'https://www.education.gov.za/LinkClick.aspx?fileticket=uCNqOwfGbmc%3D&tabid=',
    'https://www.education.gov.za/LinkClick.aspx?fileticket=ntUvRUteBtQ%3D&mid=10747&portalid=0&tabid=3208',
    'https://www.education.gov.za/LinkClick.aspx?fileticket=E68Ig0s3y4U%3D&mid=10749&portalid=0&tabid=3208',
    'https://www.education.gov.za/LinkClick.aspx?fileticket=UVUDK7_VooM%3D&mid=10751&portalid=0&tabid=3208'
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
  const expansion=extension.create({task,place,line,calc,array,share,pattern,money,fraction});
  missions.push(...expansion.missions);
  missions.forEach((m,i)=>{
    m.grade=4;m.number=i+1;m.music=i<10?i:62+i-10;
    if(i<10)m.practice=expansion.firstPractice[i];
    m.tasks.forEach((t,j)=>{t.id=`${m.id}-${j+1}`;});
    m.practice.forEach((t,j)=>{t.id=`${m.id}-practice-${j+1}`;});
  });
  const grade5Missions=grade5.create({task,calc,pattern,money});
  grade5Missions.forEach((m,i)=>{m.grade=5;m.number=i+1;m.music=73+i;for(const [bank,tasks]of [[0,m.tasks],[1,m.practice]])tasks.forEach((t,j)=>{t.id=`${m.id}-${bank?'practice-':''}${j+1}`;});});
  missions.push(...grade5Missions);
  const grade6Missions=grade6.create({task});
  grade6Missions.forEach((m,i)=>{m.grade=6;m.number=i+1;m.music=94+i;for(const [bank,tasks]of [[0,m.tasks],[1,m.practice]])tasks.forEach((t,j)=>{t.id=`${m.id}-${bank?'practice-':''}${j+1}`;});});
  missions.push(...grade6Missions);
  const grade7Missions=grade7.create({task});
  grade7Missions.forEach((m,i)=>{m.grade=7;m.number=i+1;m.music=115+i;for(const [bank,tasks]of [[0,m.tasks],[1,m.practice]])tasks.forEach((t,j)=>{t.id=`${m.id}-${bank?'practice-':''}${j+1}`;});});
  missions.push(...grade7Missions);
  const grade8Missions=grade8.create({task});
  grade8Missions.forEach((m,i)=>{m.grade=8;m.number=i+1;m.music=136+i;for(const [bank,tasks]of [[0,m.tasks],[1,m.practice]])tasks.forEach((t,j)=>{t.id=`${m.id}-${bank?'practice-':''}${j+1}`;});});
  missions.push(...grade8Missions);
  const grade9Missions=grade9.create({task});
  grade9Missions.forEach((m,i)=>{m.grade=9;m.number=i+1;m.music=157+i;for(const [bank,tasks]of [[0,m.tasks],[1,m.practice]])tasks.forEach((t,j)=>{t.id=`${m.id}-${bank?'practice-':''}${j+1}`;});});
  missions.push(...grade9Missions);
  const paths=[{grade:4,title:'Number City',start:0,count:20,reviewMusic:72},{grade:5,title:'Discovery District',start:20,count:20,reviewMusic:93},{grade:6,title:'Innovation Harbour',start:40,count:20,reviewMusic:114},{grade:7,title:'Research Ridge',start:60,count:20,reviewMusic:135},{grade:8,title:'Skyline Lab',start:80,count:20,reviewMusic:156},{grade:9,title:'Horizon Station',start:100,count:20,reviewMusic:177}];
  const pathFor=grade=>paths.find(p=>p.grade===Number(grade))||paths[0];
  const pathMissions=grade=>{const p=pathFor(grade);return missions.slice(p.start,p.start+p.count);};
  const gradeOf=s=>missions[s.mission].grade;
  const allTasks=missions.flatMap(m=>[...m.tasks,...m.practice]);
  const taskIds=new Set(allTasks.map(t=>t.id));
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
  const taskAt=ref=>ref&&missions[ref.mission]?.[ref.bank===1?'practice':'tasks']?.[ref.index]||null;
  const reference=s=>s.mode==='revision'?s.plan[Math.min(s.index,4)]:{mission:s.mission,bank:s.bank||0,index:Math.min(s.index,4)};
  const current=s=>s.index<5?taskAt(reference(s)):null;
  const origin=s=>missions[reference(s).mission];
  const music=s=>s.mode==='revision'?pathFor(gradeOf(s)).reviewMusic:origin(s).music;
  function fresh(mode='adventure',mission=0,bank=0){return {mode,mission,bank:mode==='adventure'?0:bank,index:0,steps:Array.from({length:5},()=>({done:false,mistakes:0,hints:0})),draft:'',feedback:''};}
  function valid(s){
    if(!object(s)||!['learn','adventure','revision'].includes(s.mode)||!integer(s.mission,0,missions.length-1)||!integer(s.index,0,5)||!Array.isArray(s.steps)||s.steps.length!==5)return false;
    if(s.bank!==undefined&&(!integer(s.bank,0,1)||(s.mode==='adventure'&&s.bank!==0)))return false;
    if(s.mode==='revision'){
      if(!Array.isArray(s.plan)||s.plan.length!==5||!s.plan.every(r=>object(r)&&integer(r.mission,0,missions.length-1)&&integer(r.bank,0,1)&&integer(r.index,0,4)))return false;
      if(new Set(s.plan.map(r=>taskAt(r).id)).size!==5||s.plan.some(r=>missions[r.mission].grade!==gradeOf(s)))return false;
    }
    if(!s.steps.every((v,i)=>object(v)&&typeof v.done==='boolean'&&integer(v.mistakes,0,1000)&&integer(v.hints,0,3)&&(i<s.index?v.done:i>s.index?!v.done:true)))return false;
    if(typeof s.draft!=='string'||s.draft.length>24||!['','wrong','correct','hint'].includes(s.feedback))return false;
    return s.index<5||s.steps.every(v=>v.done);
  }
  const empty=()=>({version:1,results:{},sessions:{adventure:null,learn:null,revision:null},activeMode:'adventure',settings:{music:.35,sfx:.65},practiceVisits:{},review:{},activeGrade:4,gradeSessions:Object.fromEntries(paths.filter(p=>p.grade!==4).map(p=>[p.grade,{adventure:null,learn:null,revision:null}]))});
  function unlocked(p,grade=4){const path=pathFor(grade);let n=path.start;while(n<path.start+path.count-1&&p.results[missions[n].id])n++;return n;}
  const sessionsFor=(p,grade=4)=>pathFor(grade).grade===4?p.sessions:p.gradeSessions[pathFor(grade).grade];
  function normalize(raw){
    const p=empty();if(!object(raw)||raw.version!==1)return p;
    if(object(raw.results))for(const m of missions){const r=raw.results[m.id];if(object(r)&&integer(r.independent,0,5)&&integer(r.assisted,0,5)&&r.independent+r.assisted===5)p.results[m.id]={independent:r.independent,assisted:r.assisted};}
    for(const path of paths){let gap=false;for(const m of pathMissions(path.grade)){if(!p.results[m.id])gap=true;if(gap)delete p.results[m.id];}}
    for(const path of paths){const source=path.grade===4?raw.sessions:raw.gradeSessions?.[path.grade];if(object(source))for(const mode of ['adventure','learn','revision']){const s=source[mode];if(valid(s)&&s.mode===mode&&gradeOf(s)===path.grade&&(mode!=='adventure'||s.mission<=unlocked(p,path.grade)))sessionsFor(p,path.grade)[mode]=JSON.parse(JSON.stringify(s));}}
    if(paths.some(v=>v.grade===raw.activeGrade))p.activeGrade=raw.activeGrade;
    if(['adventure','learn','revision'].includes(raw.activeMode))p.activeMode=raw.activeMode;
    if(object(raw.settings))for(const key of ['music','sfx'])if(Number.isFinite(raw.settings[key]))p.settings[key]=Math.max(0,Math.min(1,raw.settings[key]));
    if(object(raw.practiceVisits))for(const m of missions)if(integer(raw.practiceVisits[m.id],0,10000))p.practiceVisits[m.id]=raw.practiceVisits[m.id];
    if(object(raw.review))for(const [id,r]of Object.entries(raw.review))if(taskIds.has(id)&&object(r)&&integer(r.independent,0,10000)&&integer(r.assisted,0,10000)&&r.independent+r.assisted>0&&typeof r.lastSupported==='boolean')p.review[id]={independent:r.independent,assisted:r.assisted,lastSupported:r.lastSupported};
    return p;
  }
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
    const t=current(s),step=s.steps[s.index],supported=step.mistakes>0||step.hints>0,oldReview=profile.review[t.id]||{independent:0,assisted:0};
    profile.review[t.id]={independent:Math.min(10000,oldReview.independent+(supported?0:1)),assisted:Math.min(10000,oldReview.assisted+(supported?1:0)),lastSupported:supported};
    s.index++;s.draft='';s.feedback='';
    if(s.index===5&&s.mode==='adventure'){
      const independent=s.steps.filter(p=>p.mistakes===0&&p.hints===0).length,m=missions[s.mission],old=profile.results[m.id];
      if(!old||old.independent<independent)profile.results[m.id]={independent,assisted:5-independent};
    }
    return true;
  }
  function reviewPlan(profile,grade=4){
    const path=pathFor(grade);
    const candidates=[];
    missions.forEach((m,mission)=>{if(m.grade!==path.grade)return;for(const [bank,tasks]of [[0,m.tasks],[1,m.practice]])tasks.forEach((t,index)=>{const r=profile.review[t.id];if(r||bank===0&&(profile.results[m.id]||mission===path.start))candidates.push({mission,bank,index});});});
    const topicSeen=missions.map(m=>[...m.tasks,...m.practice].reduce((n,t)=>{const h=profile.review[t.id];return n+(h?h.independent+h.assisted:0);},0));
    const rank=r=>{const h=profile.review[taskAt(r).id];return [h?.lastSupported?0:1,topicSeen[r.mission],h?h.independent+h.assisted:0,r.mission,r.bank,r.index];};
    candidates.sort((a,b)=>{const x=rank(a),y=rank(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return x[i]-y[i];return 0;});
    const plan=[],ids=new Set(),topics=new Set();
    const add=r=>{if(plan.length<5&&!ids.has(taskAt(r).id)){plan.push(r);ids.add(taskAt(r).id);topics.add(r.mission);}};
    candidates.filter(r=>profile.review[taskAt(r).id]?.lastSupported).slice(0,2).forEach(add);
    for(const r of candidates)if(!topics.has(r.mission))add(r);
    candidates.forEach(add);return plan;
  }
  function freshReview(profile,grade=4){const plan=reviewPlan(profile,grade),s=fresh('revision',plan[0].mission,plan[0].bank);s.plan=plan;return s;}
  function stars(r){return !r?0:r.independent===5?3:r.independent>=3?2:1;}
  return {KEY,SOURCES,paths,pathFor,pathMissions,gradeOf,sessionsFor,missions,allTasks,rational,equivalent,fresh,valid,normalize,unlocked,current,reference,origin,music,taskAt,submit,hint,advance,stars,reviewPlan,freshReview};
});
