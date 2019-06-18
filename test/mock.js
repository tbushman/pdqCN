import path from 'path';
import fs from 'fs';

// const mockSnapshotsExist = fs.existsSync(
//   path.join('..', '__snapshots__', 'index.test.js.snap'));
// // let mockSnapshots;
// if (mockSnapshotsExist) {
  import mockSnapshots from '../__snapshots__/index.test.js.snap';
// }
class Mock {
  constructor(key) {
    this.key = key;
    this.thought: jest.fn(() => {
      Promise.resolve({
        data: (!mockSnapshots ? [] mockSnapshots[key])
      })
    })
  }
}
export default Mock;
/* eslint-enable camelcase */
/* eslint-enable no-undef */
