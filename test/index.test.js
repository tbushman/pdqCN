const expect = require('expect');
const path = require('path');
const nock = require('nock');
const request = require('supertest');
const http = require('http');
const Mock = require('./utils/mock');
const app = require('../app');

const nockBack = nock.back;
nockBack.fixtures = path.join(__dirname, '.', '__nock-fixtures__');

function okay(res) {
  if (res.ok) {
    console.log(res)
    return res;
  } else {
    return null;
  }
}

const recording = process.env.RECORD_ENV;
const testing = process.env.TEST_ENV;
console.log(recording)
nockBack.setMode('record');

describe('API call', () => {
  let key, gp, agent;
  // eslint-disable-next-line no-undef
  beforeAll(async(done) => {
    nock.enableNetConnect('127.0.0.1');
    await app.listen(4000, () => {
      console.log('connected');
      agent = request.agent(app)
      done()
    })
  }, 5000);
  beforeEach(async() => {
    nockBack.setMode('record');
  });
  afterEach(async() => {
    // this ensures that consecutive tests don't use the snapshot created
    // by a previous test
    nockBack.setMode('wild');
    nock.cleanAll();
  });
  afterAll((done) => {
    console.log('disconnecting');
    app.close(); 
    setImmediate(done);
  });

  key = 'should get thought object';
  test(key, async(done) => {
    const { nockDone } = await nockBack(
      'dh.thought.json'
    );
    nock.enableNetConnect(/(pdqweb\.azurewebsites\.net)/);
    nock.enableNetConnect('127.0.0.1');
    const api = (
      !recording ? 
      await new Mock(key).data.thought : 
      await
        agent
        .post('/thought')
        .then((doc) => doc).catch((err) => console.log(err))
    );
    expect(api).toMatchSnapshot();
    nockDone();
    if (api) gp = JSON.parse(api.text);
    if (!recording) {
      expect(api)
      .toHaveBeenCalled();
    }
    done();
  }, 5000)
  key = 'should get employee avatar';
  test(key, async(done) => {
    const { nockDone } = await nockBack(
      'dh.avatar.json'
    );
    nock.enableNetConnect(/(pdqweb\.azurewebsites\.net)/);
    nock.enableNetConnect('127.0.0.1');
    const api = (
      !recording ? 
      await new Mock(key).data.thought : 
      await 
        agent
        .post(`/employee/${gp.thought.name}`)
        .then((doc) => doc).catch((err) => console.log(err))
    );
    expect(api).toMatchSnapshot();
    nockDone();
    if (!recording) {
      expect(api)
      .toHaveBeenCalled();
    }
    done()
  }, 5000);
  
  
});
