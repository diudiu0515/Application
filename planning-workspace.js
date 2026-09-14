(function () {
  const E = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const openItems = () => (state.milestones || []).filter(x => !x.done).sort((a,b) => String(a.due || '9999').localeCompare(String(b.due || '9999')));
  const status = x => x.done ? '已完成' : !x.due ? '未定日期' : daysTo(x.due) < 0 ? '待重新安排' : daysTo(x.due) <= 14 ? '近期行动' : '计划中';
  window.setMilestoneDone = function (id, done) {
    const item = state.milestones.find(x => x.id === id);
    if (!item) return;
    item.done = done;
    item.completedAt = done ? new Date().toISOString() : '';
    persist('Milestone updated', item.title, done ? 'Completed' : 'Reopened');
  };
  function editMilestone(id) {
    const item = state.milestones.find(x => x.id === id) || {};
    const phases = [...new Map(window.SEED_DATA.milestones.map(x => [x.phase, x.phaseTitle])).entries()];
    modal(id ? '编辑阶段行动' : '新增阶段行动', `<div class="form-grid">${field('行动', 'title', item.title)}<div class="field"><label>阶段</label><select name="phase">${phases.map(([key,title]) => `<option value="${key}" ${key === item.phase ? 'selected' : ''}>${E(title)}</option>`).join('')}</select></div>${field('个人目标日期（非官方截止日期）', 'due', item.due || '', 'date', false, false)}${field('交付内容 / 备注', 'notes', item.notes || '', 'textarea', true)}</div>`, fd => {
      const data = Object.fromEntries(fd);
      data.phaseTitle = phases.find(x => x[0] === data.phase)[1];
      if (item.id) Object.assign(item, data);
      else state.milestones.push({...data, id: uid('milestone'), done: false, completedAt: '', view: 'research'});
      persist('Milestone saved', data.title, data.due || 'No target date');
    });
  }
  function summary() {
    const next = openItems().slice(0,3), total = state.milestones.length, done = total - openItems().length;
    return `<section class="panel roadmap-summary"><div class="panel-head"><div><div class="eyebrow">2027 暑研 → ${E(state.profile.cycle)}</div><h2>我的申请路线 · ${done}/${total}</h2></div><button class="btn" data-plan-view="roadmap">查看完整路线 →</button></div><div class="panel-body"><p class="subtext">阶段日期是可调整的个人目标；正式截止时间以各校当季官网为准。</p>${next.map(x => `<div class="task"><input aria-label="完成：${E(x.title)}" type="checkbox" data-milestone-done="${E(x.id)}"><div class="task-info"><div class="task-title">${E(x.title)}</div><div class="task-meta">${fmt(x.due)} · ${status(x)}</div></div><button class="btn subtle" data-plan-view="${E(x.view)}">进入</button></div>`).join('') || '<p>所有阶段行动已完成，可以继续添加下一步。</p>'}</div></section>`;
  }
  const previousDashboard = window.extendedViews.dashboard;
  window.extendedViews.dashboard = () => summary() + previousDashboard();
  window.extendedViews.roadmap = function () {
    const phases = [...new Map(state.milestones.map(x => [x.phase, x.phaseTitle])).entries()];
    return `${head('2027 Summer → 2028 Fall', '我的 PhD 申请路线', '多模态 / 具身方向 · 全奖博士目标 · 从研究成果、暑研合作到正式申请', '<button class="btn primary" id="add-milestone">+ 阶段行动</button>')}
      <div class="planning-note">这里的日期都是个人工作目标，可以随进度调整。每校招生要求、资助条件和截止时间请在 Programs 单独记录；推荐意愿、论文作者顺序与正式录用均按实际确认情况填写。</div>
      <div class="roadmap-grid">${phases.map(([phase, title]) => {
        const items = state.milestones.filter(x => x.phase === phase), count = items.filter(x => x.done).length;
        return `<section class="panel"><div class="panel-head"><h2>${E(title)}</h2><span>${count}/${items.length}</span></div><div class="panel-body">${items.map(x => `<article class="milestone ${x.done ? 'is-done' : ''}"><div class="task"><input aria-label="完成：${E(x.title)}" type="checkbox" data-milestone-done="${E(x.id)}" ${x.done ? 'checked' : ''}><div class="task-info"><strong>${E(x.title)}</strong><div class="task-meta">${fmt(x.due)} · ${status(x)}</div></div></div><p>${E(x.notes)}</p><div class="head-actions"><button class="btn subtle" data-plan-view="${E(x.view)}">打开相关页面</button><button class="btn subtle" data-milestone-edit="${E(x.id)}">编辑日期 / 备注</button></div></article>`).join('')}</div></section>`;
      }).join('')}</div>`;
  };
  const previousBind = window.extendedBind;
  window.extendedBind = function () {
    previousBind?.();
    document.querySelectorAll('[data-plan-view]').forEach(x => x.onclick = () => {currentView = x.dataset.planView; query = ''; shell();});
    document.querySelectorAll('[data-milestone-done]').forEach(x => x.onchange = () => {window.setMilestoneDone(x.dataset.milestoneDone, x.checked); shell();});
    document.querySelectorAll('[data-milestone-edit]').forEach(x => x.onclick = () => editMilestone(x.dataset.milestoneEdit));
    document.getElementById('add-milestone')?.addEventListener('click', () => editMilestone());
  };
})();
