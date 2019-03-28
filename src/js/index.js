'use strict';
let uid = 0;
class Dep {
  constructor() {
    this.id = uid++;
    this.subs = [];
    this.target = null;
  }
  addSub(sub) {
    this.subs.push(sub);
  }
  notify() {
    this.subs.forEach(sub => sub.update());
  }
}
class observer {
  constructor(value) {
    this.value = value;
    Object.keys(value).forEach(key => defineReactive(this.value, key, value[key]));
    console.log(this.value);
  }
}

function observe(value) {
  if (!value || typeof value !== 'object') {
    return;
  }
  return new observer(value);
}

function defineReactive(obj, key, val) {
  const dep = new Dep();
  observe(val);
  Object.defineProperty(obj, key, {
    get: () => {
      if (Dep.target) {
        Dep.target.addDep(dep);
      }
      return val;
    },
    set: newVal => {
      if (val === newVal) return;
      val = newVal;
      console.log(val);
      observe(newVal);
      dep.notify();
    },
  });
}
class watcher {
  constructor(vm, data) {
    this.depIds = {};
    this.vm = vm;
    this.data = data;
    this.val = this.get();
  }
  addDep(dep) {
    if (!this.depIds.hasOwnProperty(dep.id)) {
      dep.addSub(this);
      this.depIds[dep.id] = dep;
    }
  }
  update() {
    const val = this.get();
    if (val !== this.val) {
      this.val = val;

    }
  }
  get() {
    Dep.target = this;
    const val = this.vm.$options.data[this.data];
    Dep.target = null;
    return val;
  }
}
const reg = /^\{{2}\S+\}{2}/;
class Vue {
  constructor(options = {}) {
    this.$options = options;
    const data = this.$options.data;
    const root = document.querySelector(this.$options.root);
    const node = createNode(root, reg);
    observe(data);
    compile(data, node);
    Object.keys(data).forEach(key => {
      this._proxy(key);
      this.$Watch(key);
      console.log(data, node);
      compile(data, node);

    });

  }
  $Watch(data) {
    new watcher(this, data);
  }
  _proxy(key) {
    Object.defineProperty(this, key, {
      get: () => this.$options.data[key],
      set: val => {
        this.$options.data[key] = val;
      },
    });
  }
}
// 需要把dom 上的节点拿到并且生成
class dom {
  constructor(data, node) {
    this.data = data;
    this.node = node;
    this.getNode(data, node);
  }
  getNode(data, node) {
    Object.keys(node).forEach(key => {
      let str = node[key].innerHTML.substr(2);
      str = str.substr(0, str.length - 2);
      for (const prop in data) {
        if (str === prop) {
          node[key].innerHTML = data[prop];
        }
      }
    });
  }
}

function compile(data, node) {
  return new dom(data, node);
}
function createNode(root, reg) {

  const nodeIterator = document.createNodeIterator(
    root,
    NodeFilter.SHOW_ELEMENT,
    function(node) {
      if (!node.children[0] && reg.test(node.textContent)) {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_REJECT;
    }
  );
  const pars = [];
  let currentNode;
  while ((currentNode = nodeIterator.nextNode())) {
    pars.push(currentNode);
  }
  return pars;
}
// const root = document.querySelector('#app');


// const p = document.getElementById('p');
// const input = document.getElementById('input');
// const hello = document.getElementById('test');
// input.addEventListener('keyup', function(e) {
//   demo1.text = e.target.value;
// });
// demo1.$Watch('text', str => (p.innerHTML = str));
// document.addEventListener('DOMContentLoaded', function() {
//   demo2.$Watch('text', str => (hello.innerHTML = str));
//   setTimeout(() => {
//     demo2.$options.data.text = 'it\'s changed...';
//   }, 3000);
// }, false);
document.addEventListener('DOMContentLoaded', function() {
  const opt = { root: '#app', data: { name: '检索中...', age: 30 } };
  const vm = new Vue(opt);
  // opt.data.name = 'dsdssd';
  setTimeout(() => {
    opt.data.name = '王永峰';
    opt.data.age = 89;
    // console.log(opt.data.name);
  }, 2000);
}, false);
