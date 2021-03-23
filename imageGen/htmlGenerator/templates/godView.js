var ui = (function () {
  'use strict';

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z = ":root {\n  --main-width: 750px;\n  --main-height: var(--main-width);\n\n  --text-size: 24px;\n  --text-size-small: calc(var(--text-size) * 0.75);\n  --text-size-tiny: calc(var(--text-size) * 0.6);\n\n  --font-stack: 'Avenir', monospace;\n\n  --bg: #001100;\n  --bg-rgb: 0, 17, 0;\n\n  --ui: #0f0;\n}\n\nhtml {\n  font-family: var(--font-stack);\n  font-size: var(--text-size);\n  line-height: 1;\n}\n\nbody {\n  width: var(--main-width);\n  height: var(--main-height);\n  margin: 0;\n\n  display: flex;\n  align-items: center;\n  justify-content: center;\n\n  background: var(--bg);\n  color: var(--ui);\n}\n\n* {\n  box-sizing: border-box;\n}\n\n.minilabel {\n  font-weight: bold;\n  text-transform: uppercase;\n  font-size: var(--text-size-small);\n}\n\n.sub {\n  font-size: 0.85em;\n  opacity: 0.7;\n}\n";
  styleInject(css_248z);

  function noop() { }
  function assign(tar, src) {
      // @ts-ignore
      for (const k in src)
          tar[k] = src[k];
      return tar;
  }
  function run(fn) {
      return fn();
  }
  function blank_object() {
      return Object.create(null);
  }
  function run_all(fns) {
      fns.forEach(run);
  }
  function is_function(thing) {
      return typeof thing === 'function';
  }
  function safe_not_equal(a, b) {
      return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
  }
  function is_empty(obj) {
      return Object.keys(obj).length === 0;
  }
  function null_to_empty(value) {
      return value == null ? '' : value;
  }

  function append(target, node) {
      target.appendChild(node);
  }
  function insert(target, node, anchor) {
      target.insertBefore(node, anchor || null);
  }
  function detach(node) {
      node.parentNode.removeChild(node);
  }
  function destroy_each(iterations, detaching) {
      for (let i = 0; i < iterations.length; i += 1) {
          if (iterations[i])
              iterations[i].d(detaching);
      }
  }
  function element(name) {
      return document.createElement(name);
  }
  function svg_element(name) {
      return document.createElementNS('http://www.w3.org/2000/svg', name);
  }
  function text(data) {
      return document.createTextNode(data);
  }
  function space() {
      return text(' ');
  }
  function empty() {
      return text('');
  }
  function listen(node, event, handler, options) {
      node.addEventListener(event, handler, options);
      return () => node.removeEventListener(event, handler, options);
  }
  function attr(node, attribute, value) {
      if (value == null)
          node.removeAttribute(attribute);
      else if (node.getAttribute(attribute) !== value)
          node.setAttribute(attribute, value);
  }
  function children(element) {
      return Array.from(element.childNodes);
  }
  function set_data(text, data) {
      data = '' + data;
      if (text.wholeText !== data)
          text.data = data;
  }
  function set_style(node, key, value, important) {
      node.style.setProperty(key, value, important ? 'important' : '');
  }
  function custom_event(type, detail) {
      const e = document.createEvent('CustomEvent');
      e.initCustomEvent(type, false, false, detail);
      return e;
  }

  let current_component;
  function set_current_component(component) {
      current_component = component;
  }
  function get_current_component() {
      if (!current_component)
          throw new Error('Function called outside component initialization');
      return current_component;
  }
  function onMount(fn) {
      get_current_component().$$.on_mount.push(fn);
  }
  function onDestroy(fn) {
      get_current_component().$$.on_destroy.push(fn);
  }
  function createEventDispatcher() {
      const component = get_current_component();
      return (type, detail) => {
          const callbacks = component.$$.callbacks[type];
          if (callbacks) {
              // TODO are there situations where events could be dispatched
              // in a server (non-DOM) environment?
              const event = custom_event(type, detail);
              callbacks.slice().forEach(fn => {
                  fn.call(component, event);
              });
          }
      };
  }

  const dirty_components = [];
  const binding_callbacks = [];
  const render_callbacks = [];
  const flush_callbacks = [];
  const resolved_promise = Promise.resolve();
  let update_scheduled = false;
  function schedule_update() {
      if (!update_scheduled) {
          update_scheduled = true;
          resolved_promise.then(flush);
      }
  }
  function tick() {
      schedule_update();
      return resolved_promise;
  }
  function add_render_callback(fn) {
      render_callbacks.push(fn);
  }
  let flushing = false;
  const seen_callbacks = new Set();
  function flush() {
      if (flushing)
          return;
      flushing = true;
      do {
          // first, call beforeUpdate functions
          // and update components
          for (let i = 0; i < dirty_components.length; i += 1) {
              const component = dirty_components[i];
              set_current_component(component);
              update(component.$$);
          }
          set_current_component(null);
          dirty_components.length = 0;
          while (binding_callbacks.length)
              binding_callbacks.pop()();
          // then, once components are updated, call
          // afterUpdate functions. This may cause
          // subsequent updates...
          for (let i = 0; i < render_callbacks.length; i += 1) {
              const callback = render_callbacks[i];
              if (!seen_callbacks.has(callback)) {
                  // ...so guard against infinite loops
                  seen_callbacks.add(callback);
                  callback();
              }
          }
          render_callbacks.length = 0;
      } while (dirty_components.length);
      while (flush_callbacks.length) {
          flush_callbacks.pop()();
      }
      update_scheduled = false;
      flushing = false;
      seen_callbacks.clear();
  }
  function update($$) {
      if ($$.fragment !== null) {
          $$.update();
          run_all($$.before_update);
          const dirty = $$.dirty;
          $$.dirty = [-1];
          $$.fragment && $$.fragment.p($$.ctx, dirty);
          $$.after_update.forEach(add_render_callback);
      }
  }
  const outroing = new Set();
  let outros;
  function group_outros() {
      outros = {
          r: 0,
          c: [],
          p: outros // parent group
      };
  }
  function check_outros() {
      if (!outros.r) {
          run_all(outros.c);
      }
      outros = outros.p;
  }
  function transition_in(block, local) {
      if (block && block.i) {
          outroing.delete(block);
          block.i(local);
      }
  }
  function transition_out(block, local, detach, callback) {
      if (block && block.o) {
          if (outroing.has(block))
              return;
          outroing.add(block);
          outros.c.push(() => {
              outroing.delete(block);
              if (callback) {
                  if (detach)
                      block.d(1);
                  callback();
              }
          });
          block.o(local);
      }
  }

  function get_spread_update(levels, updates) {
      const update = {};
      const to_null_out = {};
      const accounted_for = { $$scope: 1 };
      let i = levels.length;
      while (i--) {
          const o = levels[i];
          const n = updates[i];
          if (n) {
              for (const key in o) {
                  if (!(key in n))
                      to_null_out[key] = 1;
              }
              for (const key in n) {
                  if (!accounted_for[key]) {
                      update[key] = n[key];
                      accounted_for[key] = 1;
                  }
              }
              levels[i] = n;
          }
          else {
              for (const key in o) {
                  accounted_for[key] = 1;
              }
          }
      }
      for (const key in to_null_out) {
          if (!(key in update))
              update[key] = undefined;
      }
      return update;
  }
  function get_spread_object(spread_props) {
      return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
  }
  function create_component(block) {
      block && block.c();
  }
  function mount_component(component, target, anchor) {
      const { fragment, on_mount, on_destroy, after_update } = component.$$;
      fragment && fragment.m(target, anchor);
      // onMount happens before the initial afterUpdate
      add_render_callback(() => {
          const new_on_destroy = on_mount.map(run).filter(is_function);
          if (on_destroy) {
              on_destroy.push(...new_on_destroy);
          }
          else {
              // Edge case - component was destroyed immediately,
              // most likely as a result of a binding initialising
              run_all(new_on_destroy);
          }
          component.$$.on_mount = [];
      });
      after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
      const $$ = component.$$;
      if ($$.fragment !== null) {
          run_all($$.on_destroy);
          $$.fragment && $$.fragment.d(detaching);
          // TODO null out other refs, including component.$$ (but need to
          // preserve final state?)
          $$.on_destroy = $$.fragment = null;
          $$.ctx = [];
      }
  }
  function make_dirty(component, i) {
      if (component.$$.dirty[0] === -1) {
          dirty_components.push(component);
          schedule_update();
          component.$$.dirty.fill(0);
      }
      component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
  }
  function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
      const parent_component = current_component;
      set_current_component(component);
      const $$ = component.$$ = {
          fragment: null,
          ctx: null,
          // state
          props,
          update: noop,
          not_equal,
          bound: blank_object(),
          // lifecycle
          on_mount: [],
          on_destroy: [],
          before_update: [],
          after_update: [],
          context: new Map(parent_component ? parent_component.$$.context : []),
          // everything else
          callbacks: blank_object(),
          dirty,
          skip_bound: false
      };
      let ready = false;
      $$.ctx = instance
          ? instance(component, options.props || {}, (i, ret, ...rest) => {
              const value = rest.length ? rest[0] : ret;
              if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                  if (!$$.skip_bound && $$.bound[i])
                      $$.bound[i](value);
                  if (ready)
                      make_dirty(component, i);
              }
              return ret;
          })
          : [];
      $$.update();
      ready = true;
      run_all($$.before_update);
      // `false` as a special case of no DOM component
      $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
      if (options.target) {
          if (options.hydrate) {
              const nodes = children(options.target);
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              $$.fragment && $$.fragment.l(nodes);
              nodes.forEach(detach);
          }
          else {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              $$.fragment && $$.fragment.c();
          }
          if (options.intro)
              transition_in(component.$$.fragment);
          mount_component(component, options.target, options.anchor);
          flush();
      }
      set_current_component(parent_component);
  }
  /**
   * Base class for Svelte components. Used when dev=false.
   */
  class SvelteComponent {
      $destroy() {
          destroy_component(this, 1);
          this.$destroy = noop;
      }
      $on(type, callback) {
          const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
          callbacks.push(callback);
          return () => {
              const index = callbacks.indexOf(callback);
              if (index !== -1)
                  callbacks.splice(index, 1);
          };
      }
      $set($$props) {
          if (this.$$set && !is_empty($$props)) {
              this.$$.skip_bound = true;
              this.$$set($$props);
              this.$$.skip_bound = false;
          }
      }
  }

  const subscriber_queue = [];
  /**
   * Create a `Writable` store that allows both updating and reading by subscription.
   * @param {*=}value initial value
   * @param {StartStopNotifier=}start start and stop notifications for subscriptions
   */
  function writable(value, start = noop) {
      let stop;
      const subscribers = [];
      function set(new_value) {
          if (safe_not_equal(value, new_value)) {
              value = new_value;
              if (stop) { // store is ready
                  const run_queue = !subscriber_queue.length;
                  for (let i = 0; i < subscribers.length; i += 1) {
                      const s = subscribers[i];
                      s[1]();
                      subscriber_queue.push(s, value);
                  }
                  if (run_queue) {
                      for (let i = 0; i < subscriber_queue.length; i += 2) {
                          subscriber_queue[i][0](subscriber_queue[i + 1]);
                      }
                      subscriber_queue.length = 0;
                  }
              }
          }
      }
      function update(fn) {
          set(fn(value));
      }
      function subscribe(run, invalidate = noop) {
          const subscriber = [run, invalidate];
          subscribers.push(subscriber);
          if (subscribers.length === 1) {
              stop = start(set) || noop;
          }
          run(value);
          return () => {
              const index = subscribers.indexOf(subscriber);
              if (index !== -1) {
                  subscribers.splice(index, 1);
              }
              if (subscribers.length === 0) {
                  stop();
                  stop = null;
              }
          };
      }
      return { set, update, subscribe };
  }

  const scale = writable(1);
  const updateMs = writable(5 * 1000);
  const view = writable({ left: 0, top: 0, width: 0, height: 0 });
  const popOver = writable();

  const getMaxes = (coordPairs) => {
    let upperBound = coordPairs.reduce((max, p) => Math.max(p[1], max), -99999999);
    let rightBound = coordPairs.reduce((max, p) => Math.max(p[0], max), -99999999);
    let lowerBound = coordPairs.reduce((min, p) => Math.min(p[1], min), 99999999);
    let leftBound = coordPairs.reduce((min, p) => Math.min(p[0], min), 99999999);

    const heightDiff = Math.abs(upperBound - lowerBound);
    const widthDiff = Math.abs(rightBound - leftBound);

    return {
      left: leftBound,
      top: upperBound,
      right: rightBound,
      bottom: lowerBound,
      height: heightDiff,
      width: widthDiff,
    }
  };

  var common = { getMaxes };

  var css_248z$1 = "canvas.svelte-110erry{background:black;position:absolute;z-index:0;top:0;left:0}";
  styleInject(css_248z$1);

  /* imageGen/htmlGenerator/src/components/Starfield.svelte generated by Svelte v3.32.3 */

  function create_fragment(ctx) {
  	let canvas;

  	return {
  		c() {
  			canvas = element("canvas");
  			attr(canvas, "id", "starfield");
  			attr(canvas, "width", /*width*/ ctx[0]);
  			attr(canvas, "height", /*height*/ ctx[1]);
  			attr(canvas, "class", "svelte-110erry");
  		},
  		m(target, anchor) {
  			insert(target, canvas, anchor);
  		},
  		p(ctx, [dirty]) {
  			if (dirty & /*width*/ 1) {
  				attr(canvas, "width", /*width*/ ctx[0]);
  			}

  			if (dirty & /*height*/ 2) {
  				attr(canvas, "height", /*height*/ ctx[1]);
  			}
  		},
  		i: noop,
  		o: noop,
  		d(detaching) {
  			if (detaching) detach(canvas);
  		}
  	};
  }

  function instance($$self, $$props, $$invalidate) {
  	let width = 0, height = 0;

  	onMount(async () => {
  		const canvas = document.getElementById("starfield"), ctx = canvas.getContext("2d");

  		// ,
  		// color = getComputedStyle(document.documentElement)
  		//   .getPropertyValue('--ui')
  		$$invalidate(0, width = window.innerWidth);

  		$$invalidate(1, height = window.innerHeight);
  		const stars = Math.round(innerWidth / 3);
  		await tick();

  		for (let i = 0; i < stars; i++) {
  			let x = Math.random() * canvas.offsetWidth;
  			let y = Math.random() * canvas.offsetHeight;
  			ctx.fillStyle = "rgba(255,255,255,.4)"; //color
  			const size = Math.random() > 0.3 ? 1 : 2;
  			ctx.fillRect(x, y, size, size);
  		}
  	});

  	return [width, height];
  }

  class Starfield extends SvelteComponent {
  	constructor(options) {
  		super();
  		init(this, options, instance, create_fragment, safe_not_equal, {});
  	}
  }

  var css_248z$2 = ".popover.svelte-awb0v9{font-size:15px;line-height:1.4;position:absolute;bottom:0;right:0;width:300px;padding:0.2em;z-index:10;color:white}.popoverbox.svelte-awb0v9{padding:1em;background:rgba(40, 40, 40, 0.8);margin-bottom:0.2em}h3.svelte-awb0v9{font-size:18px;margin:0}.datarow.svelte-awb0v9{margin-bottom:0.5em}ul.svelte-awb0v9{margin:0}";
  styleInject(css_248z$2);

  /* imageGen/htmlGenerator/src/components/PopOver.svelte generated by Svelte v3.32.3 */

  function get_each_context(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[1] = list[i];
  	return child_ctx;
  }

  // (7:0) {#if popOver}
  function create_if_block(ctx) {
  	let div3;
  	let div2;
  	let h3;
  	let t0_value = /*popOver*/ ctx[0].name + "";
  	let t0;
  	let t1;
  	let div0;
  	let t2_value = /*popOver*/ ctx[0].type.substring(0, 1).toUpperCase() + /*popOver*/ ctx[0].type.substring(1) + "";
  	let t2;
  	let t3;
  	let div1;
  	let t4;
  	let t5_value = Math.round(/*popOver*/ ctx[0].location[0] * 100000) / 100000 + "";
  	let t5;
  	let t6;
  	let t7_value = Math.round(/*popOver*/ ctx[0].location[1] * -100000) / 100000 + "";
  	let t7;
  	let t8;
  	let t9;
  	let t10;
  	let if_block0 = /*popOver*/ ctx[0].type === "ship" && create_if_block_2(ctx);
  	let if_block1 = /*popOver*/ ctx[0].type === "attack" && create_if_block_1(ctx);

  	return {
  		c() {
  			div3 = element("div");
  			div2 = element("div");
  			h3 = element("h3");
  			t0 = text(t0_value);
  			t1 = space();
  			div0 = element("div");
  			t2 = text(t2_value);
  			t3 = space();
  			div1 = element("div");
  			t4 = text("[");
  			t5 = text(t5_value);
  			t6 = text(", ");
  			t7 = text(t7_value);
  			t8 = text("]");
  			t9 = space();
  			if (if_block0) if_block0.c();
  			t10 = space();
  			if (if_block1) if_block1.c();
  			attr(h3, "class", "svelte-awb0v9");
  			attr(div0, "class", "sub");
  			attr(div1, "class", "sub");
  			attr(div2, "class", "popoverbox svelte-awb0v9");
  			attr(div3, "class", "popover svelte-awb0v9");
  		},
  		m(target, anchor) {
  			insert(target, div3, anchor);
  			append(div3, div2);
  			append(div2, h3);
  			append(h3, t0);
  			append(div2, t1);
  			append(div2, div0);
  			append(div0, t2);
  			append(div2, t3);
  			append(div2, div1);
  			append(div1, t4);
  			append(div1, t5);
  			append(div1, t6);
  			append(div1, t7);
  			append(div1, t8);
  			append(div3, t9);
  			if (if_block0) if_block0.m(div3, null);
  			append(div3, t10);
  			if (if_block1) if_block1.m(div3, null);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*popOver*/ 1 && t0_value !== (t0_value = /*popOver*/ ctx[0].name + "")) set_data(t0, t0_value);
  			if (dirty & /*popOver*/ 1 && t2_value !== (t2_value = /*popOver*/ ctx[0].type.substring(0, 1).toUpperCase() + /*popOver*/ ctx[0].type.substring(1) + "")) set_data(t2, t2_value);
  			if (dirty & /*popOver*/ 1 && t5_value !== (t5_value = Math.round(/*popOver*/ ctx[0].location[0] * 100000) / 100000 + "")) set_data(t5, t5_value);
  			if (dirty & /*popOver*/ 1 && t7_value !== (t7_value = Math.round(/*popOver*/ ctx[0].location[1] * -100000) / 100000 + "")) set_data(t7, t7_value);

  			if (/*popOver*/ ctx[0].type === "ship") {
  				if (if_block0) {
  					if_block0.p(ctx, dirty);
  				} else {
  					if_block0 = create_if_block_2(ctx);
  					if_block0.c();
  					if_block0.m(div3, t10);
  				}
  			} else if (if_block0) {
  				if_block0.d(1);
  				if_block0 = null;
  			}

  			if (/*popOver*/ ctx[0].type === "attack") {
  				if (if_block1) {
  					if_block1.p(ctx, dirty);
  				} else {
  					if_block1 = create_if_block_1(ctx);
  					if_block1.c();
  					if_block1.m(div3, null);
  				}
  			} else if (if_block1) {
  				if_block1.d(1);
  				if_block1 = null;
  			}
  		},
  		d(detaching) {
  			if (detaching) detach(div3);
  			if (if_block0) if_block0.d();
  			if (if_block1) if_block1.d();
  		}
  	};
  }

  // (21:4) {#if popOver.type === 'ship'}
  function create_if_block_2(ctx) {
  	let div3;
  	let div0;
  	let b0;
  	let t1;
  	let t2_value = /*popOver*/ ctx[0].members + "";
  	let t2;
  	let t3;
  	let div1;
  	let b1;
  	let t5;
  	let t6_value = /*popOver*/ ctx[0].credits + "";
  	let t6;
  	let t7;
  	let div2;
  	let b2;
  	let t9;
  	let ul;
  	let each_value = /*popOver*/ ctx[0].cargo;
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  	}

  	return {
  		c() {
  			div3 = element("div");
  			div0 = element("div");
  			b0 = element("b");
  			b0.textContent = "Members";
  			t1 = text(": ");
  			t2 = text(t2_value);
  			t3 = space();
  			div1 = element("div");
  			b1 = element("b");
  			b1.textContent = "Credits";
  			t5 = text(": ");
  			t6 = text(t6_value);
  			t7 = space();
  			div2 = element("div");
  			b2 = element("b");
  			b2.textContent = "Cargo";
  			t9 = space();
  			ul = element("ul");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			attr(div0, "class", "datarow svelte-awb0v9");
  			attr(div1, "class", "datarow svelte-awb0v9");
  			attr(ul, "class", "svelte-awb0v9");
  			attr(div2, "class", "datarow svelte-awb0v9");
  			attr(div3, "class", "popoverbox svelte-awb0v9");
  		},
  		m(target, anchor) {
  			insert(target, div3, anchor);
  			append(div3, div0);
  			append(div0, b0);
  			append(div0, t1);
  			append(div0, t2);
  			append(div3, t3);
  			append(div3, div1);
  			append(div1, b1);
  			append(div1, t5);
  			append(div1, t6);
  			append(div3, t7);
  			append(div3, div2);
  			append(div2, b2);
  			append(div2, t9);
  			append(div2, ul);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(ul, null);
  			}
  		},
  		p(ctx, dirty) {
  			if (dirty & /*popOver*/ 1 && t2_value !== (t2_value = /*popOver*/ ctx[0].members + "")) set_data(t2, t2_value);
  			if (dirty & /*popOver*/ 1 && t6_value !== (t6_value = /*popOver*/ ctx[0].credits + "")) set_data(t6, t6_value);

  			if (dirty & /*Math, popOver*/ 1) {
  				each_value = /*popOver*/ ctx[0].cargo;
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(ul, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}
  		},
  		d(detaching) {
  			if (detaching) detach(div3);
  			destroy_each(each_blocks, detaching);
  		}
  	};
  }

  // (28:12) {#each popOver.cargo as c}
  function create_each_block(ctx) {
  	let li;
  	let t0_value = /*c*/ ctx[1].cargoType.substring(0, 1).toUpperCase() + /*c*/ ctx[1].cargoType.substring(1) + "";
  	let t0;
  	let t1;
  	let t2_value = Math.round(/*c*/ ctx[1].amount) + "";
  	let t2;
  	let t3;

  	return {
  		c() {
  			li = element("li");
  			t0 = text(t0_value);
  			t1 = text(": ");
  			t2 = text(t2_value);
  			t3 = space();
  			attr(li, "class", "subrow");
  		},
  		m(target, anchor) {
  			insert(target, li, anchor);
  			append(li, t0);
  			append(li, t1);
  			append(li, t2);
  			append(li, t3);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*popOver*/ 1 && t0_value !== (t0_value = /*c*/ ctx[1].cargoType.substring(0, 1).toUpperCase() + /*c*/ ctx[1].cargoType.substring(1) + "")) set_data(t0, t0_value);
  			if (dirty & /*popOver*/ 1 && t2_value !== (t2_value = Math.round(/*c*/ ctx[1].amount) + "")) set_data(t2, t2_value);
  		},
  		d(detaching) {
  			if (detaching) detach(li);
  		}
  	};
  }

  // (39:4) {#if popOver.type === 'attack'}
  function create_if_block_1(ctx) {
  	let div3;
  	let div0;
  	let b0;
  	let t0_value = (/*popOver*/ ctx[0].didHit ? `Hit!` : "Miss!") + "";
  	let t0;
  	let t1;
  	let div1;
  	let b1;
  	let t3;
  	let t4_value = new Date(/*popOver*/ ctx[0].time).toLocaleTimeString() + "";
  	let t4;
  	let t5;
  	let div2;
  	let b2;
  	let t7;
  	let t8_value = /*popOver*/ ctx[0].weaponId + "";
  	let t8;

  	return {
  		c() {
  			div3 = element("div");
  			div0 = element("div");
  			b0 = element("b");
  			t0 = text(t0_value);
  			t1 = space();
  			div1 = element("div");
  			b1 = element("b");
  			b1.textContent = "Time";
  			t3 = text(": ");
  			t4 = text(t4_value);
  			t5 = space();
  			div2 = element("div");
  			b2 = element("b");
  			b2.textContent = "Weapon";
  			t7 = text(": ");
  			t8 = text(t8_value);
  			attr(div0, "class", "datarow svelte-awb0v9");
  			attr(div1, "class", "datarow svelte-awb0v9");
  			attr(div2, "class", "datarow svelte-awb0v9");
  			attr(div3, "class", "popoverbox svelte-awb0v9");
  		},
  		m(target, anchor) {
  			insert(target, div3, anchor);
  			append(div3, div0);
  			append(div0, b0);
  			append(b0, t0);
  			append(div3, t1);
  			append(div3, div1);
  			append(div1, b1);
  			append(div1, t3);
  			append(div1, t4);
  			append(div3, t5);
  			append(div3, div2);
  			append(div2, b2);
  			append(div2, t7);
  			append(div2, t8);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*popOver*/ 1 && t0_value !== (t0_value = (/*popOver*/ ctx[0].didHit ? `Hit!` : "Miss!") + "")) set_data(t0, t0_value);
  			if (dirty & /*popOver*/ 1 && t4_value !== (t4_value = new Date(/*popOver*/ ctx[0].time).toLocaleTimeString() + "")) set_data(t4, t4_value);
  			if (dirty & /*popOver*/ 1 && t8_value !== (t8_value = /*popOver*/ ctx[0].weaponId + "")) set_data(t8, t8_value);
  		},
  		d(detaching) {
  			if (detaching) detach(div3);
  		}
  	};
  }

  function create_fragment$1(ctx) {
  	let if_block_anchor;
  	let if_block = /*popOver*/ ctx[0] && create_if_block(ctx);

  	return {
  		c() {
  			if (if_block) if_block.c();
  			if_block_anchor = empty();
  		},
  		m(target, anchor) {
  			if (if_block) if_block.m(target, anchor);
  			insert(target, if_block_anchor, anchor);
  		},
  		p(ctx, [dirty]) {
  			if (/*popOver*/ ctx[0]) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  				} else {
  					if_block = create_if_block(ctx);
  					if_block.c();
  					if_block.m(if_block_anchor.parentNode, if_block_anchor);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}
  		},
  		i: noop,
  		o: noop,
  		d(detaching) {
  			if (if_block) if_block.d(detaching);
  			if (detaching) detach(if_block_anchor);
  		}
  	};
  }

  function instance$1($$self, $$props, $$invalidate) {
  	let popOver$1;
  	popOver.subscribe(value => $$invalidate(0, popOver$1 = value));
  	return [popOver$1];
  }

  class PopOver extends SvelteComponent {
  	constructor(options) {
  		super();
  		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
  	}
  }

  var css_248z$3 = "g.svelte-so4ps9{position:relative}text.svelte-so4ps9{text-transform:uppercase;font-weight:bold;opacity:0.5}";
  styleInject(css_248z$3);

  /* imageGen/htmlGenerator/src/components/Point.svelte generated by Svelte v3.32.3 */

  function create_if_block$1(ctx) {
  	let text_1;
  	let t;
  	let text_1_x_value;
  	let text_1_y_value;
  	let text_1_font_size_value;
  	let text_1_fill_value;

  	return {
  		c() {
  			text_1 = svg_element("text");
  			t = text(/*name*/ ctx[4]);
  			attr(text_1, "x", text_1_x_value = /*location*/ ctx[0][0] * FLAT_SCALE);
  			attr(text_1, "y", text_1_y_value = /*location*/ ctx[0][1] * FLAT_SCALE + Math.max(/*minSize*/ ctx[1] / /*scale*/ ctx[6], /*radius*/ ctx[2]) * FLAT_SCALE * -1 - /*view*/ ctx[7].height * 0.005);
  			attr(text_1, "text-anchor", "middle");
  			attr(text_1, "font-size", text_1_font_size_value = 0.03 * FLAT_SCALE / /*scale*/ ctx[6]);
  			attr(text_1, "fill", text_1_fill_value = /*color*/ ctx[3] || "white");
  			attr(text_1, "class", "svelte-so4ps9");
  		},
  		m(target, anchor) {
  			insert(target, text_1, anchor);
  			append(text_1, t);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*name*/ 16) set_data(t, /*name*/ ctx[4]);

  			if (dirty & /*location*/ 1 && text_1_x_value !== (text_1_x_value = /*location*/ ctx[0][0] * FLAT_SCALE)) {
  				attr(text_1, "x", text_1_x_value);
  			}

  			if (dirty & /*location, minSize, scale, radius, view*/ 199 && text_1_y_value !== (text_1_y_value = /*location*/ ctx[0][1] * FLAT_SCALE + Math.max(/*minSize*/ ctx[1] / /*scale*/ ctx[6], /*radius*/ ctx[2]) * FLAT_SCALE * -1 - /*view*/ ctx[7].height * 0.005)) {
  				attr(text_1, "y", text_1_y_value);
  			}

  			if (dirty & /*scale*/ 64 && text_1_font_size_value !== (text_1_font_size_value = 0.03 * FLAT_SCALE / /*scale*/ ctx[6])) {
  				attr(text_1, "font-size", text_1_font_size_value);
  			}

  			if (dirty & /*color*/ 8 && text_1_fill_value !== (text_1_fill_value = /*color*/ ctx[3] || "white")) {
  				attr(text_1, "fill", text_1_fill_value);
  			}
  		},
  		d(detaching) {
  			if (detaching) detach(text_1);
  		}
  	};
  }

  function create_fragment$2(ctx) {
  	let g;
  	let circle;
  	let circle_cx_value;
  	let circle_cy_value;
  	let circle_r_value;
  	let circle_fill_value;
  	let mounted;
  	let dispose;
  	let if_block = /*name*/ ctx[4] && /*scale*/ ctx[6] >= 0.9 && create_if_block$1(ctx);

  	return {
  		c() {
  			g = svg_element("g");
  			circle = svg_element("circle");
  			if (if_block) if_block.c();
  			attr(circle, "cx", circle_cx_value = /*location*/ ctx[0][0] * FLAT_SCALE);
  			attr(circle, "cy", circle_cy_value = /*location*/ ctx[0][1] * FLAT_SCALE);
  			attr(circle, "r", circle_r_value = Math.max(/*minSize*/ ctx[1] / /*scale*/ ctx[6], /*radius*/ ctx[2]) * FLAT_SCALE);
  			attr(circle, "fill", circle_fill_value = /*color*/ ctx[3] || "white");
  			attr(g, "class", "point svelte-so4ps9");
  			set_style(g, "z-index", /*z*/ ctx[5]);
  		},
  		m(target, anchor) {
  			insert(target, g, anchor);
  			append(g, circle);
  			if (if_block) if_block.m(g, null);

  			if (!mounted) {
  				dispose = [
  					listen(g, "mouseenter", /*mouseenter_handler*/ ctx[9]),
  					listen(g, "mouseleave", /*mouseleave_handler*/ ctx[10])
  				];

  				mounted = true;
  			}
  		},
  		p(ctx, [dirty]) {
  			if (dirty & /*location*/ 1 && circle_cx_value !== (circle_cx_value = /*location*/ ctx[0][0] * FLAT_SCALE)) {
  				attr(circle, "cx", circle_cx_value);
  			}

  			if (dirty & /*location*/ 1 && circle_cy_value !== (circle_cy_value = /*location*/ ctx[0][1] * FLAT_SCALE)) {
  				attr(circle, "cy", circle_cy_value);
  			}

  			if (dirty & /*minSize, scale, radius*/ 70 && circle_r_value !== (circle_r_value = Math.max(/*minSize*/ ctx[1] / /*scale*/ ctx[6], /*radius*/ ctx[2]) * FLAT_SCALE)) {
  				attr(circle, "r", circle_r_value);
  			}

  			if (dirty & /*color*/ 8 && circle_fill_value !== (circle_fill_value = /*color*/ ctx[3] || "white")) {
  				attr(circle, "fill", circle_fill_value);
  			}

  			if (/*name*/ ctx[4] && /*scale*/ ctx[6] >= 0.9) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  				} else {
  					if_block = create_if_block$1(ctx);
  					if_block.c();
  					if_block.m(g, null);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}

  			if (dirty & /*z*/ 32) {
  				set_style(g, "z-index", /*z*/ ctx[5]);
  			}
  		},
  		i: noop,
  		o: noop,
  		d(detaching) {
  			if (detaching) detach(g);
  			if (if_block) if_block.d();
  			mounted = false;
  			run_all(dispose);
  		}
  	};
  }

  const FLAT_SCALE = 100;

  function instance$2($$self, $$props, $$invalidate) {
  	let scale$1, view$1;
  	const unsubscribe = [];
  	unsubscribe.push(updateMs.subscribe(value => value));

  	unsubscribe.push(scale.subscribe(value => {
  		$$invalidate(6, scale$1 = value);
  	}));

  	unsubscribe.push(view.subscribe(value => {
  		$$invalidate(7, view$1 = value);
  	}));

  	onDestroy(() => unsubscribe.forEach(u => u()));

  	let { location } = $$props,
  		{ minSize = 0.005 } = $$props,
  		{ radius = 0 } = $$props,
  		{ color } = $$props,
  		{ name } = $$props,
  		{ z } = $$props;

  	const dispatch = createEventDispatcher();
  	const mouseenter_handler = () => dispatch("enter");
  	const mouseleave_handler = () => dispatch("leave");

  	$$self.$$set = $$props => {
  		if ("location" in $$props) $$invalidate(0, location = $$props.location);
  		if ("minSize" in $$props) $$invalidate(1, minSize = $$props.minSize);
  		if ("radius" in $$props) $$invalidate(2, radius = $$props.radius);
  		if ("color" in $$props) $$invalidate(3, color = $$props.color);
  		if ("name" in $$props) $$invalidate(4, name = $$props.name);
  		if ("z" in $$props) $$invalidate(5, z = $$props.z);
  	};

  	return [
  		location,
  		minSize,
  		radius,
  		color,
  		name,
  		z,
  		scale$1,
  		view$1,
  		dispatch,
  		mouseenter_handler,
  		mouseleave_handler
  	];
  }

  class Point extends SvelteComponent {
  	constructor(options) {
  		super();

  		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
  			location: 0,
  			minSize: 1,
  			radius: 2,
  			color: 3,
  			name: 4,
  			z: 5
  		});
  	}
  }

  var css_248z$4 = ".atmosphere.svelte-18jbv2o{pointer-events:none;opacity:0.2}.atmosphere.hovering.svelte-18jbv2o{opacity:0.3}";
  styleInject(css_248z$4);

  /* imageGen/htmlGenerator/src/components/Planet.svelte generated by Svelte v3.32.3 */

  function create_fragment$3(ctx) {
  	let defs;
  	let radialGradient;
  	let stop0;
  	let stop1;
  	let t0;
  	let g;
  	let point0;
  	let g_class_value;
  	let t1;
  	let point1;
  	let current;

  	point0 = new Point({
  			props: {
  				location: /*location*/ ctx[0],
  				minSize: /*minSizeAdjustedForActualSize*/ ctx[6] * 8,
  				radius: /*radius*/ ctx[1] * 8,
  				color: `url('#${/*name*/ ctx[3]}')`,
  				z: 1
  			}
  		});

  	point1 = new Point({
  			props: {
  				location: /*location*/ ctx[0],
  				minSize: /*minSizeAdjustedForActualSize*/ ctx[6],
  				radius: /*radius*/ ctx[1],
  				color: /*color*/ ctx[2],
  				name: /*name*/ ctx[3],
  				z: /*z*/ ctx[4]
  			}
  		});

  	point1.$on("enter", /*enter*/ ctx[7]);
  	point1.$on("leave", /*leave*/ ctx[8]);

  	return {
  		c() {
  			defs = svg_element("defs");
  			radialGradient = svg_element("radialGradient");
  			stop0 = svg_element("stop");
  			stop1 = svg_element("stop");
  			t0 = space();
  			g = svg_element("g");
  			create_component(point0.$$.fragment);
  			t1 = space();
  			create_component(point1.$$.fragment);
  			attr(stop0, "offset", "30%");
  			attr(stop0, "stop-color", /*color*/ ctx[2]);
  			attr(stop1, "offset", "100%");
  			attr(stop1, "stop-color", "transparent");
  			attr(radialGradient, "id", /*name*/ ctx[3]);
  			attr(g, "class", g_class_value = "" + (null_to_empty("atmosphere" + (/*hovering*/ ctx[5] ? " hovering" : "")) + " svelte-18jbv2o"));
  		},
  		m(target, anchor) {
  			insert(target, defs, anchor);
  			append(defs, radialGradient);
  			append(radialGradient, stop0);
  			append(radialGradient, stop1);
  			insert(target, t0, anchor);
  			insert(target, g, anchor);
  			mount_component(point0, g, null);
  			insert(target, t1, anchor);
  			mount_component(point1, target, anchor);
  			current = true;
  		},
  		p(ctx, [dirty]) {
  			if (!current || dirty & /*color*/ 4) {
  				attr(stop0, "stop-color", /*color*/ ctx[2]);
  			}

  			if (!current || dirty & /*name*/ 8) {
  				attr(radialGradient, "id", /*name*/ ctx[3]);
  			}

  			const point0_changes = {};
  			if (dirty & /*location*/ 1) point0_changes.location = /*location*/ ctx[0];
  			if (dirty & /*radius*/ 2) point0_changes.radius = /*radius*/ ctx[1] * 8;
  			if (dirty & /*name*/ 8) point0_changes.color = `url('#${/*name*/ ctx[3]}')`;
  			point0.$set(point0_changes);

  			if (!current || dirty & /*hovering*/ 32 && g_class_value !== (g_class_value = "" + (null_to_empty("atmosphere" + (/*hovering*/ ctx[5] ? " hovering" : "")) + " svelte-18jbv2o"))) {
  				attr(g, "class", g_class_value);
  			}

  			const point1_changes = {};
  			if (dirty & /*location*/ 1) point1_changes.location = /*location*/ ctx[0];
  			if (dirty & /*radius*/ 2) point1_changes.radius = /*radius*/ ctx[1];
  			if (dirty & /*color*/ 4) point1_changes.color = /*color*/ ctx[2];
  			if (dirty & /*name*/ 8) point1_changes.name = /*name*/ ctx[3];
  			if (dirty & /*z*/ 16) point1_changes.z = /*z*/ ctx[4];
  			point1.$set(point1_changes);
  		},
  		i(local) {
  			if (current) return;
  			transition_in(point0.$$.fragment, local);
  			transition_in(point1.$$.fragment, local);
  			current = true;
  		},
  		o(local) {
  			transition_out(point0.$$.fragment, local);
  			transition_out(point1.$$.fragment, local);
  			current = false;
  		},
  		d(detaching) {
  			if (detaching) detach(defs);
  			if (detaching) detach(t0);
  			if (detaching) detach(g);
  			destroy_component(point0);
  			if (detaching) detach(t1);
  			destroy_component(point1, detaching);
  		}
  	};
  }

  function instance$3($$self, $$props, $$invalidate) {
  	let { location } = $$props,
  		{ minSize = 0.01 } = $$props,
  		{ radius } = $$props,
  		{ color } = $$props,
  		{ name } = $$props,
  		{ z = 2 } = $$props;

  	let hovering = false;
  	const earthRadiusInAU = 6371 / 149597900;
  	let minSizeAdjustedForActualSize = ((radius - earthRadiusInAU) / earthRadiusInAU * 0.5 + 1) * minSize;

  	function enter() {
  		$$invalidate(5, hovering = true);
  		popOver.set({ type: "planet", name, location });
  	}

  	function leave() {
  		$$invalidate(5, hovering = false);
  		popOver.set();
  	}

  	$$self.$$set = $$props => {
  		if ("location" in $$props) $$invalidate(0, location = $$props.location);
  		if ("minSize" in $$props) $$invalidate(9, minSize = $$props.minSize);
  		if ("radius" in $$props) $$invalidate(1, radius = $$props.radius);
  		if ("color" in $$props) $$invalidate(2, color = $$props.color);
  		if ("name" in $$props) $$invalidate(3, name = $$props.name);
  		if ("z" in $$props) $$invalidate(4, z = $$props.z);
  	};

  	return [
  		location,
  		radius,
  		color,
  		name,
  		z,
  		hovering,
  		minSizeAdjustedForActualSize,
  		enter,
  		leave,
  		minSize
  	];
  }

  class Planet extends SvelteComponent {
  	constructor(options) {
  		super();

  		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
  			location: 0,
  			minSize: 9,
  			radius: 1,
  			color: 2,
  			name: 3,
  			z: 4
  		});
  	}
  }

  var css_248z$5 = "g.svelte-1s6utc6{position:relative}";
  styleInject(css_248z$5);

  /* imageGen/htmlGenerator/src/components/Path.svelte generated by Svelte v3.32.3 */

  function get_each_context$1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[11] = list[i];
  	return child_ctx;
  }

  // (47:2) {#each lines as line}
  function create_each_block$1(ctx) {
  	let line;
  	let line_x__value;
  	let line_y__value;
  	let line_x__value_1;
  	let line_y__value_1;
  	let line_stroke_value;
  	let line_stroke_width_value;

  	return {
  		c() {
  			line = svg_element("line");
  			attr(line, "x1", line_x__value = /*line*/ ctx[11].from[0] * FLAT_SCALE$1);
  			attr(line, "y1", line_y__value = /*line*/ ctx[11].from[1] * FLAT_SCALE$1);
  			attr(line, "x2", line_x__value_1 = /*line*/ ctx[11].to[0] * FLAT_SCALE$1);
  			attr(line, "y2", line_y__value_1 = /*line*/ ctx[11].to[1] * FLAT_SCALE$1);
  			attr(line, "stroke", line_stroke_value = /*line*/ ctx[11].color || /*stroke*/ ctx[0]);
  			attr(line, "stroke-width", line_stroke_width_value = /*strokeWidth*/ ctx[2] * FLAT_SCALE$1 / /*scale*/ ctx[4]);
  		},
  		m(target, anchor) {
  			insert(target, line, anchor);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*lines*/ 8 && line_x__value !== (line_x__value = /*line*/ ctx[11].from[0] * FLAT_SCALE$1)) {
  				attr(line, "x1", line_x__value);
  			}

  			if (dirty & /*lines*/ 8 && line_y__value !== (line_y__value = /*line*/ ctx[11].from[1] * FLAT_SCALE$1)) {
  				attr(line, "y1", line_y__value);
  			}

  			if (dirty & /*lines*/ 8 && line_x__value_1 !== (line_x__value_1 = /*line*/ ctx[11].to[0] * FLAT_SCALE$1)) {
  				attr(line, "x2", line_x__value_1);
  			}

  			if (dirty & /*lines*/ 8 && line_y__value_1 !== (line_y__value_1 = /*line*/ ctx[11].to[1] * FLAT_SCALE$1)) {
  				attr(line, "y2", line_y__value_1);
  			}

  			if (dirty & /*lines, stroke*/ 9 && line_stroke_value !== (line_stroke_value = /*line*/ ctx[11].color || /*stroke*/ ctx[0])) {
  				attr(line, "stroke", line_stroke_value);
  			}

  			if (dirty & /*strokeWidth, scale*/ 20 && line_stroke_width_value !== (line_stroke_width_value = /*strokeWidth*/ ctx[2] * FLAT_SCALE$1 / /*scale*/ ctx[4])) {
  				attr(line, "stroke-width", line_stroke_width_value);
  			}
  		},
  		d(detaching) {
  			if (detaching) detach(line);
  		}
  	};
  }

  function create_fragment$4(ctx) {
  	let g;
  	let mounted;
  	let dispose;
  	let each_value = /*lines*/ ctx[3];
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
  	}

  	return {
  		c() {
  			g = svg_element("g");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			attr(g, "class", "path svelte-1s6utc6");
  			set_style(g, "z-index", /*z*/ ctx[1]);
  		},
  		m(target, anchor) {
  			insert(target, g, anchor);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(g, null);
  			}

  			if (!mounted) {
  				dispose = [
  					listen(g, "mouseenter", /*mouseenter_handler*/ ctx[9]),
  					listen(g, "mouseleave", /*mouseleave_handler*/ ctx[10])
  				];

  				mounted = true;
  			}
  		},
  		p(ctx, [dirty]) {
  			if (dirty & /*lines, FLAT_SCALE, stroke, strokeWidth, scale*/ 29) {
  				each_value = /*lines*/ ctx[3];
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$1(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$1(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(g, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}

  			if (dirty & /*z*/ 2) {
  				set_style(g, "z-index", /*z*/ ctx[1]);
  			}
  		},
  		i: noop,
  		o: noop,
  		d(detaching) {
  			if (detaching) detach(g);
  			destroy_each(each_blocks, detaching);
  			mounted = false;
  			run_all(dispose);
  		}
  	};
  }

  const FLAT_SCALE$1 = 100;

  function instance$4($$self, $$props, $$invalidate) {
  	const dispatch = createEventDispatcher();
  	let scale$1;
  	scale.subscribe(value => $$invalidate(4, scale$1 = value));
  	let { points = [] } = $$props;
  	let { colorRgb = "255,255,255" } = $$props;
  	let { stroke } = $$props;
  	let { fade = true } = $$props;
  	let { z = 1 } = $$props;
  	let { strokeWidth = 0.003 } = $$props;
  	let lines = [];
  	const mouseenter_handler = () => dispatch("enter");
  	const mouseleave_handler = () => dispatch("leave");

  	$$self.$$set = $$props => {
  		if ("points" in $$props) $$invalidate(6, points = $$props.points);
  		if ("colorRgb" in $$props) $$invalidate(7, colorRgb = $$props.colorRgb);
  		if ("stroke" in $$props) $$invalidate(0, stroke = $$props.stroke);
  		if ("fade" in $$props) $$invalidate(8, fade = $$props.fade);
  		if ("z" in $$props) $$invalidate(1, z = $$props.z);
  		if ("strokeWidth" in $$props) $$invalidate(2, strokeWidth = $$props.strokeWidth);
  	};

  	$$self.$$.update = () => {
  		if ($$self.$$.dirty & /*points, stroke, colorRgb, fade, lines*/ 457) {
  			{
  				$$invalidate(3, lines = [
  					...points.map((l, index) => ({
  						location: l,
  						color: stroke
  						? ""
  						: `rgba(${colorRgb}, ${fade ? 0.5 * (index / points.length) : 1})`
  					}))
  				]);

  				let from;

  				for (let l of lines) {
  					const to = l.location;
  					if (!from) from = to;
  					l.from = from;
  					l.to = to;
  					from = to;
  				}

  				lines.shift();
  			}
  		}
  	};

  	return [
  		stroke,
  		z,
  		strokeWidth,
  		lines,
  		scale$1,
  		dispatch,
  		points,
  		colorRgb,
  		fade,
  		mouseenter_handler,
  		mouseleave_handler
  	];
  }

  class Path extends SvelteComponent {
  	constructor(options) {
  		super();

  		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
  			points: 6,
  			colorRgb: 7,
  			stroke: 0,
  			fade: 8,
  			z: 1,
  			strokeWidth: 2
  		});
  	}
  }

  /* imageGen/htmlGenerator/src/components/Ship.svelte generated by Svelte v3.32.3 */

  function create_fragment$5(ctx) {
  	let point;
  	let t;
  	let path;
  	let current;

  	point = new Point({
  			props: {
  				location: /*location*/ ctx[0],
  				minSize: /*minSize*/ ctx[1],
  				radius: /*radius*/ ctx[2],
  				color: /*color*/ ctx[3],
  				name: /*shipData*/ ctx[6].status.docked
  				? false
  				: /*name*/ ctx[4],
  				z: /*z*/ ctx[5]
  			}
  		});

  	point.$on("enter", /*enter*/ ctx[8]);
  	point.$on("leave", /*leave*/ ctx[9]);

  	path = new Path({
  			props: {
  				points: /*trail*/ ctx[7],
  				z: /*z*/ ctx[5] - 1
  			}
  		});

  	return {
  		c() {
  			create_component(point.$$.fragment);
  			t = space();
  			create_component(path.$$.fragment);
  		},
  		m(target, anchor) {
  			mount_component(point, target, anchor);
  			insert(target, t, anchor);
  			mount_component(path, target, anchor);
  			current = true;
  		},
  		p(ctx, [dirty]) {
  			const point_changes = {};
  			if (dirty & /*location*/ 1) point_changes.location = /*location*/ ctx[0];
  			if (dirty & /*minSize*/ 2) point_changes.minSize = /*minSize*/ ctx[1];
  			if (dirty & /*radius*/ 4) point_changes.radius = /*radius*/ ctx[2];
  			if (dirty & /*color*/ 8) point_changes.color = /*color*/ ctx[3];

  			if (dirty & /*shipData, name*/ 80) point_changes.name = /*shipData*/ ctx[6].status.docked
  			? false
  			: /*name*/ ctx[4];

  			if (dirty & /*z*/ 32) point_changes.z = /*z*/ ctx[5];
  			point.$set(point_changes);
  			const path_changes = {};
  			if (dirty & /*trail*/ 128) path_changes.points = /*trail*/ ctx[7];
  			if (dirty & /*z*/ 32) path_changes.z = /*z*/ ctx[5] - 1;
  			path.$set(path_changes);
  		},
  		i(local) {
  			if (current) return;
  			transition_in(point.$$.fragment, local);
  			transition_in(path.$$.fragment, local);
  			current = true;
  		},
  		o(local) {
  			transition_out(point.$$.fragment, local);
  			transition_out(path.$$.fragment, local);
  			current = false;
  		},
  		d(detaching) {
  			destroy_component(point, detaching);
  			if (detaching) detach(t);
  			destroy_component(path, detaching);
  		}
  	};
  }

  function instance$5($$self, $$props, $$invalidate) {
  	let { location } = $$props,
  		{ minSize = 0.005 } = $$props,
  		{ radius } = $$props,
  		{ color } = $$props,
  		{ name } = $$props,
  		{ z = 4 } = $$props,
  		{ shipData } = $$props;
  	let trail = [];

  	function enter() {

  		popOver.set({
  			type: "ship",
  			name,
  			location,
  			members: shipData.members.length,
  			cargo: shipData.cargo,
  			credits: shipData.credits
  		});
  	}

  	function leave() {
  		popOver.set();
  	}

  	$$self.$$set = $$props => {
  		if ("location" in $$props) $$invalidate(0, location = $$props.location);
  		if ("minSize" in $$props) $$invalidate(1, minSize = $$props.minSize);
  		if ("radius" in $$props) $$invalidate(2, radius = $$props.radius);
  		if ("color" in $$props) $$invalidate(3, color = $$props.color);
  		if ("name" in $$props) $$invalidate(4, name = $$props.name);
  		if ("z" in $$props) $$invalidate(5, z = $$props.z);
  		if ("shipData" in $$props) $$invalidate(6, shipData = $$props.shipData);
  	};

  	$$self.$$.update = () => {
  		if ($$self.$$.dirty & /*shipData, location*/ 65) {
  			$$invalidate(7, trail = [...shipData.pastLocations.map(l => [l[0], l[1] * -1]), location]);
  		}
  	};

  	return [location, minSize, radius, color, name, z, shipData, trail, enter, leave];
  }

  class Ship extends SvelteComponent {
  	constructor(options) {
  		super();

  		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
  			location: 0,
  			minSize: 1,
  			radius: 2,
  			color: 3,
  			name: 4,
  			z: 5,
  			shipData: 6
  		});
  	}
  }

  /* imageGen/htmlGenerator/src/components/Cache.svelte generated by Svelte v3.32.3 */

  function create_fragment$6(ctx) {
  	let point;
  	let current;

  	point = new Point({
  			props: {
  				location: /*location*/ ctx[0],
  				minSize: /*minSize*/ ctx[1],
  				radius: /*radius*/ ctx[2],
  				color: /*color*/ ctx[3],
  				name: /*name*/ ctx[4],
  				z: /*z*/ ctx[5]
  			}
  		});

  	return {
  		c() {
  			create_component(point.$$.fragment);
  		},
  		m(target, anchor) {
  			mount_component(point, target, anchor);
  			current = true;
  		},
  		p(ctx, [dirty]) {
  			const point_changes = {};
  			if (dirty & /*location*/ 1) point_changes.location = /*location*/ ctx[0];
  			if (dirty & /*minSize*/ 2) point_changes.minSize = /*minSize*/ ctx[1];
  			if (dirty & /*radius*/ 4) point_changes.radius = /*radius*/ ctx[2];
  			if (dirty & /*color*/ 8) point_changes.color = /*color*/ ctx[3];
  			if (dirty & /*name*/ 16) point_changes.name = /*name*/ ctx[4];
  			if (dirty & /*z*/ 32) point_changes.z = /*z*/ ctx[5];
  			point.$set(point_changes);
  		},
  		i(local) {
  			if (current) return;
  			transition_in(point.$$.fragment, local);
  			current = true;
  		},
  		o(local) {
  			transition_out(point.$$.fragment, local);
  			current = false;
  		},
  		d(detaching) {
  			destroy_component(point, detaching);
  		}
  	};
  }

  function instance$6($$self, $$props, $$invalidate) {
  	let { location } = $$props,
  		{ minSize = 0.003 } = $$props,
  		{ radius } = $$props,
  		{ color = "yellow" } = $$props,
  		{ name } = $$props,
  		{ z = 3 } = $$props;

  	$$self.$$set = $$props => {
  		if ("location" in $$props) $$invalidate(0, location = $$props.location);
  		if ("minSize" in $$props) $$invalidate(1, minSize = $$props.minSize);
  		if ("radius" in $$props) $$invalidate(2, radius = $$props.radius);
  		if ("color" in $$props) $$invalidate(3, color = $$props.color);
  		if ("name" in $$props) $$invalidate(4, name = $$props.name);
  		if ("z" in $$props) $$invalidate(5, z = $$props.z);
  	};

  	return [location, minSize, radius, color, name, z];
  }

  class Cache extends SvelteComponent {
  	constructor(options) {
  		super();

  		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
  			location: 0,
  			minSize: 1,
  			radius: 2,
  			color: 3,
  			name: 4,
  			z: 5
  		});
  	}
  }

  /* imageGen/htmlGenerator/src/components/AttackRemnant.svelte generated by Svelte v3.32.3 */

  function create_fragment$7(ctx) {
  	let defs;
  	let linearGradient;
  	let stop0;
  	let stop0_stop_color_value;
  	let stop1;
  	let stop1_stop_color_value;
  	let stop2;
  	let stop2_stop_color_value;
  	let stop3;
  	let stop3_stop_color_value;
  	let stop4;
  	let stop4_stop_color_value;
  	let t;
  	let g;
  	let path;
  	let current;

  	path = new Path({
  			props: {
  				points: [/*attacker*/ ctx[0].location, /*defender*/ ctx[1].location],
  				z: /*z*/ ctx[3],
  				fade: false,
  				stroke: `url(#${/*id*/ ctx[6]})`,
  				strokeWidth: (/*didHit*/ ctx[2] ? 0.005 : 0.004) * (/*hovering*/ ctx[5] ? 3 : 1)
  			}
  		});

  	path.$on("enter", /*enter*/ ctx[8]);
  	path.$on("leave", /*leave*/ ctx[9]);

  	return {
  		c() {
  			defs = svg_element("defs");
  			linearGradient = svg_element("linearGradient");
  			stop0 = svg_element("stop");
  			stop1 = svg_element("stop");
  			stop2 = svg_element("stop");
  			stop3 = svg_element("stop");
  			stop4 = svg_element("stop");
  			t = space();
  			g = svg_element("g");
  			create_component(path.$$.fragment);
  			attr(stop0, "offset", "0%");
  			attr(stop0, "stop-color", stop0_stop_color_value = /*didHit*/ ctx[2] ? "yellow" : "rgba(150, 150, 50, .5");
  			attr(stop1, "offset", "10%");
  			attr(stop1, "stop-color", stop1_stop_color_value = /*didHit*/ ctx[2] ? "orange" : "rgba(180, 100, 50, .5");
  			attr(stop2, "offset", "40%");
  			attr(stop2, "stop-color", stop2_stop_color_value = /*didHit*/ ctx[2] ? "red" : "rgba(100, 50, 50, .5");
  			attr(stop3, "offset", "70%");

  			attr(stop3, "stop-color", stop3_stop_color_value = /*didHit*/ ctx[2]
  			? "rgba(255, 0, 0, .8)"
  			: "rgba(50, 50, 50, .5");

  			attr(stop4, "offset", "100%");

  			attr(stop4, "stop-color", stop4_stop_color_value = /*didHit*/ ctx[2]
  			? "rgba(255, 0, 0, .8)"
  			: "transparent");

  			attr(linearGradient, "id", /*id*/ ctx[6]);
  			attr(linearGradient, "x1", /*uvFromAToD*/ ctx[7][0] > 0 ? 0 : 1);
  			attr(linearGradient, "x2", /*uvFromAToD*/ ctx[7][0] > 0 ? 1 : 0);
  			attr(linearGradient, "y1", /*uvFromAToD*/ ctx[7][1] > 0 ? 0 : 1);
  			attr(linearGradient, "y2", /*uvFromAToD*/ ctx[7][1] > 0 ? 1 : 0);
  			attr(linearGradient, "gradientUnits", "objectBoundingBox");
  			set_style(g, "opacity", /*opacity*/ ctx[4]);
  		},
  		m(target, anchor) {
  			insert(target, defs, anchor);
  			append(defs, linearGradient);
  			append(linearGradient, stop0);
  			append(linearGradient, stop1);
  			append(linearGradient, stop2);
  			append(linearGradient, stop3);
  			append(linearGradient, stop4);
  			insert(target, t, anchor);
  			insert(target, g, anchor);
  			mount_component(path, g, null);
  			current = true;
  		},
  		p(ctx, [dirty]) {
  			if (!current || dirty & /*didHit*/ 4 && stop0_stop_color_value !== (stop0_stop_color_value = /*didHit*/ ctx[2] ? "yellow" : "rgba(150, 150, 50, .5")) {
  				attr(stop0, "stop-color", stop0_stop_color_value);
  			}

  			if (!current || dirty & /*didHit*/ 4 && stop1_stop_color_value !== (stop1_stop_color_value = /*didHit*/ ctx[2] ? "orange" : "rgba(180, 100, 50, .5")) {
  				attr(stop1, "stop-color", stop1_stop_color_value);
  			}

  			if (!current || dirty & /*didHit*/ 4 && stop2_stop_color_value !== (stop2_stop_color_value = /*didHit*/ ctx[2] ? "red" : "rgba(100, 50, 50, .5")) {
  				attr(stop2, "stop-color", stop2_stop_color_value);
  			}

  			if (!current || dirty & /*didHit*/ 4 && stop3_stop_color_value !== (stop3_stop_color_value = /*didHit*/ ctx[2]
  			? "rgba(255, 0, 0, .8)"
  			: "rgba(50, 50, 50, .5")) {
  				attr(stop3, "stop-color", stop3_stop_color_value);
  			}

  			if (!current || dirty & /*didHit*/ 4 && stop4_stop_color_value !== (stop4_stop_color_value = /*didHit*/ ctx[2]
  			? "rgba(255, 0, 0, .8)"
  			: "transparent")) {
  				attr(stop4, "stop-color", stop4_stop_color_value);
  			}

  			const path_changes = {};
  			if (dirty & /*attacker, defender*/ 3) path_changes.points = [/*attacker*/ ctx[0].location, /*defender*/ ctx[1].location];
  			if (dirty & /*z*/ 8) path_changes.z = /*z*/ ctx[3];
  			if (dirty & /*didHit, hovering*/ 36) path_changes.strokeWidth = (/*didHit*/ ctx[2] ? 0.005 : 0.004) * (/*hovering*/ ctx[5] ? 3 : 1);
  			path.$set(path_changes);

  			if (!current || dirty & /*opacity*/ 16) {
  				set_style(g, "opacity", /*opacity*/ ctx[4]);
  			}
  		},
  		i(local) {
  			if (current) return;
  			transition_in(path.$$.fragment, local);
  			current = true;
  		},
  		o(local) {
  			transition_out(path.$$.fragment, local);
  			current = false;
  		},
  		d(detaching) {
  			if (detaching) detach(defs);
  			if (detaching) detach(t);
  			if (detaching) detach(g);
  			destroy_component(path);
  		}
  	};
  }

  function angle(x1, y1, x2, y2) {
  	return (Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI + 360) % 360;
  }

  function degreesToUnitVector(degrees) {
  	let rad = Math.PI * degrees / 180;
  	let r = 1;
  	return [r * Math.cos(rad), r * Math.sin(rad)];
  }

  function instance$7($$self, $$props, $$invalidate) {
  	let { attacker } = $$props,
  		{ defender } = $$props,
  		{ didHit } = $$props,
  		{ time } = $$props,
  		{ z = 3 } = $$props,
  		{ weaponId } = $$props;

  	const id = "g" + Math.random();
  	const endTime = 60 * 60 * 1000;
  	let opacity = 1, opacityTimer;

  	const updateOpacity = () => {
  		$$invalidate(4, opacity = Math.max(0.2, Math.min(1, 1 - (Date.now() - time) / endTime * 0.8)));
  	};

  	updateOpacity();
  	opacityTimer = setInterval(updateOpacity, 60 * 1000);

  	onDestroy(() => {
  		clearInterval(opacityTimer);
  	});

  	const uvFromAToD = degreesToUnitVector(angle(...attacker.location, ...defender.location));
  	let hovering;

  	function enter() {
  		$$invalidate(5, hovering = true);

  		popOver.set({
  			type: "attack",
  			name: `🚀${attacker.name} → 🚀${defender.name}`,
  			location: attacker.location,
  			attacker,
  			defender,
  			didHit,
  			time,
  			weaponId
  		});
  	}

  	function leave() {
  		$$invalidate(5, hovering = false);
  		popOver.set();
  	}

  	$$self.$$set = $$props => {
  		if ("attacker" in $$props) $$invalidate(0, attacker = $$props.attacker);
  		if ("defender" in $$props) $$invalidate(1, defender = $$props.defender);
  		if ("didHit" in $$props) $$invalidate(2, didHit = $$props.didHit);
  		if ("time" in $$props) $$invalidate(10, time = $$props.time);
  		if ("z" in $$props) $$invalidate(3, z = $$props.z);
  		if ("weaponId" in $$props) $$invalidate(11, weaponId = $$props.weaponId);
  	};

  	return [
  		attacker,
  		defender,
  		didHit,
  		z,
  		opacity,
  		hovering,
  		id,
  		uvFromAToD,
  		enter,
  		leave,
  		time,
  		weaponId
  	];
  }

  class AttackRemnant extends SvelteComponent {
  	constructor(options) {
  		super();

  		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
  			attacker: 0,
  			defender: 1,
  			didHit: 2,
  			time: 10,
  			z: 3,
  			weaponId: 11
  		});
  	}
  }

  var css_248z$6 = "g.svelte-162pjjz{z-index:1;position:relative}line.svelte-162pjjz{opacity:0.1}text.svelte-162pjjz{opacity:0.4;font-weight:bold}";
  styleInject(css_248z$6);

  /* imageGen/htmlGenerator/src/components/DistanceMarkers.svelte generated by Svelte v3.32.3 */

  function get_each_context$2(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[8] = list[i];
  	return child_ctx;
  }

  function get_each_context_1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[11] = list[i];
  	return child_ctx;
  }

  // (41:2) {#each horizontalMarkersToDraw as y}
  function create_each_block_1(ctx) {
  	let line;
  	let line_x__value;
  	let line_y__value;
  	let line_y__value_1;
  	let line_stroke_width_value;
  	let text_1;
  	let t_value = Math.round(/*y*/ ctx[11] / FLAT_SCALE$2 * /*roundFactor*/ ctx[6]) / /*roundFactor*/ ctx[6] + "";
  	let t;
  	let text_1_x_value;
  	let text_1_y_value;
  	let text_1_font_size_value;

  	return {
  		c() {
  			line = svg_element("line");
  			text_1 = svg_element("text");
  			t = text(t_value);
  			attr(line, "x1", /*left*/ ctx[1]);
  			attr(line, "x2", line_x__value = /*left*/ ctx[1] + /*width*/ ctx[2]);
  			attr(line, "y1", line_y__value = /*y*/ ctx[11]);
  			attr(line, "y2", line_y__value_1 = /*y*/ ctx[11]);
  			attr(line, "stroke", "white");
  			attr(line, "stroke-width", line_stroke_width_value = 0.002 * FLAT_SCALE$2 / /*scale*/ ctx[7]);
  			attr(line, "class", "svelte-162pjjz");
  			attr(text_1, "x", text_1_x_value = /*left*/ ctx[1] + /*width*/ ctx[2] * 0.003);
  			attr(text_1, "y", text_1_y_value = /*y*/ ctx[11] - /*height*/ ctx[3] * 0.01);
  			attr(text_1, "text-anchor", "left");
  			attr(text_1, "font-size", text_1_font_size_value = 0.022 * FLAT_SCALE$2 / /*scale*/ ctx[7]);
  			attr(text_1, "fill", "white");
  			attr(text_1, "class", "svelte-162pjjz");
  		},
  		m(target, anchor) {
  			insert(target, line, anchor);
  			insert(target, text_1, anchor);
  			append(text_1, t);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*left*/ 2) {
  				attr(line, "x1", /*left*/ ctx[1]);
  			}

  			if (dirty & /*left, width*/ 6 && line_x__value !== (line_x__value = /*left*/ ctx[1] + /*width*/ ctx[2])) {
  				attr(line, "x2", line_x__value);
  			}

  			if (dirty & /*horizontalMarkersToDraw*/ 16 && line_y__value !== (line_y__value = /*y*/ ctx[11])) {
  				attr(line, "y1", line_y__value);
  			}

  			if (dirty & /*horizontalMarkersToDraw*/ 16 && line_y__value_1 !== (line_y__value_1 = /*y*/ ctx[11])) {
  				attr(line, "y2", line_y__value_1);
  			}

  			if (dirty & /*scale*/ 128 && line_stroke_width_value !== (line_stroke_width_value = 0.002 * FLAT_SCALE$2 / /*scale*/ ctx[7])) {
  				attr(line, "stroke-width", line_stroke_width_value);
  			}

  			if (dirty & /*horizontalMarkersToDraw, roundFactor*/ 80 && t_value !== (t_value = Math.round(/*y*/ ctx[11] / FLAT_SCALE$2 * /*roundFactor*/ ctx[6]) / /*roundFactor*/ ctx[6] + "")) set_data(t, t_value);

  			if (dirty & /*left, width*/ 6 && text_1_x_value !== (text_1_x_value = /*left*/ ctx[1] + /*width*/ ctx[2] * 0.003)) {
  				attr(text_1, "x", text_1_x_value);
  			}

  			if (dirty & /*horizontalMarkersToDraw, height*/ 24 && text_1_y_value !== (text_1_y_value = /*y*/ ctx[11] - /*height*/ ctx[3] * 0.01)) {
  				attr(text_1, "y", text_1_y_value);
  			}

  			if (dirty & /*scale*/ 128 && text_1_font_size_value !== (text_1_font_size_value = 0.022 * FLAT_SCALE$2 / /*scale*/ ctx[7])) {
  				attr(text_1, "font-size", text_1_font_size_value);
  			}
  		},
  		d(detaching) {
  			if (detaching) detach(line);
  			if (detaching) detach(text_1);
  		}
  	};
  }

  // (61:2) {#each verticalMarkersToDraw as x}
  function create_each_block$2(ctx) {
  	let line;
  	let line_x__value;
  	let line_x__value_1;
  	let line_y__value;
  	let line_stroke_width_value;
  	let text_1;
  	let t_value = Math.round(/*x*/ ctx[8] / FLAT_SCALE$2 * /*roundFactor*/ ctx[6]) / /*roundFactor*/ ctx[6] + "";
  	let t;
  	let text_1_x_value;
  	let text_1_y_value;
  	let text_1_font_size_value;

  	return {
  		c() {
  			line = svg_element("line");
  			text_1 = svg_element("text");
  			t = text(t_value);
  			attr(line, "x1", line_x__value = /*x*/ ctx[8]);
  			attr(line, "x2", line_x__value_1 = /*x*/ ctx[8]);
  			attr(line, "y1", /*top*/ ctx[0]);
  			attr(line, "y2", line_y__value = /*top*/ ctx[0] + /*height*/ ctx[3]);
  			attr(line, "stroke", "white");
  			attr(line, "stroke-width", line_stroke_width_value = 0.002 * FLAT_SCALE$2 / /*scale*/ ctx[7]);
  			attr(line, "class", "svelte-162pjjz");
  			attr(text_1, "x", text_1_x_value = /*x*/ ctx[8] + /*width*/ ctx[2] * 0.003);
  			attr(text_1, "y", text_1_y_value = /*top*/ ctx[0] + /*height*/ ctx[3] * 0.016);
  			attr(text_1, "text-anchor", "left");
  			attr(text_1, "font-size", text_1_font_size_value = 0.022 * FLAT_SCALE$2 / /*scale*/ ctx[7]);
  			attr(text_1, "fill", "white");
  			attr(text_1, "class", "svelte-162pjjz");
  		},
  		m(target, anchor) {
  			insert(target, line, anchor);
  			insert(target, text_1, anchor);
  			append(text_1, t);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*verticalMarkersToDraw*/ 32 && line_x__value !== (line_x__value = /*x*/ ctx[8])) {
  				attr(line, "x1", line_x__value);
  			}

  			if (dirty & /*verticalMarkersToDraw*/ 32 && line_x__value_1 !== (line_x__value_1 = /*x*/ ctx[8])) {
  				attr(line, "x2", line_x__value_1);
  			}

  			if (dirty & /*top*/ 1) {
  				attr(line, "y1", /*top*/ ctx[0]);
  			}

  			if (dirty & /*top, height*/ 9 && line_y__value !== (line_y__value = /*top*/ ctx[0] + /*height*/ ctx[3])) {
  				attr(line, "y2", line_y__value);
  			}

  			if (dirty & /*scale*/ 128 && line_stroke_width_value !== (line_stroke_width_value = 0.002 * FLAT_SCALE$2 / /*scale*/ ctx[7])) {
  				attr(line, "stroke-width", line_stroke_width_value);
  			}

  			if (dirty & /*verticalMarkersToDraw, roundFactor*/ 96 && t_value !== (t_value = Math.round(/*x*/ ctx[8] / FLAT_SCALE$2 * /*roundFactor*/ ctx[6]) / /*roundFactor*/ ctx[6] + "")) set_data(t, t_value);

  			if (dirty & /*verticalMarkersToDraw, width*/ 36 && text_1_x_value !== (text_1_x_value = /*x*/ ctx[8] + /*width*/ ctx[2] * 0.003)) {
  				attr(text_1, "x", text_1_x_value);
  			}

  			if (dirty & /*top, height*/ 9 && text_1_y_value !== (text_1_y_value = /*top*/ ctx[0] + /*height*/ ctx[3] * 0.016)) {
  				attr(text_1, "y", text_1_y_value);
  			}

  			if (dirty & /*scale*/ 128 && text_1_font_size_value !== (text_1_font_size_value = 0.022 * FLAT_SCALE$2 / /*scale*/ ctx[7])) {
  				attr(text_1, "font-size", text_1_font_size_value);
  			}
  		},
  		d(detaching) {
  			if (detaching) detach(line);
  			if (detaching) detach(text_1);
  		}
  	};
  }

  function create_fragment$8(ctx) {
  	let g;
  	let each0_anchor;
  	let each_value_1 = /*horizontalMarkersToDraw*/ ctx[4];
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_1.length; i += 1) {
  		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  	}

  	let each_value = /*verticalMarkersToDraw*/ ctx[5];
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
  	}

  	return {
  		c() {
  			g = svg_element("g");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			each0_anchor = empty();

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			attr(g, "class", "distancemarkers svelte-162pjjz");
  		},
  		m(target, anchor) {
  			insert(target, g, anchor);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(g, null);
  			}

  			append(g, each0_anchor);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(g, null);
  			}
  		},
  		p(ctx, [dirty]) {
  			if (dirty & /*left, width, horizontalMarkersToDraw, height, FLAT_SCALE, scale, Math, roundFactor*/ 222) {
  				each_value_1 = /*horizontalMarkersToDraw*/ ctx[4];
  				let i;

  				for (i = 0; i < each_value_1.length; i += 1) {
  					const child_ctx = get_each_context_1(ctx, each_value_1, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  					} else {
  						each_blocks_1[i] = create_each_block_1(child_ctx);
  						each_blocks_1[i].c();
  						each_blocks_1[i].m(g, each0_anchor);
  					}
  				}

  				for (; i < each_blocks_1.length; i += 1) {
  					each_blocks_1[i].d(1);
  				}

  				each_blocks_1.length = each_value_1.length;
  			}

  			if (dirty & /*verticalMarkersToDraw, width, top, height, FLAT_SCALE, scale, Math, roundFactor*/ 237) {
  				each_value = /*verticalMarkersToDraw*/ ctx[5];
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$2(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block$2(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(g, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}
  		},
  		i: noop,
  		o: noop,
  		d(detaching) {
  			if (detaching) detach(g);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  		}
  	};
  }

  const FLAT_SCALE$2 = 100;

  function instance$8($$self, $$props, $$invalidate) {
  	let scale$1;

  	scale.subscribe(value => {
  		$$invalidate(7, scale$1 = value);
  	});

  	let { top } = $$props,
  		{ left } = $$props,
  		{ width } = $$props,
  		{ height } = $$props;

  	let horizontalMarkersToDraw = [], verticalMarkersToDraw = [], roundFactor = 1;

  	$$self.$$set = $$props => {
  		if ("top" in $$props) $$invalidate(0, top = $$props.top);
  		if ("left" in $$props) $$invalidate(1, left = $$props.left);
  		if ("width" in $$props) $$invalidate(2, width = $$props.width);
  		if ("height" in $$props) $$invalidate(3, height = $$props.height);
  	};

  	$$self.$$.update = () => {
  		if ($$self.$$.dirty & /*width, height, roundFactor, left, top, horizontalMarkersToDraw, verticalMarkersToDraw*/ 127) {
  			if (width) {
  				let auBetweenLines = 1 / 2 ** 8;
  				const diameter = Math.max(width, height);
  				while (auBetweenLines / diameter < 0.15) auBetweenLines *= 2;
  				$$invalidate(6, roundFactor = 1);
  				while (Math.abs(Math.round(auBetweenLines * roundFactor)) < 1) $$invalidate(6, roundFactor *= 10);
  				$$invalidate(6, roundFactor *= 100);
  				$$invalidate(4, horizontalMarkersToDraw = []);
  				$$invalidate(5, verticalMarkersToDraw = []);
  				const center = [left + width / 2, top + height / 2];
  				horizontalMarkersToDraw.push(center[1]);
  				verticalMarkersToDraw.push(center[0]);

  				for (let i = 1; i < 4; i++) {
  					horizontalMarkersToDraw.push(center[1] + auBetweenLines * i);
  					verticalMarkersToDraw.push(center[0] + auBetweenLines * i);
  					horizontalMarkersToDraw.push(center[1] - auBetweenLines * i);
  					verticalMarkersToDraw.push(center[0] - auBetweenLines * i);
  				}
  			}
  		}
  	};

  	return [
  		top,
  		left,
  		width,
  		height,
  		horizontalMarkersToDraw,
  		verticalMarkersToDraw,
  		roundFactor,
  		scale$1
  	];
  }

  class DistanceMarkers extends SvelteComponent {
  	constructor(options) {
  		super();
  		init(this, options, instance$8, create_fragment$8, safe_not_equal, { top: 0, left: 1, width: 2, height: 3 });
  	}
  }

  var css_248z$7 = ":root{--main-width:100%;--main-height:100%;--text-size:12px}.holder.svelte-jfc4vm{--main-width:100%;--main-height:100%;--text-size:12px;width:100%;height:100%;position:relative;z-index:2;user-select:none}svg.svelte-jfc4vm{width:100%;height:100%}";
  styleInject(css_248z$7);

  /* imageGen/htmlGenerator/src/godView.svelte generated by Svelte v3.32.3 */

  function get_each_context$3(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[17] = list[i];
  	return child_ctx;
  }

  function get_each_context_1$1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[20] = list[i];
  	return child_ctx;
  }

  function get_each_context_2(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[20] = list[i];
  	return child_ctx;
  }

  function get_each_context_3(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[20] = list[i];
  	return child_ctx;
  }

  // (212:4) {#each points.filter((p) => p.type === 'planet') as point}
  function create_each_block_3(ctx) {
  	let planet;
  	let current;
  	const planet_spread_levels = [/*point*/ ctx[20]];
  	let planet_props = {};

  	for (let i = 0; i < planet_spread_levels.length; i += 1) {
  		planet_props = assign(planet_props, planet_spread_levels[i]);
  	}

  	planet = new Planet({ props: planet_props });

  	return {
  		c() {
  			create_component(planet.$$.fragment);
  		},
  		m(target, anchor) {
  			mount_component(planet, target, anchor);
  			current = true;
  		},
  		p(ctx, dirty) {
  			const planet_changes = (dirty & /*points*/ 8)
  			? get_spread_update(planet_spread_levels, [get_spread_object(/*point*/ ctx[20])])
  			: {};

  			planet.$set(planet_changes);
  		},
  		i(local) {
  			if (current) return;
  			transition_in(planet.$$.fragment, local);
  			current = true;
  		},
  		o(local) {
  			transition_out(planet.$$.fragment, local);
  			current = false;
  		},
  		d(detaching) {
  			destroy_component(planet, detaching);
  		}
  	};
  }

  // (216:4) {#each points.filter((p) => p.type === 'ship') as point}
  function create_each_block_2(ctx) {
  	let ship;
  	let current;
  	const ship_spread_levels = [/*point*/ ctx[20]];
  	let ship_props = {};

  	for (let i = 0; i < ship_spread_levels.length; i += 1) {
  		ship_props = assign(ship_props, ship_spread_levels[i]);
  	}

  	ship = new Ship({ props: ship_props });

  	return {
  		c() {
  			create_component(ship.$$.fragment);
  		},
  		m(target, anchor) {
  			mount_component(ship, target, anchor);
  			current = true;
  		},
  		p(ctx, dirty) {
  			const ship_changes = (dirty & /*points*/ 8)
  			? get_spread_update(ship_spread_levels, [get_spread_object(/*point*/ ctx[20])])
  			: {};

  			ship.$set(ship_changes);
  		},
  		i(local) {
  			if (current) return;
  			transition_in(ship.$$.fragment, local);
  			current = true;
  		},
  		o(local) {
  			transition_out(ship.$$.fragment, local);
  			current = false;
  		},
  		d(detaching) {
  			destroy_component(ship, detaching);
  		}
  	};
  }

  // (220:4) {#each points.filter((p) => p.type === 'cache') as point}
  function create_each_block_1$1(ctx) {
  	let cache;
  	let current;
  	const cache_spread_levels = [/*point*/ ctx[20]];
  	let cache_props = {};

  	for (let i = 0; i < cache_spread_levels.length; i += 1) {
  		cache_props = assign(cache_props, cache_spread_levels[i]);
  	}

  	cache = new Cache({ props: cache_props });

  	return {
  		c() {
  			create_component(cache.$$.fragment);
  		},
  		m(target, anchor) {
  			mount_component(cache, target, anchor);
  			current = true;
  		},
  		p(ctx, dirty) {
  			const cache_changes = (dirty & /*points*/ 8)
  			? get_spread_update(cache_spread_levels, [get_spread_object(/*point*/ ctx[20])])
  			: {};

  			cache.$set(cache_changes);
  		},
  		i(local) {
  			if (current) return;
  			transition_in(cache.$$.fragment, local);
  			current = true;
  		},
  		o(local) {
  			transition_out(cache.$$.fragment, local);
  			current = false;
  		},
  		d(detaching) {
  			destroy_component(cache, detaching);
  		}
  	};
  }

  // (224:4) {#each attackRemnants as attack}
  function create_each_block$3(ctx) {
  	let attackremnant;
  	let current;
  	const attackremnant_spread_levels = [/*attack*/ ctx[17]];
  	let attackremnant_props = {};

  	for (let i = 0; i < attackremnant_spread_levels.length; i += 1) {
  		attackremnant_props = assign(attackremnant_props, attackremnant_spread_levels[i]);
  	}

  	attackremnant = new AttackRemnant({ props: attackremnant_props });

  	return {
  		c() {
  			create_component(attackremnant.$$.fragment);
  		},
  		m(target, anchor) {
  			mount_component(attackremnant, target, anchor);
  			current = true;
  		},
  		p(ctx, dirty) {
  			const attackremnant_changes = (dirty & /*attackRemnants*/ 4)
  			? get_spread_update(attackremnant_spread_levels, [get_spread_object(/*attack*/ ctx[17])])
  			: {};

  			attackremnant.$set(attackremnant_changes);
  		},
  		i(local) {
  			if (current) return;
  			transition_in(attackremnant.$$.fragment, local);
  			current = true;
  		},
  		o(local) {
  			transition_out(attackremnant.$$.fragment, local);
  			current = false;
  		},
  		d(detaching) {
  			destroy_component(attackremnant, detaching);
  		}
  	};
  }

  function create_fragment$9(ctx) {
  	let starfield;
  	let t0;
  	let popover;
  	let t1;
  	let div;
  	let svg;
  	let distancemarkers;
  	let each0_anchor;
  	let each1_anchor;
  	let each2_anchor;
  	let svg_viewBox_value;
  	let current;
  	starfield = new Starfield({});
  	popover = new PopOver({});
  	const distancemarkers_spread_levels = [/*view*/ ctx[0]];
  	let distancemarkers_props = {};

  	for (let i = 0; i < distancemarkers_spread_levels.length; i += 1) {
  		distancemarkers_props = assign(distancemarkers_props, distancemarkers_spread_levels[i]);
  	}

  	distancemarkers = new DistanceMarkers({ props: distancemarkers_props });
  	let each_value_3 = /*points*/ ctx[3].filter(func);
  	let each_blocks_3 = [];

  	for (let i = 0; i < each_value_3.length; i += 1) {
  		each_blocks_3[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
  	}

  	const out = i => transition_out(each_blocks_3[i], 1, 1, () => {
  		each_blocks_3[i] = null;
  	});

  	let each_value_2 = /*points*/ ctx[3].filter(func_1);
  	let each_blocks_2 = [];

  	for (let i = 0; i < each_value_2.length; i += 1) {
  		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
  	}

  	const out_1 = i => transition_out(each_blocks_2[i], 1, 1, () => {
  		each_blocks_2[i] = null;
  	});

  	let each_value_1 = /*points*/ ctx[3].filter(func_2);
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_1.length; i += 1) {
  		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
  	}

  	const out_2 = i => transition_out(each_blocks_1[i], 1, 1, () => {
  		each_blocks_1[i] = null;
  	});

  	let each_value = /*attackRemnants*/ ctx[2];
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
  	}

  	const out_3 = i => transition_out(each_blocks[i], 1, 1, () => {
  		each_blocks[i] = null;
  	});

  	return {
  		c() {
  			create_component(starfield.$$.fragment);
  			t0 = space();
  			create_component(popover.$$.fragment);
  			t1 = space();
  			div = element("div");
  			svg = svg_element("svg");
  			create_component(distancemarkers.$$.fragment);

  			for (let i = 0; i < each_blocks_3.length; i += 1) {
  				each_blocks_3[i].c();
  			}

  			each0_anchor = empty();

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].c();
  			}

  			each1_anchor = empty();

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			each2_anchor = empty();

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			attr(svg, "viewBox", svg_viewBox_value = "" + (/*view*/ ctx[0].left + " " + /*view*/ ctx[0].top + " " + /*view*/ ctx[0].width + " " + /*view*/ ctx[0].height));
  			attr(svg, "class", "svelte-jfc4vm");
  			attr(div, "class", "holder svelte-jfc4vm");
  		},
  		m(target, anchor) {
  			mount_component(starfield, target, anchor);
  			insert(target, t0, anchor);
  			mount_component(popover, target, anchor);
  			insert(target, t1, anchor);
  			insert(target, div, anchor);
  			append(div, svg);
  			mount_component(distancemarkers, svg, null);

  			for (let i = 0; i < each_blocks_3.length; i += 1) {
  				each_blocks_3[i].m(svg, null);
  			}

  			append(svg, each0_anchor);

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				each_blocks_2[i].m(svg, null);
  			}

  			append(svg, each1_anchor);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(svg, null);
  			}

  			append(svg, each2_anchor);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(svg, null);
  			}

  			/*svg_binding*/ ctx[4](svg);
  			current = true;
  		},
  		p(ctx, [dirty]) {
  			const distancemarkers_changes = (dirty & /*view*/ 1)
  			? get_spread_update(distancemarkers_spread_levels, [get_spread_object(/*view*/ ctx[0])])
  			: {};

  			distancemarkers.$set(distancemarkers_changes);

  			if (dirty & /*points*/ 8) {
  				each_value_3 = /*points*/ ctx[3].filter(func);
  				let i;

  				for (i = 0; i < each_value_3.length; i += 1) {
  					const child_ctx = get_each_context_3(ctx, each_value_3, i);

  					if (each_blocks_3[i]) {
  						each_blocks_3[i].p(child_ctx, dirty);
  						transition_in(each_blocks_3[i], 1);
  					} else {
  						each_blocks_3[i] = create_each_block_3(child_ctx);
  						each_blocks_3[i].c();
  						transition_in(each_blocks_3[i], 1);
  						each_blocks_3[i].m(svg, each0_anchor);
  					}
  				}

  				group_outros();

  				for (i = each_value_3.length; i < each_blocks_3.length; i += 1) {
  					out(i);
  				}

  				check_outros();
  			}

  			if (dirty & /*points*/ 8) {
  				each_value_2 = /*points*/ ctx[3].filter(func_1);
  				let i;

  				for (i = 0; i < each_value_2.length; i += 1) {
  					const child_ctx = get_each_context_2(ctx, each_value_2, i);

  					if (each_blocks_2[i]) {
  						each_blocks_2[i].p(child_ctx, dirty);
  						transition_in(each_blocks_2[i], 1);
  					} else {
  						each_blocks_2[i] = create_each_block_2(child_ctx);
  						each_blocks_2[i].c();
  						transition_in(each_blocks_2[i], 1);
  						each_blocks_2[i].m(svg, each1_anchor);
  					}
  				}

  				group_outros();

  				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
  					out_1(i);
  				}

  				check_outros();
  			}

  			if (dirty & /*points*/ 8) {
  				each_value_1 = /*points*/ ctx[3].filter(func_2);
  				let i;

  				for (i = 0; i < each_value_1.length; i += 1) {
  					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  						transition_in(each_blocks_1[i], 1);
  					} else {
  						each_blocks_1[i] = create_each_block_1$1(child_ctx);
  						each_blocks_1[i].c();
  						transition_in(each_blocks_1[i], 1);
  						each_blocks_1[i].m(svg, each2_anchor);
  					}
  				}

  				group_outros();

  				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
  					out_2(i);
  				}

  				check_outros();
  			}

  			if (dirty & /*attackRemnants*/ 4) {
  				each_value = /*attackRemnants*/ ctx[2];
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$3(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  						transition_in(each_blocks[i], 1);
  					} else {
  						each_blocks[i] = create_each_block$3(child_ctx);
  						each_blocks[i].c();
  						transition_in(each_blocks[i], 1);
  						each_blocks[i].m(svg, null);
  					}
  				}

  				group_outros();

  				for (i = each_value.length; i < each_blocks.length; i += 1) {
  					out_3(i);
  				}

  				check_outros();
  			}

  			if (!current || dirty & /*view*/ 1 && svg_viewBox_value !== (svg_viewBox_value = "" + (/*view*/ ctx[0].left + " " + /*view*/ ctx[0].top + " " + /*view*/ ctx[0].width + " " + /*view*/ ctx[0].height))) {
  				attr(svg, "viewBox", svg_viewBox_value);
  			}
  		},
  		i(local) {
  			if (current) return;
  			transition_in(starfield.$$.fragment, local);
  			transition_in(popover.$$.fragment, local);
  			transition_in(distancemarkers.$$.fragment, local);

  			for (let i = 0; i < each_value_3.length; i += 1) {
  				transition_in(each_blocks_3[i]);
  			}

  			for (let i = 0; i < each_value_2.length; i += 1) {
  				transition_in(each_blocks_2[i]);
  			}

  			for (let i = 0; i < each_value_1.length; i += 1) {
  				transition_in(each_blocks_1[i]);
  			}

  			for (let i = 0; i < each_value.length; i += 1) {
  				transition_in(each_blocks[i]);
  			}

  			current = true;
  		},
  		o(local) {
  			transition_out(starfield.$$.fragment, local);
  			transition_out(popover.$$.fragment, local);
  			transition_out(distancemarkers.$$.fragment, local);
  			each_blocks_3 = each_blocks_3.filter(Boolean);

  			for (let i = 0; i < each_blocks_3.length; i += 1) {
  				transition_out(each_blocks_3[i]);
  			}

  			each_blocks_2 = each_blocks_2.filter(Boolean);

  			for (let i = 0; i < each_blocks_2.length; i += 1) {
  				transition_out(each_blocks_2[i]);
  			}

  			each_blocks_1 = each_blocks_1.filter(Boolean);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				transition_out(each_blocks_1[i]);
  			}

  			each_blocks = each_blocks.filter(Boolean);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				transition_out(each_blocks[i]);
  			}

  			current = false;
  		},
  		d(detaching) {
  			destroy_component(starfield, detaching);
  			if (detaching) detach(t0);
  			destroy_component(popover, detaching);
  			if (detaching) detach(t1);
  			if (detaching) detach(div);
  			destroy_component(distancemarkers);
  			destroy_each(each_blocks_3, detaching);
  			destroy_each(each_blocks_2, detaching);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			/*svg_binding*/ ctx[4](null);
  		}
  	};
  }

  const FLAT_SCALE$3 = 100;
  const KM_PER_AU = 149597900;
  const func = p => p.type === "planet";
  const func_1 = p => p.type === "ship";
  const func_2 = p => p.type === "cache";

  function instance$9($$self, $$props, $$invalidate) {
  	let updateMs$1;
  	updateMs.subscribe(value => updateMs$1 = value);
  	let view$1;
  	view.subscribe(value => $$invalidate(0, view$1 = value));
  	let scale$1;
  	scale.subscribe(value => scale$1 = value);

  	// get game data periodically -------------------------------------------
  	let gameData;

  	async function getGameData() {
  		const res = await fetch("/game");
  		gameData = await res.json();
  		console.log(gameData);
  		redraw(gameData);
  	}

  	onMount(getGameData);
  	setInterval(getGameData, updateMs$1);
  	let maxView = { left: 0, top: 0, width: 1, height: 1 };
  	let svgElement;
  	let ships = [], planets = [], caches = [], attackRemnants = [], points = [];

  	function redraw(data) {
  		ships = data.guilds.map(g => g.ship);
  		planets = data.planets;
  		caches = data.caches;
  		$$invalidate(2, attackRemnants = data.attackRemnants);

  		$$invalidate(3, points = [
  			...planets.map(el => ({
  				type: "planet",
  				location: el.location,
  				radius: el.radius / KM_PER_AU,
  				minSize: 0.01,
  				color: el.validColor || el.color,
  				name: el.name
  			})),
  			...caches.map(el => ({
  				type: "cache",
  				location: el.location,
  				color: "yellow"
  			})),
  			...ships.map(el => ({
  				type: "ship",
  				location: el.location,
  				name: el.name,
  				shipData: el
  			}))
  		]);

  		points.forEach(el => el.location[1] *= -1); // flip y values since svg counts up from the top down

  		$$invalidate(2, attackRemnants = attackRemnants.map(ar => {
  			const targetJiggle = ar.didHit
  			? [0, 0]
  			: ar.attacker.location.map((coord, index) => {
  					const randomButStableNumber = Math.round((coord + ar.defender.location[index]) * 100000000) % 10;
  					return randomButStableNumber * 0.000001;
  				});

  			return {
  				type: "attackRemnant",
  				z: 5,
  				...ar,
  				attacker: {
  					...ar.attacker,
  					location: [ar.attacker.location[0], ar.attacker.location[1] * -1]
  				},
  				defender: {
  					...ar.defender,
  					location: [
  						ar.defender.location[0] + targetJiggle[0],
  						ar.defender.location[1] * -1 + targetJiggle[1]
  					]
  				}
  			};
  		}));

  		console.log(attackRemnants);
  		const maxes = common.getMaxes(points.map(p => p.location));
  		Object.keys(maxes).forEach(k => maxes[k] *= FLAT_SCALE$3);
  		const windowAspectRatio = window.innerWidth / window.innerHeight;
  		const hardBuffer = 0.01;
  		const softBuffer = 0.05 * Math.max(maxes.width, maxes.height);
  		const buffer = hardBuffer + softBuffer;
  		maxView.left = maxes.left - buffer;
  		maxView.top = maxes.bottom - buffer;
  		maxView.width = maxes.width;
  		maxView.height = maxes.height;
  		maxView.width += buffer * 2;
  		maxView.height += buffer * 2;
  		const viewAspectRatio = maxView.width / maxView.height;
  		const aspectRatioDifferencePercent = viewAspectRatio / windowAspectRatio;

  		if (aspectRatioDifferencePercent > 1) {
  			maxView.top -= maxView.height * (aspectRatioDifferencePercent - 1) / 2;
  			maxView.height = maxView.width / windowAspectRatio;
  		}

  		if (aspectRatioDifferencePercent < 1) {
  			maxView.left -= maxView.width * (1 - aspectRatioDifferencePercent) / 2;
  			maxView.width = maxView.height * windowAspectRatio;
  		}

  		if (view$1.width === 0) view.set({ ...maxView });
  	}

  	// set up mouse interaction ------------------------------------
  	let isPanning = false, startPoint, endPoint;

  	onMount(() => {
  		$$invalidate(
  			1,
  			svgElement.onmousewheel = e => {
  				e.preventDefault();
  				if (scale$1 <= 0.1 && e.deltaY > 0) return;
  				if (scale$1 > 8000 && e.deltaY < 0) return;
  				const dw = view$1.width * e.deltaY * 0.03;
  				const dh = view$1.height * e.deltaY * 0.03;
  				const elBCR = svgElement.getBoundingClientRect();
  				const mx = e.offsetX / elBCR.width;
  				const my = e.offsetY / elBCR.height;
  				const dx = dw * -1 * mx;
  				const dy = dh * -1 * my;

  				view.set({
  					left: view$1.left + dx,
  					top: view$1.top + dy,
  					width: view$1.width + dw,
  					height: view$1.height + dh
  				});

  				scale.set(maxView.width / view$1.width);
  			},
  			svgElement
  		);

  		$$invalidate(
  			1,
  			svgElement.onmousedown = function (e) {
  				isPanning = true;
  				startPoint = [e.x, e.y];
  			},
  			svgElement
  		);

  		$$invalidate(
  			1,
  			svgElement.onmousemove = function (e) {
  				if (!isPanning) return;
  				const elBCR = svgElement.getBoundingClientRect();
  				endPoint = [e.x, e.y];
  				const dx = (startPoint[0] - endPoint[0]) / elBCR.width * view$1.width;
  				const dy = (startPoint[1] - endPoint[1]) / elBCR.height * view$1.height;

  				view.set({
  					left: view$1.left + dx,
  					top: view$1.top + dy,
  					width: view$1.width,
  					height: view$1.height
  				});

  				startPoint = [e.x, e.y];
  			},
  			svgElement
  		);

  		$$invalidate(
  			1,
  			svgElement.onmouseup = function (e) {
  				isPanning = false;
  			},
  			svgElement
  		);

  		$$invalidate(
  			1,
  			svgElement.onmouseleave = function (e) {
  				isPanning = false;
  			},
  			svgElement
  		);
  	});

  	function svg_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			svgElement = $$value;
  			$$invalidate(1, svgElement);
  		});
  	}

  	return [view$1, svgElement, attackRemnants, points, svg_binding];
  }

  class GodView extends SvelteComponent {
  	constructor(options) {
  		super();
  		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});
  	}
  }

  const app = new GodView({
        target: document.body
      });

  return app;

}());
