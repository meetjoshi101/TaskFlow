/// <reference types="jasmine" />
/**
 * T006 Contract test: persistence service create/list/update/delete soft delete flow
 * Intentional failing test (red) before implementation.
 * Describes required contract for TasksRepository (to be implemented in Phase 3.3):
 *  - createTask(title) => returns Task with id, title (trimmed), completed=false, deleted=false
 *  - listActive() => excludes soft-deleted tasks
 *  - updateTask(id, patch)
 *  - softDelete(id) => marks deleted but keeps retrievable via listDeleted()
 *  - restore(id) => moves back to active preserving original ordering insertion rules
 *  - purgeDeleted() => permanently removes from deleted set
 */

describe('T006 TasksRepository contract (soft delete lifecycle)', () => {
  it('creates, updates, soft-deletes, restores, and purges tasks', () => {
    fail('T006 RED: TasksRepository contract not implemented yet');
  });

  it('listActive excludes soft-deleted tasks', () => {
    fail('T006 RED: active listing behavior not implemented');
  });

  it('restore reinserts task respecting ordering helper semantics', () => {
    fail('T006 RED: ordering / restore behavior not implemented');
  });

  it('purgeDeleted permanently removes tasks', () => {
    fail('T006 RED: purge behavior not implemented');
  });
});
