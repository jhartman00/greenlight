import { sampleSchedulingProject, sampleBudgetProject } from '../utils/sampleData';

// ── Scheduling sample data ─────────────────────────────────────────────────────

describe('sampleSchedulingProject', () => {
  it('has the required top-level fields', () => {
    expect(sampleSchedulingProject.id).toBeTruthy();
    expect(sampleSchedulingProject.name).toBeTruthy();
    expect(typeof sampleSchedulingProject.createdAt).toBe('string');
    expect(typeof sampleSchedulingProject.updatedAt).toBe('string');
  });

  it('has at least 20 breakdowns', () => {
    expect(sampleSchedulingProject.breakdowns.length).toBeGreaterThanOrEqual(20);
  });

  it('has elements', () => {
    expect(sampleSchedulingProject.elements.length).toBeGreaterThan(0);
  });

  it('all element ids referenced in breakdowns exist in elements array', () => {
    const elementIds = new Set(sampleSchedulingProject.elements.map(e => e.id));
    for (const bd of sampleSchedulingProject.breakdowns) {
      for (const elemId of bd.elements) {
        expect(elementIds.has(elemId)).toBe(true);
      }
    }
  });

  it('all breakdown ids referenced in stripBoard exist in breakdowns', () => {
    const breakdownIds = new Set(sampleSchedulingProject.breakdowns.map(b => b.id));
    for (const item of sampleSchedulingProject.stripBoard) {
      if (item.type === 'scene') {
        expect(breakdownIds.has(item.breakdownId)).toBe(true);
      }
    }
  });

  it('all breakdowns appear in the strip board', () => {
    const boardBreakdownIds = new Set(
      sampleSchedulingProject.stripBoard
        .filter(item => item.type === 'scene')
        .map(item => (item as { type: 'scene'; id: string; breakdownId: string }).breakdownId)
    );
    for (const bd of sampleSchedulingProject.breakdowns) {
      expect(boardBreakdownIds.has(bd.id)).toBe(true);
    }
  });

  it('each breakdown has a valid intExt', () => {
    const validIntExt = ['INT', 'EXT', 'INT/EXT'];
    for (const bd of sampleSchedulingProject.breakdowns) {
      expect(validIntExt).toContain(bd.intExt);
    }
  });

  it('each breakdown has a valid dayNight', () => {
    const validDayNight = ['DAY', 'NIGHT', 'DAWN', 'DUSK'];
    for (const bd of sampleSchedulingProject.breakdowns) {
      expect(validDayNight).toContain(bd.dayNight);
    }
  });

  it('each breakdown has a non-empty sceneNumber', () => {
    for (const bd of sampleSchedulingProject.breakdowns) {
      expect(bd.sceneNumber).toBeTruthy();
    }
  });

  it('strip board has day break items', () => {
    const dayBreaks = sampleSchedulingProject.stripBoard.filter(item => item.type === 'dayBreak');
    expect(dayBreaks.length).toBeGreaterThan(0);
  });

  it('all strip board items have an id', () => {
    for (const item of sampleSchedulingProject.stripBoard) {
      expect(item.id).toBeTruthy();
    }
  });

  it('strip board ids are unique', () => {
    const ids = sampleSchedulingProject.stripBoard.map(item => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('element ids are unique', () => {
    const ids = sampleSchedulingProject.elements.map(e => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('breakdown ids are unique', () => {
    const ids = sampleSchedulingProject.breakdowns.map(b => b.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all elements have a valid category', () => {
    const validCategories = [
      'Cast', 'Extras', 'Stunts', 'Vehicles', 'Props',
      'Wardrobe', 'Makeup/Hair', 'Livestock/Animals',
      'Sound Effects/Music', 'Special Effects', 'Special Equipment',
      'Art Department', 'Set Dressing', 'Greenery',
      'Visual Effects', 'Mechanical Effects', 'Miscellaneous',
      'Notes', 'Security',
    ];
    for (const elem of sampleSchedulingProject.elements) {
      expect(validCategories).toContain(elem.category);
    }
  });

  it('has extra groups', () => {
    expect(sampleSchedulingProject.extraGroups).toBeDefined();
    expect(sampleSchedulingProject.extraGroups!.length).toBeGreaterThan(0);
  });

  it('has costumes', () => {
    expect(sampleSchedulingProject.costumes).toBeDefined();
    expect(sampleSchedulingProject.costumes!.length).toBeGreaterThan(0);
  });

  it('has revisions', () => {
    expect(sampleSchedulingProject.revisions).toBeDefined();
    expect(sampleSchedulingProject.revisions!.length).toBeGreaterThan(0);
  });

  it('has sets', () => {
    expect(sampleSchedulingProject.sets).toBeDefined();
    expect(sampleSchedulingProject.sets!.length).toBeGreaterThan(0);
  });
});

// ── Budgeting sample data ──────────────────────────────────────────────────────

describe('sampleBudgetProject', () => {
  it('has the required top-level fields', () => {
    expect(sampleBudgetProject.id).toBeTruthy();
    expect(sampleBudgetProject.name).toBeTruthy();
    expect(typeof sampleBudgetProject.createdAt).toBe('string');
    expect(typeof sampleBudgetProject.updatedAt).toBe('string');
  });

  it('has account groups', () => {
    expect(sampleBudgetProject.accountGroups.length).toBeGreaterThan(0);
  });

  it('every account group has accounts', () => {
    for (const group of sampleBudgetProject.accountGroups) {
      expect(group.accounts.length).toBeGreaterThan(0);
    }
  });

  it('every account has at least one line item', () => {
    for (const group of sampleBudgetProject.accountGroups) {
      for (const acct of group.accounts) {
        expect(acct.lineItems.length).toBeGreaterThan(0);
      }
    }
  });

  it('all account ids are unique', () => {
    const ids: string[] = [];
    for (const group of sampleBudgetProject.accountGroups) {
      for (const acct of group.accounts) {
        ids.push(acct.id);
      }
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all line item ids are unique within their account', () => {
    for (const group of sampleBudgetProject.accountGroups) {
      for (const acct of group.accounts) {
        const ids = acct.lineItems.map(li => li.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  });

  it('has fringes', () => {
    expect(sampleBudgetProject.fringes.length).toBeGreaterThan(0);
  });

  it('has valid globals with required fields', () => {
    const g = sampleBudgetProject.globals;
    expect(typeof g.currency).toBe('string');
    expect(typeof g.currencySymbol).toBe('string');
    expect(typeof g.prepWeeks).toBe('number');
    expect(typeof g.shootWeeks).toBe('number');
    expect(typeof g.contingencyPercent).toBe('number');
  });

  it('each fringe has valid type', () => {
    for (const fringe of sampleBudgetProject.fringes) {
      expect(['percentage', 'flat']).toContain(fringe.type);
    }
  });

  it('all fringe ids are unique', () => {
    const ids = sampleBudgetProject.fringes.map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all account group ids are unique', () => {
    const ids = sampleBudgetProject.accountGroups.map(g => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('line items have valid numeric fields', () => {
    for (const group of sampleBudgetProject.accountGroups) {
      for (const acct of group.accounts) {
        for (const li of acct.lineItems) {
          expect(typeof li.units).toBe('number');
          expect(typeof li.rate).toBe('number');
          expect(typeof li.quantity).toBe('number');
          expect(li.units).toBeGreaterThanOrEqual(0);
          expect(li.rate).toBeGreaterThanOrEqual(0);
          expect(li.quantity).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
