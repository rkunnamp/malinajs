(function () {
  'use strict';

  let current_destroyList, current_mountList, current_cd;
  const $onDestroy = fn => fn && current_destroyList.push(fn);

  let __app_onerror = console.error;

  const isFunction = fn => typeof fn == 'function';

  const isObject = d => typeof d == 'object';

  const safeCall = fn => {
    try {
      return fn?.();
    } catch (e) {
      __app_onerror(e);
    }
  };

  const safeGroupCall = list => {
    try {
      list?.forEach(fn => fn?.());
    } catch (e) {
      __app_onerror(e);
    }
  };

  const safeGroupCall2 = (list, resultList, onlyFunction) => {
    list?.forEach(fn => {
      let r = safeCall(fn);
      r && (!onlyFunction || isFunction(r)) && resultList.push(r);
    });
  };

  function WatchObject(fn, cb) {
    this.fn = fn;
    this.cb = cb;
    this.value = NaN;
    this.cmp = null;
  }

  function $watch(fn, callback, option) {
    let w = new WatchObject(fn, callback);
    option && Object.assign(w, option);
    current_cd.watchers.push(w);
    return w;
  }

  function addEvent(el, event, callback) {
    if(!callback) return;
    el.addEventListener(event, callback);

    $onDestroy(() => {
      el.removeEventListener(event, callback);
    });
  }

  function $ChangeDetector(parent) {
    this.parent = parent;
    this.children = [];
    this.watchers = [];
    this.prefix = [];
  }

  const cd_component = cd => {
    while(cd.parent) cd = cd.parent;
    return cd.component;
  };

  const cd_new = (parent) => new $ChangeDetector(parent);

  const isArray = (a) => Array.isArray(a);


  const _compareDeep = (a, b, lvl) => {
    if(lvl < 0 || !a || !b) return a !== b;
    if(a === b) return false;
    let o0 = isObject(a);
    let o1 = isObject(b);
    if(!(o0 && o1)) return a !== b;

    let a0 = isArray(a);
    let a1 = isArray(b);
    if(a0 !== a1) return true;

    if(a0) {
      if(a.length !== b.length) return true;
      for(let i = 0; i < a.length; i++) {
        if(_compareDeep(a[i], b[i], lvl - 1)) return true;
      }
    } else {
      let set = {};
      for(let k in a) {
        if(_compareDeep(a[k], b[k], lvl - 1)) return true;
        set[k] = true;
      }
      for(let k in b) {
        if(set[k]) continue;
        return true;
      }
    }

    return false;
  };

  function cloneDeep(d, lvl) {
    if(lvl < 0 || !d) return d;

    if(isObject(d)) {
      if(d instanceof Date) return d;
      if(d instanceof Element) return d;
      if(isArray(d)) return d.map(i => cloneDeep(i, lvl - 1));
      let r = {};
      for(let k in d) r[k] = cloneDeep(d[k], lvl - 1);
      return r;
    }
    return d;
  }


  function deepComparator(depth) {
    return function(w, value) {
      let diff = _compareDeep(w.value, value, depth);
      diff && (w.value = cloneDeep(value, depth), !w.idle && w.cb(value));
      w.idle = false;
    };
  }

  const compareDeep = deepComparator(10);


  const keyComparator = (w, value) => {
    let diff = false;
    for(let k in value) {
      if(w.value[k] != value[k]) diff = true;
      w.value[k] = value[k];
    }
    diff && !w.idle && w.cb(value);
    w.idle = false;
  };


  const fire = w => {
    if(w.cmp) w.cmp(w, w.fn());
    else {
      w.value = w.fn();
      w.cb(w.value);
    }
  };

  function $digest($cd, flag) {
    let loop = 10;
    let w;
    while(loop >= 0) {
      let index = 0;
      let queue = [];
      let i, value, cd = $cd, changes = 0;
      while(cd) {
        for(i = 0; i < cd.prefix.length; i++) cd.prefix[i]();
        for(i = 0; i < cd.watchers.length; i++) {
          w = cd.watchers[i];
          value = w.fn();
          if(w.value !== value) {
            flag[0] = 0;
            if(w.cmp) {
              w.cmp(w, value);
            } else {
              w.cb(w.value = value);
            }
            changes += flag[0];
          }
        }
        if(cd.children.length) queue.push.apply(queue, cd.children);
        cd = queue[index++];
      }
      loop--;
      if(!changes) break;
    }
    if(loop < 0) __app_onerror('Infinity changes: ', w);
  }

  let templatecache = {};

  const htmlToFragment = (html, option) => {
    let result = templatecache[html];
    if(!result) {
      let t = document.createElement('template');
      t.innerHTML = html.replace(/<>/g, '<!---->');
      result = t.content;
      if(!(option & 2) && result.firstChild == result.lastChild) result = result.firstChild;
      templatecache[html] = result;
    }

    return option & 1 ? result.cloneNode(true) : result;
  };


  const iterNodes = (el, last, fn) => {
    let next;
    while(el) {
      next = el.nextSibling;
      fn(el);
      if(el == last) break;
      el = next;
    }
  };


  const removeElements = (el, last) => iterNodes(el, last, n => n.remove());


  const resolvedPromise = Promise.resolve();

  function $tick(fn) {
    fn && resolvedPromise.then(fn);
    return resolvedPromise;
  }


  let current_component, $context;


  const makeApply = () => {
    let $cd = current_component.$cd = current_cd = cd_new();
    $cd.component = current_component;

    let planned, flag = [0];
    let apply = r => {
      flag[0]++;
      if(planned) return r;
      planned = true;
      $tick(() => {
        try {
          $digest($cd, flag);
        } finally {
          planned = false;
        }
      });
      return r;
    };

    current_component.$apply = apply;
    current_component.$push = apply;
    apply();
    return apply;
  };


  const makeComponent = (init) => {
    return ($option = {}) => {
      $context = $option.context || {};
      let prev_component = current_component,
        prev_cd = current_cd,
        $component = current_component = { $option };
      current_cd = null;

      try {
        $component.$dom = init($option);
      } finally {
        current_component = prev_component;
        current_cd = prev_cd;
        $context = null;
      }

      return $component;
    };
  };


  const callComponent = (component, context, option = {}) => {
    option.context = { ...context };
    let $component = safeCall(() => component(option));
    if($component instanceof Node) $component = { $dom: $component };
    return $component;
  };


  const callComponentDyn = (component, context, option = {}, propFn, cmp, setter, classFn) => {
    let $component, parentWatch;

    if(propFn) {
      parentWatch = $watch(propFn, value => {
        $component.$push?.(value);
        $component.$apply?.();
      }, { value: {}, idle: true, cmp });
      fire(parentWatch);
      option.props = parentWatch.value;
    }

    if(classFn) {
      fire($watch(classFn, value => {
        option.$class = value;
        $component?.$apply?.();
      }, { value: {}, cmp: keyComparator }));
    }

    $component = callComponent(component, context, option);
    if(setter && $component?.$exportedProps) {
      let parentCD = current_cd, w = new WatchObject($component.$exportedProps, value => {
        setter(value);
        cd_component(parentCD).$apply();
        $component.$push(parentWatch.fn());
        $component.$apply();
      });
      Object.assign(w, { idle: true, cmp, value: parentWatch.value });
      $component.$cd.watchers.push(w);
    }

    return $component;
  };


  const bindText = (element, fn) => {
    $watch(() => '' + fn(), value => {
      element.textContent = value;
    });
  };

  const addBlock = (parent, $dom) => {
    if(!$dom) return;
    parent.appendChild($dom.$dom || $dom);
  };

  const mount = (label, component, option) => {
    let app, first, last, destroyList = current_destroyList = [];
    current_mountList = [];
    try {
      app = component(option);
      let $dom = app.$dom;
      delete app.$dom;
      if($dom.nodeType == 11) {
        first = $dom.firstChild;
        last = $dom.lastChild;
      } else first = last = $dom;
      label.appendChild($dom);
      safeGroupCall2(current_mountList, destroyList);
    } finally {
      current_destroyList = current_mountList = null;
    }
    app.destroy = () => {
      safeGroupCall(destroyList);
      removeElements(first, last);
    };
    return app;
  };

  const refer = (active, line) => {
    let result = [], i, v;
    const code = (x, d) => x.charCodeAt() - d;

    for(i = 0; i < line.length; i++) {
      let a = line[i];
      switch (a) {
        case '>':
          active = active.firstChild;
          break;
        case '+':
          active = active.firstChild;
        case '.':
          result.push(active);
          break;
        case '!':
          v = code(line[++i], 48) * 42 + code(line[++i], 48);
          while(v--) active = active.nextSibling;
          break;
        case '#':
          active = result[code(line[++i], 48) * 26 + code(line[++i], 48)];
          break;
        default:
          v = code(a, 0);
          if(v >= 97) active = result[v - 97];
          else {
            v -= 48;
            while(v--) active = active.nextSibling;
          }
      }
    }
    return result;
  };

  var Child = makeComponent($option => {
    const $$apply = makeApply();
    let $props = $option.props || {};
    let {childArray} = $props;
    current_component.$push = ($$props) => ({childArray=childArray} = $props = $$props);
    current_component.$exportedProps = () => ({childArray});
    let count = 0;
    function addToArray() {
      $$apply();
      childArray.push(count++);
      console.log("childArray now- ", JSON.stringify(childArray));
    }
    {
      const $parentElement = htmlToFragment(`<button> Add to array inside child </button><h3> </h3>`, 1);
      let [el0, el1] = refer($parentElement, '+1+');
      addEvent(el0, 'click', ($event) => { addToArray($event);});
      bindText(el1, () => `childArray ${JSON.stringify(childArray)}`);
      return $parentElement;
    }
  });

  var App = makeComponent($option => {
    const $$apply = makeApply();
    const $context$1 = $context;
    let parentArray = [];
    {
      const $parentElement = htmlToFragment(`<h3> </h3><br/><br/>`, 3);
      let [el0] = refer($parentElement, '>+');
      bindText(el0, () => `parentArray ${JSON.stringify(parentArray)}`);
      addBlock($parentElement, callComponentDyn(Child, $context$1, {},

        () => ({childArray: parentArray}),

        compareDeep,

        ($$_value) => ({childArray: parentArray = parentArray} = $$_value)
      ));
      return $parentElement;
    }
  });

  mount(document.body, App);

}());
