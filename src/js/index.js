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
      observe(newVal);
      dep.notify();
    },
  });
}
class watcher {
  constructor(vm, data, obj) {
    this.depIds = {};
    this.vm = vm;
    this.data = data;
    this.obj = obj;
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
      this.obj.call(this.vm, val);
    }
  }
  get() {
    Dep.target = this;
    const val = this.vm._data[this.data];
    Dep.target = null;
    return val;
  }
}
class Vue {
  constructor(options = {}) {
    this.$options = options;
    const data = (this._data = this.$options.data);
    Object.keys(data).forEach(key => this._proxy(key));
    observe(data);
  }
  $Watch(data, obj) {
    new watcher(this, data, obj);
  }
  _proxy(key) {
    Object.defineProperty(this, key, {
      get: () => this._data[key],
      set: val => {
        this._data[key] = val;
      },
    });
  }
}

const demo1 = new Vue({
  data: {
    text: '',
  },
});
const demo2 = new Vue({
  data: {
    text: '',
  },
});
const p = document.getElementById('p');
const input = document.getElementById('input');
const hello = document.getElementById('test');
input.addEventListener('keyup', function(e) {
  demo1.text = e.target.value;
});
demo1.$Watch('text', str => (p.innerHTML = str));
document.addEventListener('DOMContentLoaded', function() {
  demo2.$Watch('text', str => (hello.innerHTML = str));
  setTimeout(() => {
    demo2.$options.data.text = 'it\'s changed...';
  }, 3000);
}, false);
