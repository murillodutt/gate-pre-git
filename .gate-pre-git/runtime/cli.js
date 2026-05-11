#!/usr/bin/env bun
// @bun
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = import.meta.require;

// node_modules/yaml/dist/nodes/identity.js
var require_identity = __commonJS((exports) => {
  var ALIAS = Symbol.for("yaml.alias");
  var DOC = Symbol.for("yaml.document");
  var MAP = Symbol.for("yaml.map");
  var PAIR = Symbol.for("yaml.pair");
  var SCALAR = Symbol.for("yaml.scalar");
  var SEQ = Symbol.for("yaml.seq");
  var NODE_TYPE = Symbol.for("yaml.node.type");
  var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
  var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
  var isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
  var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
  var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
  var isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
  function isCollection(node) {
    if (node && typeof node === "object")
      switch (node[NODE_TYPE]) {
        case MAP:
        case SEQ:
          return true;
      }
    return false;
  }
  function isNode(node) {
    if (node && typeof node === "object")
      switch (node[NODE_TYPE]) {
        case ALIAS:
        case MAP:
        case SCALAR:
        case SEQ:
          return true;
      }
    return false;
  }
  var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
  exports.ALIAS = ALIAS;
  exports.DOC = DOC;
  exports.MAP = MAP;
  exports.NODE_TYPE = NODE_TYPE;
  exports.PAIR = PAIR;
  exports.SCALAR = SCALAR;
  exports.SEQ = SEQ;
  exports.hasAnchor = hasAnchor;
  exports.isAlias = isAlias;
  exports.isCollection = isCollection;
  exports.isDocument = isDocument;
  exports.isMap = isMap;
  exports.isNode = isNode;
  exports.isPair = isPair;
  exports.isScalar = isScalar;
  exports.isSeq = isSeq;
});

// node_modules/yaml/dist/visit.js
var require_visit = __commonJS((exports) => {
  var identity = require_identity();
  var BREAK = Symbol("break visit");
  var SKIP = Symbol("skip children");
  var REMOVE = Symbol("remove node");
  function visit(node, visitor) {
    const visitor_ = initVisitor(visitor);
    if (identity.isDocument(node)) {
      const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
      if (cd === REMOVE)
        node.contents = null;
    } else
      visit_(null, node, visitor_, Object.freeze([]));
  }
  visit.BREAK = BREAK;
  visit.SKIP = SKIP;
  visit.REMOVE = REMOVE;
  function visit_(key, node, visitor, path) {
    const ctrl = callVisitor(key, node, visitor, path);
    if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
      replaceNode(key, path, ctrl);
      return visit_(key, ctrl, visitor, path);
    }
    if (typeof ctrl !== "symbol") {
      if (identity.isCollection(node)) {
        path = Object.freeze(path.concat(node));
        for (let i = 0;i < node.items.length; ++i) {
          const ci = visit_(i, node.items[i], visitor, path);
          if (typeof ci === "number")
            i = ci - 1;
          else if (ci === BREAK)
            return BREAK;
          else if (ci === REMOVE) {
            node.items.splice(i, 1);
            i -= 1;
          }
        }
      } else if (identity.isPair(node)) {
        path = Object.freeze(path.concat(node));
        const ck = visit_("key", node.key, visitor, path);
        if (ck === BREAK)
          return BREAK;
        else if (ck === REMOVE)
          node.key = null;
        const cv = visit_("value", node.value, visitor, path);
        if (cv === BREAK)
          return BREAK;
        else if (cv === REMOVE)
          node.value = null;
      }
    }
    return ctrl;
  }
  async function visitAsync(node, visitor) {
    const visitor_ = initVisitor(visitor);
    if (identity.isDocument(node)) {
      const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
      if (cd === REMOVE)
        node.contents = null;
    } else
      await visitAsync_(null, node, visitor_, Object.freeze([]));
  }
  visitAsync.BREAK = BREAK;
  visitAsync.SKIP = SKIP;
  visitAsync.REMOVE = REMOVE;
  async function visitAsync_(key, node, visitor, path) {
    const ctrl = await callVisitor(key, node, visitor, path);
    if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
      replaceNode(key, path, ctrl);
      return visitAsync_(key, ctrl, visitor, path);
    }
    if (typeof ctrl !== "symbol") {
      if (identity.isCollection(node)) {
        path = Object.freeze(path.concat(node));
        for (let i = 0;i < node.items.length; ++i) {
          const ci = await visitAsync_(i, node.items[i], visitor, path);
          if (typeof ci === "number")
            i = ci - 1;
          else if (ci === BREAK)
            return BREAK;
          else if (ci === REMOVE) {
            node.items.splice(i, 1);
            i -= 1;
          }
        }
      } else if (identity.isPair(node)) {
        path = Object.freeze(path.concat(node));
        const ck = await visitAsync_("key", node.key, visitor, path);
        if (ck === BREAK)
          return BREAK;
        else if (ck === REMOVE)
          node.key = null;
        const cv = await visitAsync_("value", node.value, visitor, path);
        if (cv === BREAK)
          return BREAK;
        else if (cv === REMOVE)
          node.value = null;
      }
    }
    return ctrl;
  }
  function initVisitor(visitor) {
    if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
      return Object.assign({
        Alias: visitor.Node,
        Map: visitor.Node,
        Scalar: visitor.Node,
        Seq: visitor.Node
      }, visitor.Value && {
        Map: visitor.Value,
        Scalar: visitor.Value,
        Seq: visitor.Value
      }, visitor.Collection && {
        Map: visitor.Collection,
        Seq: visitor.Collection
      }, visitor);
    }
    return visitor;
  }
  function callVisitor(key, node, visitor, path) {
    if (typeof visitor === "function")
      return visitor(key, node, path);
    if (identity.isMap(node))
      return visitor.Map?.(key, node, path);
    if (identity.isSeq(node))
      return visitor.Seq?.(key, node, path);
    if (identity.isPair(node))
      return visitor.Pair?.(key, node, path);
    if (identity.isScalar(node))
      return visitor.Scalar?.(key, node, path);
    if (identity.isAlias(node))
      return visitor.Alias?.(key, node, path);
    return;
  }
  function replaceNode(key, path, node) {
    const parent = path[path.length - 1];
    if (identity.isCollection(parent)) {
      parent.items[key] = node;
    } else if (identity.isPair(parent)) {
      if (key === "key")
        parent.key = node;
      else
        parent.value = node;
    } else if (identity.isDocument(parent)) {
      parent.contents = node;
    } else {
      const pt = identity.isAlias(parent) ? "alias" : "scalar";
      throw new Error(`Cannot replace node with ${pt} parent`);
    }
  }
  exports.visit = visit;
  exports.visitAsync = visitAsync;
});

// node_modules/yaml/dist/doc/directives.js
var require_directives = __commonJS((exports) => {
  var identity = require_identity();
  var visit = require_visit();
  var escapeChars = {
    "!": "%21",
    ",": "%2C",
    "[": "%5B",
    "]": "%5D",
    "{": "%7B",
    "}": "%7D"
  };
  var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);

  class Directives {
    constructor(yaml, tags) {
      this.docStart = null;
      this.docEnd = false;
      this.yaml = Object.assign({}, Directives.defaultYaml, yaml);
      this.tags = Object.assign({}, Directives.defaultTags, tags);
    }
    clone() {
      const copy = new Directives(this.yaml, this.tags);
      copy.docStart = this.docStart;
      return copy;
    }
    atDocument() {
      const res = new Directives(this.yaml, this.tags);
      switch (this.yaml.version) {
        case "1.1":
          this.atNextDocument = true;
          break;
        case "1.2":
          this.atNextDocument = false;
          this.yaml = {
            explicit: Directives.defaultYaml.explicit,
            version: "1.2"
          };
          this.tags = Object.assign({}, Directives.defaultTags);
          break;
      }
      return res;
    }
    add(line, onError) {
      if (this.atNextDocument) {
        this.yaml = { explicit: Directives.defaultYaml.explicit, version: "1.1" };
        this.tags = Object.assign({}, Directives.defaultTags);
        this.atNextDocument = false;
      }
      const parts = line.trim().split(/[ \t]+/);
      const name = parts.shift();
      switch (name) {
        case "%TAG": {
          if (parts.length !== 2) {
            onError(0, "%TAG directive should contain exactly two parts");
            if (parts.length < 2)
              return false;
          }
          const [handle, prefix] = parts;
          this.tags[handle] = prefix;
          return true;
        }
        case "%YAML": {
          this.yaml.explicit = true;
          if (parts.length !== 1) {
            onError(0, "%YAML directive should contain exactly one part");
            return false;
          }
          const [version] = parts;
          if (version === "1.1" || version === "1.2") {
            this.yaml.version = version;
            return true;
          } else {
            const isValid = /^\d+\.\d+$/.test(version);
            onError(6, `Unsupported YAML version ${version}`, isValid);
            return false;
          }
        }
        default:
          onError(0, `Unknown directive ${name}`, true);
          return false;
      }
    }
    tagName(source, onError) {
      if (source === "!")
        return "!";
      if (source[0] !== "!") {
        onError(`Not a valid tag: ${source}`);
        return null;
      }
      if (source[1] === "<") {
        const verbatim = source.slice(2, -1);
        if (verbatim === "!" || verbatim === "!!") {
          onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
          return null;
        }
        if (source[source.length - 1] !== ">")
          onError("Verbatim tags must end with a >");
        return verbatim;
      }
      const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
      if (!suffix)
        onError(`The ${source} tag has no suffix`);
      const prefix = this.tags[handle];
      if (prefix) {
        try {
          return prefix + decodeURIComponent(suffix);
        } catch (error) {
          onError(String(error));
          return null;
        }
      }
      if (handle === "!")
        return source;
      onError(`Could not resolve tag: ${source}`);
      return null;
    }
    tagString(tag) {
      for (const [handle, prefix] of Object.entries(this.tags)) {
        if (tag.startsWith(prefix))
          return handle + escapeTagName(tag.substring(prefix.length));
      }
      return tag[0] === "!" ? tag : `!<${tag}>`;
    }
    toString(doc) {
      const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
      const tagEntries = Object.entries(this.tags);
      let tagNames;
      if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
        const tags = {};
        visit.visit(doc.contents, (_key, node) => {
          if (identity.isNode(node) && node.tag)
            tags[node.tag] = true;
        });
        tagNames = Object.keys(tags);
      } else
        tagNames = [];
      for (const [handle, prefix] of tagEntries) {
        if (handle === "!!" && prefix === "tag:yaml.org,2002:")
          continue;
        if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
          lines.push(`%TAG ${handle} ${prefix}`);
      }
      return lines.join(`
`);
    }
  }
  Directives.defaultYaml = { explicit: false, version: "1.2" };
  Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
  exports.Directives = Directives;
});

// node_modules/yaml/dist/doc/anchors.js
var require_anchors = __commonJS((exports) => {
  var identity = require_identity();
  var visit = require_visit();
  function anchorIsValid(anchor) {
    if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
      const sa = JSON.stringify(anchor);
      const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
      throw new Error(msg);
    }
    return true;
  }
  function anchorNames(root) {
    const anchors = new Set;
    visit.visit(root, {
      Value(_key, node) {
        if (node.anchor)
          anchors.add(node.anchor);
      }
    });
    return anchors;
  }
  function findNewAnchor(prefix, exclude) {
    for (let i = 1;; ++i) {
      const name = `${prefix}${i}`;
      if (!exclude.has(name))
        return name;
    }
  }
  function createNodeAnchors(doc, prefix) {
    const aliasObjects = [];
    const sourceObjects = new Map;
    let prevAnchors = null;
    return {
      onAnchor: (source) => {
        aliasObjects.push(source);
        prevAnchors ?? (prevAnchors = anchorNames(doc));
        const anchor = findNewAnchor(prefix, prevAnchors);
        prevAnchors.add(anchor);
        return anchor;
      },
      setAnchors: () => {
        for (const source of aliasObjects) {
          const ref = sourceObjects.get(source);
          if (typeof ref === "object" && ref.anchor && (identity.isScalar(ref.node) || identity.isCollection(ref.node))) {
            ref.node.anchor = ref.anchor;
          } else {
            const error = new Error("Failed to resolve repeated object (this should not happen)");
            error.source = source;
            throw error;
          }
        }
      },
      sourceObjects
    };
  }
  exports.anchorIsValid = anchorIsValid;
  exports.anchorNames = anchorNames;
  exports.createNodeAnchors = createNodeAnchors;
  exports.findNewAnchor = findNewAnchor;
});

// node_modules/yaml/dist/doc/applyReviver.js
var require_applyReviver = __commonJS((exports) => {
  function applyReviver(reviver, obj, key, val) {
    if (val && typeof val === "object") {
      if (Array.isArray(val)) {
        for (let i = 0, len = val.length;i < len; ++i) {
          const v0 = val[i];
          const v1 = applyReviver(reviver, val, String(i), v0);
          if (v1 === undefined)
            delete val[i];
          else if (v1 !== v0)
            val[i] = v1;
        }
      } else if (val instanceof Map) {
        for (const k of Array.from(val.keys())) {
          const v0 = val.get(k);
          const v1 = applyReviver(reviver, val, k, v0);
          if (v1 === undefined)
            val.delete(k);
          else if (v1 !== v0)
            val.set(k, v1);
        }
      } else if (val instanceof Set) {
        for (const v0 of Array.from(val)) {
          const v1 = applyReviver(reviver, val, v0, v0);
          if (v1 === undefined)
            val.delete(v0);
          else if (v1 !== v0) {
            val.delete(v0);
            val.add(v1);
          }
        }
      } else {
        for (const [k, v0] of Object.entries(val)) {
          const v1 = applyReviver(reviver, val, k, v0);
          if (v1 === undefined)
            delete val[k];
          else if (v1 !== v0)
            val[k] = v1;
        }
      }
    }
    return reviver.call(obj, key, val);
  }
  exports.applyReviver = applyReviver;
});

// node_modules/yaml/dist/nodes/toJS.js
var require_toJS = __commonJS((exports) => {
  var identity = require_identity();
  function toJS(value, arg, ctx) {
    if (Array.isArray(value))
      return value.map((v, i) => toJS(v, String(i), ctx));
    if (value && typeof value.toJSON === "function") {
      if (!ctx || !identity.hasAnchor(value))
        return value.toJSON(arg, ctx);
      const data = { aliasCount: 0, count: 1, res: undefined };
      ctx.anchors.set(value, data);
      ctx.onCreate = (res2) => {
        data.res = res2;
        delete ctx.onCreate;
      };
      const res = value.toJSON(arg, ctx);
      if (ctx.onCreate)
        ctx.onCreate(res);
      return res;
    }
    if (typeof value === "bigint" && !ctx?.keep)
      return Number(value);
    return value;
  }
  exports.toJS = toJS;
});

// node_modules/yaml/dist/nodes/Node.js
var require_Node = __commonJS((exports) => {
  var applyReviver = require_applyReviver();
  var identity = require_identity();
  var toJS = require_toJS();

  class NodeBase {
    constructor(type) {
      Object.defineProperty(this, identity.NODE_TYPE, { value: type });
    }
    clone() {
      const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
      if (this.range)
        copy.range = this.range.slice();
      return copy;
    }
    toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
      if (!identity.isDocument(doc))
        throw new TypeError("A document argument is required");
      const ctx = {
        anchors: new Map,
        doc,
        keep: true,
        mapAsMap: mapAsMap === true,
        mapKeyWarned: false,
        maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
      };
      const res = toJS.toJS(this, "", ctx);
      if (typeof onAnchor === "function")
        for (const { count, res: res2 } of ctx.anchors.values())
          onAnchor(res2, count);
      return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
    }
  }
  exports.NodeBase = NodeBase;
});

// node_modules/yaml/dist/nodes/Alias.js
var require_Alias = __commonJS((exports) => {
  var anchors = require_anchors();
  var visit = require_visit();
  var identity = require_identity();
  var Node = require_Node();
  var toJS = require_toJS();

  class Alias extends Node.NodeBase {
    constructor(source) {
      super(identity.ALIAS);
      this.source = source;
      Object.defineProperty(this, "tag", {
        set() {
          throw new Error("Alias nodes cannot have tags");
        }
      });
    }
    resolve(doc, ctx) {
      if (ctx?.maxAliasCount === 0)
        throw new ReferenceError("Alias resolution is disabled");
      let nodes;
      if (ctx?.aliasResolveCache) {
        nodes = ctx.aliasResolveCache;
      } else {
        nodes = [];
        visit.visit(doc, {
          Node: (_key, node) => {
            if (identity.isAlias(node) || identity.hasAnchor(node))
              nodes.push(node);
          }
        });
        if (ctx)
          ctx.aliasResolveCache = nodes;
      }
      let found = undefined;
      for (const node of nodes) {
        if (node === this)
          break;
        if (node.anchor === this.source)
          found = node;
      }
      return found;
    }
    toJSON(_arg, ctx) {
      if (!ctx)
        return { source: this.source };
      const { anchors: anchors2, doc, maxAliasCount } = ctx;
      const source = this.resolve(doc, ctx);
      if (!source) {
        const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
        throw new ReferenceError(msg);
      }
      let data = anchors2.get(source);
      if (!data) {
        toJS.toJS(source, null, ctx);
        data = anchors2.get(source);
      }
      if (data?.res === undefined) {
        const msg = "This should not happen: Alias anchor was not resolved?";
        throw new ReferenceError(msg);
      }
      if (maxAliasCount >= 0) {
        data.count += 1;
        if (data.aliasCount === 0)
          data.aliasCount = getAliasCount(doc, source, anchors2);
        if (data.count * data.aliasCount > maxAliasCount) {
          const msg = "Excessive alias count indicates a resource exhaustion attack";
          throw new ReferenceError(msg);
        }
      }
      return data.res;
    }
    toString(ctx, _onComment, _onChompKeep) {
      const src = `*${this.source}`;
      if (ctx) {
        anchors.anchorIsValid(this.source);
        if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
          const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new Error(msg);
        }
        if (ctx.implicitKey)
          return `${src} `;
      }
      return src;
    }
  }
  function getAliasCount(doc, node, anchors2) {
    if (identity.isAlias(node)) {
      const source = node.resolve(doc);
      const anchor = anchors2 && source && anchors2.get(source);
      return anchor ? anchor.count * anchor.aliasCount : 0;
    } else if (identity.isCollection(node)) {
      let count = 0;
      for (const item of node.items) {
        const c = getAliasCount(doc, item, anchors2);
        if (c > count)
          count = c;
      }
      return count;
    } else if (identity.isPair(node)) {
      const kc = getAliasCount(doc, node.key, anchors2);
      const vc = getAliasCount(doc, node.value, anchors2);
      return Math.max(kc, vc);
    }
    return 1;
  }
  exports.Alias = Alias;
});

// node_modules/yaml/dist/nodes/Scalar.js
var require_Scalar = __commonJS((exports) => {
  var identity = require_identity();
  var Node = require_Node();
  var toJS = require_toJS();
  var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";

  class Scalar extends Node.NodeBase {
    constructor(value) {
      super(identity.SCALAR);
      this.value = value;
    }
    toJSON(arg, ctx) {
      return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
    }
    toString() {
      return String(this.value);
    }
  }
  Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
  Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
  Scalar.PLAIN = "PLAIN";
  Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
  Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
  exports.Scalar = Scalar;
  exports.isScalarValue = isScalarValue;
});

// node_modules/yaml/dist/doc/createNode.js
var require_createNode = __commonJS((exports) => {
  var Alias = require_Alias();
  var identity = require_identity();
  var Scalar = require_Scalar();
  var defaultTagPrefix = "tag:yaml.org,2002:";
  function findTagObject(value, tagName, tags) {
    if (tagName) {
      const match = tags.filter((t) => t.tag === tagName);
      const tagObj = match.find((t) => !t.format) ?? match[0];
      if (!tagObj)
        throw new Error(`Tag ${tagName} not found`);
      return tagObj;
    }
    return tags.find((t) => t.identify?.(value) && !t.format);
  }
  function createNode(value, tagName, ctx) {
    if (identity.isDocument(value))
      value = value.contents;
    if (identity.isNode(value))
      return value;
    if (identity.isPair(value)) {
      const map = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
      map.items.push(value);
      return map;
    }
    if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
      value = value.valueOf();
    }
    const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
    let ref = undefined;
    if (aliasDuplicateObjects && value && typeof value === "object") {
      ref = sourceObjects.get(value);
      if (ref) {
        ref.anchor ?? (ref.anchor = onAnchor(value));
        return new Alias.Alias(ref.anchor);
      } else {
        ref = { anchor: null, node: null };
        sourceObjects.set(value, ref);
      }
    }
    if (tagName?.startsWith("!!"))
      tagName = defaultTagPrefix + tagName.slice(2);
    let tagObj = findTagObject(value, tagName, schema.tags);
    if (!tagObj) {
      if (value && typeof value.toJSON === "function") {
        value = value.toJSON();
      }
      if (!value || typeof value !== "object") {
        const node2 = new Scalar.Scalar(value);
        if (ref)
          ref.node = node2;
        return node2;
      }
      tagObj = value instanceof Map ? schema[identity.MAP] : (Symbol.iterator in Object(value)) ? schema[identity.SEQ] : schema[identity.MAP];
    }
    if (onTagObj) {
      onTagObj(tagObj);
      delete ctx.onTagObj;
    }
    const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar.Scalar(value);
    if (tagName)
      node.tag = tagName;
    else if (!tagObj.default)
      node.tag = tagObj.tag;
    if (ref)
      ref.node = node;
    return node;
  }
  exports.createNode = createNode;
});

// node_modules/yaml/dist/nodes/Collection.js
var require_Collection = __commonJS((exports) => {
  var createNode = require_createNode();
  var identity = require_identity();
  var Node = require_Node();
  function collectionFromPath(schema, path, value) {
    let v = value;
    for (let i = path.length - 1;i >= 0; --i) {
      const k = path[i];
      if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
        const a = [];
        a[k] = v;
        v = a;
      } else {
        v = new Map([[k, v]]);
      }
    }
    return createNode.createNode(v, undefined, {
      aliasDuplicateObjects: false,
      keepUndefined: false,
      onAnchor: () => {
        throw new Error("This should not happen, please report a bug.");
      },
      schema,
      sourceObjects: new Map
    });
  }
  var isEmptyPath = (path) => path == null || typeof path === "object" && !!path[Symbol.iterator]().next().done;

  class Collection extends Node.NodeBase {
    constructor(type, schema) {
      super(type);
      Object.defineProperty(this, "schema", {
        value: schema,
        configurable: true,
        enumerable: false,
        writable: true
      });
    }
    clone(schema) {
      const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
      if (schema)
        copy.schema = schema;
      copy.items = copy.items.map((it) => identity.isNode(it) || identity.isPair(it) ? it.clone(schema) : it);
      if (this.range)
        copy.range = this.range.slice();
      return copy;
    }
    addIn(path, value) {
      if (isEmptyPath(path))
        this.add(value);
      else {
        const [key, ...rest] = path;
        const node = this.get(key, true);
        if (identity.isCollection(node))
          node.addIn(rest, value);
        else if (node === undefined && this.schema)
          this.set(key, collectionFromPath(this.schema, rest, value));
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
    }
    deleteIn(path) {
      const [key, ...rest] = path;
      if (rest.length === 0)
        return this.delete(key);
      const node = this.get(key, true);
      if (identity.isCollection(node))
        return node.deleteIn(rest);
      else
        throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
    }
    getIn(path, keepScalar) {
      const [key, ...rest] = path;
      const node = this.get(key, true);
      if (rest.length === 0)
        return !keepScalar && identity.isScalar(node) ? node.value : node;
      else
        return identity.isCollection(node) ? node.getIn(rest, keepScalar) : undefined;
    }
    hasAllNullValues(allowScalar) {
      return this.items.every((node) => {
        if (!identity.isPair(node))
          return false;
        const n = node.value;
        return n == null || allowScalar && identity.isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
      });
    }
    hasIn(path) {
      const [key, ...rest] = path;
      if (rest.length === 0)
        return this.has(key);
      const node = this.get(key, true);
      return identity.isCollection(node) ? node.hasIn(rest) : false;
    }
    setIn(path, value) {
      const [key, ...rest] = path;
      if (rest.length === 0) {
        this.set(key, value);
      } else {
        const node = this.get(key, true);
        if (identity.isCollection(node))
          node.setIn(rest, value);
        else if (node === undefined && this.schema)
          this.set(key, collectionFromPath(this.schema, rest, value));
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
    }
  }
  exports.Collection = Collection;
  exports.collectionFromPath = collectionFromPath;
  exports.isEmptyPath = isEmptyPath;
});

// node_modules/yaml/dist/stringify/stringifyComment.js
var require_stringifyComment = __commonJS((exports) => {
  var stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
  function indentComment(comment, indent) {
    if (/^\n+$/.test(comment))
      return comment.substring(1);
    return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
  }
  var lineComment = (str, indent, comment) => str.endsWith(`
`) ? indentComment(comment, indent) : comment.includes(`
`) ? `
` + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;
  exports.indentComment = indentComment;
  exports.lineComment = lineComment;
  exports.stringifyComment = stringifyComment;
});

// node_modules/yaml/dist/stringify/foldFlowLines.js
var require_foldFlowLines = __commonJS((exports) => {
  var FOLD_FLOW = "flow";
  var FOLD_BLOCK = "block";
  var FOLD_QUOTED = "quoted";
  function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
    if (!lineWidth || lineWidth < 0)
      return text;
    if (lineWidth < minContentWidth)
      minContentWidth = 0;
    const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
    if (text.length <= endStep)
      return text;
    const folds = [];
    const escapedFolds = {};
    let end = lineWidth - indent.length;
    if (typeof indentAtStart === "number") {
      if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
        folds.push(0);
      else
        end = lineWidth - indentAtStart;
    }
    let split = undefined;
    let prev = undefined;
    let overflow = false;
    let i = -1;
    let escStart = -1;
    let escEnd = -1;
    if (mode === FOLD_BLOCK) {
      i = consumeMoreIndentedLines(text, i, indent.length);
      if (i !== -1)
        end = i + endStep;
    }
    for (let ch;ch = text[i += 1]; ) {
      if (mode === FOLD_QUOTED && ch === "\\") {
        escStart = i;
        switch (text[i + 1]) {
          case "x":
            i += 3;
            break;
          case "u":
            i += 5;
            break;
          case "U":
            i += 9;
            break;
          default:
            i += 1;
        }
        escEnd = i;
      }
      if (ch === `
`) {
        if (mode === FOLD_BLOCK)
          i = consumeMoreIndentedLines(text, i, indent.length);
        end = i + indent.length + endStep;
        split = undefined;
      } else {
        if (ch === " " && prev && prev !== " " && prev !== `
` && prev !== "\t") {
          const next = text[i + 1];
          if (next && next !== " " && next !== `
` && next !== "\t")
            split = i;
        }
        if (i >= end) {
          if (split) {
            folds.push(split);
            end = split + endStep;
            split = undefined;
          } else if (mode === FOLD_QUOTED) {
            while (prev === " " || prev === "\t") {
              prev = ch;
              ch = text[i += 1];
              overflow = true;
            }
            const j = i > escEnd + 1 ? i - 2 : escStart - 1;
            if (escapedFolds[j])
              return text;
            folds.push(j);
            escapedFolds[j] = true;
            end = j + endStep;
            split = undefined;
          } else {
            overflow = true;
          }
        }
      }
      prev = ch;
    }
    if (overflow && onOverflow)
      onOverflow();
    if (folds.length === 0)
      return text;
    if (onFold)
      onFold();
    let res = text.slice(0, folds[0]);
    for (let i2 = 0;i2 < folds.length; ++i2) {
      const fold = folds[i2];
      const end2 = folds[i2 + 1] || text.length;
      if (fold === 0)
        res = `
${indent}${text.slice(0, end2)}`;
      else {
        if (mode === FOLD_QUOTED && escapedFolds[fold])
          res += `${text[fold]}\\`;
        res += `
${indent}${text.slice(fold + 1, end2)}`;
      }
    }
    return res;
  }
  function consumeMoreIndentedLines(text, i, indent) {
    let end = i;
    let start = i + 1;
    let ch = text[start];
    while (ch === " " || ch === "\t") {
      if (i < start + indent) {
        ch = text[++i];
      } else {
        do {
          ch = text[++i];
        } while (ch && ch !== `
`);
        end = i;
        start = i + 1;
        ch = text[start];
      }
    }
    return end;
  }
  exports.FOLD_BLOCK = FOLD_BLOCK;
  exports.FOLD_FLOW = FOLD_FLOW;
  exports.FOLD_QUOTED = FOLD_QUOTED;
  exports.foldFlowLines = foldFlowLines;
});

// node_modules/yaml/dist/stringify/stringifyString.js
var require_stringifyString = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var foldFlowLines = require_foldFlowLines();
  var getFoldOptions = (ctx, isBlock) => ({
    indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
    lineWidth: ctx.options.lineWidth,
    minContentWidth: ctx.options.minContentWidth
  });
  var containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
  function lineLengthOverLimit(str, lineWidth, indentLength) {
    if (!lineWidth || lineWidth < 0)
      return false;
    const limit = lineWidth - indentLength;
    const strLen = str.length;
    if (strLen <= limit)
      return false;
    for (let i = 0, start = 0;i < strLen; ++i) {
      if (str[i] === `
`) {
        if (i - start > limit)
          return true;
        start = i + 1;
        if (strLen - start <= limit)
          return false;
      }
    }
    return true;
  }
  function doubleQuotedString(value, ctx) {
    const json = JSON.stringify(value);
    if (ctx.options.doubleQuotedAsJSON)
      return json;
    const { implicitKey } = ctx;
    const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
    const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
    let str = "";
    let start = 0;
    for (let i = 0, ch = json[i];ch; ch = json[++i]) {
      if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
        str += json.slice(start, i) + "\\ ";
        i += 1;
        start = i;
        ch = "\\";
      }
      if (ch === "\\")
        switch (json[i + 1]) {
          case "u":
            {
              str += json.slice(start, i);
              const code = json.substr(i + 2, 4);
              switch (code) {
                case "0000":
                  str += "\\0";
                  break;
                case "0007":
                  str += "\\a";
                  break;
                case "000b":
                  str += "\\v";
                  break;
                case "001b":
                  str += "\\e";
                  break;
                case "0085":
                  str += "\\N";
                  break;
                case "00a0":
                  str += "\\_";
                  break;
                case "2028":
                  str += "\\L";
                  break;
                case "2029":
                  str += "\\P";
                  break;
                default:
                  if (code.substr(0, 2) === "00")
                    str += "\\x" + code.substr(2);
                  else
                    str += json.substr(i, 6);
              }
              i += 5;
              start = i + 1;
            }
            break;
          case "n":
            if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
              i += 1;
            } else {
              str += json.slice(start, i) + `

`;
              while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
                str += `
`;
                i += 2;
              }
              str += indent;
              if (json[i + 2] === " ")
                str += "\\";
              i += 1;
              start = i + 1;
            }
            break;
          default:
            i += 1;
        }
    }
    str = start ? str + json.slice(start) : json;
    return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
  }
  function singleQuotedString(value, ctx) {
    if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes(`
`) || /[ \t]\n|\n[ \t]/.test(value))
      return doubleQuotedString(value, ctx);
    const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
    const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
    return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
  }
  function quotedString(value, ctx) {
    const { singleQuote } = ctx.options;
    let qs;
    if (singleQuote === false)
      qs = doubleQuotedString;
    else {
      const hasDouble = value.includes('"');
      const hasSingle = value.includes("'");
      if (hasDouble && !hasSingle)
        qs = singleQuotedString;
      else if (hasSingle && !hasDouble)
        qs = doubleQuotedString;
      else
        qs = singleQuote ? singleQuotedString : doubleQuotedString;
    }
    return qs(value, ctx);
  }
  var blockEndNewlines;
  try {
    blockEndNewlines = new RegExp(`(^|(?<!
))
+(?!
|$)`, "g");
  } catch {
    blockEndNewlines = /\n+(?!\n|$)/g;
  }
  function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
    const { blockQuote, commentString, lineWidth } = ctx.options;
    if (!blockQuote || /\n[\t ]+$/.test(value)) {
      return quotedString(value, ctx);
    }
    const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
    const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.Scalar.BLOCK_FOLDED ? false : type === Scalar.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
    if (!value)
      return literal ? `|
` : `>
`;
    let chomp;
    let endStart;
    for (endStart = value.length;endStart > 0; --endStart) {
      const ch = value[endStart - 1];
      if (ch !== `
` && ch !== "\t" && ch !== " ")
        break;
    }
    let end = value.substring(endStart);
    const endNlPos = end.indexOf(`
`);
    if (endNlPos === -1) {
      chomp = "-";
    } else if (value === end || endNlPos !== end.length - 1) {
      chomp = "+";
      if (onChompKeep)
        onChompKeep();
    } else {
      chomp = "";
    }
    if (end) {
      value = value.slice(0, -end.length);
      if (end[end.length - 1] === `
`)
        end = end.slice(0, -1);
      end = end.replace(blockEndNewlines, `$&${indent}`);
    }
    let startWithSpace = false;
    let startEnd;
    let startNlPos = -1;
    for (startEnd = 0;startEnd < value.length; ++startEnd) {
      const ch = value[startEnd];
      if (ch === " ")
        startWithSpace = true;
      else if (ch === `
`)
        startNlPos = startEnd;
      else
        break;
    }
    let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
    if (start) {
      value = value.substring(start.length);
      start = start.replace(/\n+/g, `$&${indent}`);
    }
    const indentSize = indent ? "2" : "1";
    let header = (startWithSpace ? indentSize : "") + chomp;
    if (comment) {
      header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
      if (onComment)
        onComment();
    }
    if (!literal) {
      const foldedValue = value.replace(/\n+/g, `
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
      let literalFallback = false;
      const foldOptions = getFoldOptions(ctx, true);
      if (blockQuote !== "folded" && type !== Scalar.Scalar.BLOCK_FOLDED) {
        foldOptions.onOverflow = () => {
          literalFallback = true;
        };
      }
      const body = foldFlowLines.foldFlowLines(`${start}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
      if (!literalFallback)
        return `>${header}
${indent}${body}`;
    }
    value = value.replace(/\n+/g, `$&${indent}`);
    return `|${header}
${indent}${start}${value}${end}`;
  }
  function plainString(item, ctx, onComment, onChompKeep) {
    const { type, value } = item;
    const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
    if (implicitKey && value.includes(`
`) || inFlow && /[[\]{},]/.test(value)) {
      return quotedString(value, ctx);
    }
    if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
      return implicitKey || inFlow || !value.includes(`
`) ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
    }
    if (!implicitKey && !inFlow && type !== Scalar.Scalar.PLAIN && value.includes(`
`)) {
      return blockString(item, ctx, onComment, onChompKeep);
    }
    if (containsDocumentMarker(value)) {
      if (indent === "") {
        ctx.forceBlockIndent = true;
        return blockString(item, ctx, onComment, onChompKeep);
      } else if (implicitKey && indent === indentStep) {
        return quotedString(value, ctx);
      }
    }
    const str = value.replace(/\n+/g, `$&
${indent}`);
    if (actualString) {
      const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
      const { compat, tags } = ctx.doc.schema;
      if (tags.some(test) || compat?.some(test))
        return quotedString(value, ctx);
    }
    return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
  }
  function stringifyString(item, ctx, onComment, onChompKeep) {
    const { implicitKey, inFlow } = ctx;
    const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
    let { type } = item;
    if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
      if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
        type = Scalar.Scalar.QUOTE_DOUBLE;
    }
    const _stringify = (_type) => {
      switch (_type) {
        case Scalar.Scalar.BLOCK_FOLDED:
        case Scalar.Scalar.BLOCK_LITERAL:
          return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
        case Scalar.Scalar.QUOTE_DOUBLE:
          return doubleQuotedString(ss.value, ctx);
        case Scalar.Scalar.QUOTE_SINGLE:
          return singleQuotedString(ss.value, ctx);
        case Scalar.Scalar.PLAIN:
          return plainString(ss, ctx, onComment, onChompKeep);
        default:
          return null;
      }
    };
    let res = _stringify(type);
    if (res === null) {
      const { defaultKeyType, defaultStringType } = ctx.options;
      const t = implicitKey && defaultKeyType || defaultStringType;
      res = _stringify(t);
      if (res === null)
        throw new Error(`Unsupported default string type ${t}`);
    }
    return res;
  }
  exports.stringifyString = stringifyString;
});

// node_modules/yaml/dist/stringify/stringify.js
var require_stringify = __commonJS((exports) => {
  var anchors = require_anchors();
  var identity = require_identity();
  var stringifyComment = require_stringifyComment();
  var stringifyString = require_stringifyString();
  function createStringifyContext(doc, options) {
    const opt = Object.assign({
      blockQuote: true,
      commentString: stringifyComment.stringifyComment,
      defaultKeyType: null,
      defaultStringType: "PLAIN",
      directives: null,
      doubleQuotedAsJSON: false,
      doubleQuotedMinMultiLineLength: 40,
      falseStr: "false",
      flowCollectionPadding: true,
      indentSeq: true,
      lineWidth: 80,
      minContentWidth: 20,
      nullStr: "null",
      simpleKeys: false,
      singleQuote: null,
      trailingComma: false,
      trueStr: "true",
      verifyAliasOrder: true
    }, doc.schema.toStringOptions, options);
    let inFlow;
    switch (opt.collectionStyle) {
      case "block":
        inFlow = false;
        break;
      case "flow":
        inFlow = true;
        break;
      default:
        inFlow = null;
    }
    return {
      anchors: new Set,
      doc,
      flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
      indent: "",
      indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
      inFlow,
      options: opt
    };
  }
  function getTagObject(tags, item) {
    if (item.tag) {
      const match = tags.filter((t) => t.tag === item.tag);
      if (match.length > 0)
        return match.find((t) => t.format === item.format) ?? match[0];
    }
    let tagObj = undefined;
    let obj;
    if (identity.isScalar(item)) {
      obj = item.value;
      let match = tags.filter((t) => t.identify?.(obj));
      if (match.length > 1) {
        const testMatch = match.filter((t) => t.test);
        if (testMatch.length > 0)
          match = testMatch;
      }
      tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
    } else {
      obj = item;
      tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
    }
    if (!tagObj) {
      const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
      throw new Error(`Tag not resolved for ${name} value`);
    }
    return tagObj;
  }
  function stringifyProps(node, tagObj, { anchors: anchors$1, doc }) {
    if (!doc.directives)
      return "";
    const props = [];
    const anchor = (identity.isScalar(node) || identity.isCollection(node)) && node.anchor;
    if (anchor && anchors.anchorIsValid(anchor)) {
      anchors$1.add(anchor);
      props.push(`&${anchor}`);
    }
    const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
    if (tag)
      props.push(doc.directives.tagString(tag));
    return props.join(" ");
  }
  function stringify(item, ctx, onComment, onChompKeep) {
    if (identity.isPair(item))
      return item.toString(ctx, onComment, onChompKeep);
    if (identity.isAlias(item)) {
      if (ctx.doc.directives)
        return item.toString(ctx);
      if (ctx.resolvedAliases?.has(item)) {
        throw new TypeError(`Cannot stringify circular structure without alias nodes`);
      } else {
        if (ctx.resolvedAliases)
          ctx.resolvedAliases.add(item);
        else
          ctx.resolvedAliases = new Set([item]);
        item = item.resolve(ctx.doc);
      }
    }
    let tagObj = undefined;
    const node = identity.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
    tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
    const props = stringifyProps(node, tagObj, ctx);
    if (props.length > 0)
      ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
    const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : identity.isScalar(node) ? stringifyString.stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
    if (!props)
      return str;
    return identity.isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
  }
  exports.createStringifyContext = createStringifyContext;
  exports.stringify = stringify;
});

// node_modules/yaml/dist/stringify/stringifyPair.js
var require_stringifyPair = __commonJS((exports) => {
  var identity = require_identity();
  var Scalar = require_Scalar();
  var stringify = require_stringify();
  var stringifyComment = require_stringifyComment();
  function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
    const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
    let keyComment = identity.isNode(key) && key.comment || null;
    if (simpleKeys) {
      if (keyComment) {
        throw new Error("With simple keys, key nodes cannot have comments");
      }
      if (identity.isCollection(key) || !identity.isNode(key) && typeof key === "object") {
        const msg = "With simple keys, collection cannot be used as a key value";
        throw new Error(msg);
      }
    }
    let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || identity.isCollection(key) || (identity.isScalar(key) ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL : typeof key === "object"));
    ctx = Object.assign({}, ctx, {
      allNullValues: false,
      implicitKey: !explicitKey && (simpleKeys || !allNullValues),
      indent: indent + indentStep
    });
    let keyCommentDone = false;
    let chompKeep = false;
    let str = stringify.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
    if (!explicitKey && !ctx.inFlow && str.length > 1024) {
      if (simpleKeys)
        throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
      explicitKey = true;
    }
    if (ctx.inFlow) {
      if (allNullValues || value == null) {
        if (keyCommentDone && onComment)
          onComment();
        return str === "" ? "?" : explicitKey ? `? ${str}` : str;
      }
    } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
      str = `? ${str}`;
      if (keyComment && !keyCommentDone) {
        str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
      } else if (chompKeep && onChompKeep)
        onChompKeep();
      return str;
    }
    if (keyCommentDone)
      keyComment = null;
    if (explicitKey) {
      if (keyComment)
        str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
      str = `? ${str}
${indent}:`;
    } else {
      str = `${str}:`;
      if (keyComment)
        str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
    }
    let vsb, vcb, valueComment;
    if (identity.isNode(value)) {
      vsb = !!value.spaceBefore;
      vcb = value.commentBefore;
      valueComment = value.comment;
    } else {
      vsb = false;
      vcb = null;
      valueComment = null;
      if (value && typeof value === "object")
        value = doc.createNode(value);
    }
    ctx.implicitKey = false;
    if (!explicitKey && !keyComment && identity.isScalar(value))
      ctx.indentAtStart = str.length + 1;
    chompKeep = false;
    if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity.isSeq(value) && !value.flow && !value.tag && !value.anchor) {
      ctx.indent = ctx.indent.substring(2);
    }
    let valueCommentDone = false;
    const valueStr = stringify.stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
    let ws = " ";
    if (keyComment || vsb || vcb) {
      ws = vsb ? `
` : "";
      if (vcb) {
        const cs = commentString(vcb);
        ws += `
${stringifyComment.indentComment(cs, ctx.indent)}`;
      }
      if (valueStr === "" && !ctx.inFlow) {
        if (ws === `
` && valueComment)
          ws = `

`;
      } else {
        ws += `
${ctx.indent}`;
      }
    } else if (!explicitKey && identity.isCollection(value)) {
      const vs0 = valueStr[0];
      const nl0 = valueStr.indexOf(`
`);
      const hasNewline = nl0 !== -1;
      const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
      if (hasNewline || !flow) {
        let hasPropsLine = false;
        if (hasNewline && (vs0 === "&" || vs0 === "!")) {
          let sp0 = valueStr.indexOf(" ");
          if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
            sp0 = valueStr.indexOf(" ", sp0 + 1);
          }
          if (sp0 === -1 || nl0 < sp0)
            hasPropsLine = true;
        }
        if (!hasPropsLine)
          ws = `
${ctx.indent}`;
      }
    } else if (valueStr === "" || valueStr[0] === `
`) {
      ws = "";
    }
    str += ws + valueStr;
    if (ctx.inFlow) {
      if (valueCommentDone && onComment)
        onComment();
    } else if (valueComment && !valueCommentDone) {
      str += stringifyComment.lineComment(str, ctx.indent, commentString(valueComment));
    } else if (chompKeep && onChompKeep) {
      onChompKeep();
    }
    return str;
  }
  exports.stringifyPair = stringifyPair;
});

// node_modules/yaml/dist/log.js
var require_log = __commonJS((exports) => {
  var node_process = __require("process");
  function debug(logLevel, ...messages) {
    if (logLevel === "debug")
      console.log(...messages);
  }
  function warn(logLevel, warning) {
    if (logLevel === "debug" || logLevel === "warn") {
      if (typeof node_process.emitWarning === "function")
        node_process.emitWarning(warning);
      else
        console.warn(warning);
    }
  }
  exports.debug = debug;
  exports.warn = warn;
});

// node_modules/yaml/dist/schema/yaml-1.1/merge.js
var require_merge = __commonJS((exports) => {
  var identity = require_identity();
  var Scalar = require_Scalar();
  var MERGE_KEY = "<<";
  var merge = {
    identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
    default: "key",
    tag: "tag:yaml.org,2002:merge",
    test: /^<<$/,
    resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), {
      addToJSMap: addMergeToJSMap
    }),
    stringify: () => MERGE_KEY
  };
  var isMergeKey = (ctx, key) => (merge.identify(key) || identity.isScalar(key) && (!key.type || key.type === Scalar.Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
  function addMergeToJSMap(ctx, map, value) {
    const source = resolveAliasValue(ctx, value);
    if (identity.isSeq(source))
      for (const it of source.items)
        mergeValue(ctx, map, it);
    else if (Array.isArray(source))
      for (const it of source)
        mergeValue(ctx, map, it);
    else
      mergeValue(ctx, map, source);
  }
  function mergeValue(ctx, map, value) {
    const source = resolveAliasValue(ctx, value);
    if (!identity.isMap(source))
      throw new Error("Merge sources must be maps or map aliases");
    const srcMap = source.toJSON(null, ctx, Map);
    for (const [key, value2] of srcMap) {
      if (map instanceof Map) {
        if (!map.has(key))
          map.set(key, value2);
      } else if (map instanceof Set) {
        map.add(key);
      } else if (!Object.prototype.hasOwnProperty.call(map, key)) {
        Object.defineProperty(map, key, {
          value: value2,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }
    }
    return map;
  }
  function resolveAliasValue(ctx, value) {
    return ctx && identity.isAlias(value) ? value.resolve(ctx.doc, ctx) : value;
  }
  exports.addMergeToJSMap = addMergeToJSMap;
  exports.isMergeKey = isMergeKey;
  exports.merge = merge;
});

// node_modules/yaml/dist/nodes/addPairToJSMap.js
var require_addPairToJSMap = __commonJS((exports) => {
  var log = require_log();
  var merge = require_merge();
  var stringify = require_stringify();
  var identity = require_identity();
  var toJS = require_toJS();
  function addPairToJSMap(ctx, map, { key, value }) {
    if (identity.isNode(key) && key.addToJSMap)
      key.addToJSMap(ctx, map, value);
    else if (merge.isMergeKey(ctx, key))
      merge.addMergeToJSMap(ctx, map, value);
    else {
      const jsKey = toJS.toJS(key, "", ctx);
      if (map instanceof Map) {
        map.set(jsKey, toJS.toJS(value, jsKey, ctx));
      } else if (map instanceof Set) {
        map.add(jsKey);
      } else {
        const stringKey = stringifyKey(key, jsKey, ctx);
        const jsValue = toJS.toJS(value, stringKey, ctx);
        if (stringKey in map)
          Object.defineProperty(map, stringKey, {
            value: jsValue,
            writable: true,
            enumerable: true,
            configurable: true
          });
        else
          map[stringKey] = jsValue;
      }
    }
    return map;
  }
  function stringifyKey(key, jsKey, ctx) {
    if (jsKey === null)
      return "";
    if (typeof jsKey !== "object")
      return String(jsKey);
    if (identity.isNode(key) && ctx?.doc) {
      const strCtx = stringify.createStringifyContext(ctx.doc, {});
      strCtx.anchors = new Set;
      for (const node of ctx.anchors.keys())
        strCtx.anchors.add(node.anchor);
      strCtx.inFlow = true;
      strCtx.inStringifyKey = true;
      const strKey = key.toString(strCtx);
      if (!ctx.mapKeyWarned) {
        let jsonStr = JSON.stringify(strKey);
        if (jsonStr.length > 40)
          jsonStr = jsonStr.substring(0, 36) + '..."';
        log.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
        ctx.mapKeyWarned = true;
      }
      return strKey;
    }
    return JSON.stringify(jsKey);
  }
  exports.addPairToJSMap = addPairToJSMap;
});

// node_modules/yaml/dist/nodes/Pair.js
var require_Pair = __commonJS((exports) => {
  var createNode = require_createNode();
  var stringifyPair = require_stringifyPair();
  var addPairToJSMap = require_addPairToJSMap();
  var identity = require_identity();
  function createPair(key, value, ctx) {
    const k = createNode.createNode(key, undefined, ctx);
    const v = createNode.createNode(value, undefined, ctx);
    return new Pair(k, v);
  }

  class Pair {
    constructor(key, value = null) {
      Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
      this.key = key;
      this.value = value;
    }
    clone(schema) {
      let { key, value } = this;
      if (identity.isNode(key))
        key = key.clone(schema);
      if (identity.isNode(value))
        value = value.clone(schema);
      return new Pair(key, value);
    }
    toJSON(_, ctx) {
      const pair = ctx?.mapAsMap ? new Map : {};
      return addPairToJSMap.addPairToJSMap(ctx, pair, this);
    }
    toString(ctx, onComment, onChompKeep) {
      return ctx?.doc ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
    }
  }
  exports.Pair = Pair;
  exports.createPair = createPair;
});

// node_modules/yaml/dist/stringify/stringifyCollection.js
var require_stringifyCollection = __commonJS((exports) => {
  var identity = require_identity();
  var stringify = require_stringify();
  var stringifyComment = require_stringifyComment();
  function stringifyCollection(collection, ctx, options) {
    const flow = ctx.inFlow ?? collection.flow;
    const stringify2 = flow ? stringifyFlowCollection : stringifyBlockCollection;
    return stringify2(collection, ctx, options);
  }
  function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
    const { indent, options: { commentString } } = ctx;
    const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
    let chompKeep = false;
    const lines = [];
    for (let i = 0;i < items.length; ++i) {
      const item = items[i];
      let comment2 = null;
      if (identity.isNode(item)) {
        if (!chompKeep && item.spaceBefore)
          lines.push("");
        addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
        if (item.comment)
          comment2 = item.comment;
      } else if (identity.isPair(item)) {
        const ik = identity.isNode(item.key) ? item.key : null;
        if (ik) {
          if (!chompKeep && ik.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
        }
      }
      chompKeep = false;
      let str2 = stringify.stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
      if (comment2)
        str2 += stringifyComment.lineComment(str2, itemIndent, commentString(comment2));
      if (chompKeep && comment2)
        chompKeep = false;
      lines.push(blockItemPrefix + str2);
    }
    let str;
    if (lines.length === 0) {
      str = flowChars.start + flowChars.end;
    } else {
      str = lines[0];
      for (let i = 1;i < lines.length; ++i) {
        const line = lines[i];
        str += line ? `
${indent}${line}` : `
`;
      }
    }
    if (comment) {
      str += `
` + stringifyComment.indentComment(commentString(comment), indent);
      if (onComment)
        onComment();
    } else if (chompKeep && onChompKeep)
      onChompKeep();
    return str;
  }
  function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
    const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
    itemIndent += indentStep;
    const itemCtx = Object.assign({}, ctx, {
      indent: itemIndent,
      inFlow: true,
      type: null
    });
    let reqNewline = false;
    let linesAtValue = 0;
    const lines = [];
    for (let i = 0;i < items.length; ++i) {
      const item = items[i];
      let comment = null;
      if (identity.isNode(item)) {
        if (item.spaceBefore)
          lines.push("");
        addCommentBefore(ctx, lines, item.commentBefore, false);
        if (item.comment)
          comment = item.comment;
      } else if (identity.isPair(item)) {
        const ik = identity.isNode(item.key) ? item.key : null;
        if (ik) {
          if (ik.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, ik.commentBefore, false);
          if (ik.comment)
            reqNewline = true;
        }
        const iv = identity.isNode(item.value) ? item.value : null;
        if (iv) {
          if (iv.comment)
            comment = iv.comment;
          if (iv.commentBefore)
            reqNewline = true;
        } else if (item.value == null && ik?.comment) {
          comment = ik.comment;
        }
      }
      if (comment)
        reqNewline = true;
      let str = stringify.stringify(item, itemCtx, () => comment = null);
      reqNewline || (reqNewline = lines.length > linesAtValue || str.includes(`
`));
      if (i < items.length - 1) {
        str += ",";
      } else if (ctx.options.trailingComma) {
        if (ctx.options.lineWidth > 0) {
          reqNewline || (reqNewline = lines.reduce((sum, line) => sum + line.length + 2, 2) + (str.length + 2) > ctx.options.lineWidth);
        }
        if (reqNewline) {
          str += ",";
        }
      }
      if (comment)
        str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
      lines.push(str);
      linesAtValue = lines.length;
    }
    const { start, end } = flowChars;
    if (lines.length === 0) {
      return start + end;
    } else {
      if (!reqNewline) {
        const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
        reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
      }
      if (reqNewline) {
        let str = start;
        for (const line of lines)
          str += line ? `
${indentStep}${indent}${line}` : `
`;
        return `${str}
${indent}${end}`;
      } else {
        return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
      }
    }
  }
  function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
    if (comment && chompKeep)
      comment = comment.replace(/^\n+/, "");
    if (comment) {
      const ic = stringifyComment.indentComment(commentString(comment), indent);
      lines.push(ic.trimStart());
    }
  }
  exports.stringifyCollection = stringifyCollection;
});

// node_modules/yaml/dist/nodes/YAMLMap.js
var require_YAMLMap = __commonJS((exports) => {
  var stringifyCollection = require_stringifyCollection();
  var addPairToJSMap = require_addPairToJSMap();
  var Collection = require_Collection();
  var identity = require_identity();
  var Pair = require_Pair();
  var Scalar = require_Scalar();
  function findPair(items, key) {
    const k = identity.isScalar(key) ? key.value : key;
    for (const it of items) {
      if (identity.isPair(it)) {
        if (it.key === key || it.key === k)
          return it;
        if (identity.isScalar(it.key) && it.key.value === k)
          return it;
      }
    }
    return;
  }

  class YAMLMap extends Collection.Collection {
    static get tagName() {
      return "tag:yaml.org,2002:map";
    }
    constructor(schema) {
      super(identity.MAP, schema);
      this.items = [];
    }
    static from(schema, obj, ctx) {
      const { keepUndefined, replacer } = ctx;
      const map = new this(schema);
      const add = (key, value) => {
        if (typeof replacer === "function")
          value = replacer.call(obj, key, value);
        else if (Array.isArray(replacer) && !replacer.includes(key))
          return;
        if (value !== undefined || keepUndefined)
          map.items.push(Pair.createPair(key, value, ctx));
      };
      if (obj instanceof Map) {
        for (const [key, value] of obj)
          add(key, value);
      } else if (obj && typeof obj === "object") {
        for (const key of Object.keys(obj))
          add(key, obj[key]);
      }
      if (typeof schema.sortMapEntries === "function") {
        map.items.sort(schema.sortMapEntries);
      }
      return map;
    }
    add(pair, overwrite) {
      let _pair;
      if (identity.isPair(pair))
        _pair = pair;
      else if (!pair || typeof pair !== "object" || !("key" in pair)) {
        _pair = new Pair.Pair(pair, pair?.value);
      } else
        _pair = new Pair.Pair(pair.key, pair.value);
      const prev = findPair(this.items, _pair.key);
      const sortEntries = this.schema?.sortMapEntries;
      if (prev) {
        if (!overwrite)
          throw new Error(`Key ${_pair.key} already set`);
        if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value))
          prev.value.value = _pair.value;
        else
          prev.value = _pair.value;
      } else if (sortEntries) {
        const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
        if (i === -1)
          this.items.push(_pair);
        else
          this.items.splice(i, 0, _pair);
      } else {
        this.items.push(_pair);
      }
    }
    delete(key) {
      const it = findPair(this.items, key);
      if (!it)
        return false;
      const del = this.items.splice(this.items.indexOf(it), 1);
      return del.length > 0;
    }
    get(key, keepScalar) {
      const it = findPair(this.items, key);
      const node = it?.value;
      return (!keepScalar && identity.isScalar(node) ? node.value : node) ?? undefined;
    }
    has(key) {
      return !!findPair(this.items, key);
    }
    set(key, value) {
      this.add(new Pair.Pair(key, value), true);
    }
    toJSON(_, ctx, Type) {
      const map = Type ? new Type : ctx?.mapAsMap ? new Map : {};
      if (ctx?.onCreate)
        ctx.onCreate(map);
      for (const item of this.items)
        addPairToJSMap.addPairToJSMap(ctx, map, item);
      return map;
    }
    toString(ctx, onComment, onChompKeep) {
      if (!ctx)
        return JSON.stringify(this);
      for (const item of this.items) {
        if (!identity.isPair(item))
          throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
      }
      if (!ctx.allNullValues && this.hasAllNullValues(false))
        ctx = Object.assign({}, ctx, { allNullValues: true });
      return stringifyCollection.stringifyCollection(this, ctx, {
        blockItemPrefix: "",
        flowChars: { start: "{", end: "}" },
        itemIndent: ctx.indent || "",
        onChompKeep,
        onComment
      });
    }
  }
  exports.YAMLMap = YAMLMap;
  exports.findPair = findPair;
});

// node_modules/yaml/dist/schema/common/map.js
var require_map = __commonJS((exports) => {
  var identity = require_identity();
  var YAMLMap = require_YAMLMap();
  var map = {
    collection: "map",
    default: true,
    nodeClass: YAMLMap.YAMLMap,
    tag: "tag:yaml.org,2002:map",
    resolve(map2, onError) {
      if (!identity.isMap(map2))
        onError("Expected a mapping for this tag");
      return map2;
    },
    createNode: (schema, obj, ctx) => YAMLMap.YAMLMap.from(schema, obj, ctx)
  };
  exports.map = map;
});

// node_modules/yaml/dist/nodes/YAMLSeq.js
var require_YAMLSeq = __commonJS((exports) => {
  var createNode = require_createNode();
  var stringifyCollection = require_stringifyCollection();
  var Collection = require_Collection();
  var identity = require_identity();
  var Scalar = require_Scalar();
  var toJS = require_toJS();

  class YAMLSeq extends Collection.Collection {
    static get tagName() {
      return "tag:yaml.org,2002:seq";
    }
    constructor(schema) {
      super(identity.SEQ, schema);
      this.items = [];
    }
    add(value) {
      this.items.push(value);
    }
    delete(key) {
      const idx = asItemIndex(key);
      if (typeof idx !== "number")
        return false;
      const del = this.items.splice(idx, 1);
      return del.length > 0;
    }
    get(key, keepScalar) {
      const idx = asItemIndex(key);
      if (typeof idx !== "number")
        return;
      const it = this.items[idx];
      return !keepScalar && identity.isScalar(it) ? it.value : it;
    }
    has(key) {
      const idx = asItemIndex(key);
      return typeof idx === "number" && idx < this.items.length;
    }
    set(key, value) {
      const idx = asItemIndex(key);
      if (typeof idx !== "number")
        throw new Error(`Expected a valid index, not ${key}.`);
      const prev = this.items[idx];
      if (identity.isScalar(prev) && Scalar.isScalarValue(value))
        prev.value = value;
      else
        this.items[idx] = value;
    }
    toJSON(_, ctx) {
      const seq = [];
      if (ctx?.onCreate)
        ctx.onCreate(seq);
      let i = 0;
      for (const item of this.items)
        seq.push(toJS.toJS(item, String(i++), ctx));
      return seq;
    }
    toString(ctx, onComment, onChompKeep) {
      if (!ctx)
        return JSON.stringify(this);
      return stringifyCollection.stringifyCollection(this, ctx, {
        blockItemPrefix: "- ",
        flowChars: { start: "[", end: "]" },
        itemIndent: (ctx.indent || "") + "  ",
        onChompKeep,
        onComment
      });
    }
    static from(schema, obj, ctx) {
      const { replacer } = ctx;
      const seq = new this(schema);
      if (obj && Symbol.iterator in Object(obj)) {
        let i = 0;
        for (let it of obj) {
          if (typeof replacer === "function") {
            const key = obj instanceof Set ? it : String(i++);
            it = replacer.call(obj, key, it);
          }
          seq.items.push(createNode.createNode(it, undefined, ctx));
        }
      }
      return seq;
    }
  }
  function asItemIndex(key) {
    let idx = identity.isScalar(key) ? key.value : key;
    if (idx && typeof idx === "string")
      idx = Number(idx);
    return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
  }
  exports.YAMLSeq = YAMLSeq;
});

// node_modules/yaml/dist/schema/common/seq.js
var require_seq = __commonJS((exports) => {
  var identity = require_identity();
  var YAMLSeq = require_YAMLSeq();
  var seq = {
    collection: "seq",
    default: true,
    nodeClass: YAMLSeq.YAMLSeq,
    tag: "tag:yaml.org,2002:seq",
    resolve(seq2, onError) {
      if (!identity.isSeq(seq2))
        onError("Expected a sequence for this tag");
      return seq2;
    },
    createNode: (schema, obj, ctx) => YAMLSeq.YAMLSeq.from(schema, obj, ctx)
  };
  exports.seq = seq;
});

// node_modules/yaml/dist/schema/common/string.js
var require_string = __commonJS((exports) => {
  var stringifyString = require_stringifyString();
  var string = {
    identify: (value) => typeof value === "string",
    default: true,
    tag: "tag:yaml.org,2002:str",
    resolve: (str) => str,
    stringify(item, ctx, onComment, onChompKeep) {
      ctx = Object.assign({ actualString: true }, ctx);
      return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
    }
  };
  exports.string = string;
});

// node_modules/yaml/dist/schema/common/null.js
var require_null = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var nullTag = {
    identify: (value) => value == null,
    createNode: () => new Scalar.Scalar(null),
    default: true,
    tag: "tag:yaml.org,2002:null",
    test: /^(?:~|[Nn]ull|NULL)?$/,
    resolve: () => new Scalar.Scalar(null),
    stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
  };
  exports.nullTag = nullTag;
});

// node_modules/yaml/dist/schema/core/bool.js
var require_bool = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var boolTag = {
    identify: (value) => typeof value === "boolean",
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
    resolve: (str) => new Scalar.Scalar(str[0] === "t" || str[0] === "T"),
    stringify({ source, value }, ctx) {
      if (source && boolTag.test.test(source)) {
        const sv = source[0] === "t" || source[0] === "T";
        if (value === sv)
          return source;
      }
      return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
  };
  exports.boolTag = boolTag;
});

// node_modules/yaml/dist/stringify/stringifyNumber.js
var require_stringifyNumber = __commonJS((exports) => {
  function stringifyNumber({ format, minFractionDigits, tag, value }) {
    if (typeof value === "bigint")
      return String(value);
    const num = typeof value === "number" ? value : Number(value);
    if (!isFinite(num))
      return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
    let n = Object.is(value, -0) ? "-0" : JSON.stringify(value);
    if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^-?\d/.test(n) && !n.includes("e")) {
      let i = n.indexOf(".");
      if (i < 0) {
        i = n.length;
        n += ".";
      }
      let d = minFractionDigits - (n.length - i - 1);
      while (d-- > 0)
        n += "0";
    }
    return n;
  }
  exports.stringifyNumber = stringifyNumber;
});

// node_modules/yaml/dist/schema/core/float.js
var require_float = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var stringifyNumber = require_stringifyNumber();
  var floatNaN = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    stringify: stringifyNumber.stringifyNumber
  };
  var floatExp = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
    resolve: (str) => parseFloat(str),
    stringify(node) {
      const num = Number(node.value);
      return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
    }
  };
  var float = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
    resolve(str) {
      const node = new Scalar.Scalar(parseFloat(str));
      const dot = str.indexOf(".");
      if (dot !== -1 && str[str.length - 1] === "0")
        node.minFractionDigits = str.length - dot - 1;
      return node;
    },
    stringify: stringifyNumber.stringifyNumber
  };
  exports.float = float;
  exports.floatExp = floatExp;
  exports.floatNaN = floatNaN;
});

// node_modules/yaml/dist/schema/core/int.js
var require_int = __commonJS((exports) => {
  var stringifyNumber = require_stringifyNumber();
  var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
  var intResolve = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
  function intStringify(node, radix, prefix) {
    const { value } = node;
    if (intIdentify(value) && value >= 0)
      return prefix + value.toString(radix);
    return stringifyNumber.stringifyNumber(node);
  }
  var intOct = {
    identify: (value) => intIdentify(value) && value >= 0,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^0o[0-7]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
    stringify: (node) => intStringify(node, 8, "0o")
  };
  var int = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
    stringify: stringifyNumber.stringifyNumber
  };
  var intHex = {
    identify: (value) => intIdentify(value) && value >= 0,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^0x[0-9a-fA-F]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
    stringify: (node) => intStringify(node, 16, "0x")
  };
  exports.int = int;
  exports.intHex = intHex;
  exports.intOct = intOct;
});

// node_modules/yaml/dist/schema/core/schema.js
var require_schema = __commonJS((exports) => {
  var map = require_map();
  var _null = require_null();
  var seq = require_seq();
  var string = require_string();
  var bool = require_bool();
  var float = require_float();
  var int = require_int();
  var schema = [
    map.map,
    seq.seq,
    string.string,
    _null.nullTag,
    bool.boolTag,
    int.intOct,
    int.int,
    int.intHex,
    float.floatNaN,
    float.floatExp,
    float.float
  ];
  exports.schema = schema;
});

// node_modules/yaml/dist/schema/json/schema.js
var require_schema2 = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var map = require_map();
  var seq = require_seq();
  function intIdentify(value) {
    return typeof value === "bigint" || Number.isInteger(value);
  }
  var stringifyJSON = ({ value }) => JSON.stringify(value);
  var jsonScalars = [
    {
      identify: (value) => typeof value === "string",
      default: true,
      tag: "tag:yaml.org,2002:str",
      resolve: (str) => str,
      stringify: stringifyJSON
    },
    {
      identify: (value) => value == null,
      createNode: () => new Scalar.Scalar(null),
      default: true,
      tag: "tag:yaml.org,2002:null",
      test: /^null$/,
      resolve: () => null,
      stringify: stringifyJSON
    },
    {
      identify: (value) => typeof value === "boolean",
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^true$|^false$/,
      resolve: (str) => str === "true",
      stringify: stringifyJSON
    },
    {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^-?(?:0|[1-9][0-9]*)$/,
      resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
      stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
    },
    {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
      resolve: (str) => parseFloat(str),
      stringify: stringifyJSON
    }
  ];
  var jsonError = {
    default: true,
    tag: "",
    test: /^/,
    resolve(str, onError) {
      onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
      return str;
    }
  };
  var schema = [map.map, seq.seq].concat(jsonScalars, jsonError);
  exports.schema = schema;
});

// node_modules/yaml/dist/schema/yaml-1.1/binary.js
var require_binary = __commonJS((exports) => {
  var node_buffer = __require("buffer");
  var Scalar = require_Scalar();
  var stringifyString = require_stringifyString();
  var binary = {
    identify: (value) => value instanceof Uint8Array,
    default: false,
    tag: "tag:yaml.org,2002:binary",
    resolve(src, onError) {
      if (typeof node_buffer.Buffer === "function") {
        return node_buffer.Buffer.from(src, "base64");
      } else if (typeof atob === "function") {
        const str = atob(src.replace(/[\n\r]/g, ""));
        const buffer = new Uint8Array(str.length);
        for (let i = 0;i < str.length; ++i)
          buffer[i] = str.charCodeAt(i);
        return buffer;
      } else {
        onError("This environment does not support reading binary tags; either Buffer or atob is required");
        return src;
      }
    },
    stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
      if (!value)
        return "";
      const buf = value;
      let str;
      if (typeof node_buffer.Buffer === "function") {
        str = buf instanceof node_buffer.Buffer ? buf.toString("base64") : node_buffer.Buffer.from(buf.buffer).toString("base64");
      } else if (typeof btoa === "function") {
        let s = "";
        for (let i = 0;i < buf.length; ++i)
          s += String.fromCharCode(buf[i]);
        str = btoa(s);
      } else {
        throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
      }
      type ?? (type = Scalar.Scalar.BLOCK_LITERAL);
      if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
        const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
        const n = Math.ceil(str.length / lineWidth);
        const lines = new Array(n);
        for (let i = 0, o = 0;i < n; ++i, o += lineWidth) {
          lines[i] = str.substr(o, lineWidth);
        }
        str = lines.join(type === Scalar.Scalar.BLOCK_LITERAL ? `
` : " ");
      }
      return stringifyString.stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
    }
  };
  exports.binary = binary;
});

// node_modules/yaml/dist/schema/yaml-1.1/pairs.js
var require_pairs = __commonJS((exports) => {
  var identity = require_identity();
  var Pair = require_Pair();
  var Scalar = require_Scalar();
  var YAMLSeq = require_YAMLSeq();
  function resolvePairs(seq, onError) {
    if (identity.isSeq(seq)) {
      for (let i = 0;i < seq.items.length; ++i) {
        let item = seq.items[i];
        if (identity.isPair(item))
          continue;
        else if (identity.isMap(item)) {
          if (item.items.length > 1)
            onError("Each pair must have its own sequence indicator");
          const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
          if (item.commentBefore)
            pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
          if (item.comment) {
            const cn = pair.value ?? pair.key;
            cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
          }
          item = pair;
        }
        seq.items[i] = identity.isPair(item) ? item : new Pair.Pair(item);
      }
    } else
      onError("Expected a sequence for this tag");
    return seq;
  }
  function createPairs(schema, iterable, ctx) {
    const { replacer } = ctx;
    const pairs2 = new YAMLSeq.YAMLSeq(schema);
    pairs2.tag = "tag:yaml.org,2002:pairs";
    let i = 0;
    if (iterable && Symbol.iterator in Object(iterable))
      for (let it of iterable) {
        if (typeof replacer === "function")
          it = replacer.call(iterable, String(i++), it);
        let key, value;
        if (Array.isArray(it)) {
          if (it.length === 2) {
            key = it[0];
            value = it[1];
          } else
            throw new TypeError(`Expected [key, value] tuple: ${it}`);
        } else if (it && it instanceof Object) {
          const keys = Object.keys(it);
          if (keys.length === 1) {
            key = keys[0];
            value = it[key];
          } else {
            throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
          }
        } else {
          key = it;
        }
        pairs2.items.push(Pair.createPair(key, value, ctx));
      }
    return pairs2;
  }
  var pairs = {
    collection: "seq",
    default: false,
    tag: "tag:yaml.org,2002:pairs",
    resolve: resolvePairs,
    createNode: createPairs
  };
  exports.createPairs = createPairs;
  exports.pairs = pairs;
  exports.resolvePairs = resolvePairs;
});

// node_modules/yaml/dist/schema/yaml-1.1/omap.js
var require_omap = __commonJS((exports) => {
  var identity = require_identity();
  var toJS = require_toJS();
  var YAMLMap = require_YAMLMap();
  var YAMLSeq = require_YAMLSeq();
  var pairs = require_pairs();

  class YAMLOMap extends YAMLSeq.YAMLSeq {
    constructor() {
      super();
      this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
      this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
      this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
      this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
      this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
      this.tag = YAMLOMap.tag;
    }
    toJSON(_, ctx) {
      if (!ctx)
        return super.toJSON(_);
      const map = new Map;
      if (ctx?.onCreate)
        ctx.onCreate(map);
      for (const pair of this.items) {
        let key, value;
        if (identity.isPair(pair)) {
          key = toJS.toJS(pair.key, "", ctx);
          value = toJS.toJS(pair.value, key, ctx);
        } else {
          key = toJS.toJS(pair, "", ctx);
        }
        if (map.has(key))
          throw new Error("Ordered maps must not include duplicate keys");
        map.set(key, value);
      }
      return map;
    }
    static from(schema, iterable, ctx) {
      const pairs$1 = pairs.createPairs(schema, iterable, ctx);
      const omap2 = new this;
      omap2.items = pairs$1.items;
      return omap2;
    }
  }
  YAMLOMap.tag = "tag:yaml.org,2002:omap";
  var omap = {
    collection: "seq",
    identify: (value) => value instanceof Map,
    nodeClass: YAMLOMap,
    default: false,
    tag: "tag:yaml.org,2002:omap",
    resolve(seq, onError) {
      const pairs$1 = pairs.resolvePairs(seq, onError);
      const seenKeys = [];
      for (const { key } of pairs$1.items) {
        if (identity.isScalar(key)) {
          if (seenKeys.includes(key.value)) {
            onError(`Ordered maps must not include duplicate keys: ${key.value}`);
          } else {
            seenKeys.push(key.value);
          }
        }
      }
      return Object.assign(new YAMLOMap, pairs$1);
    },
    createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
  };
  exports.YAMLOMap = YAMLOMap;
  exports.omap = omap;
});

// node_modules/yaml/dist/schema/yaml-1.1/bool.js
var require_bool2 = __commonJS((exports) => {
  var Scalar = require_Scalar();
  function boolStringify({ value, source }, ctx) {
    const boolObj = value ? trueTag : falseTag;
    if (source && boolObj.test.test(source))
      return source;
    return value ? ctx.options.trueStr : ctx.options.falseStr;
  }
  var trueTag = {
    identify: (value) => value === true,
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
    resolve: () => new Scalar.Scalar(true),
    stringify: boolStringify
  };
  var falseTag = {
    identify: (value) => value === false,
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
    resolve: () => new Scalar.Scalar(false),
    stringify: boolStringify
  };
  exports.falseTag = falseTag;
  exports.trueTag = trueTag;
});

// node_modules/yaml/dist/schema/yaml-1.1/float.js
var require_float2 = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var stringifyNumber = require_stringifyNumber();
  var floatNaN = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    stringify: stringifyNumber.stringifyNumber
  };
  var floatExp = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
    resolve: (str) => parseFloat(str.replace(/_/g, "")),
    stringify(node) {
      const num = Number(node.value);
      return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
    }
  };
  var float = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
    resolve(str) {
      const node = new Scalar.Scalar(parseFloat(str.replace(/_/g, "")));
      const dot = str.indexOf(".");
      if (dot !== -1) {
        const f = str.substring(dot + 1).replace(/_/g, "");
        if (f[f.length - 1] === "0")
          node.minFractionDigits = f.length;
      }
      return node;
    },
    stringify: stringifyNumber.stringifyNumber
  };
  exports.float = float;
  exports.floatExp = floatExp;
  exports.floatNaN = floatNaN;
});

// node_modules/yaml/dist/schema/yaml-1.1/int.js
var require_int2 = __commonJS((exports) => {
  var stringifyNumber = require_stringifyNumber();
  var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
  function intResolve(str, offset, radix, { intAsBigInt }) {
    const sign = str[0];
    if (sign === "-" || sign === "+")
      offset += 1;
    str = str.substring(offset).replace(/_/g, "");
    if (intAsBigInt) {
      switch (radix) {
        case 2:
          str = `0b${str}`;
          break;
        case 8:
          str = `0o${str}`;
          break;
        case 16:
          str = `0x${str}`;
          break;
      }
      const n2 = BigInt(str);
      return sign === "-" ? BigInt(-1) * n2 : n2;
    }
    const n = parseInt(str, radix);
    return sign === "-" ? -1 * n : n;
  }
  function intStringify(node, radix, prefix) {
    const { value } = node;
    if (intIdentify(value)) {
      const str = value.toString(radix);
      return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
    }
    return stringifyNumber.stringifyNumber(node);
  }
  var intBin = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "BIN",
    test: /^[-+]?0b[0-1_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
    stringify: (node) => intStringify(node, 2, "0b")
  };
  var intOct = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^[-+]?0[0-7_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
    stringify: (node) => intStringify(node, 8, "0")
  };
  var int = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9][0-9_]*$/,
    resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
    stringify: stringifyNumber.stringifyNumber
  };
  var intHex = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^[-+]?0x[0-9a-fA-F_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
    stringify: (node) => intStringify(node, 16, "0x")
  };
  exports.int = int;
  exports.intBin = intBin;
  exports.intHex = intHex;
  exports.intOct = intOct;
});

// node_modules/yaml/dist/schema/yaml-1.1/set.js
var require_set = __commonJS((exports) => {
  var identity = require_identity();
  var Pair = require_Pair();
  var YAMLMap = require_YAMLMap();

  class YAMLSet extends YAMLMap.YAMLMap {
    constructor(schema) {
      super(schema);
      this.tag = YAMLSet.tag;
    }
    add(key) {
      let pair;
      if (identity.isPair(key))
        pair = key;
      else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
        pair = new Pair.Pair(key.key, null);
      else
        pair = new Pair.Pair(key, null);
      const prev = YAMLMap.findPair(this.items, pair.key);
      if (!prev)
        this.items.push(pair);
    }
    get(key, keepPair) {
      const pair = YAMLMap.findPair(this.items, key);
      return !keepPair && identity.isPair(pair) ? identity.isScalar(pair.key) ? pair.key.value : pair.key : pair;
    }
    set(key, value) {
      if (typeof value !== "boolean")
        throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
      const prev = YAMLMap.findPair(this.items, key);
      if (prev && !value) {
        this.items.splice(this.items.indexOf(prev), 1);
      } else if (!prev && value) {
        this.items.push(new Pair.Pair(key));
      }
    }
    toJSON(_, ctx) {
      return super.toJSON(_, ctx, Set);
    }
    toString(ctx, onComment, onChompKeep) {
      if (!ctx)
        return JSON.stringify(this);
      if (this.hasAllNullValues(true))
        return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
      else
        throw new Error("Set items must all have null values");
    }
    static from(schema, iterable, ctx) {
      const { replacer } = ctx;
      const set2 = new this(schema);
      if (iterable && Symbol.iterator in Object(iterable))
        for (let value of iterable) {
          if (typeof replacer === "function")
            value = replacer.call(iterable, value, value);
          set2.items.push(Pair.createPair(value, null, ctx));
        }
      return set2;
    }
  }
  YAMLSet.tag = "tag:yaml.org,2002:set";
  var set = {
    collection: "map",
    identify: (value) => value instanceof Set,
    nodeClass: YAMLSet,
    default: false,
    tag: "tag:yaml.org,2002:set",
    createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
    resolve(map, onError) {
      if (identity.isMap(map)) {
        if (map.hasAllNullValues(true))
          return Object.assign(new YAMLSet, map);
        else
          onError("Set items must all have null values");
      } else
        onError("Expected a mapping for this tag");
      return map;
    }
  };
  exports.YAMLSet = YAMLSet;
  exports.set = set;
});

// node_modules/yaml/dist/schema/yaml-1.1/timestamp.js
var require_timestamp = __commonJS((exports) => {
  var stringifyNumber = require_stringifyNumber();
  function parseSexagesimal(str, asBigInt) {
    const sign = str[0];
    const parts = sign === "-" || sign === "+" ? str.substring(1) : str;
    const num = (n) => asBigInt ? BigInt(n) : Number(n);
    const res = parts.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num(60) + num(p), num(0));
    return sign === "-" ? num(-1) * res : res;
  }
  function stringifySexagesimal(node) {
    let { value } = node;
    let num = (n) => n;
    if (typeof value === "bigint")
      num = (n) => BigInt(n);
    else if (isNaN(value) || !isFinite(value))
      return stringifyNumber.stringifyNumber(node);
    let sign = "";
    if (value < 0) {
      sign = "-";
      value *= num(-1);
    }
    const _60 = num(60);
    const parts = [value % _60];
    if (value < 60) {
      parts.unshift(0);
    } else {
      value = (value - parts[0]) / _60;
      parts.unshift(value % _60);
      if (value >= 60) {
        value = (value - parts[0]) / _60;
        parts.unshift(value);
      }
    }
    return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
  }
  var intTime = {
    identify: (value) => typeof value === "bigint" || Number.isInteger(value),
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
    resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
    stringify: stringifySexagesimal
  };
  var floatTime = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
    resolve: (str) => parseSexagesimal(str, false),
    stringify: stringifySexagesimal
  };
  var timestamp = {
    identify: (value) => value instanceof Date,
    default: true,
    tag: "tag:yaml.org,2002:timestamp",
    test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})" + "(?:" + "(?:t|T|[ \\t]+)" + "([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)" + "(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?" + ")?$"),
    resolve(str) {
      const match = str.match(timestamp.test);
      if (!match)
        throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
      const [, year, month, day, hour, minute, second] = match.map(Number);
      const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
      let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
      const tz = match[8];
      if (tz && tz !== "Z") {
        let d = parseSexagesimal(tz, false);
        if (Math.abs(d) < 30)
          d *= 60;
        date -= 60000 * d;
      }
      return new Date(date);
    },
    stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
  };
  exports.floatTime = floatTime;
  exports.intTime = intTime;
  exports.timestamp = timestamp;
});

// node_modules/yaml/dist/schema/yaml-1.1/schema.js
var require_schema3 = __commonJS((exports) => {
  var map = require_map();
  var _null = require_null();
  var seq = require_seq();
  var string = require_string();
  var binary = require_binary();
  var bool = require_bool2();
  var float = require_float2();
  var int = require_int2();
  var merge = require_merge();
  var omap = require_omap();
  var pairs = require_pairs();
  var set = require_set();
  var timestamp = require_timestamp();
  var schema = [
    map.map,
    seq.seq,
    string.string,
    _null.nullTag,
    bool.trueTag,
    bool.falseTag,
    int.intBin,
    int.intOct,
    int.int,
    int.intHex,
    float.floatNaN,
    float.floatExp,
    float.float,
    binary.binary,
    merge.merge,
    omap.omap,
    pairs.pairs,
    set.set,
    timestamp.intTime,
    timestamp.floatTime,
    timestamp.timestamp
  ];
  exports.schema = schema;
});

// node_modules/yaml/dist/schema/tags.js
var require_tags = __commonJS((exports) => {
  var map = require_map();
  var _null = require_null();
  var seq = require_seq();
  var string = require_string();
  var bool = require_bool();
  var float = require_float();
  var int = require_int();
  var schema = require_schema();
  var schema$1 = require_schema2();
  var binary = require_binary();
  var merge = require_merge();
  var omap = require_omap();
  var pairs = require_pairs();
  var schema$2 = require_schema3();
  var set = require_set();
  var timestamp = require_timestamp();
  var schemas = new Map([
    ["core", schema.schema],
    ["failsafe", [map.map, seq.seq, string.string]],
    ["json", schema$1.schema],
    ["yaml11", schema$2.schema],
    ["yaml-1.1", schema$2.schema]
  ]);
  var tagsByName = {
    binary: binary.binary,
    bool: bool.boolTag,
    float: float.float,
    floatExp: float.floatExp,
    floatNaN: float.floatNaN,
    floatTime: timestamp.floatTime,
    int: int.int,
    intHex: int.intHex,
    intOct: int.intOct,
    intTime: timestamp.intTime,
    map: map.map,
    merge: merge.merge,
    null: _null.nullTag,
    omap: omap.omap,
    pairs: pairs.pairs,
    seq: seq.seq,
    set: set.set,
    timestamp: timestamp.timestamp
  };
  var coreKnownTags = {
    "tag:yaml.org,2002:binary": binary.binary,
    "tag:yaml.org,2002:merge": merge.merge,
    "tag:yaml.org,2002:omap": omap.omap,
    "tag:yaml.org,2002:pairs": pairs.pairs,
    "tag:yaml.org,2002:set": set.set,
    "tag:yaml.org,2002:timestamp": timestamp.timestamp
  };
  function getTags(customTags, schemaName, addMergeTag) {
    const schemaTags = schemas.get(schemaName);
    if (schemaTags && !customTags) {
      return addMergeTag && !schemaTags.includes(merge.merge) ? schemaTags.concat(merge.merge) : schemaTags.slice();
    }
    let tags = schemaTags;
    if (!tags) {
      if (Array.isArray(customTags))
        tags = [];
      else {
        const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
        throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
      }
    }
    if (Array.isArray(customTags)) {
      for (const tag of customTags)
        tags = tags.concat(tag);
    } else if (typeof customTags === "function") {
      tags = customTags(tags.slice());
    }
    if (addMergeTag)
      tags = tags.concat(merge.merge);
    return tags.reduce((tags2, tag) => {
      const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
      if (!tagObj) {
        const tagName = JSON.stringify(tag);
        const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
        throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
      }
      if (!tags2.includes(tagObj))
        tags2.push(tagObj);
      return tags2;
    }, []);
  }
  exports.coreKnownTags = coreKnownTags;
  exports.getTags = getTags;
});

// node_modules/yaml/dist/schema/Schema.js
var require_Schema = __commonJS((exports) => {
  var identity = require_identity();
  var map = require_map();
  var seq = require_seq();
  var string = require_string();
  var tags = require_tags();
  var sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;

  class Schema {
    constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
      this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
      this.name = typeof schema === "string" && schema || "core";
      this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
      this.tags = tags.getTags(customTags, this.name, merge);
      this.toStringOptions = toStringDefaults ?? null;
      Object.defineProperty(this, identity.MAP, { value: map.map });
      Object.defineProperty(this, identity.SCALAR, { value: string.string });
      Object.defineProperty(this, identity.SEQ, { value: seq.seq });
      this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
    }
    clone() {
      const copy = Object.create(Schema.prototype, Object.getOwnPropertyDescriptors(this));
      copy.tags = this.tags.slice();
      return copy;
    }
  }
  exports.Schema = Schema;
});

// node_modules/yaml/dist/stringify/stringifyDocument.js
var require_stringifyDocument = __commonJS((exports) => {
  var identity = require_identity();
  var stringify = require_stringify();
  var stringifyComment = require_stringifyComment();
  function stringifyDocument(doc, options) {
    const lines = [];
    let hasDirectives = options.directives === true;
    if (options.directives !== false && doc.directives) {
      const dir = doc.directives.toString(doc);
      if (dir) {
        lines.push(dir);
        hasDirectives = true;
      } else if (doc.directives.docStart)
        hasDirectives = true;
    }
    if (hasDirectives)
      lines.push("---");
    const ctx = stringify.createStringifyContext(doc, options);
    const { commentString } = ctx.options;
    if (doc.commentBefore) {
      if (lines.length !== 1)
        lines.unshift("");
      const cs = commentString(doc.commentBefore);
      lines.unshift(stringifyComment.indentComment(cs, ""));
    }
    let chompKeep = false;
    let contentComment = null;
    if (doc.contents) {
      if (identity.isNode(doc.contents)) {
        if (doc.contents.spaceBefore && hasDirectives)
          lines.push("");
        if (doc.contents.commentBefore) {
          const cs = commentString(doc.contents.commentBefore);
          lines.push(stringifyComment.indentComment(cs, ""));
        }
        ctx.forceBlockIndent = !!doc.comment;
        contentComment = doc.contents.comment;
      }
      const onChompKeep = contentComment ? undefined : () => chompKeep = true;
      let body = stringify.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
      if (contentComment)
        body += stringifyComment.lineComment(body, "", commentString(contentComment));
      if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
        lines[lines.length - 1] = `--- ${body}`;
      } else
        lines.push(body);
    } else {
      lines.push(stringify.stringify(doc.contents, ctx));
    }
    if (doc.directives?.docEnd) {
      if (doc.comment) {
        const cs = commentString(doc.comment);
        if (cs.includes(`
`)) {
          lines.push("...");
          lines.push(stringifyComment.indentComment(cs, ""));
        } else {
          lines.push(`... ${cs}`);
        }
      } else {
        lines.push("...");
      }
    } else {
      let dc = doc.comment;
      if (dc && chompKeep)
        dc = dc.replace(/^\n+/, "");
      if (dc) {
        if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
          lines.push("");
        lines.push(stringifyComment.indentComment(commentString(dc), ""));
      }
    }
    return lines.join(`
`) + `
`;
  }
  exports.stringifyDocument = stringifyDocument;
});

// node_modules/yaml/dist/doc/Document.js
var require_Document = __commonJS((exports) => {
  var Alias = require_Alias();
  var Collection = require_Collection();
  var identity = require_identity();
  var Pair = require_Pair();
  var toJS = require_toJS();
  var Schema = require_Schema();
  var stringifyDocument = require_stringifyDocument();
  var anchors = require_anchors();
  var applyReviver = require_applyReviver();
  var createNode = require_createNode();
  var directives = require_directives();

  class Document {
    constructor(value, replacer, options) {
      this.commentBefore = null;
      this.comment = null;
      this.errors = [];
      this.warnings = [];
      Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
      let _replacer = null;
      if (typeof replacer === "function" || Array.isArray(replacer)) {
        _replacer = replacer;
      } else if (options === undefined && replacer) {
        options = replacer;
        replacer = undefined;
      }
      const opt = Object.assign({
        intAsBigInt: false,
        keepSourceTokens: false,
        logLevel: "warn",
        prettyErrors: true,
        strict: true,
        stringKeys: false,
        uniqueKeys: true,
        version: "1.2"
      }, options);
      this.options = opt;
      let { version } = opt;
      if (options?._directives) {
        this.directives = options._directives.atDocument();
        if (this.directives.yaml.explicit)
          version = this.directives.yaml.version;
      } else
        this.directives = new directives.Directives({ version });
      this.setSchema(version, options);
      this.contents = value === undefined ? null : this.createNode(value, _replacer, options);
    }
    clone() {
      const copy = Object.create(Document.prototype, {
        [identity.NODE_TYPE]: { value: identity.DOC }
      });
      copy.commentBefore = this.commentBefore;
      copy.comment = this.comment;
      copy.errors = this.errors.slice();
      copy.warnings = this.warnings.slice();
      copy.options = Object.assign({}, this.options);
      if (this.directives)
        copy.directives = this.directives.clone();
      copy.schema = this.schema.clone();
      copy.contents = identity.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
      if (this.range)
        copy.range = this.range.slice();
      return copy;
    }
    add(value) {
      if (assertCollection(this.contents))
        this.contents.add(value);
    }
    addIn(path, value) {
      if (assertCollection(this.contents))
        this.contents.addIn(path, value);
    }
    createAlias(node, name) {
      if (!node.anchor) {
        const prev = anchors.anchorNames(this);
        node.anchor = !name || prev.has(name) ? anchors.findNewAnchor(name || "a", prev) : name;
      }
      return new Alias.Alias(node.anchor);
    }
    createNode(value, replacer, options) {
      let _replacer = undefined;
      if (typeof replacer === "function") {
        value = replacer.call({ "": value }, "", value);
        _replacer = replacer;
      } else if (Array.isArray(replacer)) {
        const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
        const asStr = replacer.filter(keyToStr).map(String);
        if (asStr.length > 0)
          replacer = replacer.concat(asStr);
        _replacer = replacer;
      } else if (options === undefined && replacer) {
        options = replacer;
        replacer = undefined;
      }
      const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
      const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(this, anchorPrefix || "a");
      const ctx = {
        aliasDuplicateObjects: aliasDuplicateObjects ?? true,
        keepUndefined: keepUndefined ?? false,
        onAnchor,
        onTagObj,
        replacer: _replacer,
        schema: this.schema,
        sourceObjects
      };
      const node = createNode.createNode(value, tag, ctx);
      if (flow && identity.isCollection(node))
        node.flow = true;
      setAnchors();
      return node;
    }
    createPair(key, value, options = {}) {
      const k = this.createNode(key, null, options);
      const v = this.createNode(value, null, options);
      return new Pair.Pair(k, v);
    }
    delete(key) {
      return assertCollection(this.contents) ? this.contents.delete(key) : false;
    }
    deleteIn(path) {
      if (Collection.isEmptyPath(path)) {
        if (this.contents == null)
          return false;
        this.contents = null;
        return true;
      }
      return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
    }
    get(key, keepScalar) {
      return identity.isCollection(this.contents) ? this.contents.get(key, keepScalar) : undefined;
    }
    getIn(path, keepScalar) {
      if (Collection.isEmptyPath(path))
        return !keepScalar && identity.isScalar(this.contents) ? this.contents.value : this.contents;
      return identity.isCollection(this.contents) ? this.contents.getIn(path, keepScalar) : undefined;
    }
    has(key) {
      return identity.isCollection(this.contents) ? this.contents.has(key) : false;
    }
    hasIn(path) {
      if (Collection.isEmptyPath(path))
        return this.contents !== undefined;
      return identity.isCollection(this.contents) ? this.contents.hasIn(path) : false;
    }
    set(key, value) {
      if (this.contents == null) {
        this.contents = Collection.collectionFromPath(this.schema, [key], value);
      } else if (assertCollection(this.contents)) {
        this.contents.set(key, value);
      }
    }
    setIn(path, value) {
      if (Collection.isEmptyPath(path)) {
        this.contents = value;
      } else if (this.contents == null) {
        this.contents = Collection.collectionFromPath(this.schema, Array.from(path), value);
      } else if (assertCollection(this.contents)) {
        this.contents.setIn(path, value);
      }
    }
    setSchema(version, options = {}) {
      if (typeof version === "number")
        version = String(version);
      let opt;
      switch (version) {
        case "1.1":
          if (this.directives)
            this.directives.yaml.version = "1.1";
          else
            this.directives = new directives.Directives({ version: "1.1" });
          opt = { resolveKnownTags: false, schema: "yaml-1.1" };
          break;
        case "1.2":
        case "next":
          if (this.directives)
            this.directives.yaml.version = version;
          else
            this.directives = new directives.Directives({ version });
          opt = { resolveKnownTags: true, schema: "core" };
          break;
        case null:
          if (this.directives)
            delete this.directives;
          opt = null;
          break;
        default: {
          const sv = JSON.stringify(version);
          throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
        }
      }
      if (options.schema instanceof Object)
        this.schema = options.schema;
      else if (opt)
        this.schema = new Schema.Schema(Object.assign(opt, options));
      else
        throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
    }
    toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
      const ctx = {
        anchors: new Map,
        doc: this,
        keep: !json,
        mapAsMap: mapAsMap === true,
        mapKeyWarned: false,
        maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
      };
      const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
      if (typeof onAnchor === "function")
        for (const { count, res: res2 } of ctx.anchors.values())
          onAnchor(res2, count);
      return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
    }
    toJSON(jsonArg, onAnchor) {
      return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
    }
    toString(options = {}) {
      if (this.errors.length > 0)
        throw new Error("Document with errors cannot be stringified");
      if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
        const s = JSON.stringify(options.indent);
        throw new Error(`"indent" option must be a positive integer, not ${s}`);
      }
      return stringifyDocument.stringifyDocument(this, options);
    }
  }
  function assertCollection(contents) {
    if (identity.isCollection(contents))
      return true;
    throw new Error("Expected a YAML collection as document contents");
  }
  exports.Document = Document;
});

// node_modules/yaml/dist/errors.js
var require_errors = __commonJS((exports) => {
  class YAMLError extends Error {
    constructor(name, pos, code, message) {
      super();
      this.name = name;
      this.code = code;
      this.message = message;
      this.pos = pos;
    }
  }

  class YAMLParseError extends YAMLError {
    constructor(pos, code, message) {
      super("YAMLParseError", pos, code, message);
    }
  }

  class YAMLWarning extends YAMLError {
    constructor(pos, code, message) {
      super("YAMLWarning", pos, code, message);
    }
  }
  var prettifyError = (src, lc) => (error) => {
    if (error.pos[0] === -1)
      return;
    error.linePos = error.pos.map((pos) => lc.linePos(pos));
    const { line, col } = error.linePos[0];
    error.message += ` at line ${line}, column ${col}`;
    let ci = col - 1;
    let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
    if (ci >= 60 && lineStr.length > 80) {
      const trimStart = Math.min(ci - 39, lineStr.length - 79);
      lineStr = "\u2026" + lineStr.substring(trimStart);
      ci -= trimStart - 1;
    }
    if (lineStr.length > 80)
      lineStr = lineStr.substring(0, 79) + "\u2026";
    if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
      let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
      if (prev.length > 80)
        prev = prev.substring(0, 79) + `\u2026
`;
      lineStr = prev + lineStr;
    }
    if (/[^ ]/.test(lineStr)) {
      let count = 1;
      const end = error.linePos[1];
      if (end?.line === line && end.col > col) {
        count = Math.max(1, Math.min(end.col - col, 80 - ci));
      }
      const pointer = " ".repeat(ci) + "^".repeat(count);
      error.message += `:

${lineStr}
${pointer}
`;
    }
  };
  exports.YAMLError = YAMLError;
  exports.YAMLParseError = YAMLParseError;
  exports.YAMLWarning = YAMLWarning;
  exports.prettifyError = prettifyError;
});

// node_modules/yaml/dist/compose/resolve-props.js
var require_resolve_props = __commonJS((exports) => {
  function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
    let spaceBefore = false;
    let atNewline = startOnNewline;
    let hasSpace = startOnNewline;
    let comment = "";
    let commentSep = "";
    let hasNewline = false;
    let reqSpace = false;
    let tab = null;
    let anchor = null;
    let tag = null;
    let newlineAfterProp = null;
    let comma = null;
    let found = null;
    let start = null;
    for (const token of tokens) {
      if (reqSpace) {
        if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
          onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
        reqSpace = false;
      }
      if (tab) {
        if (atNewline && token.type !== "comment" && token.type !== "newline") {
          onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
        }
        tab = null;
      }
      switch (token.type) {
        case "space":
          if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("\t")) {
            tab = token;
          }
          hasSpace = true;
          break;
        case "comment": {
          if (!hasSpace)
            onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
          const cb = token.source.substring(1) || " ";
          if (!comment)
            comment = cb;
          else
            comment += commentSep + cb;
          commentSep = "";
          atNewline = false;
          break;
        }
        case "newline":
          if (atNewline) {
            if (comment)
              comment += token.source;
            else if (!found || indicator !== "seq-item-ind")
              spaceBefore = true;
          } else
            commentSep += token.source;
          atNewline = true;
          hasNewline = true;
          if (anchor || tag)
            newlineAfterProp = token;
          hasSpace = true;
          break;
        case "anchor":
          if (anchor)
            onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
          if (token.source.endsWith(":"))
            onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
          anchor = token;
          start ?? (start = token.offset);
          atNewline = false;
          hasSpace = false;
          reqSpace = true;
          break;
        case "tag": {
          if (tag)
            onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
          tag = token;
          start ?? (start = token.offset);
          atNewline = false;
          hasSpace = false;
          reqSpace = true;
          break;
        }
        case indicator:
          if (anchor || tag)
            onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
          if (found)
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
          found = token;
          atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
          hasSpace = false;
          break;
        case "comma":
          if (flow) {
            if (comma)
              onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
            comma = token;
            atNewline = false;
            hasSpace = false;
            break;
          }
        default:
          onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
          atNewline = false;
          hasSpace = false;
      }
    }
    const last = tokens[tokens.length - 1];
    const end = last ? last.offset + last.source.length : offset;
    if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
      onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
    }
    if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
      onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
    return {
      comma,
      found,
      spaceBefore,
      comment,
      hasNewline,
      anchor,
      tag,
      newlineAfterProp,
      end,
      start: start ?? end
    };
  }
  exports.resolveProps = resolveProps;
});

// node_modules/yaml/dist/compose/util-contains-newline.js
var require_util_contains_newline = __commonJS((exports) => {
  function containsNewline(key) {
    if (!key)
      return null;
    switch (key.type) {
      case "alias":
      case "scalar":
      case "double-quoted-scalar":
      case "single-quoted-scalar":
        if (key.source.includes(`
`))
          return true;
        if (key.end) {
          for (const st of key.end)
            if (st.type === "newline")
              return true;
        }
        return false;
      case "flow-collection":
        for (const it of key.items) {
          for (const st of it.start)
            if (st.type === "newline")
              return true;
          if (it.sep) {
            for (const st of it.sep)
              if (st.type === "newline")
                return true;
          }
          if (containsNewline(it.key) || containsNewline(it.value))
            return true;
        }
        return false;
      default:
        return true;
    }
  }
  exports.containsNewline = containsNewline;
});

// node_modules/yaml/dist/compose/util-flow-indent-check.js
var require_util_flow_indent_check = __commonJS((exports) => {
  var utilContainsNewline = require_util_contains_newline();
  function flowIndentCheck(indent, fc, onError) {
    if (fc?.type === "flow-collection") {
      const end = fc.end[0];
      if (end.indent === indent && (end.source === "]" || end.source === "}") && utilContainsNewline.containsNewline(fc)) {
        const msg = "Flow end indicator should be more indented than parent";
        onError(end, "BAD_INDENT", msg, true);
      }
    }
  }
  exports.flowIndentCheck = flowIndentCheck;
});

// node_modules/yaml/dist/compose/util-map-includes.js
var require_util_map_includes = __commonJS((exports) => {
  var identity = require_identity();
  function mapIncludes(ctx, items, search) {
    const { uniqueKeys } = ctx.options;
    if (uniqueKeys === false)
      return false;
    const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || identity.isScalar(a) && identity.isScalar(b) && a.value === b.value;
    return items.some((pair) => isEqual(pair.key, search));
  }
  exports.mapIncludes = mapIncludes;
});

// node_modules/yaml/dist/compose/resolve-block-map.js
var require_resolve_block_map = __commonJS((exports) => {
  var Pair = require_Pair();
  var YAMLMap = require_YAMLMap();
  var resolveProps = require_resolve_props();
  var utilContainsNewline = require_util_contains_newline();
  var utilFlowIndentCheck = require_util_flow_indent_check();
  var utilMapIncludes = require_util_map_includes();
  var startColMsg = "All mapping items must start at the same column";
  function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
    const NodeClass = tag?.nodeClass ?? YAMLMap.YAMLMap;
    const map = new NodeClass(ctx.schema);
    if (ctx.atRoot)
      ctx.atRoot = false;
    let offset = bm.offset;
    let commentEnd = null;
    for (const collItem of bm.items) {
      const { start, key, sep, value } = collItem;
      const keyProps = resolveProps.resolveProps(start, {
        indicator: "explicit-key-ind",
        next: key ?? sep?.[0],
        offset,
        onError,
        parentIndent: bm.indent,
        startOnNewline: true
      });
      const implicitKey = !keyProps.found;
      if (implicitKey) {
        if (key) {
          if (key.type === "block-seq")
            onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
          else if ("indent" in key && key.indent !== bm.indent)
            onError(offset, "BAD_INDENT", startColMsg);
        }
        if (!keyProps.anchor && !keyProps.tag && !sep) {
          commentEnd = keyProps.end;
          if (keyProps.comment) {
            if (map.comment)
              map.comment += `
` + keyProps.comment;
            else
              map.comment = keyProps.comment;
          }
          continue;
        }
        if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) {
          onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
        }
      } else if (keyProps.found?.indent !== bm.indent) {
        onError(offset, "BAD_INDENT", startColMsg);
      }
      ctx.atKey = true;
      const keyStart = keyProps.end;
      const keyNode = key ? composeNode(ctx, key, keyProps, onError) : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
      if (ctx.schema.compat)
        utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
      ctx.atKey = false;
      if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
        onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
      const valueProps = resolveProps.resolveProps(sep ?? [], {
        indicator: "map-value-ind",
        next: value,
        offset: keyNode.range[2],
        onError,
        parentIndent: bm.indent,
        startOnNewline: !key || key.type === "block-scalar"
      });
      offset = valueProps.end;
      if (valueProps.found) {
        if (implicitKey) {
          if (value?.type === "block-map" && !valueProps.hasNewline)
            onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
          if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
            onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
        }
        const valueNode = value ? composeNode(ctx, value, valueProps, onError) : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bm.indent, value, onError);
        offset = valueNode.range[2];
        const pair = new Pair.Pair(keyNode, valueNode);
        if (ctx.options.keepSourceTokens)
          pair.srcToken = collItem;
        map.items.push(pair);
      } else {
        if (implicitKey)
          onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
        if (valueProps.comment) {
          if (keyNode.comment)
            keyNode.comment += `
` + valueProps.comment;
          else
            keyNode.comment = valueProps.comment;
        }
        const pair = new Pair.Pair(keyNode);
        if (ctx.options.keepSourceTokens)
          pair.srcToken = collItem;
        map.items.push(pair);
      }
    }
    if (commentEnd && commentEnd < offset)
      onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
    map.range = [bm.offset, offset, commentEnd ?? offset];
    return map;
  }
  exports.resolveBlockMap = resolveBlockMap;
});

// node_modules/yaml/dist/compose/resolve-block-seq.js
var require_resolve_block_seq = __commonJS((exports) => {
  var YAMLSeq = require_YAMLSeq();
  var resolveProps = require_resolve_props();
  var utilFlowIndentCheck = require_util_flow_indent_check();
  function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
    const NodeClass = tag?.nodeClass ?? YAMLSeq.YAMLSeq;
    const seq = new NodeClass(ctx.schema);
    if (ctx.atRoot)
      ctx.atRoot = false;
    if (ctx.atKey)
      ctx.atKey = false;
    let offset = bs.offset;
    let commentEnd = null;
    for (const { start, value } of bs.items) {
      const props = resolveProps.resolveProps(start, {
        indicator: "seq-item-ind",
        next: value,
        offset,
        onError,
        parentIndent: bs.indent,
        startOnNewline: true
      });
      if (!props.found) {
        if (props.anchor || props.tag || value) {
          if (value?.type === "block-seq")
            onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
          else
            onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
        } else {
          commentEnd = props.end;
          if (props.comment)
            seq.comment = props.comment;
          continue;
        }
      }
      const node = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
      if (ctx.schema.compat)
        utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
      offset = node.range[2];
      seq.items.push(node);
    }
    seq.range = [bs.offset, offset, commentEnd ?? offset];
    return seq;
  }
  exports.resolveBlockSeq = resolveBlockSeq;
});

// node_modules/yaml/dist/compose/resolve-end.js
var require_resolve_end = __commonJS((exports) => {
  function resolveEnd(end, offset, reqSpace, onError) {
    let comment = "";
    if (end) {
      let hasSpace = false;
      let sep = "";
      for (const token of end) {
        const { source, type } = token;
        switch (type) {
          case "space":
            hasSpace = true;
            break;
          case "comment": {
            if (reqSpace && !hasSpace)
              onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const cb = source.substring(1) || " ";
            if (!comment)
              comment = cb;
            else
              comment += sep + cb;
            sep = "";
            break;
          }
          case "newline":
            if (comment)
              sep += source;
            hasSpace = true;
            break;
          default:
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
        }
        offset += source.length;
      }
    }
    return { comment, offset };
  }
  exports.resolveEnd = resolveEnd;
});

// node_modules/yaml/dist/compose/resolve-flow-collection.js
var require_resolve_flow_collection = __commonJS((exports) => {
  var identity = require_identity();
  var Pair = require_Pair();
  var YAMLMap = require_YAMLMap();
  var YAMLSeq = require_YAMLSeq();
  var resolveEnd = require_resolve_end();
  var resolveProps = require_resolve_props();
  var utilContainsNewline = require_util_contains_newline();
  var utilMapIncludes = require_util_map_includes();
  var blockMsg = "Block collections are not allowed within flow collections";
  var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
  function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
    const isMap = fc.start.source === "{";
    const fcName = isMap ? "flow map" : "flow sequence";
    const NodeClass = tag?.nodeClass ?? (isMap ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq);
    const coll = new NodeClass(ctx.schema);
    coll.flow = true;
    const atRoot = ctx.atRoot;
    if (atRoot)
      ctx.atRoot = false;
    if (ctx.atKey)
      ctx.atKey = false;
    let offset = fc.offset + fc.start.source.length;
    for (let i = 0;i < fc.items.length; ++i) {
      const collItem = fc.items[i];
      const { start, key, sep, value } = collItem;
      const props = resolveProps.resolveProps(start, {
        flow: fcName,
        indicator: "explicit-key-ind",
        next: key ?? sep?.[0],
        offset,
        onError,
        parentIndent: fc.indent,
        startOnNewline: false
      });
      if (!props.found) {
        if (!props.anchor && !props.tag && !sep && !value) {
          if (i === 0 && props.comma)
            onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
          else if (i < fc.items.length - 1)
            onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
          if (props.comment) {
            if (coll.comment)
              coll.comment += `
` + props.comment;
            else
              coll.comment = props.comment;
          }
          offset = props.end;
          continue;
        }
        if (!isMap && ctx.options.strict && utilContainsNewline.containsNewline(key))
          onError(key, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
      }
      if (i === 0) {
        if (props.comma)
          onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
      } else {
        if (!props.comma)
          onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
        if (props.comment) {
          let prevItemComment = "";
          loop:
            for (const st of start) {
              switch (st.type) {
                case "comma":
                case "space":
                  break;
                case "comment":
                  prevItemComment = st.source.substring(1);
                  break loop;
                default:
                  break loop;
              }
            }
          if (prevItemComment) {
            let prev = coll.items[coll.items.length - 1];
            if (identity.isPair(prev))
              prev = prev.value ?? prev.key;
            if (prev.comment)
              prev.comment += `
` + prevItemComment;
            else
              prev.comment = prevItemComment;
            props.comment = props.comment.substring(prevItemComment.length + 1);
          }
        }
      }
      if (!isMap && !sep && !props.found) {
        const valueNode = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, sep, null, props, onError);
        coll.items.push(valueNode);
        offset = valueNode.range[2];
        if (isBlock(value))
          onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
      } else {
        ctx.atKey = true;
        const keyStart = props.end;
        const keyNode = key ? composeNode(ctx, key, props, onError) : composeEmptyNode(ctx, keyStart, start, null, props, onError);
        if (isBlock(key))
          onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
        ctx.atKey = false;
        const valueProps = resolveProps.resolveProps(sep ?? [], {
          flow: fcName,
          indicator: "map-value-ind",
          next: value,
          offset: keyNode.range[2],
          onError,
          parentIndent: fc.indent,
          startOnNewline: false
        });
        if (valueProps.found) {
          if (!isMap && !props.found && ctx.options.strict) {
            if (sep)
              for (const st of sep) {
                if (st === valueProps.found)
                  break;
                if (st.type === "newline") {
                  onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                  break;
                }
              }
            if (props.start < valueProps.found.offset - 1024)
              onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
          }
        } else if (value) {
          if ("source" in value && value.source?.[0] === ":")
            onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
          else
            onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
        }
        const valueNode = value ? composeNode(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError) : null;
        if (valueNode) {
          if (isBlock(value))
            onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
        } else if (valueProps.comment) {
          if (keyNode.comment)
            keyNode.comment += `
` + valueProps.comment;
          else
            keyNode.comment = valueProps.comment;
        }
        const pair = new Pair.Pair(keyNode, valueNode);
        if (ctx.options.keepSourceTokens)
          pair.srcToken = collItem;
        if (isMap) {
          const map = coll;
          if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
            onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
          map.items.push(pair);
        } else {
          const map = new YAMLMap.YAMLMap(ctx.schema);
          map.flow = true;
          map.items.push(pair);
          const endRange = (valueNode ?? keyNode).range;
          map.range = [keyNode.range[0], endRange[1], endRange[2]];
          coll.items.push(map);
        }
        offset = valueNode ? valueNode.range[2] : valueProps.end;
      }
    }
    const expectedEnd = isMap ? "}" : "]";
    const [ce, ...ee] = fc.end;
    let cePos = offset;
    if (ce?.source === expectedEnd)
      cePos = ce.offset + ce.source.length;
    else {
      const name = fcName[0].toUpperCase() + fcName.substring(1);
      const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
      onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
      if (ce && ce.source.length !== 1)
        ee.unshift(ce);
    }
    if (ee.length > 0) {
      const end = resolveEnd.resolveEnd(ee, cePos, ctx.options.strict, onError);
      if (end.comment) {
        if (coll.comment)
          coll.comment += `
` + end.comment;
        else
          coll.comment = end.comment;
      }
      coll.range = [fc.offset, cePos, end.offset];
    } else {
      coll.range = [fc.offset, cePos, cePos];
    }
    return coll;
  }
  exports.resolveFlowCollection = resolveFlowCollection;
});

// node_modules/yaml/dist/compose/compose-collection.js
var require_compose_collection = __commonJS((exports) => {
  var identity = require_identity();
  var Scalar = require_Scalar();
  var YAMLMap = require_YAMLMap();
  var YAMLSeq = require_YAMLSeq();
  var resolveBlockMap = require_resolve_block_map();
  var resolveBlockSeq = require_resolve_block_seq();
  var resolveFlowCollection = require_resolve_flow_collection();
  function resolveCollection(CN, ctx, token, onError, tagName, tag) {
    const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
    const Coll = coll.constructor;
    if (tagName === "!" || tagName === Coll.tagName) {
      coll.tag = Coll.tagName;
      return coll;
    }
    if (tagName)
      coll.tag = tagName;
    return coll;
  }
  function composeCollection(CN, ctx, token, props, onError) {
    const tagToken = props.tag;
    const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
    if (token.type === "block-seq") {
      const { anchor, newlineAfterProp: nl } = props;
      const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
      if (lastProp && (!nl || nl.offset < lastProp.offset)) {
        const message = "Missing newline after block sequence props";
        onError(lastProp, "MISSING_CHAR", message);
      }
    }
    const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
    if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.YAMLSeq.tagName && expType === "seq") {
      return resolveCollection(CN, ctx, token, onError, tagName);
    }
    let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
    if (!tag) {
      const kt = ctx.schema.knownTags[tagName];
      if (kt?.collection === expType) {
        ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
        tag = kt;
      } else {
        if (kt) {
          onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
        } else {
          onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
        }
        return resolveCollection(CN, ctx, token, onError, tagName);
      }
    }
    const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
    const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
    const node = identity.isNode(res) ? res : new Scalar.Scalar(res);
    node.range = coll.range;
    node.tag = tagName;
    if (tag?.format)
      node.format = tag.format;
    return node;
  }
  exports.composeCollection = composeCollection;
});

// node_modules/yaml/dist/compose/resolve-block-scalar.js
var require_resolve_block_scalar = __commonJS((exports) => {
  var Scalar = require_Scalar();
  function resolveBlockScalar(ctx, scalar, onError) {
    const start = scalar.offset;
    const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
    if (!header)
      return { value: "", type: null, comment: "", range: [start, start, start] };
    const type = header.mode === ">" ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
    const lines = scalar.source ? splitLines(scalar.source) : [];
    let chompStart = lines.length;
    for (let i = lines.length - 1;i >= 0; --i) {
      const content = lines[i][1];
      if (content === "" || content === "\r")
        chompStart = i;
      else
        break;
    }
    if (chompStart === 0) {
      const value2 = header.chomp === "+" && lines.length > 0 ? `
`.repeat(Math.max(1, lines.length - 1)) : "";
      let end2 = start + header.length;
      if (scalar.source)
        end2 += scalar.source.length;
      return { value: value2, type, comment: header.comment, range: [start, end2, end2] };
    }
    let trimIndent = scalar.indent + header.indent;
    let offset = scalar.offset + header.length;
    let contentStart = 0;
    for (let i = 0;i < chompStart; ++i) {
      const [indent, content] = lines[i];
      if (content === "" || content === "\r") {
        if (header.indent === 0 && indent.length > trimIndent)
          trimIndent = indent.length;
      } else {
        if (indent.length < trimIndent) {
          const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
          onError(offset + indent.length, "MISSING_CHAR", message);
        }
        if (header.indent === 0)
          trimIndent = indent.length;
        contentStart = i;
        if (trimIndent === 0 && !ctx.atRoot) {
          const message = "Block scalar values in collections must be indented";
          onError(offset, "BAD_INDENT", message);
        }
        break;
      }
      offset += indent.length + content.length + 1;
    }
    for (let i = lines.length - 1;i >= chompStart; --i) {
      if (lines[i][0].length > trimIndent)
        chompStart = i + 1;
    }
    let value = "";
    let sep = "";
    let prevMoreIndented = false;
    for (let i = 0;i < contentStart; ++i)
      value += lines[i][0].slice(trimIndent) + `
`;
    for (let i = contentStart;i < chompStart; ++i) {
      let [indent, content] = lines[i];
      offset += indent.length + content.length + 1;
      const crlf = content[content.length - 1] === "\r";
      if (crlf)
        content = content.slice(0, -1);
      if (content && indent.length < trimIndent) {
        const src = header.indent ? "explicit indentation indicator" : "first line";
        const message = `Block scalar lines must not be less indented than their ${src}`;
        onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
        indent = "";
      }
      if (type === Scalar.Scalar.BLOCK_LITERAL) {
        value += sep + indent.slice(trimIndent) + content;
        sep = `
`;
      } else if (indent.length > trimIndent || content[0] === "\t") {
        if (sep === " ")
          sep = `
`;
        else if (!prevMoreIndented && sep === `
`)
          sep = `

`;
        value += sep + indent.slice(trimIndent) + content;
        sep = `
`;
        prevMoreIndented = true;
      } else if (content === "") {
        if (sep === `
`)
          value += `
`;
        else
          sep = `
`;
      } else {
        value += sep + content;
        sep = " ";
        prevMoreIndented = false;
      }
    }
    switch (header.chomp) {
      case "-":
        break;
      case "+":
        for (let i = chompStart;i < lines.length; ++i)
          value += `
` + lines[i][0].slice(trimIndent);
        if (value[value.length - 1] !== `
`)
          value += `
`;
        break;
      default:
        value += `
`;
    }
    const end = start + header.length + scalar.source.length;
    return { value, type, comment: header.comment, range: [start, end, end] };
  }
  function parseBlockScalarHeader({ offset, props }, strict, onError) {
    if (props[0].type !== "block-scalar-header") {
      onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
      return null;
    }
    const { source } = props[0];
    const mode = source[0];
    let indent = 0;
    let chomp = "";
    let error = -1;
    for (let i = 1;i < source.length; ++i) {
      const ch = source[i];
      if (!chomp && (ch === "-" || ch === "+"))
        chomp = ch;
      else {
        const n = Number(ch);
        if (!indent && n)
          indent = n;
        else if (error === -1)
          error = offset + i;
      }
    }
    if (error !== -1)
      onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
    let hasSpace = false;
    let comment = "";
    let length = source.length;
    for (let i = 1;i < props.length; ++i) {
      const token = props[i];
      switch (token.type) {
        case "space":
          hasSpace = true;
        case "newline":
          length += token.source.length;
          break;
        case "comment":
          if (strict && !hasSpace) {
            const message = "Comments must be separated from other tokens by white space characters";
            onError(token, "MISSING_CHAR", message);
          }
          length += token.source.length;
          comment = token.source.substring(1);
          break;
        case "error":
          onError(token, "UNEXPECTED_TOKEN", token.message);
          length += token.source.length;
          break;
        default: {
          const message = `Unexpected token in block scalar header: ${token.type}`;
          onError(token, "UNEXPECTED_TOKEN", message);
          const ts = token.source;
          if (ts && typeof ts === "string")
            length += ts.length;
        }
      }
    }
    return { mode, indent, chomp, comment, length };
  }
  function splitLines(source) {
    const split = source.split(/\n( *)/);
    const first = split[0];
    const m = first.match(/^( *)/);
    const line0 = m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first];
    const lines = [line0];
    for (let i = 1;i < split.length; i += 2)
      lines.push([split[i], split[i + 1]]);
    return lines;
  }
  exports.resolveBlockScalar = resolveBlockScalar;
});

// node_modules/yaml/dist/compose/resolve-flow-scalar.js
var require_resolve_flow_scalar = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var resolveEnd = require_resolve_end();
  function resolveFlowScalar(scalar, strict, onError) {
    const { offset, type, source, end } = scalar;
    let _type;
    let value;
    const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
    switch (type) {
      case "scalar":
        _type = Scalar.Scalar.PLAIN;
        value = plainValue(source, _onError);
        break;
      case "single-quoted-scalar":
        _type = Scalar.Scalar.QUOTE_SINGLE;
        value = singleQuotedValue(source, _onError);
        break;
      case "double-quoted-scalar":
        _type = Scalar.Scalar.QUOTE_DOUBLE;
        value = doubleQuotedValue(source, _onError);
        break;
      default:
        onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
        return {
          value: "",
          type: null,
          comment: "",
          range: [offset, offset + source.length, offset + source.length]
        };
    }
    const valueEnd = offset + source.length;
    const re = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
    return {
      value,
      type: _type,
      comment: re.comment,
      range: [offset, valueEnd, re.offset]
    };
  }
  function plainValue(source, onError) {
    let badChar = "";
    switch (source[0]) {
      case "\t":
        badChar = "a tab character";
        break;
      case ",":
        badChar = "flow indicator character ,";
        break;
      case "%":
        badChar = "directive indicator character %";
        break;
      case "|":
      case ">": {
        badChar = `block scalar indicator ${source[0]}`;
        break;
      }
      case "@":
      case "`": {
        badChar = `reserved character ${source[0]}`;
        break;
      }
    }
    if (badChar)
      onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
    return foldLines(source);
  }
  function singleQuotedValue(source, onError) {
    if (source[source.length - 1] !== "'" || source.length === 1)
      onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
    return foldLines(source.slice(1, -1)).replace(/''/g, "'");
  }
  function foldLines(source) {
    let first, line;
    try {
      first = new RegExp(`(.*?)(?<![ 	])[ 	]*\r?
`, "sy");
      line = new RegExp(`[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`, "sy");
    } catch {
      first = /(.*?)[ \t]*\r?\n/sy;
      line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
    }
    let match = first.exec(source);
    if (!match)
      return source;
    let res = match[1];
    let sep = " ";
    let pos = first.lastIndex;
    line.lastIndex = pos;
    while (match = line.exec(source)) {
      if (match[1] === "") {
        if (sep === `
`)
          res += sep;
        else
          sep = `
`;
      } else {
        res += sep + match[1];
        sep = " ";
      }
      pos = line.lastIndex;
    }
    const last = /[ \t]*(.*)/sy;
    last.lastIndex = pos;
    match = last.exec(source);
    return res + sep + (match?.[1] ?? "");
  }
  function doubleQuotedValue(source, onError) {
    let res = "";
    for (let i = 1;i < source.length - 1; ++i) {
      const ch = source[i];
      if (ch === "\r" && source[i + 1] === `
`)
        continue;
      if (ch === `
`) {
        const { fold, offset } = foldNewline(source, i);
        res += fold;
        i = offset;
      } else if (ch === "\\") {
        let next = source[++i];
        const cc = escapeCodes[next];
        if (cc)
          res += cc;
        else if (next === `
`) {
          next = source[i + 1];
          while (next === " " || next === "\t")
            next = source[++i + 1];
        } else if (next === "\r" && source[i + 1] === `
`) {
          next = source[++i + 1];
          while (next === " " || next === "\t")
            next = source[++i + 1];
        } else if (next === "x" || next === "u" || next === "U") {
          const length = next === "x" ? 2 : next === "u" ? 4 : 8;
          res += parseCharCode(source, i + 1, length, onError);
          i += length;
        } else {
          const raw = source.substr(i - 1, 2);
          onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
          res += raw;
        }
      } else if (ch === " " || ch === "\t") {
        const wsStart = i;
        let next = source[i + 1];
        while (next === " " || next === "\t")
          next = source[++i + 1];
        if (next !== `
` && !(next === "\r" && source[i + 2] === `
`))
          res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
      } else {
        res += ch;
      }
    }
    if (source[source.length - 1] !== '"' || source.length === 1)
      onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
    return res;
  }
  function foldNewline(source, offset) {
    let fold = "";
    let ch = source[offset + 1];
    while (ch === " " || ch === "\t" || ch === `
` || ch === "\r") {
      if (ch === "\r" && source[offset + 2] !== `
`)
        break;
      if (ch === `
`)
        fold += `
`;
      offset += 1;
      ch = source[offset + 1];
    }
    if (!fold)
      fold = " ";
    return { fold, offset };
  }
  var escapeCodes = {
    "0": "\x00",
    a: "\x07",
    b: "\b",
    e: "\x1B",
    f: "\f",
    n: `
`,
    r: "\r",
    t: "\t",
    v: "\v",
    N: "\x85",
    _: "\xA0",
    L: "\u2028",
    P: "\u2029",
    " ": " ",
    '"': '"',
    "/": "/",
    "\\": "\\",
    "\t": "\t"
  };
  function parseCharCode(source, offset, length, onError) {
    const cc = source.substr(offset, length);
    const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
    const code = ok ? parseInt(cc, 16) : NaN;
    try {
      return String.fromCodePoint(code);
    } catch {
      const raw = source.substr(offset - 2, length + 2);
      onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
      return raw;
    }
  }
  exports.resolveFlowScalar = resolveFlowScalar;
});

// node_modules/yaml/dist/compose/compose-scalar.js
var require_compose_scalar = __commonJS((exports) => {
  var identity = require_identity();
  var Scalar = require_Scalar();
  var resolveBlockScalar = require_resolve_block_scalar();
  var resolveFlowScalar = require_resolve_flow_scalar();
  function composeScalar(ctx, token, tagToken, onError) {
    const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
    const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
    let tag;
    if (ctx.options.stringKeys && ctx.atKey) {
      tag = ctx.schema[identity.SCALAR];
    } else if (tagName)
      tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
    else if (token.type === "scalar")
      tag = findScalarTagByTest(ctx, value, token, onError);
    else
      tag = ctx.schema[identity.SCALAR];
    let scalar;
    try {
      const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
      scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
      scalar = new Scalar.Scalar(value);
    }
    scalar.range = range;
    scalar.source = value;
    if (type)
      scalar.type = type;
    if (tagName)
      scalar.tag = tagName;
    if (tag.format)
      scalar.format = tag.format;
    if (comment)
      scalar.comment = comment;
    return scalar;
  }
  function findScalarTagByName(schema, value, tagName, tagToken, onError) {
    if (tagName === "!")
      return schema[identity.SCALAR];
    const matchWithTest = [];
    for (const tag of schema.tags) {
      if (!tag.collection && tag.tag === tagName) {
        if (tag.default && tag.test)
          matchWithTest.push(tag);
        else
          return tag;
      }
    }
    for (const tag of matchWithTest)
      if (tag.test?.test(value))
        return tag;
    const kt = schema.knownTags[tagName];
    if (kt && !kt.collection) {
      schema.tags.push(Object.assign({}, kt, { default: false, test: undefined }));
      return kt;
    }
    onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
    return schema[identity.SCALAR];
  }
  function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
    const tag = schema.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value)) || schema[identity.SCALAR];
    if (schema.compat) {
      const compat = schema.compat.find((tag2) => tag2.default && tag2.test?.test(value)) ?? schema[identity.SCALAR];
      if (tag.tag !== compat.tag) {
        const ts = directives.tagString(tag.tag);
        const cs = directives.tagString(compat.tag);
        const msg = `Value may be parsed as either ${ts} or ${cs}`;
        onError(token, "TAG_RESOLVE_FAILED", msg, true);
      }
    }
    return tag;
  }
  exports.composeScalar = composeScalar;
});

// node_modules/yaml/dist/compose/util-empty-scalar-position.js
var require_util_empty_scalar_position = __commonJS((exports) => {
  function emptyScalarPosition(offset, before, pos) {
    if (before) {
      pos ?? (pos = before.length);
      for (let i = pos - 1;i >= 0; --i) {
        let st = before[i];
        switch (st.type) {
          case "space":
          case "comment":
          case "newline":
            offset -= st.source.length;
            continue;
        }
        st = before[++i];
        while (st?.type === "space") {
          offset += st.source.length;
          st = before[++i];
        }
        break;
      }
    }
    return offset;
  }
  exports.emptyScalarPosition = emptyScalarPosition;
});

// node_modules/yaml/dist/compose/compose-node.js
var require_compose_node = __commonJS((exports) => {
  var Alias = require_Alias();
  var identity = require_identity();
  var composeCollection = require_compose_collection();
  var composeScalar = require_compose_scalar();
  var resolveEnd = require_resolve_end();
  var utilEmptyScalarPosition = require_util_empty_scalar_position();
  var CN = { composeNode, composeEmptyNode };
  function composeNode(ctx, token, props, onError) {
    const atKey = ctx.atKey;
    const { spaceBefore, comment, anchor, tag } = props;
    let node;
    let isSrcToken = true;
    switch (token.type) {
      case "alias":
        node = composeAlias(ctx, token, onError);
        if (anchor || tag)
          onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
        break;
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
      case "block-scalar":
        node = composeScalar.composeScalar(ctx, token, tag, onError);
        if (anchor)
          node.anchor = anchor.source.substring(1);
        break;
      case "block-map":
      case "block-seq":
      case "flow-collection":
        try {
          node = composeCollection.composeCollection(CN, ctx, token, props, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          onError(token, "RESOURCE_EXHAUSTION", message);
        }
        break;
      default: {
        const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
        onError(token, "UNEXPECTED_TOKEN", message);
        isSrcToken = false;
      }
    }
    node ?? (node = composeEmptyNode(ctx, token.offset, undefined, null, props, onError));
    if (anchor && node.anchor === "")
      onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
    if (atKey && ctx.options.stringKeys && (!identity.isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
      const msg = "With stringKeys, all keys must be strings";
      onError(tag ?? token, "NON_STRING_KEY", msg);
    }
    if (spaceBefore)
      node.spaceBefore = true;
    if (comment) {
      if (token.type === "scalar" && token.source === "")
        node.comment = comment;
      else
        node.commentBefore = comment;
    }
    if (ctx.options.keepSourceTokens && isSrcToken)
      node.srcToken = token;
    return node;
  }
  function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
    const token = {
      type: "scalar",
      offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
      indent: -1,
      source: ""
    };
    const node = composeScalar.composeScalar(ctx, token, tag, onError);
    if (anchor) {
      node.anchor = anchor.source.substring(1);
      if (node.anchor === "")
        onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
    }
    if (spaceBefore)
      node.spaceBefore = true;
    if (comment) {
      node.comment = comment;
      node.range[2] = end;
    }
    return node;
  }
  function composeAlias({ options }, { offset, source, end }, onError) {
    const alias = new Alias.Alias(source.substring(1));
    if (alias.source === "")
      onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
    if (alias.source.endsWith(":"))
      onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
    const valueEnd = offset + source.length;
    const re = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
    alias.range = [offset, valueEnd, re.offset];
    if (re.comment)
      alias.comment = re.comment;
    return alias;
  }
  exports.composeEmptyNode = composeEmptyNode;
  exports.composeNode = composeNode;
});

// node_modules/yaml/dist/compose/compose-doc.js
var require_compose_doc = __commonJS((exports) => {
  var Document = require_Document();
  var composeNode = require_compose_node();
  var resolveEnd = require_resolve_end();
  var resolveProps = require_resolve_props();
  function composeDoc(options, directives, { offset, start, value, end }, onError) {
    const opts = Object.assign({ _directives: directives }, options);
    const doc = new Document.Document(undefined, opts);
    const ctx = {
      atKey: false,
      atRoot: true,
      directives: doc.directives,
      options: doc.options,
      schema: doc.schema
    };
    const props = resolveProps.resolveProps(start, {
      indicator: "doc-start",
      next: value ?? end?.[0],
      offset,
      onError,
      parentIndent: 0,
      startOnNewline: true
    });
    if (props.found) {
      doc.directives.docStart = true;
      if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
        onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
    }
    doc.contents = value ? composeNode.composeNode(ctx, value, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
    const contentEnd = doc.contents.range[2];
    const re = resolveEnd.resolveEnd(end, contentEnd, false, onError);
    if (re.comment)
      doc.comment = re.comment;
    doc.range = [offset, contentEnd, re.offset];
    return doc;
  }
  exports.composeDoc = composeDoc;
});

// node_modules/yaml/dist/compose/composer.js
var require_composer = __commonJS((exports) => {
  var node_process = __require("process");
  var directives = require_directives();
  var Document = require_Document();
  var errors = require_errors();
  var identity = require_identity();
  var composeDoc = require_compose_doc();
  var resolveEnd = require_resolve_end();
  function getErrorPos(src) {
    if (typeof src === "number")
      return [src, src + 1];
    if (Array.isArray(src))
      return src.length === 2 ? src : [src[0], src[1]];
    const { offset, source } = src;
    return [offset, offset + (typeof source === "string" ? source.length : 1)];
  }
  function parsePrelude(prelude) {
    let comment = "";
    let atComment = false;
    let afterEmptyLine = false;
    for (let i = 0;i < prelude.length; ++i) {
      const source = prelude[i];
      switch (source[0]) {
        case "#":
          comment += (comment === "" ? "" : afterEmptyLine ? `

` : `
`) + (source.substring(1) || " ");
          atComment = true;
          afterEmptyLine = false;
          break;
        case "%":
          if (prelude[i + 1]?.[0] !== "#")
            i += 1;
          atComment = false;
          break;
        default:
          if (!atComment)
            afterEmptyLine = true;
          atComment = false;
      }
    }
    return { comment, afterEmptyLine };
  }

  class Composer {
    constructor(options = {}) {
      this.doc = null;
      this.atDirectives = false;
      this.prelude = [];
      this.errors = [];
      this.warnings = [];
      this.onError = (source, code, message, warning) => {
        const pos = getErrorPos(source);
        if (warning)
          this.warnings.push(new errors.YAMLWarning(pos, code, message));
        else
          this.errors.push(new errors.YAMLParseError(pos, code, message));
      };
      this.directives = new directives.Directives({ version: options.version || "1.2" });
      this.options = options;
    }
    decorate(doc, afterDoc) {
      const { comment, afterEmptyLine } = parsePrelude(this.prelude);
      if (comment) {
        const dc = doc.contents;
        if (afterDoc) {
          doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
        } else if (afterEmptyLine || doc.directives.docStart || !dc) {
          doc.commentBefore = comment;
        } else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
          let it = dc.items[0];
          if (identity.isPair(it))
            it = it.key;
          const cb = it.commentBefore;
          it.commentBefore = cb ? `${comment}
${cb}` : comment;
        } else {
          const cb = dc.commentBefore;
          dc.commentBefore = cb ? `${comment}
${cb}` : comment;
        }
      }
      if (afterDoc) {
        for (let i = 0;i < this.errors.length; ++i)
          doc.errors.push(this.errors[i]);
        for (let i = 0;i < this.warnings.length; ++i)
          doc.warnings.push(this.warnings[i]);
      } else {
        doc.errors = this.errors;
        doc.warnings = this.warnings;
      }
      this.prelude = [];
      this.errors = [];
      this.warnings = [];
    }
    streamInfo() {
      return {
        comment: parsePrelude(this.prelude).comment,
        directives: this.directives,
        errors: this.errors,
        warnings: this.warnings
      };
    }
    *compose(tokens, forceDoc = false, endOffset = -1) {
      for (const token of tokens)
        yield* this.next(token);
      yield* this.end(forceDoc, endOffset);
    }
    *next(token) {
      if (node_process.env.LOG_STREAM)
        console.dir(token, { depth: null });
      switch (token.type) {
        case "directive":
          this.directives.add(token.source, (offset, message, warning) => {
            const pos = getErrorPos(token);
            pos[0] += offset;
            this.onError(pos, "BAD_DIRECTIVE", message, warning);
          });
          this.prelude.push(token.source);
          this.atDirectives = true;
          break;
        case "document": {
          const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
          if (this.atDirectives && !doc.directives.docStart)
            this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
          this.decorate(doc, false);
          if (this.doc)
            yield this.doc;
          this.doc = doc;
          this.atDirectives = false;
          break;
        }
        case "byte-order-mark":
        case "space":
          break;
        case "comment":
        case "newline":
          this.prelude.push(token.source);
          break;
        case "error": {
          const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
          const error = new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
          if (this.atDirectives || !this.doc)
            this.errors.push(error);
          else
            this.doc.errors.push(error);
          break;
        }
        case "doc-end": {
          if (!this.doc) {
            const msg = "Unexpected doc-end without preceding document";
            this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
            break;
          }
          this.doc.directives.docEnd = true;
          const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
          this.decorate(this.doc, true);
          if (end.comment) {
            const dc = this.doc.comment;
            this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
          }
          this.doc.range[2] = end.offset;
          break;
        }
        default:
          this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
      }
    }
    *end(forceDoc = false, endOffset = -1) {
      if (this.doc) {
        this.decorate(this.doc, true);
        yield this.doc;
        this.doc = null;
      } else if (forceDoc) {
        const opts = Object.assign({ _directives: this.directives }, this.options);
        const doc = new Document.Document(undefined, opts);
        if (this.atDirectives)
          this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
        doc.range = [0, endOffset, endOffset];
        this.decorate(doc, false);
        yield doc;
      }
    }
  }
  exports.Composer = Composer;
});

// node_modules/yaml/dist/parse/cst-scalar.js
var require_cst_scalar = __commonJS((exports) => {
  var resolveBlockScalar = require_resolve_block_scalar();
  var resolveFlowScalar = require_resolve_flow_scalar();
  var errors = require_errors();
  var stringifyString = require_stringifyString();
  function resolveAsScalar(token, strict = true, onError) {
    if (token) {
      const _onError = (pos, code, message) => {
        const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
        if (onError)
          onError(offset, code, message);
        else
          throw new errors.YAMLParseError([offset, offset + 1], code, message);
      };
      switch (token.type) {
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
        case "block-scalar":
          return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
      }
    }
    return null;
  }
  function createScalarToken(value, context) {
    const { implicitKey = false, indent, inFlow = false, offset = -1, type = "PLAIN" } = context;
    const source = stringifyString.stringifyString({ type, value }, {
      implicitKey,
      indent: indent > 0 ? " ".repeat(indent) : "",
      inFlow,
      options: { blockQuote: true, lineWidth: -1 }
    });
    const end = context.end ?? [
      { type: "newline", offset: -1, indent, source: `
` }
    ];
    switch (source[0]) {
      case "|":
      case ">": {
        const he = source.indexOf(`
`);
        const head = source.substring(0, he);
        const body = source.substring(he + 1) + `
`;
        const props = [
          { type: "block-scalar-header", offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, end))
          props.push({ type: "newline", offset: -1, indent, source: `
` });
        return { type: "block-scalar", offset, indent, props, source: body };
      }
      case '"':
        return { type: "double-quoted-scalar", offset, indent, source, end };
      case "'":
        return { type: "single-quoted-scalar", offset, indent, source, end };
      default:
        return { type: "scalar", offset, indent, source, end };
    }
  }
  function setScalarValue(token, value, context = {}) {
    let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
    let indent = "indent" in token ? token.indent : null;
    if (afterKey && typeof indent === "number")
      indent += 2;
    if (!type)
      switch (token.type) {
        case "single-quoted-scalar":
          type = "QUOTE_SINGLE";
          break;
        case "double-quoted-scalar":
          type = "QUOTE_DOUBLE";
          break;
        case "block-scalar": {
          const header = token.props[0];
          if (header.type !== "block-scalar-header")
            throw new Error("Invalid block scalar header");
          type = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
          break;
        }
        default:
          type = "PLAIN";
      }
    const source = stringifyString.stringifyString({ type, value }, {
      implicitKey: implicitKey || indent === null,
      indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
      inFlow,
      options: { blockQuote: true, lineWidth: -1 }
    });
    switch (source[0]) {
      case "|":
      case ">":
        setBlockScalarValue(token, source);
        break;
      case '"':
        setFlowScalarValue(token, source, "double-quoted-scalar");
        break;
      case "'":
        setFlowScalarValue(token, source, "single-quoted-scalar");
        break;
      default:
        setFlowScalarValue(token, source, "scalar");
    }
  }
  function setBlockScalarValue(token, source) {
    const he = source.indexOf(`
`);
    const head = source.substring(0, he);
    const body = source.substring(he + 1) + `
`;
    if (token.type === "block-scalar") {
      const header = token.props[0];
      if (header.type !== "block-scalar-header")
        throw new Error("Invalid block scalar header");
      header.source = head;
      token.source = body;
    } else {
      const { offset } = token;
      const indent = "indent" in token ? token.indent : -1;
      const props = [
        { type: "block-scalar-header", offset, indent, source: head }
      ];
      if (!addEndtoBlockProps(props, "end" in token ? token.end : undefined))
        props.push({ type: "newline", offset: -1, indent, source: `
` });
      for (const key of Object.keys(token))
        if (key !== "type" && key !== "offset")
          delete token[key];
      Object.assign(token, { type: "block-scalar", indent, props, source: body });
    }
  }
  function addEndtoBlockProps(props, end) {
    if (end)
      for (const st of end)
        switch (st.type) {
          case "space":
          case "comment":
            props.push(st);
            break;
          case "newline":
            props.push(st);
            return true;
        }
    return false;
  }
  function setFlowScalarValue(token, source, type) {
    switch (token.type) {
      case "scalar":
      case "double-quoted-scalar":
      case "single-quoted-scalar":
        token.type = type;
        token.source = source;
        break;
      case "block-scalar": {
        const end = token.props.slice(1);
        let oa = source.length;
        if (token.props[0].type === "block-scalar-header")
          oa -= token.props[0].source.length;
        for (const tok of end)
          tok.offset += oa;
        delete token.props;
        Object.assign(token, { type, source, end });
        break;
      }
      case "block-map":
      case "block-seq": {
        const offset = token.offset + source.length;
        const nl = { type: "newline", offset, indent: token.indent, source: `
` };
        delete token.items;
        Object.assign(token, { type, source, end: [nl] });
        break;
      }
      default: {
        const indent = "indent" in token ? token.indent : -1;
        const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
        for (const key of Object.keys(token))
          if (key !== "type" && key !== "offset")
            delete token[key];
        Object.assign(token, { type, indent, source, end });
      }
    }
  }
  exports.createScalarToken = createScalarToken;
  exports.resolveAsScalar = resolveAsScalar;
  exports.setScalarValue = setScalarValue;
});

// node_modules/yaml/dist/parse/cst-stringify.js
var require_cst_stringify = __commonJS((exports) => {
  var stringify = (cst) => ("type" in cst) ? stringifyToken(cst) : stringifyItem(cst);
  function stringifyToken(token) {
    switch (token.type) {
      case "block-scalar": {
        let res = "";
        for (const tok of token.props)
          res += stringifyToken(tok);
        return res + token.source;
      }
      case "block-map":
      case "block-seq": {
        let res = "";
        for (const item of token.items)
          res += stringifyItem(item);
        return res;
      }
      case "flow-collection": {
        let res = token.start.source;
        for (const item of token.items)
          res += stringifyItem(item);
        for (const st of token.end)
          res += st.source;
        return res;
      }
      case "document": {
        let res = stringifyItem(token);
        if (token.end)
          for (const st of token.end)
            res += st.source;
        return res;
      }
      default: {
        let res = token.source;
        if ("end" in token && token.end)
          for (const st of token.end)
            res += st.source;
        return res;
      }
    }
  }
  function stringifyItem({ start, key, sep, value }) {
    let res = "";
    for (const st of start)
      res += st.source;
    if (key)
      res += stringifyToken(key);
    if (sep)
      for (const st of sep)
        res += st.source;
    if (value)
      res += stringifyToken(value);
    return res;
  }
  exports.stringify = stringify;
});

// node_modules/yaml/dist/parse/cst-visit.js
var require_cst_visit = __commonJS((exports) => {
  var BREAK = Symbol("break visit");
  var SKIP = Symbol("skip children");
  var REMOVE = Symbol("remove item");
  function visit(cst, visitor) {
    if ("type" in cst && cst.type === "document")
      cst = { start: cst.start, value: cst.value };
    _visit(Object.freeze([]), cst, visitor);
  }
  visit.BREAK = BREAK;
  visit.SKIP = SKIP;
  visit.REMOVE = REMOVE;
  visit.itemAtPath = (cst, path) => {
    let item = cst;
    for (const [field, index] of path) {
      const tok = item?.[field];
      if (tok && "items" in tok) {
        item = tok.items[index];
      } else
        return;
    }
    return item;
  };
  visit.parentCollection = (cst, path) => {
    const parent = visit.itemAtPath(cst, path.slice(0, -1));
    const field = path[path.length - 1][0];
    const coll = parent?.[field];
    if (coll && "items" in coll)
      return coll;
    throw new Error("Parent collection not found");
  };
  function _visit(path, item, visitor) {
    let ctrl = visitor(item, path);
    if (typeof ctrl === "symbol")
      return ctrl;
    for (const field of ["key", "value"]) {
      const token = item[field];
      if (token && "items" in token) {
        for (let i = 0;i < token.items.length; ++i) {
          const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
          if (typeof ci === "number")
            i = ci - 1;
          else if (ci === BREAK)
            return BREAK;
          else if (ci === REMOVE) {
            token.items.splice(i, 1);
            i -= 1;
          }
        }
        if (typeof ctrl === "function" && field === "key")
          ctrl = ctrl(item, path);
      }
    }
    return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
  }
  exports.visit = visit;
});

// node_modules/yaml/dist/parse/cst.js
var require_cst = __commonJS((exports) => {
  var cstScalar = require_cst_scalar();
  var cstStringify = require_cst_stringify();
  var cstVisit = require_cst_visit();
  var BOM = "\uFEFF";
  var DOCUMENT = "\x02";
  var FLOW_END = "\x18";
  var SCALAR = "\x1F";
  var isCollection = (token) => !!token && ("items" in token);
  var isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
  function prettyToken(token) {
    switch (token) {
      case BOM:
        return "<BOM>";
      case DOCUMENT:
        return "<DOC>";
      case FLOW_END:
        return "<FLOW_END>";
      case SCALAR:
        return "<SCALAR>";
      default:
        return JSON.stringify(token);
    }
  }
  function tokenType(source) {
    switch (source) {
      case BOM:
        return "byte-order-mark";
      case DOCUMENT:
        return "doc-mode";
      case FLOW_END:
        return "flow-error-end";
      case SCALAR:
        return "scalar";
      case "---":
        return "doc-start";
      case "...":
        return "doc-end";
      case "":
      case `
`:
      case `\r
`:
        return "newline";
      case "-":
        return "seq-item-ind";
      case "?":
        return "explicit-key-ind";
      case ":":
        return "map-value-ind";
      case "{":
        return "flow-map-start";
      case "}":
        return "flow-map-end";
      case "[":
        return "flow-seq-start";
      case "]":
        return "flow-seq-end";
      case ",":
        return "comma";
    }
    switch (source[0]) {
      case " ":
      case "\t":
        return "space";
      case "#":
        return "comment";
      case "%":
        return "directive-line";
      case "*":
        return "alias";
      case "&":
        return "anchor";
      case "!":
        return "tag";
      case "'":
        return "single-quoted-scalar";
      case '"':
        return "double-quoted-scalar";
      case "|":
      case ">":
        return "block-scalar-header";
    }
    return null;
  }
  exports.createScalarToken = cstScalar.createScalarToken;
  exports.resolveAsScalar = cstScalar.resolveAsScalar;
  exports.setScalarValue = cstScalar.setScalarValue;
  exports.stringify = cstStringify.stringify;
  exports.visit = cstVisit.visit;
  exports.BOM = BOM;
  exports.DOCUMENT = DOCUMENT;
  exports.FLOW_END = FLOW_END;
  exports.SCALAR = SCALAR;
  exports.isCollection = isCollection;
  exports.isScalar = isScalar;
  exports.prettyToken = prettyToken;
  exports.tokenType = tokenType;
});

// node_modules/yaml/dist/parse/lexer.js
var require_lexer = __commonJS((exports) => {
  var cst = require_cst();
  function isEmpty(ch) {
    switch (ch) {
      case undefined:
      case " ":
      case `
`:
      case "\r":
      case "\t":
        return true;
      default:
        return false;
    }
  }
  var hexDigits = new Set("0123456789ABCDEFabcdef");
  var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
  var flowIndicatorChars = new Set(",[]{}");
  var invalidAnchorChars = new Set(` ,[]{}
\r	`);
  var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);

  class Lexer {
    constructor() {
      this.atEnd = false;
      this.blockScalarIndent = -1;
      this.blockScalarKeep = false;
      this.buffer = "";
      this.flowKey = false;
      this.flowLevel = 0;
      this.indentNext = 0;
      this.indentValue = 0;
      this.lineEndPos = null;
      this.next = null;
      this.pos = 0;
    }
    *lex(source, incomplete = false) {
      if (source) {
        if (typeof source !== "string")
          throw TypeError("source is not a string");
        this.buffer = this.buffer ? this.buffer + source : source;
        this.lineEndPos = null;
      }
      this.atEnd = !incomplete;
      let next = this.next ?? "stream";
      while (next && (incomplete || this.hasChars(1)))
        next = yield* this.parseNext(next);
    }
    atLineEnd() {
      let i = this.pos;
      let ch = this.buffer[i];
      while (ch === " " || ch === "\t")
        ch = this.buffer[++i];
      if (!ch || ch === "#" || ch === `
`)
        return true;
      if (ch === "\r")
        return this.buffer[i + 1] === `
`;
      return false;
    }
    charAt(n) {
      return this.buffer[this.pos + n];
    }
    continueScalar(offset) {
      let ch = this.buffer[offset];
      if (this.indentNext > 0) {
        let indent = 0;
        while (ch === " ")
          ch = this.buffer[++indent + offset];
        if (ch === "\r") {
          const next = this.buffer[indent + offset + 1];
          if (next === `
` || !next && !this.atEnd)
            return offset + indent + 1;
        }
        return ch === `
` || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
      }
      if (ch === "-" || ch === ".") {
        const dt = this.buffer.substr(offset, 3);
        if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
          return -1;
      }
      return offset;
    }
    getLine() {
      let end = this.lineEndPos;
      if (typeof end !== "number" || end !== -1 && end < this.pos) {
        end = this.buffer.indexOf(`
`, this.pos);
        this.lineEndPos = end;
      }
      if (end === -1)
        return this.atEnd ? this.buffer.substring(this.pos) : null;
      if (this.buffer[end - 1] === "\r")
        end -= 1;
      return this.buffer.substring(this.pos, end);
    }
    hasChars(n) {
      return this.pos + n <= this.buffer.length;
    }
    setNext(state) {
      this.buffer = this.buffer.substring(this.pos);
      this.pos = 0;
      this.lineEndPos = null;
      this.next = state;
      return null;
    }
    peek(n) {
      return this.buffer.substr(this.pos, n);
    }
    *parseNext(next) {
      switch (next) {
        case "stream":
          return yield* this.parseStream();
        case "line-start":
          return yield* this.parseLineStart();
        case "block-start":
          return yield* this.parseBlockStart();
        case "doc":
          return yield* this.parseDocument();
        case "flow":
          return yield* this.parseFlowCollection();
        case "quoted-scalar":
          return yield* this.parseQuotedScalar();
        case "block-scalar":
          return yield* this.parseBlockScalar();
        case "plain-scalar":
          return yield* this.parsePlainScalar();
      }
    }
    *parseStream() {
      let line = this.getLine();
      if (line === null)
        return this.setNext("stream");
      if (line[0] === cst.BOM) {
        yield* this.pushCount(1);
        line = line.substring(1);
      }
      if (line[0] === "%") {
        let dirEnd = line.length;
        let cs = line.indexOf("#");
        while (cs !== -1) {
          const ch = line[cs - 1];
          if (ch === " " || ch === "\t") {
            dirEnd = cs - 1;
            break;
          } else {
            cs = line.indexOf("#", cs + 1);
          }
        }
        while (true) {
          const ch = line[dirEnd - 1];
          if (ch === " " || ch === "\t")
            dirEnd -= 1;
          else
            break;
        }
        const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
        yield* this.pushCount(line.length - n);
        this.pushNewline();
        return "stream";
      }
      if (this.atLineEnd()) {
        const sp = yield* this.pushSpaces(true);
        yield* this.pushCount(line.length - sp);
        yield* this.pushNewline();
        return "stream";
      }
      yield cst.DOCUMENT;
      return yield* this.parseLineStart();
    }
    *parseLineStart() {
      const ch = this.charAt(0);
      if (!ch && !this.atEnd)
        return this.setNext("line-start");
      if (ch === "-" || ch === ".") {
        if (!this.atEnd && !this.hasChars(4))
          return this.setNext("line-start");
        const s = this.peek(3);
        if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
          yield* this.pushCount(3);
          this.indentValue = 0;
          this.indentNext = 0;
          return s === "---" ? "doc" : "stream";
        }
      }
      this.indentValue = yield* this.pushSpaces(false);
      if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
        this.indentNext = this.indentValue;
      return yield* this.parseBlockStart();
    }
    *parseBlockStart() {
      const [ch0, ch1] = this.peek(2);
      if (!ch1 && !this.atEnd)
        return this.setNext("block-start");
      if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
        const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
        this.indentNext = this.indentValue + 1;
        this.indentValue += n;
        return "block-start";
      }
      return "doc";
    }
    *parseDocument() {
      yield* this.pushSpaces(true);
      const line = this.getLine();
      if (line === null)
        return this.setNext("doc");
      let n = yield* this.pushIndicators();
      switch (line[n]) {
        case "#":
          yield* this.pushCount(line.length - n);
        case undefined:
          yield* this.pushNewline();
          return yield* this.parseLineStart();
        case "{":
        case "[":
          yield* this.pushCount(1);
          this.flowKey = false;
          this.flowLevel = 1;
          return "flow";
        case "}":
        case "]":
          yield* this.pushCount(1);
          return "doc";
        case "*":
          yield* this.pushUntil(isNotAnchorChar);
          return "doc";
        case '"':
        case "'":
          return yield* this.parseQuotedScalar();
        case "|":
        case ">":
          n += yield* this.parseBlockScalarHeader();
          n += yield* this.pushSpaces(true);
          yield* this.pushCount(line.length - n);
          yield* this.pushNewline();
          return yield* this.parseBlockScalar();
        default:
          return yield* this.parsePlainScalar();
      }
    }
    *parseFlowCollection() {
      let nl, sp;
      let indent = -1;
      do {
        nl = yield* this.pushNewline();
        if (nl > 0) {
          sp = yield* this.pushSpaces(false);
          this.indentValue = indent = sp;
        } else {
          sp = 0;
        }
        sp += yield* this.pushSpaces(true);
      } while (nl + sp > 0);
      const line = this.getLine();
      if (line === null)
        return this.setNext("flow");
      if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
        const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
        if (!atFlowEndMarker) {
          this.flowLevel = 0;
          yield cst.FLOW_END;
          return yield* this.parseLineStart();
        }
      }
      let n = 0;
      while (line[n] === ",") {
        n += yield* this.pushCount(1);
        n += yield* this.pushSpaces(true);
        this.flowKey = false;
      }
      n += yield* this.pushIndicators();
      switch (line[n]) {
        case undefined:
          return "flow";
        case "#":
          yield* this.pushCount(line.length - n);
          return "flow";
        case "{":
        case "[":
          yield* this.pushCount(1);
          this.flowKey = false;
          this.flowLevel += 1;
          return "flow";
        case "}":
        case "]":
          yield* this.pushCount(1);
          this.flowKey = true;
          this.flowLevel -= 1;
          return this.flowLevel ? "flow" : "doc";
        case "*":
          yield* this.pushUntil(isNotAnchorChar);
          return "flow";
        case '"':
        case "'":
          this.flowKey = true;
          return yield* this.parseQuotedScalar();
        case ":": {
          const next = this.charAt(1);
          if (this.flowKey || isEmpty(next) || next === ",") {
            this.flowKey = false;
            yield* this.pushCount(1);
            yield* this.pushSpaces(true);
            return "flow";
          }
        }
        default:
          this.flowKey = false;
          return yield* this.parsePlainScalar();
      }
    }
    *parseQuotedScalar() {
      const quote = this.charAt(0);
      let end = this.buffer.indexOf(quote, this.pos + 1);
      if (quote === "'") {
        while (end !== -1 && this.buffer[end + 1] === "'")
          end = this.buffer.indexOf("'", end + 2);
      } else {
        while (end !== -1) {
          let n = 0;
          while (this.buffer[end - 1 - n] === "\\")
            n += 1;
          if (n % 2 === 0)
            break;
          end = this.buffer.indexOf('"', end + 1);
        }
      }
      const qb = this.buffer.substring(0, end);
      let nl = qb.indexOf(`
`, this.pos);
      if (nl !== -1) {
        while (nl !== -1) {
          const cs = this.continueScalar(nl + 1);
          if (cs === -1)
            break;
          nl = qb.indexOf(`
`, cs);
        }
        if (nl !== -1) {
          end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
        }
      }
      if (end === -1) {
        if (!this.atEnd)
          return this.setNext("quoted-scalar");
        end = this.buffer.length;
      }
      yield* this.pushToIndex(end + 1, false);
      return this.flowLevel ? "flow" : "doc";
    }
    *parseBlockScalarHeader() {
      this.blockScalarIndent = -1;
      this.blockScalarKeep = false;
      let i = this.pos;
      while (true) {
        const ch = this.buffer[++i];
        if (ch === "+")
          this.blockScalarKeep = true;
        else if (ch > "0" && ch <= "9")
          this.blockScalarIndent = Number(ch) - 1;
        else if (ch !== "-")
          break;
      }
      return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
    }
    *parseBlockScalar() {
      let nl = this.pos - 1;
      let indent = 0;
      let ch;
      loop:
        for (let i2 = this.pos;ch = this.buffer[i2]; ++i2) {
          switch (ch) {
            case " ":
              indent += 1;
              break;
            case `
`:
              nl = i2;
              indent = 0;
              break;
            case "\r": {
              const next = this.buffer[i2 + 1];
              if (!next && !this.atEnd)
                return this.setNext("block-scalar");
              if (next === `
`)
                break;
            }
            default:
              break loop;
          }
        }
      if (!ch && !this.atEnd)
        return this.setNext("block-scalar");
      if (indent >= this.indentNext) {
        if (this.blockScalarIndent === -1)
          this.indentNext = indent;
        else {
          this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
        }
        do {
          const cs = this.continueScalar(nl + 1);
          if (cs === -1)
            break;
          nl = this.buffer.indexOf(`
`, cs);
        } while (nl !== -1);
        if (nl === -1) {
          if (!this.atEnd)
            return this.setNext("block-scalar");
          nl = this.buffer.length;
        }
      }
      let i = nl + 1;
      ch = this.buffer[i];
      while (ch === " ")
        ch = this.buffer[++i];
      if (ch === "\t") {
        while (ch === "\t" || ch === " " || ch === "\r" || ch === `
`)
          ch = this.buffer[++i];
        nl = i - 1;
      } else if (!this.blockScalarKeep) {
        do {
          let i2 = nl - 1;
          let ch2 = this.buffer[i2];
          if (ch2 === "\r")
            ch2 = this.buffer[--i2];
          const lastChar = i2;
          while (ch2 === " ")
            ch2 = this.buffer[--i2];
          if (ch2 === `
` && i2 >= this.pos && i2 + 1 + indent > lastChar)
            nl = i2;
          else
            break;
        } while (true);
      }
      yield cst.SCALAR;
      yield* this.pushToIndex(nl + 1, true);
      return yield* this.parseLineStart();
    }
    *parsePlainScalar() {
      const inFlow = this.flowLevel > 0;
      let end = this.pos - 1;
      let i = this.pos - 1;
      let ch;
      while (ch = this.buffer[++i]) {
        if (ch === ":") {
          const next = this.buffer[i + 1];
          if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
            break;
          end = i;
        } else if (isEmpty(ch)) {
          let next = this.buffer[i + 1];
          if (ch === "\r") {
            if (next === `
`) {
              i += 1;
              ch = `
`;
              next = this.buffer[i + 1];
            } else
              end = i;
          }
          if (next === "#" || inFlow && flowIndicatorChars.has(next))
            break;
          if (ch === `
`) {
            const cs = this.continueScalar(i + 1);
            if (cs === -1)
              break;
            i = Math.max(i, cs - 2);
          }
        } else {
          if (inFlow && flowIndicatorChars.has(ch))
            break;
          end = i;
        }
      }
      if (!ch && !this.atEnd)
        return this.setNext("plain-scalar");
      yield cst.SCALAR;
      yield* this.pushToIndex(end + 1, true);
      return inFlow ? "flow" : "doc";
    }
    *pushCount(n) {
      if (n > 0) {
        yield this.buffer.substr(this.pos, n);
        this.pos += n;
        return n;
      }
      return 0;
    }
    *pushToIndex(i, allowEmpty) {
      const s = this.buffer.slice(this.pos, i);
      if (s) {
        yield s;
        this.pos += s.length;
        return s.length;
      } else if (allowEmpty)
        yield "";
      return 0;
    }
    *pushIndicators() {
      let n = 0;
      loop:
        while (true) {
          switch (this.charAt(0)) {
            case "!":
              n += yield* this.pushTag();
              n += yield* this.pushSpaces(true);
              continue loop;
            case "&":
              n += yield* this.pushUntil(isNotAnchorChar);
              n += yield* this.pushSpaces(true);
              continue loop;
            case "-":
            case "?":
            case ":": {
              const inFlow = this.flowLevel > 0;
              const ch1 = this.charAt(1);
              if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
                if (!inFlow)
                  this.indentNext = this.indentValue + 1;
                else if (this.flowKey)
                  this.flowKey = false;
                n += yield* this.pushCount(1);
                n += yield* this.pushSpaces(true);
                continue loop;
              }
            }
          }
          break loop;
        }
      return n;
    }
    *pushTag() {
      if (this.charAt(1) === "<") {
        let i = this.pos + 2;
        let ch = this.buffer[i];
        while (!isEmpty(ch) && ch !== ">")
          ch = this.buffer[++i];
        return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
      } else {
        let i = this.pos + 1;
        let ch = this.buffer[i];
        while (ch) {
          if (tagChars.has(ch))
            ch = this.buffer[++i];
          else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
            ch = this.buffer[i += 3];
          } else
            break;
        }
        return yield* this.pushToIndex(i, false);
      }
    }
    *pushNewline() {
      const ch = this.buffer[this.pos];
      if (ch === `
`)
        return yield* this.pushCount(1);
      else if (ch === "\r" && this.charAt(1) === `
`)
        return yield* this.pushCount(2);
      else
        return 0;
    }
    *pushSpaces(allowTabs) {
      let i = this.pos - 1;
      let ch;
      do {
        ch = this.buffer[++i];
      } while (ch === " " || allowTabs && ch === "\t");
      const n = i - this.pos;
      if (n > 0) {
        yield this.buffer.substr(this.pos, n);
        this.pos = i;
      }
      return n;
    }
    *pushUntil(test) {
      let i = this.pos;
      let ch = this.buffer[i];
      while (!test(ch))
        ch = this.buffer[++i];
      return yield* this.pushToIndex(i, false);
    }
  }
  exports.Lexer = Lexer;
});

// node_modules/yaml/dist/parse/line-counter.js
var require_line_counter = __commonJS((exports) => {
  class LineCounter {
    constructor() {
      this.lineStarts = [];
      this.addNewLine = (offset) => this.lineStarts.push(offset);
      this.linePos = (offset) => {
        let low = 0;
        let high = this.lineStarts.length;
        while (low < high) {
          const mid = low + high >> 1;
          if (this.lineStarts[mid] < offset)
            low = mid + 1;
          else
            high = mid;
        }
        if (this.lineStarts[low] === offset)
          return { line: low + 1, col: 1 };
        if (low === 0)
          return { line: 0, col: offset };
        const start = this.lineStarts[low - 1];
        return { line: low, col: offset - start + 1 };
      };
    }
  }
  exports.LineCounter = LineCounter;
});

// node_modules/yaml/dist/parse/parser.js
var require_parser = __commonJS((exports) => {
  var node_process = __require("process");
  var cst = require_cst();
  var lexer = require_lexer();
  function includesToken(list, type) {
    for (let i = 0;i < list.length; ++i)
      if (list[i].type === type)
        return true;
    return false;
  }
  function findNonEmptyIndex(list) {
    for (let i = 0;i < list.length; ++i) {
      switch (list[i].type) {
        case "space":
        case "comment":
        case "newline":
          break;
        default:
          return i;
      }
    }
    return -1;
  }
  function isFlowToken(token) {
    switch (token?.type) {
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
      case "flow-collection":
        return true;
      default:
        return false;
    }
  }
  function getPrevProps(parent) {
    switch (parent.type) {
      case "document":
        return parent.start;
      case "block-map": {
        const it = parent.items[parent.items.length - 1];
        return it.sep ?? it.start;
      }
      case "block-seq":
        return parent.items[parent.items.length - 1].start;
      default:
        return [];
    }
  }
  function getFirstKeyStartProps(prev) {
    if (prev.length === 0)
      return [];
    let i = prev.length;
    loop:
      while (--i >= 0) {
        switch (prev[i].type) {
          case "doc-start":
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
          case "newline":
            break loop;
        }
      }
    while (prev[++i]?.type === "space") {}
    return prev.splice(i, prev.length);
  }
  function arrayPushArray(target, source) {
    if (source.length < 1e5)
      Array.prototype.push.apply(target, source);
    else
      for (let i = 0;i < source.length; ++i)
        target.push(source[i]);
  }
  function fixFlowSeqItems(fc) {
    if (fc.start.type === "flow-seq-start") {
      for (const it of fc.items) {
        if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
          if (it.key)
            it.value = it.key;
          delete it.key;
          if (isFlowToken(it.value)) {
            if (it.value.end)
              arrayPushArray(it.value.end, it.sep);
            else
              it.value.end = it.sep;
          } else
            arrayPushArray(it.start, it.sep);
          delete it.sep;
        }
      }
    }
  }

  class Parser {
    constructor(onNewLine) {
      this.atNewLine = true;
      this.atScalar = false;
      this.indent = 0;
      this.offset = 0;
      this.onKeyLine = false;
      this.stack = [];
      this.source = "";
      this.type = "";
      this.lexer = new lexer.Lexer;
      this.onNewLine = onNewLine;
    }
    *parse(source, incomplete = false) {
      if (this.onNewLine && this.offset === 0)
        this.onNewLine(0);
      for (const lexeme of this.lexer.lex(source, incomplete))
        yield* this.next(lexeme);
      if (!incomplete)
        yield* this.end();
    }
    *next(source) {
      this.source = source;
      if (node_process.env.LOG_TOKENS)
        console.log("|", cst.prettyToken(source));
      if (this.atScalar) {
        this.atScalar = false;
        yield* this.step();
        this.offset += source.length;
        return;
      }
      const type = cst.tokenType(source);
      if (!type) {
        const message = `Not a YAML token: ${source}`;
        yield* this.pop({ type: "error", offset: this.offset, message, source });
        this.offset += source.length;
      } else if (type === "scalar") {
        this.atNewLine = false;
        this.atScalar = true;
        this.type = "scalar";
      } else {
        this.type = type;
        yield* this.step();
        switch (type) {
          case "newline":
            this.atNewLine = true;
            this.indent = 0;
            if (this.onNewLine)
              this.onNewLine(this.offset + source.length);
            break;
          case "space":
            if (this.atNewLine && source[0] === " ")
              this.indent += source.length;
            break;
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
            if (this.atNewLine)
              this.indent += source.length;
            break;
          case "doc-mode":
          case "flow-error-end":
            return;
          default:
            this.atNewLine = false;
        }
        this.offset += source.length;
      }
    }
    *end() {
      while (this.stack.length > 0)
        yield* this.pop();
    }
    get sourceToken() {
      const st = {
        type: this.type,
        offset: this.offset,
        indent: this.indent,
        source: this.source
      };
      return st;
    }
    *step() {
      const top = this.peek(1);
      if (this.type === "doc-end" && top?.type !== "doc-end") {
        while (this.stack.length > 0)
          yield* this.pop();
        this.stack.push({
          type: "doc-end",
          offset: this.offset,
          source: this.source
        });
        return;
      }
      if (!top)
        return yield* this.stream();
      switch (top.type) {
        case "document":
          return yield* this.document(top);
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return yield* this.scalar(top);
        case "block-scalar":
          return yield* this.blockScalar(top);
        case "block-map":
          return yield* this.blockMap(top);
        case "block-seq":
          return yield* this.blockSequence(top);
        case "flow-collection":
          return yield* this.flowCollection(top);
        case "doc-end":
          return yield* this.documentEnd(top);
      }
      yield* this.pop();
    }
    peek(n) {
      return this.stack[this.stack.length - n];
    }
    *pop(error) {
      const token = error ?? this.stack.pop();
      if (!token) {
        const message = "Tried to pop an empty stack";
        yield { type: "error", offset: this.offset, source: "", message };
      } else if (this.stack.length === 0) {
        yield token;
      } else {
        const top = this.peek(1);
        if (token.type === "block-scalar") {
          token.indent = "indent" in top ? top.indent : 0;
        } else if (token.type === "flow-collection" && top.type === "document") {
          token.indent = 0;
        }
        if (token.type === "flow-collection")
          fixFlowSeqItems(token);
        switch (top.type) {
          case "document":
            top.value = token;
            break;
          case "block-scalar":
            top.props.push(token);
            break;
          case "block-map": {
            const it = top.items[top.items.length - 1];
            if (it.value) {
              top.items.push({ start: [], key: token, sep: [] });
              this.onKeyLine = true;
              return;
            } else if (it.sep) {
              it.value = token;
            } else {
              Object.assign(it, { key: token, sep: [] });
              this.onKeyLine = !it.explicitKey;
              return;
            }
            break;
          }
          case "block-seq": {
            const it = top.items[top.items.length - 1];
            if (it.value)
              top.items.push({ start: [], value: token });
            else
              it.value = token;
            break;
          }
          case "flow-collection": {
            const it = top.items[top.items.length - 1];
            if (!it || it.value)
              top.items.push({ start: [], key: token, sep: [] });
            else if (it.sep)
              it.value = token;
            else
              Object.assign(it, { key: token, sep: [] });
            return;
          }
          default:
            yield* this.pop();
            yield* this.pop(token);
        }
        if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
          const last = token.items[token.items.length - 1];
          if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
            if (top.type === "document")
              top.end = last.start;
            else
              top.items.push({ start: last.start });
            token.items.splice(-1, 1);
          }
        }
      }
    }
    *stream() {
      switch (this.type) {
        case "directive-line":
          yield { type: "directive", offset: this.offset, source: this.source };
          return;
        case "byte-order-mark":
        case "space":
        case "comment":
        case "newline":
          yield this.sourceToken;
          return;
        case "doc-mode":
        case "doc-start": {
          const doc = {
            type: "document",
            offset: this.offset,
            start: []
          };
          if (this.type === "doc-start")
            doc.start.push(this.sourceToken);
          this.stack.push(doc);
          return;
        }
      }
      yield {
        type: "error",
        offset: this.offset,
        message: `Unexpected ${this.type} token in YAML stream`,
        source: this.source
      };
    }
    *document(doc) {
      if (doc.value)
        return yield* this.lineEnd(doc);
      switch (this.type) {
        case "doc-start": {
          if (findNonEmptyIndex(doc.start) !== -1) {
            yield* this.pop();
            yield* this.step();
          } else
            doc.start.push(this.sourceToken);
          return;
        }
        case "anchor":
        case "tag":
        case "space":
        case "comment":
        case "newline":
          doc.start.push(this.sourceToken);
          return;
      }
      const bv = this.startBlockValue(doc);
      if (bv)
        this.stack.push(bv);
      else {
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML document`,
          source: this.source
        };
      }
    }
    *scalar(scalar) {
      if (this.type === "map-value-ind") {
        const prev = getPrevProps(this.peek(2));
        const start = getFirstKeyStartProps(prev);
        let sep;
        if (scalar.end) {
          sep = scalar.end;
          sep.push(this.sourceToken);
          delete scalar.end;
        } else
          sep = [this.sourceToken];
        const map = {
          type: "block-map",
          offset: scalar.offset,
          indent: scalar.indent,
          items: [{ start, key: scalar, sep }]
        };
        this.onKeyLine = true;
        this.stack[this.stack.length - 1] = map;
      } else
        yield* this.lineEnd(scalar);
    }
    *blockScalar(scalar) {
      switch (this.type) {
        case "space":
        case "comment":
        case "newline":
          scalar.props.push(this.sourceToken);
          return;
        case "scalar":
          scalar.source = this.source;
          this.atNewLine = true;
          this.indent = 0;
          if (this.onNewLine) {
            let nl = this.source.indexOf(`
`) + 1;
            while (nl !== 0) {
              this.onNewLine(this.offset + nl);
              nl = this.source.indexOf(`
`, nl) + 1;
            }
          }
          yield* this.pop();
          break;
        default:
          yield* this.pop();
          yield* this.step();
      }
    }
    *blockMap(map) {
      const it = map.items[map.items.length - 1];
      switch (this.type) {
        case "newline":
          this.onKeyLine = false;
          if (it.value) {
            const end = "end" in it.value ? it.value.end : undefined;
            const last = Array.isArray(end) ? end[end.length - 1] : undefined;
            if (last?.type === "comment")
              end?.push(this.sourceToken);
            else
              map.items.push({ start: [this.sourceToken] });
          } else if (it.sep) {
            it.sep.push(this.sourceToken);
          } else {
            it.start.push(this.sourceToken);
          }
          return;
        case "space":
        case "comment":
          if (it.value) {
            map.items.push({ start: [this.sourceToken] });
          } else if (it.sep) {
            it.sep.push(this.sourceToken);
          } else {
            if (this.atIndentedComment(it.start, map.indent)) {
              const prev = map.items[map.items.length - 2];
              const end = prev?.value?.end;
              if (Array.isArray(end)) {
                arrayPushArray(end, it.start);
                end.push(this.sourceToken);
                map.items.pop();
                return;
              }
            }
            it.start.push(this.sourceToken);
          }
          return;
      }
      if (this.indent >= map.indent) {
        const atMapIndent = !this.onKeyLine && this.indent === map.indent;
        const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
        let start = [];
        if (atNextItem && it.sep && !it.value) {
          const nl = [];
          for (let i = 0;i < it.sep.length; ++i) {
            const st = it.sep[i];
            switch (st.type) {
              case "newline":
                nl.push(i);
                break;
              case "space":
                break;
              case "comment":
                if (st.indent > map.indent)
                  nl.length = 0;
                break;
              default:
                nl.length = 0;
            }
          }
          if (nl.length >= 2)
            start = it.sep.splice(nl[1]);
        }
        switch (this.type) {
          case "anchor":
          case "tag":
            if (atNextItem || it.value) {
              start.push(this.sourceToken);
              map.items.push({ start });
              this.onKeyLine = true;
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              it.start.push(this.sourceToken);
            }
            return;
          case "explicit-key-ind":
            if (!it.sep && !it.explicitKey) {
              it.start.push(this.sourceToken);
              it.explicitKey = true;
            } else if (atNextItem || it.value) {
              start.push(this.sourceToken);
              map.items.push({ start, explicitKey: true });
            } else {
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: [this.sourceToken], explicitKey: true }]
              });
            }
            this.onKeyLine = true;
            return;
          case "map-value-ind":
            if (it.explicitKey) {
              if (!it.sep) {
                if (includesToken(it.start, "newline")) {
                  Object.assign(it, { key: null, sep: [this.sourceToken] });
                } else {
                  const start2 = getFirstKeyStartProps(it.start);
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                  });
                }
              } else if (it.value) {
                map.items.push({ start: [], key: null, sep: [this.sourceToken] });
              } else if (includesToken(it.sep, "map-value-ind")) {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start, key: null, sep: [this.sourceToken] }]
                });
              } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
                const start2 = getFirstKeyStartProps(it.start);
                const key = it.key;
                const sep = it.sep;
                sep.push(this.sourceToken);
                delete it.key;
                delete it.sep;
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: start2, key, sep }]
                });
              } else if (start.length > 0) {
                it.sep = it.sep.concat(start, this.sourceToken);
              } else {
                it.sep.push(this.sourceToken);
              }
            } else {
              if (!it.sep) {
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              } else if (it.value || atNextItem) {
                map.items.push({ start, key: null, sep: [this.sourceToken] });
              } else if (includesToken(it.sep, "map-value-ind")) {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [], key: null, sep: [this.sourceToken] }]
                });
              } else {
                it.sep.push(this.sourceToken);
              }
            }
            this.onKeyLine = true;
            return;
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar": {
            const fs = this.flowScalar(this.type);
            if (atNextItem || it.value) {
              map.items.push({ start, key: fs, sep: [] });
              this.onKeyLine = true;
            } else if (it.sep) {
              this.stack.push(fs);
            } else {
              Object.assign(it, { key: fs, sep: [] });
              this.onKeyLine = true;
            }
            return;
          }
          default: {
            const bv = this.startBlockValue(map);
            if (bv) {
              if (bv.type === "block-seq") {
                if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
                  yield* this.pop({
                    type: "error",
                    offset: this.offset,
                    message: "Unexpected block-seq-ind on same line with key",
                    source: this.source
                  });
                  return;
                }
              } else if (atMapIndent) {
                map.items.push({ start });
              }
              this.stack.push(bv);
              return;
            }
          }
        }
      }
      yield* this.pop();
      yield* this.step();
    }
    *blockSequence(seq) {
      const it = seq.items[seq.items.length - 1];
      switch (this.type) {
        case "newline":
          if (it.value) {
            const end = "end" in it.value ? it.value.end : undefined;
            const last = Array.isArray(end) ? end[end.length - 1] : undefined;
            if (last?.type === "comment")
              end?.push(this.sourceToken);
            else
              seq.items.push({ start: [this.sourceToken] });
          } else
            it.start.push(this.sourceToken);
          return;
        case "space":
        case "comment":
          if (it.value)
            seq.items.push({ start: [this.sourceToken] });
          else {
            if (this.atIndentedComment(it.start, seq.indent)) {
              const prev = seq.items[seq.items.length - 2];
              const end = prev?.value?.end;
              if (Array.isArray(end)) {
                arrayPushArray(end, it.start);
                end.push(this.sourceToken);
                seq.items.pop();
                return;
              }
            }
            it.start.push(this.sourceToken);
          }
          return;
        case "anchor":
        case "tag":
          if (it.value || this.indent <= seq.indent)
            break;
          it.start.push(this.sourceToken);
          return;
        case "seq-item-ind":
          if (this.indent !== seq.indent)
            break;
          if (it.value || includesToken(it.start, "seq-item-ind"))
            seq.items.push({ start: [this.sourceToken] });
          else
            it.start.push(this.sourceToken);
          return;
      }
      if (this.indent > seq.indent) {
        const bv = this.startBlockValue(seq);
        if (bv) {
          this.stack.push(bv);
          return;
        }
      }
      yield* this.pop();
      yield* this.step();
    }
    *flowCollection(fc) {
      const it = fc.items[fc.items.length - 1];
      if (this.type === "flow-error-end") {
        let top;
        do {
          yield* this.pop();
          top = this.peek(1);
        } while (top?.type === "flow-collection");
      } else if (fc.end.length === 0) {
        switch (this.type) {
          case "comma":
          case "explicit-key-ind":
            if (!it || it.sep)
              fc.items.push({ start: [this.sourceToken] });
            else
              it.start.push(this.sourceToken);
            return;
          case "map-value-ind":
            if (!it || it.value)
              fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
            else if (it.sep)
              it.sep.push(this.sourceToken);
            else
              Object.assign(it, { key: null, sep: [this.sourceToken] });
            return;
          case "space":
          case "comment":
          case "newline":
          case "anchor":
          case "tag":
            if (!it || it.value)
              fc.items.push({ start: [this.sourceToken] });
            else if (it.sep)
              it.sep.push(this.sourceToken);
            else
              it.start.push(this.sourceToken);
            return;
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar": {
            const fs = this.flowScalar(this.type);
            if (!it || it.value)
              fc.items.push({ start: [], key: fs, sep: [] });
            else if (it.sep)
              this.stack.push(fs);
            else
              Object.assign(it, { key: fs, sep: [] });
            return;
          }
          case "flow-map-end":
          case "flow-seq-end":
            fc.end.push(this.sourceToken);
            return;
        }
        const bv = this.startBlockValue(fc);
        if (bv)
          this.stack.push(bv);
        else {
          yield* this.pop();
          yield* this.step();
        }
      } else {
        const parent = this.peek(2);
        if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
          yield* this.pop();
          yield* this.step();
        } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
          const prev = getPrevProps(parent);
          const start = getFirstKeyStartProps(prev);
          fixFlowSeqItems(fc);
          const sep = fc.end.splice(1, fc.end.length);
          sep.push(this.sourceToken);
          const map = {
            type: "block-map",
            offset: fc.offset,
            indent: fc.indent,
            items: [{ start, key: fc, sep }]
          };
          this.onKeyLine = true;
          this.stack[this.stack.length - 1] = map;
        } else {
          yield* this.lineEnd(fc);
        }
      }
    }
    flowScalar(type) {
      if (this.onNewLine) {
        let nl = this.source.indexOf(`
`) + 1;
        while (nl !== 0) {
          this.onNewLine(this.offset + nl);
          nl = this.source.indexOf(`
`, nl) + 1;
        }
      }
      return {
        type,
        offset: this.offset,
        indent: this.indent,
        source: this.source
      };
    }
    startBlockValue(parent) {
      switch (this.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return this.flowScalar(this.type);
        case "block-scalar-header":
          return {
            type: "block-scalar",
            offset: this.offset,
            indent: this.indent,
            props: [this.sourceToken],
            source: ""
          };
        case "flow-map-start":
        case "flow-seq-start":
          return {
            type: "flow-collection",
            offset: this.offset,
            indent: this.indent,
            start: this.sourceToken,
            items: [],
            end: []
          };
        case "seq-item-ind":
          return {
            type: "block-seq",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: [this.sourceToken] }]
          };
        case "explicit-key-ind": {
          this.onKeyLine = true;
          const prev = getPrevProps(parent);
          const start = getFirstKeyStartProps(prev);
          start.push(this.sourceToken);
          return {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start, explicitKey: true }]
          };
        }
        case "map-value-ind": {
          this.onKeyLine = true;
          const prev = getPrevProps(parent);
          const start = getFirstKeyStartProps(prev);
          return {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start, key: null, sep: [this.sourceToken] }]
          };
        }
      }
      return null;
    }
    atIndentedComment(start, indent) {
      if (this.type !== "comment")
        return false;
      if (this.indent <= indent)
        return false;
      return start.every((st) => st.type === "newline" || st.type === "space");
    }
    *documentEnd(docEnd) {
      if (this.type !== "doc-mode") {
        if (docEnd.end)
          docEnd.end.push(this.sourceToken);
        else
          docEnd.end = [this.sourceToken];
        if (this.type === "newline")
          yield* this.pop();
      }
    }
    *lineEnd(token) {
      switch (this.type) {
        case "comma":
        case "doc-start":
        case "doc-end":
        case "flow-seq-end":
        case "flow-map-end":
        case "map-value-ind":
          yield* this.pop();
          yield* this.step();
          break;
        case "newline":
          this.onKeyLine = false;
        case "space":
        case "comment":
        default:
          if (token.end)
            token.end.push(this.sourceToken);
          else
            token.end = [this.sourceToken];
          if (this.type === "newline")
            yield* this.pop();
      }
    }
  }
  exports.Parser = Parser;
});

// node_modules/yaml/dist/public-api.js
var require_public_api = __commonJS((exports) => {
  var composer = require_composer();
  var Document = require_Document();
  var errors = require_errors();
  var log = require_log();
  var identity = require_identity();
  var lineCounter = require_line_counter();
  var parser = require_parser();
  function parseOptions(options) {
    const prettyErrors = options.prettyErrors !== false;
    const lineCounter$1 = options.lineCounter || prettyErrors && new lineCounter.LineCounter || null;
    return { lineCounter: lineCounter$1, prettyErrors };
  }
  function parseAllDocuments(source, options = {}) {
    const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
    const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
    const composer$1 = new composer.Composer(options);
    const docs = Array.from(composer$1.compose(parser$1.parse(source)));
    if (prettyErrors && lineCounter2)
      for (const doc of docs) {
        doc.errors.forEach(errors.prettifyError(source, lineCounter2));
        doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
      }
    if (docs.length > 0)
      return docs;
    return Object.assign([], { empty: true }, composer$1.streamInfo());
  }
  function parseDocument(source, options = {}) {
    const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
    const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
    const composer$1 = new composer.Composer(options);
    let doc = null;
    for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) {
      if (!doc)
        doc = _doc;
      else if (doc.options.logLevel !== "silent") {
        doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
        break;
      }
    }
    if (prettyErrors && lineCounter2) {
      doc.errors.forEach(errors.prettifyError(source, lineCounter2));
      doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
    }
    return doc;
  }
  function parse(src, reviver, options) {
    let _reviver = undefined;
    if (typeof reviver === "function") {
      _reviver = reviver;
    } else if (options === undefined && reviver && typeof reviver === "object") {
      options = reviver;
    }
    const doc = parseDocument(src, options);
    if (!doc)
      return null;
    doc.warnings.forEach((warning) => log.warn(doc.options.logLevel, warning));
    if (doc.errors.length > 0) {
      if (doc.options.logLevel !== "silent")
        throw doc.errors[0];
      else
        doc.errors = [];
    }
    return doc.toJS(Object.assign({ reviver: _reviver }, options));
  }
  function stringify(value, replacer, options) {
    let _replacer = null;
    if (typeof replacer === "function" || Array.isArray(replacer)) {
      _replacer = replacer;
    } else if (options === undefined && replacer) {
      options = replacer;
    }
    if (typeof options === "string")
      options = options.length;
    if (typeof options === "number") {
      const indent = Math.round(options);
      options = indent < 1 ? undefined : indent > 8 ? { indent: 8 } : { indent };
    }
    if (value === undefined) {
      const { keepUndefined } = options ?? replacer ?? {};
      if (!keepUndefined)
        return;
    }
    if (identity.isDocument(value) && !_replacer)
      return value.toString(options);
    return new Document.Document(value, _replacer, options).toString(options);
  }
  exports.parse = parse;
  exports.parseAllDocuments = parseAllDocuments;
  exports.parseDocument = parseDocument;
  exports.stringify = stringify;
});

// src/cli.ts
import { resolve as resolve4 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// src/manifest.ts
import { createHash } from "crypto";
function buildAuditManifest(report) {
  const manifest = {
    schemaVersion: 2,
    version: report.version,
    mode: report.mode,
    files: [...report.files].sort(),
    findings: sortCanonical(report.findings),
    fixesApplied: sortCanonical(report.fixesApplied),
    filesStaged: [...report.filesStaged].sort(),
    governance: sortCanonical(report.governance),
    evidence: sortCanonical(report.evidence.map(toAuditEvidenceRecord)),
    impact: sortCanonical(report.impact),
    tools: sortCanonical(report.tools)
  };
  return {
    manifest,
    hash: createHash("sha256").update(stableJson(manifest)).digest("hex")
  };
}
function toAuditEvidenceRecord(record) {
  return {
    id: record.id,
    provider: record.provider,
    status: record.status,
    files: [...record.files].sort(),
    zones: [...record.zones].sort(),
    source: record.source,
    reason: record.reason
  };
}
function sortCanonical(values) {
  return [...values].sort((left, right) => stableJson(left).localeCompare(stableJson(right)));
}
function stableJson(value) {
  return JSON.stringify(canonicalize(value));
}
function canonicalize(value) {
  if (Array.isArray(value))
    return value.map((item) => canonicalize(item));
  if (value === null || typeof value !== "object")
    return value;
  return Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined).sort(([left], [right]) => left.localeCompare(right)).map(([key, entryValue]) => [key, canonicalize(entryValue)]));
}

// src/audit.ts
function withAuditManifest(report) {
  const { manifest, hash } = buildAuditManifest(report);
  return {
    ...report,
    manifest,
    manifestHash: hash
  };
}
function toAuditJson(report) {
  return JSON.stringify(withAuditManifest(report), null, 2);
}
function toSarif(report) {
  const { hash, manifest } = buildAuditManifest(report);
  const rules = new Map(report.findings.map((finding) => [finding.code, finding]));
  const governanceByFile = new Map(report.governance.map((record) => [record.file, record]));
  const sarif = {
    version: "2.1.0",
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: "gate-pre-git",
            version: report.version,
            informationUri: "https://github.com/local/gate-pre-git",
            rules: [...rules.values()].map((finding) => ({
              id: finding.code,
              name: finding.code,
              shortDescription: {
                text: finding.source
              },
              defaultConfiguration: {
                level: sarifLevel(finding.severity)
              }
            }))
          }
        },
        properties: {
          gatePreGitManifestHash: hash,
          gatePreGitGovernance: manifest.governance,
          gatePreGitEvidence: manifest.evidence,
          gatePreGitImpact: manifest.impact
        },
        results: report.findings.map((finding) => ({
          ruleId: finding.code,
          level: sarifLevel(finding.severity),
          message: {
            text: finding.message
          },
          locations: finding.file === undefined ? [] : [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: finding.file
                }
              }
            }
          ],
          properties: finding.file === undefined || governanceByFile.get(finding.file) === undefined ? undefined : {
            gatePreGitGovernance: governanceByFile.get(finding.file)
          }
        }))
      }
    ]
  };
  return JSON.stringify(sarif, null, 2);
}
function sarifLevel(severity) {
  if (severity === "error")
    return "error";
  if (severity === "warning")
    return "warning";
  return "note";
}

// src/doctor.ts
import { execFileSync as execFileSync5 } from "child_process";
import { existsSync as existsSync11, mkdirSync as mkdirSync3, readFileSync as readFileSync9, rmSync as rmSync2, writeFileSync as writeFileSync5 } from "fs";
import { tmpdir as tmpdir2 } from "os";
import { isAbsolute as isAbsolute3, join as join8 } from "path";

// src/gate.ts
import { resolve as resolve3 } from "path";

// src/adapter-runner.ts
import { spawnSync } from "child_process";
import { existsSync } from "fs";

// src/adapters.ts
var TOOL_ADAPTERS = [
  {
    name: "biome",
    command: "biome",
    capabilities: ["check", "fix"],
    fileExtensions: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".mts", ".cts", ".json", ".jsonc", ".css"],
    risk: {
      check: "low",
      fix: "medium"
    },
    args: {
      check: ["check"],
      fix: ["check", "--write"]
    }
  },
  {
    name: "ruff",
    command: "ruff",
    capabilities: ["check", "fix"],
    fileExtensions: [".py", ".pyi"],
    risk: {
      check: "low",
      fix: "medium"
    },
    args: {
      check: ["check"],
      fix: ["check", "--fix"]
    }
  },
  {
    name: "gitleaks",
    command: "gitleaks",
    capabilities: ["check"],
    fileExtensions: [],
    matchesAllFiles: true,
    risk: {
      check: "high"
    },
    args: {
      check: ["dir", ".", "--redact", "--no-banner", "--exit-code", "1"]
    }
  },
  {
    name: "actionlint",
    command: "actionlint",
    capabilities: ["check"],
    fileExtensions: [".yml", ".yaml"],
    pathIncludes: [".github/workflows/"],
    risk: {
      check: "low"
    },
    args: {
      check: []
    }
  },
  {
    name: "shellcheck",
    command: "shellcheck",
    capabilities: ["check"],
    fileExtensions: [".sh", ".bash", ".zsh", ".ksh"],
    risk: {
      check: "low"
    },
    args: {
      check: []
    }
  },
  {
    name: "markdownlint",
    command: "markdownlint-cli2",
    capabilities: ["check", "fix"],
    fileExtensions: [".md", ".markdown", ".mdown"],
    risk: {
      check: "low",
      fix: "medium"
    },
    args: {
      check: [],
      fix: ["--fix"]
    }
  }
];
var ADAPTERS_BY_NAME = new Map(TOOL_ADAPTERS.map((adapter) => [adapter.name, adapter]));
function getAdapter(name) {
  const adapter = ADAPTERS_BY_NAME.get(name);
  if (adapter === undefined) {
    throw new Error(`Unknown adapter: ${name}`);
  }
  return adapter;
}
function selectAdaptersForFiles(files, capability = "check") {
  return TOOL_ADAPTERS.filter((adapter) => adapter.capabilities.includes(capability) && files.some((file) => adapterMatchesFile(adapter, file)));
}
function adapterMatchesFile(adapter, file) {
  const normalized = normalizePath(file);
  if (normalized.startsWith(".gate-pre-git/") && adapter.name !== "gitleaks")
    return false;
  if (adapter.matchesAllFiles === true)
    return true;
  if (adapter.pathIncludes !== undefined && !adapter.pathIncludes.some((part) => normalized.includes(part))) {
    return false;
  }
  return adapter.fileExtensions.some((extension) => normalized.endsWith(extension));
}
function buildAdapterCommand(adapterName, capability, files, root = ".") {
  const adapter = getAdapter(adapterName);
  if (!adapter.capabilities.includes(capability)) {
    throw new Error(`${adapter.name} does not support ${capability}`);
  }
  const baseArgs = adapter.args[capability];
  if (baseArgs === undefined) {
    throw new Error(`${adapter.name} does not define ${capability} args`);
  }
  const command = normalizePath(`${root}/.gate-pre-git/cache/bin/${adapter.command}`);
  const args = [...baseArgs, ...commandFiles(adapter, files)];
  return {
    adapter: adapter.name,
    capability,
    command,
    args,
    shell: formatShellCommand(command, args),
    risk: adapter.risk[capability] ?? "medium"
  };
}
function buildAdapterCommands(files, capability = "check", root = ".") {
  return selectAdaptersForFiles(files, capability).map((adapter) => buildAdapterCommand(adapter.name, capability, files, root));
}
function commandFiles(adapter, files) {
  if (adapter.matchesAllFiles === true)
    return [];
  return files.filter((file) => adapterMatchesFile(adapter, file));
}
function normalizePath(path) {
  return path.replaceAll("\\", "/").replace(/\/{2,}/g, "/");
}
function formatShellCommand(command, args) {
  return [command, ...args].map(shellQuote).join(" ");
}
function shellQuote(value) {
  if (/^[A-Za-z0-9_./:=@%+-]+$/.test(value))
    return value;
  return `'${value.replaceAll("'", "'\\''")}'`;
}

// src/adapter-runner.ts
var DEFAULT_TIMEOUT_MS = 30000;
function runAdapterChecks(target, files, options = {}) {
  const enabledTools = options.enabledTools === undefined ? undefined : new Set(options.enabledTools);
  const commands = buildAdapterCommands(files, "check", target).filter((command) => enabledTools === undefined || enabledTools.has(command.adapter));
  return commands.map((command) => runAdapterCommand(target, command, options.timeoutMs ?? DEFAULT_TIMEOUT_MS));
}
function runAdapterCommand(target, command, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const started = Date.now();
  const details = [`status=running`, `command=${command.shell}`, `timeout_ms=${timeoutMs}`];
  if (!existsSync(command.command)) {
    return finish(started, command, "tool_missing", details, [
      `tool shim missing for ${command.adapter}: ${command.command}`
    ]);
  }
  const result = spawnSync(command.command, command.args, {
    cwd: target,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: timeoutMs
  });
  const output = trimOutput(`${result.stdout ?? ""}${result.stderr ?? ""}`.trim());
  if (result.error !== undefined) {
    const nodeError = result.error;
    if (nodeError.code === "ETIMEDOUT") {
      return finish(started, command, "timeout", [...details, detailOutput(output)], [`adapter timed out: ${command.adapter}`]);
    }
    if (nodeError.code === "ENOENT") {
      return finish(started, command, "tool_missing", details, [
        `tool executable missing for ${command.adapter}: ${command.command}`
      ]);
    }
    return finish(started, command, "execution_failed", [...details, detailOutput(output)], [`adapter execution failed: ${command.adapter}: ${nodeError.message}`]);
  }
  if (result.status === 0) {
    return finish(started, command, "passed", [...details, detailOutput(output)], []);
  }
  if (result.status === 127) {
    return finish(started, command, "tool_missing", [...details, detailOutput(output)], [`adapter tool missing: ${command.adapter}: ${output || "exit 127"}`]);
  }
  return finish(started, command, "policy_failed", [...details, detailOutput(output)], [`adapter policy failed: ${command.adapter}: ${output || `exit ${result.status ?? "unknown"}`}`]);
}
function finish(started, command, status, details, failures) {
  return {
    name: `adapter:${command.adapter}`,
    status: failures.length === 0 ? "passed" : "failed",
    failures,
    warnings: [],
    details: [`status=${status}`, ...details.filter((detail) => detail !== "status=running" && detail !== "output=")],
    durationMs: Date.now() - started
  };
}
function detailOutput(output) {
  return output.length === 0 ? "output=" : `output=${output}`;
}
function trimOutput(output) {
  return output.length > 800 ? `${output.slice(0, 800)}...` : output;
}

// src/checks.ts
import { execSync } from "child_process";
import { basename, extname } from "path";

// node_modules/yaml/dist/index.js
var composer = require_composer();
var Document = require_Document();
var Schema = require_Schema();
var errors = require_errors();
var Alias = require_Alias();
var identity = require_identity();
var Pair = require_Pair();
var Scalar = require_Scalar();
var YAMLMap = require_YAMLMap();
var YAMLSeq = require_YAMLSeq();
var cst = require_cst();
var lexer = require_lexer();
var lineCounter = require_line_counter();
var parser = require_parser();
var publicApi = require_public_api();
var visit = require_visit();
var $Composer = composer.Composer;
var $Document = Document.Document;
var $Schema = Schema.Schema;
var $YAMLError = errors.YAMLError;
var $YAMLParseError = errors.YAMLParseError;
var $YAMLWarning = errors.YAMLWarning;
var $Alias = Alias.Alias;
var $isAlias = identity.isAlias;
var $isCollection = identity.isCollection;
var $isDocument = identity.isDocument;
var $isMap = identity.isMap;
var $isNode = identity.isNode;
var $isPair = identity.isPair;
var $isScalar = identity.isScalar;
var $isSeq = identity.isSeq;
var $Pair = Pair.Pair;
var $Scalar = Scalar.Scalar;
var $YAMLMap = YAMLMap.YAMLMap;
var $YAMLSeq = YAMLSeq.YAMLSeq;
var $Lexer = lexer.Lexer;
var $LineCounter = lineCounter.LineCounter;
var $Parser = parser.Parser;
var $parse = publicApi.parse;
var $parseAllDocuments = publicApi.parseAllDocuments;
var $parseDocument = publicApi.parseDocument;
var $stringify = publicApi.stringify;
var $visit = visit.visit;
var $visitAsync = visit.visitAsync;

// src/git.ts
import { execFileSync } from "child_process";
import { existsSync as existsSync2, readdirSync, statSync } from "fs";
import { join, relative } from "path";
function isGitRepository(cwd) {
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    return true;
  } catch {
    return false;
  }
}
function changedFiles(cwd) {
  const lines = gitLines(cwd, ["status", "--porcelain=v1", "--untracked-files=all"]);
  return normalizeGitStatusFiles(lines);
}
function stagedFiles(cwd) {
  return gitLines(cwd, ["diff", "--cached", "--name-only", "--diff-filter=ACMR"]);
}
function unstagedFiles(cwd) {
  return gitLines(cwd, ["diff", "--name-only", "--diff-filter=ACMR"]);
}
function unmergedFiles(cwd) {
  return gitLines(cwd, ["diff", "--name-only", "--diff-filter=U"]);
}
function trackedFiles(cwd) {
  return gitLines(cwd, ["ls-files"]);
}
function walkFiles(root, ignoredDirs) {
  const out = [];
  const ignored = new Set(ignoredDirs);
  function walk(abs) {
    for (const entry of readdirSync(abs)) {
      if (ignored.has(entry))
        continue;
      const path = join(abs, entry);
      const stat = statSync(path);
      if (stat.isDirectory())
        walk(path);
      else
        out.push(relative(root, path));
    }
  }
  if (existsSync2(root))
    walk(root);
  return out.sort();
}
function gitDiffCheck(cwd, cached) {
  const args = cached ? ["diff", "--cached", "--check"] : ["diff", "--check"];
  try {
    const output = execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { ok: true, output: output.trim() };
  } catch (error) {
    const candidate = error;
    return {
      ok: false,
      output: `${candidate.stdout ?? ""}${candidate.stderr ?? ""}`.trim()
    };
  }
}
function readIndexFile(cwd, file) {
  try {
    return execFileSync("git", ["show", `:${file}`], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
  } catch {
    return;
  }
}
function stageFiles(cwd, files) {
  if (files.length === 0)
    return;
  execFileSync("git", ["add", "--", ...files], { cwd, stdio: "ignore" });
}
function gitStatusSets(cwd) {
  const staged = new Set(stagedFiles(cwd));
  const unstaged = new Set(unstagedFiles(cwd));
  const deleted = new Set(gitLines(cwd, ["diff", "--name-only", "--diff-filter=D"]));
  const unmerged = new Set(unmergedFiles(cwd));
  return { staged, unstaged, deleted, unmerged };
}
function gitLines(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split(`
`).map((line) => line.trimEnd()).filter(Boolean);
}
function normalizeGitStatusFiles(lines) {
  const files = new Set;
  for (const entry of lines) {
    const status = entry.slice(0, 2);
    if (status === " D" || status === "D " || status === "DD")
      continue;
    const rawPath = entry.slice(3);
    const renameTarget = rawPath.split(" -> ").at(-1);
    if (renameTarget !== undefined && renameTarget.length > 0)
      files.add(renameTarget);
  }
  return [...files].sort();
}

// src/checks.ts
function timedCheck(name, body) {
  const started = Date.now();
  const result = body();
  return {
    name,
    durationMs: Date.now() - started,
    ...result
  };
}
function checkStagedSafety(_target, files, config) {
  return timedCheck("staged_safety", () => {
    const failures = [];
    const secretPatterns = config.secretPathPatterns.map((pattern) => new RegExp(pattern, "i"));
    for (const file of files) {
      if (config.blockedBasenames.includes(basename(file.path))) {
        failures.push(`blocked local file cannot be committed: ${file.path}`);
      }
      if (secretPatterns.some((pattern) => pattern.test(file.path))) {
        failures.push(`possible secret path cannot be committed: ${file.path}`);
      }
    }
    return result(failures, [], [`files=${files.length}`]);
  });
}
function checkTextHygiene(_target, files, config) {
  return timedCheck("text_hygiene", () => {
    const failures = [];
    const warnings = [];
    for (const file of files.filter((candidate) => isTextFile(candidate.path, config))) {
      const text = file.content;
      if (text === undefined)
        continue;
      if (text.includes("\x00"))
        failures.push(`NUL byte found in text file: ${file.path}`);
      if (/^<<<<<<< .+/m.test(text) || /^>>>>>>> .+/m.test(text)) {
        failures.push(`merge conflict marker found in ${file.path}`);
      }
      for (const marker of config.blockedMarkers) {
        if (hasActiveMarker(text, marker))
          failures.push(`blocked marker ${marker} found in ${file.path}`);
      }
      if (text.length > 1e6)
        warnings.push(`large text file should be reviewed deliberately: ${file.path}`);
    }
    return result(failures, warnings, [`text_files=${files.filter((file) => isTextFile(file.path, config)).length}`]);
  });
}
function checkJsonSyntax(_target, files) {
  return timedCheck("json_syntax", () => {
    const failures = [];
    const jsonFiles = files.filter((file) => file.path.toLowerCase().endsWith(".json"));
    for (const file of jsonFiles) {
      if (file.content === undefined)
        continue;
      try {
        JSON.parse(file.content);
      } catch (error) {
        failures.push(`${file.path}: ${error.message}`);
      }
    }
    return result(failures, [], [`json_files=${jsonFiles.length}`]);
  });
}
function checkYamlSyntax(_target, files) {
  return timedCheck("yaml_syntax", () => {
    const failures = [];
    const yamlFiles = files.filter((file) => /\.(ya?ml)$/i.test(file.path));
    for (const file of yamlFiles) {
      if (file.content === undefined)
        continue;
      const doc = $parseDocument(file.content, { prettyErrors: false });
      for (const error of doc.errors)
        failures.push(`${file.path}: ${error.message}`);
    }
    return result(failures, [], [`yaml_files=${yamlFiles.length}`]);
  });
}
function checkMarkdownStructure(_target, files, config) {
  return timedCheck("markdown_structure", () => {
    const failures = [];
    const markdownFiles = files.filter((file) => file.path.toLowerCase().endsWith(".md"));
    for (const file of markdownFiles) {
      const text = file.content;
      if (text === undefined)
        continue;
      if (config.markdown.requireH1 && !/^#\s+\S/m.test(text)) {
        failures.push(`markdown missing H1: ${file.path}`);
      }
      const tooDeep = text.match(new RegExp(`^#{${config.markdown.maxHeadingDepth + 1},}\\s+\\S`, "m"));
      if (tooDeep)
        failures.push(`markdown heading exceeds max depth ${config.markdown.maxHeadingDepth}: ${file.path}`);
      if (hasUnbalancedFences(text))
        failures.push(`markdown code fence appears unbalanced: ${file.path}`);
    }
    return result(failures, [], [`markdown_files=${markdownFiles.length}`]);
  });
}
function checkGitDiffWhitespace(target, mode) {
  return timedCheck("git_diff_whitespace", () => {
    if (!isGitRepository(target)) {
      return { status: "skipped", failures: [], warnings: [], details: ["not_git_repository"] };
    }
    const checks = mode === "staged" ? [["cached", gitDiffCheck(target, true)]] : [
      ["worktree", gitDiffCheck(target, false)],
      ["cached", gitDiffCheck(target, true)]
    ];
    const failures = checks.filter(([, check]) => !check.ok).map(([name, check]) => `${name}: ${check.output || "git diff --check failed"}`);
    return result(failures, [], checks.map(([name, check]) => `${name}=${check.ok ? "passed" : "failed"}`));
  });
}
function checkConfiguredCommands(target, mode, config) {
  return config.commandChecks.filter((command) => command.modes === undefined || command.modes.includes(mode)).map((command) => timedCheck(`command:${command.name}`, () => {
    try {
      const output = execSync(command.run, {
        cwd: target,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"]
      }).trim();
      return result([], [], output ? [trimOutput2(output)] : []);
    } catch (error) {
      const candidate = error;
      const output = `${candidate.stdout ?? ""}${candidate.stderr ?? ""}`.trim();
      return result([`${command.run}: ${trimOutput2(output) || "command failed"}`], [], []);
    }
  }));
}
function isTextFile(file, config) {
  return config.textExtensions.includes(extname(file).toLowerCase());
}
function result(failures, warnings, details) {
  return {
    status: failures.length > 0 ? "failed" : "passed",
    failures,
    warnings,
    details
  };
}
function hasUnbalancedFences(text) {
  const fences = text.match(/^```/gm);
  return fences !== null && fences.length % 2 !== 0;
}
function hasActiveMarker(text, marker) {
  return text.split(`
`).some((line) => line === marker || line.startsWith(`${marker} `));
}
function trimOutput2(output) {
  return output.length > 800 ? `${output.slice(0, 800)}...` : output;
}

// src/config.ts
import { existsSync as existsSync3, readFileSync } from "fs";
import { isAbsolute, join as join2 } from "path";
var DEFAULT_CONFIG = {
  textExtensions: [
    ".md",
    ".txt",
    ".json",
    ".jsonc",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".ts",
    ".tsx",
    ".vue",
    ".yml",
    ".yaml",
    ".css",
    ".html",
    ".py",
    ".pyi",
    ".go",
    ".rs",
    ".toml",
    ".mod",
    ".sum"
  ],
  blockedBasenames: [".DS_Store"],
  blockedMarkers: ["[STAGE_BLOCK:OPEN]"],
  secretPathPatterns: [
    "\\.env($|\\.)",
    "\\.(pem|key|p12|pfx)$",
    "(^|/)id_rsa$",
    "(^|/)id_ed25519$",
    "(^|/)secrets?\\."
  ],
  ignoreDirs: [".git", "node_modules", "dist", "build", ".next", ".nuxt", ".output", "coverage", ".cache"],
  markdown: {
    requireH1: false,
    maxHeadingDepth: 6
  },
  policy: {
    strict: true,
    autoStageFixes: true
  },
  profiles: ["auto"],
  tools: [],
  hooks: {
    preCommit: true,
    prePush: true
  },
  githubAudit: {
    enabled: true,
    workflowPath: ".github/workflows/gate-pre-git-audit.yml"
  },
  commandChecks: []
};
function loadConfig(target, configPath) {
  const resolved = configPath === undefined ? defaultConfigPath(target) : isAbsolute(configPath) ? configPath : join2(target, configPath);
  if (!existsSync3(resolved))
    return DEFAULT_CONFIG;
  const userConfig = JSON.parse(readFileSync(resolved, "utf8"));
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    markdown: {
      ...DEFAULT_CONFIG.markdown,
      ...userConfig.markdown
    },
    policy: {
      ...DEFAULT_CONFIG.policy,
      ...userConfig.policy
    },
    hooks: {
      ...DEFAULT_CONFIG.hooks,
      ...userConfig.hooks
    },
    githubAudit: {
      ...DEFAULT_CONFIG.githubAudit,
      ...userConfig.githubAudit
    },
    textExtensions: userConfig.textExtensions ?? DEFAULT_CONFIG.textExtensions,
    blockedBasenames: userConfig.blockedBasenames ?? DEFAULT_CONFIG.blockedBasenames,
    blockedMarkers: userConfig.blockedMarkers ?? DEFAULT_CONFIG.blockedMarkers,
    secretPathPatterns: userConfig.secretPathPatterns ?? DEFAULT_CONFIG.secretPathPatterns,
    ignoreDirs: userConfig.ignoreDirs ?? DEFAULT_CONFIG.ignoreDirs,
    profiles: userConfig.profiles ?? DEFAULT_CONFIG.profiles,
    tools: userConfig.tools ?? DEFAULT_CONFIG.tools,
    commandChecks: userConfig.commandChecks ?? DEFAULT_CONFIG.commandChecks
  };
}
function defaultConfigPath(target) {
  const vendored = join2(target, ".gate-pre-git", "config.json");
  if (existsSync3(vendored))
    return vendored;
  return join2(target, "gate-pre-git.config.json");
}

// src/evidence.ts
var BUILTIN_EVIDENCE = new Set([
  "staged_safety",
  "text_hygiene",
  "json_syntax",
  "yaml_syntax",
  "markdown_structure",
  "git_diff_whitespace",
  "governance"
]);
function collectEvidenceRecords(checks, governance, files, mode) {
  const records = modeEvidenceIds(mode).map((id) => ({
    provider: "mode",
    id,
    status: "satisfied",
    files: [...files].sort(),
    zones: zonesForEvidence(id, governance),
    source: `mode:${mode}`
  }));
  for (const check of checks) {
    const status = evidenceStatus(check);
    if (check.name.startsWith("adapter:")) {
      const adapter = check.name.slice("adapter:".length);
      records.push(evidenceRecord(adapter, "adapter", status, files, governance, check));
      records.push(evidenceRecord(check.name, "adapter", status, files, governance, check));
      continue;
    }
    if (check.name.startsWith("command:")) {
      const command = check.name.slice("command:".length);
      records.push(evidenceRecord(command, "command", status, files, governance, check));
      records.push(evidenceRecord(check.name, "command", status, files, governance, check));
      continue;
    }
    if (BUILTIN_EVIDENCE.has(check.name)) {
      records.push(evidenceRecord(check.name, check.name === "governance" ? "governance" : "builtin", status, files, governance, check));
    }
  }
  return sortEvidence(dedupeEvidence(records));
}
function modeEvidenceIds(mode) {
  if (mode === "check")
    return ["gate"];
  if (mode === "push")
    return ["gate", "push"];
  return [mode];
}
function checkEvidencePolicy(governance, evidence) {
  const satisfied = new Set(evidence.filter((record) => record.status === "satisfied").map((record) => record.id));
  const failures = [];
  const details = [];
  for (const record of governance) {
    if (record.status === "excepted") {
      details.push(`waived=${record.file}`);
      continue;
    }
    for (const required of record.requiredEvidence) {
      if (!satisfied.has(required)) {
        failures.push(`missing required evidence: ${record.file} requires ${required} zone=${record.zone ?? "unowned"}`);
      }
    }
  }
  return {
    name: "evidence_policy",
    status: failures.length === 0 ? "passed" : "failed",
    failures,
    warnings: [],
    details: [`records=${evidence.length}`, ...details],
    durationMs: 0
  };
}
function evidenceRecord(id, provider, status, files, governance, check) {
  return {
    id,
    provider,
    status,
    files: [...files].sort(),
    zones: zonesForEvidence(id, governance),
    source: check.name,
    durationMs: check.durationMs,
    reason: status === "satisfied" ? undefined : [...check.failures, ...check.warnings].join(`
`) || undefined
  };
}
function evidenceStatus(check) {
  if (check.status === "passed")
    return "satisfied";
  if (check.status === "skipped")
    return "skipped";
  return "failed";
}
function zonesForEvidence(id, governance) {
  return [
    ...new Set(governance.filter((record) => record.zone !== null && record.requiredEvidence.includes(id)).map((record) => record.zone))
  ].sort();
}
function dedupeEvidence(records) {
  const deduped = new Map;
  for (const record of records) {
    deduped.set(`${record.provider}:${record.id}:${record.source}`, record);
  }
  return [...deduped.values()];
}
function sortEvidence(records) {
  return records.sort((left, right) => `${left.provider}:${left.id}:${left.source}`.localeCompare(`${right.provider}:${right.id}:${right.source}`));
}

// src/fixes.ts
import { execFileSync as execFileSync3 } from "child_process";
import { createHash as createHash2 } from "crypto";
import { existsSync as existsSync5, readFileSync as readFileSync3, unlinkSync, writeFileSync } from "fs";
import { resolve as resolve2 } from "path";

// src/snapshot.ts
import { existsSync as existsSync4, readFileSync as readFileSync2 } from "fs";
import { resolve } from "path";

// src/push.ts
import { execFileSync as execFileSync2 } from "child_process";
var DEFAULT_PUSH_BASE = "origin/main";
function resolvePushRange(cwd, options = {}) {
  const base = options.base ?? DEFAULT_PUSH_BASE;
  const head = options.head ?? "HEAD";
  if (!hasRevision(cwd, head)) {
    return {
      base,
      mergeBase: null,
      files: changedWorktreeFiles(cwd),
      warnings: [`${head} is not available; using worktree changes`]
    };
  }
  if (!hasRevision(cwd, base)) {
    return {
      base,
      mergeBase: null,
      files: filesWithoutBase(cwd),
      warnings: [`${base} is not available; using HEAD tree and worktree changes`]
    };
  }
  const mergeBase = firstGitLine(cwd, ["merge-base", head, base]);
  if (mergeBase === undefined) {
    return {
      base,
      mergeBase: null,
      files: filesWithoutBase(cwd),
      warnings: [`no merge-base found for ${head} and ${base}; using HEAD tree and worktree changes`]
    };
  }
  return {
    base,
    mergeBase,
    files: gitLines2(cwd, ["diff", "--name-only", "--diff-filter=ACMR", mergeBase, head, "--"]),
    warnings: []
  };
}
function filesWithoutBase(cwd) {
  return uniqueSorted([...gitLines2(cwd, ["ls-tree", "-r", "--name-only", "HEAD"]), ...changedWorktreeFiles(cwd)]);
}
function hasRevision(cwd, revision) {
  return git(cwd, ["rev-parse", "--verify", "--quiet", revision]).ok;
}
function changedWorktreeFiles(cwd) {
  return normalizeGitStatusFiles2(gitLines2(cwd, ["status", "--porcelain=v1", "--untracked-files=all"]));
}
function firstGitLine(cwd, args) {
  return gitLines2(cwd, args)[0];
}
function gitLines2(cwd, args) {
  const result2 = git(cwd, args);
  if (!result2.ok)
    return [];
  return result2.stdout.split(`
`).map((line) => line.trimEnd()).filter(Boolean);
}
function git(cwd, args) {
  try {
    return {
      ok: true,
      stdout: execFileSync2("git", args, {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"]
      })
    };
  } catch (error) {
    const candidate = error;
    return { ok: false, stdout: String(candidate.stdout ?? "") };
  }
}
function normalizeGitStatusFiles2(lines) {
  const files = new Set;
  for (const entry of lines) {
    const status = entry.slice(0, 2);
    if (status === " D" || status === "D " || status === "DD")
      continue;
    const rawPath = entry.slice(3);
    const renameTarget = rawPath.split(" -> ").at(-1);
    if (renameTarget !== undefined && renameTarget.length > 0)
      files.add(renameTarget);
  }
  return uniqueSorted([...files]);
}
function uniqueSorted(files) {
  return [...new Set(files)].sort();
}

// src/snapshot.ts
function collectGateFiles(target, mode, all, ignoredDirs, base) {
  const git2 = isGitRepository(target);
  const status = git2 ? gitStatusSets(target) : {
    staged: new Set,
    unstaged: new Set,
    deleted: new Set,
    unmerged: new Set
  };
  const source = mode === "staged" ? "index" : "worktree";
  const paths = collectPaths(target, mode, all, ignoredDirs, base);
  return paths.map((path) => {
    const staged = status.staged.has(path);
    const unstaged = status.unstaged.has(path);
    const deleted = status.deleted.has(path);
    const exists = existsSync4(resolve(target, path));
    const content = source === "index" ? readIndexFile(target, path) : readWorktreeFile(target, path);
    return {
      path,
      exists: source === "index" ? content !== undefined : exists,
      source,
      content,
      staged,
      unstaged,
      partial: staged && unstaged,
      deleted
    };
  }).filter((file) => file.exists || file.deleted).sort((left, right) => left.path.localeCompare(right.path));
}
function collectPaths(target, mode, all, ignoredDirs, base) {
  const git2 = isGitRepository(target);
  const files = git2 ? all ? [...trackedFiles(target), ...changedFiles(target)] : mode === "staged" ? stagedFiles(target) : mode === "push" || mode === "audit" ? resolvePushRange(target, { base }).files : changedFiles(target) : walkFiles(target, ignoredDirs);
  return [...new Set(files)].sort();
}
function readWorktreeFile(target, file) {
  const path = resolve(target, file);
  if (!existsSync4(path))
    return;
  try {
    return readFileSync2(path, "utf8");
  } catch {
    return;
  }
}

// src/fixes.ts
function runTransactionalFixes(target, files, config) {
  const findings = [];
  const shouldStage = config.policy.autoStageFixes && isGitRepository(target);
  const mode = inferMode(files);
  const planned = [];
  for (const file of files) {
    if (!file.exists || file.deleted || file.content === undefined || !isTextFile2(file.path, config))
      continue;
    const fixed = fixContent(file.path, file.content);
    if (fixed.text === file.content)
      continue;
    if (file.partial) {
      findings.push({
        severity: "error",
        code: "partial_staging_fix_blocked",
        message: `fix would change partially staged file: ${file.path}`,
        file: file.path,
        source: "fixer"
      });
      continue;
    }
    const path = resolve2(target, file.path);
    if (!existsSync5(path))
      continue;
    const worktreeText = readFileSync3(path, "utf8");
    if (file.source === "index" && worktreeText !== file.content) {
      findings.push({
        severity: "error",
        code: "unstaged_drift_fix_blocked",
        message: `working tree differs from staged snapshot; refusing to auto-stage fix for ${file.path}`,
        file: file.path,
        source: "fixer"
      });
      continue;
    }
    planned.push({
      file,
      path,
      text: fixed.text,
      tool: fixed.tool,
      action: fixed.action,
      originalHash: contentHash(file.content),
      fixedHash: contentHash(fixed.text)
    });
  }
  if (findings.some((finding) => finding.severity === "error")) {
    return { fixesApplied: [], filesStaged: [], findings };
  }
  if (planned.length === 0)
    return { fixesApplied: [], filesStaged: [], findings };
  const snapshots = planned.map((fix) => snapshotFile(target, fix.path, fix.file.path));
  const staged = shouldStage ? planned.map((fix) => fix.file.path).sort() : [];
  try {
    for (const fix of planned)
      writeFileSync(fix.path, fix.text, "utf8");
    if (staged.length > 0)
      stageFiles(target, staged);
    const validationFailures = validatePostFix(target, mode, config);
    if (validationFailures.length > 0) {
      rollbackFiles(target, snapshots, shouldStage);
      return {
        fixesApplied: [],
        filesStaged: [],
        findings: [
          {
            severity: "error",
            code: "post_fix_validation_failed",
            message: `rolled back fixes because post-fix validation failed: ${validationFailures.join("; ")}`,
            source: "fixer"
          }
        ]
      };
    }
  } catch (error) {
    rollbackFiles(target, snapshots, shouldStage);
    return {
      fixesApplied: [],
      filesStaged: [],
      findings: [
        {
          severity: "error",
          code: "fix_transaction_failed",
          message: `rolled back fixes after transaction failure: ${error.message}`,
          source: "fixer"
        }
      ]
    };
  }
  const fixesApplied = planned.map((fix) => ({
    tool: fix.tool,
    file: fix.file.path,
    action: traceAction(fix.action, fix.originalHash, fix.fixedHash),
    staged: shouldStage
  }));
  return {
    fixesApplied,
    filesStaged: staged,
    findings
  };
}
function snapshotFile(target, path, relativePath) {
  return {
    path: relativePath,
    worktreeExists: existsSync5(path),
    worktreeText: existsSync5(path) ? readFileSync3(path, "utf8") : undefined,
    indexContent: isGitRepository(target) ? readIndexFile(target, relativePath) : undefined
  };
}
function rollbackFiles(target, snapshots, restoreIndex) {
  for (const snapshot of snapshots) {
    const path = resolve2(target, snapshot.path);
    if (snapshot.worktreeExists && snapshot.worktreeText !== undefined)
      writeFileSync(path, snapshot.worktreeText, "utf8");
    else if (existsSync5(path))
      unlinkSync(path);
    if (restoreIndex)
      restoreIndexContent(target, snapshot);
  }
}
function restoreIndexContent(target, snapshot) {
  if (snapshot.indexContent === undefined) {
    execFileSync3("git", ["rm", "--cached", "--ignore-unmatch", "--", snapshot.path], { cwd: target, stdio: "ignore" });
    return;
  }
  const blob = execFileSync3("git", ["hash-object", "-w", "--stdin"], {
    cwd: target,
    input: snapshot.indexContent,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "ignore"]
  }).trim();
  execFileSync3("git", ["update-index", "--add", "--cacheinfo", "100644", blob, snapshot.path], {
    cwd: target,
    stdio: "ignore"
  });
}
function validatePostFix(target, mode, config) {
  const files = collectGateFiles(target, mode, false, config.ignoreDirs);
  const checks = [
    checkStagedSafety(target, files, config),
    checkTextHygiene(target, files, config),
    checkJsonSyntax(target, files),
    checkYamlSyntax(target, files),
    checkMarkdownStructure(target, files, config),
    checkGitDiffWhitespace(target, mode)
  ];
  return checks.filter((check) => check.status === "failed").flatMap((check) => check.failures.map((failure) => `${check.name}: ${failure}`));
}
function inferMode(files) {
  return files.some((file) => file.source === "index") ? "staged" : "fix";
}
function traceAction(action, originalHash, fixedHash) {
  return `${action} [trace original=${originalHash} fixed=${fixedHash}]`;
}
function contentHash(text) {
  return createHash2("sha256").update(text).digest("hex").slice(0, 12);
}
function fixContent(path, text) {
  const normalized = normalizeText(text);
  if (path.toLowerCase().endsWith(".json")) {
    try {
      const formatted = `${formatJson(JSON.parse(normalized))}
`;
      return {
        text: formatted,
        tool: "builtin:json-format",
        action: "format JSON and normalize text"
      };
    } catch {
      return {
        text: normalized,
        tool: "builtin:text-normalize",
        action: "normalize text"
      };
    }
  }
  return {
    text: normalized,
    tool: "builtin:text-normalize",
    action: "normalize text"
  };
}
function formatJson(value, depth = 0) {
  if (value === null || typeof value !== "object")
    return JSON.stringify(value);
  if (Array.isArray(value)) {
    if (value.length === 0)
      return "[]";
    if (value.every(isJsonPrimitive) && !value.some(isRegexLikeString)) {
      const inline = `[${value.map((entry) => formatJson(entry, depth)).join(", ")}]`;
      if (inline.length <= 100)
        return inline;
    }
    const indent2 = "  ".repeat(depth);
    const childIndent2 = "  ".repeat(depth + 1);
    return `[
${value.map((entry) => `${childIndent2}${formatJson(entry, depth + 1)}`).join(`,
`)}
${indent2}]`;
  }
  const entries = Object.entries(value);
  if (entries.length === 0)
    return "{}";
  const indent = "  ".repeat(depth);
  const childIndent = "  ".repeat(depth + 1);
  return `{
${entries.map(([key, entry]) => `${childIndent}${JSON.stringify(key)}: ${formatJson(entry, depth + 1)}`).join(`,
`)}
${indent}}`;
}
function isJsonPrimitive(value) {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}
function isRegexLikeString(value) {
  return typeof value === "string" && value.includes("\\");
}
function normalizeText(text) {
  const withoutTrailingWhitespace = text.replace(/[ \t]+$/gm, "");
  if (withoutTrailingWhitespace.length === 0 || withoutTrailingWhitespace.endsWith(`
`)) {
    return withoutTrailingWhitespace;
  }
  return `${withoutTrailingWhitespace}
`;
}
function isTextFile2(file, config) {
  return config.textExtensions.some((extension) => file.toLowerCase().endsWith(extension));
}

// src/governance.ts
import { existsSync as existsSync6, readFileSync as readFileSync4 } from "fs";
import { join as join3 } from "path";
function evaluateGovernance(target, files, currentDate = new Date) {
  const started = Date.now();
  const mapPath = join3(target, ".gate-pre-git", "governance.json");
  if (!existsSync6(mapPath)) {
    return {
      check: finish2(started, {
        status: "skipped",
        failures: [],
        warnings: [],
        details: ["missing_map=.gate-pre-git/governance.json"]
      }),
      records: []
    };
  }
  const parsed = loadGovernanceMap(mapPath);
  if (!parsed.ok) {
    return {
      check: finish2(started, {
        status: "failed",
        failures: [`invalid governance map: ${parsed.error}`],
        warnings: [],
        details: [mapPath]
      }),
      records: []
    };
  }
  const map = parsed.map;
  const paths = files.map((file) => normalizePath2(typeof file === "string" ? file : file.path));
  const zones = map.zones ?? [];
  const sensitivePaths = map.sensitivePaths ?? [];
  const generatedPaths = map.generatedPaths ?? [];
  const exceptions = map.exceptions ?? [];
  const failures = [];
  const details = [`files=${paths.length}`];
  const records = [];
  for (const file of paths) {
    const matchingExceptions = exceptions.filter((exception) => patternsForException(exception).some((pattern) => matchesPath(pattern, file)));
    const expiredExceptions = matchingExceptions.filter((exception) => isExpired(exception.expiresOn, currentDate));
    const activeException = matchingExceptions.find((exception) => !isExpired(exception.expiresOn, currentDate));
    for (const exception of expiredExceptions) {
      failures.push(`expired governance exception for ${file}: expiresOn=${exception.expiresOn}`);
    }
    if (activeException !== undefined) {
      details.push(`exception=${file} expiresOn=${activeException.expiresOn}`);
      records.push({
        file,
        zone: null,
        owners: [],
        risk: null,
        requiredEvidence: [],
        status: "excepted",
        exception: exceptionEvidence(activeException, true, false)
      });
      continue;
    }
    const sensitivePattern = sensitivePaths.find((pattern) => matchesPath(pattern, file));
    const fileFailures = [];
    if (sensitivePattern !== undefined) {
      const failure = `sensitive path requires active governance exception: ${file} pattern=${sensitivePattern}`;
      failures.push(failure);
      fileFailures.push(failure);
    }
    const generatedPattern = generatedPaths.find((pattern) => matchesPath(pattern, file));
    if (generatedPattern !== undefined) {
      const failure = `generated path requires active governance exception: ${file} pattern=${generatedPattern}`;
      failures.push(failure);
      fileFailures.push(failure);
    }
    const zone = selectGovernanceZone(zones, file);
    if (zone === undefined) {
      const failure = `unowned governance zone for ${file}`;
      failures.push(failure);
      fileFailures.push(failure);
      records.push(compactRecord({
        file,
        zone: null,
        owners: [],
        risk: null,
        requiredEvidence: [],
        status: "failed",
        exception: expiredExceptions[0] === undefined ? null : exceptionEvidence(expiredExceptions[0], false, true),
        sensitivePattern,
        generatedPattern,
        failureReasons: fileFailures
      }));
      continue;
    }
    details.push(`zone=${zone.name} file=${file} owners=${zone.owners.join(",")} risk=${zone.risk} evidence=${zone.requiredEvidence.join(",")}`);
    records.push(compactRecord({
      file,
      zone: zone.name,
      owners: zone.owners,
      risk: zone.risk,
      requiredEvidence: zone.requiredEvidence,
      status: fileFailures.length === 0 && expiredExceptions.length === 0 ? "passed" : "failed",
      exception: expiredExceptions[0] === undefined ? null : exceptionEvidence(expiredExceptions[0], false, true),
      sensitivePattern,
      generatedPattern,
      failureReasons: [
        ...fileFailures,
        ...expiredExceptions.map((exception) => `expired exception: ${exception.expiresOn}`)
      ]
    }));
  }
  return {
    check: finish2(started, {
      status: failures.length > 0 ? "failed" : "passed",
      failures,
      warnings: [],
      details
    }),
    records: records.sort((left, right) => left.file.localeCompare(right.file))
  };
}
function loadGovernanceMap(mapPath) {
  try {
    return { ok: true, map: JSON.parse(readFileSync4(mapPath, "utf8")) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
function finish2(started, result2) {
  return {
    name: "governance",
    durationMs: Date.now() - started,
    ...result2
  };
}
function patternsForException(exception) {
  return [...exception.paths ?? [], ...exception.path === undefined ? [] : [exception.path]];
}
function exceptionEvidence(exception, active, expired) {
  return {
    active,
    expired,
    expiresOn: exception.expiresOn,
    reason: exception.reason,
    paths: patternsForException(exception)
  };
}
function compactRecord(record) {
  return Object.fromEntries(Object.entries(record).filter(([key, value]) => {
    if (value === undefined)
      return false;
    if (key === "failureReasons" && Array.isArray(value) && value.length === 0)
      return false;
    return true;
  }));
}
function isExpired(expiresOn, currentDate) {
  const expiresAt = Date.parse(`${expiresOn}T23:59:59.999Z`);
  return Number.isNaN(expiresAt) || expiresAt < currentDate.getTime();
}
function selectGovernanceZone(zones, path) {
  let selected;
  for (const zone of zones) {
    const score = bestZoneScore(zone, path);
    if (score === null)
      continue;
    if (selected === undefined || score > selected.score) {
      selected = { zone, score };
    }
  }
  return selected?.zone;
}
function bestZoneScore(zone, path) {
  let best = null;
  for (const pattern of zone.paths) {
    if (!matchesPath(pattern, path))
      continue;
    const score = patternSpecificity(pattern);
    if (best === null || score > best)
      best = score;
  }
  return best;
}
function patternSpecificity(pattern) {
  const normalizedPattern = normalizePath2(pattern);
  const segments = normalizedPattern.split("/").filter(Boolean);
  const leadingLiteralSegments = segments.findIndex((segment) => segment.includes("*"));
  const literalPrefixSegments = leadingLiteralSegments === -1 ? segments.length : leadingLiteralSegments;
  const wildcardCount = normalizedPattern.split("").filter((char) => char === "*").length;
  const literalLength = normalizedPattern.replace(/\*/g, "").length;
  const exactBonus = wildcardCount === 0 ? 1e5 : 0;
  return exactBonus + literalPrefixSegments * 1000 + literalLength * 10 - wildcardCount;
}
function matchesPath(pattern, path) {
  const normalizedPattern = normalizePath2(pattern);
  const normalizedPath = normalizePath2(path);
  if (!normalizedPattern.includes("*"))
    return normalizedPattern === normalizedPath;
  return globToRegExp(normalizedPattern).test(normalizedPath);
}
function normalizePath2(path) {
  return path.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\/+/, "");
}
function globToRegExp(pattern) {
  let source = "^";
  for (let index = 0;index < pattern.length; index += 1) {
    const char = pattern[index];
    const next = pattern[index + 1];
    const afterNext = pattern[index + 2];
    if (char === "*" && next === "*" && afterNext === "/") {
      source += "(?:.*/)?";
      index += 2;
      continue;
    }
    if (char === "*" && next === "*") {
      source += ".*";
      index += 1;
      continue;
    }
    if (char === "*") {
      source += "[^/]*";
      continue;
    }
    source += escapeRegExp(char);
  }
  return new RegExp(`${source}$`);
}
function escapeRegExp(value) {
  return value.replace(/[\\^$+?.()|[\]{}]/g, "\\$&");
}

// src/impact.ts
var BUILTIN_PROVIDERS = new Map([
  ["staged_safety", "builtin"],
  ["text_hygiene", "builtin"],
  ["json_syntax", "builtin"],
  ["yaml_syntax", "builtin"],
  ["markdown_structure", "builtin"],
  ["git_diff_whitespace", "builtin"],
  ["governance", "governance"]
]);
function buildImpactPlan(target, files, governance, config, mode) {
  const planned = plannedEvidence(target, files, config, mode);
  const required = requiredEvidence(governance);
  const records = [];
  for (const [evidence, governed] of required) {
    const plan = planned.get(evidence);
    records.push({
      evidence,
      action: plan === undefined ? "skip" : "run",
      reason: plan === undefined ? "no_provider_for_required_evidence" : "required_by_governance",
      files: governed.files,
      zones: governed.zones,
      provider: plan?.provider ?? "unknown"
    });
  }
  const requiredIds = new Set(required.keys());
  for (const tool of config.tools) {
    if (!requiredIds.has(tool) && !planned.has(tool)) {
      records.push({
        evidence: tool,
        action: "skip",
        reason: "no_matching_governed_files",
        files: [],
        zones: [],
        provider: "adapter"
      });
    }
  }
  return records.sort((left, right) => `${left.action}:${left.evidence}:${left.reason}`.localeCompare(`${right.action}:${right.evidence}:${right.reason}`));
}
function checkImpactPlan(impact) {
  return {
    name: "impact_plan",
    status: "passed",
    failures: [],
    warnings: [],
    details: impact.map((record) => `${record.action} evidence=${record.evidence} provider=${record.provider} zones=${record.zones.join(",") || "none"} files=${record.files.length} reason=${record.reason}`),
    durationMs: 0
  };
}
function plannedEvidence(target, files, config, mode) {
  const planned = new Map;
  for (const evidence of modeEvidenceIds2(mode))
    planned.set(evidence, { provider: "mode" });
  for (const [id, provider] of BUILTIN_PROVIDERS)
    planned.set(id, { provider });
  const enabled = new Set(config.tools);
  for (const command of buildAdapterCommands(files, "check", target).filter((candidate) => enabled.has(candidate.adapter))) {
    planned.set(command.adapter, { provider: "adapter" });
    planned.set(`adapter:${command.adapter}`, { provider: "adapter" });
  }
  for (const command of commandEvidence(config.commandChecks, mode)) {
    planned.set(command.name, { provider: "command" });
    planned.set(`command:${command.name}`, { provider: "command" });
  }
  return planned;
}
function modeEvidenceIds2(mode) {
  if (mode === "check")
    return ["gate"];
  if (mode === "push")
    return ["gate", "push"];
  return [mode];
}
function commandEvidence(commands, mode) {
  return commands.filter((command) => command.modes === undefined || command.modes.includes(mode));
}
function requiredEvidence(governance) {
  const required = new Map;
  for (const record of governance) {
    if (record.status !== "passed")
      continue;
    for (const evidence of record.requiredEvidence) {
      const entry = required.get(evidence) ?? { files: new Set, zones: new Set };
      entry.files.add(record.file);
      if (record.zone !== null)
        entry.zones.add(record.zone);
      required.set(evidence, entry);
    }
  }
  return new Map([...required.entries()].map(([evidence, entry]) => [
    evidence,
    {
      files: [...entry.files].sort(),
      zones: [...entry.zones].sort()
    }
  ]));
}

// src/tools.ts
import { chmodSync, existsSync as existsSync7, mkdirSync, readFileSync as readFileSync5, writeFileSync as writeFileSync2 } from "fs";
import { dirname, join as join4 } from "path";

// src/types.ts
var GATE_PRE_GIT_VERSION = "gate-pre-git@0.1.0";

// src/tools.ts
var DEFAULT_TOOLS = {
  biome: {
    kind: "npm",
    package: "@biomejs/biome",
    version: "2.4.15",
    command: "biome"
  },
  markdownlint: {
    kind: "npm",
    package: "markdownlint-cli2",
    version: "0.22.1",
    command: "markdownlint-cli2"
  },
  actionlint: {
    kind: "npm",
    package: "github-actionlint",
    version: "1.7.12",
    command: "actionlint"
  },
  shellcheck: {
    kind: "npm",
    package: "shellcheck",
    version: "4.1.0",
    command: "shellcheck"
  },
  gitleaks: {
    kind: "npm",
    package: "@0xts/gitleaks-cli",
    version: "0.1.3",
    command: "gitleaks"
  },
  ruff: {
    kind: "python",
    package: "ruff",
    version: "0.15.12",
    command: "ruff"
  }
};
function defaultLock() {
  return {
    version: 1,
    generatedBy: GATE_PRE_GIT_VERSION,
    tools: DEFAULT_TOOLS
  };
}
function lockPath(target) {
  return join4(target, ".gate-pre-git", "lock.json");
}
function readLock(target) {
  const path = lockPath(target);
  if (!existsSync7(path))
    return null;
  return JSON.parse(readFileSync5(path, "utf8"));
}
function writeDefaultLock(target) {
  const lock = defaultLock();
  const path = lockPath(target);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync2(path, `${JSON.stringify(lock, null, 2)}
`, "utf8");
  writeToolShims(target, lock);
  return lock;
}
function writeToolShims(target, lock) {
  const binDir = join4(target, ".gate-pre-git", "cache", "bin");
  mkdirSync(binDir, { recursive: true });
  writeFileSync2(join4(target, ".gate-pre-git", "cache", ".gitignore"), `*
!.gitignore
`, "utf8");
  for (const [name, tool] of Object.entries(lock.tools)) {
    const path = join4(binDir, tool.command);
    const text = shimText(name, tool);
    writeFileSync2(path, text, "utf8");
    chmodSync(path, 493);
  }
}
function inspectTools(target) {
  const lock = readLock(target);
  if (lock === null) {
    return [
      {
        name: "gate-lock",
        version: "missing",
        status: "missing",
        detail: ".gate-pre-git/lock.json not found"
      }
    ];
  }
  return Object.entries(lock.tools).map(([name, tool]) => {
    const path = join4(target, ".gate-pre-git", "cache", "bin", tool.command);
    return {
      name,
      version: tool.version,
      command: tool.command,
      path,
      status: existsSync7(path) ? "installed" : "locked",
      detail: (tool.kind === "npm" || tool.kind === "python") && tool.package !== undefined ? `${tool.package}@${tool.version}` : tool.kind
    };
  });
}
function shimText(name, tool) {
  if (tool.kind === "npm") {
    const spec = `${tool.package ?? name}@${tool.version}`;
    return `#!/usr/bin/env sh
set -eu
exec bunx --silent --bun "${spec}" "$@"
`;
  }
  if (tool.kind === "system") {
    return `#!/usr/bin/env sh
set -eu
if ! command -v "${tool.command}" >/dev/null 2>&1; then
  echo "gate-pre-git tool '${tool.command}' is required but was not found on PATH" >&2
  exit 127
fi
exec "${tool.command}" "$@"
`;
  }
  if (tool.kind === "python") {
    const spec = `${tool.package ?? name}==${tool.version}`;
    return `#!/usr/bin/env sh
set -eu
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cache_dir="$repo_root/.gate-pre-git/cache/python/${name}-${tool.version}"
site_dir="$cache_dir/site"
if [ ! -d "$site_dir" ]; then
  mkdir -p "$site_dir"
  python3 -m pip install --disable-pip-version-check --quiet --target "$site_dir" "${spec}"
fi
PYTHONPATH="$site_dir\${PYTHONPATH:+:$PYTHONPATH}" exec python3 -m "${tool.command}" "$@"
`;
  }
  return `#!/usr/bin/env sh
set -eu
echo "gate-pre-git builtin tool '${name}' is managed inside the CLI" >&2
exit 0
`;
}

// src/gate.ts
function runGate(options) {
  const started = Date.now();
  const target = resolve3(options.target);
  const config = loadConfig(target, options.configPath);
  let fileSnapshots = collectGateFiles(target, options.mode, options.all, config.ignoreDirs, options.base);
  let files = fileSnapshots.map((file) => file.path);
  const advice = computeAdvice(files);
  const tools = inspectTools(target);
  let fixesApplied = [];
  let filesStaged = [];
  let precheckFindings = [];
  if ((options.mode === "push" || options.mode === "audit") && !options.all) {
    const pushRange = resolvePushRange(target, { base: options.base });
    precheckFindings = pushRange.warnings.map((warning) => ({
      severity: "info",
      code: "push_range",
      message: warning,
      source: "push_range"
    }));
  }
  if (options.mode === "advice") {
    return {
      ok: true,
      version: GATE_PRE_GIT_VERSION,
      mode: options.mode,
      target,
      files,
      findings: [],
      fixesApplied: [],
      filesStaged: [],
      governance: [],
      evidence: [],
      impact: [],
      tools,
      checks: [],
      advice,
      durationMs: Date.now() - started
    };
  }
  if (options.mode === "staged" || options.mode === "fix") {
    const result2 = runTransactionalFixes(target, fileSnapshots, config);
    fixesApplied = result2.fixesApplied;
    filesStaged = result2.filesStaged;
    precheckFindings = result2.findings;
    fileSnapshots = collectGateFiles(target, options.mode, options.all, config.ignoreDirs, options.base);
    files = fileSnapshots.map((file) => file.path);
  }
  const governance = evaluateGovernance(target, fileSnapshots);
  const impact = buildImpactPlan(target, files, governance.records, config, options.mode);
  const baseChecks = [
    checkStagedSafety(target, fileSnapshots, config),
    checkTextHygiene(target, fileSnapshots, config),
    checkJsonSyntax(target, fileSnapshots),
    checkYamlSyntax(target, fileSnapshots),
    checkMarkdownStructure(target, fileSnapshots, config),
    governance.check,
    checkImpactPlan(impact),
    checkAdapterPlan(target, files, config.tools),
    ...options.runCommands ? runAdapterChecks(target, files, { enabledTools: config.tools }) : [],
    checkGitDiffWhitespace(target, options.mode),
    ...options.runCommands ? checkConfiguredCommands(target, options.mode, config) : []
  ];
  const evidence = collectEvidenceRecords(baseChecks, governance.records, files, options.mode);
  const checks = [
    ...baseChecks,
    ...options.runCommands && shouldEnforceEvidence(options.mode) ? [checkEvidencePolicy(governance.records, evidence)] : []
  ];
  const findings = [...precheckFindings, ...findingsFromChecks(checks)];
  return {
    ok: findings.every((finding) => finding.severity !== "error") && checks.every((check) => check.status !== "failed"),
    version: GATE_PRE_GIT_VERSION,
    mode: options.mode,
    target,
    files,
    findings,
    fixesApplied,
    filesStaged,
    governance: governance.records,
    evidence,
    impact,
    tools,
    checks,
    advice,
    durationMs: Date.now() - started
  };
}
function shouldEnforceEvidence(mode) {
  return mode === "check" || mode === "push";
}
function checkAdapterPlan(target, files, enabledTools) {
  const started = Date.now();
  const enabled = new Set(enabledTools);
  const commands = buildAdapterCommands(files, "check", target).filter((command) => enabled.has(command.adapter));
  return {
    name: "adapter_plan",
    status: "passed",
    failures: [],
    warnings: [],
    details: commands.map((command) => `${command.adapter}:${command.risk}:${command.shell}`),
    durationMs: Date.now() - started
  };
}
function computeAdvice(files) {
  const signals = new Set;
  if (files.length === 0)
    signals.add("no_changed_files");
  if (files.length > 0 && files.every((file) => file.endsWith(".md") || file.startsWith("docs/"))) {
    signals.add("doc_only_change_detected");
  }
  if (files.some((file) => file.startsWith("src/")) && !files.some((file) => file.startsWith("tests/"))) {
    signals.add("source_without_test_change");
  }
  if (files.some((file) => file.startsWith("server/api/") || file.startsWith("app/") || file.includes("secret") || file.includes(".env"))) {
    signals.add("surface_sensitive_change_detected");
  }
  if (files.some((file) => file === "package.json" || file === "tsconfig.json" || file.startsWith("tools/") || file.startsWith(".github/workflows/") || file.includes("gate-pre-git"))) {
    signals.add("tooling_or_gate_changed");
  }
  return [...signals].sort();
}
function findingsFromChecks(checks) {
  return checks.flatMap((check) => [
    ...check.failures.map((message) => ({
      severity: "error",
      code: check.name,
      message,
      file: fileFromMessage(message),
      source: check.name
    })),
    ...check.warnings.map((message) => ({
      severity: "warning",
      code: check.name,
      message,
      file: fileFromMessage(message),
      source: check.name
    }))
  ]);
}
function fileFromMessage(message) {
  const evidenceMatch = message.match(/^missing required evidence: ([^ ]+) requires /);
  if (evidenceMatch?.[1] !== undefined)
    return evidenceMatch[1];
  const [prefix] = message.split(":");
  if (prefix !== undefined && /\.[a-z0-9]+$/i.test(prefix) && !prefix.includes(" "))
    return prefix;
  return;
}

// src/installer.ts
import { execFileSync as execFileSync4 } from "child_process";
import { chmodSync as chmodSync2, existsSync as existsSync9, mkdirSync as mkdirSync2, mkdtempSync, readFileSync as readFileSync7, rmSync, writeFileSync as writeFileSync3 } from "fs";
import { tmpdir } from "os";
import { dirname as dirname2, isAbsolute as isAbsolute2, join as join6 } from "path";
import { fileURLToPath } from "url";

// src/profiles.ts
import { existsSync as existsSync8, readdirSync as readdirSync2, readFileSync as readFileSync6 } from "fs";
import { extname as extname2, join as join5 } from "path";
function profileConfig(profile, target) {
  const resolvedProfiles = profile === "auto" ? detectProfiles(target) : [profile];
  const packageJson = target === undefined ? null : readPackageJson(target);
  const nodeCommands = nodeCommandChecks(packageJson, target);
  const commands = {
    auto: [],
    strict: [],
    docs: [],
    node: nodeCommands,
    nuxt: [
      ...nodeCommands,
      ...hasPackageScript(packageJson, "build") ? [
        {
          name: "build",
          run: "bun run build",
          modes: ["push"]
        }
      ] : []
    ],
    python: [
      {
        name: "ruff",
        run: ".gate-pre-git/cache/bin/ruff check .",
        modes: ["check", "push"]
      }
    ],
    go: [
      {
        name: "go-test",
        run: "go test ./...",
        modes: ["check", "push"]
      }
    ],
    rust: [
      {
        name: "cargo-check",
        run: "cargo check",
        modes: ["check", "push"]
      }
    ],
    security: []
  };
  return {
    ...DEFAULT_CONFIG,
    markdown: {
      requireH1: resolvedProfiles.length === 1 && resolvedProfiles.includes("docs"),
      maxHeadingDepth: 4
    },
    profiles: resolvedProfiles,
    tools: toolsForProfiles(resolvedProfiles, target),
    commandChecks: uniqueCommands(resolvedProfiles.flatMap((resolvedProfile) => commands[resolvedProfile]))
  };
}
function isGateProfile(value) {
  return value === "auto" || value === "strict" || value === "node" || value === "nuxt" || value === "docs" || value === "python" || value === "go" || value === "rust" || value === "security";
}
function detectProfiles(target) {
  if (target === undefined)
    return ["auto"];
  const files = listFiles(target, 4);
  const packageJson = readPackageJson(target);
  const packageDeps = {
    ...packageJson?.dependencies ?? {},
    ...packageJson?.devDependencies ?? {}
  };
  const profiles = new Set;
  const hasNuxt = files.some((file) => /^nuxt\.config\.(ts|js|mjs|mts)$/.test(file)) || Object.hasOwn(packageDeps, "nuxt");
  const hasPackage = packageJson !== null;
  const hasJs = files.some((file) => [".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".vue"].includes(extname2(file)));
  const hasPython = files.some((file) => [".py", ".pyi"].includes(extname2(file))) || files.some((file) => ["pyproject.toml", "requirements.txt", "setup.py"].includes(file));
  const hasGo = files.some((file) => extname2(file) === ".go" || file === "go.mod");
  const hasRust = files.some((file) => extname2(file) === ".rs" || file === "Cargo.toml");
  const hasDocs = files.some((file) => file === "README.md" || file.startsWith("docs/") || extname2(file) === ".md");
  if (hasNuxt)
    profiles.add("nuxt");
  else if (hasPackage || hasJs)
    profiles.add("node");
  if (hasPython)
    profiles.add("python");
  if (hasGo)
    profiles.add("go");
  if (hasRust)
    profiles.add("rust");
  if (hasDocs)
    profiles.add("docs");
  profiles.add("security");
  return profiles.size === 1 ? ["strict", "security"] : [...profiles];
}
function toolsForProfiles(profiles, target) {
  const all = ["biome", "markdownlint", "actionlint", "shellcheck", "gitleaks", "ruff"];
  const tools = {
    auto: all,
    strict: [],
    docs: ["markdownlint"],
    node: ["biome"],
    nuxt: ["biome"],
    python: ["ruff"],
    go: [],
    rust: [],
    security: ["gitleaks"]
  };
  const selected = new Set(["actionlint", "gitleaks", ...profiles.flatMap((profile) => tools[profile])]);
  const files = target === undefined ? [] : listFiles(target, 4);
  if (files.some((file) => file.startsWith(".github/workflows/") && [".yml", ".yaml"].includes(extname2(file)))) {
    selected.add("actionlint");
  }
  if (files.some((file) => [".sh", ".bash", ".zsh", ".ksh"].includes(extname2(file))))
    selected.add("shellcheck");
  return [...selected].sort((left, right) => all.indexOf(left) - all.indexOf(right));
}
function uniqueCommands(commands) {
  const byName = new Map;
  for (const command of commands)
    byName.set(command.name, command);
  return [...byName.values()];
}
function nodeCommandChecks(packageJson, target) {
  const checks = [];
  if (hasPackageScript(packageJson, "typecheck")) {
    checks.push({
      name: "typecheck",
      run: "bun run typecheck",
      modes: ["check", "push"]
    });
  }
  const testCommand = nodeTestCommand(packageJson, target);
  if (testCommand !== null) {
    checks.push({
      name: "test",
      run: testCommand,
      modes: ["check", "push"]
    });
  }
  return checks;
}
function nodeTestCommand(packageJson, target) {
  const scripts = packageJson?.scripts;
  if (isRecord(scripts) && typeof scripts.test === "string")
    return "bun run test";
  if (target !== undefined && hasBunTestFiles(target))
    return "bun test";
  return null;
}
function hasPackageScript(packageJson, name) {
  const scripts = packageJson?.scripts;
  return isRecord(scripts) && typeof scripts[name] === "string";
}
function hasBunTestFiles(target) {
  return listFiles(target, 4).some((file) => /(^|\/).*(\.test|\.spec|_test_|_spec_)\.[cm]?[jt]sx?$/.test(file));
}
function readPackageJson(target) {
  const path = join5(target, "package.json");
  if (!existsSync8(path))
    return null;
  try {
    return JSON.parse(readFileSync6(path, "utf8"));
  } catch {
    return null;
  }
}
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function listFiles(target, maxDepth) {
  const files = [];
  walk(target, "", maxDepth, files);
  return files;
}
function walk(target, relative2, depth, files) {
  if (depth < 0)
    return;
  const dir = relative2 === "" ? target : join5(target, relative2);
  if (!existsSync8(dir))
    return;
  for (const entry of readdirSync2(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", "dist", "build", ".next", ".nuxt", ".output", "coverage", "fixtures"].includes(entry.name)) {
      continue;
    }
    const path = relative2 === "" ? entry.name : `${relative2}/${entry.name}`;
    if (entry.isDirectory()) {
      walk(target, path, depth - 1, files);
    } else {
      files.push(path);
    }
  }
}

// src/installer.ts
var cachedRuntimeBundle = null;
function hookText(command = "gate-pre-git", hook = "pre-commit") {
  const gateCommand = hook === "pre-push" ? "push" : "staged";
  return `#!/usr/bin/env sh
set -eu

# managed by gate-pre-git
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
${command} ${gateCommand} --target "$repo_root"
`;
}
function installHook(target, yes, command, kind = "native", force = false, hook = "pre-commit") {
  const hookPath = hookPathFor(target, kind, hook);
  const text = hookText(command, hook);
  if (!yes)
    return { installed: false, path: hookPath, text };
  mkdirSync2(dirname2(hookPath), { recursive: true });
  if (existsSync9(hookPath) && !force) {
    throw new Error(`refusing to overwrite existing hook: ${hookPath}`);
  }
  writeFileSync3(hookPath, text, "utf8");
  chmodSync2(hookPath, 493);
  return { installed: true, path: hookPath, text };
}
function initProject(options) {
  const configPath = join6(options.target, ".gate-pre-git", "config.json");
  const governancePath = join6(options.target, ".gate-pre-git", "governance.json");
  const binPath = join6(options.target, ".gate-pre-git", "bin", "gate-pre-git");
  const runtimePath = join6(options.target, ".gate-pre-git", "runtime", "cli.js");
  const workflowPath = join6(options.target, ".github", "workflows", "gate-pre-git-audit.yml");
  const config = profileConfig(options.profile, options.target);
  const biomeConfigPath = join6(options.target, "biome.json");
  let wroteConfig = false;
  let wroteGovernance = false;
  if (options.yes) {
    mkdirSync2(dirname2(configPath), { recursive: true });
    mkdirSync2(dirname2(binPath), { recursive: true });
    mkdirSync2(dirname2(runtimePath), { recursive: true });
    mkdirSync2(dirname2(workflowPath), { recursive: true });
  }
  if (!existsSync9(configPath) || options.force) {
    if (options.yes) {
      writeFileSync3(configPath, `${JSON.stringify(config, null, 2)}
`, "utf8");
      wroteConfig = true;
    }
  }
  if (!existsSync9(governancePath) || options.force) {
    if (options.yes) {
      writeFileSync3(governancePath, governanceMapText(), "utf8");
      wroteGovernance = true;
    }
  }
  if (options.yes) {
    writeLauncher(binPath, options.command);
    writeRuntimeBundle(runtimePath);
    if (config.tools.includes("biome") && (!existsSync9(biomeConfigPath) || options.force)) {
      writeFileSync3(biomeConfigPath, biomeConfigText(), "utf8");
    }
    const lock = writeDefaultLock(options.target);
    writeToolShims(options.target, lock);
    writeWorkflow(workflowPath);
  }
  const hookCommand = `.gate-pre-git/bin/gate-pre-git`;
  const preCommitHook = installHook(options.target, options.yes, hookCommand, options.hook, options.force, "pre-commit");
  const prePushHook = installHook(options.target, options.yes, hookCommand, options.hook, options.force, "pre-push");
  const patchedPackage = patchPackageScripts(options.target, options.yes, options.force);
  return {
    wroteConfig,
    wroteGovernance,
    preCommitHookPath: preCommitHook.path,
    prePushHookPath: prePushHook.path,
    hookPath: preCommitHook.path,
    installedHook: preCommitHook.installed,
    installedPrePushHook: prePushHook.installed,
    patchedPackage,
    configPath,
    governancePath,
    lockPath: lockPath(options.target),
    binPath,
    runtimePath,
    workflowPath
  };
}
function governanceMapText() {
  return `${JSON.stringify(defaultGovernanceMap(), null, 2)}
`;
}
function biomeConfigText() {
  return `${JSON.stringify({
    $schema: "https://biomejs.dev/schemas/2.4.15/schema.json",
    formatter: {
      enabled: true,
      indentStyle: "space",
      indentWidth: 2,
      lineWidth: 120
    },
    javascript: {
      formatter: {
        quoteStyle: "double",
        semicolons: "always",
        trailingCommas: "none"
      }
    },
    json: {
      formatter: {
        trailingCommas: "none"
      }
    }
  }, null, 2)}
`;
}
function defaultGovernanceMap() {
  return {
    version: 1,
    generatedBy: GATE_PRE_GIT_VERSION,
    zones: [
      {
        name: "source_js",
        description: "JavaScript, TypeScript, Vue, and frontend/server source files.",
        owners: ["platform"],
        risk: "high",
        paths: [
          "src/**/*.js",
          "src/**/*.jsx",
          "src/**/*.mjs",
          "src/**/*.cjs",
          "src/**/*.ts",
          "src/**/*.tsx",
          "src/**/*.vue",
          "app/**/*.js",
          "app/**/*.jsx",
          "app/**/*.ts",
          "app/**/*.tsx",
          "app/**/*.vue",
          "lib/**/*.js",
          "lib/**/*.ts",
          "server/**/*.js",
          "server/**/*.ts"
        ],
        requiredEvidence: ["biome", "gitleaks", "typecheck", "test", "gate"]
      },
      {
        name: "source_python",
        description: "Python application, package, and script source files.",
        owners: ["platform"],
        risk: "high",
        paths: ["**/*.py", "**/*.pyi"],
        requiredEvidence: ["ruff", "gitleaks", "gate"]
      },
      {
        name: "source_go",
        description: "Go application, package, and command source files.",
        owners: ["platform"],
        risk: "high",
        paths: ["**/*.go"],
        requiredEvidence: ["go-test", "gitleaks", "gate"]
      },
      {
        name: "source_rust",
        description: "Rust crate and workspace source files.",
        owners: ["platform"],
        risk: "high",
        paths: ["**/*.rs"],
        requiredEvidence: ["cargo-check", "gitleaks", "gate"]
      },
      {
        name: "tests_js",
        description: "JavaScript and TypeScript automated tests.",
        owners: ["quality"],
        risk: "medium",
        paths: [
          "tests/**/*.test.ts",
          "tests/**/*.spec.ts",
          "tests/**/*.ts",
          "test/**/*.test.ts",
          "test/**/*.spec.ts",
          "test/**/*.ts",
          "spec/**/*.ts",
          "__tests__/**/*.ts",
          "tests/**/*.test.js",
          "tests/**/*.spec.js",
          "tests/**/*.js",
          "test/**/*.test.js",
          "test/**/*.spec.js",
          "test/**/*.js",
          "spec/**/*.js",
          "__tests__/**/*.js"
        ],
        requiredEvidence: ["biome", "test"]
      },
      {
        name: "tests_python",
        description: "Python automated tests.",
        owners: ["quality"],
        risk: "medium",
        paths: ["tests/**/*.py", "test/**/*.py"],
        requiredEvidence: ["ruff"]
      },
      {
        name: "tests_go",
        description: "Go automated tests.",
        owners: ["quality"],
        risk: "medium",
        paths: ["tests/**/*.go", "test/**/*.go", "**/*_test.go"],
        requiredEvidence: ["go-test"]
      },
      {
        name: "tests_rust",
        description: "Rust automated tests.",
        owners: ["quality"],
        risk: "medium",
        paths: ["tests/**/*.rs", "benches/**/*.rs"],
        requiredEvidence: ["cargo-check"]
      },
      {
        name: "vendored_gate",
        description: "Vendored gate configuration, lockfile, launcher, and local tool shims.",
        owners: ["platform"],
        risk: "critical",
        paths: [
          ".gate-pre-git/config.json",
          ".gate-pre-git/governance.json",
          ".gate-pre-git/lock.json",
          ".gate-pre-git/bin/**",
          ".gate-pre-git/runtime/**",
          ".gate-pre-git/cache/.gitignore"
        ],
        requiredEvidence: ["text_hygiene", "gitleaks"]
      },
      {
        name: "github_workflow",
        description: "GitHub audit workflow that verifies the local gate contract remotely.",
        owners: ["platform"],
        risk: "high",
        paths: [".github/workflows/**"],
        requiredEvidence: ["yaml_syntax", "actionlint"]
      },
      {
        name: "docs",
        description: "User-facing documentation and local evidence notes.",
        owners: ["maintainers"],
        risk: "low",
        paths: ["README.md", "CHANGELOG.md", "LICENSE", "LICENSE.*", "docs/**/*.md"],
        requiredEvidence: ["markdown_structure", "markdownlint"]
      },
      {
        name: "package_tooling",
        description: "Package manifests, compiler configuration, lockfiles, and root gate examples.",
        owners: ["platform"],
        risk: "high",
        paths: [
          "package.json",
          "bun.lock",
          "tsconfig.json",
          "nuxt.config.*",
          "vite.config.*",
          "next.config.*",
          "biome.json",
          ".markdownlint-cli2.jsonc",
          "gate-pre-git.config*.json",
          "pyproject.toml",
          "requirements*.txt",
          "setup.py",
          "go.mod",
          "go.sum",
          "Cargo.toml",
          "Cargo.lock",
          ".gitignore"
        ],
        requiredEvidence: ["text_hygiene", "gate"]
      },
      {
        name: "shell_scripts",
        description: "Repository automation and release shell scripts.",
        owners: ["platform"],
        risk: "medium",
        paths: ["scripts/**/*.sh", "**/*.sh", "**/*.bash", "**/*.zsh", "**/*.ksh"],
        requiredEvidence: ["text_hygiene", "shellcheck"]
      },
      {
        name: "templates",
        description: "Files copied or referenced by installer templates.",
        owners: ["platform"],
        risk: "medium",
        paths: ["templates/**"],
        requiredEvidence: ["text_hygiene"]
      },
      {
        name: "fixture_workspaces",
        description: "Versioned replay workspaces and fixture metadata used to certify portability.",
        owners: ["quality"],
        risk: "medium",
        paths: ["fixtures/**"],
        requiredEvidence: ["text_hygiene"]
      }
    ],
    sensitivePaths: [".env", ".env.*", "**/*.pem", "**/*.key", "**/*.p12", "**/*.pfx"],
    generatedPaths: ["dist/**", "build/**", ".next/**", ".nuxt/**", ".output/**"],
    exceptions: []
  };
}
function hookPathFor(target, kind, hook) {
  if (kind === "husky")
    return join6(target, ".husky", hook);
  try {
    const path = execFileSync4("git", ["rev-parse", "--git-path", `hooks/${hook}`], {
      cwd: target,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    return isAbsolute2(path) ? path : join6(target, path);
  } catch {
    throw new Error(`native hook requires a Git repository: ${target}`);
  }
}
function writeLauncher(path, command) {
  writeFileSync3(path, `#!/usr/bin/env sh
set -eu
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

if [ -f "$repo_root/.gate-pre-git/runtime/cli.js" ]; then
  exec bun "$repo_root/.gate-pre-git/runtime/cli.js" "$@"
fi

if [ -f "$repo_root/.gate-pre-git/runtime/cli.ts" ]; then
  exec bun "$repo_root/.gate-pre-git/runtime/cli.ts" "$@"
fi

if [ -f "$repo_root/package.json" ] && [ -f "$repo_root/src/cli.ts" ] && grep -q '"name"[[:space:]]*:[[:space:]]*"gate-pre-git"' "$repo_root/package.json"; then
  exec bun "$repo_root/src/cli.ts" "$@"
fi

if command -v gate-pre-git >/dev/null 2>&1; then
  exec gate-pre-git "$@"
fi

echo "gate-pre-git launcher could not find a local runtime. Tried .gate-pre-git/runtime/cli.ts, source checkout src/cli.ts, and gate-pre-git on PATH." >&2
exit 127
`, "utf8");
  chmodSync2(path, 493);
}
function writeRuntimeBundle(path) {
  writeFileSync3(path, runtimeBundleText(), "utf8");
  chmodSync2(path, 493);
}
function runtimeBundleText() {
  if (cachedRuntimeBundle !== null)
    return cachedRuntimeBundle;
  const sourceEntry = join6(import.meta.dir, "cli.ts");
  if (!existsSync9(sourceEntry)) {
    cachedRuntimeBundle = readFileSync7(fileURLToPath(import.meta.url), "utf8");
    return cachedRuntimeBundle;
  }
  const dir = mkdtempSync(join6(tmpdir(), "gate-pre-git-runtime-"));
  const outPath = join6(dir, "cli.js");
  try {
    execFileSync4("bun", ["build", sourceEntry, "--target=bun", "--outfile", outPath], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    cachedRuntimeBundle = readFileSync7(outPath, "utf8");
    return cachedRuntimeBundle;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
function writeWorkflow(path) {
  writeFileSync3(path, `name: gate-pre-git-audit

on:
  pull_request:
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - name: Drop checkout Git credentials before audit
        run: git config --local --unset-all http.https://github.com/.extraheader || true
      - name: Install source checkout dependencies
        run: |
          if [ -f package.json ] && grep -q '"name"[[:space:]]*:[[:space:]]*"gate-pre-git"' package.json; then
            bun install --frozen-lockfile
          fi
      - name: Restore gate tool shims from lockfile
        run: .gate-pre-git/bin/gate-pre-git update-tools --target .
      - name: Gate audit JSON
        run: |
          set +e
          .gate-pre-git/bin/gate-pre-git audit --target . --all --format json > "$RUNNER_TEMP/gate-pre-git-audit.json"
          status=$?
          if [ "$status" -ne 0 ]; then
            bun -e '
            const report = JSON.parse(await Bun.file(process.env.RUNNER_TEMP + "/gate-pre-git-audit.json").text());
            const checks = report.checks?.filter((check) => check.status !== "passed") ?? [];
            console.log(JSON.stringify({ ok: report.ok, findings: report.findings, checks }, null, 2));
            '
            exit "$status"
          fi
      - name: Gate audit SARIF
        run: .gate-pre-git/bin/gate-pre-git audit --target . --all --format sarif > "$RUNNER_TEMP/gate-pre-git-audit.sarif"
      - name: Validate audit manifest
        run: |
          bun -e '
          const json = JSON.parse(await Bun.file(process.env.RUNNER_TEMP + "/gate-pre-git-audit.json").text());
          const sarif = JSON.parse(await Bun.file(process.env.RUNNER_TEMP + "/gate-pre-git-audit.sarif").text());
          if (!json.manifestHash || json.manifestHash.length !== 64) throw new Error("missing manifestHash");
          if (!Array.isArray(json.manifest.files)) throw new Error("missing manifest.files");
          if (!Array.isArray(json.manifest.tools)) throw new Error("missing manifest.tools");
          if (!Array.isArray(json.manifest.governance)) throw new Error("missing manifest.governance");
          if (!Array.isArray(json.manifest.evidence)) throw new Error("missing manifest.evidence");
          if (!Array.isArray(json.manifest.impact)) throw new Error("missing manifest.impact");
          const props = sarif.runs?.[0]?.properties ?? {};
          if (props.gatePreGitManifestHash !== json.manifestHash) throw new Error("SARIF manifest hash mismatch");
          '
      - uses: actions/upload-artifact@v4
        with:
          name: gate-pre-git-audit
          path: |
            \${{ runner.temp }}/gate-pre-git-audit.json
            \${{ runner.temp }}/gate-pre-git-audit.sarif
`, "utf8");
}
function patchPackageScripts(target, yes, force) {
  const packagePath = join6(target, "package.json");
  if (!existsSync9(packagePath) || !yes)
    return false;
  const pkg = JSON.parse(readFileSync7(packagePath, "utf8"));
  const scripts = pkg.scripts ?? {};
  const desired = {
    gate: ".gate-pre-git/bin/gate-pre-git check --all",
    "gate:audit": ".gate-pre-git/bin/gate-pre-git audit --all --format json",
    "gate:doctor": ".gate-pre-git/bin/gate-pre-git doctor",
    "gate:push": ".gate-pre-git/bin/gate-pre-git push",
    "gate:release-plan": ".gate-pre-git/bin/gate-pre-git release plan",
    "gate:staged": ".gate-pre-git/bin/gate-pre-git staged",
    "gate:version-audit": ".gate-pre-git/bin/gate-pre-git version audit"
  };
  for (const [name, command] of Object.entries(desired)) {
    if (scripts[name] !== undefined && scripts[name] !== command && !force) {
      throw new Error(`refusing to overwrite package script ${name}`);
    }
    scripts[name] = command;
  }
  pkg.scripts = sortRecord(scripts);
  writeFileSync3(packagePath, `${JSON.stringify(pkg, null, 2)}
`, "utf8");
  return true;
}
function sortRecord(input) {
  return Object.fromEntries(Object.entries(input).sort(([left], [right]) => left.localeCompare(right)));
}

// src/versioning.ts
import { existsSync as existsSync10, readdirSync as readdirSync3, readFileSync as readFileSync8, writeFileSync as writeFileSync4 } from "fs";
import { join as join7, relative as relative2 } from "path";
var GATE_GENERATED_BY_PREFIX = "gate-pre-git@";
var VERSION_RE = /^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z][0-9A-Za-z.-]*)?$/;
var TYPES_VERSION_RE = /export\s+const\s+GATE_PRE_GIT_VERSION\s*=\s*"gate-pre-git@(\d+\.\d+\.\d+(?:-[0-9A-Za-z][0-9A-Za-z.-]*)?)";/;
function planVersionChange(options) {
  const started = Date.now();
  const state = inspectVersionState(options.target);
  if (!state.ok) {
    return finish3(started, "plan", options.target, state, [], state.failures, state.warnings);
  }
  const nextVersion = computeNextVersion(state.source.version, options.bump ?? "patch");
  return finish3(started, "plan", options.target, state, [], auditFailures(state.source.version, state.targets), [], nextVersion);
}
function auditVersion(options) {
  const started = Date.now();
  const state = inspectVersionState(options.target);
  if (!state.ok) {
    return finish3(started, "audit", options.target, state, [], state.failures, state.warnings);
  }
  return finish3(started, "audit", options.target, state, [], auditFailures(state.source.version, state.targets), []);
}
function applyVersionBump(options) {
  const started = Date.now();
  const state = inspectVersionState(options.target);
  if (!state.ok) {
    return finish3(started, "bump", options.target, state, [], state.failures, state.warnings);
  }
  const preflightFailures = auditFailures(state.source.version, state.targets);
  const nextVersion = computeNextVersion(state.source.version, options.bump ?? "patch");
  if (preflightFailures.length > 0) {
    return finish3(started, "bump", options.target, state, [], preflightFailures, [], nextVersion);
  }
  const updated = [];
  const failures = [];
  for (const target of state.targets) {
    try {
      writeVersionTarget(target, nextVersion);
      updated.push(target.path);
    } catch (error) {
      failures.push(`${target.path}: ${error.message}`);
    }
  }
  const after = inspectVersionState(options.target);
  const afterFailures = after.ok ? auditFailures(nextVersion, after.targets) : after.failures;
  return finish3(started, "bump", options.target, state, updated, [...failures, ...afterFailures], [], nextVersion);
}
function inspectVersionState(target) {
  const failures = [];
  const warnings = [];
  const source = detectVersionSource(target, failures);
  if (source === null)
    return { ok: false, failures, warnings };
  const targets = discoverVersionTargets(target, source, warnings);
  if (targets.length === 0) {
    failures.push("no version targets discovered");
    return { ok: false, failures, warnings };
  }
  return { ok: true, source, targets };
}
function detectVersionSource(target, failures) {
  const versionFile = join7(target, "VERSION");
  if (existsSync10(versionFile)) {
    const version = readFileSync8(versionFile, "utf8").trim();
    if (!isSemVer(version)) {
      failures.push(`VERSION contains invalid SemVer: ${version}`);
      return null;
    }
    return { path: "VERSION", kind: "version-file", version };
  }
  const packageJson = join7(target, "package.json");
  if (!existsSync10(packageJson)) {
    failures.push("no version source found: expected VERSION or package.json");
    return null;
  }
  const parsed = readJson(packageJson);
  if (typeof parsed.version !== "string" || !isSemVer(parsed.version)) {
    failures.push(`package.json contains invalid or missing SemVer version: ${String(parsed.version)}`);
    return null;
  }
  return { path: "package.json", kind: "package-json", version: parsed.version };
}
function discoverVersionTargets(target, source, warnings) {
  const targets = new Map;
  const gateRuntimeProject = isGateRuntimeProject(target);
  const add = (path, kind) => {
    const absolutePath = join7(target, path);
    if (!existsSync10(absolutePath))
      return;
    targets.set(path, {
      path,
      absolutePath,
      kind,
      currentVersion: readVersionTarget(absolutePath, kind)
    });
  };
  if (source.kind === "version-file")
    add("VERSION", "version-file");
  add("package.json", "package-json");
  for (const workspacePackage of discoverWorkspacePackages(target, warnings)) {
    add(workspacePackage, "package-json");
  }
  if (gateRuntimeProject) {
    add(".gate-pre-git/governance.json", "gate-generated-by");
    add(".gate-pre-git/lock.json", "gate-generated-by");
    add("src/types.ts", "typescript-constant");
  }
  return [...targets.values()].sort((left, right) => targetOrder(left).localeCompare(targetOrder(right)));
}
function isGateRuntimeProject(target) {
  const packagePath = join7(target, "package.json");
  if (existsSync10(packagePath)) {
    const pkg = readJson(packagePath);
    if (pkg.name === "gate-pre-git")
      return true;
  }
  const typesPath = join7(target, "src", "types.ts");
  return existsSync10(typesPath) && TYPES_VERSION_RE.test(readFileSync8(typesPath, "utf8"));
}
function discoverWorkspacePackages(target, warnings) {
  const rootPackagePath = join7(target, "package.json");
  if (!existsSync10(rootPackagePath))
    return [];
  const rootPackage = readJson(rootPackagePath);
  const workspacePatterns = workspacePatternsFrom(rootPackage.workspaces);
  const packages = new Set;
  if (workspacePatterns.length > 0) {
    for (const pattern of workspacePatterns) {
      for (const packagePath of expandWorkspacePattern(target, pattern, warnings)) {
        if (packagePath !== "package.json")
          packages.add(packagePath);
      }
    }
    return [...packages].sort();
  }
  for (const entry of readdirSync3(target, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name === "node_modules")
      continue;
    const packagePath = join7(entry.name, "package.json");
    if (existsSync10(join7(target, packagePath)))
      packages.add(packagePath);
  }
  return [...packages].sort();
}
function workspacePatternsFrom(workspaces) {
  if (Array.isArray(workspaces))
    return workspaces.filter((entry) => typeof entry === "string");
  if (isRecord2(workspaces) && Array.isArray(workspaces.packages)) {
    return workspaces.packages.filter((entry) => typeof entry === "string");
  }
  return [];
}
function expandWorkspacePattern(target, pattern, warnings) {
  const normalized = normalizePath3(pattern);
  if (normalized.includes("..") || normalized.startsWith("/")) {
    warnings.push(`ignored unsafe workspace pattern: ${pattern}`);
    return [];
  }
  if (normalized.endsWith("/*")) {
    return packageJsonsOneLevel(target, normalized.slice(0, -2));
  }
  if (normalized.endsWith("/**")) {
    return packageJsonsRecursive(target, normalized.slice(0, -3));
  }
  if (normalized.endsWith("/package.json")) {
    return existsSync10(join7(target, normalized)) ? [normalized] : [];
  }
  if (!normalized.includes("*") && existsSync10(join7(target, normalized, "package.json"))) {
    return [normalizePath3(join7(normalized, "package.json"))];
  }
  warnings.push(`ignored unsupported workspace pattern: ${pattern}`);
  return [];
}
function packageJsonsOneLevel(target, base) {
  const absoluteBase = join7(target, base);
  if (!existsSync10(absoluteBase))
    return [];
  return readdirSync3(absoluteBase, { withFileTypes: true }).filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules").map((entry) => normalizePath3(join7(base, entry.name, "package.json"))).filter((path) => existsSync10(join7(target, path))).sort();
}
function packageJsonsRecursive(target, base) {
  const absoluteBase = join7(target, base);
  if (!existsSync10(absoluteBase))
    return [];
  const packages = [];
  walkPackages(target, absoluteBase, packages);
  return packages.sort();
}
function walkPackages(root, dir, packages) {
  for (const entry of readdirSync3(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name === "node_modules")
      continue;
    const child = join7(dir, entry.name);
    const packageJson = join7(child, "package.json");
    if (existsSync10(packageJson))
      packages.push(normalizePath3(relative2(root, packageJson)));
    walkPackages(root, child, packages);
  }
}
function readVersionTarget(path, kind) {
  if (kind === "version-file") {
    const version = readFileSync8(path, "utf8").trim();
    return isSemVer(version) ? version : null;
  }
  if (kind === "package-json") {
    const parsed = readJson(path);
    return typeof parsed.version === "string" && isSemVer(parsed.version) ? parsed.version : null;
  }
  if (kind === "gate-generated-by") {
    const parsed = readJson(path);
    if (typeof parsed.generatedBy !== "string")
      return null;
    const version = parsed.generatedBy.startsWith(GATE_GENERATED_BY_PREFIX) ? parsed.generatedBy.slice(GATE_GENERATED_BY_PREFIX.length) : null;
    return version !== null && isSemVer(version) ? version : null;
  }
  const match = readFileSync8(path, "utf8").match(TYPES_VERSION_RE);
  return match?.[1] ?? null;
}
function writeVersionTarget(target, version) {
  if (target.kind === "version-file") {
    writeFileSync4(target.absolutePath, `${version}
`, "utf8");
    return;
  }
  if (target.kind === "package-json") {
    const parsed = readJson(target.absolutePath);
    parsed.version = version;
    writeJson(target.absolutePath, parsed);
    return;
  }
  if (target.kind === "gate-generated-by") {
    const parsed = readJson(target.absolutePath);
    parsed.generatedBy = `${GATE_GENERATED_BY_PREFIX}${version}`;
    writeJson(target.absolutePath, parsed);
    return;
  }
  const text = readFileSync8(target.absolutePath, "utf8");
  if (!TYPES_VERSION_RE.test(text)) {
    throw new Error("GATE_PRE_GIT_VERSION constant not found");
  }
  writeFileSync4(target.absolutePath, text.replace(TYPES_VERSION_RE, `export const GATE_PRE_GIT_VERSION = "gate-pre-git@${version}";`), "utf8");
}
function auditFailures(expectedVersion, targets) {
  return targets.flatMap((target) => {
    if (target.currentVersion === expectedVersion)
      return [];
    return [`${target.path}: expected ${expectedVersion}, found ${target.currentVersion ?? "missing-or-invalid"}`];
  });
}
function finish3(started, action, target, state, updated, failures, warnings, nextVersion) {
  const okState = state.ok ? state : null;
  return {
    ok: failures.length === 0 && state.ok,
    mode: "version",
    action,
    target,
    source: okState?.source ?? null,
    currentVersion: okState?.source.version ?? null,
    nextVersion,
    targets: okState?.targets.map(({ absolutePath: _absolutePath, ...target2 }) => target2) ?? [],
    updated,
    failures: state.ok ? failures : [...state.failures, ...failures],
    warnings: state.ok ? warnings : [...state.warnings, ...warnings],
    durationMs: Date.now() - started
  };
}
function computeNextVersion(currentVersion, bump) {
  if (bump === "patch" || bump === "minor" || bump === "major") {
    const match = currentVersion.match(VERSION_RE);
    if (match === null)
      throw new Error(`invalid current SemVer: ${currentVersion}`);
    const major = Number(match[1]);
    const minor = Number(match[2]);
    const patch = Number(match[3]);
    if (bump === "major")
      return `${major + 1}.0.0`;
    if (bump === "minor")
      return `${major}.${minor + 1}.0`;
    return `${major}.${minor}.${patch + 1}`;
  }
  if (!isSemVer(bump))
    throw new Error(`invalid SemVer bump: ${bump}`);
  return bump;
}
function isSemVer(value) {
  return VERSION_RE.test(value);
}
function readJson(path) {
  return JSON.parse(readFileSync8(path, "utf8"));
}
function writeJson(path, value) {
  writeFileSync4(path, `${JSON.stringify(value, null, 2)}
`, "utf8");
}
function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function normalizePath3(path) {
  return path.replace(/\\/g, "/").replace(/^\.\//, "");
}
function targetOrder(target) {
  const rank = target.kind === "version-file" ? 0 : target.path === "package.json" ? 1 : target.kind === "package-json" ? 2 : target.kind === "gate-generated-by" ? 3 : 4;
  return `${rank}:${target.path}`;
}

// src/doctor.ts
function runDoctor(target, commandProbe = "gate-pre-git") {
  const started = Date.now();
  const toolReports = inspectTools(target);
  const checks = [
    structuralCheck("vendored_config", target, ".gate-pre-git/config.json"),
    governanceMapCheck(target),
    structuralCheck("tool_lock", target, ".gate-pre-git/lock.json"),
    toolLockDriftCheck(target),
    structuralCheck("vendored_launcher", target, ".gate-pre-git/bin/gate-pre-git"),
    structuralCheck("vendored_runtime", target, ".gate-pre-git/runtime/cli.js"),
    launcherPortabilityCheck(target),
    launcherExecutionCheck(target),
    githubAuditWorkflowCheck(target),
    hookCheck(target, "pre-commit"),
    hookCheck(target, "pre-push"),
    packageScriptCheck(target),
    versionSyncCheck(target),
    binaryReferenceCheck(target, commandProbe),
    toolCacheCheck(toolReports),
    smokeCheck()
  ];
  const selfCheck = runGate({
    target,
    mode: "check",
    all: true,
    json: false,
    runCommands: false
  });
  checks.push({
    name: "self_check",
    status: selfCheck.ok ? "passed" : "failed",
    failures: selfCheck.checks.flatMap((check) => check.failures.map((failure) => `${check.name}: ${failure}`)),
    warnings: [],
    details: [`files=${selfCheck.files.length}`],
    durationMs: selfCheck.durationMs
  });
  const findings = [
    ...selfCheck.findings,
    ...checks.flatMap((check) => check.failures.map((failure) => ({
      severity: "error",
      code: check.name,
      message: failure,
      source: check.name
    })))
  ];
  return {
    ok: checks.every((check) => check.status !== "failed") && selfCheck.ok,
    version: GATE_PRE_GIT_VERSION,
    mode: "doctor",
    target,
    files: selfCheck.files,
    findings,
    fixesApplied: [],
    filesStaged: [],
    governance: selfCheck.governance,
    evidence: selfCheck.evidence,
    impact: selfCheck.impact,
    tools: toolReports,
    checks,
    advice: selfCheck.advice,
    durationMs: Date.now() - started
  };
}
function versionSyncCheck(target) {
  const report = auditVersion({ target });
  return {
    name: "version_sync",
    status: report.ok ? "passed" : "failed",
    failures: report.failures,
    warnings: report.warnings,
    details: report.targets.map((target2) => `${target2.path}=${target2.currentVersion ?? "missing-or-invalid"}`),
    durationMs: report.durationMs
  };
}
function githubAuditWorkflowCheck(target) {
  const relativePath = ".github/workflows/gate-pre-git-audit.yml";
  const path = join8(target, relativePath);
  if (!existsSync11(path))
    return structuralCheck("github_audit_workflow", target, relativePath);
  const text = readFileSync9(path, "utf8");
  const required = [
    "update-tools --target .",
    "audit --target . --all --format json",
    "audit --target . --all --format sarif",
    "bun install --frozen-lockfile",
    "gate-pre-git-audit.json",
    "gate-pre-git-audit.sarif",
    "manifestHash",
    "manifest.governance",
    "manifest.evidence",
    "manifest.impact",
    "actions/upload-artifact"
  ];
  const failures = required.filter((needle) => !text.includes(needle)).map((needle) => `GitHub audit workflow missing required audit anchor: ${needle}`);
  return {
    name: "github_audit_workflow",
    status: failures.length === 0 ? "passed" : "failed",
    failures,
    warnings: [],
    details: [relativePath],
    durationMs: 0
  };
}
function launcherExecutionCheck(target) {
  const started = Date.now();
  const relativePath = ".gate-pre-git/bin/gate-pre-git";
  const path = join8(target, relativePath);
  if (!existsSync11(path))
    return structuralCheck("launcher_execution", target, relativePath);
  try {
    const output = execFileSync5(path, ["version"], {
      cwd: target,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 1e4
    }).trim();
    const failures = output === GATE_PRE_GIT_VERSION ? [] : [`vendored launcher returned unexpected version: ${output}`];
    return {
      name: "launcher_execution",
      status: failures.length === 0 ? "passed" : "failed",
      failures,
      warnings: [],
      details: [relativePath],
      durationMs: Date.now() - started
    };
  } catch (error) {
    const processError = error;
    const stderr = processError.stderr === undefined ? "" : String(processError.stderr).trim();
    const stdout = processError.stdout === undefined ? "" : String(processError.stdout).trim();
    return {
      name: "launcher_execution",
      status: "failed",
      failures: [`vendored launcher failed to execute: ${stderr || stdout || processError.message}`],
      warnings: [],
      details: [relativePath],
      durationMs: Date.now() - started
    };
  }
}
function launcherPortabilityCheck(target) {
  const relativePath = ".gate-pre-git/bin/gate-pre-git";
  const path = join8(target, relativePath);
  if (!existsSync11(path))
    return structuralCheck("launcher_portability", target, relativePath);
  const text = readFileSync9(path, "utf8");
  const failures = [
    ...text.includes("/Users/") ? ["vendored launcher contains a user-local absolute path"] : [],
    ...text.includes("repo_root=") ? [] : ["vendored launcher does not resolve the repository root"],
    ...text.includes(".gate-pre-git/runtime/cli.js") || text.includes(".gate-pre-git/runtime/cli.ts") || text.includes("src/cli.ts") ? [] : ["vendored launcher does not reference a portable local runtime candidate"]
  ];
  return {
    name: "launcher_portability",
    status: failures.length === 0 ? "passed" : "failed",
    failures,
    warnings: [],
    details: [relativePath],
    durationMs: 0
  };
}
function governanceMapCheck(target) {
  const governancePath = ".gate-pre-git/governance.json";
  const vendored = [
    ".gate-pre-git/config.json",
    ".gate-pre-git/lock.json",
    ".gate-pre-git/bin/gate-pre-git",
    ".gate-pre-git/runtime/cli.js"
  ].some((relativePath) => existsSync11(join8(target, relativePath)));
  if (!vendored) {
    return {
      name: "governance_map",
      status: "skipped",
      failures: [],
      warnings: ["repo is not vendored"],
      details: [governancePath],
      durationMs: 0
    };
  }
  const path = join8(target, governancePath);
  if (!existsSync11(path))
    return structuralCheck("governance_map", target, governancePath);
  const failures = governanceDriftFailures(JSON.parse(readFileSync9(path, "utf8")));
  return {
    name: "governance_map",
    status: failures.length === 0 ? "passed" : "failed",
    failures,
    warnings: [],
    details: [governancePath],
    durationMs: 0
  };
}
function governanceDriftFailures(actual) {
  const expected = defaultGovernanceMap();
  const actualZones = new Map((actual.zones ?? []).map((zone) => [zone.name, zone]));
  const failures = [];
  for (const expectedZone of expected.zones ?? []) {
    const actualZone = actualZones.get(expectedZone.name);
    if (expectedZone.name === undefined || actualZone === undefined) {
      failures.push(`missing base governance zone: ${expectedZone.name}`);
      continue;
    }
    if (riskRank(actualZone.risk) < riskRank(expectedZone.risk)) {
      failures.push(`weakened base risk for zone ${expectedZone.name}: expected ${expectedZone.risk}`);
    }
    for (const path of expectedZone.paths ?? []) {
      if (!actualZone.paths?.includes(path))
        failures.push(`missing base path for zone ${expectedZone.name}: ${path}`);
    }
    for (const evidence of expectedZone.requiredEvidence ?? []) {
      if (!actualZone.requiredEvidence?.includes(evidence)) {
        failures.push(`missing base evidence for zone ${expectedZone.name}: ${evidence}`);
      }
    }
  }
  for (const sensitive of expected.sensitivePaths ?? []) {
    if (!actual.sensitivePaths?.includes(sensitive))
      failures.push(`missing base sensitive path: ${sensitive}`);
  }
  for (const generated of expected.generatedPaths ?? []) {
    if (!actual.generatedPaths?.includes(generated))
      failures.push(`missing base generated path: ${generated}`);
  }
  return failures;
}
function riskRank(risk) {
  if (risk === "critical")
    return 4;
  if (risk === "high")
    return 3;
  if (risk === "medium")
    return 2;
  if (risk === "low")
    return 1;
  return 0;
}
function toolLockDriftCheck(target) {
  const lock = readLock(target);
  if (lock === null) {
    return {
      name: "tool_lock_drift",
      status: "failed",
      failures: ["missing .gate-pre-git/lock.json"],
      warnings: [],
      details: [],
      durationMs: 0
    };
  }
  const expected = defaultLock();
  const failures = [];
  for (const [name, expectedTool] of Object.entries(expected.tools)) {
    const actual = lock.tools[name];
    if (actual === undefined) {
      failures.push(`missing locked tool: ${name}`);
      continue;
    }
    for (const key of ["kind", "package", "version", "command"]) {
      if (actual[key] !== expectedTool[key])
        failures.push(`tool lock drift for ${name}.${key}: expected ${expectedTool[key]}`);
    }
  }
  return {
    name: "tool_lock_drift",
    status: failures.length === 0 ? "passed" : "failed",
    failures,
    warnings: [],
    details: [".gate-pre-git/lock.json"],
    durationMs: 0
  };
}
function structuralCheck(name, target, relativePath) {
  const path = join8(target, relativePath);
  const ok = existsSync11(path);
  return {
    name,
    status: ok ? "passed" : "failed",
    failures: ok ? [] : [`missing ${relativePath}`],
    warnings: [],
    details: [relativePath],
    durationMs: 0
  };
}
function hookCheck(target, hook) {
  const nativeHook = nativeHookPath(target, hook);
  const huskyHook = join8(target, ".husky", hook);
  const hookPath = nativeHook !== null && existsSync11(nativeHook) ? nativeHook : existsSync11(huskyHook) ? huskyHook : null;
  const text = hookPath === null ? "" : readFileSync9(hookPath, "utf8");
  const expectedCommand = hook === "pre-push" ? "push" : "staged";
  const ok = hookPath !== null && text.includes("gate-pre-git") && text.includes(expectedCommand);
  return {
    name: hook,
    status: ok ? "passed" : "failed",
    failures: ok ? [] : [`${hook} hook missing or not wired to gate-pre-git ${expectedCommand}`],
    warnings: [],
    details: hookPath === null ? [] : [hookPath],
    durationMs: 0
  };
}
function packageScriptCheck(target) {
  const packagePath = join8(target, "package.json");
  if (!existsSync11(packagePath)) {
    return {
      name: "package_scripts",
      status: "skipped",
      failures: [],
      warnings: ["package.json not found"],
      details: [],
      durationMs: 0
    };
  }
  const pkg = JSON.parse(readFileSync9(packagePath, "utf8"));
  const scripts = pkg.scripts ?? {};
  const required = [
    ["gate", [".gate-pre-git/bin/gate-pre-git check --all", "gate-pre-git check --all", "src/cli.ts check --all"]],
    ["gate:staged", [".gate-pre-git/bin/gate-pre-git staged", "gate-pre-git staged", "src/cli.ts staged"]],
    ["gate:doctor", [".gate-pre-git/bin/gate-pre-git doctor", "gate-pre-git doctor", "src/cli.ts doctor"]],
    ["gate:push", [".gate-pre-git/bin/gate-pre-git push", "gate-pre-git push"]],
    ["gate:audit", [".gate-pre-git/bin/gate-pre-git audit", "gate-pre-git audit"]],
    ["gate:release-plan", [".gate-pre-git/bin/gate-pre-git release plan", "gate-pre-git release plan"]],
    ["gate:version-audit", [".gate-pre-git/bin/gate-pre-git version audit", "gate-pre-git version audit"]]
  ];
  const failures = required.filter(([name, accepted]) => !accepted.some((needle) => scripts[name]?.includes(needle))).map(([name]) => `package script missing or divergent: ${name}`);
  return {
    name: "package_scripts",
    status: failures.length === 0 ? "passed" : "failed",
    failures,
    warnings: [],
    details: [],
    durationMs: 0
  };
}
function binaryReferenceCheck(target, commandProbe) {
  const texts = [
    nativeHookPath(target, "pre-commit"),
    nativeHookPath(target, "pre-push"),
    join8(target, ".husky", "pre-commit"),
    join8(target, ".husky", "pre-push"),
    join8(target, ".gate-pre-git", "bin", "gate-pre-git")
  ].filter((path) => path !== null).filter(existsSync11).map((path) => readFileSync9(path, "utf8"));
  const ok = texts.some((text) => text.includes(commandProbe) || text.includes("src/cli.ts") || text.includes(".gate-pre-git/bin/gate-pre-git"));
  return {
    name: "hook_command_reference",
    status: ok ? "passed" : "failed",
    failures: ok ? [] : [`hook does not reference ${commandProbe}, the vendored launcher, or a concrete CLI path`],
    warnings: [],
    details: [],
    durationMs: 0
  };
}
function toolCacheCheck(toolReports) {
  const missingLock = toolReports.some((tool) => tool.name === "gate-lock" && tool.status === "missing");
  const missingShims = toolReports.filter((tool) => tool.status === "locked").map((tool) => tool.name);
  const failures = [
    ...missingLock ? [`missing ${lockPath(".")}`] : [],
    ...missingShims.map((tool) => `tool shim missing for ${tool}`)
  ];
  return {
    name: "tool_cache",
    status: failures.length === 0 ? "passed" : "failed",
    failures,
    warnings: [],
    details: toolReports.map((tool) => `${tool.name}=${tool.status}`),
    durationMs: 0
  };
}
function smokeCheck() {
  const dir = join8(tmpdir2(), `gate-pre-git-doctor-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const started = Date.now();
  try {
    mkdirSync3(dir, { recursive: true });
    execFileSync5("git", ["init"], { cwd: dir, stdio: "ignore" });
    writeFileSync5(join8(dir, "bad.json"), "{", "utf8");
    execFileSync5("git", ["add", "bad.json"], { cwd: dir, stdio: "ignore" });
    writeFileSync5(join8(dir, "bad.json"), `{}
`, "utf8");
    const report = runGate({ target: dir, mode: "staged", all: false, json: false, runCommands: false });
    const ok = !report.ok && report.findings.some((finding) => finding.code === "json_syntax");
    return {
      name: "staged_snapshot_smoke",
      status: ok ? "passed" : "failed",
      failures: ok ? [] : ["staged smoke test did not catch invalid index content"],
      warnings: [],
      details: [],
      durationMs: Date.now() - started
    };
  } finally {
    rmSync2(dir, { recursive: true, force: true });
  }
}
function nativeHookPath(target, hook) {
  try {
    const path = execFileSync5("git", ["rev-parse", "--git-path", `hooks/${hook}`], {
      cwd: target,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    return isAbsolute3(path) ? path : join8(target, path);
  } catch {
    return null;
  }
}

// src/release.ts
import { execFileSync as execFileSync6 } from "child_process";
import { createHash as createHash3 } from "crypto";
import { existsSync as existsSync12, mkdirSync as mkdirSync4, readFileSync as readFileSync10, writeFileSync as writeFileSync6 } from "fs";
import { dirname as dirname3, join as join9 } from "path";
var CONVENTIONAL_RE = /^(feat|fix|refactor|perf|docs|style|revert)(?:\(([^)]+)\))?(!)?: (.+)$/;
var SEMVER_TAG_RE = /^v\d+\.\d+\.\d+(?:-[0-9A-Za-z][0-9A-Za-z.-]*)?$/;
function buildReleasePlan(options) {
  const started = Date.now();
  const target = options.target;
  const failures = [];
  const warnings = [];
  const project = readProjectName(target, warnings);
  const version = readReleaseVersion(target, failures);
  const toRef = options.to ?? "HEAD";
  const previousRef = options.from ?? previousVersionRef(target);
  if (previousRef === null)
    failures.push("release baseline ref not found: create a commit/tag or pass --from");
  if (version === null || previousRef === null) {
    return releaseReport({
      started,
      action: "plan",
      target,
      project,
      version,
      previousRef,
      toRef,
      entries: [],
      excludedCommits: [],
      updated: [],
      failures,
      warnings
    });
  }
  const commits = collectCommits(target, previousRef, toRef, failures);
  const classified = classifyCommits(target, commits);
  return releaseReport({
    started,
    action: "plan",
    target,
    project,
    version,
    previousRef,
    toRef,
    entries: classified.entries,
    excludedCommits: classified.excluded,
    updated: [],
    failures,
    warnings
  });
}
function writeReleaseArtifacts(options) {
  const started = Date.now();
  const plan = buildReleasePlan(options);
  if (!plan.ok)
    return { ...plan, action: "write", durationMs: Date.now() - started };
  const updated = [];
  const changelogPath = "CHANGELOG.md";
  const releasePath = `docs/releases/${plan.version}.md`;
  const releaseMarkdown = releaseNotesMarkdown(plan);
  const changelogMarkdown = changelogWithRelease(options.target, plan, releaseMarkdown);
  writeText(join9(options.target, changelogPath), changelogMarkdown);
  updated.push(changelogPath);
  writeText(join9(options.target, releasePath), releaseMarkdown);
  updated.push(releasePath);
  return {
    ...plan,
    action: "write",
    updated,
    artifactHash: artifactHash(releaseMarkdown, changelogMarkdown),
    durationMs: Date.now() - started
  };
}
function auditReleaseArtifacts(options) {
  const started = Date.now();
  const plan = buildReleasePlan(options);
  if (!plan.ok)
    return { ...plan, action: "audit", durationMs: Date.now() - started };
  const releasePath = `docs/releases/${plan.version}.md`;
  const changelogPath = "CHANGELOG.md";
  const expectedRelease = releaseNotesMarkdown(plan);
  const failures = [];
  const releaseAbsolutePath = join9(options.target, releasePath);
  const changelogAbsolutePath = join9(options.target, changelogPath);
  if (!existsSync12(releaseAbsolutePath)) {
    failures.push(`missing ${releasePath}`);
  } else if (readFileSync10(releaseAbsolutePath, "utf8") !== expectedRelease) {
    failures.push(`${releasePath} drifted from generated release plan`);
  }
  if (!existsSync12(changelogAbsolutePath)) {
    failures.push(`missing ${changelogPath}`);
  } else if (!readFileSync10(changelogAbsolutePath, "utf8").includes(`## ${plan.version}`)) {
    failures.push(`${changelogPath} missing ${plan.version}`);
  }
  return {
    ...plan,
    action: "audit",
    artifactHash: artifactHash(existsSync12(releaseAbsolutePath) ? readFileSync10(releaseAbsolutePath, "utf8") : "", existsSync12(changelogAbsolutePath) ? readFileSync10(changelogAbsolutePath, "utf8") : ""),
    failures: [...plan.failures, ...failures],
    durationMs: Date.now() - started,
    ok: plan.ok && failures.length === 0
  };
}
function releaseReport(options) {
  const range = options.previousRef === null ? null : `${options.previousRef}..${options.toRef}`;
  return {
    ok: options.failures.length === 0,
    mode: "release",
    action: options.action,
    target: options.target,
    project: options.project,
    version: options.version,
    previousRef: options.previousRef,
    toRef: options.toRef,
    range,
    entries: options.entries,
    excludedCommits: options.excludedCommits,
    updated: options.updated,
    artifactHash: null,
    failures: options.failures,
    warnings: options.warnings,
    durationMs: Date.now() - options.started
  };
}
function readReleaseVersion(target, failures) {
  const version = auditVersion({ target });
  if (!version.ok || version.currentVersion === null) {
    failures.push(...version.failures.map((failure) => `version audit: ${failure}`));
    return null;
  }
  return `v${version.currentVersion}`;
}
function readProjectName(target, warnings) {
  const packagePath = join9(target, "package.json");
  if (!existsSync12(packagePath)) {
    warnings.push("package.json not found; project name unavailable");
    return null;
  }
  const pkg = JSON.parse(readFileSync10(packagePath, "utf8"));
  return typeof pkg.name === "string" ? pkg.name : null;
}
function previousVersionRef(target) {
  try {
    const tags = execFileSync6("git", ["tag", "--sort=-version:refname"], {
      cwd: target,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).split(`
`).map((tag) => tag.trim()).filter((tag) => SEMVER_TAG_RE.test(tag));
    return tags[0] ?? firstCommit(target);
  } catch {
    return firstCommit(target);
  }
}
function firstCommit(target) {
  try {
    return execFileSync6("git", ["rev-list", "--max-parents=0", "HEAD"], {
      cwd: target,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).split(`
`).map((hash) => hash.trim()).filter(Boolean)[0];
  } catch {
    return null;
  }
}
function collectCommits(target, from, to, failures) {
  try {
    const output = execFileSync6("git", ["log", "--format=%H%x00%s", `${from}..${to}`], {
      cwd: target,
      encoding: "utf8"
    });
    return output.split(`
`).filter(Boolean).map((line) => {
      const [hash = "", subject = ""] = line.split("\x00");
      return { hash, subject };
    });
  } catch (error) {
    failures.push(`failed to collect release commits: ${error.message}`);
    return [];
  }
}
function classifyCommits(target, commits) {
  const entries = [];
  const excluded = [];
  for (const commit of commits) {
    const exclusion = excludedReason(target, commit);
    if (exclusion !== null) {
      excluded.push({
        commitHash: shortHash(target, commit.hash),
        subject: commit.subject,
        reason: exclusion
      });
      continue;
    }
    entries.push(classifyCommit(target, commit));
  }
  return { entries, excluded };
}
function excludedReason(target, commit) {
  if (commit.subject.startsWith("Merge ") || commit.subject.startsWith("Merge branch"))
    return "merge_commit";
  if (/bump.*version/i.test(commit.subject))
    return "bump_commit";
  if (/\b(lock|yarn\.lock|bun\.lock|package-lock)\b/i.test(commit.subject))
    return "lock_change";
  if (authorEmail(target, commit.hash).includes("[bot]") || authorEmail(target, commit.hash).includes("noreply@github.com")) {
    return "bot_author";
  }
  return null;
}
function classifyCommit(target, commit) {
  const match = commit.subject.match(CONVENTIONAL_RE);
  if (match === null) {
    return {
      commitHash: shortHash(target, commit.hash),
      category: "changed",
      title: commit.subject
    };
  }
  const [, type, component, breaking, title] = match;
  return compactReleaseEntry({
    commitHash: shortHash(target, commit.hash),
    category: categoryForType(type),
    title,
    component,
    breaking: breaking === "!" ? true : undefined
  });
}
function categoryForType(type) {
  if (type === "feat")
    return "added";
  if (type === "fix")
    return "fixed";
  return "changed";
}
function compactReleaseEntry(entry) {
  return Object.fromEntries(Object.entries(entry).filter(([, value]) => value !== undefined));
}
function shortHash(target, hash) {
  return execFileSync6("git", ["rev-parse", "--short=12", hash], { cwd: target, encoding: "utf8" }).trim();
}
function authorEmail(target, hash) {
  try {
    return execFileSync6("git", ["log", "--format=%ae", "-1", hash], { cwd: target, encoding: "utf8" }).trim().toLowerCase();
  } catch {
    return "";
  }
}
function releaseNotesMarkdown(plan) {
  const lines = [
    `# Release ${plan.version}`,
    "",
    `Project: ${plan.project ?? "unknown"}`,
    `Range: ${plan.range ?? "unknown"}`,
    "",
    "## Added",
    "",
    ...entriesForCategory(plan, "added"),
    "",
    "## Fixed",
    "",
    ...entriesForCategory(plan, "fixed"),
    "",
    "## Changed",
    "",
    ...entriesForCategory(plan, "changed"),
    ""
  ];
  return `${lines.join(`
`)}`;
}
function entriesForCategory(plan, category) {
  const entries = plan.entries.filter((entry) => entry.category === category);
  if (entries.length === 0)
    return ["- None"];
  return entries.map((entry) => {
    const component = entry.component === undefined ? "" : ` **${entry.component}:**`;
    const breaking = entry.breaking === true ? " **BREAKING**" : "";
    return `- ${entry.commitHash}${component} ${entry.title}${breaking}`;
  });
}
function changelogWithRelease(target, plan, releaseMarkdown) {
  const changelogPath = join9(target, "CHANGELOG.md");
  const existing = existsSync12(changelogPath) ? readFileSync10(changelogPath, "utf8") : `# Changelog

`;
  const releaseBody = releaseMarkdown.replace(/^# Release .+\n\n/, `## ${plan.version}

`).replace(/^## (Added|Fixed|Changed)$/gm, "### $1");
  const withoutExistingVersion = existing.replace(new RegExp(`\\n?## ${escapeRegExp2(plan.version ?? "")}[\\s\\S]*?(?=\\n## v\\d+\\.\\d+\\.\\d+|$)`), `
`);
  return `${withoutExistingVersion.trimEnd()}

${releaseBody}`;
}
function writeText(path, value) {
  mkdirSync4(dirname3(path), { recursive: true });
  writeFileSync6(path, value, "utf8");
}
function artifactHash(...values) {
  const hash = createHash3("sha256");
  for (const value of values)
    hash.update(value);
  return hash.digest("hex");
}
function escapeRegExp2(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// src/cli.ts
var args = parseArgs(process.argv.slice(2));
try {
  if (args.command === "help") {
    printHelp();
    process.exit(0);
  }
  if (args.command === "version") {
    if (args.versionAction === undefined) {
      console.log(GATE_PRE_GIT_VERSION);
      process.exit(0);
    }
    const report2 = args.versionAction === "plan" ? planVersionChange({ target: args.target, bump: args.versionBump }) : args.versionAction === "bump" ? applyVersionBump({ target: args.target, bump: args.versionBump }) : auditVersion({ target: args.target });
    printVersionReport(report2, args.format);
    process.exit(report2.ok ? 0 : 1);
  }
  if (args.command === "release") {
    const releaseOptions = { target: args.target, from: args.fromRef, to: args.toRef };
    const report2 = args.releaseAction === "write" ? writeReleaseArtifacts(releaseOptions) : args.releaseAction === "audit" ? auditReleaseArtifacts(releaseOptions) : buildReleasePlan(releaseOptions);
    printReleaseReport(report2, args.format);
    process.exit(report2.ok ? 0 : 1);
  }
  if (args.command === "update-tools") {
    const lock = writeDefaultLock(args.target);
    console.log(`gate_pre_git=passed`);
    console.log(`mode=update-tools`);
    console.log(`target=${resolve4(args.target)}`);
    console.log(`lock=.gate-pre-git/lock.json`);
    console.log(`tools=${Object.keys(lock.tools).sort().join(",")}`);
    process.exit(0);
  }
  if (args.command === "init") {
    const result2 = initProject({
      target: args.target,
      yes: args.yes,
      force: args.force,
      profile: args.profile,
      hook: args.hookKind,
      command: args.hookCommand ?? defaultHookCommand()
    });
    console.log(`init=${args.yes ? "applied" : "dry_run"}`);
    console.log(`profile=${args.profile}`);
    console.log(`config=${result2.configPath}`);
    console.log(`lock=${result2.lockPath}`);
    console.log(`bin=${result2.binPath}`);
    console.log(`runtime=${result2.runtimePath}`);
    console.log(`pre_commit_hook=${result2.preCommitHookPath}`);
    console.log(`pre_push_hook=${result2.prePushHookPath}`);
    console.log(`workflow=${result2.workflowPath}`);
    console.log(`wrote_config=${result2.wroteConfig}`);
    console.log(`installed_pre_commit_hook=${result2.installedHook}`);
    console.log(`installed_pre_push_hook=${result2.installedPrePushHook}`);
    console.log(`patched_package=${result2.patchedPackage}`);
    if (!args.yes)
      console.log("rerun_with=--yes");
    process.exit(0);
  }
  if (args.command === "install-hook") {
    const result2 = installHook(args.target, args.yes, args.hookCommand ?? defaultHookCommand(), args.hookKind, args.force);
    if (result2.installed) {
      console.log(`hook_installed=${result2.path}`);
    } else {
      console.log(`hook_path=${result2.path}`);
      console.log(result2.text.trimEnd());
    }
    process.exit(0);
  }
  if (args.command === "doctor") {
    const report2 = runDoctor(args.target);
    printReport(report2, args.format);
    process.exit(report2.ok ? 0 : 1);
  }
  const report = runGate(args);
  printReport(report, args.format);
  process.exit(report.ok ? 0 : 1);
} catch (error) {
  console.error(`gate_pre_git=failed`);
  console.error(`error=${error.message}`);
  process.exit(1);
}
function parseArgs(argv) {
  const command = parseCommand(argv[0]);
  const versionAction = command === "version" ? parseVersionAction(argv[1]) : undefined;
  const versionBump = command === "version" ? parseVersionBump(argv, versionAction) : undefined;
  const releaseAction = command === "release" ? parseReleaseAction(argv[1]) : undefined;
  const target = valueAfter(argv, "--target") ?? process.cwd();
  const configPath = valueAfter(argv, "--config");
  const hookCommand = valueAfter(argv, "--command");
  const hookKind = parseHookKind(valueAfter(argv, "--hook") ?? "native");
  const profile = parseProfile(valueAfter(argv, "--profile") ?? "auto");
  const format = parseFormat(valueAfter(argv, "--format") ?? (argv.includes("--json") ? "json" : "text"));
  const mode = isGateMode(command) ? command : "check";
  return {
    command,
    versionAction,
    versionBump,
    releaseAction,
    target,
    mode,
    all: argv.includes("--all"),
    json: format === "json",
    runCommands: !argv.includes("--no-commands"),
    configPath,
    base: valueAfter(argv, "--base"),
    fromRef: valueAfter(argv, "--from"),
    toRef: valueAfter(argv, "--to"),
    yes: argv.includes("--yes"),
    force: argv.includes("--force"),
    hookCommand,
    hookKind,
    profile,
    format
  };
}
function parseCommand(value) {
  if (value === undefined)
    return "help";
  if ([
    "check",
    "staged",
    "fix",
    "push",
    "audit",
    "advice",
    "doctor",
    "update-tools",
    "init",
    "install-hook",
    "help",
    "version",
    "release"
  ].includes(value)) {
    return value;
  }
  throw new Error(`unknown command: ${value}`);
}
function parseVersionAction(value) {
  if (value === undefined || value.startsWith("--"))
    return;
  if (value === "plan" || value === "bump" || value === "audit")
    return value;
  throw new Error(`unknown version action: ${value}`);
}
function parseVersionBump(argv, action) {
  if (action !== "plan" && action !== "bump")
    return;
  const value = argv[2];
  if (value === undefined || value.startsWith("--"))
    return "patch";
  return value;
}
function parseReleaseAction(value) {
  if (value === undefined || value.startsWith("--"))
    return "plan";
  if (value === "plan" || value === "write" || value === "audit")
    return value;
  throw new Error(`unknown release action: ${value}`);
}
function isGateMode(value) {
  return ["check", "staged", "fix", "push", "audit", "advice", "doctor", "update-tools"].includes(value);
}
function parseHookKind(value) {
  if (value === "native" || value === "husky")
    return value;
  throw new Error(`unknown hook kind: ${value}`);
}
function parseProfile(value) {
  if (isGateProfile(value))
    return value;
  throw new Error(`unknown profile: ${value}`);
}
function parseFormat(value) {
  if (value === "text" || value === "json" || value === "sarif")
    return value;
  throw new Error(`unknown format: ${value}`);
}
function valueAfter(argv, name) {
  const index = argv.indexOf(name);
  if (index === -1)
    return;
  const value = argv[index + 1];
  if (value === undefined || value.startsWith("--"))
    throw new Error(`missing value for ${name}`);
  return value;
}
function printReport(report, format) {
  if (format === "sarif") {
    console.log(toSarif(report));
    return;
  }
  if (format === "json") {
    if (report.mode === "audit") {
      console.log(toAuditJson(report));
      return;
    }
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(`gate_pre_git=${report.ok ? "passed" : "failed"}`);
  console.log(`version=${report.version}`);
  console.log(`mode=${report.mode}`);
  console.log(`target=${report.target}`);
  console.log(`files=${report.files.length}`);
  console.log(`advice=${report.advice.join(",") || "none"}`);
  console.log(`findings=${report.findings.length}`);
  if (report.mode === "audit")
    console.log(`manifest_hash=${buildAuditManifest(report).hash}`);
  console.log(`fixes_applied=${report.fixesApplied.length}`);
  console.log(`files_staged=${report.filesStaged.join(",") || "none"}`);
  console.log(`tools=${report.tools.length === 0 ? "none" : report.tools.map((tool) => `${tool.name}:${tool.status}`).join(",")}`);
  for (const finding of report.findings) {
    console.log(`finding.${finding.severity}.${finding.code}=${finding.file === undefined ? finding.message : `${finding.file}: ${finding.message}`}`);
  }
  for (const fix of report.fixesApplied) {
    console.log(`fix.${fix.tool}=${fix.file}:${fix.action}:staged=${fix.staged}`);
  }
  for (const check of report.checks) {
    console.log(`check.${check.name}=${check.status}`);
    for (const detail of check.details)
      console.log(`detail.${check.name}=${detail}`);
    for (const warning of check.warnings)
      console.log(`warning.${check.name}=${warning}`);
    for (const failure of check.failures)
      console.log(`failure.${check.name}=${failure}`);
  }
  console.log(`duration_ms=${report.durationMs}`);
}
function printVersionReport(report, format) {
  if (format === "sarif")
    throw new Error("version reports do not support SARIF");
  if (format === "json") {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(`gate_pre_git=${report.ok ? "passed" : "failed"}`);
  console.log(`mode=version:${report.action}`);
  console.log(`target=${resolve4(report.target)}`);
  console.log(`source=${report.source === null ? "none" : `${report.source.path}:${report.source.version}`}`);
  console.log(`current_version=${report.currentVersion ?? "none"}`);
  if (report.nextVersion !== undefined)
    console.log(`next_version=${report.nextVersion}`);
  console.log(`targets=${report.targets.length}`);
  console.log(`updated=${report.updated.join(",") || "none"}`);
  for (const versionTarget of report.targets) {
    console.log(`target.${versionTarget.kind}=${versionTarget.path}:${versionTarget.currentVersion ?? "missing-or-invalid"}`);
  }
  for (const warning of report.warnings)
    console.log(`warning.version=${warning}`);
  for (const failure of report.failures)
    console.log(`failure.version=${failure}`);
  console.log(`duration_ms=${report.durationMs}`);
}
function printReleaseReport(report, format) {
  if (format === "sarif")
    throw new Error("release reports do not support SARIF");
  if (format === "json") {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(`gate_pre_git=${report.ok ? "passed" : "failed"}`);
  console.log(`mode=release:${report.action}`);
  console.log(`target=${resolve4(report.target)}`);
  console.log(`project=${report.project ?? "unknown"}`);
  console.log(`version=${report.version ?? "unknown"}`);
  console.log(`range=${report.range ?? "unknown"}`);
  console.log(`entries=${report.entries.length}`);
  console.log(`excluded=${report.excludedCommits.length}`);
  console.log(`updated=${report.updated.join(",") || "none"}`);
  if (report.artifactHash !== null)
    console.log(`artifact_hash=${report.artifactHash}`);
  for (const entry of report.entries) {
    const component = entry.component === undefined ? "" : `:${entry.component}`;
    console.log(`entry.${entry.category}${component}=${entry.commitHash}:${entry.title}`);
  }
  for (const excluded of report.excludedCommits) {
    console.log(`excluded.${excluded.reason}=${excluded.commitHash}:${excluded.subject}`);
  }
  for (const warning of report.warnings)
    console.log(`warning.release=${warning}`);
  for (const failure of report.failures)
    console.log(`failure.release=${failure}`);
  console.log(`duration_ms=${report.durationMs}`);
}
function printHelp() {
  console.log(`gate-pre-git

Usage:
  gate-pre-git check [--all] [--target DIR] [--config FILE] [--json] [--no-commands]
  gate-pre-git staged [--target DIR] [--json]
  gate-pre-git fix [--all] [--target DIR] [--json]
  gate-pre-git push [--target DIR] [--base origin/main] [--json]
  gate-pre-git audit [--target DIR] [--format json|sarif]
  gate-pre-git advice [--target DIR] [--json]
  gate-pre-git doctor [--target DIR] [--json]
  gate-pre-git update-tools [--target DIR]
  gate-pre-git version [plan|bump|audit] [patch|minor|major|x.y.z[-tag]] [--target DIR]
  gate-pre-git release [plan|write|audit] [--target DIR] [--from REF] [--to REF]
  gate-pre-git init [--target DIR] [--profile auto|strict|node|nuxt|docs|python|go|rust|security] [--hook native|husky] [--yes]
  gate-pre-git install-hook [--target DIR] [--hook native|husky] [--command CMD] [--yes]

Commands:
  check         Run portable pre-GitHub checks over changed files, or all files with --all.
  staged        Run the commit-boundary checks over the real staged snapshot.
  fix           Apply trusted local fixers and stage their output.
  push          Run local pre-push checks against the configured base.
  audit         Emit the minimum GitHub audit report as JSON or SARIF.
  advice        Print non-blocking risk signals for the current change set.
  doctor        Fail unless config, hooks, lockfile, package scripts, tools, and smoke checks are wired.
  update-tools  Rewrite the explicit tool lock and local shims.
  version       Plan, apply, or audit synchronized project version targets.
  release       Plan, write, or audit changelog and release-note artifacts.
  init          Apply the vendored recipe. Dry-run by default; write with --yes.
  install-hook  Print or install a native Git/Husky pre-commit hook.
`);
}
function defaultHookCommand() {
  const cliPath = fileURLToPath2(import.meta.url);
  const argvPath = process.argv[1] === undefined ? cliPath : resolve4(process.argv[1]);
  if (argvPath.endsWith("src/cli.ts"))
    return `bun "${argvPath}"`;
  return "gate-pre-git";
}
