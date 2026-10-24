(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PhysicsRevisionUI=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function create({document:doc,A,R,profile,storage,open,close}){
    if(!R)return null;const $=id=>doc.getElementById(id),practice=R.load(storage);let setup=false;
    function persist(){if(!R.save(storage,practice))$('revisionSaveStatus').textContent='Practice stays available in this tab. This browser could not save it for another visit.';}
    function progress(){const s=R.summary(practice,profile);$('revisionProgress').textContent=s.available?s.practised+' of '+s.available+' available concept checks practised. '+s.revisit+' ready to revisit.':'Complete an Adventure repair to add its ideas to revision. Revision follows the discoveries you have unlocked.';}
    function choose(){setup=true;render();}
    function notes(card){
      const m=A.missions[card.mi],e=A.experiment(m,card.station),evidence=profile.journal?.[m.id]?.[card.station]||profile.checkpoints?.[m.id]?.labs?.[card.station],list=$('revisionNotes');list.replaceChildren();
      for(const [i,t]of (evidence?.trials||[]).entries()){const li=doc.createElement('li');li.textContent=A.setting(e,t,i)+' → '+A.observation(e,A.simulate(m,card.station,t.value,t.closed));list.append(li);}
      if(!list.children.length){const li=doc.createElement('li');li.textContent='No detailed measurements were saved for this repair. You can revisit its mission to collect fresh observations.';list.append(li);}
      $('revisionEvidence').open=false;
    }
    function render(focus=false){
      progress();R.resume(practice,profile);const s=practice.session,card=R.current(practice,profile),complete=!!s&&s.cursor>=s.ids.length;
      $('revisionSetup').hidden=!setup&&!!s;$('revisionQuestionPanel').hidden=setup||!card;$('revisionSummary').hidden=setup||!complete;
      $('revisionStart').disabled=R.catalog(profile,$('revisionGrade').value).length===0;$('revisionResume').hidden=!s;
      if(setup||!s)return;
      if(complete){
        const all=R.catalog(profile),correct=s.ids.reduce((n,id,i)=>n+Number(s.answers[i]===all.find(c=>c.id===id)?.correct),0);$('revisionResult').textContent='You reviewed '+s.ids.length+' ideas: '+correct+' correct on this session. Missed ideas will return in later practice.';
        const list=$('revisionResults');list.replaceChildren();for(const [i,id]of s.ids.entries()){const c=all.find(c=>c.id===id),li=doc.createElement('li');li.textContent=c.stationName+' • Grade '+c.grade+' — '+(s.answers[i]===c.correct?'Correct this time':'Revisit this idea');list.append(li);}if(focus)$('revisionResult').focus();return;
      }
      $('revisionCounter').textContent='QUESTION '+(s.cursor+1)+' OF '+s.ids.length+' • GRADE '+card.grade;
      $('revisionContext').textContent=card.mission+' • '+card.stationName;$('revisionQuestion').textContent=card.question;
      const answered=s.answers.length>s.cursor,answers=$('revisionAnswers');answers.replaceChildren();
      for(const option of R.options(practice,card)){const b=doc.createElement('button');b.type='button';b.textContent=option.text;b.dataset.choice=String(option.choice);b.disabled=answered;b.setAttribute('aria-pressed',String(answered&&s.answers[s.cursor]===option.choice));b.onclick=()=>{if(R.answer(practice,profile,option.choice)?.fresh){persist();render();$('revisionFeedback').focus();}};answers.append(b);}
      const correct=answered&&s.answers[s.cursor]===card.correct;$('revisionFeedback').hidden=!answered;$('revisionFeedback').className=correct?'success':'revision-feedback';
      $('revisionFeedback').textContent=answered?(correct?'Correct. ':'Revisit this idea. The answer is: '+card.answers[card.correct]+'. ')+card.explanation:'';
      $('revisionNext').hidden=!answered;$('revisionNext').textContent=s.cursor===s.ids.length-1?'See session review':'Next question';notes(card);if(focus)$('revisionQuestion').focus();
    }
    function start(){R.start(practice,profile,$('revisionGrade').value);setup=false;persist();render(true);}
    $('revisionStart').onclick=start;$('revisionAgain').onclick=start;$('revisionGrade').onchange=()=>render();
    $('revisionResume').onclick=()=>{setup=false;render(true);};$('revisionTopics').onclick=choose;$('revisionChoose').onclick=choose;
    $('revisionNext').onclick=()=>{if(R.next(practice,profile)){persist();render(true);}};
    for(const id of ['homeRevision','notebookRevision','pauseRevision'])$(id).hidden=false;
    function show(){setup=!R.resume(practice,profile);render();open('revisionDialog');}
    for(const id of ['homeRevision','notebookRevision','pauseRevision'])$(id).onclick=show;
    return{open:show};
  }
  return{create};
});
