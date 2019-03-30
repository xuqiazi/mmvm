'use strict';

let uid = 0;

/**
 *
 *
 * @class Dep
 */
class Dep {
  constructor() {
    this.id = uid++;
    this.subs = [];
    this.target = null;
  }
  addSub(sub) {
    this.subs.push(sub);
  }
  notify(key) {
    this.subs.forEach(sub => sub.update(key));
  }
}

/**
 *
 *
 * @class observer
 */
class observer {
  constructor(value) {
    this.value = value;
    console.log(this.value);
    Object.keys(value).forEach(key => defineReactive(this.value, key, value[key]));
  }
}

/**
 *
 *
 * @param {*} value
 * @returns
 */
function observe(value) {
  if (!value || typeof value !== 'object') {
    return;
  }
  return new observer(value);
}

/**
 *
 * 主要为defineProperty 实现双向绑定的逻辑，后续优化为用proxy进行处理。
 * @param {*} obj
 * @param {*} key
 * @param {*} val
 */
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
      observe(newVal);
      dep.notify(key);
    },
  });
}

/**
 *
 *
 * @class watcher
 */
class watcher {
  constructor(vm, data, node) {
    this.depIds = {};
    this.vm = vm;
    this.data = data;
    this.node = node;
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
      compile(this.vm.$options.data, this.node);
      // console.log('重新compile');
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

/**
 *
 *
 * @class Template
 */
class Template {
  constructor(options = {}) {
    this.$options = options;
    this.$data = this.$options.data;
    observe(this.$data);
    const root = document.querySelector(this.$options.root);
    const node = createNode(root, reg);
    compile(this.$data, node);
    Object.keys(this.$data).forEach(key => {
      this.$Watch(key, node);
    });
    // this.compare(this.$data, node);
  }
  $Watch(data, node) {
    new watcher(this, data, node);
  }
  compare(data, node) {
    // console.log(data, node);
    // Object.keys(node).forEach(key => {
    // });
    // 需优化为，当前数据若在前端没有用到，则直接不进行react

  }
}

/**
 *拿到当前dom 的节点匹配好JS的类后渲染dom的节点
 *更新后渲染的dom 的节点，后续需优化为每次更新只更新当前节点，
 * @class dom
 */
class dom {
  constructor(data, node) {
    this.getNode(data, node);
  }
  getNode(data, node) {
    Object.keys(node).forEach(key => {
      // 为了使HTML里面的字段名{{name}}跟templat里面的data相匹配，在第一次渲染时做了前后的字符串处理。
      let str = node[key].innerHTML.substr(2);
      str = str.substr(0, str.length - 2);
      const attr = node[key].getAttribute('data_attr');
      for (const prop in data) {
        // 在不存在attr值并且，html的字段名跟template的属性名相匹配的时候进入此循环
        if ((!attr) && str === prop) {
          // 第一次渲染发生时，给当前key 加上当前渲染的data_attr,为了后面再次更新做匹配
          node[key].setAttribute('data_attr', str);
          // 赋值
          node[key].innerText = data[prop];
        } else if (prop === attr) {
          // 当后续渲染的attr值跟data 的prop 值相同的情况下，才进行一个重新渲染。
          node[key].innerText = data[prop];
        }
      }
    });
  }
}

/**
 *使用createNodeIterator 的方法 传入root也就是父节点，
 *
 * @param {*} data
 * @param {*} node
 * @returns
 */
function compile(data, node) {
  return new dom(data, node);
}

function createNode(root, reg) {

  const nodeIterator = document.createNodeIterator(
    root,
    NodeFilter.SHOW_ELEMENT,
    function(node) {
      // 直接console.log(node) 的时候会发现，这个方法会把父节点包含的所有作为第一个返回。
      // 后续优化方向为，若子节点还有子节点的情况下，返回的渲染节点的优化。
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

document.addEventListener('DOMContentLoaded', function() {
  const opt = {
    root: '#app',
    data: {
      name: '检索中...',
      age: 30,
    },
  };
  const vm = new Template(opt);
  // opt.data.name = 'dsdssd';
  setTimeout(() => {
    opt.data.name = '王永峰';
    opt.data.age = 89;
  }, 2000);
}, false);

const input = document.getElementById('input');
const demo = new Template({
  root: '#name',
  data: {
    text: '',
    name: '',
  },
});
input.addEventListener('keyup', function(e) {
  demo.$options.data.text = e.target.value;
});
setTimeout(() => {
  demo.$options.data.name = '122';
  console.log(demo.$options.data);
}, 2000);
