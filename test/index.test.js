const expect = require('expect');
const path = require('path');
const nock = require('nock');
const request = require('supertest');
const http = require('http');
const Mock = require('./utils/mock');
const app = require('../app');
const Vue = require('vue/dist/vue.js');
// const { mount } = require('@vue/test-utils');
const { shallowMount, createLocalVue, createWrapper } = require("@vue/test-utils");

const pug = require('pug');
const $ = require('jquery');
const fs = require('fs');
require('jsdom-global')();
const nockBack = nock.back;
nockBack.fixtures = path.join(__dirname, '.', '__nock-fixtures__');

const initData = {
  avatar:null,
  hov:"",
  info:null,
  interval:3,
  missingAvatar:false,
  thinking:false,
  thought:"",
  timeout:"",
  testing:true
}
const component = pug.renderFile(path.join(__dirname, '../views/main.pug'), initData);
console.log(component)
// (fs.readFileSync(path.join(__dirname, '../views/main.pug'), 'utf-8'), {
//   filename: path.join(__dirname, '../views/main.pug'),
//   pretty:   true
// })
//require('../views/main.pug')
//pug.renderFile(path.join(__dirname, '../views/main.pug'), initData);
// const localVue = createLocalVue();
// localVue.use($);

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

  // key = 'should get thought object';
  // test(key, async(done) => {
  //   const { nockDone } = await nockBack(
  //     'dh.thought.json'
  //   );
  //   nock.enableNetConnect(/(pdqweb\.azurewebsites\.net)/);
  //   nock.enableNetConnect('127.0.0.1');
  //   const api = (
  //     !recording ? 
  //     await new Mock(key).data.thought : 
  //     await
  //       agent
  //       .post('/thought')
  //       .then((doc) => doc).catch((err) => console.log(err))
  //   );
  //   expect(api).toMatchSnapshot();
  //   nockDone();
  //   if (api) gp = JSON.parse(api.text);
  //   if (!recording) {
  //     expect(api)
  //     .toHaveBeenCalled();
  //   }
  //   done();
  // }, 5000)
  // key = 'should get employee avatar';
  // test(key, async(done) => {
  //   const { nockDone } = await nockBack(
  //     'dh.avatar.json'
  //   );
  //   nock.enableNetConnect(/(pdqweb\.azurewebsites\.net)/);
  //   nock.enableNetConnect('127.0.0.1');
  //   const api = (
  //     !recording ? 
  //     await new Mock(key).data.thought : 
  //     await 
  //       agent
  //       .post(`/employee/${gp.thought.name}`)
  //       .then((doc) => doc).catch((err) => console.log(err))
  //   );
  //   expect(api).toMatchSnapshot();
  //   nockDone();
  //   if (!recording) {
  //     expect(api)
  //     .toHaveBeenCalled();
  //   }
  //   done()
  // }, 5000);
  
  // vue component
  key = 'component should mount';
  test(key, async() => {
    const { nockDone } = await nockBack(
      'dh.vue.json'
    );
    // const localVue = createLocalVue();
    // const comp = {
    //   template: component
    // };
    // 
    // // note this fails with an error
    // // "TypeError: Cannot read property 'props' of undefined"
    // 
    // const vm = shallowMount(component)
    // , {
    //   data: function data() { return initData }, 
    //   $: $
    // })
    // const comp = Vue.extend(component);
    // const vm = new Vue({
    //   data: initData,
    //   $: $
    // })//mount(component);
    const wrapper = shallowMount(component, {
          data: initData
        })
// const Constructor = Vue.extend(component)
// const vm = new Constructor().$mount()
// const wrapper = createWrapper(vm)
    console.log(wrapper.vm.$el.querySelector('.loltxt').textContent)
    expect(wrapper.vm.$el.querySelector('.loltxt').textContent)
      .toMatchSnapshot();//toEqual('Welcome to Your Vue.js App');
    nockDone()
  })
  
});
