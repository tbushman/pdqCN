const expect = require('expect');
const path = require('path');
const nock = require('nock');
const request = require('supertest');
const http = require('http');
const Mock = require('./utils/mock');
const app = require('../app');
//filteringPath(/(["]{0,1}date["]{0,1})[:][\s]{0,1}["](\w|\d|:|\s|,)*["]{0,1}/g, '$1: "blank"')
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

function beforeFunc(body, aRecordedBody) {
  const dateRx = /(["]{0,1}(date)["]{0,1})[:][\s]{0,1}["](\w|\d|:|\s|,)+["]{0,1}/g;
  if (typeof(body) !== 'string') {
    body = body + '';
  }
  const bodyResult = dateRx.exec(body);
  const recordedBodyResult = require('./__snapshots__/index.test.js.snap');
  const keys = Object.keys(recordedBodyResult);
  if (recordedBodyResult && keys.length) {
    keys.forEach((a,b) => {
      console.log(b, aRecordedBody)
      if (b === aRecordedBody) {
        const dateInRecord = dateRx.test(recordedBodyResult[a])
        if (!dateInRecord || !bodyResult) {
          
        } else {
          const recordedTimestamp = dateRx.exec(recordedBodyResult[a])//recordedBodyResult[a].split(dateRx);
          console.log(recordedTimestamp)
          bodyResult.forEach((c,d) => {
            if (b === d) {
              body.replace(
                c, recordedTimestamp
                // dateRx,
                // (match, key, value) => `${recordedTimestamp}`
              )
            }
          })
        }
      }
    })
    return JSON.parse(body);
    
  } else {
    return body
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
    await nockBack(
      'dh.thought.json', {
        // filteringScope: (scope) => /^http(?!<=s):\/\/((localhost)|(127.0.0.1))[:][0-9]*/g.test(scope), 
        before: beforeFunc
      }
    // ).then(
    , async (nockDone) => {
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
      // console.log(api)
      if (!recording) {
        expect(api)
        .toHaveBeenCalled();
      }
      done();
    })
  }, 10000)
  key = 'should get employee avatar';
  test(key, async(done) => {
    await nockBack(
      'dh.avatar.json', {
        // filteringScope: (scope) => /^http(?!<=s):\/\/((localhost)|(127.0.0.1))[:][0-9]*/g.test(scope), 
        before: beforeFunc 
      }
    // ).then(
    , async (nockDone) => {
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
    })
    // .catch((err) => console.log(err))
    // const { nockDone } = await nockBack(
    //   'dh.avatar.json'
    //   // , { 
    //     // filteringScope: (scope) => /^http(?!<=s):\/\/((localhost)|(127.0.0.1))[:][0-9]*/g.test(scope), 
    //     // before: beforeFunc 
    //   // }
    // )
    // .filteringRequestBody(beforeFunc);
    
  }, 8000);
  
  
});
