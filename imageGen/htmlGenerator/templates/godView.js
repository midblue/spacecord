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

  var css_248z = ":root {\n  --main-width: 750px;\n  --main-height: var(--main-width);\n\n  --text-size: 24px;\n  --text-size-small: calc(var(--text-size) * 0.75);\n  --text-size-tiny: calc(var(--text-size) * 0.6);\n\n  --font-stack: 'Avenir', monospace;\n\n  --bg: #001100;\n  --bg-rgb: 0, 17, 0;\n\n  --ui: #0f0;\n}\n\nhtml {\n  font-family: var(--font-stack);\n  font-size: var(--text-size);\n  line-height: 1;\n}\n\nbody {\n  width: var(--main-width);\n  height: var(--main-height);\n  margin: 0;\n\n  display: flex;\n  align-items: center;\n  justify-content: center;\n\n  background: var(--bg);\n  color: var(--ui);\n}\n\n* {\n  box-sizing: border-box;\n}\n\n.minilabel {\n  font-weight: bold;\n  text-transform: uppercase;\n  font-size: var(--text-size-small);\n}\n";
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
  			ctx.fillStyle = "rgba(255,255,255,.7)"; //color
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

  var css_248z$2 = "text.svelte-7s7f2u{text-transform:uppercase;font-weight:bold;opacity:0.5}";
  styleInject(css_248z$2);

  /* imageGen/htmlGenerator/src/components/Point.svelte generated by Svelte v3.32.3 */

  function create_if_block(ctx) {
  	let text_1;
  	let t;
  	let text_1_x_value;
  	let text_1_y_value;
  	let text_1_font_size_value;
  	let text_1_fill_value;

  	return {
  		c() {
  			text_1 = svg_element("text");
  			t = text(/*name*/ ctx[3]);
  			attr(text_1, "x", text_1_x_value = /*location*/ ctx[0][0]);
  			attr(text_1, "y", text_1_y_value = /*location*/ ctx[0][1] + Math.max(0.005 / /*scale*/ ctx[4], /*radius*/ ctx[1]) * -2);
  			attr(text_1, "text-anchor", "middle");
  			attr(text_1, "font-size", text_1_font_size_value = 0.03 / /*scale*/ ctx[4]);
  			attr(text_1, "fill", text_1_fill_value = /*color*/ ctx[2] || "white");
  			attr(text_1, "class", "svelte-7s7f2u");
  		},
  		m(target, anchor) {
  			insert(target, text_1, anchor);
  			append(text_1, t);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*name*/ 8) set_data(t, /*name*/ ctx[3]);

  			if (dirty & /*location*/ 1 && text_1_x_value !== (text_1_x_value = /*location*/ ctx[0][0])) {
  				attr(text_1, "x", text_1_x_value);
  			}

  			if (dirty & /*location, scale, radius*/ 19 && text_1_y_value !== (text_1_y_value = /*location*/ ctx[0][1] + Math.max(0.005 / /*scale*/ ctx[4], /*radius*/ ctx[1]) * -2)) {
  				attr(text_1, "y", text_1_y_value);
  			}

  			if (dirty & /*scale*/ 16 && text_1_font_size_value !== (text_1_font_size_value = 0.03 / /*scale*/ ctx[4])) {
  				attr(text_1, "font-size", text_1_font_size_value);
  			}

  			if (dirty & /*color*/ 4 && text_1_fill_value !== (text_1_fill_value = /*color*/ ctx[2] || "white")) {
  				attr(text_1, "fill", text_1_fill_value);
  			}
  		},
  		d(detaching) {
  			if (detaching) detach(text_1);
  		}
  	};
  }

  function create_fragment$1(ctx) {
  	let g;
  	let circle;
  	let circle_cx_value;
  	let circle_cy_value;
  	let circle_r_value;
  	let circle_fill_value;
  	let if_block = /*name*/ ctx[3] && /*scale*/ ctx[4] >= 0.9 && create_if_block(ctx);

  	return {
  		c() {
  			g = svg_element("g");
  			circle = svg_element("circle");
  			if (if_block) if_block.c();
  			attr(circle, "cx", circle_cx_value = /*location*/ ctx[0][0]);
  			attr(circle, "cy", circle_cy_value = /*location*/ ctx[0][1]);
  			attr(circle, "r", circle_r_value = Math.max(0.005 / /*scale*/ ctx[4], /*radius*/ ctx[1]));
  			attr(circle, "fill", circle_fill_value = /*color*/ ctx[2] || "white");
  			attr(g, "class", "point");
  		},
  		m(target, anchor) {
  			insert(target, g, anchor);
  			append(g, circle);
  			if (if_block) if_block.m(g, null);
  		},
  		p(ctx, [dirty]) {
  			if (dirty & /*location*/ 1 && circle_cx_value !== (circle_cx_value = /*location*/ ctx[0][0])) {
  				attr(circle, "cx", circle_cx_value);
  			}

  			if (dirty & /*location*/ 1 && circle_cy_value !== (circle_cy_value = /*location*/ ctx[0][1])) {
  				attr(circle, "cy", circle_cy_value);
  			}

  			if (dirty & /*scale, radius*/ 18 && circle_r_value !== (circle_r_value = Math.max(0.005 / /*scale*/ ctx[4], /*radius*/ ctx[1]))) {
  				attr(circle, "r", circle_r_value);
  			}

  			if (dirty & /*color*/ 4 && circle_fill_value !== (circle_fill_value = /*color*/ ctx[2] || "white")) {
  				attr(circle, "fill", circle_fill_value);
  			}

  			if (/*name*/ ctx[3] && /*scale*/ ctx[4] >= 0.9) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  				} else {
  					if_block = create_if_block(ctx);
  					if_block.c();
  					if_block.m(g, null);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}
  		},
  		i: noop,
  		o: noop,
  		d(detaching) {
  			if (detaching) detach(g);
  			if (if_block) if_block.d();
  		}
  	};
  }

  function instance$1($$self, $$props, $$invalidate) {
  	let scale$1;

  	scale.subscribe(value => {
  		$$invalidate(4, scale$1 = value);
  	});

  	let { location } = $$props,
  		{ radius = 0 } = $$props,
  		{ color } = $$props,
  		{ name } = $$props;

  	$$self.$$set = $$props => {
  		if ("location" in $$props) $$invalidate(0, location = $$props.location);
  		if ("radius" in $$props) $$invalidate(1, radius = $$props.radius);
  		if ("color" in $$props) $$invalidate(2, color = $$props.color);
  		if ("name" in $$props) $$invalidate(3, name = $$props.name);
  	};

  	return [location, radius, color, name, scale$1];
  }

  class Point extends SvelteComponent {
  	constructor(options) {
  		super();

  		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
  			location: 0,
  			radius: 1,
  			color: 2,
  			name: 3
  		});
  	}
  }

  /* imageGen/htmlGenerator/src/components/Path.svelte generated by Svelte v3.32.3 */

  function get_each_context(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[5] = list[i];
  	return child_ctx;
  }

  // (33:2) {#each lines as line}
  function create_each_block(ctx) {
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
  			attr(line, "x1", line_x__value = /*line*/ ctx[5].from[0]);
  			attr(line, "y1", line_y__value = /*line*/ ctx[5].from[1]);
  			attr(line, "x2", line_x__value_1 = /*line*/ ctx[5].to[0]);
  			attr(line, "y2", line_y__value_1 = /*line*/ ctx[5].to[1]);
  			attr(line, "stroke", line_stroke_value = /*line*/ ctx[5].color);
  			attr(line, "stroke-width", line_stroke_width_value = 0.0035 / /*scale*/ ctx[1]);
  		},
  		m(target, anchor) {
  			insert(target, line, anchor);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*lines*/ 1 && line_x__value !== (line_x__value = /*line*/ ctx[5].from[0])) {
  				attr(line, "x1", line_x__value);
  			}

  			if (dirty & /*lines*/ 1 && line_y__value !== (line_y__value = /*line*/ ctx[5].from[1])) {
  				attr(line, "y1", line_y__value);
  			}

  			if (dirty & /*lines*/ 1 && line_x__value_1 !== (line_x__value_1 = /*line*/ ctx[5].to[0])) {
  				attr(line, "x2", line_x__value_1);
  			}

  			if (dirty & /*lines*/ 1 && line_y__value_1 !== (line_y__value_1 = /*line*/ ctx[5].to[1])) {
  				attr(line, "y2", line_y__value_1);
  			}

  			if (dirty & /*lines*/ 1 && line_stroke_value !== (line_stroke_value = /*line*/ ctx[5].color)) {
  				attr(line, "stroke", line_stroke_value);
  			}

  			if (dirty & /*scale*/ 2 && line_stroke_width_value !== (line_stroke_width_value = 0.0035 / /*scale*/ ctx[1])) {
  				attr(line, "stroke-width", line_stroke_width_value);
  			}
  		},
  		d(detaching) {
  			if (detaching) detach(line);
  		}
  	};
  }

  function create_fragment$2(ctx) {
  	let g;
  	let each_value = /*lines*/ ctx[0];
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  	}

  	return {
  		c() {
  			g = svg_element("g");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			attr(g, "class", "path");
  		},
  		m(target, anchor) {
  			insert(target, g, anchor);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(g, null);
  			}
  		},
  		p(ctx, [dirty]) {
  			if (dirty & /*lines, scale*/ 3) {
  				each_value = /*lines*/ ctx[0];
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block(child_ctx);
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
  			destroy_each(each_blocks, detaching);
  		}
  	};
  }

  function instance$2($$self, $$props, $$invalidate) {
  	let scale$1;
  	scale.subscribe(value => $$invalidate(1, scale$1 = value));
  	let { points = [] } = $$props;
  	let { colorRgb = "255,255,255" } = $$props;
  	let { fade = true } = $$props;
  	let lines = [];

  	$$self.$$set = $$props => {
  		if ("points" in $$props) $$invalidate(2, points = $$props.points);
  		if ("colorRgb" in $$props) $$invalidate(3, colorRgb = $$props.colorRgb);
  		if ("fade" in $$props) $$invalidate(4, fade = $$props.fade);
  	};

  	$$self.$$.update = () => {
  		if ($$self.$$.dirty & /*points, colorRgb, fade, lines*/ 29) {
  			{
  				$$invalidate(0, lines = [
  					...points.map((l, index) => ({
  						location: l,
  						color: `rgba(${colorRgb}, ${fade ? 0.7 * (index / points.length) : 0.15})`
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
  			}
  		}
  	};

  	return [lines, scale$1, points, colorRgb, fade];
  }

  class Path extends SvelteComponent {
  	constructor(options) {
  		super();
  		init(this, options, instance$2, create_fragment$2, safe_not_equal, { points: 2, colorRgb: 3, fade: 4 });
  	}
  }

  var css_248z$3 = "line.svelte-15ps2zj{opacity:0.1}text.svelte-15ps2zj{opacity:0.4;font-weight:bold}";
  styleInject(css_248z$3);

  /* imageGen/htmlGenerator/src/components/DistanceMarkers.svelte generated by Svelte v3.32.3 */

  function get_each_context$1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[8] = list[i];
  	return child_ctx;
  }

  function get_each_context_1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[11] = list[i];
  	return child_ctx;
  }

  // (39:2) {#each horizontalMarkersToDraw as y}
  function create_each_block_1(ctx) {
  	let line;
  	let line_x__value;
  	let line_y__value;
  	let line_y__value_1;
  	let line_stroke_width_value;
  	let text_1;
  	let t_value = Math.round(/*y*/ ctx[11] * /*roundFactor*/ ctx[6]) / /*roundFactor*/ ctx[6] + "";
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
  			attr(line, "stroke-width", line_stroke_width_value = 0.002 / /*scale*/ ctx[7]);
  			attr(line, "class", "svelte-15ps2zj");
  			attr(text_1, "x", text_1_x_value = /*left*/ ctx[1] + /*width*/ ctx[2] * 0.003);
  			attr(text_1, "y", text_1_y_value = /*y*/ ctx[11] - /*height*/ ctx[3] * 0.01);
  			attr(text_1, "text-anchor", "left");
  			attr(text_1, "font-size", text_1_font_size_value = 0.022 / /*scale*/ ctx[7]);
  			attr(text_1, "fill", "white");
  			attr(text_1, "class", "svelte-15ps2zj");
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

  			if (dirty & /*scale*/ 128 && line_stroke_width_value !== (line_stroke_width_value = 0.002 / /*scale*/ ctx[7])) {
  				attr(line, "stroke-width", line_stroke_width_value);
  			}

  			if (dirty & /*horizontalMarkersToDraw, roundFactor*/ 80 && t_value !== (t_value = Math.round(/*y*/ ctx[11] * /*roundFactor*/ ctx[6]) / /*roundFactor*/ ctx[6] + "")) set_data(t, t_value);

  			if (dirty & /*left, width*/ 6 && text_1_x_value !== (text_1_x_value = /*left*/ ctx[1] + /*width*/ ctx[2] * 0.003)) {
  				attr(text_1, "x", text_1_x_value);
  			}

  			if (dirty & /*horizontalMarkersToDraw, height*/ 24 && text_1_y_value !== (text_1_y_value = /*y*/ ctx[11] - /*height*/ ctx[3] * 0.01)) {
  				attr(text_1, "y", text_1_y_value);
  			}

  			if (dirty & /*scale*/ 128 && text_1_font_size_value !== (text_1_font_size_value = 0.022 / /*scale*/ ctx[7])) {
  				attr(text_1, "font-size", text_1_font_size_value);
  			}
  		},
  		d(detaching) {
  			if (detaching) detach(line);
  			if (detaching) detach(text_1);
  		}
  	};
  }

  // (59:2) {#each verticalMarkersToDraw as x}
  function create_each_block$1(ctx) {
  	let line;
  	let line_x__value;
  	let line_x__value_1;
  	let line_y__value;
  	let line_stroke_width_value;
  	let text_1;
  	let t_value = Math.round(/*x*/ ctx[8] * /*roundFactor*/ ctx[6]) / /*roundFactor*/ ctx[6] + "";
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
  			attr(line, "stroke-width", line_stroke_width_value = 0.002 / /*scale*/ ctx[7]);
  			attr(line, "class", "svelte-15ps2zj");
  			attr(text_1, "x", text_1_x_value = /*x*/ ctx[8] + /*width*/ ctx[2] * 0.003);
  			attr(text_1, "y", text_1_y_value = /*top*/ ctx[0] + /*height*/ ctx[3] * 0.016);
  			attr(text_1, "text-anchor", "left");
  			attr(text_1, "font-size", text_1_font_size_value = 0.022 / /*scale*/ ctx[7]);
  			attr(text_1, "fill", "white");
  			attr(text_1, "class", "svelte-15ps2zj");
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

  			if (dirty & /*scale*/ 128 && line_stroke_width_value !== (line_stroke_width_value = 0.002 / /*scale*/ ctx[7])) {
  				attr(line, "stroke-width", line_stroke_width_value);
  			}

  			if (dirty & /*verticalMarkersToDraw, roundFactor*/ 96 && t_value !== (t_value = Math.round(/*x*/ ctx[8] * /*roundFactor*/ ctx[6]) / /*roundFactor*/ ctx[6] + "")) set_data(t, t_value);

  			if (dirty & /*verticalMarkersToDraw, width*/ 36 && text_1_x_value !== (text_1_x_value = /*x*/ ctx[8] + /*width*/ ctx[2] * 0.003)) {
  				attr(text_1, "x", text_1_x_value);
  			}

  			if (dirty & /*top, height*/ 9 && text_1_y_value !== (text_1_y_value = /*top*/ ctx[0] + /*height*/ ctx[3] * 0.016)) {
  				attr(text_1, "y", text_1_y_value);
  			}

  			if (dirty & /*scale*/ 128 && text_1_font_size_value !== (text_1_font_size_value = 0.022 / /*scale*/ ctx[7])) {
  				attr(text_1, "font-size", text_1_font_size_value);
  			}
  		},
  		d(detaching) {
  			if (detaching) detach(line);
  			if (detaching) detach(text_1);
  		}
  	};
  }

  function create_fragment$3(ctx) {
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
  		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
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

  			attr(g, "class", "distancemarkers");
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
  			if (dirty & /*left, width, horizontalMarkersToDraw, height, scale, Math, roundFactor*/ 222) {
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

  			if (dirty & /*verticalMarkersToDraw, width, top, height, scale, Math, roundFactor*/ 237) {
  				each_value = /*verticalMarkersToDraw*/ ctx[5];
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

  function instance$3($$self, $$props, $$invalidate) {
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
  		init(this, options, instance$3, create_fragment$3, safe_not_equal, { top: 0, left: 1, width: 2, height: 3 });
  	}
  }

  var css_248z$4 = ":root{--main-width:100%;--main-height:100%;--text-size:12px}.holder.svelte-jfc4vm{--main-width:100%;--main-height:100%;--text-size:12px;width:100%;height:100%;position:relative;z-index:2;user-select:none}svg.svelte-jfc4vm{width:100%;height:100%}";
  styleInject(css_248z$4);

  /* imageGen/htmlGenerator/src/godView.svelte generated by Svelte v3.32.3 */

  function get_each_context$2(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[18] = list[i];
  	return child_ctx;
  }

  function get_each_context_1$1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[21] = list[i];
  	return child_ctx;
  }

  // (168:4) {#each trails as trail}
  function create_each_block_1$1(ctx) {
  	let path;
  	let current;

  	path = new Path({
  			props: {
  				points: /*trail*/ ctx[21],
  				colorRgb: "255, 200, 0"
  			}
  		});

  	return {
  		c() {
  			create_component(path.$$.fragment);
  		},
  		m(target, anchor) {
  			mount_component(path, target, anchor);
  			current = true;
  		},
  		p(ctx, dirty) {
  			const path_changes = {};
  			if (dirty & /*trails*/ 4) path_changes.points = /*trail*/ ctx[21];
  			path.$set(path_changes);
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
  			destroy_component(path, detaching);
  		}
  	};
  }

  // (171:4) {#each points as point}
  function create_each_block$2(ctx) {
  	let point;
  	let current;
  	const point_spread_levels = [/*point*/ ctx[18]];
  	let point_props = {};

  	for (let i = 0; i < point_spread_levels.length; i += 1) {
  		point_props = assign(point_props, point_spread_levels[i]);
  	}

  	point = new Point({ props: point_props });

  	return {
  		c() {
  			create_component(point.$$.fragment);
  		},
  		m(target, anchor) {
  			mount_component(point, target, anchor);
  			current = true;
  		},
  		p(ctx, dirty) {
  			const point_changes = (dirty & /*points*/ 8)
  			? get_spread_update(point_spread_levels, [get_spread_object(/*point*/ ctx[18])])
  			: {};

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

  function create_fragment$4(ctx) {
  	let starfield;
  	let t;
  	let div;
  	let svg;
  	let each0_anchor;
  	let each1_anchor;
  	let distancemarkers;
  	let svg_viewBox_value;
  	let current;
  	starfield = new Starfield({});
  	let each_value_1 = /*trails*/ ctx[2];
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_1.length; i += 1) {
  		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
  	}

  	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
  		each_blocks_1[i] = null;
  	});

  	let each_value = /*points*/ ctx[3];
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
  	}

  	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
  		each_blocks[i] = null;
  	});

  	const distancemarkers_spread_levels = [/*view*/ ctx[0]];
  	let distancemarkers_props = {};

  	for (let i = 0; i < distancemarkers_spread_levels.length; i += 1) {
  		distancemarkers_props = assign(distancemarkers_props, distancemarkers_spread_levels[i]);
  	}

  	distancemarkers = new DistanceMarkers({ props: distancemarkers_props });

  	return {
  		c() {
  			create_component(starfield.$$.fragment);
  			t = space();
  			div = element("div");
  			svg = svg_element("svg");

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			each0_anchor = empty();

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			each1_anchor = empty();
  			create_component(distancemarkers.$$.fragment);
  			attr(svg, "viewBox", svg_viewBox_value = "" + (/*view*/ ctx[0].left + " " + /*view*/ ctx[0].top + " " + /*view*/ ctx[0].width + " " + /*view*/ ctx[0].height));
  			attr(svg, "class", "svelte-jfc4vm");
  			attr(div, "class", "holder svelte-jfc4vm");
  		},
  		m(target, anchor) {
  			mount_component(starfield, target, anchor);
  			insert(target, t, anchor);
  			insert(target, div, anchor);
  			append(div, svg);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(svg, null);
  			}

  			append(svg, each0_anchor);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(svg, null);
  			}

  			append(svg, each1_anchor);
  			mount_component(distancemarkers, svg, null);
  			/*svg_binding*/ ctx[4](svg);
  			current = true;
  		},
  		p(ctx, [dirty]) {
  			if (dirty & /*trails*/ 4) {
  				each_value_1 = /*trails*/ ctx[2];
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
  						each_blocks_1[i].m(svg, each0_anchor);
  					}
  				}

  				group_outros();

  				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
  					out(i);
  				}

  				check_outros();
  			}

  			if (dirty & /*points*/ 8) {
  				each_value = /*points*/ ctx[3];
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$2(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  						transition_in(each_blocks[i], 1);
  					} else {
  						each_blocks[i] = create_each_block$2(child_ctx);
  						each_blocks[i].c();
  						transition_in(each_blocks[i], 1);
  						each_blocks[i].m(svg, each1_anchor);
  					}
  				}

  				group_outros();

  				for (i = each_value.length; i < each_blocks.length; i += 1) {
  					out_1(i);
  				}

  				check_outros();
  			}

  			const distancemarkers_changes = (dirty & /*view*/ 1)
  			? get_spread_update(distancemarkers_spread_levels, [get_spread_object(/*view*/ ctx[0])])
  			: {};

  			distancemarkers.$set(distancemarkers_changes);

  			if (!current || dirty & /*view*/ 1 && svg_viewBox_value !== (svg_viewBox_value = "" + (/*view*/ ctx[0].left + " " + /*view*/ ctx[0].top + " " + /*view*/ ctx[0].width + " " + /*view*/ ctx[0].height))) {
  				attr(svg, "viewBox", svg_viewBox_value);
  			}
  		},
  		i(local) {
  			if (current) return;
  			transition_in(starfield.$$.fragment, local);

  			for (let i = 0; i < each_value_1.length; i += 1) {
  				transition_in(each_blocks_1[i]);
  			}

  			for (let i = 0; i < each_value.length; i += 1) {
  				transition_in(each_blocks[i]);
  			}

  			transition_in(distancemarkers.$$.fragment, local);
  			current = true;
  		},
  		o(local) {
  			transition_out(starfield.$$.fragment, local);
  			each_blocks_1 = each_blocks_1.filter(Boolean);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				transition_out(each_blocks_1[i]);
  			}

  			each_blocks = each_blocks.filter(Boolean);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				transition_out(each_blocks[i]);
  			}

  			transition_out(distancemarkers.$$.fragment, local);
  			current = false;
  		},
  		d(detaching) {
  			destroy_component(starfield, detaching);
  			if (detaching) detach(t);
  			if (detaching) detach(div);
  			destroy_each(each_blocks_1, detaching);
  			destroy_each(each_blocks, detaching);
  			destroy_component(distancemarkers);
  			/*svg_binding*/ ctx[4](null);
  		}
  	};
  }

  const KM_PER_AU = 149597900;

  function instance$4($$self, $$props, $$invalidate) {
  	let gameData;

  	async function getGameData() {
  		const res = await fetch("/game");
  		gameData = await res.json();

  		// console.log(gameData)
  		redraw(gameData);
  	}

  	onMount(getGameData);
  	setInterval(getGameData, 1 * 1000);

  	let maxView = { left: 0, top: 0, width: 1, height: 1 },
  		view = { left: 0, top: 0, width: 0, height: 0 };

  	let svgElement;

  	let ships = [],
  		trails = [],
  		planets = [],
  		caches = [],
  		attackRemnants = [],
  		points = [];

  	function redraw(data) {
  		ships = data.guilds.map(g => g.ship);
  		planets = data.planets;
  		caches = data.caches;
  		attackRemnants = data.attackRemnants;

  		$$invalidate(3, points = [
  			...ships.map(el => ({ location: el.location, name: el.name })),
  			...planets.map(el => ({
  				location: el.location,
  				radius: el.radius / KM_PER_AU,
  				color: el.validColor || el.color,
  				name: el.name
  			})),
  			...caches.map(el => ({ location: el.location, color: "yellow" })),
  			...attackRemnants.map(el => ({ location: el.location }))
  		]);

  		points.forEach(el => el.location[1] *= -1); // flip y values since svg counts up from the top down
  		const maxes = common.getMaxes(points.map(p => p.location));
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

  		if (view.width === 0) $$invalidate(0, view = { ...maxView });
  		$$invalidate(2, trails = ships.map(s => [...s.pastLocations.map(l => [l[0], l[1] * -1]), s.location]));
  	}

  	// set up mouse interaction ------------------------------------
  	let isPanning = false, startPoint, endPoint;

  	scale.subscribe(value => {
  	});

  	onMount(() => {
  		$$invalidate(
  			1,
  			svgElement.onmousewheel = e => {
  				e.preventDefault();
  				const dw = view.width * e.deltaY * 0.03;
  				const dh = view.height * e.deltaY * 0.03;
  				const elBCR = svgElement.getBoundingClientRect();
  				const mx = e.offsetX / elBCR.width;
  				const my = e.offsetY / elBCR.height;
  				const dx = dw * -1 * mx;
  				const dy = dh * -1 * my;

  				$$invalidate(0, view = {
  					left: view.left + dx,
  					top: view.top + dy,
  					width: view.width + dw,
  					height: view.height + dh
  				});

  				scale.set(maxView.width / view.width);
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
  				const dx = (startPoint[0] - endPoint[0]) / elBCR.width * view.width;
  				const dy = (startPoint[1] - endPoint[1]) / elBCR.height * view.height;
  				$$invalidate(0, view.left += dx, view);
  				$$invalidate(0, view.top += dy, view);
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

  	return [view, svgElement, trails, points, svg_binding];
  }

  class GodView extends SvelteComponent {
  	constructor(options) {
  		super();
  		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});
  	}
  }

  const app = new GodView({
        target: document.body
      });

  return app;

}());
