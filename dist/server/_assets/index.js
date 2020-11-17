"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports[Symbol.toStringTag] = "Module";
var vue = require("vue");
var serverRenderer = require("@vue/server-renderer");
/*!
  * vue-router v4.0.0-rc.3
  * (c) 2020 Eduardo San Martin Morote
  * @license MIT
  */
const hasSymbol = typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol";
const PolySymbol = (name) => hasSymbol ? Symbol("[vue-router]: " + name) : "[vue-router]: " + name;
const matchedRouteKey = /* @__PURE__ */ PolySymbol("router view location matched");
const viewDepthKey = /* @__PURE__ */ PolySymbol("router view depth");
const routerKey = /* @__PURE__ */ PolySymbol("router");
const routeLocationKey = /* @__PURE__ */ PolySymbol("route location");
const isBrowser = typeof window !== "undefined";
function isESModule(obj) {
  return obj.__esModule || hasSymbol && obj[Symbol.toStringTag] === "Module";
}
const assign = Object.assign;
function applyToParams(fn, params) {
  const newParams = {};
  for (const key in params) {
    const value = params[key];
    newParams[key] = Array.isArray(value) ? value.map(fn) : fn(value);
  }
  return newParams;
}
let noop = () => {
};
function warn(msg) {
  const args = Array.from(arguments).slice(1);
  console.warn.apply(console, ["[Vue Router warn]: " + msg].concat(args));
}
const TRAILING_SLASH_RE = /\/$/;
const removeTrailingSlash = (path) => path.replace(TRAILING_SLASH_RE, "");
function parseURL(parseQuery2, location2, currentLocation = "/") {
  let path, query = {}, searchString = "", hash = "";
  const searchPos = location2.indexOf("?");
  const hashPos = location2.indexOf("#", searchPos > -1 ? searchPos : 0);
  if (searchPos > -1) {
    path = location2.slice(0, searchPos);
    searchString = location2.slice(searchPos + 1, hashPos > -1 ? hashPos : location2.length);
    query = parseQuery2(searchString);
  }
  if (hashPos > -1) {
    path = path || location2.slice(0, hashPos);
    hash = location2.slice(hashPos, location2.length);
  }
  path = resolveRelativePath(path != null ? path : location2, currentLocation);
  return {
    fullPath: path + (searchString && "?") + searchString + hash,
    path,
    query,
    hash
  };
}
function stringifyURL(stringifyQuery2, location2) {
  let query = location2.query ? stringifyQuery2(location2.query) : "";
  return location2.path + (query && "?") + query + (location2.hash || "");
}
function stripBase(pathname, base) {
  if (!base || pathname.toLowerCase().indexOf(base.toLowerCase()))
    return pathname;
  return pathname.slice(base.length) || "/";
}
function isSameRouteLocation(stringifyQuery2, a, b) {
  let aLastIndex = a.matched.length - 1;
  let bLastIndex = b.matched.length - 1;
  return aLastIndex > -1 && aLastIndex === bLastIndex && isSameRouteRecord(a.matched[aLastIndex], b.matched[bLastIndex]) && isSameRouteLocationParams(a.params, b.params) && stringifyQuery2(a.query) === stringifyQuery2(b.query) && a.hash === b.hash;
}
function isSameRouteRecord(a, b) {
  return (a.aliasOf || a) === (b.aliasOf || b);
}
function isSameRouteLocationParams(a, b) {
  if (Object.keys(a).length !== Object.keys(b).length)
    return false;
  for (let key in a) {
    if (!isSameRouteLocationParamsValue(a[key], b[key]))
      return false;
  }
  return true;
}
function isSameRouteLocationParamsValue(a, b) {
  return Array.isArray(a) ? isEquivalentArray(a, b) : Array.isArray(b) ? isEquivalentArray(b, a) : a === b;
}
function isEquivalentArray(a, b) {
  return Array.isArray(b) ? a.length === b.length && a.every((value, i) => value === b[i]) : a.length === 1 && a[0] === b;
}
function resolveRelativePath(to, from) {
  if (to.startsWith("/"))
    return to;
  if (!from.startsWith("/")) {
    warn(`Cannot resolve a relative location without an absolute path. Trying to resolve "${to}" from "${from}". It should look like "/${from}".`);
    return to;
  }
  if (!to)
    return from;
  const fromSegments = from.split("/");
  const toSegments = to.split("/");
  let position = fromSegments.length - 1;
  let toPosition;
  let segment;
  for (toPosition = 0; toPosition < toSegments.length; toPosition++) {
    segment = toSegments[toPosition];
    if (position === 1 || segment === ".")
      continue;
    if (segment === "..")
      position--;
    else
      break;
  }
  return fromSegments.slice(0, position).join("/") + "/" + toSegments.slice(toPosition - (toPosition === toSegments.length ? 1 : 0)).join("/");
}
var NavigationType;
(function(NavigationType2) {
  NavigationType2["pop"] = "pop";
  NavigationType2["push"] = "push";
})(NavigationType || (NavigationType = {}));
var NavigationDirection;
(function(NavigationDirection2) {
  NavigationDirection2["back"] = "back";
  NavigationDirection2["forward"] = "forward";
  NavigationDirection2["unknown"] = "";
})(NavigationDirection || (NavigationDirection = {}));
const START = "";
function normalizeBase(base) {
  if (!base) {
    if (isBrowser) {
      const baseEl = document.querySelector("base");
      base = baseEl && baseEl.getAttribute("href") || "/";
      base = base.replace(/^\w+:\/\/[^\/]+/, "");
    } else {
      base = "/";
    }
  }
  if (base[0] !== "/" && base[0] !== "#")
    base = "/" + base;
  return removeTrailingSlash(base);
}
const BEFORE_HASH_RE = /^[^#]+#/;
function createHref(base, location2) {
  return base.replace(BEFORE_HASH_RE, "#") + location2;
}
function getElementPosition(el, offset) {
  const docRect = document.documentElement.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  return {
    behavior: offset.behavior,
    left: elRect.left - docRect.left - (offset.left || 0),
    top: elRect.top - docRect.top - (offset.top || 0)
  };
}
const computeScrollPosition = () => ({
  left: window.pageXOffset,
  top: window.pageYOffset
});
function scrollToPosition(position) {
  let scrollToOptions;
  if ("el" in position) {
    let positionEl = position.el;
    const isIdSelector = typeof positionEl === "string" && positionEl.startsWith("#");
    if (typeof position.el === "string") {
      if (!isIdSelector || !document.getElementById(position.el.slice(1))) {
        try {
          let foundEl = document.querySelector(position.el);
          if (isIdSelector && foundEl) {
            warn(`The selector "${position.el}" should be passed as "el: document.querySelector('${position.el}')" because it starts with "#".`);
            return;
          }
        } catch (err) {
          warn(`The selector "${position.el}" is invalid. If you are using an id selector, make sure to escape it. You can find more information about escaping characters in selectors at https://mathiasbynens.be/notes/css-escapes or use CSS.escape (https://developer.mozilla.org/en-US/docs/Web/API/CSS/escape).`);
          return;
        }
      }
    }
    const el = typeof positionEl === "string" ? isIdSelector ? document.getElementById(positionEl.slice(1)) : document.querySelector(positionEl) : positionEl;
    if (!el) {
      warn(`Couldn't find element using selector "${position.el}" returned by scrollBehavior.`);
      return;
    }
    scrollToOptions = getElementPosition(el, position);
  } else {
    scrollToOptions = position;
  }
  if ("scrollBehavior" in document.documentElement.style)
    window.scrollTo(scrollToOptions);
  else {
    window.scrollTo(scrollToOptions.left != null ? scrollToOptions.left : window.pageXOffset, scrollToOptions.top != null ? scrollToOptions.top : window.pageYOffset);
  }
}
function getScrollKey(path, delta) {
  const position = history.state ? history.state.position - delta : -1;
  return position + path;
}
const scrollPositions = new Map();
function saveScrollPosition(key, scrollPosition) {
  scrollPositions.set(key, scrollPosition);
}
function getSavedScrollPosition(key) {
  const scroll = scrollPositions.get(key);
  scrollPositions.delete(key);
  return scroll;
}
let createBaseLocation = () => location.protocol + "//" + location.host;
function createCurrentLocation(base, location2) {
  const {pathname, search, hash} = location2;
  const hashPos = base.indexOf("#");
  if (hashPos > -1) {
    let pathFromHash = hash.slice(1);
    if (pathFromHash[0] !== "/")
      pathFromHash = "/" + pathFromHash;
    return stripBase(pathFromHash, "");
  }
  const path = stripBase(pathname, base);
  return path + search + hash;
}
function useHistoryListeners(base, historyState, currentLocation, replace) {
  let listeners = [];
  let teardowns = [];
  let pauseState = null;
  const popStateHandler = ({state}) => {
    const to = createCurrentLocation(base, location);
    const from = currentLocation.value;
    const fromState = historyState.value;
    let delta = 0;
    if (state) {
      currentLocation.value = to;
      historyState.value = state;
      if (pauseState && pauseState === from) {
        pauseState = null;
        return;
      }
      delta = fromState ? state.position - fromState.position : 0;
    } else {
      replace(to);
    }
    listeners.forEach((listener) => {
      listener(currentLocation.value, from, {
        delta,
        type: NavigationType.pop,
        direction: delta ? delta > 0 ? NavigationDirection.forward : NavigationDirection.back : NavigationDirection.unknown
      });
    });
  };
  function pauseListeners() {
    pauseState = currentLocation.value;
  }
  function listen(callback) {
    listeners.push(callback);
    const teardown = () => {
      const index = listeners.indexOf(callback);
      if (index > -1)
        listeners.splice(index, 1);
    };
    teardowns.push(teardown);
    return teardown;
  }
  function beforeUnloadListener() {
    const {history: history2} = window;
    if (!history2.state)
      return;
    history2.replaceState(assign({}, history2.state, {scroll: computeScrollPosition()}), "");
  }
  function destroy() {
    for (const teardown of teardowns)
      teardown();
    teardowns = [];
    window.removeEventListener("popstate", popStateHandler);
    window.removeEventListener("beforeunload", beforeUnloadListener);
  }
  window.addEventListener("popstate", popStateHandler);
  window.addEventListener("beforeunload", beforeUnloadListener);
  return {
    pauseListeners,
    listen,
    destroy
  };
}
function buildState(back, current, forward, replaced = false, computeScroll = false) {
  return {
    back,
    current,
    forward,
    replaced,
    position: window.history.length,
    scroll: computeScroll ? computeScrollPosition() : null
  };
}
function useHistoryStateNavigation(base) {
  const {history: history2, location: location2} = window;
  let currentLocation = {
    value: createCurrentLocation(base, location2)
  };
  let historyState = {value: history2.state};
  if (!historyState.value) {
    changeLocation(currentLocation.value, {
      back: null,
      current: currentLocation.value,
      forward: null,
      position: history2.length - 1,
      replaced: true,
      scroll: null
    }, true);
  }
  function changeLocation(to, state, replace2) {
    const hashIndex = base.indexOf("#");
    const url = hashIndex > -1 ? base.slice(hashIndex) + to : createBaseLocation() + base + to;
    try {
      history2[replace2 ? "replaceState" : "pushState"](state, "", url);
      historyState.value = state;
    } catch (err) {
      {
        warn("Error with push/replace State", err);
      }
      location2[replace2 ? "replace" : "assign"](url);
    }
  }
  function replace(to, data) {
    const state = assign({}, history2.state, buildState(historyState.value.back, to, historyState.value.forward, true), data, {position: historyState.value.position});
    changeLocation(to, state, true);
    currentLocation.value = to;
  }
  function push(to, data) {
    const currentState = assign({}, historyState.value, history2.state, {
      forward: to,
      scroll: computeScrollPosition()
    });
    if (!history2.state) {
      warn(`history.state seems to have been manually replaced without preserving the necessary values. Make sure to preserve existing history state if you are manually calling history.replaceState:

history.replaceState(history.state, '', url)

You can find more information at https://next.router.vuejs.org/guide/migration/#usage-of-history-state.`);
    }
    changeLocation(currentState.current, currentState, true);
    const state = assign({}, buildState(currentLocation.value, to, null), {position: currentState.position + 1}, data);
    changeLocation(to, state, false);
    currentLocation.value = to;
  }
  return {
    location: currentLocation,
    state: historyState,
    push,
    replace
  };
}
function createWebHistory(base) {
  base = normalizeBase(base);
  const historyNavigation = useHistoryStateNavigation(base);
  const historyListeners = useHistoryListeners(base, historyNavigation.state, historyNavigation.location, historyNavigation.replace);
  function go(delta, triggerListeners = true) {
    if (!triggerListeners)
      historyListeners.pauseListeners();
    history.go(delta);
  }
  const routerHistory = assign({
    location: "",
    base,
    go,
    createHref: createHref.bind(null, base)
  }, historyNavigation, historyListeners);
  Object.defineProperty(routerHistory, "location", {
    get: () => historyNavigation.location.value
  });
  Object.defineProperty(routerHistory, "state", {
    get: () => historyNavigation.state.value
  });
  return routerHistory;
}
function createMemoryHistory(base = "") {
  let listeners = [];
  let queue = [START];
  let position = 0;
  function setLocation(location2) {
    position++;
    if (position === queue.length) {
      queue.push(location2);
    } else {
      queue.splice(position);
      queue.push(location2);
    }
  }
  function triggerListeners(to, from, {direction, delta}) {
    const info = {
      direction,
      delta,
      type: NavigationType.pop
    };
    for (let callback of listeners) {
      callback(to, from, info);
    }
  }
  const routerHistory = {
    location: START,
    state: {},
    base,
    createHref: createHref.bind(null, base),
    replace(to) {
      queue.splice(position--, 1);
      setLocation(to);
    },
    push(to, data) {
      setLocation(to);
    },
    listen(callback) {
      listeners.push(callback);
      return () => {
        const index = listeners.indexOf(callback);
        if (index > -1)
          listeners.splice(index, 1);
      };
    },
    destroy() {
      listeners = [];
    },
    go(delta, shouldTrigger = true) {
      const from = this.location;
      const direction = delta < 0 ? NavigationDirection.back : NavigationDirection.forward;
      position = Math.max(0, Math.min(position + delta, queue.length - 1));
      if (shouldTrigger) {
        triggerListeners(this.location, from, {
          direction,
          delta
        });
      }
    }
  };
  Object.defineProperty(routerHistory, "location", {
    get: () => queue[position]
  });
  return routerHistory;
}
function isRouteLocation(route) {
  return typeof route === "string" || route && typeof route === "object";
}
function isRouteName(name) {
  return typeof name === "string" || typeof name === "symbol";
}
const START_LOCATION_NORMALIZED = {
  path: "/",
  name: void 0,
  params: {},
  query: {},
  hash: "",
  fullPath: "/",
  matched: [],
  meta: {},
  redirectedFrom: void 0
};
const NavigationFailureSymbol = /* @__PURE__ */ PolySymbol("navigation failure");
var NavigationFailureType;
(function(NavigationFailureType2) {
  NavigationFailureType2[NavigationFailureType2["aborted"] = 4] = "aborted";
  NavigationFailureType2[NavigationFailureType2["cancelled"] = 8] = "cancelled";
  NavigationFailureType2[NavigationFailureType2["duplicated"] = 16] = "duplicated";
})(NavigationFailureType || (NavigationFailureType = {}));
const ErrorTypeMessages = {
  [1]({location: location2, currentLocation}) {
    return `No match for
 ${JSON.stringify(location2)}${currentLocation ? "\nwhile being at\n" + JSON.stringify(currentLocation) : ""}`;
  },
  [2]({from, to}) {
    return `Redirected from "${from.fullPath}" to "${stringifyRoute(to)}" via a navigation guard.`;
  },
  [4]({from, to}) {
    return `Navigation aborted from "${from.fullPath}" to "${to.fullPath}" via a navigation guard.`;
  },
  [8]({from, to}) {
    return `Navigation cancelled from "${from.fullPath}" to "${to.fullPath}" with a new navigation.`;
  },
  [16]({from, to}) {
    return `Avoided redundant navigation to current location: "${from.fullPath}".`;
  }
};
function createRouterError(type, params) {
  {
    return assign(new Error(ErrorTypeMessages[type](params)), {
      type,
      [NavigationFailureSymbol]: true
    }, params);
  }
}
function isNavigationFailure(error, type) {
  return error instanceof Error && NavigationFailureSymbol in error && (type == null || !!(error.type & type));
}
const propertiesToLog = ["params", "query", "hash"];
function stringifyRoute(to) {
  if (typeof to === "string")
    return to;
  if ("path" in to)
    return to.path;
  const location2 = {};
  for (const key of propertiesToLog) {
    if (key in to)
      location2[key] = to[key];
  }
  return JSON.stringify(location2, null, 2);
}
const BASE_PARAM_PATTERN = "[^/]+?";
const BASE_PATH_PARSER_OPTIONS = {
  sensitive: false,
  strict: false,
  start: true,
  end: true
};
const REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;
function tokensToParser(segments, extraOptions) {
  const options = assign({}, BASE_PATH_PARSER_OPTIONS, extraOptions);
  let score = [];
  let pattern = options.start ? "^" : "";
  const keys = [];
  for (const segment of segments) {
    const segmentScores = segment.length ? [] : [90];
    if (options.strict && !segment.length)
      pattern += "/";
    for (let tokenIndex = 0; tokenIndex < segment.length; tokenIndex++) {
      const token = segment[tokenIndex];
      let subSegmentScore = 40 + (options.sensitive ? 0.25 : 0);
      if (token.type === 0) {
        if (!tokenIndex)
          pattern += "/";
        pattern += token.value.replace(REGEX_CHARS_RE, "\\$&");
        subSegmentScore += 40;
      } else if (token.type === 1) {
        const {value, repeatable, optional, regexp} = token;
        keys.push({
          name: value,
          repeatable,
          optional
        });
        const re2 = regexp ? regexp : BASE_PARAM_PATTERN;
        if (re2 !== BASE_PARAM_PATTERN) {
          subSegmentScore += 10;
          try {
            new RegExp(`(${re2})`);
          } catch (err) {
            throw new Error(`Invalid custom RegExp for param "${value}" (${re2}): ` + err.message);
          }
        }
        let subPattern = repeatable ? `((?:${re2})(?:/(?:${re2}))*)` : `(${re2})`;
        if (!tokenIndex)
          subPattern = optional ? `(?:/${subPattern})` : "/" + subPattern;
        if (optional)
          subPattern += "?";
        pattern += subPattern;
        subSegmentScore += 20;
        if (optional)
          subSegmentScore += -8;
        if (repeatable)
          subSegmentScore += -20;
        if (re2 === ".*")
          subSegmentScore += -50;
      }
      segmentScores.push(subSegmentScore);
    }
    score.push(segmentScores);
  }
  if (options.strict && options.end) {
    const i = score.length - 1;
    score[i][score[i].length - 1] += 0.7000000000000001;
  }
  if (!options.strict)
    pattern += "/?";
  if (options.end)
    pattern += "$";
  else if (options.strict)
    pattern += "(?:/|$)";
  const re = new RegExp(pattern, options.sensitive ? "" : "i");
  function parse(path) {
    const match = path.match(re);
    const params = {};
    if (!match)
      return null;
    for (let i = 1; i < match.length; i++) {
      const value = match[i] || "";
      const key = keys[i - 1];
      params[key.name] = value && key.repeatable ? value.split("/") : value;
    }
    return params;
  }
  function stringify(params) {
    let path = "";
    let avoidDuplicatedSlash = false;
    for (const segment of segments) {
      if (!avoidDuplicatedSlash || !path.endsWith("/"))
        path += "/";
      avoidDuplicatedSlash = false;
      for (const token of segment) {
        if (token.type === 0) {
          path += token.value;
        } else if (token.type === 1) {
          const {value, repeatable, optional} = token;
          const param = value in params ? params[value] : "";
          if (Array.isArray(param) && !repeatable)
            throw new Error(`Provided param "${value}" is an array but it is not repeatable (* or + modifiers)`);
          const text = Array.isArray(param) ? param.join("/") : param;
          if (!text) {
            if (optional) {
              if (path.endsWith("/"))
                path = path.slice(0, -1);
              else
                avoidDuplicatedSlash = true;
            } else
              throw new Error(`Missing required param "${value}"`);
          }
          path += text;
        }
      }
    }
    return path;
  }
  return {
    re,
    score,
    keys,
    parse,
    stringify
  };
}
function compareScoreArray(a, b) {
  let i = 0;
  while (i < a.length && i < b.length) {
    const diff = b[i] - a[i];
    if (diff)
      return diff;
    i++;
  }
  if (a.length < b.length) {
    return a.length === 1 && a[0] === 40 + 40 ? -1 : 1;
  } else if (a.length > b.length) {
    return b.length === 1 && b[0] === 40 + 40 ? 1 : -1;
  }
  return 0;
}
function comparePathParserScore(a, b) {
  let i = 0;
  const aScore = a.score;
  const bScore = b.score;
  while (i < aScore.length && i < bScore.length) {
    const comp = compareScoreArray(aScore[i], bScore[i]);
    if (comp)
      return comp;
    i++;
  }
  return bScore.length - aScore.length;
}
const ROOT_TOKEN = {
  type: 0,
  value: ""
};
const VALID_PARAM_RE = /[a-zA-Z0-9_]/;
function tokenizePath(path) {
  if (!path)
    return [[]];
  if (path === "/")
    return [[ROOT_TOKEN]];
  if (!path.startsWith("/")) {
    throw new Error(`Route paths should start with a "/": "${path}" should be "/${path}".`);
  }
  function crash(message) {
    throw new Error(`ERR (${state})/"${buffer}": ${message}`);
  }
  let state = 0;
  let previousState = state;
  const tokens = [];
  let segment;
  function finalizeSegment() {
    if (segment)
      tokens.push(segment);
    segment = [];
  }
  let i = 0;
  let char;
  let buffer = "";
  let customRe = "";
  function consumeBuffer() {
    if (!buffer)
      return;
    if (state === 0) {
      segment.push({
        type: 0,
        value: buffer
      });
    } else if (state === 1 || state === 2 || state === 3) {
      if (segment.length > 1 && (char === "*" || char === "+"))
        crash(`A repeatable param (${buffer}) must be alone in its segment. eg: '/:ids+.`);
      segment.push({
        type: 1,
        value: buffer,
        regexp: customRe,
        repeatable: char === "*" || char === "+",
        optional: char === "*" || char === "?"
      });
    } else {
      crash("Invalid state to consume buffer");
    }
    buffer = "";
  }
  function addCharToBuffer() {
    buffer += char;
  }
  while (i < path.length) {
    char = path[i++];
    if (char === "\\" && state !== 2) {
      previousState = state;
      state = 4;
      continue;
    }
    switch (state) {
      case 0:
        if (char === "/") {
          if (buffer) {
            consumeBuffer();
          }
          finalizeSegment();
        } else if (char === ":") {
          consumeBuffer();
          state = 1;
        } else {
          addCharToBuffer();
        }
        break;
      case 4:
        addCharToBuffer();
        state = previousState;
        break;
      case 1:
        if (char === "(") {
          state = 2;
          customRe = "";
        } else if (VALID_PARAM_RE.test(char)) {
          addCharToBuffer();
        } else {
          consumeBuffer();
          state = 0;
          if (char !== "*" && char !== "?" && char !== "+")
            i--;
        }
        break;
      case 2:
        if (char === ")") {
          if (customRe[customRe.length - 1] == "\\")
            customRe = customRe.slice(0, -1) + char;
          else
            state = 3;
        } else {
          customRe += char;
        }
        break;
      case 3:
        consumeBuffer();
        state = 0;
        if (char !== "*" && char !== "?" && char !== "+")
          i--;
        break;
      default:
        crash("Unknown state");
        break;
    }
  }
  if (state === 2)
    crash(`Unfinished custom RegExp for param "${buffer}"`);
  consumeBuffer();
  finalizeSegment();
  return tokens;
}
function createRouteRecordMatcher(record, parent, options) {
  const parser = tokensToParser(tokenizePath(record.path), options);
  {
    const existingKeys = new Set();
    for (const key of parser.keys) {
      if (existingKeys.has(key.name))
        warn(`Found duplicated params with name "${key.name}" for path "${record.path}". Only the last one will be available on "$route.params".`);
      existingKeys.add(key.name);
    }
  }
  const matcher = assign(parser, {
    record,
    parent,
    children: [],
    alias: []
  });
  if (parent) {
    if (!matcher.record.aliasOf === !parent.record.aliasOf)
      parent.children.push(matcher);
  }
  return matcher;
}
function createRouterMatcher(routes, globalOptions) {
  const matchers = [];
  const matcherMap = new Map();
  globalOptions = mergeOptions({strict: false, end: true, sensitive: false}, globalOptions);
  function getRecordMatcher(name) {
    return matcherMap.get(name);
  }
  function addRoute(record, parent, originalRecord) {
    let isRootAdd = !originalRecord;
    let mainNormalizedRecord = normalizeRouteRecord(record);
    mainNormalizedRecord.aliasOf = originalRecord && originalRecord.record;
    const options = mergeOptions(globalOptions, record);
    const normalizedRecords = [
      mainNormalizedRecord
    ];
    if ("alias" in record) {
      const aliases = typeof record.alias === "string" ? [record.alias] : record.alias;
      for (const alias of aliases) {
        normalizedRecords.push(assign({}, mainNormalizedRecord, {
          components: originalRecord ? originalRecord.record.components : mainNormalizedRecord.components,
          path: alias,
          aliasOf: originalRecord ? originalRecord.record : mainNormalizedRecord
        }));
      }
    }
    let matcher;
    let originalMatcher;
    for (const normalizedRecord of normalizedRecords) {
      let {path} = normalizedRecord;
      if (parent && path[0] !== "/") {
        let parentPath = parent.record.path;
        let connectingSlash = parentPath[parentPath.length - 1] === "/" ? "" : "/";
        normalizedRecord.path = parent.record.path + (path && connectingSlash + path);
      }
      if (normalizedRecord.path === "*") {
        throw new Error('Catch all routes ("*") must now be defined using a param with a custom regexp.\nSee more at https://next.router.vuejs.org/guide/migration/#removed-star-or-catch-all-routes.');
      }
      matcher = createRouteRecordMatcher(normalizedRecord, parent, options);
      if (parent && path[0] === "/")
        checkMissingParamsInAbsolutePath(matcher, parent);
      if (originalRecord) {
        originalRecord.alias.push(matcher);
        {
          checkSameParams(originalRecord, matcher);
        }
      } else {
        originalMatcher = originalMatcher || matcher;
        if (originalMatcher !== matcher)
          originalMatcher.alias.push(matcher);
        if (isRootAdd && record.name && !isAliasRecord(matcher))
          removeRoute(record.name);
      }
      if ("children" in mainNormalizedRecord) {
        let children = mainNormalizedRecord.children;
        for (let i = 0; i < children.length; i++) {
          addRoute(children[i], matcher, originalRecord && originalRecord.children[i]);
        }
      }
      originalRecord = originalRecord || matcher;
      insertMatcher(matcher);
    }
    return originalMatcher ? () => {
      removeRoute(originalMatcher);
    } : noop;
  }
  function removeRoute(matcherRef) {
    if (isRouteName(matcherRef)) {
      const matcher = matcherMap.get(matcherRef);
      if (matcher) {
        matcherMap.delete(matcherRef);
        matchers.splice(matchers.indexOf(matcher), 1);
        matcher.children.forEach(removeRoute);
        matcher.alias.forEach(removeRoute);
      }
    } else {
      let index = matchers.indexOf(matcherRef);
      if (index > -1) {
        matchers.splice(index, 1);
        if (matcherRef.record.name)
          matcherMap.delete(matcherRef.record.name);
        matcherRef.children.forEach(removeRoute);
        matcherRef.alias.forEach(removeRoute);
      }
    }
  }
  function getRoutes() {
    return matchers;
  }
  function insertMatcher(matcher) {
    let i = 0;
    while (i < matchers.length && comparePathParserScore(matcher, matchers[i]) >= 0)
      i++;
    matchers.splice(i, 0, matcher);
    if (matcher.record.name && !isAliasRecord(matcher))
      matcherMap.set(matcher.record.name, matcher);
  }
  function resolve(location2, currentLocation) {
    let matcher;
    let params = {};
    let path;
    let name;
    if ("name" in location2 && location2.name) {
      matcher = matcherMap.get(location2.name);
      if (!matcher)
        throw createRouterError(1, {
          location: location2
        });
      name = matcher.record.name;
      params = assign(paramsFromLocation(currentLocation.params, matcher.keys.filter((k) => !k.optional).map((k) => k.name)), location2.params);
      path = matcher.stringify(params);
    } else if ("path" in location2) {
      path = location2.path;
      if (!path.startsWith("/")) {
        warn(`The Matcher cannot resolve relative paths but received "${path}". Unless you directly called \`matcher.resolve("${path}")\`, this is probably a bug in vue-router. Please open an issue at https://new-issue.vuejs.org/?repo=vuejs/vue-router-next.`);
      }
      matcher = matchers.find((m) => m.re.test(path));
      if (matcher) {
        params = matcher.parse(path);
        name = matcher.record.name;
      }
    } else {
      matcher = currentLocation.name ? matcherMap.get(currentLocation.name) : matchers.find((m) => m.re.test(currentLocation.path));
      if (!matcher)
        throw createRouterError(1, {
          location: location2,
          currentLocation
        });
      name = matcher.record.name;
      params = assign({}, currentLocation.params, location2.params);
      path = matcher.stringify(params);
    }
    const matched = [];
    let parentMatcher = matcher;
    while (parentMatcher) {
      matched.unshift(parentMatcher.record);
      parentMatcher = parentMatcher.parent;
    }
    return {
      name,
      path,
      params,
      matched,
      meta: mergeMetaFields(matched)
    };
  }
  routes.forEach((route) => addRoute(route));
  return {addRoute, resolve, removeRoute, getRoutes, getRecordMatcher};
}
function paramsFromLocation(params, keys) {
  let newParams = {};
  for (let key of keys) {
    if (key in params)
      newParams[key] = params[key];
  }
  return newParams;
}
function normalizeRouteRecord(record) {
  return {
    path: record.path,
    redirect: record.redirect,
    name: record.name,
    meta: record.meta || {},
    aliasOf: void 0,
    beforeEnter: record.beforeEnter,
    props: normalizeRecordProps(record),
    children: record.children || [],
    instances: {},
    leaveGuards: [],
    updateGuards: [],
    enterCallbacks: {},
    components: "components" in record ? record.components || {} : {default: record.component}
  };
}
function normalizeRecordProps(record) {
  const propsObject = {};
  const props = record.props || false;
  if ("component" in record) {
    propsObject.default = props;
  } else {
    for (let name in record.components)
      propsObject[name] = typeof props === "boolean" ? props : props[name];
  }
  return propsObject;
}
function isAliasRecord(record) {
  while (record) {
    if (record.record.aliasOf)
      return true;
    record = record.parent;
  }
  return false;
}
function mergeMetaFields(matched) {
  return matched.reduce((meta, record) => assign(meta, record.meta), {});
}
function mergeOptions(defaults, partialOptions) {
  let options = {};
  for (let key in defaults) {
    options[key] = key in partialOptions ? partialOptions[key] : defaults[key];
  }
  return options;
}
function isSameParam(a, b) {
  return a.name === b.name && a.optional === b.optional && a.repeatable === b.repeatable;
}
function checkSameParams(a, b) {
  for (let key of a.keys) {
    if (!b.keys.find(isSameParam.bind(null, key)))
      return warn(`Alias "${b.record.path}" and the original record: "${a.record.path}" should have the exact same param named "${key.name}"`);
  }
  for (let key of b.keys) {
    if (!a.keys.find(isSameParam.bind(null, key)))
      return warn(`Alias "${b.record.path}" and the original record: "${a.record.path}" should have the exact same param named "${key.name}"`);
  }
}
function checkMissingParamsInAbsolutePath(record, parent) {
  for (let key of parent.keys) {
    if (!record.keys.find(isSameParam.bind(null, key)))
      return warn(`Absolute path "${record.record.path}" should have the exact same param named "${key.name}" as its parent "${parent.record.path}".`);
  }
}
const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_BRACKET_OPEN_RE = /%5B/g;
const ENC_BRACKET_CLOSE_RE = /%5D/g;
const ENC_CARET_RE = /%5E/g;
const ENC_BACKTICK_RE = /%60/g;
const ENC_CURLY_OPEN_RE = /%7B/g;
const ENC_PIPE_RE = /%7C/g;
const ENC_CURLY_CLOSE_RE = /%7D/g;
const ENC_SPACE_RE = /%20/g;
function commonEncode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|").replace(ENC_BRACKET_OPEN_RE, "[").replace(ENC_BRACKET_CLOSE_RE, "]");
}
function encodeHash(text) {
  return commonEncode(text).replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
function encodeQueryValue(text) {
  return commonEncode(text).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return commonEncode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F");
}
function encodeParam(text) {
  return encodePath(text).replace(SLASH_RE, "%2F");
}
function decode(text) {
  try {
    return decodeURIComponent("" + text);
  } catch (err) {
    warn(`Error decoding "${text}". Using original value`);
  }
  return "" + text;
}
function parseQuery(search) {
  const query = {};
  if (search === "" || search === "?")
    return query;
  const hasLeadingIM = search[0] === "?";
  const searchParams = (hasLeadingIM ? search.slice(1) : search).split("&");
  for (let i = 0; i < searchParams.length; ++i) {
    const searchParam = searchParams[i].replace(PLUS_RE, " ");
    let eqPos = searchParam.indexOf("=");
    let key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos));
    let value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1));
    if (key in query) {
      let currentValue = query[key];
      if (!Array.isArray(currentValue)) {
        currentValue = query[key] = [currentValue];
      }
      currentValue.push(value);
    } else {
      query[key] = value;
    }
  }
  return query;
}
function stringifyQuery(query) {
  let search = "";
  for (let key in query) {
    if (search.length)
      search += "&";
    const value = query[key];
    key = encodeQueryKey(key);
    if (value == null) {
      if (value !== void 0)
        search += key;
      continue;
    }
    let values = Array.isArray(value) ? value.map((v) => v && encodeQueryValue(v)) : [value && encodeQueryValue(value)];
    for (let i = 0; i < values.length; i++) {
      search += (i ? "&" : "") + key;
      if (values[i] != null)
        search += "=" + values[i];
    }
  }
  return search;
}
function normalizeQuery(query) {
  const normalizedQuery = {};
  for (let key in query) {
    let value = query[key];
    if (value !== void 0) {
      normalizedQuery[key] = Array.isArray(value) ? value.map((v) => v == null ? null : "" + v) : value == null ? value : "" + value;
    }
  }
  return normalizedQuery;
}
function useCallbacks() {
  let handlers = [];
  function add(handler) {
    handlers.push(handler);
    return () => {
      const i = handlers.indexOf(handler);
      if (i > -1)
        handlers.splice(i, 1);
    };
  }
  function reset() {
    handlers = [];
  }
  return {
    add,
    list: () => handlers,
    reset
  };
}
function guardToPromiseFn(guard, to, from, record, name) {
  const enterCallbackArray = record && (record.enterCallbacks[name] = record.enterCallbacks[name] || []);
  return () => new Promise((resolve, reject) => {
    const next = (valid) => {
      if (valid === false)
        reject(createRouterError(4, {
          from,
          to
        }));
      else if (valid instanceof Error) {
        reject(valid);
      } else if (isRouteLocation(valid)) {
        reject(createRouterError(2, {
          from: to,
          to: valid
        }));
      } else {
        if (enterCallbackArray && record.enterCallbacks[name] === enterCallbackArray && typeof valid === "function")
          enterCallbackArray.push(valid);
        resolve();
      }
    };
    const guardReturn = guard.call(record && record.instances[name], to, from, canOnlyBeCalledOnce(next, to, from));
    let guardCall = Promise.resolve(guardReturn);
    if (guard.length < 3)
      guardCall = guardCall.then(next);
    if (guard.length > 2) {
      const message = `The "next" callback was never called inside of ${guard.name ? '"' + guard.name + '"' : ""}:
${guard.toString()}
. If you are returning a value instead of calling "next", make sure to remove the "next" parameter from your function.`;
      if (typeof guardReturn === "object" && "then" in guardReturn) {
        guardCall = guardCall.then((resolvedValue) => {
          if (!next._called) {
            warn(message);
            return Promise.reject(new Error("Invalid navigation guard"));
          }
          return resolvedValue;
        });
      } else if (guardReturn !== void 0) {
        if (!next._called) {
          warn(message);
          reject(new Error("Invalid navigation guard"));
          return;
        }
      }
    }
    guardCall.catch((err) => reject(err));
  });
}
function canOnlyBeCalledOnce(next, to, from) {
  let called = 0;
  return function() {
    if (called++ === 1)
      warn(`The "next" callback was called more than once in one navigation guard when going from "${from.fullPath}" to "${to.fullPath}". It should be called exactly one time in each navigation guard. This will fail in production.`);
    next._called = true;
    if (called === 1)
      next.apply(null, arguments);
  };
}
function extractComponentsGuards(matched, guardType, to, from) {
  const guards = [];
  for (const record of matched) {
    for (const name in record.components) {
      let rawComponent = record.components[name];
      {
        if (!rawComponent || typeof rawComponent !== "object" && typeof rawComponent !== "function") {
          warn(`Component "${name}" in record with path "${record.path}" is not a valid component. Received "${String(rawComponent)}".`);
          throw new Error("Invalid route component");
        } else if ("then" in rawComponent) {
          warn(`Component "${name}" in record with path "${record.path}" is a Promise instead of a function that returns a Promise. Did you write "import('./MyPage.vue')" instead of "() => import('./MyPage.vue')" ? This will break in production if not fixed.`);
          let promise = rawComponent;
          rawComponent = () => promise;
        }
      }
      if (guardType !== "beforeRouteEnter" && !record.instances[name])
        continue;
      if (isRouteComponent(rawComponent)) {
        let options = rawComponent.__vccOpts || rawComponent;
        const guard = options[guardType];
        guard && guards.push(guardToPromiseFn(guard, to, from, record, name));
      } else {
        let componentPromise = rawComponent();
        if (!("catch" in componentPromise)) {
          warn(`Component "${name}" in record with path "${record.path}" is a function that does not return a Promise. If you were passing a functional component, make sure to add a "displayName" to the component. This will break in production if not fixed.`);
          componentPromise = Promise.resolve(componentPromise);
        } else {
          componentPromise = componentPromise.catch((err) => err && warn(err));
        }
        guards.push(() => componentPromise.then((resolved) => {
          if (!resolved)
            return Promise.reject(new Error(`Couldn't resolve component "${name}" at "${record.path}"`));
          const resolvedComponent = isESModule(resolved) ? resolved.default : resolved;
          record.components[name] = resolvedComponent;
          const guard = resolvedComponent[guardType];
          return guard && guardToPromiseFn(guard, to, from, record, name)();
        }));
      }
    }
  }
  return guards;
}
function isRouteComponent(component2) {
  return typeof component2 === "object" || "displayName" in component2 || "props" in component2 || "__vccOpts" in component2;
}
function useLink(props) {
  const router = vue.inject(routerKey);
  const currentRoute = vue.inject(routeLocationKey);
  const route = vue.computed(() => router.resolve(vue.unref(props.to)));
  const activeRecordIndex = vue.computed(() => {
    let {matched} = route.value;
    let {length} = matched;
    const routeMatched = matched[length - 1];
    let currentMatched = currentRoute.matched;
    if (!routeMatched || !currentMatched.length)
      return -1;
    let index = currentMatched.findIndex(isSameRouteRecord.bind(null, routeMatched));
    if (index > -1)
      return index;
    let parentRecordPath = getOriginalPath(matched[length - 2]);
    return length > 1 && getOriginalPath(routeMatched) === parentRecordPath && currentMatched[currentMatched.length - 1].path !== parentRecordPath ? currentMatched.findIndex(isSameRouteRecord.bind(null, matched[length - 2])) : index;
  });
  const isActive = vue.computed(() => activeRecordIndex.value > -1 && includesParams(currentRoute.params, route.value.params));
  const isExactActive = vue.computed(() => activeRecordIndex.value > -1 && activeRecordIndex.value === currentRoute.matched.length - 1 && isSameRouteLocationParams(currentRoute.params, route.value.params));
  function navigate(e = {}) {
    if (guardEvent(e))
      return router[vue.unref(props.replace) ? "replace" : "push"](vue.unref(props.to));
    return Promise.resolve();
  }
  return {
    route,
    href: vue.computed(() => route.value.href),
    isActive,
    isExactActive,
    navigate
  };
}
const RouterLinkImpl = /* @__PURE__ */ vue.defineComponent({
  name: "RouterLink",
  props: {
    to: {
      type: [String, Object],
      required: true
    },
    activeClass: String,
    exactActiveClass: String,
    custom: Boolean,
    ariaCurrentValue: {
      type: String,
      default: "page"
    }
  },
  setup(props, {slots, attrs}) {
    const link = vue.reactive(useLink(props));
    const {options} = vue.inject(routerKey);
    const elClass = vue.computed(() => ({
      [getLinkClass(props.activeClass, options.linkActiveClass, "router-link-active")]: link.isActive,
      [getLinkClass(props.exactActiveClass, options.linkExactActiveClass, "router-link-exact-active")]: link.isExactActive
    }));
    return () => {
      const children = slots.default && slots.default(link);
      return props.custom ? children : vue.h("a", assign({
        "aria-current": link.isExactActive ? props.ariaCurrentValue : null,
        onClick: link.navigate,
        href: link.href
      }, attrs, {
        class: elClass.value
      }), children);
    };
  }
});
const RouterLink = RouterLinkImpl;
function guardEvent(e) {
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey)
    return;
  if (e.defaultPrevented)
    return;
  if (e.button !== void 0 && e.button !== 0)
    return;
  if (e.currentTarget && e.currentTarget.getAttribute) {
    const target = e.currentTarget.getAttribute("target");
    if (/\b_blank\b/i.test(target))
      return;
  }
  if (e.preventDefault)
    e.preventDefault();
  return true;
}
function includesParams(outer, inner) {
  for (let key in inner) {
    let innerValue = inner[key];
    let outerValue = outer[key];
    if (typeof innerValue === "string") {
      if (innerValue !== outerValue)
        return false;
    } else {
      if (!Array.isArray(outerValue) || outerValue.length !== innerValue.length || innerValue.some((value, i) => value !== outerValue[i]))
        return false;
    }
  }
  return true;
}
function getOriginalPath(record) {
  return record ? record.aliasOf ? record.aliasOf.path : record.path : "";
}
const getLinkClass = (propClass, globalClass, defaultClass) => propClass != null ? propClass : globalClass != null ? globalClass : defaultClass;
const RouterViewImpl = /* @__PURE__ */ vue.defineComponent({
  name: "RouterView",
  props: {
    name: {
      type: String,
      default: "default"
    },
    route: Object
  },
  setup(props, {attrs, slots}) {
    warnDeprecatedUsage();
    const injectedRoute = vue.inject(routeLocationKey);
    const depth = vue.inject(viewDepthKey, 0);
    const matchedRouteRef = vue.computed(() => (props.route || injectedRoute).matched[depth]);
    vue.provide(viewDepthKey, depth + 1);
    vue.provide(matchedRouteKey, matchedRouteRef);
    const viewRef = vue.ref();
    vue.watch(() => [viewRef.value, matchedRouteRef.value, props.name], ([instance, to, name], [oldInstance, from, oldName]) => {
      if (to) {
        to.instances[name] = instance;
        if (from && instance === oldInstance) {
          to.leaveGuards = from.leaveGuards;
          to.updateGuards = from.updateGuards;
        }
      }
      if (instance && to && (!from || !isSameRouteRecord(to, from) || !oldInstance)) {
        (to.enterCallbacks[name] || []).forEach((callback) => callback(instance));
      }
    }, {flush: "post"});
    return () => {
      const route = props.route || injectedRoute;
      const matchedRoute = matchedRouteRef.value;
      const ViewComponent = matchedRoute && matchedRoute.components[props.name];
      const currentName = props.name;
      if (!ViewComponent) {
        return slots.default ? slots.default({Component: ViewComponent, route}) : null;
      }
      const routePropsOption = matchedRoute.props[props.name];
      const routeProps = routePropsOption ? routePropsOption === true ? route.params : typeof routePropsOption === "function" ? routePropsOption(route) : routePropsOption : null;
      const onVnodeUnmounted = (vnode) => {
        if (vnode.component.isUnmounted) {
          matchedRoute.instances[currentName] = null;
        }
      };
      const component2 = vue.h(ViewComponent, assign({}, routeProps, attrs, {
        onVnodeUnmounted,
        ref: viewRef
      }));
      return slots.default ? slots.default({Component: component2, route}) : component2;
    };
  }
});
const RouterView = RouterViewImpl;
function warnDeprecatedUsage() {
  const instance = vue.getCurrentInstance();
  const parentName = instance.parent && instance.parent.type.name;
  if (parentName && (parentName === "KeepAlive" || parentName.includes("Transition"))) {
    const comp = parentName === "KeepAlive" ? "keep-alive" : "transition";
    warn(`<router-view> can no longer be used directly inside <transition> or <keep-alive>.
Use slot props instead:

<router-view v-slot="{ Component }">
  <${comp}>
    <component :is="Component" />
  </${comp}>
</router-view>`);
  }
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function createCommonjsModule(fn, basedir, module) {
  return module = {
    path: basedir,
    exports: {},
    require: function(path, base) {
      return commonjsRequire(path, base === void 0 || base === null ? module.path : base);
    }
  }, fn(module, module.exports), module.exports;
}
function commonjsRequire() {
  throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
var env = createCommonjsModule(function(module, exports2) {
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.hook = exports2.target = exports2.isBrowser = void 0;
  exports2.isBrowser = typeof navigator !== "undefined";
  exports2.target = exports2.isBrowser ? window : typeof commonjsGlobal !== "undefined" ? commonjsGlobal : {};
  exports2.hook = exports2.target.__VUE_DEVTOOLS_GLOBAL_HOOK__;
});
var _const = createCommonjsModule(function(module, exports2) {
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.ApiHookEvents = void 0;
  var ApiHookEvents;
  (function(ApiHookEvents2) {
    ApiHookEvents2["SETUP_DEVTOOLS_PLUGIN"] = "devtools-plugin:setup";
  })(ApiHookEvents = exports2.ApiHookEvents || (exports2.ApiHookEvents = {}));
});
var api = createCommonjsModule(function(module, exports2) {
  Object.defineProperty(exports2, "__esModule", {value: true});
});
var app = createCommonjsModule(function(module, exports2) {
  Object.defineProperty(exports2, "__esModule", {value: true});
});
var component = createCommonjsModule(function(module, exports2) {
  Object.defineProperty(exports2, "__esModule", {value: true});
});
var context = createCommonjsModule(function(module, exports2) {
  Object.defineProperty(exports2, "__esModule", {value: true});
});
var hooks = createCommonjsModule(function(module, exports2) {
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.Hooks = void 0;
  var Hooks;
  (function(Hooks2) {
    Hooks2["TRANSFORM_CALL"] = "transformCall";
    Hooks2["GET_APP_RECORD_NAME"] = "getAppRecordName";
    Hooks2["GET_APP_ROOT_INSTANCE"] = "getAppRootInstance";
    Hooks2["REGISTER_APPLICATION"] = "registerApplication";
    Hooks2["WALK_COMPONENT_TREE"] = "walkComponentTree";
    Hooks2["WALK_COMPONENT_PARENTS"] = "walkComponentParents";
    Hooks2["INSPECT_COMPONENT"] = "inspectComponent";
    Hooks2["GET_COMPONENT_BOUNDS"] = "getComponentBounds";
    Hooks2["GET_COMPONENT_NAME"] = "getComponentName";
    Hooks2["GET_ELEMENT_COMPONENT"] = "getElementComponent";
    Hooks2["GET_INSPECTOR_TREE"] = "getInspectorTree";
    Hooks2["GET_INSPECTOR_STATE"] = "getInspectorState";
  })(Hooks = exports2.Hooks || (exports2.Hooks = {}));
});
var api$1 = createCommonjsModule(function(module, exports2) {
  var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    Object.defineProperty(o, k2, {enumerable: true, get: function() {
      return m[k];
    }});
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports3) {
    for (var p in m)
      if (p !== "default" && !exports3.hasOwnProperty(p))
        __createBinding(exports3, m, p);
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  __exportStar(api, exports2);
  __exportStar(app, exports2);
  __exportStar(component, exports2);
  __exportStar(context, exports2);
  __exportStar(hooks, exports2);
});
var lib = createCommonjsModule(function(module, exports2) {
  var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    Object.defineProperty(o, k2, {enumerable: true, get: function() {
      return m[k];
    }});
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports3) {
    for (var p in m)
      if (p !== "default" && !exports3.hasOwnProperty(p))
        __createBinding(exports3, m, p);
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  exports2.setupDevtoolsPlugin = void 0;
  __exportStar(api$1, exports2);
  function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
    if (env.hook) {
      env.hook.emit(_const.ApiHookEvents.SETUP_DEVTOOLS_PLUGIN, pluginDescriptor, setupFn);
    } else {
      const list = env.target.__VUE_DEVTOOLS_PLUGINS__ = env.target.__VUE_DEVTOOLS_PLUGINS__ || [];
      list.push({
        pluginDescriptor,
        setupFn
      });
    }
  }
  exports2.setupDevtoolsPlugin = setupDevtoolsPlugin;
});
function formatRouteLocation(routeLocation, tooltip) {
  const copy = {
    ...routeLocation,
    matched: routeLocation.matched.map(({instances, children, aliasOf, ...rest}) => rest)
  };
  return {
    _custom: {
      type: null,
      readOnly: true,
      display: routeLocation.fullPath,
      tooltip,
      value: copy
    }
  };
}
function formatDisplay(display) {
  return {
    _custom: {
      display
    }
  };
}
let routerId = 0;
function addDevtools(app2, router, matcher) {
  const id = routerId++;
  lib.setupDevtoolsPlugin({
    id: "Router" + id ? " " + id : "",
    label: "Router devtools",
    app: app2
  }, (api2) => {
    api2.on.inspectComponent((payload, ctx) => {
      if (payload.instanceData) {
        payload.instanceData.state.push({
          type: "Routing",
          key: "$route",
          editable: false,
          value: formatRouteLocation(router.currentRoute.value, "Current Route")
        });
      }
    });
    vue.watch(router.currentRoute, () => {
      api2.notifyComponentUpdate();
    });
    const navigationsLayerId = "router:navigations:" + id;
    api2.addTimelineLayer({
      id: navigationsLayerId,
      label: `Router${id ? " " + id : ""} Navigations`,
      color: 4237508
    });
    router.onError((error) => {
      api2.addTimelineEvent({
        layerId: navigationsLayerId,
        event: {
          logType: "error",
          time: Date.now(),
          data: {error}
        }
      });
    });
    router.beforeEach((to, from) => {
      const data = {
        guard: formatDisplay("beforeEach"),
        from: formatRouteLocation(from, "Current Location during this navigation"),
        to: formatRouteLocation(to, "Target location")
      };
      api2.addTimelineEvent({
        layerId: navigationsLayerId,
        event: {
          time: Date.now(),
          meta: {},
          data
        }
      });
    });
    router.afterEach((to, from, failure) => {
      const data = {
        guard: formatDisplay("afterEach")
      };
      if (failure) {
        data.failure = {
          _custom: {
            type: Error,
            readOnly: true,
            display: failure ? failure.message : "",
            tooltip: "Navigation Failure",
            value: failure
          }
        };
        data.status = formatDisplay("\u274C");
      } else {
        data.status = formatDisplay("\u2705");
      }
      data.from = formatRouteLocation(from, "Current Location during this navigation");
      data.to = formatRouteLocation(to, "Target location");
      api2.addTimelineEvent({
        layerId: navigationsLayerId,
        event: {
          time: Date.now(),
          data,
          logType: failure ? "warning" : "default",
          meta: {}
        }
      });
    });
    const routerInspectorId = "router-inspector:" + id;
    api2.addInspector({
      id: routerInspectorId,
      label: "Routes" + (id ? " " + id : ""),
      icon: "book",
      treeFilterPlaceholder: "Search routes"
    });
    api2.on.getInspectorTree((payload) => {
      if (payload.app === app2 && payload.inspectorId === routerInspectorId) {
        let routes = matcher.getRoutes();
        if (payload.filter) {
          routes = routes.filter((route) => !route.parent && isRouteMatching(route, payload.filter.toLowerCase()));
        }
        if (!payload.filter) {
          routes.forEach((route) => {
            route.__vd_match = false;
          });
        }
        payload.rootNodes = routes.map(formatRouteRecordForInspector);
      }
    });
    api2.on.getInspectorState((payload) => {
      if (payload.app === app2 && payload.inspectorId === routerInspectorId) {
        const routes = matcher.getRoutes();
        const route = routes.find((route2) => route2.record.path === payload.nodeId);
        if (route) {
          payload.state = {
            options: formatRouteRecordMatcherForStateInspector(route)
          };
        }
      }
    });
  });
}
function modifierForKey(key) {
  if (key.optional) {
    return key.repeatable ? "*" : "?";
  } else {
    return key.repeatable ? "+" : "";
  }
}
function formatRouteRecordMatcherForStateInspector(route) {
  const {record} = route;
  const fields = [
    {editable: false, key: "path", value: record.path}
  ];
  if (record.name != null)
    fields.push({
      editable: false,
      key: "name",
      value: record.name
    });
  fields.push({editable: false, key: "regexp", value: route.re});
  if (route.keys.length)
    fields.push({
      editable: false,
      key: "keys",
      value: {
        _custom: {
          type: null,
          readOnly: true,
          display: route.keys.map((key) => `${key.name}${modifierForKey(key)}`).join(" "),
          tooltip: "Param keys",
          value: route.keys
        }
      }
    });
  if (record.redirect != null)
    fields.push({
      editable: false,
      key: "redirect",
      value: record.redirect
    });
  if (route.alias.length)
    fields.push({
      editable: false,
      key: "aliases",
      value: route.alias.map((alias) => alias.record.path)
    });
  fields.push({
    key: "score",
    editable: false,
    value: {
      _custom: {
        type: null,
        readOnly: true,
        display: route.score.map((score) => score.join(", ")).join(" | "),
        tooltip: "Score used to sort routes",
        value: route.score
      }
    }
  });
  return fields;
}
function formatRouteRecordForInspector(route) {
  const tags = [];
  const {record} = route;
  if (record.name != null) {
    tags.push({
      label: String(record.name),
      textColor: 0,
      backgroundColor: 48340
    });
  }
  if (record.aliasOf) {
    tags.push({
      label: "alias",
      textColor: 0,
      backgroundColor: 16750671
    });
  }
  if (route.__vd_match) {
    tags.push({
      label: "matches",
      textColor: 0,
      backgroundColor: 16053492
    });
  }
  if (record.redirect) {
    tags.push({
      label: "redirect: " + (typeof record.redirect === "string" ? record.redirect : "Object"),
      textColor: 16777215,
      backgroundColor: 6710886
    });
  }
  return {
    id: record.path,
    label: record.path,
    tags,
    children: route.children.map(formatRouteRecordForInspector)
  };
}
const EXTRACT_REGEXP_RE = /^\/(.*)\/([a-z]*)$/;
function isRouteMatching(route, filter) {
  const found = String(route.re).match(EXTRACT_REGEXP_RE);
  route.__vd_match = false;
  if (!found || found.length < 3)
    return false;
  const nonEndingRE = new RegExp(found[1].replace(/\$$/, ""), found[2]);
  if (nonEndingRE.test(filter)) {
    route.children.some((child) => isRouteMatching(child, filter));
    if (route.record.path !== "/" || filter === "/") {
      route.__vd_match = route.re.test(filter);
      return true;
    }
    return false;
  }
  const path = route.record.path.toLowerCase();
  const decodedPath = decode(path);
  if (!filter.startsWith("/") && (decodedPath.includes(filter) || path.includes(filter)))
    return true;
  if (decodedPath.startsWith(filter) || path.startsWith(filter))
    return true;
  if (route.record.name && String(route.record.name).includes(filter))
    return true;
  return route.children.some((child) => isRouteMatching(child, filter));
}
function createRouter(options) {
  const matcher = createRouterMatcher(options.routes, options);
  let parseQuery$1 = options.parseQuery || parseQuery;
  let stringifyQuery$1 = options.stringifyQuery || stringifyQuery;
  let {scrollBehavior} = options;
  let routerHistory = options.history;
  const beforeGuards = useCallbacks();
  const beforeResolveGuards = useCallbacks();
  const afterGuards = useCallbacks();
  const currentRoute = vue.shallowRef(START_LOCATION_NORMALIZED);
  let pendingLocation = START_LOCATION_NORMALIZED;
  if (isBrowser && scrollBehavior && "scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  const normalizeParams = applyToParams.bind(null, (paramValue) => "" + paramValue);
  const encodeParams = applyToParams.bind(null, encodeParam);
  const decodeParams = applyToParams.bind(null, decode);
  function addRoute(parentOrRoute, route) {
    let parent;
    let record;
    if (isRouteName(parentOrRoute)) {
      parent = matcher.getRecordMatcher(parentOrRoute);
      record = route;
    } else {
      record = parentOrRoute;
    }
    return matcher.addRoute(record, parent);
  }
  function removeRoute(name) {
    let recordMatcher = matcher.getRecordMatcher(name);
    if (recordMatcher) {
      matcher.removeRoute(recordMatcher);
    } else {
      warn(`Cannot remove non-existent route "${String(name)}"`);
    }
  }
  function getRoutes() {
    return matcher.getRoutes().map((routeMatcher) => routeMatcher.record);
  }
  function hasRoute(name) {
    return !!matcher.getRecordMatcher(name);
  }
  function resolve(rawLocation, currentLocation) {
    currentLocation = assign({}, currentLocation || currentRoute.value);
    if (typeof rawLocation === "string") {
      let locationNormalized = parseURL(parseQuery$1, rawLocation, currentLocation.path);
      let matchedRoute2 = matcher.resolve({path: locationNormalized.path}, currentLocation);
      let href2 = routerHistory.createHref(locationNormalized.fullPath);
      {
        if (href2.startsWith("//"))
          warn(`Location "${rawLocation}" resolved to "${href2}". A resolved location cannot start with multiple slashes.`);
        else if (!matchedRoute2.matched.length) {
          warn(`No match found for location with path "${rawLocation}"`);
        }
      }
      return assign(locationNormalized, matchedRoute2, {
        params: decodeParams(matchedRoute2.params),
        hash: decode(locationNormalized.hash),
        redirectedFrom: void 0,
        href: href2
      });
    }
    let matcherLocation;
    if ("path" in rawLocation) {
      if ("params" in rawLocation && !("name" in rawLocation) && Object.keys(rawLocation.params).length) {
        warn(`Path "${rawLocation.path}" was passed with params but they will be ignored. Use a named route alongside params instead.`);
      }
      matcherLocation = assign({}, rawLocation, {
        path: parseURL(parseQuery$1, rawLocation.path, currentLocation.path).path
      });
    } else {
      matcherLocation = assign({}, rawLocation, {
        params: encodeParams(rawLocation.params)
      });
      currentLocation.params = encodeParams(currentLocation.params);
    }
    let matchedRoute = matcher.resolve(matcherLocation, currentLocation);
    const hash = rawLocation.hash || "";
    if (hash && !hash.startsWith("#")) {
      warn(`A \`hash\` should always start with the character "#". Replace "${hash}" with "#${hash}".`);
    }
    matchedRoute.params = normalizeParams(decodeParams(matchedRoute.params));
    const fullPath = stringifyURL(stringifyQuery$1, assign({}, rawLocation, {
      hash: encodeHash(hash),
      path: matchedRoute.path
    }));
    let href = routerHistory.createHref(fullPath);
    {
      if (href.startsWith("//")) {
        warn(`Location "${rawLocation}" resolved to "${href}". A resolved location cannot start with multiple slashes.`);
      } else if (!matchedRoute.matched.length) {
        warn(`No match found for location with path "${"path" in rawLocation ? rawLocation.path : rawLocation}"`);
      }
    }
    return assign({
      fullPath,
      hash,
      query: stringifyQuery$1 === stringifyQuery ? normalizeQuery(rawLocation.query) : rawLocation.query
    }, matchedRoute, {
      redirectedFrom: void 0,
      href
    });
  }
  function locationAsObject(to) {
    return typeof to === "string" ? {path: to} : assign({}, to);
  }
  function checkCanceledNavigation(to, from) {
    if (pendingLocation !== to) {
      return createRouterError(8, {
        from,
        to
      });
    }
  }
  function push(to) {
    return pushWithRedirect(to);
  }
  function replace(to) {
    return push(assign(locationAsObject(to), {replace: true}));
  }
  function handleRedirectRecord(to) {
    const lastMatched = to.matched[to.matched.length - 1];
    if (lastMatched && lastMatched.redirect) {
      const {redirect} = lastMatched;
      let newTargetLocation = locationAsObject(typeof redirect === "function" ? redirect(to) : redirect);
      if (!("path" in newTargetLocation) && !("name" in newTargetLocation)) {
        warn(`Invalid redirect found:
${JSON.stringify(newTargetLocation, null, 2)}
 when navigating to "${to.fullPath}". A redirect must contain a name or path. This will break in production.`);
        throw new Error("Invalid redirect");
      }
      return assign({
        query: to.query,
        hash: to.hash,
        params: to.params
      }, newTargetLocation);
    }
  }
  function pushWithRedirect(to, redirectedFrom) {
    const targetLocation = pendingLocation = resolve(to);
    const from = currentRoute.value;
    const data = to.state;
    const force = to.force;
    const replace2 = to.replace === true;
    const shouldRedirect = handleRedirectRecord(targetLocation);
    if (shouldRedirect)
      return pushWithRedirect(assign(shouldRedirect, {state: data, force, replace: replace2}), redirectedFrom || targetLocation);
    const toLocation = targetLocation;
    toLocation.redirectedFrom = redirectedFrom;
    let failure;
    if (!force && isSameRouteLocation(stringifyQuery$1, from, targetLocation)) {
      failure = createRouterError(16, {to: toLocation, from});
      handleScroll(from, from, true, false);
    }
    return (failure ? Promise.resolve(failure) : navigate(toLocation, from)).catch((error) => isNavigationFailure(error) ? error : triggerError(error)).then((failure2) => {
      if (failure2) {
        if (isNavigationFailure(failure2, 2)) {
          if (isSameRouteLocation(stringifyQuery$1, resolve(failure2.to), toLocation) && redirectedFrom && (redirectedFrom._count = redirectedFrom._count ? redirectedFrom._count + 1 : 1) > 10) {
            warn(`Detected an infinite redirection in a navigation guard when going from "${from.fullPath}" to "${toLocation.fullPath}". Aborting to avoid a Stack Overflow. This will break in production if not fixed.`);
            return Promise.reject(new Error("Infinite redirect in navigation guard"));
          }
          return pushWithRedirect(assign(locationAsObject(failure2.to), {
            state: data,
            force,
            replace: replace2
          }), redirectedFrom || toLocation);
        }
      } else {
        failure2 = finalizeNavigation(toLocation, from, true, replace2, data);
      }
      triggerAfterEach(toLocation, from, failure2);
      return failure2;
    });
  }
  function checkCanceledNavigationAndReject(to, from) {
    const error = checkCanceledNavigation(to, from);
    return error ? Promise.reject(error) : Promise.resolve();
  }
  function navigate(to, from) {
    let guards;
    const [leavingRecords, updatingRecords, enteringRecords] = extractChangingRecords(to, from);
    guards = extractComponentsGuards(leavingRecords.reverse(), "beforeRouteLeave", to, from);
    for (const record of leavingRecords) {
      for (const guard of record.leaveGuards) {
        guards.push(guardToPromiseFn(guard, to, from));
      }
    }
    const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(null, to, from);
    guards.push(canceledNavigationCheck);
    return runGuardQueue(guards).then(() => {
      guards = [];
      for (const guard of beforeGuards.list()) {
        guards.push(guardToPromiseFn(guard, to, from));
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = extractComponentsGuards(updatingRecords, "beforeRouteUpdate", to, from);
      for (const record of updatingRecords) {
        for (const guard of record.updateGuards) {
          guards.push(guardToPromiseFn(guard, to, from));
        }
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = [];
      for (const record of to.matched) {
        if (record.beforeEnter && from.matched.indexOf(record) < 0) {
          if (Array.isArray(record.beforeEnter)) {
            for (const beforeEnter of record.beforeEnter)
              guards.push(guardToPromiseFn(beforeEnter, to, from));
          } else {
            guards.push(guardToPromiseFn(record.beforeEnter, to, from));
          }
        }
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      to.matched.forEach((record) => record.enterCallbacks = {});
      guards = extractComponentsGuards(enteringRecords, "beforeRouteEnter", to, from);
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).then(() => {
      guards = [];
      for (const guard of beforeResolveGuards.list()) {
        guards.push(guardToPromiseFn(guard, to, from));
      }
      guards.push(canceledNavigationCheck);
      return runGuardQueue(guards);
    }).catch((err) => isNavigationFailure(err, 8) ? err : Promise.reject(err));
  }
  function triggerAfterEach(to, from, failure) {
    for (const guard of afterGuards.list())
      guard(to, from, failure);
  }
  function finalizeNavigation(toLocation, from, isPush, replace2, data) {
    const error = checkCanceledNavigation(toLocation, from);
    if (error)
      return error;
    const isFirstNavigation = from === START_LOCATION_NORMALIZED;
    const state = !isBrowser ? {} : history.state;
    if (isPush) {
      if (replace2 || isFirstNavigation)
        routerHistory.replace(toLocation.fullPath, assign({
          scroll: isFirstNavigation && state && state.scroll
        }, data));
      else
        routerHistory.push(toLocation.fullPath, data);
    }
    currentRoute.value = toLocation;
    handleScroll(toLocation, from, isPush, isFirstNavigation);
    markAsReady();
  }
  let removeHistoryListener;
  function setupListeners() {
    removeHistoryListener = routerHistory.listen((to, _from, info) => {
      let toLocation = resolve(to);
      const shouldRedirect = handleRedirectRecord(toLocation);
      if (shouldRedirect) {
        pushWithRedirect(assign(shouldRedirect, {replace: true}), toLocation).catch(noop);
        return;
      }
      pendingLocation = toLocation;
      const from = currentRoute.value;
      if (isBrowser) {
        saveScrollPosition(getScrollKey(from.fullPath, info.delta), computeScrollPosition());
      }
      navigate(toLocation, from).catch((error) => {
        if (isNavigationFailure(error, 4 | 8)) {
          return error;
        }
        if (isNavigationFailure(error, 2)) {
          if (info.delta)
            routerHistory.go(-info.delta, false);
          pushWithRedirect(error.to, toLocation).catch(noop);
          return Promise.reject();
        }
        if (info.delta)
          routerHistory.go(-info.delta, false);
        return triggerError(error);
      }).then((failure) => {
        failure = failure || finalizeNavigation(toLocation, from, false);
        if (failure && info.delta)
          routerHistory.go(-info.delta, false);
        triggerAfterEach(toLocation, from, failure);
      }).catch(noop);
    });
  }
  let readyHandlers = useCallbacks();
  let errorHandlers = useCallbacks();
  let ready;
  function triggerError(error) {
    markAsReady(error);
    errorHandlers.list().forEach((handler) => handler(error));
    return Promise.reject(error);
  }
  function isReady() {
    if (ready && currentRoute.value !== START_LOCATION_NORMALIZED)
      return Promise.resolve();
    return new Promise((resolve2, reject) => {
      readyHandlers.add([resolve2, reject]);
    });
  }
  function markAsReady(err) {
    if (ready)
      return;
    ready = true;
    setupListeners();
    readyHandlers.list().forEach(([resolve2, reject]) => err ? reject(err) : resolve2());
    readyHandlers.reset();
  }
  function handleScroll(to, from, isPush, isFirstNavigation) {
    if (!isBrowser || !scrollBehavior)
      return Promise.resolve();
    let scrollPosition = !isPush && getSavedScrollPosition(getScrollKey(to.fullPath, 0)) || (isFirstNavigation || !isPush) && history.state && history.state.scroll || null;
    return vue.nextTick().then(() => scrollBehavior(to, from, scrollPosition)).then((position) => position && scrollToPosition(position)).catch(triggerError);
  }
  const go = (delta) => routerHistory.go(delta);
  let started;
  const installedApps = new Set();
  const router = {
    currentRoute,
    addRoute,
    removeRoute,
    hasRoute,
    getRoutes,
    resolve,
    options,
    push,
    replace,
    go,
    back: () => go(-1),
    forward: () => go(1),
    beforeEach: beforeGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterGuards.add,
    onError: errorHandlers.add,
    isReady,
    install(app2) {
      const router2 = this;
      app2.component("RouterLink", RouterLink);
      app2.component("RouterView", RouterView);
      app2.config.globalProperties.$router = router2;
      Object.defineProperty(app2.config.globalProperties, "$route", {
        get: () => vue.unref(currentRoute)
      });
      if (isBrowser && !started && currentRoute.value === START_LOCATION_NORMALIZED) {
        started = true;
        push(routerHistory.location).catch((err) => {
          warn("Unexpected error when starting the router:", err);
        });
      }
      const reactiveRoute = {};
      for (let key in START_LOCATION_NORMALIZED) {
        reactiveRoute[key] = vue.computed(() => currentRoute.value[key]);
      }
      app2.provide(routerKey, router2);
      app2.provide(routeLocationKey, vue.reactive(reactiveRoute));
      let unmountApp = app2.unmount;
      installedApps.add(app2);
      app2.unmount = function() {
        installedApps.delete(app2);
        if (installedApps.size < 1) {
          removeHistoryListener();
          currentRoute.value = START_LOCATION_NORMALIZED;
          started = false;
          ready = false;
        }
        unmountApp.call(this, arguments);
      };
      {
        addDevtools(app2, router2, matcher);
      }
    }
  };
  return router;
}
function runGuardQueue(guards) {
  return guards.reduce((promise, guard) => promise.then(() => guard()), Promise.resolve());
}
function extractChangingRecords(to, from) {
  const leavingRecords = [];
  const updatingRecords = [];
  const enteringRecords = [];
  const len = Math.max(from.matched.length, to.matched.length);
  for (let i = 0; i < len; i++) {
    const recordFrom = from.matched[i];
    if (recordFrom) {
      if (to.matched.indexOf(recordFrom) < 0)
        leavingRecords.push(recordFrom);
      else
        updatingRecords.push(recordFrom);
    }
    const recordTo = to.matched[i];
    if (recordTo) {
      if (from.matched.indexOf(recordTo) < 0)
        enteringRecords.push(recordTo);
    }
  }
  return [leavingRecords, updatingRecords, enteringRecords];
}
var script = {
  name: "Homepage"
};
function ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<!--[--><h1>This is the homepage</h1><p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper felis a odio facilisis maximus. Pellentesque congue sapien mauris, vel pretium nunc efficitur eget. Proin diam libero, accumsan in nibh id, consectetur ultricies erat. Duis vel vehicula erat, mollis euismod turpis. Vestibulum nunc justo, vestibulum quis metus tempor, condimentum rutrum massa. Ut in fringilla dui, eget venenatis turpis. Nulla at ipsum a dui euismod fermentum. Proin iaculis turpis iaculis augue sollicitudin, sit amet congue augue mollis. Sed id lectus elit. Mauris sem neque, aliquet sit amet congue quis, varius vitae orci. Mauris tincidunt nulla libero, eu mattis eros aliquet eget. Ut neque est, rutrum eget libero vel, pulvinar cursus neque. Sed posuere neque ligula, ut imperdiet magna semper ac. Sed fermentum eros sed cursus pulvinar. Pellentesque nec hendrerit dolor. Quisque consectetur nec nulla imperdiet eleifend. Suspendisse eget tempus velit, vel interdum orci. Nunc nec rutrum lectus. Nullam semper pulvinar velit vitae pellentesque. In pellentesque, ligula eu suscipit facilisis, purus purus cursus erat, ut luctus est metus vitae lacus. Nam molestie lorem nec massa dignissim, eu malesuada mauris laoreet. Nulla volutpat tempor magna a pulvinar. Donec lobortis enim et porta eleifend. Pellentesque a egestas diam. Phasellus vestibulum sed eros id efficitur. Curabitur sodales blandit laoreet. Maecenas varius ante turpis, eu finibus magna varius nec. Curabitur vehicula purus ligula, a volutpat ligula viverra at. Phasellus volutpat a magna et maximus. Nunc condimentum, est at tempus luctus, massa metus feugiat erat, eget dapibus velit est at augue. Aliquam quis tempus tellus. Sed efficitur sollicitudin finibus. Pellentesque mattis risus fringilla velit dignissim ullamcorper. Suspendisse sed dignissim est, ultricies faucibus turpis. Cras ultrices convallis nisl. Duis ultricies volutpat odio eu fermentum. Pellentesque vel urna vitae lacus feugiat dignissim eget sed enim. Fusce sed lorem velit. Phasellus eleifend porttitor ante, non vehicula nulla congue id. Pellentesque ut turpis scelerisque, varius odio sed, egestas dolor. Phasellus porttitor quam vel ligula scelerisque semper. Morbi placerat a dui id interdum. Duis cursus molestie ex, vitae vulputate justo ullamcorper quis. Aenean ullamcorper orci et auctor malesuada. Cras eget convallis tortor. Nunc at ante maximus, ultrices quam et, aliquet sem. Curabitur urna erat, ultrices nec hendrerit vel, aliquam nec nisl. Nunc a arcu congue, bibendum erat sit amet, lobortis purus. In at elit viverra, maximus dolor sed, eleifend nisl. Aliquam feugiat lectus neque. Aliquam posuere pulvinar lorem eu iaculis. Morbi iaculis tristique ultricies. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Etiam ac orci nec lacus rhoncus blandit eget et diam. Donec libero odio, tincidunt id posuere eget, tempor quis magna. Nulla consectetur tellus vitae odio commodo, a molestie metus dignissim. Maecenas consectetur euismod mauris. Ut sapien nulla, ullamcorper quis fermentum ac, auctor sit amet dolor. Aenean molestie lobortis convallis. Praesent ultrices ex risus, at imperdiet tellus ullamcorper a. Nulla mollis malesuada sapien, quis consequat nulla placerat eget. Etiam ac scelerisque augue. Nullam ullamcorper dapibus lorem, ac pretium quam maximus a. </p><p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper felis a odio facilisis maximus. Pellentesque congue sapien mauris, vel pretium nunc efficitur eget. Proin diam libero, accumsan in nibh id, consectetur ultricies erat. Duis vel vehicula erat, mollis euismod turpis. Vestibulum nunc justo, vestibulum quis metus tempor, condimentum rutrum massa. Ut in fringilla dui, eget venenatis turpis. Nulla at ipsum a dui euismod fermentum. Proin iaculis turpis iaculis augue sollicitudin, sit amet congue augue mollis. Sed id lectus elit. Mauris sem neque, aliquet sit amet congue quis, varius vitae orci. Mauris tincidunt nulla libero, eu mattis eros aliquet eget. Ut neque est, rutrum eget libero vel, pulvinar cursus neque. Sed posuere neque ligula, ut imperdiet magna semper ac. Sed fermentum eros sed cursus pulvinar. Pellentesque nec hendrerit dolor. Quisque consectetur nec nulla imperdiet eleifend. Suspendisse eget tempus velit, vel interdum orci. Nunc nec rutrum lectus. Nullam semper pulvinar velit vitae pellentesque. In pellentesque, ligula eu suscipit facilisis, purus purus cursus erat, ut luctus est metus vitae lacus. Nam molestie lorem nec massa dignissim, eu malesuada mauris laoreet. Nulla volutpat tempor magna a pulvinar. Donec lobortis enim et porta eleifend. Pellentesque a egestas diam. Phasellus vestibulum sed eros id efficitur. Curabitur sodales blandit laoreet. Maecenas varius ante turpis, eu finibus magna varius nec. Curabitur vehicula purus ligula, a volutpat ligula viverra at. Phasellus volutpat a magna et maximus. Nunc condimentum, est at tempus luctus, massa metus feugiat erat, eget dapibus velit est at augue. Aliquam quis tempus tellus. Sed efficitur sollicitudin finibus. Pellentesque mattis risus fringilla velit dignissim ullamcorper. Suspendisse sed dignissim est, ultricies faucibus turpis. Cras ultrices convallis nisl. Duis ultricies volutpat odio eu fermentum. Pellentesque vel urna vitae lacus feugiat dignissim eget sed enim. Fusce sed lorem velit. Phasellus eleifend porttitor ante, non vehicula nulla congue id. Pellentesque ut turpis scelerisque, varius odio sed, egestas dolor. Phasellus porttitor quam vel ligula scelerisque semper. Morbi placerat a dui id interdum. Duis cursus molestie ex, vitae vulputate justo ullamcorper quis. Aenean ullamcorper orci et auctor malesuada. Cras eget convallis tortor. Nunc at ante maximus, ultrices quam et, aliquet sem. Curabitur urna erat, ultrices nec hendrerit vel, aliquam nec nisl. Nunc a arcu congue, bibendum erat sit amet, lobortis purus. In at elit viverra, maximus dolor sed, eleifend nisl. Aliquam feugiat lectus neque. Aliquam posuere pulvinar lorem eu iaculis. Morbi iaculis tristique ultricies. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Etiam ac orci nec lacus rhoncus blandit eget et diam. Donec libero odio, tincidunt id posuere eget, tempor quis magna. Nulla consectetur tellus vitae odio commodo, a molestie metus dignissim. Maecenas consectetur euismod mauris. Ut sapien nulla, ullamcorper quis fermentum ac, auctor sit amet dolor. Aenean molestie lobortis convallis. Praesent ultrices ex risus, at imperdiet tellus ullamcorper a. Nulla mollis malesuada sapien, quis consequat nulla placerat eget. Etiam ac scelerisque augue. Nullam ullamcorper dapibus lorem, ac pretium quam maximus a. </p><p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper felis a odio facilisis maximus. Pellentesque congue sapien mauris, vel pretium nunc efficitur eget. Proin diam libero, accumsan in nibh id, consectetur ultricies erat. Duis vel vehicula erat, mollis euismod turpis. Vestibulum nunc justo, vestibulum quis metus tempor, condimentum rutrum massa. Ut in fringilla dui, eget venenatis turpis. Nulla at ipsum a dui euismod fermentum. Proin iaculis turpis iaculis augue sollicitudin, sit amet congue augue mollis. Sed id lectus elit. Mauris sem neque, aliquet sit amet congue quis, varius vitae orci. Mauris tincidunt nulla libero, eu mattis eros aliquet eget. Ut neque est, rutrum eget libero vel, pulvinar cursus neque. Sed posuere neque ligula, ut imperdiet magna semper ac. Sed fermentum eros sed cursus pulvinar. Pellentesque nec hendrerit dolor. Quisque consectetur nec nulla imperdiet eleifend. Suspendisse eget tempus velit, vel interdum orci. Nunc nec rutrum lectus. Nullam semper pulvinar velit vitae pellentesque. In pellentesque, ligula eu suscipit facilisis, purus purus cursus erat, ut luctus est metus vitae lacus. Nam molestie lorem nec massa dignissim, eu malesuada mauris laoreet. Nulla volutpat tempor magna a pulvinar. Donec lobortis enim et porta eleifend. Pellentesque a egestas diam. Phasellus vestibulum sed eros id efficitur. Curabitur sodales blandit laoreet. Maecenas varius ante turpis, eu finibus magna varius nec. Curabitur vehicula purus ligula, a volutpat ligula viverra at. Phasellus volutpat a magna et maximus. Nunc condimentum, est at tempus luctus, massa metus feugiat erat, eget dapibus velit est at augue. Aliquam quis tempus tellus. Sed efficitur sollicitudin finibus. Pellentesque mattis risus fringilla velit dignissim ullamcorper. Suspendisse sed dignissim est, ultricies faucibus turpis. Cras ultrices convallis nisl. Duis ultricies volutpat odio eu fermentum. Pellentesque vel urna vitae lacus feugiat dignissim eget sed enim. Fusce sed lorem velit. Phasellus eleifend porttitor ante, non vehicula nulla congue id. Pellentesque ut turpis scelerisque, varius odio sed, egestas dolor. Phasellus porttitor quam vel ligula scelerisque semper. Morbi placerat a dui id interdum. Duis cursus molestie ex, vitae vulputate justo ullamcorper quis. Aenean ullamcorper orci et auctor malesuada. Cras eget convallis tortor. Nunc at ante maximus, ultrices quam et, aliquet sem. Curabitur urna erat, ultrices nec hendrerit vel, aliquam nec nisl. Nunc a arcu congue, bibendum erat sit amet, lobortis purus. In at elit viverra, maximus dolor sed, eleifend nisl. Aliquam feugiat lectus neque. Aliquam posuere pulvinar lorem eu iaculis. Morbi iaculis tristique ultricies. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Etiam ac orci nec lacus rhoncus blandit eget et diam. Donec libero odio, tincidunt id posuere eget, tempor quis magna. Nulla consectetur tellus vitae odio commodo, a molestie metus dignissim. Maecenas consectetur euismod mauris. Ut sapien nulla, ullamcorper quis fermentum ac, auctor sit amet dolor. Aenean molestie lobortis convallis. Praesent ultrices ex risus, at imperdiet tellus ullamcorper a. Nulla mollis malesuada sapien, quis consequat nulla placerat eget. Etiam ac scelerisque augue. Nullam ullamcorper dapibus lorem, ac pretium quam maximus a. </p><p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper felis a odio facilisis maximus. Pellentesque congue sapien mauris, vel pretium nunc efficitur eget. Proin diam libero, accumsan in nibh id, consectetur ultricies erat. Duis vel vehicula erat, mollis euismod turpis. Vestibulum nunc justo, vestibulum quis metus tempor, condimentum rutrum massa. Ut in fringilla dui, eget venenatis turpis. Nulla at ipsum a dui euismod fermentum. Proin iaculis turpis iaculis augue sollicitudin, sit amet congue augue mollis. Sed id lectus elit. Mauris sem neque, aliquet sit amet congue quis, varius vitae orci. Mauris tincidunt nulla libero, eu mattis eros aliquet eget. Ut neque est, rutrum eget libero vel, pulvinar cursus neque. Sed posuere neque ligula, ut imperdiet magna semper ac. Sed fermentum eros sed cursus pulvinar. Pellentesque nec hendrerit dolor. Quisque consectetur nec nulla imperdiet eleifend. Suspendisse eget tempus velit, vel interdum orci. Nunc nec rutrum lectus. Nullam semper pulvinar velit vitae pellentesque. In pellentesque, ligula eu suscipit facilisis, purus purus cursus erat, ut luctus est metus vitae lacus. Nam molestie lorem nec massa dignissim, eu malesuada mauris laoreet. Nulla volutpat tempor magna a pulvinar. Donec lobortis enim et porta eleifend. Pellentesque a egestas diam. Phasellus vestibulum sed eros id efficitur. Curabitur sodales blandit laoreet. Maecenas varius ante turpis, eu finibus magna varius nec. Curabitur vehicula purus ligula, a volutpat ligula viverra at. Phasellus volutpat a magna et maximus. Nunc condimentum, est at tempus luctus, massa metus feugiat erat, eget dapibus velit est at augue. Aliquam quis tempus tellus. Sed efficitur sollicitudin finibus. Pellentesque mattis risus fringilla velit dignissim ullamcorper. Suspendisse sed dignissim est, ultricies faucibus turpis. Cras ultrices convallis nisl. Duis ultricies volutpat odio eu fermentum. Pellentesque vel urna vitae lacus feugiat dignissim eget sed enim. Fusce sed lorem velit. Phasellus eleifend porttitor ante, non vehicula nulla congue id. Pellentesque ut turpis scelerisque, varius odio sed, egestas dolor. Phasellus porttitor quam vel ligula scelerisque semper. Morbi placerat a dui id interdum. Duis cursus molestie ex, vitae vulputate justo ullamcorper quis. Aenean ullamcorper orci et auctor malesuada. Cras eget convallis tortor. Nunc at ante maximus, ultrices quam et, aliquet sem. Curabitur urna erat, ultrices nec hendrerit vel, aliquam nec nisl. Nunc a arcu congue, bibendum erat sit amet, lobortis purus. In at elit viverra, maximus dolor sed, eleifend nisl. Aliquam feugiat lectus neque. Aliquam posuere pulvinar lorem eu iaculis. Morbi iaculis tristique ultricies. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Etiam ac orci nec lacus rhoncus blandit eget et diam. Donec libero odio, tincidunt id posuere eget, tempor quis magna. Nulla consectetur tellus vitae odio commodo, a molestie metus dignissim. Maecenas consectetur euismod mauris. Ut sapien nulla, ullamcorper quis fermentum ac, auctor sit amet dolor. Aenean molestie lobortis convallis. Praesent ultrices ex risus, at imperdiet tellus ullamcorper a. Nulla mollis malesuada sapien, quis consequat nulla placerat eget. Etiam ac scelerisque augue. Nullam ullamcorper dapibus lorem, ac pretium quam maximus a. </p><p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper felis a odio facilisis maximus. Pellentesque congue sapien mauris, vel pretium nunc efficitur eget. Proin diam libero, accumsan in nibh id, consectetur ultricies erat. Duis vel vehicula erat, mollis euismod turpis. Vestibulum nunc justo, vestibulum quis metus tempor, condimentum rutrum massa. Ut in fringilla dui, eget venenatis turpis. Nulla at ipsum a dui euismod fermentum. Proin iaculis turpis iaculis augue sollicitudin, sit amet congue augue mollis. Sed id lectus elit. Mauris sem neque, aliquet sit amet congue quis, varius vitae orci. Mauris tincidunt nulla libero, eu mattis eros aliquet eget. Ut neque est, rutrum eget libero vel, pulvinar cursus neque. Sed posuere neque ligula, ut imperdiet magna semper ac. Sed fermentum eros sed cursus pulvinar. Pellentesque nec hendrerit dolor. Quisque consectetur nec nulla imperdiet eleifend. Suspendisse eget tempus velit, vel interdum orci. Nunc nec rutrum lectus. Nullam semper pulvinar velit vitae pellentesque. In pellentesque, ligula eu suscipit facilisis, purus purus cursus erat, ut luctus est metus vitae lacus. Nam molestie lorem nec massa dignissim, eu malesuada mauris laoreet. Nulla volutpat tempor magna a pulvinar. Donec lobortis enim et porta eleifend. Pellentesque a egestas diam. Phasellus vestibulum sed eros id efficitur. Curabitur sodales blandit laoreet. Maecenas varius ante turpis, eu finibus magna varius nec. Curabitur vehicula purus ligula, a volutpat ligula viverra at. Phasellus volutpat a magna et maximus. Nunc condimentum, est at tempus luctus, massa metus feugiat erat, eget dapibus velit est at augue. Aliquam quis tempus tellus. Sed efficitur sollicitudin finibus. Pellentesque mattis risus fringilla velit dignissim ullamcorper. Suspendisse sed dignissim est, ultricies faucibus turpis. Cras ultrices convallis nisl. Duis ultricies volutpat odio eu fermentum. Pellentesque vel urna vitae lacus feugiat dignissim eget sed enim. Fusce sed lorem velit. Phasellus eleifend porttitor ante, non vehicula nulla congue id. Pellentesque ut turpis scelerisque, varius odio sed, egestas dolor. Phasellus porttitor quam vel ligula scelerisque semper. Morbi placerat a dui id interdum. Duis cursus molestie ex, vitae vulputate justo ullamcorper quis. Aenean ullamcorper orci et auctor malesuada. Cras eget convallis tortor. Nunc at ante maximus, ultrices quam et, aliquet sem. Curabitur urna erat, ultrices nec hendrerit vel, aliquam nec nisl. Nunc a arcu congue, bibendum erat sit amet, lobortis purus. In at elit viverra, maximus dolor sed, eleifend nisl. Aliquam feugiat lectus neque. Aliquam posuere pulvinar lorem eu iaculis. Morbi iaculis tristique ultricies. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Etiam ac orci nec lacus rhoncus blandit eget et diam. Donec libero odio, tincidunt id posuere eget, tempor quis magna. Nulla consectetur tellus vitae odio commodo, a molestie metus dignissim. Maecenas consectetur euismod mauris. Ut sapien nulla, ullamcorper quis fermentum ac, auctor sit amet dolor. Aenean molestie lobortis convallis. Praesent ultrices ex risus, at imperdiet tellus ullamcorper a. Nulla mollis malesuada sapien, quis consequat nulla placerat eget. Etiam ac scelerisque augue. Nullam ullamcorper dapibus lorem, ac pretium quam maximus a. </p><!--]-->`);
}
script.ssrRender = ssrRender;
script.__file = "components/Homepage.vue";
var script$1 = {
  name: "PageA",
  props: {
    msg: String
  },
  mounted() {
    this.randomNumber = Math.random();
  },
  data() {
    return {
      randomNumber: 0,
      initialized: false,
      count: 0
    };
  }
};
function ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<!--[--><h1>Page A</h1><p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper felis a odio facilisis maximus. Pellentesque congue sapien mauris, vel pretium nunc efficitur eget. Proin diam libero, accumsan in nibh id, consectetur ultricies erat. Duis vel vehicula erat, mollis euismod turpis. Vestibulum nunc justo, vestibulum quis metus tempor, condimentum rutrum massa. Ut in fringilla dui, eget venenatis turpis. Nulla at ipsum a dui euismod fermentum. Proin iaculis turpis iaculis augue sollicitudin, sit amet congue augue mollis. Sed id lectus elit. Mauris sem neque, aliquet sit amet congue quis, varius vitae orci. Mauris tincidunt nulla libero, eu mattis eros aliquet eget. Ut neque est, rutrum eget libero vel, pulvinar cursus neque. Sed posuere neque ligula, ut imperdiet magna semper ac. Sed fermentum eros sed cursus pulvinar. Pellentesque nec hendrerit dolor. Quisque consectetur nec nulla imperdiet eleifend. Suspendisse eget tempus velit, vel interdum orci. Nunc nec rutrum lectus. Nullam semper pulvinar velit vitae pellentesque. In pellentesque, ligula eu suscipit facilisis, purus purus cursus erat, ut luctus est metus vitae lacus. Nam molestie lorem nec massa dignissim, eu malesuada mauris laoreet. Nulla volutpat tempor magna a pulvinar. Donec lobortis enim et porta eleifend. Pellentesque a egestas diam. Phasellus vestibulum sed eros id efficitur. Curabitur sodales blandit laoreet. Maecenas varius ante turpis, eu finibus magna varius nec. Curabitur vehicula purus ligula, a volutpat ligula viverra at. Phasellus volutpat a magna et maximus. Nunc condimentum, est at tempus luctus, massa metus feugiat erat, eget dapibus velit est at augue. Aliquam quis tempus tellus. Sed efficitur sollicitudin finibus. Pellentesque mattis risus fringilla velit dignissim ullamcorper. Suspendisse sed dignissim est, ultricies faucibus turpis. Cras ultrices convallis nisl. Duis ultricies volutpat odio eu fermentum. Pellentesque vel urna vitae lacus feugiat dignissim eget sed enim. Fusce sed lorem velit. Phasellus eleifend porttitor ante, non vehicula nulla congue id. Pellentesque ut turpis scelerisque, varius odio sed, egestas dolor. Phasellus porttitor quam vel ligula scelerisque semper. Morbi placerat a dui id interdum. Duis cursus molestie ex, vitae vulputate justo ullamcorper quis. Aenean ullamcorper orci et auctor malesuada. Cras eget convallis tortor. Nunc at ante maximus, ultrices quam et, aliquet sem. Curabitur urna erat, ultrices nec hendrerit vel, aliquam nec nisl. Nunc a arcu congue, bibendum erat sit amet, lobortis purus. In at elit viverra, maximus dolor sed, eleifend nisl. Aliquam feugiat lectus neque. Aliquam posuere pulvinar lorem eu iaculis. Morbi iaculis tristique ultricies. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Etiam ac orci nec lacus rhoncus blandit eget et diam. Donec libero odio, tincidunt id posuere eget, tempor quis magna. Nulla consectetur tellus vitae odio commodo, a molestie metus dignissim. Maecenas consectetur euismod mauris. Ut sapien nulla, ullamcorper quis fermentum ac, auctor sit amet dolor. Aenean molestie lobortis convallis. Praesent ultrices ex risus, at imperdiet tellus ullamcorper a. Nulla mollis malesuada sapien, quis consequat nulla placerat eget. Etiam ac scelerisque augue. Nullam ullamcorper dapibus lorem, ac pretium quam maximus a. </p><p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper felis a odio facilisis maximus. Pellentesque congue sapien mauris, vel pretium nunc efficitur eget. Proin diam libero, accumsan in nibh id, consectetur ultricies erat. Duis vel vehicula erat, mollis euismod turpis. Vestibulum nunc justo, vestibulum quis metus tempor, condimentum rutrum massa. Ut in fringilla dui, eget venenatis turpis. Nulla at ipsum a dui euismod fermentum. Proin iaculis turpis iaculis augue sollicitudin, sit amet congue augue mollis. Sed id lectus elit. Mauris sem neque, aliquet sit amet congue quis, varius vitae orci. Mauris tincidunt nulla libero, eu mattis eros aliquet eget. Ut neque est, rutrum eget libero vel, pulvinar cursus neque. Sed posuere neque ligula, ut imperdiet magna semper ac. Sed fermentum eros sed cursus pulvinar. Pellentesque nec hendrerit dolor. Quisque consectetur nec nulla imperdiet eleifend. Suspendisse eget tempus velit, vel interdum orci. Nunc nec rutrum lectus. Nullam semper pulvinar velit vitae pellentesque. In pellentesque, ligula eu suscipit facilisis, purus purus cursus erat, ut luctus est metus vitae lacus. Nam molestie lorem nec massa dignissim, eu malesuada mauris laoreet. Nulla volutpat tempor magna a pulvinar. Donec lobortis enim et porta eleifend. Pellentesque a egestas diam. Phasellus vestibulum sed eros id efficitur. Curabitur sodales blandit laoreet. Maecenas varius ante turpis, eu finibus magna varius nec. Curabitur vehicula purus ligula, a volutpat ligula viverra at. Phasellus volutpat a magna et maximus. Nunc condimentum, est at tempus luctus, massa metus feugiat erat, eget dapibus velit est at augue. Aliquam quis tempus tellus. Sed efficitur sollicitudin finibus. Pellentesque mattis risus fringilla velit dignissim ullamcorper. Suspendisse sed dignissim est, ultricies faucibus turpis. Cras ultrices convallis nisl. Duis ultricies volutpat odio eu fermentum. Pellentesque vel urna vitae lacus feugiat dignissim eget sed enim. Fusce sed lorem velit. Phasellus eleifend porttitor ante, non vehicula nulla congue id. Pellentesque ut turpis scelerisque, varius odio sed, egestas dolor. Phasellus porttitor quam vel ligula scelerisque semper. Morbi placerat a dui id interdum. Duis cursus molestie ex, vitae vulputate justo ullamcorper quis. Aenean ullamcorper orci et auctor malesuada. Cras eget convallis tortor. Nunc at ante maximus, ultrices quam et, aliquet sem. Curabitur urna erat, ultrices nec hendrerit vel, aliquam nec nisl. Nunc a arcu congue, bibendum erat sit amet, lobortis purus. In at elit viverra, maximus dolor sed, eleifend nisl. Aliquam feugiat lectus neque. Aliquam posuere pulvinar lorem eu iaculis. Morbi iaculis tristique ultricies. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Etiam ac orci nec lacus rhoncus blandit eget et diam. Donec libero odio, tincidunt id posuere eget, tempor quis magna. Nulla consectetur tellus vitae odio commodo, a molestie metus dignissim. Maecenas consectetur euismod mauris. Ut sapien nulla, ullamcorper quis fermentum ac, auctor sit amet dolor. Aenean molestie lobortis convallis. Praesent ultrices ex risus, at imperdiet tellus ullamcorper a. Nulla mollis malesuada sapien, quis consequat nulla placerat eget. Etiam ac scelerisque augue. Nullam ullamcorper dapibus lorem, ac pretium quam maximus a. </p><!--]-->`);
}
script$1.ssrRender = ssrRender$1;
script$1.__file = "components/PageA.vue";
const getRouter = (options) => {
  const routerHistory = options.engine === "client" ? createWebHistory() : createMemoryHistory();
  return createRouter({
    history: routerHistory,
    routes: [
      {
        path: "/",
        component: script
      },
      {
        path: "/a",
        component: script$1
      }
    ]
  });
};
var script$2 = {
  name: "App",
  components: {}
};
function ssrRender$2(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_router_link = vue.resolveComponent("router-link");
  const _component_router_view = vue.resolveComponent("router-view");
  _push(`<!--[--><div class="nav">`);
  _push(serverRenderer.ssrRenderComponent(_component_router_link, {to: "/"}, {
    default: vue.withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Home`);
      } else {
        return [
          vue.createTextVNode("Home")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(serverRenderer.ssrRenderComponent(_component_router_link, {to: "/a"}, {
    default: vue.withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Page`);
      } else {
        return [
          vue.createTextVNode("Page")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div><div class="test">`);
  _push(serverRenderer.ssrRenderComponent(_component_router_view, null, null, _parent));
  _push(`</div><!--]-->`);
}
script$2.ssrRender = ssrRender$2;
script$2.__file = "App.vue";
const isNode = typeof window !== "undefined" ? false : true;
const factorApp = async (context2 = {}) => {
  const app2 = vue.createSSRApp(script$2);
  const router2 = getRouter({engine: isNode ? "server" : "client"});
  app2.use(router2);
  if (context2.url) {
    router2.push(context2.url);
  }
  await router2.isReady();
  return app2;
};
if (!isNode) {
  factorApp().then((app2) => {
    app2.mount("#app");
  });
}
exports.factorApp = factorApp;
