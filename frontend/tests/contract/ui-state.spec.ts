/// <reference types="jasmine" />
/**
 * T007 Contract test: UI state service persistence (filter & panel)
 * Expected capabilities (to be satisfied by ui-state.service.ts later):
 *  - setFilter(value: 'all'|'active'|'completed') persists across reload (simulated)
 *  - getFilter$ observable emits current filter
 *  - toggleDeletedPanel(open?: boolean) persists open/closed state
 *  - state restoration after pseudo reload restores last values
 */

describe('T007 UI State Service contract (filter + deleted panel)', () => {
  it('persists selected filter across reload simulation', () => {
    fail('T007 RED: filter persistence not implemented');
  });

  it('persists deleted panel open state across reload simulation', () => {
    fail('T007 RED: deleted panel state persistence not implemented');
  });
});
