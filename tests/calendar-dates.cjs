const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {test} = require('node:test');
const copy = x => JSON.parse(JSON.stringify(x));
const legacyTasks = [
  {id:'t1',title:'Review 3 recent papers from Morency lab',due:'2026-08-27',type:'Paper',done:false},
  {id:'t2',title:'Verify CMU faculty recruiting status',due:'2026-09-02',type:'Faculty',done:false},
  {id:'t3',title:'Draft candidate research narrative',due:'2026-09-08',type:'SOP',done:false},
  {id:'t4',title:'Export monthly backup',due:'2026-09-20',type:'Data',done:false}
];
function workspace(prepare) {
  const storage = new Map(), listeners = new Map();
  const ctx = vm.createContext({console, document:{getElementById:id=>({addEventListener:(event,fn)=>listeners.set(`${id}:${event}`,fn)})},
    FileReader:class { readAsText(file) { this.result=file.content; this.onload(); } }, alert:message=>{throw Error(message)},
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}});
  ctx.window = ctx;
  const run = code => vm.runInContext(code, ctx);
  // Freeze time so overdue and upcoming boundary tests remain reproducible.
  run(`Date = class extends Date { constructor(...args) { super(...(args.length ? args : ['2026-10-14T12:00:00'])); } };`);
  const scripts = [...fs.readFileSync('index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(x=>x[1]);
  for(const file of scripts) {
    if(file==='app.js' && prepare) {
      const saved=copy(ctx.SEED_DATA);
      Object.assign(saved.meta,{strategyVersion:2,summerStrategyVersion:3});
      for(const row of saved.summerResearch) delete row.dateKind;
      saved.tasks=copy(legacyTasks);
      prepare(saved);
      storage.set('phd-intelligence-v1',JSON.stringify(saved));
    }
    // Keep the real load/merge/import functions; only skip DOM mounting in unit tests.
    run(fs.readFileSync(file,'utf8').replace(/\nshell\(\);\s*$/, '\n'));
  }
  return {ctx,run,listeners,state:()=>copy(run('state')),events:()=>copy(ctx.calendarEvents())};
}
test('first visit has no example tasks, retains exact historical dates and planning targets',()=>{
  const w=workspace();
  assert.equal(w.state().tasks.length,0);
  const events=w.events(), chicago=events.find(x=>x.id==='summer-sr12');
  assert.equal(chicago.date,'2026-03-13');
  assert.equal(chicago.dateKind,'historical');
  assert.equal(w.ctx.calendarUrgency(chicago),'historical_reference');
  assert.equal(events.filter(x=>x.dateKind==='historical').length,4);
  assert.equal(events.filter(x=>w.ctx.calendarUrgency(x)==='overdue').length,0);
  for(const id of ['sr4','sr5','sr6','sr7']) assert.equal(events.find(x=>x.id===`summer-${id}`).dateKind,'internal');
  assert.match(w.ctx.extendedViews.dashboard(),/No open tasks/);
  assert.doesNotMatch(w.ctx.extendedViews.dashboard(),/Review 3 recent papers from Morency lab/);
});
test('old users lose only untouched placeholders, and migration is idempotent across storage reloads',()=>{
  const w=workspace(()=>{});
  assert.equal(w.state().tasks.length,0);
  assert.equal(w.state().meta.datePolicyVersion,1);
  const first=w.state();
  w.run('persist(); state=load();');
  assert.deepEqual(w.state(),first);
});
test('edited, completed, annotated and explicitly owned example tasks survive byte for byte',()=>{
  let expected;
  const w=workspace(s=>{
    s.tasks[0].due='2027-01-01';
    s.tasks[1].done=true;
    s.tasks[2].notes='Keep my notes';
    s.tasks[3].updatedAt='2026-10-10';
    expected=copy(s.tasks);
  });
  assert.deepEqual(w.state().tasks,expected);
  assert.ok(!w.events().some(x=>x.id==='task-t2'));
});
test('reopened task with audit history and a same-content manual task survive',()=>{
  const w=workspace(s=>{
    s.history.push({action:'Task updated',entity:s.tasks[0].title,detail:'Reopened'});
    s.tasks.push({...s.tasks[1],id:'manual-copy'});
  });
  assert.deepEqual(w.state().tasks.map(x=>x.id),['t1','manual-copy']);
});
test('old strategy migration preserves edited dates and cycles even without override markers',()=>{
  const w=workspace(s=>{
    delete s.meta.strategyVersion; s.meta.summerStrategyVersion=1;
    const row=s.summerResearch.find(x=>x.id==='sr12');
    row.deadline='2027-03-20';row.cycle='Summer 2027';row.notes='User checked date';
  });
  const row=w.state().summerResearch.find(x=>x.id==='sr12');
  assert.equal(row.deadline,'2027-03-20');assert.equal(row.cycle,'Summer 2027');
  assert.equal(row.notes,'User checked date');assert.equal(row.dateKind,'user');
});
test('unrelated edits do not erase provenance; explicit date classifications are respected',()=>{
  const w=workspace(s=>{
    Object.assign(s.summerResearch.find(x=>x.id==='sr12'),{notes:'My new notes',userOverride:true});
    Object.assign(s.summerResearch.find(x=>x.id==='sr4'),{dateKind:'official',deadline:'2027-02-01',cycle:'Summer 2027'});
  });
  assert.equal(w.state().summerResearch.find(x=>x.id==='sr12').dateKind,'historical');
  assert.equal(w.events().find(x=>x.id==='summer-sr4').dateKind,'official');
});
test('past manual tasks and official deadlines remain overdue; internal targets request review',()=>{
  const w=workspace();
  w.run(`state.tasks.push({id:'manual',title:'My overdue task',due:'2026-10-13',done:false});
    state.deadlines.push({id:'official',title:'Verified deadline',date:'2026-10-13',dateKind:'official'});
    state.deadlines.push({id:'plan',title:'My target',date:'2026-10-13',dateKind:'internal'});
    state.deadlines.push({id:'old-custom',title:'Legacy custom',date:'2026-10-13'});`);
  for(const id of ['task-manual','official','old-custom']) assert.equal(w.ctx.calendarUrgency(w.events().find(x=>x.id===id)),'overdue');
  assert.equal(w.ctx.calendarUrgency(w.events().find(x=>x.id==='plan')),'target_to_review');
  w.run(`state.tasks[0].done=true; state.deadlines[0].done='true';`);
  assert.ok(!w.events().some(x=>['task-manual','official'].includes(x.id)));
});
test('historical references never enter reminder buckets even before their date',()=>{
  const w=workspace();
  for(const date of ['2026-10-14','2026-10-17','2026-10-24','2026-11-03','2027-03-13']) {
    const e={date,dateKind:'historical'};
    assert.equal(w.ctx.calendarUrgency(e),'historical_reference');
    assert.equal(w.ctx.datePolicy.isActionable(e),false);
  }
  w.run(`state.deadlines.push({id:'future-reference',title:'FUTURE REFERENCE',date:'2026-10-15',dateKind:'historical'});`);
  assert.doesNotMatch(w.ctx.extendedViews.dashboard(),/FUTURE REFERENCE/);
});
test('historical query works in timeline, school and month views with clear summer labels',()=>{
  const w=workspace();
  w.ctx.calendarScope='historical';
  for(const mode of ['timeline','school','month']) {
    w.ctx.calendarMode=mode;w.ctx.calendarMonth='2026-03';
    const html=w.ctx.extendedViews.calendar();
    assert.match(html,/CS Student Summer Research Fellowship/);
    assert.match(html,/Historical cycle date/);
    assert.doesNotMatch(html,/Direct BAIR \/ robotics lab inquiry/);
  }
  assert.match(w.ctx.extendedViews.summer(),/Reference only; next-cycle deadline not confirmed/);
});
test('closed and ineligible opportunities stay queryable without reminders',()=>{
  const w=workspace();
  for(const status of ['Applied','Accepted','Rejected','Do not apply']) {
    w.run(`Object.assign(state.summerResearch.find(x=>x.id==='sr4'),{status:${JSON.stringify(status)},dateKind:'official',deadline:'2026-10-13'});`);
    const event=w.events().find(x=>x.id==='summer-sr4');
    assert.equal(w.ctx.calendarUrgency(event),'reference_only');
  }
});

test('actual task form persists a manual overdue task without seed cleanup',()=>{
  const w=workspace();
  w.run('modal=(title,body,onSave)=>{window.submitTask=onSave}; toast=()=>{};');
  w.run('openForm("task");');
  w.ctx.submitTask(new Map([['title','My manual task'],['due','2026-10-13'],['type','Research']]));
  w.run('state=load();');
  assert.equal(w.state().tasks.length,1);
  assert.equal(w.state().tasks[0].dateKind,'user');
  assert.equal(w.ctx.calendarUrgency(w.events().find(x=>x.source==='Task')),'overdue');
});
test('actual JSON import upgrades old backups and preserves edited or completed records',()=>{
  const w=workspace(), backup=w.state();
  delete backup.meta.datePolicyVersion;
  backup.tasks=copy(legacyTasks);
  backup.tasks[0].done=true;
  backup.tasks[1].title='User edited task';
  for(const row of backup.summerResearch) delete row.dateKind;
  w.run('shell=()=>{}; toast=()=>{};');
  w.listeners.get('import-file:change')({target:{files:[{name:'old-backup.json',content:JSON.stringify(backup)}]}});
  assert.deepEqual(w.state().tasks.map(x=>x.id),['t1','t2']);
  assert.equal(w.state().summerResearch.find(x=>x.id==='sr12').dateKind,'historical');
  w.run('state=load();');
  assert.equal(w.state().tasks[0].done,true);
  assert.equal(w.state().tasks[1].title,'User edited task');
});
