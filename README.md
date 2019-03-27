# mmvm
## 简单实现思路
可参照MDN详细解说的方法[Object.defineProperty(obj, prop, descriptor)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 可以轻易地实现一个逻辑简单的双向绑定方法。
```
    <input type="text" id="input" />
    <p id="p"></p>
```
```
    let p = document.getElementById('p');
    let input = document.getElementById('input');
    Object.defineProperty(p, "text", {
        get: function () {
            return text;
        },
        set: function (value) {
            console.log('set!');
            p.innerHTML = value;
        }
    });
    input.addEventListener('keyup', function (e) {
        p.text = e.target.value;
    });
```
但是这个简单的实现方法存在一些很明显的缺陷。第一是没有实现封装，每次调用的话，要重新写方法。那接下来的重点就是把绑定逻辑给封装起来，使得不同的监听都可以复用。
## 订阅发布者模式
按照日常生活常识来表达，订阅发布者模式有点类似，有那么一个报社，报社里面有非常多的报纸，用户可以通过报社来订阅自己想要的报纸，每次该报纸新出版了就会送给该用户。意思就是说，我只要订阅我想要的信息就好。
以下是简单实现发布者的逻辑思路
```
let uid = 0;
class Dep {
    constructor() {
        this.id = uid++;
        this.subs = [];
        this.target = null;
    }
    // 添加订阅者
    addSub(sub) { 
        this.subs.push(sub);
    }
    //通知订阅者的方法
    notify() { 
       //通知的逻辑代码
    }
}
```
以下是实现observe 观察者模式的逻辑思路
```
// 
class observer {
    constructor(value) {
        this.value = value;
        //由于本身object.defineProperty 不具有监控多属性的功能，所以observe里面增加了Object.keys 循环来监听多个属性
        Object.keys(value).forEach(key => defineReactive(this.value, key, value[key]))
    }
}
// object.defineProperty 方法原参数第一位object，所以需要去外面判断一下。
function observe(value) {
    if (!value || typeof value !== 'object') {
        return;
    }
    return new observer(value);
}
// 方法同原来的object.defineProperty,根据订阅者模式，添加了一些判断。
function defineReactive(obj, key, val) {
    const dep = new Dep();
    let chlidObj = observe(val);//监控val值
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
            chlidObj = observe(newVal);//有更新的情况下监控新的val值
            dep.notify();//完成通知逻辑
        }
    });
}
```
下面为watcher类的实现逻辑，这个类主要为了后面每次订阅的时候增加订阅数据做服务
```
class watcher {
    constructor(vm, data, obj) {
        this.depIds = {};
        this.vm = vm;
        this.data = data;
        this.obj = obj;
        this.val = this.get();
    }
    //加入dep 方法
    addDep(dep) {
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    }
    // 更新值
    update() {
        const val = this.get();
        if (val !== this.val){
            this.val = val;
            this.obj.call(this.vm, val);
        }
    }
    // 获得值
    get() {
        Dep.target = this;
        const val = this.vm._data[this.data];
        Dep.target = null;
        return val;
    }
}
```
下面为vue 类实现方法
```
class Vue {
    constructor(options = {}) {
        this.$options = options;
        let data = (this._data = this.$options.data);
        Object.keys(data).forEach(key => this._proxy(key));
        observe(data);
    }
    //将vue 类的数据传进watcher里面
    $watch(data, obj) {
        new watcher(this, data, obj);
    }
    _proxy(key) {
        Object.defineProperty(this, key, {
            get: () => this._data[key],
            set: val => {
                this._data[key] = val;
            }
        })
    }
}
```
校验逻辑。校验逻辑里面加了两个方法，一个是自动更新，一个是input的时候，在旁边的p里面直接输出input的值。第二个方法是直接setTimeout去改变本身的值。
```
let demo1 = new Vue({
    data: {
        text: '',
    },
});
let demo2 = new Vue({
    data: {
        text: '',
    }
});

const p = document.getElementById('p');
const input = document.getElementById('input');
const hello = document.getElementById('test');
input.addEventListener('keyup', function (e) {
    demo1.text = e.target.value;
});
demo1.$watch('text', str => p.innerHTML = str);
document.addEventListener('DOMContentLoaded', function () {
    demo2.$watch('text', str => hello.innerHTML = str);
    setTimeout(() => {
        demo2.$options.data.text = `it's changed...`
    }, 3000);
}, false)
```
以上为简单实现双向绑定的逻辑。由于真实的例子，可能还存在数组以及对象的深度绑定，尚未试验。
全部代码如GitHub所示。













