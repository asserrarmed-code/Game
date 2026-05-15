/* host-firebase.js
   هذه الطبقة لا تحذف شيئًا من index.html، بل تضيف البث الحي نحو Firebase.
   host.html = صفحة الأستاذ بنفس لوحة التحكم الأصلية.
*/
(function(){
  let app, db, roomRef, answersRef, firebaseReady=false;
  let lastQuestionKey="";

  function safe(fn){ try { return fn(); } catch(e){ console.error(e); return null; } }

  function initFirebase(){
    if (!window.firebaseConfig || String(window.firebaseConfig.apiKey || '').includes('PUT_YOUR')) {
      console.warn('Firebase غير مضبوط. افتحي firebase-config.js وضعي معلوماتك.');
      addFirebaseStatus('⚠️ Firebase غير مضبوط: ضعي المعلومات في firebase-config.js', true);
      return;
    }
    app = firebase.initializeApp(window.firebaseConfig);
    db = firebase.database();
    roomRef = db.ref('rooms/' + (window.ROOM_ID || 'moatark-main-room'));
    answersRef = roomRef.child('answers');
    firebaseReady=true;
    addFirebaseStatus('✅ Firebase متصل — صفحة الأستاذ تتحكم في البث', false);
    listenAnswers();
  }

  function addFirebaseStatus(text, danger){
    const setupCard=document.querySelector('#setup-screen .card');
    if(setupCard && !document.getElementById('firebase-status-box')){
      const p=document.createElement('div');
      p.id='firebase-status-box';
      p.style.cssText='margin:10px auto;padding:8px 12px;border-radius:10px;font-weight:900;font-size:.85rem;max-width:520px;';
      setupCard.insertBefore(p, setupCard.firstChild);
    }
    const el=document.getElementById('firebase-status-box');
    if(el){ el.textContent=text; el.style.background=danger?'#fee2e2':'#d1fae5'; el.style.color=danger?'#991b1b':'#065f46'; }
  }

  function teamObjects(){
    return (window.teamNames || []).map((name,i)=>({id:'team'+(i+1), name, score:(window.scores||[])[i]||0, lifelines:(window.lifelinesState||[])[i]||{del:false,dou:false,stp:false}}));
  }

  function currentTargetTeam(){
    const p=(window.phasesData||[])[window.currentPhase];
    if(!p) return 'all';
    if(p.type==='target' || p.type==='free'){
      const idx=(window.phaseTurns||[])[window.currentQ];
      if(typeof idx==='number') return 'team'+(idx+1);
      if(typeof idx==='string') return idx;
    }
    return 'all';
  }

  function currentTargetName(){
    const tid=currentTargetTeam();
    if(tid==='all') return '';
    const i=parseInt(tid.replace('team',''),10)-1;
    return (window.teamNames||[])[i] || tid;
  }

  function readQuestionData(){
    const p=(window.phasesData||[])[window.currentPhase];
    if(!p) return null;
    let qText=(document.getElementById('q-text')||{}).innerText || '';
    let options=[...document.querySelectorAll('#opt-container .opt')].map(b=>b.innerText);
    let qObj=null;
    if(p.questions && p.questions[window.currentQ]) qObj=p.questions[window.currentQ];
    let correctIndex = qObj && qObj.o ? Number(qObj.a) : null;
    let modelAnswer = window.currentModelAnswer || '';
    let boxMode = (p.type==='free' && document.getElementById('component-selection') && document.getElementById('component-selection').style.display !== 'none' && !modelAnswer);
    return {
      phaseName:p.name,
      phaseType:p.type,
      phaseIndex:window.currentPhase,
      questionIndex:window.currentQ,
      text:qText,
      options: options.length?options:null,
      correctIndex: Number.isFinite(correctIndex)?correctIndex:null,
      modelAnswer:modelAnswer,
      targetTeam:currentTargetTeam(),
      targetTeamName:currentTargetName(),
      time:p.time || 20,
      startedAt:Date.now(),
      boxMode:!!boxMode,
      revealed:false
    };
  }

  function publishAll(resetAnswers){
    if(!firebaseReady) return;
    const q=readQuestionData();
    const teams=teamObjects();
    const payload={
      status:'started',
      teams:teams.reduce((a,t)=>{a[t.id]={name:t.name, score:t.score, lifelines:t.lifelines}; return a;},{}),
      scores:teams.reduce((a,t)=>{a[t.id]=t.score; return a;},{}),
      lifelines:teams.reduce((a,t)=>{a[t.id]=t.lifelines; return a;},{}),
      currentQuestion:q,
      hostUpdatedAt:Date.now(),
      final:false
    };
    if(resetAnswers) payload.answers={};
    roomRef.update(payload);
  }

  function questionKey(){ return [window.currentPhase,window.currentQ,(document.getElementById('q-text')||{}).innerText].join('|'); }
  function publishQuestionMaybe(){
    const k=questionKey();
    const reset = k!==lastQuestionKey;
    lastQuestionKey=k;
    publishAll(reset);
  }

  function listenAnswers(){
    answersRef.on('value', snap=>{
      renderAnswers(snap.val()||{});
    });
  }

  function ensureAnswersPanel(){
    let panel=document.getElementById('firebase-answers-panel');
    if(!panel){
      const card=document.querySelector('#quiz-screen .card');
      panel=document.createElement('div');
      panel.id='firebase-answers-panel';
      panel.style.cssText='margin-top:12px;display:grid;grid-template-columns:repeat(2,1fr);gap:8px;text-align:right;';
      const title=document.createElement('div');
      title.id='firebase-answers-title';
      title.innerHTML='📩 <b>إجابات الأجهزة</b>';
      title.style.cssText='margin-top:12px;font-weight:900;color:var(--moroccan-blue);';
      card.appendChild(title); card.appendChild(panel);
    }
    return panel;
  }

  function renderAnswers(ans){
    const panel=ensureAnswersPanel();
    panel.innerHTML='';
    const names=window.teamNames||[];
    names.forEach((name,i)=>{
      const id='team'+(i+1), a=ans[id];
      const div=document.createElement('div');
      div.style.cssText='background:rgba(148,163,184,.14);border:2px solid '+(a?'var(--success)':'#cbd5e1')+';border-radius:12px;padding:8px;font-size:.85rem;';
      div.innerHTML='<b>'+name+'</b><br>'+(a?('✅ '+escapeHtml(a.answerText || a.freeText || 'تم الإرسال')):'⏳ لم يجب بعد');
      panel.appendChild(div);
    });
  }

  function escapeHtml(str){ return String(str).replace(/[&<>"]/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s])); }

  window.openCodesModal=function(){
    let modal=document.getElementById('codesModal');
    if(!modal){
      modal=document.createElement('div');
      modal.id='codesModal';
      modal.className='modal-overlay';
      modal.innerHTML=`<div class="modal-content" style="max-width:700px;text-align:center;">
        <span class="close-modal" onclick="document.getElementById('codesModal').style.display='none'">&times;</span>
        <h2>🔗 روابط الفرق والشاشة</h2>
        <div id="codesLinks" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;"></div>
        <button class="btn-admin" style="margin-top:12px;background:var(--moroccan-blue);color:white" onclick="copyGameLinks()">نسخ كل الروابط</button>
      </div>`;
      document.body.appendChild(modal);
    }
    const base=location.href.replace(/host\.html.*/,'');
    const links=[['🖥️ الشاشة الكبيرة','screen.html'],['الفريق 1','player.html?team=team1'],['الفريق 2','player.html?team=team2'],['الفريق 3','player.html?team=team3'],['الفريق 4','player.html?team=team4']];
    document.getElementById('codesLinks').innerHTML=links.map(([label,path])=>{
      const url=base+path;
      const qr='https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='+encodeURIComponent(url);
      return `<div style="border:2px solid var(--moroccan-gold);border-radius:14px;padding:10px;background:rgba(255,255,255,.5)"><b>${label}</b><br><img src="${qr}" alt="QR" style="width:120px;height:120px"><br><a href="${url}" target="_blank" style="font-size:.8rem;word-break:break-all">فتح الرابط</a></div>`;
    }).join('');
    modal.style.display='flex';
  };

  window.copyGameLinks=function(){
    const base=location.href.replace(/host\.html.*/,'');
    const txt=['screen.html','player.html?team=team1','player.html?team=team2','player.html?team=team3','player.html?team=team4'].map(p=>base+p).join('\n');
    navigator.clipboard.writeText(txt).then(()=>alert('تم نسخ الروابط ✅'));
  };

  // تغليف وظائف index الأصلية دون حذفها
  function wrap(name, after, before){
    const original=window[name];
    if(typeof original!=='function') return;
    window[name]=function(){
      if(before) before.apply(this,arguments);
      const r=original.apply(this,arguments);
      setTimeout(()=>after && after.apply(this,arguments),60);
      return r;
    };
  }

  window.addEventListener('load',()=>{
    initFirebase();
    wrap('startMarathon',()=>publishQuestionMaybe());
    wrap('init',()=>publishQuestionMaybe());
    wrap('displayQuestion',()=>publishQuestionMaybe());
    wrap('selectComponent',()=>publishQuestionMaybe());
    wrap('next',()=>publishQuestionMaybe());
    wrap('modifyScore',()=>publishAll(false));
    wrap('useLifeline',()=>publishAll(false));
    wrap('reveal',()=>{ if(firebaseReady) roomRef.update({revealed:true, currentQuestion:Object.assign(readQuestionData()||{}, {revealed:true}), hostUpdatedAt:Date.now()}); });
  });
})();
