import expect from 'expect';
import path from 'path';
import nock from 'nock';
import $ from 'jquery';
import Mock = from './fixtures/mock.js';

const nockBack = nock.back;
nockBack.fixtures = path.join('.', '__nock-fixtures__');

const recording = process.env.RECORD_ENV;

nockBack.setMode('record');

describe('API call', async () => {
  let key;
  // eslint-disable-next-line no-undef
  beforeAll(async() => {
  });
  beforeEach(async() => {
    nockBack.setMode('record');
  });
  afterEach(async() => {
    // this ensures that consecutive tests don't use the snapshot created
    // by a previous test
    nockBack.setMode('wild');
    nock.cleanAll();
  });

  key = 'should get thought object';
  test(key, async() => {
    const { nockDone } = await nockBack(
      'dh.thought.json'
    );
    nock.enableNetConnect(/(pdqweb\.azurewebsites\.net)/);
    const api = (
      !recording ? 
      await new Mock(key).thought : 
      await $.get('https://pdqweb.azurewebsites.net/api/brain').then((doc) => doc).catch((err) => console.log(err))
    );
    expect(api).toMatchSnapshot();
    nockDone();
    if (!recording) {
      expect(api)
      .toHaveBeenCalled();
    }
  }, 5000);
});

// // For more information about testing with Jest see:
// // https://facebook.github.io/jest/
