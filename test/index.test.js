const expect = require('expect');
const path = require('path');
const nock = require('nock');
const request = require('supertest');
const http = require('http');
const Mock = require('./utils/mock');
const app = require('../app');
const fetch = require('node-fetch');
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

// function beforeFunc(body, index) {

// }

const afterFunc = (res) => {
  // console.log(res);
  const returnValue = res.map((scope) => {
    if (scope.rawHeaders.indexOf('Date') > -1) {
      scope.rawHeaders.splice(scope.rawHeaders.indexOf('Date'), 2);
    }
    return scope;
  })
  
  console.log(returnValue)
  return returnValue;
  // return responses.map((scope) => {
  //   scope.filteringRequestBody = (body, aRecordedBody) => {
  //     if (typeof(body) !== 'string' || typeof(aRecordedBody) !== 'string') {
  //       return body
  //     }
  //     console.log(body, aRecordedBody)
  //     const recordedBodyResult = /["]{0,1}date["]{0,1}[:]{0,1}[,]{0,1}[\s]{0,1}["]{0,1}((\w|\d|\:|\s|\,|\+|\")+(GMT))/.exec(aRecordedBody)
  //     if (recordedBodyResult && recordedBodyResult.length) {
  //       console.log(recordedBodyResult)
  //       const recordedTimestamp = recordedBodyResult[1]
  //       console.log(body.replace(
  //         /["]{0,1}date["]{0,1}[:]{0,1}[,]{0,1}[\s]{0,1}["]{0,1}((\w|\d|\:|\s|\,|\+|\")+(GMT))/g,
  //         (match, key, value) => `${key}:${recordedTimestamp}`
  //       ))
  //       return body.replace(
  //         /["]{0,1}date["]{0,1}[:]{0,1}[,]{0,1}[\s]{0,1}["]{0,1}((\w|\d|\:|\s|\,|\+|\")+(GMT))/g,
  //         (match, key, value) => `${key}:${recordedTimestamp}`
  //       )
  //     } else {
  //       return body
  //     }
  //   }
  //   return scope
  // })
  
  
  
  // console.log(body)
  // body.response = '';
  // body.rawHeaders = [];
  // return body;
  // const dateRx = /["]{0,1}date|expires["]{0,1}[:]{0,1}[,]{0,1}[\s]{0,1}["](\w|\d|:|\s|,|\+)+GMT["]{0,1}$/gi;
  // // console.log(body)
  // //if (typeof(body) !== 'string') {
  //   // body = body + ''//JSON.stringify(body) + '';
  // //}
  // const bodyDate = body.header.date;
  // const bodyUrl = body.req.url;
  // //dateRx.exec(body);
  // console.log(bodyDate, bodyUrl);
  // if (recordedBodies && recordedBodies.length) {
  //   await recordedBodies.forEach((a,b) => {
  //     if (b === index) {
  //       const dateInRecord = dateRx.test(a)
  //       if (!dateInRecord || !bodyResult) {
  // 
  //       } else {
  //         const recordedTimestamp = dateRx.exec(JSON.stringify(a) + '')//recordedBodyResult[a].split(dateRx);
  //         // bodyResult.forEach((c,d) => {
  //           body.replace(
  //             dateRx, recordedTimestamp
  //           )
  //         // })
  //       }
  //     }
  //   })
  //   return body;
  // 
  // } else {
  //   return body
  // }
}

const beforeFunc = (res) => {
  console.log(res)
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
    await app.listen(80, () => {
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
        afterRecord: afterFunc,
        recorder: {
          enable_reqheaders_recording: false,
          output_objects: true
        }
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
          .then((doc) => doc).catch((err) => err)
      );
      if (!recording) {
        var snapshot = require('./__snapshots__/index.test.js.snap')[key]
        console.log(snapshot)
        snapshot.header.date = expect.any(Date);
        snapshot.req.url = expect.any(String)
        console.log(snapshot)
        expect(api).toMatchSnapshot(snapshot);
      } else {
        expect(api).toMatchSnapshot();
      }
      
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
        afterRecord: afterFunc,
        recorder: {
          enable_reqheaders_recording: false,
          output_objects: true
        }
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
          .then((doc) => doc).catch((err) => err)
      );
      if (!recording) {
        var snapshot = require('./__snapshots__/index.test.js.snap')[key]
        console.log(snapshot)
        snapshot.header.date = expect.any(Date);
        snapshot.req.url = expect.any(String)
        console.log(snapshot)
        expect(api).toMatchSnapshot(snapshot);
      } else {
        expect(api).toMatchSnapshot();
      }
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
