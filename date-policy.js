/* Date meaning is explicit; elapsed time alone never makes a record historical. */
(function () {
  const labels = {
    official: 'Official deadline', historical: 'Historical cycle date',
    internal: 'Internal planning target', user: 'User task / date',
    unverified: 'Date needs confirmation'
  };
  const done = value => value === true || value === 'true';
  function summerKind(row) {
    if (Object.prototype.hasOwnProperty.call(labels, row.dateKind)) return row.dateKind;
    const seed = window.SEED_DATA.summerResearch.find(x => x.id === row.id);
    // Match date provenance, not just an ID. Edited dates/cycles remain user-owned.
    if (seed && ['school', 'program', 'deadline', 'cycle'].every(k => row[k] === seed[k])) return seed.dateKind || 'user';
    return 'user';
  }
  const isActionable = event => event.dateKind !== 'historical' && event.actionable !== false && !done(event.done);
  window.datePolicy = {labels, done, summerKind, isActionable};

  // Frozen legacy fingerprints, independent of today's (empty) task defaults.
  const legacyTasks = [
    {id:'t1',title:'Review 3 recent papers from Morency lab',due:'2026-08-27',type:'Paper',done:false},
    {id:'t2',title:'Verify CMU faculty recruiting status',due:'2026-09-02',type:'Faculty',done:false},
    {id:'t3',title:'Draft candidate research narrative',due:'2026-09-08',type:'SOP',done:false},
    {id:'t4',title:'Export monthly backup',due:'2026-09-20',type:'Data',done:false}
  ];
  window.migrateDates = function (saved) {
    saved.meta = saved.meta || {};
    for (const row of saved.summerResearch || []) {
      if (!row.dateKind) row.dateKind = summerKind(row);
    }
    if ((saved.meta.datePolicyVersion || 0) < 1) {
      saved.tasks = (saved.tasks || []).filter(row => {
        const original = legacyTasks.find(x => x.id === row.id);
        if (!original || Object.keys(row).length !== Object.keys(original).length) return true;
        if (Object.keys(original).some(k => row[k] !== original[k])) return true;
        // A completed-then-reopened task can look identical to the original seed.
        return (saved.history || []).some(h => /task/i.test(h.action || '') &&
          [row.id, row.title].includes(h.entity));
      });
      saved.meta.datePolicyVersion = 1;
    }
    return saved;
  };
})();
