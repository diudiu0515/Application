(function () {
  const E = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const yes = value => value === true || value === 'true';
  const activeApplications = () => state.applications.filter(x => !['Rejected', 'Withdrawn'].includes(x.status));
  window.recommendationCoverage = function (applicationId) {
    const rows = state.recommendations.filter(x => x.applicationId === applicationId && state.recommenders.some(r => r.id === x.recommenderId));
    return {
      planned: new Set(rows.map(x => x.recommenderId)).size,
      submitted: new Set(rows.filter(x => yes(x.submitted)).map(x => x.recommenderId)).size
    };
  };
  window.planRecommendation = function (applicationId, recommenderId) {
    if (!state.applications.some(x => x.id === applicationId) || !state.recommenders.some(x => x.id === recommenderId)) return;
    if (state.recommendations.some(x => x.applicationId === applicationId && x.recommenderId === recommenderId)) return;
    state.recommendations.push({id: uid('req'), applicationId, recommenderId, requested: false, submitted: false,
      requestDate: '', deadline: '', thankYouSent: false, materialsSent: '', notes: 'Planned locally; confirm this school’s letter deadline before entering it.'});
    persist('Recommendation planned', program(state.applications.find(x => x.id === applicationId).programId)?.school, 'No invitation sent');
  };
  const previousView = window.extendedViews.recommendations;
  window.extendedViews.recommendations = function () {
    const apps = activeApplications(), refs = state.recommenders;
    const matrix = `<section class="panel recommendation-matrix"><div class="panel-head"><h2>逐校推荐信覆盖</h2><span>学校 × 推荐人</span></div><div class="panel-body"><p class="subtext">点击空格安排一位推荐人，点击已有记录编辑邀请、材料、截止日期与提交状态。这里的“安排”只创建本地记录。每校所需数量须单独核实。</p></div><div class="table-wrap"><table class="data-table"><thead><tr><th>学校 / 项目</th><th>所需封数</th><th>已提交 / 已安排</th>${refs.map(r => `<th>${E(r.name)}</th>`).join('')}</tr></thead><tbody>${apps.map(a => {
      const p = program(a.programId), coverage = window.recommendationCoverage(a.id);
      return `<tr><td><strong>${E(p?.school)}</strong><div class="subtext">${E(p?.program)}</div></td><td><input class="letter-count" aria-label="${E(p?.school)} 所需推荐信封数" type="number" min="1" max="10" step="1" placeholder="待核实" value="${E(a.requiredLetters || '')}" data-letter-count="${E(a.id)}"></td><td>${coverage.submitted} / ${coverage.planned}<div class="subtext">${a.requiredLetters ? `还差 ${Math.max(0, Number(a.requiredLetters) - coverage.submitted)} 封提交` : '先核实学校要求'}</div></td>${refs.map(r => {
        const requests = state.recommendations.filter(x => x.applicationId === a.id && x.recommenderId === r.id);
        if (!requests.length) return `<td><button class="btn subtle" data-plan-letter="${E(a.id)}:${E(r.id)}">+ 安排</button></td>`;
        return `<td>${requests.map(req => {
          const done = yes(req.submitted), overdue = !done && req.deadline && daysTo(req.deadline) < 0;
          return `<button class="btn ${overdue ? 'letter-overdue' : 'subtle'}" data-ext-edit="recommendations:${E(req.id)}">${done ? '✓ 已提交' : overdue ? '逾期未提交' : yes(req.requested) ? '已邀请' : '待邀请'}</button><div class="subtext">${req.deadline ? fmt(req.deadline) : '截止日期待核实'} · ${req.materialsSent ? '材料已记录' : '材料待准备'}</div>`;
        }).join('')}</td>`;
      }).join('')}</tr>`;
    }).join('') || `<tr><td colspan="${refs.length + 3}"><div class="empty">先在 Application Tracker 创建申请，再安排推荐信。</div></td></tr>`}</tbody></table></div></section>`;
    return previousView() + matrix;
  };
  const previousBind = window.extendedBind;
  window.extendedBind = function () {
    previousBind?.();
    document.querySelectorAll('[data-plan-letter]').forEach(x => x.onclick = () => {window.planRecommendation(...x.dataset.planLetter.split(':')); shell();});
    document.querySelectorAll('[data-letter-count]').forEach(x => x.onchange = () => {
      const count = x.value === '' ? '' : Number(x.value);
      if (count !== '' && (!Number.isInteger(count) || count < 1 || count > 10)) {toast('请输入 1–10 的整数，或留空待核实'); return;}
      const app = state.applications.find(a => a.id === x.dataset.letterCount);
      app.requiredLetters = count;
      persist('Required letters updated', program(app.programId)?.school, String(count || 'Unknown'));
      shell();
    });
  };
})();
