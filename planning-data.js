/* Migrate only unchanged starter values; never replace user-authored records. */
(function () {
  const copy = value => JSON.parse(JSON.stringify(value));
  const seed = window.SEED_DATA;
  const before = copy(seed);
  Object.assign(seed.projects.find(x => x.id === 'p1'), {
    name: 'SocialFlux', short: 'SocialFlux',
    method: 'Online interaction rollouts, longitudinal state tracking and controlled counterfactual comparisons; paired text/video where justified.',
    contribution: 'Benchmark design and development. Record exact owned components and evidence before using in applications.'
  });
  // These are planning records, not claims of authorship or submission dates.
  Object.assign(seed.publications.find(x => x.id === 'pub1'), {title: 'SocialFlux', authorOrder: '', submissionDeadline: ''});
  Object.assign(seed.publications.find(x => x.id === 'pub2'), {authorOrder: '', submissionDeadline: ''});
  seed.sopDocuments[0].projectsUsed = 'SocialFlux, LIMO4SI';
  seed.cvItems.find(x => x.id === 'cv2').title = 'SocialFlux';
  Object.assign(seed.tests.find(x => x.id === 'test1'), {
    type: 'IELTS', targetScore: 8,
    notes: 'Academic preparation; considering 2026-10-05 or 2026-10-06, registration not confirmed. Verify each program’s accepted tests and section requirements.'
  });
  const phases = [
    ['foundation', '2026.09–10 · 科研与语言', [
      ['2026-10-06', '完成雅思首轮备考并确认考试安排', '目标 8；10 月 5/6 日是意向，报名后在 Tests 填正式日期。', 'tests'],
      ['2026-10-31', '整理两条研究主线的贡献与产出', 'SocialFlux 与视频/具身项目各写一页：问题、本人负责部分、结果、代码或报告。作者顺序按实际确认记录。', 'research'],
      ['2026-10-31', '建立暑研导师第一批候选名单', '从多模态、具身、视频时空推理出发，记录近期论文、匹配项目、公开学生主页与可咨询的清华校友。', 'faculty']
    ]],
    ['outreach', '2026.11–2027.01 · 暑研联系', [
      ['2026-11-15', '准备可发送的研究材料包', 'Academic CV、一页研究概述、代表性代码或实验图、5 分钟项目介绍。', 'cv'],
      ['2026-12-15', '逐位完成论文阅读与暑研联系草稿', '写清对方的具体工作、自己的相关贡献和可以开展的小问题；跟踪回复与下一次跟进。', 'contact_workspace'],
      ['2027-01-31', '争取提前开始远程合作', '与导师讨论可行的远程启动时间、每周投入、指导人和第一阶段交付；未约定前保持待确认。', 'summer']
    ]],
    ['prepare', '2027.02–05 · 落实暑研', [
      ['2027-03-31', '确认暑研资格、经费与指导安排', '逐项记录国际本科生资格、工资/补助、住宿、签证支持、到访时间、直接 mentor 和 PI 会面频率。', 'summer'],
      ['2027-05-15', '冻结暑研前可展示的研究版本', '保存实验结果、贡献说明和项目链接；准备能够独立讲清的问题与下一步实验。', 'publications']
    ]],
    ['summer', '2027.06–08 · 暑研与推荐信', [
      ['2027-07-15', '进行暑研中期反馈', '明确已完成的独立贡献、待解决问题和后半程目标；让推荐人有具体工作可评价。', 'research'],
      ['2027-08-31', '确认推荐信意愿并整理证据包', '区分愿意推荐与实际提交；记录合作项目、独立贡献、报告和对方明确反馈。', 'recommendations']
    ]],
    ['apply', '2027.09–12 · 正式申请', [
      ['2027-09-30', '确定项目与导师组合', '逐校核对 2028 Fall 官网要求、导师招收情况和全奖安排；每校尽量找到多位实际匹配导师。', 'shortlist'],
      ['2027-10-31', '完成主版文书和逐校材料表', 'CV、SOP、成绩单、语言要求；每校单独记录推荐信数量、截止日期与时区。', 'sop'],
      ['2027-11-15', '核对推荐信邀请与送分状态', '按学校查看每位推荐人的提交状态，确认 portal 邀请已发、材料已给齐。', 'recommendations'],
      ['2027-11-30', '完成首批申请的提交前检查', '这是内部缓冲目标。按各校真实截止时间提交，不能将 12 月统一当成同一天截止。', 'applications']
    ]],
    ['decide', '2028.01–04 · 面试与选择', [
      ['2028-02-01', '准备研究面试与导师问题', '练习 2/5/15 分钟项目讲解，讨论失败实验、本人贡献、未来问题与组内指导。', 'interviews'],
      ['2028-04-01', '比较书面 offer 与全奖条款', '核对学费、stipend、医保、暑期支持、保障年限和续资条件；实际回复日期以 offer 为准。', 'offers']
    ]]
  ];
  seed.milestones = phases.flatMap(([phase, phaseTitle, items]) => items.map(([due, title, notes, view], i) => ({
    id: `plan-${phase}-${i}`, phase, phaseTitle, due, title, notes, view, done: false, completedAt: ''
  })));
  window.migratePlanning = function (saved) {
    if (!Array.isArray(saved.milestones)) saved.milestones = copy(seed.milestones);
    if (saved.meta.planningVersion) return saved;
    for (const key of ['projects', 'publications', 'sopDocuments', 'cvItems', 'tests']) {
      for (const old of before[key]) {
        const row = (saved[key] || []).find(x => x.id === old.id);
        const updated = seed[key].find(x => x.id === old.id);
        if (!row || !updated || row.updatedAt || row.userOverride) continue;
        if (key === 'projects' && row.updated !== old.updated) continue;
        // A changed record may carry meaningful context even in an unchanged field.
        if (Object.keys(old).some(k => JSON.stringify(row[k]) !== JSON.stringify(old[k]))) continue;
        for (const k of Object.keys(updated)) {
          if (JSON.stringify(old[k]) !== JSON.stringify(updated[k])) row[k] = copy(updated[k]);
        }
      }
    }
    saved.meta.planningVersion = 1;
    return saved;
  };
})();
