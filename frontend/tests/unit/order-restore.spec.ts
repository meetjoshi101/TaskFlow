/// <reference types="jasmine" />
/**
 * T009 Unit test: Ordering & restore insertion logic
 * Expected ordering helpers (to be added in order.utils.ts):
 *  - assignInitialOrder(existing: Task[]) => number (monotonic increasing)
 *  - computeRestoreOrder(active: Task[], deleted: Task) => number (appends at end or uses preserved order)
 *  - sortTasks(tasks: Task[]) => returns tasks sorted by order asc
 */

describe('T009 Ordering + restore helpers', () => {
  it('assigns increasing order values', () => {
    fail('T009 RED: assignInitialOrder not implemented');
  });
  it('computeRestoreOrder appends when original slot taken', () => {
    fail('T009 RED: computeRestoreOrder not implemented');
  });
  it('sortTasks sorts ascending by order', () => {
    fail('T009 RED: sortTasks not implemented');
  });
});
