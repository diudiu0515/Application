(function(){
  var E=function(v){return String(v==null?"":v).replace(/[&<>'"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]})};
  var badge=function(v){return '<span class="status '+statusClass(v)+'">'+E(String(v||"—").replaceAll("_"," "))+'</span>'};
  var groups={profile:10,topics:10,papers:20,fit:15,recruiting:15,members:10,tsinghua:5,community:5,decision:5,contact:5};
  var researchTasks=[
    ["departmentProfile","profile"],["facultyHomepage","profile"],["labHomepage","profile"],["researchTopics","topics"],
    ["recentPapers","papers"],["relevantPapers","papers"],["matchProjects","fit"],["currentStudents","members"],["alumni","members"],
    ["tsinghua","tsinghua"],["recruiting","recruiting"],["funding","recruiting"],["community","community"],
    ["decideApply","decision"],["decideContact","contact"],["emailDraft","contact"],["emailSent","contact"],["followUp","contact"]
  ];
  function done(v){return typeof v==="object"?!!v.completed:!!v}
  function setTask(f,key,value){
    f.researchChecklist=f.researchChecklist||{};
    var old=f.researchChecklist[key]||{};
    f.researchChecklist[key]={completed:value,completedAt:value?(old.completedAt||new Date().toISOString()):"",notes:old.notes||""};
  }
  function completion(f){
    var by={};
    researchTasks.forEach(function(x){(by[x[1]]||(by[x[1]]=[])).push(x[0])});
    return Math.round(Object.keys(groups).reduce(function(total,g){
      var keys=by[g]||[];
      return total+groups[g]*(keys.filter(function(k){return done(f.researchChecklist&&f.researchChecklist[k])}).length/keys.length);
    },0));
  }
  function stage(f){
    var c=f.researchChecklist||{};
    if(!done(c.departmentProfile)&&!done(c.facultyHomepage))return "Discovered";
    if(!done(c.researchTopics))return "Basic Info Checked";
    if(!done(c.matchProjects))return "Research Fit Checked";
    if(!done(c.recentPapers)||!done(c.relevantPapers))return "Recent Papers Checked";
    if(!done(c.currentStudents)||!done(c.alumni))return "Lab Members Checked";
    if(!done(c.tsinghua))return "Tsinghua Connections Checked";
    if(!done(c.recruiting))return "Recruiting Checked";
    if(!done(c.community))return "Community Signals Checked";
    if(["not_reviewed","researching"].includes(f.consideration))return "Decision Needed";
    if(["considering","not_considering"].includes(f.consideration))return String(f.consideration).replaceAll("_"," ");
    if(["high_priority","backup"].includes(f.consideration))return String(f.consideration).replaceAll("_"," ");
    if(!done(c.decideContact))return "Contact Decision";
    if(["sent","replied","follow_up","meeting","no_response"].includes(f.contact))return "Contacted";
    return "Apply Decision";
  }
  function matchedProject(f){
    var m=state.matches.filter(function(x){return x.facultyId===f.id}).sort(function(a,b){return Number(b.score||0)-Number(a.score||0)})[0];
    return m?project(m.projectId):null;
  }
  function facultyMissing(f){
    var c=f.researchChecklist||{},out=[],members=state.labMembers.filter(function(x){return x.facultyId===f.id});
    if(!done(c.recruiting))out.push("Recruiting verification");
    if(!done(c.recentPapers)||!done(c.relevantPapers))out.push("Recent papers review");
    if(!done(c.currentStudents)||!done(c.alumni))out.push("Lab member review");
    if(members.some(function(x){return String(x.isTsinghuaAlumni)==="true"})&&!done(c.tsinghua))out.push("Tsinghua connection review");
    if(["considering","high_priority","backup"].includes(f.consideration)&&!done(c.decideApply))out.push("Decision rationale");
    if(f.contact==="planning"&&!done(c.emailSent))out.push("Send planned email");
    if(!state.verificationRecords.some(function(x){return x.entityId===f.id&&x.status==="official_confirmed"}))out.push("Official evidence");
    return out;
  }
  function checked(f,key){
    var c=f.researchChecklist||{};
    if(key==="consider")return ["considering","high_priority","backup"].includes(f.consideration);
    if(key==="high")return f.consideration==="high_priority";
    if(key==="recruiting")return done(c.recruiting);
    if(key==="tsinghua")return done(c.tsinghua);
    if(key==="papers")return done(c.recentPapers)&&done(c.relevantPapers);
    if(key==="contact")return f.contact!=="not_planned";
    return false;
  }
  function quickBox(f,key,label){
    return '<label class="tag"><input type="checkbox" data-req-qf="'+E(f.id+":"+key)+'" '+(checked(f,key)?"checked":"")+'> '+E(label)+'</label>';
  }
  function facultyRows(){
    var filters=window.facultyFilters||{};
    return state.faculty.filter(function(f){
      var p=program(f.programId),text=((f.interests||[]).join(" ")+" "+(f.why||"")+" "+JSON.stringify(f.autoFamilies||{})).toLowerCase();
      var projectOk=!filters.project||state.matches.some(function(m){return m.facultyId===f.id&&m.projectId===filters.project});
      return (!filters.topic||text.includes(filters.topic.toLowerCase()))&&
        (!filters.school||p&&p.school===filters.school)&&
        (!filters.minFit||strategicScore(f.id)>=Number(filters.minFit))&&
        (!filters.recruiting||f.recruiting===filters.recruiting)&&
        (!filters.project||projectOk)&&
        (!filters.consideration||f.consideration===filters.consideration)&&
        (!filters.review||(f.reviewStatus||"curated")===filters.review)&&
        ((filters.discovery||"active")==="all"||((filters.discovery||"active")==="active"?f.discoveryActive!==false:f.discoveryActive===false));
    }).sort(function(a,b){return strategicScore(b.id)-strategicScore(a.id)});
  }
  window.extendedViews.faculty=function(){
    var f=window.facultyFilters||{},rows=facultyRows();
    var report=(window.AUTO_DATA&&window.AUTO_DATA.report)||{schools:0,candidates:0,coveredSchools:0,zeroSchools:0,details:[]};
    var schools=[...new Set(state.programs.map(function(x){return x.school}))].sort();
    var recruiting=[...new Set(state.faculty.map(function(x){return x.recruiting||"unknown"}))].sort();
    var action='<button class="btn" data-req-bulk="confirm">Confirm</button><button class="btn" data-req-bulk="reviewed">Mark reviewed</button><button class="btn" data-req-bulk="considering">Considering</button><button class="btn" data-req-bulk="not_considering">Not considering</button><button class="btn" data-req-bulk="high_priority">High priority</button><button class="btn" data-req-bulk="recruiting">Recruiting checked</button><button class="btn" data-req-bulk="papers">Papers reviewed</button><button class="btn" data-req-bulk="contact">Contact planned</button><button class="btn" data-req-bulk="tag">Add tag</button><button class="btn" data-req-bulk="recheck">Schedule recheck</button><button class="btn primary" data-add="faculty">+ Faculty</button>';
    var toolbar='<div class="toolbar"><input data-req-ffilter="topic" value="'+E(f.topic)+'" placeholder="Research topic…"><select data-req-ffilter="school"><option value="">All schools</option>'+schools.map(function(x){return '<option '+(x===f.school?"selected":"")+'>'+E(x)+'</option>'}).join("")+'</select><input data-req-ffilter="minFit" value="'+E(f.minFit)+'" type="number" min="0" max="100" placeholder="Min fit"><select data-req-ffilter="recruiting"><option value="">Any recruiting</option>'+recruiting.map(function(x){return '<option '+(x===f.recruiting?"selected":"")+'>'+E(x)+'</option>'}).join("")+'</select><select data-req-ffilter="project"><option value="">Any project match</option>'+state.projects.map(function(x){return '<option value="'+E(x.id)+'" '+(x.id===f.project?"selected":"")+'>'+E(x.name)+'</option>'}).join("")+'</select><select data-req-ffilter="consideration"><option value="">Any consideration</option>'+["not_reviewed","researching","considering","high_priority","backup","contact_later","not_considering","archived"].map(function(x){return '<option '+(x===f.consideration?"selected":"")+'>'+E(x)+'</option>'}).join("")+'</select><select data-req-ffilter="review"><option value="">Any review state</option>'+["curated","needs_review","confirmed","needs_more_evidence","rejected"].map(function(x){return '<option '+(x===f.review?"selected":"")+'>'+E(x)+'</option>'}).join("")+'</select><select data-req-ffilter="discovery">'+[["active","Active discovery"],["all","Active + stale"],["stale","Stale only"]].map(function(x){return '<option value="'+x[0]+'" '+(x[0]===(f.discovery||"active")?"selected":"")+'>'+x[1]+'</option>'}).join("")+'</select><span class="tag">'+rows.length+" / "+state.faculty.filter(function(x){return x.discoveryActive!==false}).length+'</span></div>';
    var body=rows.map(function(x){
      var p=program(x.programId),mp=matchedProject(x),pct=completion(x);
      return '<tr><td><input type="checkbox" data-fselect="'+E(x.id)+'"></td><td><div class="faculty-name">'+E(x.name)+'</div><div class="subtext">'+E(p&&p.school)+' · '+E(x.position)+'</div></td><td><span class="score">'+strategicScore(x.id)+'</span></td><td>'+E(mp?mp.short||mp.name:"—")+'</td><td>'+badge(x.recruiting)+'</td><td><select class="quick-status" data-id="'+E(x.id)+'">'+["not_reviewed","researching","considering","high_priority","backup","contact_later","not_considering","archived"].map(function(s){return '<option '+(s===x.consideration?"selected":"")+'>'+E(s)+'</option>'}).join("")+'</select></td><td>'+badge(stage(x))+'<div class="subtext">'+pct+'% complete</div></td><td><div class="keywords">'+quickBox(x,"consider","Consider")+quickBox(x,"high","High")+quickBox(x,"recruiting","Recruiting")+quickBox(x,"tsinghua","Tsinghua")+quickBox(x,"papers","Papers")+quickBox(x,"contact","Contact")+'</div></td><td>'+fmt(x.lastChecked)+'</td><td><button class="btn subtle" data-fdetail="'+E(x.id)+'">Open</button></td></tr>';
    }).join("");
    var coverage='<div class="grid stats">'+stat("Schools scanned",report.schools||0,"Configured official sources")+stat("Candidate faculty",report.candidates||0,"Direction-matched, unconfirmed")+stat("Schools with matches",report.coveredSchools||0,"At least one candidate")+stat("Zero-result schools",report.zeroSchools||0,"Needs source adapter / manual review")+'</div><details class="panel" style="margin-bottom:16px"><summary class="panel-head" style="cursor:pointer"><h2>Top 50 collection coverage</h2><span>Last generated '+fmt(window.AUTO_DATA&&window.AUTO_DATA.generatedAt)+'</span></summary><div class="panel-body"><div class="keywords">'+(report.details||[]).map(function(x){return '<span class="status '+statusClass(x.coverage==='covered'?'confirmed':'outdated')+'">#'+E(x.rank)+' '+E(x.school)+' · '+E(x.candidates)+'</span>'}).join("")+'</div><p class="subtext">A zero result is shown, never hidden. Candidate rows are discovery evidence and require individual advising/recruiting confirmation.</p></div></details>';
    return head("Top 50 · human review gate","Faculty Intelligence","All automated results remain candidate evidence until confirmed. Filter by topic, school, fit, recruiting and project match.",action)+coverage+toolbar+'<section class="panel"><div class="table-wrap"><table class="data-table"><thead><tr><th><input type="checkbox" id="select-all-faculty"></th><th>Faculty / school</th><th>Fit</th><th>Project</th><th>Recruiting</th><th>Consideration</th><th>Workflow stage</th><th>Quick checks</th><th>Last checked</th><th></th></tr></thead><tbody>'+body+'</tbody></table></div></section>';
  };
  function ranking(p){
    var vals=[p.rankingUsNews,p.rankingCs,p.rankingQs,p.rankingCustom].map(Number).filter(function(x){return x>0});
    return vals.length?Math.min.apply(null,vals):9999;
  }
  function programRows(){
    var f=window.programFilters||{};
    return state.programs.filter(function(p){
      var english=(String(p.toefl||"")+" "+String(p.ielts||"")+" "+String(p.englishWaiver||"")).toLowerCase();
      return (!f.tier||p.tier===f.tier)&&(!f.maxRank||ranking(p)<=Number(f.maxRank))&&
        (!f.deadlineBefore||String(p.deadline||"")<=f.deadlineBefore)&&
        (!f.minFaculty||Number(p.facultyCount||0)>=Number(f.minFaculty))&&
        (!f.maxFee||Number(p.fee||0)<=Number(f.maxFee))&&
        (!f.gre||String(p.gre||"").toLowerCase().includes(f.gre.toLowerCase()))&&
        (!f.english||english.includes(f.english.toLowerCase()))&&
        (!f.funding||String(p.funding||"").toLowerCase().includes(f.funding.toLowerCase()))&&
        (!f.minPriority||Number(p.priority||0)>=Number(f.minPriority));
    }).sort(function(a,b){return schoolScore(b)-schoolScore(a)});
  }
  window.extendedViews.programs=function(){
    var f=window.programFilters||{},rows=programRows();
    function inp(k,type,placeholder){return '<input data-req-pfilter="'+k+'" type="'+(type||"text")+'" value="'+E(f[k])+'" placeholder="'+placeholder+'">'}
    var toolbar='<div class="toolbar"><select data-req-pfilter="tier"><option value="">All tiers</option>'+["Dream","Reach","Target","Lower Risk","Research set"].map(function(x){return '<option '+(x===f.tier?"selected":"")+'>'+E(x)+'</option>'}).join("")+'</select>'+inp("maxRank","number","Best rank ≤")+inp("deadlineBefore","date","Deadline before")+inp("minFaculty","number","Min faculty")+inp("maxFee","number","Max fee")+inp("gre","text","GRE contains…")+inp("english","text","English rule…")+inp("funding","text","Funding contains…")+inp("minPriority","number","Min priority")+'<span class="tag">'+rows.length+" programs"+'</span></div>';
    var body=rows.map(function(p){
      var verified=state.verificationRecords.some(function(x){return x.entityId===p.id&&x.status==="official_confirmed"});
      return '<tr><td><div class="school-name">'+E(p.school)+'</div><div class="subtext">'+E(p.department)+' · '+E(p.city)+", "+E(p.state)+'</div></td><td>'+badge(p.tier)+'<div class="subtext">Priority '+E(p.priority)+' · score '+schoolScore(p)+' · GPA risk '+E(gpaRisk(p))+'</div></td><td>'+[p.rankingUsNews,p.rankingCs,p.rankingQs,p.rankingCustom].map(function(x){return E(x||"—")}).join(" / ")+'<div class="subtext">US News / CSRankings / QS / custom · '+E(p.rankingYear||"year needed")+'</div></td><td>'+fmt(p.deadline)+'<div class="subtext">'+E(p.deadlineStatus||"official date needs recheck")+' · priority '+fmt(p.priorityDeadline)+'</div></td><td>GRE '+E(p.gre)+' · TOEFL '+E(p.toefl)+' · IELTS '+E(p.ielts||"verify")+'<div class="subtext">'+E(p.englishWaiver||"English waiver needs verification")+'</div></td><td>'+badge(p.fullyFunded||p.funding)+'<div class="subtext">$'+Number(p.stipend||0).toLocaleString()+' · '+E(p.guaranteeYears||"?")+" years"+'</div></td><td>'+E(p.facultyCount)+' tracked</td><td>'+badge(verified?"official_confirmed":"needs_recheck")+'</td><td><button class="btn subtle" data-program-full="'+E(p.id)+'">Full record</button></td></tr>';
    }).join("");
    return head("School → Program","Complete Program Database","All requested ranking, deadline, faculty, fee, GRE, English, funding and priority filters are available.",'<button class="btn primary" data-add="program">+ Add program</button>')+toolbar+'<section class="panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>Program</th><th>Strategy</th><th>Rankings</th><th>Deadline</th><th>Tests / English</th><th>Funding</th><th>Faculty</th><th>Verification</th><th></th></tr></thead><tbody>'+body+'</tbody></table></div></section>';
  };
  function dashboardEvents(){
    var out=[];
    state.programs.forEach(function(x){if(x.deadline)out.push({title:x.school+" application",date:x.deadline,type:"Application"})});
    state.tasks.forEach(function(x){if(x.due&&!x.done)out.push({title:x.title,date:x.due,type:x.type||"Task"})});
    state.recommendations.forEach(function(x){if(x.deadline&&!x.submitted)out.push({title:"Recommendation · "+(state.recommenders.find(function(r){return r.id===x.recommenderId})||{}).name,date:x.deadline,type:"Recommendation"})});
    (state.summerResearch||[]).forEach(function(x){if(x.deadline)out.push({title:x.program+" · "+x.school,date:x.deadline,type:"Summer Research"})});
    state.interviews.forEach(function(x){if(x.date)out.push({title:"Interview · "+(faculty(x.facultyId)||{}).name,date:String(x.date).slice(0,10),type:"Interview"})});
    (state.deadlines||[]).forEach(function(x){if(x.date)out.push({title:x.title,date:x.date,type:x.type})});
    return out.sort(function(a,b){return String(a.date).localeCompare(String(b.date))});
  }
  window.extendedViews.dashboard=function(){
    var activeFaculty=state.faculty.filter(function(x){return x.discoveryActive!==false});
    var high=activeFaculty.filter(function(x){return strategicScore(x.id)>=85}).length;
    var planned=state.applications.filter(function(x){return !["Rejected","Withdrawn"].includes(x.status)}).length;
    var submitted=state.applications.filter(function(x){return ["Submitted","Interview","Offer"].includes(x.status)}).length;
    var contacted=activeFaculty.filter(function(x){return ["sent","replied","follow_up","meeting","no_response"].includes(x.contact)}).length;
    var replies=activeFaculty.filter(function(x){return ["replied","meeting"].includes(x.contact)}).length;
    var deadlines=dashboardEvents(),future=deadlines.filter(function(x){return daysTo(x.date)>=0}),first=future[0],next=future[1];
    var queue=activeFaculty.map(function(x){return {f:x,gaps:facultyMissing(x)}}).filter(function(x){return strategicScore(x.f.id)>=75&&x.gaps.length}).sort(function(a,b){return strategicScore(b.f.id)-strategicScore(a.f.id)});
    var stages=["Researching","Shortlisted","Preparing","Submitted","Interview","Offer","Rejected","Withdrawn"];
    var needs=state.verificationRecords.filter(function(x){return ["outdated","unverified","contradicted"].includes(x.status)});
    var reminders=state.recommendations.filter(function(x){return !x.submitted&&x.deadline&&daysTo(x.deadline)>=0&&daysTo(x.deadline)<=7});
    var stats=stat("Total Programs",state.programs.length,"Top 50 and custom records")+stat("Target Programs",state.programs.filter(function(x){return x.tier==="Target"}).length,"Current strategy tier")+stat("Faculty Tracked",activeFaculty.length,"Candidate + confirmed")+stat("High-Fit Faculty",high,"Strategic fit ≥ 85")+stat("Applications Planned",planned,"Excludes rejected / withdrawn")+stat("Applications Submitted",submitted,"Submitted or later")+stat("Professor Contacts",contacted,"Sent or later")+stat("Replies",replies,"Reply or meeting")+stat("Interviews",state.interviews.length,"Recorded interviews")+stat("Offers",state.offers.length,"Recorded offers");
    var taskHtml=[...state.tasks].filter(function(x){return !x.done}).sort(function(a,b){return String(a.due).localeCompare(String(b.due))}).slice(0,8).map(function(t){return '<label class="task"><input type="checkbox" data-task="'+E(t.id)+'"><div class="task-info"><div class="task-title">'+E(t.title)+'</div><div class="task-meta">'+E(t.type)+' · '+fmt(t.due)+'</div></div></label>'}).join("")||'<div class="empty">No open tasks.</div>';
    var deadlineHtml=future.slice(0,10).map(function(x){return '<div class="timeline-item"><strong>'+fmt(x.date)+' · '+E(x.title)+'</strong><p>'+E(x.type)+' · '+daysTo(x.date)+" days remaining"+'</p></div>'}).join("")||'<div class="empty">No upcoming deadlines.</div>';
    var queueHtml=queue.map(function(x){return '<div class="queue-item"><div class="queue-top"><div><strong>'+E(x.f.name)+'</strong><div class="subtext">'+E((program(x.f.programId)||{}).school)+' · '+E(stage(x.f))+'</div></div><span class="score">'+strategicScore(x.f.id)+'</span></div><p><b>Missing:</b> '+x.gaps.map(E).join(" · ")+'</p><button class="btn subtle" data-queue-open="'+E(x.f.id)+'">Continue Research</button></div>'}).join("")||'<div class="empty">No high-priority evidence gaps.</div>';
    var progress='<div class="grid stats">'+stat("Discovered",activeFaculty.length,"All faculty")+stat("Researched",activeFaculty.filter(function(x){return completion(x)>=50}).length,"Completion ≥ 50%")+stat("Considering",activeFaculty.filter(function(x){return ["considering","high_priority","backup"].includes(x.consideration)}).length,"Active decisions")+stat("High priority",activeFaculty.filter(function(x){return x.consideration==="high_priority"}).length,"Top advisor targets")+stat("Recruiting verified",activeFaculty.filter(function(x){return done((x.researchChecklist||{}).recruiting)}).length,"Check completed")+stat("Tsinghua found",state.labMembers.filter(function(x){return String(x.isTsinghuaAlumni)==="true"}).length,"Public records")+stat("Contacted",contacted,"Sent or later")+stat("Replied",replies,"Reply or meeting")+'</div>';
    return head("Application command center",E(state.profile.cycle)+" CS PhD Application","Multimodal + Robotics first · GPA 3.3 risk shown separately · evidence backed")+
      '<div class="grid stats">'+stats+'</div>'+
      '<div class="panel" style="margin-bottom:16px"><div class="countdown"><div><span>Earliest Deadline</span><strong>'+(first?fmt(first.date):"—")+'</strong><span>'+(first?E(first.title):"No future deadline")+'</span></div><div><span>Days Remaining</span><strong>'+(first?daysTo(first.date):"—")+'</strong><span>to earliest tracked item</span></div><div><span>Next Deadline</span><strong>'+(next?fmt(next.date):"—")+'</strong><span>'+(next?E(next.title):"No second deadline")+'</span></div></div></div>'+
      '<div class="grid two-col"><section class="panel"><div class="panel-head"><h2>Recent Tasks</h2><button class="btn subtle" data-add="task">+ Task</button></div><div class="panel-body">'+taskHtml+'</div></section><section class="panel"><div class="panel-head"><h2>Upcoming Deadlines Timeline</h2><span>All planning sources</span></div><div class="panel-body"><div class="timeline">'+deadlineHtml+'</div></div></section></div>'+
      '<section class="panel" style="margin-top:16px"><div class="panel-head"><h2>Application Funnel</h2><span>Full status path</span></div><div class="panel-body"><div class="funnel">'+stages.map(function(s){return '<div class="funnel-step"><b>'+state.applications.filter(function(x){return x.status===s}).length+'</b><span>'+s+'</span></div>'}).join("")+'</div></div></section>'+
      '<section class="panel" style="margin-top:16px"><div class="panel-head"><h2>Faculty Research Progress</h2><span>Research completeness, not faculty quality</span></div><div class="panel-body">'+progress+'</div></section>'+
      '<section class="panel" style="margin-top:16px"><div class="panel-head"><h2>Faculty Research Queue</h2><span>'+queue.length+' visible priorities</span></div><div class="panel-body">'+queueHtml+'</div></section>'+
      '<section class="panel" style="margin-top:16px"><div class="panel-head"><h2>Information Needing Verification</h2><span>'+needs.length+' highest-priority items</span></div><div class="panel-body">'+(needs.map(function(x){return '<div class="queue-item"><div class="queue-top"><strong>'+E(x.entityType)+" · "+E(x.field)+'</strong>'+badge(x.status)+'</div><p>'+E(x.value)+' · checked '+fmt(x.checkedAt)+'</p></div>'}).join("")||'<div class="empty">No verification items.</div>')+'</div></section>'+
      '<section class="panel" style="margin-top:16px"><div class="panel-head"><h2>Recommendation Reminders</h2><span>7 / 3 / deadline-day window</span></div><div class="panel-body">'+(reminders.map(function(x){return '<div class="task"><div class="task-info"><div class="task-title">'+E((state.recommenders.find(function(r){return r.id===x.recommenderId})||{}).name||"Recommender")+'</div><div class="task-meta">Due '+fmt(x.deadline)+' · '+daysTo(x.deadline)+" days"+'</div></div>'+badge(daysTo(x.deadline)<=3?"urgent":"under 7 days")+'</div>'}).join("")||'<div class="empty">No recommendation reminders in the next 7 days.</div>')+'</div></section>';
  };
  var oldSettings=window.extendedViews.settings;
  window.extendedViews.settings=function(){
    var base=oldSettings?oldSettings():"";
    var rows=[...state.aiTraces].sort(function(a,b){return String(b.at).localeCompare(String(a.at))});
    return base+'<section class="panel" style="margin-top:16px"><div class="panel-head"><h2>AI / Generated Content Trace Registry</h2><span>'+rows.length+' traceable outputs</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Time</th><th>Action</th><th>Output entity</th><th>Source entity IDs</th><th>Generated content</th></tr></thead><tbody>'+rows.map(function(x){return '<tr><td>'+fmt(x.at)+'</td><td>'+E(x.action)+'</td><td>'+E(x.outputEntityId)+'</td><td>'+E((x.sourceEntityIds||[]).join(", "))+'</td><td>'+E(x.content)+'</td></tr>'}).join("")+'</tbody></table></div></section>';
  };
  function selected(){return [...document.querySelectorAll("[data-fselect]:checked")].map(function(x){return x.dataset.fselect})}
  function updateQuick(f,key,value){
    if(key==="consider")f.consideration=value?"considering":"not_reviewed";
    if(key==="high")f.consideration=value?"high_priority":"considering";
    if(key==="recruiting"){setTask(f,"recruiting",value);f.recruitingVerifiedAt=value?new Date().toISOString():""}
    if(key==="tsinghua")setTask(f,"tsinghua",value);
    if(key==="papers"){setTask(f,"recentPapers",value);setTask(f,"relevantPapers",value)}
    if(key==="contact"){f.contact=value?"planning":"not_planned";setTask(f,"decideContact",value)}
    f.completion=completion(f);
  }
  function bulk(kind){
    var ids=selected();
    if(!ids.length){toast("请先勾选导师");return}
    var value="";
    if(kind==="tag"){value=prompt("Tag","strong_fit");if(!value)return}
    if(kind==="recheck"){value=prompt("Recheck date",new Date(Date.now()+14*86400000).toISOString().slice(0,10));if(!value)return}
    ids.forEach(function(id){
      var f=faculty(id);if(!f)return;
      if(kind==="confirm")f.reviewStatus="confirmed";
      if(kind==="reviewed"){f.reviewStatus="confirmed";setTask(f,"departmentProfile",true);setTask(f,"facultyHomepage",true)}
      if(kind==="considering")f.consideration="considering";
      if(kind==="not_considering")f.consideration="not_considering";
      if(kind==="high_priority")f.consideration="high_priority";
      if(kind==="recruiting")updateQuick(f,"recruiting",true);
      if(kind==="papers")updateQuick(f,"papers",true);
      if(kind==="contact")updateQuick(f,"contact",true);
      if(kind==="tag")f.tags=[...new Set((f.tags||[]).concat([value]))];
      if(kind==="recheck")f.nextRecheck=value;
      f.completion=completion(f);
    });
    persist("Faculty bulk operation","Faculty",ids.length+" · "+kind+(value?" → "+value:""));
    shell();
  }
  var previous=window.extendedBind;
  window.extendedBind=function(){
    if(previous)previous();
    document.querySelectorAll("[data-req-ffilter]").forEach(function(x){x.oninput=function(){window.facultyFilters=window.facultyFilters||{};window.facultyFilters[x.dataset.reqFfilter]=x.value;shell()}});
    document.querySelectorAll("[data-req-pfilter]").forEach(function(x){x.oninput=function(){window.programFilters=window.programFilters||{};window.programFilters[x.dataset.reqPfilter]=x.value;shell()}});
    document.querySelectorAll("[data-req-qf]").forEach(function(x){x.onchange=function(){var parts=x.dataset.reqQf.split(":"),f=faculty(parts[0]);updateQuick(f,parts[1],x.checked);persist("Faculty quick check",f.name,parts[1]+" → "+x.checked);shell()}});
    document.querySelectorAll("[data-req-bulk]").forEach(function(x){x.onclick=function(){bulk(x.dataset.reqBulk)}});
  };
})();
