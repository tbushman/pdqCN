const expect = require('expect');
const path = require('path');
const nock = require('nock');
const request = require('supertest');
const http = require('http');
const Mock = require('./utils/mock');
const requireEsm = require('esm')(module);
const app = require('../app');
//request('http://localhost:4000');
// import app from '../app.mjs'
// const $ = require('jquery');

const nockBack = nock.back;
nockBack.fixtures = path.join(__dirname, '.', '__nock-fixtures__');

// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// import expect from 'expect';
// import path from 'path';
// import nock from 'nock';
// import $ from 'jquery';
// import Mock from './fixtures/mock.js';
// 
// const nockBack = nock.back;
// nockBack.fixtures = path.join('.', '__nock-fixtures__');
// async function getError(url) {
//   let e = null;
//   while (e === null) {
//     await fetch(url).then((doc) => {}).catch((err) => {
//       e = err;
//     })
//   }
//   console.log(e)
//   return e;
// }

function okay(res) {
  if (res.ok) {
    console.log(res)
    return res;
  } else {
    return null;
  }
}

const recording = process.env.RECORD_ENV;

nockBack.setMode('record');

describe('API call', () => {
  // const scope = nock('http://127.0.0.1:4000', {allowUnmocked: true})
  let key, gp, agent;
  // eslint-disable-next-line no-undef
  beforeAll(async() => {
    nock.enableNetConnect('127.0.0.1');
    app.listen(4000, () => {
      agent = request.agent(app)
    })
    // app = await http.createServer(requireEsm('../app.mjs'));
    // console.log(app.address)
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
  afterAll(async () => {
    await app.close();
  })

  key = 'should get thought object';
  test(key, async() => {
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
        // request(app) 
        // request('127.0.0.1:4000')
        // .persist()
        .post('/')
      // await fetch(`http://localhost:4000/`, {
      //   method: 'POST',
      //   mode: 'cors',
      //   // cache: 'no-cache',
      //   credentials: 'same-origin'
      // })
      .then((doc) => doc).catch((err) => console.log(err))
      //fetch('https://pdqweb.azurewebsites.net/api/brain').then((res) => okay(res)).catch((err) => console.log(err))
    );
    expect(api).toMatchSnapshot();
    nockDone();
    // console.log(api);
    if (api) gp = api;
    if (!recording) {
      expect(api)
      .toHaveBeenCalled();
    }
  }, 15000);
  if (gp) {
    key = 'should get employee avatar';
    test(key, async() => {
      const { nockDone } = await nockBack(
        'dh.avatar.json'
      );
      nock.enableNetConnect(/(pdqweb\.azurewebsites\.net)/);
      nock.enableNetConnect('127.0.0.1');
      const api = (
        !recording ? 
        await new Mock(key).data.thought : 
        await request('http://127.0.0.1:4000') 
        // request(app)
        .get(`/employee/${gp}`)
        // await fetch(`http://localhost:4000/employee/${gp}`, {
        //   method: 'POST',
        //   mode: 'cors',
        //   // cache: 'no-cache',
        //   credentials: 'same-origin'
        // })
        .then((doc) => doc).catch((err) => console.log(err))
      );
      expect(api).toMatchSnapshot();
      nockDone();
      if (!recording) {
        expect(api)
        .toHaveBeenCalled();
      }
    }, 10000)
  } else {
    // key = 'should return error';
    // test(key, async() => {
    //   const { nockDone } = await nockBack(
    //     'dh.thoughterror.json'
    //   );
    //   const api = (
    //     !recording ? 
    //     await new Mock(key).data.thought : 
    //     await getError('https://pdqweb.azurewebsites.net/api/brain')
    //   );
    //   expect(api).toMatchSnapshot();
    //   nockDone();
    //   if (!recording) {
    //     expect(api)
    //     .toHaveBeenCalled();
    //   }
    // }, 23000)
  }
});

// // For more information about testing with Jest see:
// // https://facebook.github.io/jest/
