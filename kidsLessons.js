// kidsLessons.js — Foundation tier, Unit 1 (Meet the Trees) & Unit 2 (Read a Tree)
// Screen-based, no map required. Relies on globals already defined by app.js
// (speciesProfiles, leafFiles, showStatus, showSeedReward, SEED_VALUES) and by
// curriculum.js (window.TREEWALK_CURRICULUM). Additive only — does not modify
// any existing file or behavior.
(function(){
  'use strict';

  var PROGRESS_KEY='treewalk-lessons-progress';
  var ACCOUNT_ACTIVATED_KEY='treewalk-account-activated';
  var ROUNDS_PER_UNIT=8;

  // Chunk 1 of the species mastery board — ordered for commonality on NYC
  // streets so a family can complete it without unusual travel. Proposed
  // 2026-08-19, not yet verified against real Parks Dept census data; see
  // curriculum-foundation-tier-draft.md, "species order within chunks."
  var CHUNK_1_SPECIES=['london planetree','callery pear','honeylocust','norway maple','pin oak','littleleaf linden','ginkgo','red maple'];

  // The one-species deep dive (2026-08-19, reworked twice same night: first
  // after gero rejected text-only content as generic copy-paste, then again
  // after he pointed out real-world ID starts with the whole tree from a
  // distance, not a close-up — you spot the shape first, then confirm with
  // bark/fruit up close). Real photos, sourced 2026-08-19 from NC State
  // Extension's Plant Toolbox (openly licensed — form & bark: Josh S.
  // Jackson, CC BY-NC 2.0; fruit: Liné1, CC BY-SA 3.0 — full credit lives in
  // content-london-planetree-deep-dive.md). Photo sections carry only a
  // one-line caption, not a paragraph. Sections without a photo yet
  // (young/mature, why-this-tree, older-explorer) stay to one short line
  // each instead of a paragraph. Order is deliberate: whole tree first (how
  // you'd actually spot it walking around), then the close-up confirming
  // details.
  var LONDON_PLANETREE_DEEP_DIVE={
    formImage:'assets/deepdive/london-planetree-form.jpg',
    formCaption:'The whole tree — this is what to look for from across the street.',
    formCredit:'Photo: Josh S. Jackson, CC BY-NC 2.0',
    barkImage:'assets/deepdive/london-planetree-bark.jpg',
    barkCaption:'Up close: cream, gray, and olive patches peeling like camouflage.',
    barkCredit:'Photo: Josh S. Jackson, CC BY-NC 2.0',
    fruitImage:'assets/deepdive/london-planetree-fruit.jpg',
    fruitCaption:'Spiky seed balls, always hanging in pairs — visible into winter.',
    fruitCredit:'Photo: Liné1, CC BY-SA 3.0',
    youngMature:'Young trees: thin, smooth, pale bark. Mature: wider than you are tall, full peeling pattern.',
    whyThisTree:'Not native to NYC — a tough hybrid bred to survive salt, pollution, and bad soil, which is why cities everywhere planted so many.',
    olderExplorer:'If one tough species can survive almost anything, what’s the risk of a city planting mostly just this one?'
  };

  var UNITS={
    'chunk-1':{
      title:'Meet Your First Trees',
      kind:'chunk',
      build:function(){ return buildChunk1(); }
    },
    'study-the-trees':{
      title:'Study the Trees',
      kind:'study',
      build:function(){ return buildStudyDeck(); }
    },
    'meet-the-trees':{
      title:'Meet the Trees',
      kind:'quiz',
      build:function(count){ return buildMeetTheTrees(count); }
    },
    'read-a-tree':{
      title:'Read a Tree',
      kind:'quiz',
      build:function(count){ return buildReadATree(count); }
    }
  };

  function titleCaseLocal(s){
    return String(s||'').replace(/\b\w/g,function(c){ return c.toUpperCase(); });
  }

  function shuffle(arr){
    var a=arr.slice();
    for(var i=a.length-1;i>0;i--){
      var j=Math.floor(Math.random()*(i+1));
      var tmp=a[i]; a[i]=a[j]; a[j]=tmp;
    }
    return a;
  }

  function sample(arr,n){
    return shuffle(arr).slice(0,n);
  }

  function availableSpeciesKeys(){
    if(typeof leafFiles==='undefined'||typeof speciesProfiles==='undefined') return [];
    return Object.keys(leafFiles).filter(function(k){ return speciesProfiles[k]; });
  }

  function buildMeetTheTrees(count){
    var keys=availableSpeciesKeys();
    if(keys.length<4) return [];
    var picks=sample(keys,Math.min(count,keys.length));
    return picks.map(function(key){
      var profile=speciesProfiles[key];
      var distractorPool=keys.filter(function(k){ return k!==key; });
      var distractors=sample(distractorPool,3);
      var options=shuffle([key].concat(distractors)).map(function(k){
        return {key:k,label:titleCaseLocal(k)};
      });
      return {
        kind:'choice',
        prompt:'Which tree is this?',
        image:'assets/leaves/'+leafFiles[key]+'.png',
        hint:profile.shape||'',
        options:options,
        correctKey:key
      };
    });
  }

  // Chunk 1: teach-then-quiz, per species, in that order, every time (Law
  // Zero). For each of this chunk's species: a teaching card first (leaf
  // image, name, shape, story, tags — content that already exists for every
  // species), then immediately a quiz question on that same species. No
  // hint chip on the quiz half — the teaching card right before it is the
  // "hint."
  function buildChunk1(){
    var keys=availableSpeciesKeys();
    var chunkKeys=CHUNK_1_SPECIES.filter(function(k){ return keys.indexOf(k)!==-1; });
    if(!chunkKeys.length) return [];
    var steps=[];
    chunkKeys.forEach(function(key){
      var profile=speciesProfiles[key];
      var teachStep={
        kind:'teach',
        key:key,
        name:titleCaseLocal(key),
        image:'assets/leaves/'+leafFiles[key]+'.png',
        shape:profile.shape||'',
        blurb:profile.story||profile.kid||'',
        tags:profile.tags||[]
      };
      // The one-species deep dive: London planetree's teach card gets the
      // connected-narrative content (bark, fruit/flower, young-vs-mature,
      // why this tree is everywhere) behind a "tell me more" toggle. Every
      // other species in this chunk keeps the plain teach card for now —
      // this is a depth test on one flagship species, not a rebuild of all
      // eight. See content-london-planetree-deep-dive.md.
      if(key==='london planetree'){
        teachStep.deepDive=LONDON_PLANETREE_DEEP_DIVE;
      }
      steps.push(teachStep);
      var distractorPool=keys.filter(function(k){ return k!==key; });
      var distractors=sample(distractorPool,Math.min(3,distractorPool.length));
      var options=shuffle([key].concat(distractors)).map(function(k){
        return {key:k,label:titleCaseLocal(k)};
      });
      steps.push({
        kind:'choice',
        prompt:'You just met this one — which tree is it?',
        image:'assets/leaves/'+leafFiles[key]+'.png',
        hint:'',
        options:options,
        correctKey:key
      });
      // Second quiz mode for the flagship species only: multi-target
      // recognition — four leaves on screen at once, pick the right one.
      // Closer to real-world identification (picking one out of several
      // real options) than recalling a single leaf shown seconds earlier.
      // Distractors are drawn from this chunk's own species, since that's
      // all a kid has actually been taught by this point in the flow.
      if(key==='london planetree'){
        var mtDistractorPool=chunkKeys.filter(function(k){ return k!==key; });
        var mtDistractors=sample(mtDistractorPool,Math.min(3,mtDistractorPool.length));
        var mtOptions=shuffle([key].concat(mtDistractors)).map(function(k){
          return {key:k,image:'assets/leaves/'+leafFiles[k]+'.png'};
        });
        steps.push({
          kind:'multitarget',
          prompt:'Which one is the London Planetree?',
          options:mtOptions,
          correctKey:key
        });
      }
    });
    return steps;
  }

  // The smallest task: completing any single lesson — a teaching card or a
  // quiz question, whichever a kid reaches first — activates the account.
  // Confirmed 2026-08-19: deliberately low bar, not a real accomplishment
  // gate. Idempotent; only the first completion matters.
  function markAccountActivated(){
    try{
      if(localStorage.getItem(ACCOUNT_ACTIVATED_KEY)==='1') return;
      localStorage.setItem(ACCOUNT_ACTIVATED_KEY,'1');
    }catch(e){ return; }
    if(typeof showStatus==='function') showStatus('🌱 Nice — your TreeWalk account is active!',2600);
  }

  // Looks up what we know about a species for the compare-and-learn feedback
  // shown after a Meet the Trees answer — used for both the correct tree and
  // (when the kid guesses wrong) the tree they actually picked.
  function speciesBlurb(key){
    var profile=speciesProfiles&&speciesProfiles[key];
    if(!profile) return '';
    return profile.story||profile.kid||'';
  }

  // The teaching pass, meant to come before either quiz: walks through every
  // species TreeWalk knows about — in order, not sampled — so a first-time
  // kid has actually seen a leaf before being asked to name it. No scoring,
  // no right/wrong; it's a flip-through, not a test.
  function buildStudyDeck(){
    var keys=availableSpeciesKeys();
    var sorted=keys.slice().sort(function(a,b){
      return titleCaseLocal(a).localeCompare(titleCaseLocal(b));
    });
    return sorted.map(function(key){
      var profile=speciesProfiles[key];
      return {
        kind:'study',
        key:key,
        name:titleCaseLocal(key),
        image:'assets/leaves/'+leafFiles[key]+'.png',
        shape:profile.shape||'',
        blurb:profile.story||profile.kid||'',
        tags:profile.tags||[]
      };
    });
  }

  function buildReadATree(count){
    var keys=availableSpeciesKeys();
    if(keys.length<4) return [];
    var picks=sample(keys,Math.min(count,keys.length));
    var hasCurriculum=!!(window.TREEWALK_CURRICULUM&&window.TREEWALK_CURRICULUM.forSpecies);
    var rounds=[];
    picks.forEach(function(key){
      var factText='';
      if(hasCurriculum){
        var activity=window.TREEWALK_CURRICULUM.forSpecies(key);
        factText=activity&&(activity.k2||activity.g35)||'';
      }
      if(!factText){
        var profile=speciesProfiles[key];
        factText=(profile&&(profile.story||profile.kid))||'';
      }
      if(!factText) return;
      var showCorrect=Math.random()<0.5;
      var shownName=key;
      if(!showCorrect){
        var wrongPool=keys.filter(function(k){ return k!==key; });
        shownName=wrongPool[Math.floor(Math.random()*wrongPool.length)];
      }
      rounds.push({
        kind:'truefalse',
        prompt:'True or false: this fact is about the '+titleCaseLocal(shownName)+'.',
        fact:factText,
        correctAnswer:showCorrect,
        explain:showCorrect
          ? 'Yes — that’s a real clue for the '+titleCaseLocal(key)+'.'
          : 'Actually, that fact is about the '+titleCaseLocal(key)+'.'
      });
    });
    return rounds;
  }

  function loadProgress(){
    try{
      var raw=localStorage.getItem(PROGRESS_KEY);
      return raw?JSON.parse(raw):{};
    }catch(e){ return {}; }
  }

  function saveProgress(unitId,correct,total){
    var progress=loadProgress();
    var prev=progress[unitId]||{best:0,attempts:0};
    progress[unitId]={
      lastScore:correct,
      lastTotal:total,
      best:Math.max(prev.best||0,correct),
      attempts:(prev.attempts||0)+1
    };
    try{ localStorage.setItem(PROGRESS_KEY,JSON.stringify(progress)); }catch(e){}
    return progress[unitId];
  }

  var session=null;
  var lastUnitId=null;

  function el(id){ return document.getElementById(id); }

  function refreshPickerBests(){
    var progress=loadProgress();
    var cards=document.querySelectorAll('.lessons-unit-card');
    cards.forEach(function(card){
      var unitId=card.getAttribute('data-lesson-unit');
      var best=card.querySelector('.lessons-card-best');
      if(!best) return;
      var stats=progress[unitId];
      var unit=UNITS[unitId];
      if(unit&&unit.kind==='study'){
        best.textContent=(stats&&stats.completed)?'✓ Studied all the trees':'Not studied yet';
      } else {
        best.textContent=stats?('Best: '+stats.best+' / '+stats.lastTotal):'Not played yet';
      }
    });
  }

  function openLessonsFlow(){
    var flow=el('lessons-flow');
    if(!flow) return;
    flow.hidden=false;
    document.body.classList.add('lessons-open');
    requestAnimationFrame(function(){ flow.classList.add('open'); });
  }

  function closeLessonsFlowEl(){
    var flow=el('lessons-flow');
    if(!flow) return;
    flow.classList.remove('open');
    document.body.classList.remove('lessons-open');
    setTimeout(function(){ flow.hidden=true; },280);
  }

  function openPicker(){
    refreshPickerBests();
    var picker=el('lessons-picker'), round=el('lessons-round'), done=el('lessons-done');
    if(picker) picker.hidden=false;
    if(round) round.hidden=true;
    if(done) done.hidden=true;
    openLessonsFlow();
  }

  function closeLessons(){
    closeLessonsFlowEl();
  }

  function backToPicker(){
    session=null;
    openPicker();
  }

  function startUnit(unitId){
    var unit=UNITS[unitId];
    if(!unit) return;
    var questions=unit.build(ROUNDS_PER_UNIT);
    if(!questions||!questions.length){
      if(typeof showStatus==='function') showStatus('Not enough tree data loaded yet — try again in a moment.',2400);
      return;
    }
    lastUnitId=unitId;
    session={unitId:unitId,questions:questions,index:0,correct:0};
    var picker=el('lessons-picker'), round=el('lessons-round'), done=el('lessons-done');
    if(picker) picker.hidden=true;
    if(done) done.hidden=true;
    if(round) round.hidden=false;
    var titleEl=el('lessons-round-title');
    if(titleEl) titleEl.textContent=unit.title;
    renderQuestion();
  }

  function renderQuestion(){
    if(!session) return;
    var q=session.questions[session.index];
    var total=session.questions.length;

    var label=el('lessons-progress-label');
    if(label) label.textContent=(session.index+1)+' of '+total;
    var bar=el('lessons-progress-bar');
    if(bar) bar.style.width=Math.round(((session.index)/total)*100)+'%';

    var body=el('lessons-question-body');
    if(!body) return;

    if(q.kind==='choice'){
      var optionsHtml=q.options.map(function(opt){
        return '<button type="button" class="lessons-option" data-key="'+opt.key+'">'+opt.label+'</button>';
      }).join('');
      var hintHtml=q.hint?('<p class="lessons-hint">🔍 Look closely — it\'s a <b>'+q.hint+'</b>.</p>'):'';
      body.innerHTML=
        '<p class="lessons-prompt">'+q.prompt+'</p>'+
        '<div class="lessons-leaf-frame"><img src="'+q.image+'" alt="Leaf to identify"></div>'+
        hintHtml+
        '<div class="lessons-options">'+optionsHtml+'</div>';
      var buttons=body.querySelectorAll('.lessons-option');
      buttons.forEach(function(btn){
        btn.addEventListener('click',function(){
          answerChoice(btn.getAttribute('data-key'),q,buttons);
        });
      });
    } else if(q.kind==='truefalse'){
      body.innerHTML=
        '<p class="lessons-prompt">'+q.prompt+'</p>'+
        '<blockquote class="lessons-fact">“'+q.fact+'”</blockquote>'+
        '<div class="lessons-options">'+
          '<button type="button" class="lessons-option" data-answer="true">True</button>'+
          '<button type="button" class="lessons-option" data-answer="false">False</button>'+
        '</div>';
      var tfButtons=body.querySelectorAll('.lessons-option');
      tfButtons.forEach(function(btn){
        btn.addEventListener('click',function(){
          answerTrueFalse(btn.getAttribute('data-answer')==='true',q,tfButtons);
        });
      });
    } else if(q.kind==='study'){
      renderStudyCard(q);
    } else if(q.kind==='teach'){
      renderTeachCard(q);
    } else if(q.kind==='multitarget'){
      renderMultiTarget(q);
    }
  }

  // A single teaching card within a chunk flow — same visual language as
  // the study deck, but with one "Next" step straight into that species'
  // quiz question, since chunk flows always alternate teach → quiz. When a
  // step carries deepDive content (the London planetree flagship treatment,
  // 2026-08-19), a "tell me more" toggle reveals the connected-narrative
  // content — bark, fruit/flower, young-vs-mature, why this tree is
  // everywhere, and a deeper question for older explorers — collapsed by
  // default so the base card stays just as simple as every other species'.
  function renderTeachCard(q){
    var body=el('lessons-question-body');
    if(!body) return;
    var tagsHtml=(q.tags||[]).map(function(t){ return '<span>'+t+'</span>'; }).join('');
    var deepDiveHtml='';
    if(q.deepDive){
      var d=q.deepDive;
      deepDiveHtml=
        '<button type="button" class="secondary lessons-deepdive-toggle" id="lessons-deepdive-toggle">🔍 See more of this tree</button>'+
        '<div class="lessons-deepdive-panel" id="lessons-deepdive-panel" hidden>'+
          '<div class="lessons-deepdive-photo">'+
            '<img src="'+d.formImage+'" alt="London planetree, whole tree">'+
            '<p class="lessons-deepdive-caption">'+d.formCaption+'</p>'+
            '<p class="lessons-deepdive-credit">'+d.formCredit+'</p>'+
          '</div>'+
          '<div class="lessons-deepdive-photo">'+
            '<img src="'+d.barkImage+'" alt="London planetree bark">'+
            '<p class="lessons-deepdive-caption">'+d.barkCaption+'</p>'+
            '<p class="lessons-deepdive-credit">'+d.barkCredit+'</p>'+
          '</div>'+
          '<div class="lessons-deepdive-photo">'+
            '<img src="'+d.fruitImage+'" alt="London planetree seed balls">'+
            '<p class="lessons-deepdive-caption">'+d.fruitCaption+'</p>'+
            '<p class="lessons-deepdive-credit">'+d.fruitCredit+'</p>'+
          '</div>'+
          '<p class="lessons-deepdive-line">🌱 '+d.youngMature+'</p>'+
          '<p class="lessons-deepdive-line">🏙️ '+d.whyThisTree+'</p>'+
          '<p class="lessons-deepdive-line">🤔 '+d.olderExplorer+'</p>'+
        '</div>';
    }
    body.innerHTML=
      '<p class="lessons-study-count">Meet this tree</p>'+
      '<div class="lessons-leaf-frame"><img src="'+q.image+'" alt="'+q.name+' leaf"></div>'+
      '<h2 class="lessons-study-name">'+q.name+'</h2>'+
      (q.shape?('<p class="lessons-study-shape">'+q.shape+'</p>'):'')+
      (q.blurb?('<p class="lessons-study-blurb">'+q.blurb+'</p>'):'')+
      (tagsHtml?('<div class="lessons-study-tags">'+tagsHtml+'</div>'):'')+
      deepDiveHtml+
      '<button type="button" class="lessons-findit" id="lessons-findit-btn">🌳 Find a real one nearby</button>'+
      '<button type="button" class="primary lessons-next" id="lessons-teach-next">Ready — quiz me!</button>';
    var toggleBtn=body.querySelector('#lessons-deepdive-toggle');
    if(toggleBtn) toggleBtn.addEventListener('click',function(){
      var panel=body.querySelector('#lessons-deepdive-panel');
      if(!panel) return;
      panel.hidden=!panel.hidden;
      toggleBtn.textContent=panel.hidden?'🔍 See more of this tree':'▲ Hide photos';
    });
    // The "Leaf → Find It" bridge (2026-08-19 night): send the kid straight
    // from the teach card into the real map, hunting for a real tree of this
    // species — reuses the app's existing species-guess Mystery game rather
    // than a new mechanic. Deferrable, not skippable: leaves the lesson
    // where it is (doesn't advance session.index) so the kid can come back
    // and finish the quiz any time, per the field-linked-challenge timing
    // rule in curriculum-foundation-tier-draft.md.
    var findItBtn=body.querySelector('#lessons-findit-btn');
    if(findItBtn) findItBtn.addEventListener('click',function(){
      var key=q.key,name=q.name;
      markAccountActivated();
      closeLessons();
      var started=typeof window.TREEWALK_START_SPECIES_CHALLENGE==='function'&&window.TREEWALK_START_SPECIES_CHALLENGE(key);
      if(!started&&typeof showStatus==='function'){
        showStatus('No '+name+'s mapped near you yet — try moving around, or come back to this lesson later.',4400);
      }
    });
    var nextBtn=body.querySelector('#lessons-teach-next');
    if(nextBtn) nextBtn.addEventListener('click',function(){
      markAccountActivated();
      session.index+=1;
      renderQuestion();
    });
  }

  // Multi-target recognition: four leaves on screen at once, one prompt,
  // tap the right one. Closer to real-world identification (picking the
  // right tree out of several real options) than recalling a single leaf
  // shown in isolation seconds earlier. Currently only used for the London
  // planetree flagship deep dive — see buildChunk1.
  function renderMultiTarget(q){
    var body=el('lessons-question-body');
    if(!body) return;
    var tilesHtml=q.options.map(function(opt){
      return '<button type="button" class="lessons-multitarget-tile" data-key="'+opt.key+'"><img src="'+opt.image+'" alt="A tree leaf"></button>';
    }).join('');
    body.innerHTML=
      '<p class="lessons-prompt">'+q.prompt+'</p>'+
      '<div class="lessons-multitarget-grid">'+tilesHtml+'</div>';
    var tiles=body.querySelectorAll('.lessons-multitarget-tile');
    tiles.forEach(function(btn){
      btn.addEventListener('click',function(){
        answerMultiTarget(btn.getAttribute('data-key'),q,tiles);
      });
    });
  }

  function answerMultiTarget(key,q,buttons){
    var isCorrect=key===q.correctKey;
    lockButtons(buttons);
    buttons.forEach(function(btn){
      if(btn.getAttribute('data-key')===q.correctKey) btn.classList.add('correct');
      else if(btn.getAttribute('data-key')===key&&!isCorrect) btn.classList.add('incorrect');
    });
    if(isCorrect){
      showFeedback(true,{correctName:titleCaseLocal(q.correctKey),correctText:speciesBlurb(q.correctKey)});
    } else {
      showFeedback(false,{
        correctName:titleCaseLocal(q.correctKey),
        correctText:speciesBlurb(q.correctKey),
        pickedName:titleCaseLocal(key),
        pickedText:speciesBlurb(key)
      });
    }
  }

  // Study mode: a flip-through, not a test. No answers to lock, no scoring —
  // just Back/Next through every species in order, so "Meet the Trees" and
  // "Read a Tree" aren't a kid's first exposure to any of this.
  function renderStudyCard(q){
    var body=el('lessons-question-body');
    if(!body) return;
    var isFirst=session.index===0;
    var isLast=session.index>=session.questions.length-1;
    var tagsHtml=(q.tags||[]).map(function(t){ return '<span>'+t+'</span>'; }).join('');
    body.innerHTML=
      '<p class="lessons-study-count">Tree '+(session.index+1)+' of '+session.questions.length+'</p>'+
      '<div class="lessons-leaf-frame"><img src="'+q.image+'" alt="'+q.name+' leaf"></div>'+
      '<h2 class="lessons-study-name">'+q.name+'</h2>'+
      (q.shape?('<p class="lessons-study-shape">'+q.shape+'</p>'):'')+
      (q.blurb?('<p class="lessons-study-blurb">'+q.blurb+'</p>'):'')+
      (tagsHtml?('<div class="lessons-study-tags">'+tagsHtml+'</div>'):'')+
      '<div class="lessons-study-nav">'+
        '<button type="button" class="secondary lessons-study-back"'+(isFirst?' disabled':'')+'>Back</button>'+
        '<button type="button" class="primary lessons-study-next">'+(isLast?'Finish studying':'Next tree')+'</button>'+
      '</div>';
    var backBtn=body.querySelector('.lessons-study-back');
    if(backBtn) backBtn.addEventListener('click',function(){
      if(session.index>0){ session.index-=1; renderQuestion(); }
    });
    var nextBtn=body.querySelector('.lessons-study-next');
    if(nextBtn) nextBtn.addEventListener('click',function(){
      if(session.index>=session.questions.length-1){ finishStudy(); }
      else { session.index+=1; renderQuestion(); }
    });
  }

  function finishStudy(){
    if(!session) return;
    var progress=loadProgress();
    progress[session.unitId]={completed:true};
    try{ localStorage.setItem(PROGRESS_KEY,JSON.stringify(progress)); }catch(e){}
    if(typeof showStatus==='function') showStatus('Nice — you’ve met every tree. Ready for a quiz?',2600);
    backToPicker();
  }

  function answerChoice(key,q,buttons){
    var isCorrect=key===q.correctKey;
    lockButtons(buttons);
    buttons.forEach(function(btn){
      if(btn.getAttribute('data-key')===q.correctKey) btn.classList.add('correct');
      else if(btn.getAttribute('data-key')===key&&!isCorrect) btn.classList.add('incorrect');
    });
    if(isCorrect){
      showFeedback(true,{correctName:titleCaseLocal(q.correctKey),correctText:speciesBlurb(q.correctKey)});
    } else {
      showFeedback(false,{
        correctName:titleCaseLocal(q.correctKey),
        correctText:speciesBlurb(q.correctKey),
        pickedName:titleCaseLocal(key),
        pickedText:speciesBlurb(key)
      });
    }
  }

  function answerTrueFalse(value,q,buttons){
    var isCorrect=value===q.correctAnswer;
    lockButtons(buttons);
    buttons.forEach(function(btn){
      var btnVal=btn.getAttribute('data-answer')==='true';
      if(btnVal===q.correctAnswer) btn.classList.add('correct');
      else if(btnVal===value&&!isCorrect) btn.classList.add('incorrect');
    });
    showFeedback(isCorrect,q.explain);
  }

  function lockButtons(buttons){
    buttons.forEach(function(btn){ btn.disabled=true; });
  }

  function showFeedback(isCorrect,explain){
    if(!session) return;
    if(isCorrect) session.correct+=1;
    var body=el('lessons-question-body');
    if(!body) return;

    var wrap=document.createElement('div');
    wrap.className='lessons-feedback '+(isCorrect?'correct':'incorrect');

    if(typeof explain==='string'){
      var p=document.createElement('p');
      p.textContent=(isCorrect?'Nice — that’s right. ':'Good guess — ')+explain;
      wrap.appendChild(p);
    } else if(explain&&typeof explain==='object'){
      if(isCorrect){
        var p1=document.createElement('p');
        p1.textContent='Nice — that’s right. '+(explain.correctText||'');
        wrap.appendChild(p1);
      } else {
        if(explain.pickedText){
          var pPicked=document.createElement('p');
          var bPicked=document.createElement('b');
          bPicked.textContent='That leaf was actually a '+explain.pickedName+': ';
          pPicked.appendChild(bPicked);
          pPicked.appendChild(document.createTextNode(explain.pickedText));
          wrap.appendChild(pPicked);
        }
        var pCorrect=document.createElement('p');
        var bCorrect=document.createElement('b');
        bCorrect.textContent='This one is a '+explain.correctName+': ';
        pCorrect.appendChild(bCorrect);
        pCorrect.appendChild(document.createTextNode(explain.correctText||''));
        wrap.appendChild(pCorrect);
      }
    }
    body.appendChild(wrap);

    var isLast=session.index>=session.questions.length-1;
    var nextBtn=document.createElement('button');
    nextBtn.type='button';
    nextBtn.className='lessons-next primary';
    nextBtn.textContent=isLast?'See your results':'Next';
    nextBtn.addEventListener('click',function(){
      markAccountActivated();
      session.index+=1;
      if(session.index>=session.questions.length) finishUnit();
      else renderQuestion();
    });
    body.appendChild(nextBtn);

    if(isCorrect&&typeof showSeedReward==='function'&&typeof SEED_VALUES!=='undefined'){
      showSeedReward(SEED_VALUES.found||1);
    }
  }

  function finishUnit(){
    if(!session) return;
    // Only count steps that were actually scored — a chunk flow mixes
    // unscored teaching cards in with quiz questions, so the denominator
    // shouldn't include those.
    var scorable=session.questions.filter(function(q){ return q.kind==='choice'||q.kind==='truefalse'||q.kind==='multitarget'; });
    var total=scorable.length||session.questions.length;
    var correct=session.correct;
    var bar=el('lessons-progress-bar');
    if(bar) bar.style.width='100%';

    saveProgress(session.unitId,correct,total);

    var round=el('lessons-round'), done=el('lessons-done');
    if(round) round.hidden=true;
    if(done) done.hidden=false;
    var scoreEl=el('lessons-done-score');
    if(scoreEl) scoreEl.textContent=correct+' / '+total;

    if(typeof showStatus==='function'){
      showStatus(correct===total?'Perfect round!':'Round complete — '+correct+' of '+total,2200);
    }
  }

  document.addEventListener('DOMContentLoaded',function(){
    var openBtn=el('lessons-button');
    if(openBtn) openBtn.addEventListener('click',openPicker);

    var closeBtn=el('lessons-close');
    if(closeBtn) closeBtn.addEventListener('click',closeLessons);

    var unitCards=document.querySelectorAll('[data-lesson-unit]');
    unitCards.forEach(function(card){
      card.addEventListener('click',function(){
        startUnit(card.getAttribute('data-lesson-unit'));
      });
    });

    var backBtn=el('lessons-done-back');
    if(backBtn) backBtn.addEventListener('click',backToPicker);

    var retryBtn=el('lessons-done-retry');
    if(retryBtn) retryBtn.addEventListener('click',function(){
      if(lastUnitId) startUnit(lastUnitId);
    });
  });

  window.TREEWALK_LESSONS={UNITS:UNITS};
})();
