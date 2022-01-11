import { __app_onerror, safeCall, isObject } from './utils';


function WatchObject(fn, cb) {
  this.fn = fn;
  this.cb = cb;
  this.value = NaN;
  this.ro = false;
  this.cmp = null;
}


export const cd_watchObject = (fn, cb, option) => {
  const w = new WatchObject(fn, cb);
  option && Object.assign(w, option);
  return w;
};


export function $watch(cd, fn, callback, w) {
  w = cd_watchObject(fn, callback, w);
  cd.watchers.push(w);
  return w;
}

export function $watchReadOnly(cd, fn, callback) {
  return $watch(cd, fn, callback, { ro: true });
}

export function addEvent(cd, el, event, callback) {
  if (!callback) return;
  el.addEventListener(event, callback);
  cd_onDestroy(cd, () => {
    el.removeEventListener(event, callback);
  });
}

export function cd_onDestroy(cd, fn) {
  if (fn) cd._d.push(fn);
}

export function $$removeItem(array, item) {
  const i = array.indexOf(item);
  if (i >= 0) array.splice(i, 1);
}

function $ChangeDetector(parent) {
  this.parent = parent;
  this.children = [];
  this.watchers = [];
  this._d = [];
  this.prefix = [];
}

$ChangeDetector.prototype.new = function() {
  const cd = new $ChangeDetector(this);
  this.children.push(cd);
  return cd;
};

$ChangeDetector.prototype.destroy = function(option) {
  cd_destroy(this, option);
};

export const cd_component = (cd) => {
  while (cd.parent) cd = cd.parent;
  return cd.component;
};

export const cd_new = () => new $ChangeDetector();

export const cd_attach = (parent, cd) => {
  if (cd) {
    cd.parent = parent;
    parent.children.push(cd);
  }
};

export const destroyResults = null;

export const cd_destroy = (cd, option) => {
  if (option !== false && cd.parent) $$removeItem(cd.parent.children, cd);
  cd.watchers.length = 0;
  cd.prefix.length = 0;
  cd._d.forEach((fn) => {
    const p = safeCall(fn);
    p && destroyResults && destroyResults.push(p);
  });
  cd._d.length = 0;
  cd.children.map((cd) => cd.destroy(false));
  cd.children.length = 0;
};

export const isArray = (a) => Array.isArray(a);

const compareArray = (a, b) => {
  const a0 = isArray(a);
  const a1 = isArray(b);
  if (a0 !== a1) return true;
  if (!a0) return a !== b;
  if (a.length !== b.length) return true;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return true;
  }
  return false;
};


export function $$compareArray(w, value) {
  if (!compareArray(w.value, value)) return 0;
  if (isArray(value)) w.value = value.slice();
  else w.value = value;
  w.cb(w.value);
  return w.ro ? 0 : 1;
}


const compareDeep = (a, b, lvl) => {
  if (lvl < 0 || !a || !b) return a !== b;
  if (a === b) return false;
  const o0 = isObject(a);
  const o1 = isObject(b);
  if (!(o0 && o1)) return a !== b;

  const a0 = isArray(a);
  const a1 = isArray(b);
  if (a0 !== a1) return true;

  if (a0) {
    if (a.length !== b.length) return true;
    for (let i = 0; i < a.length; i++) {
      if (compareDeep(a[i], b[i], lvl - 1)) return true;
    }
  } else {
    const set = {};
    for (const k in a) {
      if (compareDeep(a[k], b[k], lvl - 1)) return true;
      set[k] = true;
    }
    for (const k in b) {
      if (set[k]) continue;
      return true;
    }
  }

  return false;
};

export function cloneDeep(d, lvl) {
  if (lvl < 0 || !d) return d;

  if (isObject(d)) {
    if (d instanceof Date) return d;
    if (d instanceof Element) return d;
    if (isArray(d)) return d.map((i) => cloneDeep(i, lvl - 1));
    const r = {};
    for (const k in d) r[k] = cloneDeep(d[k], lvl - 1);
    return r;
  }
  return d;
}

export const $$cloneDeep = function(d) {
  return cloneDeep(d, 10);
};

export function $$deepComparator(depth) {
  return function(w, value) {
    const diff = compareDeep(w.value, value, depth);
    if (diff) {
      (w.value = cloneDeep(value, depth), !w.idle && w.cb(value));
    }
    w.idle = false;
    return !w.ro && diff ? 1 : 0;
  };
}

export const $$compareDeep = $$deepComparator(10);


export const keyComparator = (w, value) => {
  let diff = false;
  for (const k in value) {
    if (w.value[k] != value[k]) diff = true;
    w.value[k] = value[k];
  }
  diff && !w.idle && w.cb(value);
  w.idle = false;
  return !w.ro && diff ? 1 : 0;
};


export const fire = (w) => {
  if (w.cmp) w.cmp(w, w.fn());
  else {
    w.value = w.fn();
    w.cb(w.value);
  }
};

export function $digest($cd) {
  let loop = 10;
  let w;
  while (loop >= 0) {
    let changes = 0;
    let index = 0;
    const queue = [];
    let i; let value; let cd = $cd;
    while (cd) {
      for (i = 0; i < cd.prefix.length; i++) cd.prefix[i]();
      for (i = 0; i < cd.watchers.length; i++) {
        w = cd.watchers[i];
        value = w.fn();
        if (w.value !== value) {
          if (w.cmp) {
            changes += w.cmp(w, value);
          } else {
            w.value = value;
            if (!w.ro) changes++;
            w.cb(w.value);
          }
        }
      }
      if (cd.children.length) queue.push.apply(queue, cd.children);
      cd = queue[index++];
    }
    loop--;
    if (!changes) break;
  }
  if (loop < 0) __app_onerror('Infinity changes: ', w);
}
