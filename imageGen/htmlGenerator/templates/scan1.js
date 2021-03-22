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
  function create_slot(definition, ctx, $$scope, fn) {
      if (definition) {
          const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
          return definition[0](slot_ctx);
      }
  }
  function get_slot_context(definition, ctx, $$scope, fn) {
      return definition[1] && fn
          ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
          : $$scope.ctx;
  }
  function get_slot_changes(definition, $$scope, dirty, fn) {
      if (definition[2] && fn) {
          const lets = definition[2](fn(dirty));
          if ($$scope.dirty === undefined) {
              return lets;
          }
          if (typeof lets === 'object') {
              const merged = [];
              const len = Math.max($$scope.dirty.length, lets.length);
              for (let i = 0; i < len; i += 1) {
                  merged[i] = $$scope.dirty[i] | lets[i];
              }
              return merged;
          }
          return $$scope.dirty | lets;
      }
      return $$scope.dirty;
  }
  function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
      const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
      if (slot_changes) {
          const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
          slot.p(slot_context, slot_changes);
      }
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
  function set_style(node, key, value, important) {
      node.style.setProperty(key, value, important ? 'important' : '');
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

  var css_248z$1 = "div.svelte-p6jbo4{color:var(--ui)}.boxholder.svelte-p6jbo4{position:relative;width:calc(var(--main-width) - 1.2rem * 2);height:calc(var(--main-height) - 1.2rem * 2);margin:1.2rem}.box.svelte-p6jbo4{position:relative}.label.svelte-p6jbo4{position:absolute;left:0;top:-1.2em}.toprightlabel.svelte-p6jbo4{position:absolute;right:0;top:-1.2em}.bottomleftlabel.svelte-p6jbo4{position:absolute;left:0;bottom:-1.2em}.bottomrightlabel.svelte-p6jbo4{position:absolute;right:0;bottom:-1.2em}.box.svelte-p6jbo4{position:relative;overflow:hidden;height:100%;width:100%;border:1px solid var(--ui)}";
  styleInject(css_248z$1);

  /* imageGen/htmlGenerator/src/components/Box.svelte generated by Svelte v3.32.3 */

  function create_if_block_3(ctx) {
  	let div;
  	let t;

  	return {
  		c() {
  			div = element("div");
  			t = text(/*label*/ ctx[0]);
  			attr(div, "class", "label minilabel svelte-p6jbo4");
  		},
  		m(target, anchor) {
  			insert(target, div, anchor);
  			append(div, t);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*label*/ 1) set_data(t, /*label*/ ctx[0]);
  		},
  		d(detaching) {
  			if (detaching) detach(div);
  		}
  	};
  }

  // (23:2) {#if label2}
  function create_if_block_2(ctx) {
  	let div;
  	let t;

  	return {
  		c() {
  			div = element("div");
  			t = text(/*label2*/ ctx[1]);
  			attr(div, "class", "toprightlabel minilabel svelte-p6jbo4");
  		},
  		m(target, anchor) {
  			insert(target, div, anchor);
  			append(div, t);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*label2*/ 2) set_data(t, /*label2*/ ctx[1]);
  		},
  		d(detaching) {
  			if (detaching) detach(div);
  		}
  	};
  }

  // (27:2) {#if label3}
  function create_if_block_1(ctx) {
  	let div;
  	let t;

  	return {
  		c() {
  			div = element("div");
  			t = text(/*label3*/ ctx[2]);
  			attr(div, "class", "bottomleftlabel minilabel svelte-p6jbo4");
  		},
  		m(target, anchor) {
  			insert(target, div, anchor);
  			append(div, t);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*label3*/ 4) set_data(t, /*label3*/ ctx[2]);
  		},
  		d(detaching) {
  			if (detaching) detach(div);
  		}
  	};
  }

  // (31:2) {#if label4}
  function create_if_block(ctx) {
  	let div;
  	let t;

  	return {
  		c() {
  			div = element("div");
  			t = text(/*label4*/ ctx[3]);
  			attr(div, "class", "bottomrightlabel minilabel svelte-p6jbo4");
  		},
  		m(target, anchor) {
  			insert(target, div, anchor);
  			append(div, t);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*label4*/ 8) set_data(t, /*label4*/ ctx[3]);
  		},
  		d(detaching) {
  			if (detaching) detach(div);
  		}
  	};
  }

  function create_fragment(ctx) {
  	let div1;
  	let div0;
  	let t0;
  	let t1;
  	let t2;
  	let t3;
  	let current;
  	const default_slot_template = /*#slots*/ ctx[6].default;
  	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
  	let if_block0 = /*label*/ ctx[0] && create_if_block_3(ctx);
  	let if_block1 = /*label2*/ ctx[1] && create_if_block_2(ctx);
  	let if_block2 = /*label3*/ ctx[2] && create_if_block_1(ctx);
  	let if_block3 = /*label4*/ ctx[3] && create_if_block(ctx);

  	return {
  		c() {
  			div1 = element("div");
  			div0 = element("div");
  			if (default_slot) default_slot.c();
  			t0 = space();
  			if (if_block0) if_block0.c();
  			t1 = space();
  			if (if_block1) if_block1.c();
  			t2 = space();
  			if (if_block2) if_block2.c();
  			t3 = space();
  			if (if_block3) if_block3.c();
  			attr(div0, "class", "box svelte-p6jbo4");
  			attr(div1, "class", "boxholder svelte-p6jbo4");
  		},
  		m(target, anchor) {
  			insert(target, div1, anchor);
  			append(div1, div0);

  			if (default_slot) {
  				default_slot.m(div0, null);
  			}

  			/*div0_binding*/ ctx[7](div0);
  			append(div1, t0);
  			if (if_block0) if_block0.m(div1, null);
  			append(div1, t1);
  			if (if_block1) if_block1.m(div1, null);
  			append(div1, t2);
  			if (if_block2) if_block2.m(div1, null);
  			append(div1, t3);
  			if (if_block3) if_block3.m(div1, null);
  			current = true;
  		},
  		p(ctx, [dirty]) {
  			if (default_slot) {
  				if (default_slot.p && dirty & /*$$scope*/ 32) {
  					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
  				}
  			}

  			if (/*label*/ ctx[0]) {
  				if (if_block0) {
  					if_block0.p(ctx, dirty);
  				} else {
  					if_block0 = create_if_block_3(ctx);
  					if_block0.c();
  					if_block0.m(div1, t1);
  				}
  			} else if (if_block0) {
  				if_block0.d(1);
  				if_block0 = null;
  			}

  			if (/*label2*/ ctx[1]) {
  				if (if_block1) {
  					if_block1.p(ctx, dirty);
  				} else {
  					if_block1 = create_if_block_2(ctx);
  					if_block1.c();
  					if_block1.m(div1, t2);
  				}
  			} else if (if_block1) {
  				if_block1.d(1);
  				if_block1 = null;
  			}

  			if (/*label3*/ ctx[2]) {
  				if (if_block2) {
  					if_block2.p(ctx, dirty);
  				} else {
  					if_block2 = create_if_block_1(ctx);
  					if_block2.c();
  					if_block2.m(div1, t3);
  				}
  			} else if (if_block2) {
  				if_block2.d(1);
  				if_block2 = null;
  			}

  			if (/*label4*/ ctx[3]) {
  				if (if_block3) {
  					if_block3.p(ctx, dirty);
  				} else {
  					if_block3 = create_if_block(ctx);
  					if_block3.c();
  					if_block3.m(div1, null);
  				}
  			} else if (if_block3) {
  				if_block3.d(1);
  				if_block3 = null;
  			}
  		},
  		i(local) {
  			if (current) return;
  			transition_in(default_slot, local);
  			current = true;
  		},
  		o(local) {
  			transition_out(default_slot, local);
  			current = false;
  		},
  		d(detaching) {
  			if (detaching) detach(div1);
  			if (default_slot) default_slot.d(detaching);
  			/*div0_binding*/ ctx[7](null);
  			if (if_block0) if_block0.d();
  			if (if_block1) if_block1.d();
  			if (if_block2) if_block2.d();
  			if (if_block3) if_block3.d();
  		}
  	};
  }

  function instance($$self, $$props, $$invalidate) {
  	let { $$slots: slots = {}, $$scope } = $$props;
  	let { label } = $$props;
  	let { label2 } = $$props;
  	let { label3 } = $$props;
  	let { label4 } = $$props;
  	let boxEl;

  	onMount(async () => {
  		
  	});

  	function div0_binding($$value) {
  		binding_callbacks[$$value ? "unshift" : "push"](() => {
  			boxEl = $$value;
  			$$invalidate(4, boxEl);
  		});
  	}

  	$$self.$$set = $$props => {
  		if ("label" in $$props) $$invalidate(0, label = $$props.label);
  		if ("label2" in $$props) $$invalidate(1, label2 = $$props.label2);
  		if ("label3" in $$props) $$invalidate(2, label3 = $$props.label3);
  		if ("label4" in $$props) $$invalidate(3, label4 = $$props.label4);
  		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
  	};

  	return [label, label2, label3, label4, boxEl, $$scope, slots, div0_binding];
  }

  class Box extends SvelteComponent {
  	constructor(options) {
  		super();

  		init(this, options, instance, create_fragment, safe_not_equal, {
  			label: 0,
  			label2: 1,
  			label3: 2,
  			label4: 3
  		});
  	}
  }

  var css_248z$2 = ".holder.svelte-gef6cd{position:absolute;width:100%;height:100%}.label.svelte-gef6cd{position:absolute;left:0;top:calc(0.3em + var(--size) / 2);text-align:center;transform:translateX(-50%);color:var(--accent-color)}.pointholder.svelte-gef6cd{position:absolute;top:calc(-1 * var(--size) / 2);left:calc(-1 * var(--size) / 2);width:var(--size);padding-top:var(--size)}.point.svelte-gef6cd{position:absolute;top:0;left:0;right:0;bottom:0;background:var(--accent-color)}";
  styleInject(css_248z$2);

  /* imageGen/htmlGenerator/src/components/MapPoint.svelte generated by Svelte v3.32.3 */

  function create_if_block$1(ctx) {
  	let div;
  	let t;

  	return {
  		c() {
  			div = element("div");
  			t = text(/*label*/ ctx[2]);
  			attr(div, "class", "label minilabel svelte-gef6cd");
  		},
  		m(target, anchor) {
  			insert(target, div, anchor);
  			append(div, t);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*label*/ 4) set_data(t, /*label*/ ctx[2]);
  		},
  		d(detaching) {
  			if (detaching) detach(div);
  		}
  	};
  }

  function create_fragment$1(ctx) {
  	let div2;
  	let t;
  	let div1;
  	let div0;
  	let if_block = /*label*/ ctx[2] && create_if_block$1(ctx);

  	return {
  		c() {
  			div2 = element("div");
  			if (if_block) if_block.c();
  			t = space();
  			div1 = element("div");
  			div0 = element("div");
  			attr(div0, "class", "point svelte-gef6cd");
  			set_style(div0, "border-radius", /*round*/ ctx[5] ? "100%" : "0");
  			attr(div1, "class", "pointholder svelte-gef6cd");
  			attr(div2, "class", "holder svelte-gef6cd");
  			set_style(div2, "--accent-color", /*color*/ ctx[3]);
  			set_style(div2, "--size", /*size*/ ctx[4] + "px");
  			set_style(div2, "left", /*leftPercent*/ ctx[1] + "%");
  			set_style(div2, "top", /*topPercent*/ ctx[0] + "%");
  		},
  		m(target, anchor) {
  			insert(target, div2, anchor);
  			if (if_block) if_block.m(div2, null);
  			append(div2, t);
  			append(div2, div1);
  			append(div1, div0);
  		},
  		p(ctx, [dirty]) {
  			if (/*label*/ ctx[2]) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  				} else {
  					if_block = create_if_block$1(ctx);
  					if_block.c();
  					if_block.m(div2, t);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}

  			if (dirty & /*round*/ 32) {
  				set_style(div0, "border-radius", /*round*/ ctx[5] ? "100%" : "0");
  			}

  			if (dirty & /*color*/ 8) {
  				set_style(div2, "--accent-color", /*color*/ ctx[3]);
  			}

  			if (dirty & /*size*/ 16) {
  				set_style(div2, "--size", /*size*/ ctx[4] + "px");
  			}

  			if (dirty & /*leftPercent*/ 2) {
  				set_style(div2, "left", /*leftPercent*/ ctx[1] + "%");
  			}

  			if (dirty & /*topPercent*/ 1) {
  				set_style(div2, "top", /*topPercent*/ ctx[0] + "%");
  			}
  		},
  		i: noop,
  		o: noop,
  		d(detaching) {
  			if (detaching) detach(div2);
  			if (if_block) if_block.d();
  		}
  	};
  }

  function instance$1($$self, $$props, $$invalidate) {
  	let { topPercent } = $$props;
  	let { leftPercent } = $$props;
  	let { label } = $$props;
  	let { color = "white" } = $$props;
  	let { size = 6 } = $$props;
  	let { round = true } = $$props;

  	$$self.$$set = $$props => {
  		if ("topPercent" in $$props) $$invalidate(0, topPercent = $$props.topPercent);
  		if ("leftPercent" in $$props) $$invalidate(1, leftPercent = $$props.leftPercent);
  		if ("label" in $$props) $$invalidate(2, label = $$props.label);
  		if ("color" in $$props) $$invalidate(3, color = $$props.color);
  		if ("size" in $$props) $$invalidate(4, size = $$props.size);
  		if ("round" in $$props) $$invalidate(5, round = $$props.round);
  	};

  	return [topPercent, leftPercent, label, color, size, round];
  }

  class MapPoint extends SvelteComponent {
  	constructor(options) {
  		super();

  		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
  			topPercent: 0,
  			leftPercent: 1,
  			label: 2,
  			color: 3,
  			size: 4,
  			round: 5
  		});
  	}
  }

  var css_248z$3 = ".circleholder.svelte-1t8q5w8.svelte-1t8q5w8{position:absolute;width:var(--diameter);height:var(--diameter);transform:translate(-50%, -50%)}.label.svelte-1t8q5w8.svelte-1t8q5w8{position:absolute;left:50%;bottom:-0.5em;transform:translateX(-50%);color:var(--accent-color);opacity:1;opacity:calc(var(--opacity) * 1.5);font-size:var(--text-size-tiny)}.label.top.svelte-1t8q5w8.svelte-1t8q5w8{bottom:auto;top:-0.5em}.circle.svelte-1t8q5w8.svelte-1t8q5w8{border-radius:50%;width:100%;height:100%;border:var(--stroke) solid var(--accent-color);position:absolute}.blackout.svelte-1t8q5w8.svelte-1t8q5w8{z-index:3}.blackout.svelte-1t8q5w8 .circle.svelte-1t8q5w8{border-width:1px;box-shadow:0 0 0 10000px var(--bg)}";
  styleInject(css_248z$3);

  /* imageGen/htmlGenerator/src/components/MapCircle.svelte generated by Svelte v3.32.3 */

  function create_if_block$2(ctx) {
  	let t0;
  	let div;
  	let t1;
  	let if_block = /*radiusPercent*/ ctx[2] > 0.1 && create_if_block_1$1(ctx);

  	return {
  		c() {
  			if (if_block) if_block.c();
  			t0 = space();
  			div = element("div");
  			t1 = text(/*label*/ ctx[3]);
  			attr(div, "class", "label minilabel top svelte-1t8q5w8");
  		},
  		m(target, anchor) {
  			if (if_block) if_block.m(target, anchor);
  			insert(target, t0, anchor);
  			insert(target, div, anchor);
  			append(div, t1);
  		},
  		p(ctx, dirty) {
  			if (/*radiusPercent*/ ctx[2] > 0.1) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  				} else {
  					if_block = create_if_block_1$1(ctx);
  					if_block.c();
  					if_block.m(t0.parentNode, t0);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}

  			if (dirty & /*label*/ 8) set_data(t1, /*label*/ ctx[3]);
  		},
  		d(detaching) {
  			if (if_block) if_block.d(detaching);
  			if (detaching) detach(t0);
  			if (detaching) detach(div);
  		}
  	};
  }

  // (21:4) {#if radiusPercent > 0.1}
  function create_if_block_1$1(ctx) {
  	let div;
  	let t;

  	return {
  		c() {
  			div = element("div");
  			t = text(/*label*/ ctx[3]);
  			attr(div, "class", "label minilabel svelte-1t8q5w8");
  		},
  		m(target, anchor) {
  			insert(target, div, anchor);
  			append(div, t);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*label*/ 8) set_data(t, /*label*/ ctx[3]);
  		},
  		d(detaching) {
  			if (detaching) detach(div);
  		}
  	};
  }

  function create_fragment$2(ctx) {
  	let div1;
  	let t;
  	let div0;
  	let div1_class_value;
  	let if_block = /*label*/ ctx[3] && create_if_block$2(ctx);

  	return {
  		c() {
  			div1 = element("div");
  			if (if_block) if_block.c();
  			t = space();
  			div0 = element("div");
  			attr(div0, "class", "circle svelte-1t8q5w8");
  			set_style(div0, "opacity", /*blackout*/ ctx[4] ? 1 : /*opacity*/ ctx[6]);
  			attr(div1, "class", div1_class_value = "circleholder " + (/*blackout*/ ctx[4] ? "blackout" : "") + " svelte-1t8q5w8");
  			set_style(div1, "--accent-color", /*color*/ ctx[5]);
  			set_style(div1, "--diameter", /*radiusPercent*/ ctx[2] * 2 * 100 + "%");
  			set_style(div1, "--stroke", /*strokeWidth*/ ctx[7] + "px");
  			set_style(div1, "--opacity", /*opacity*/ ctx[6]);
  			set_style(div1, "left", /*leftPercent*/ ctx[1] + "%");
  			set_style(div1, "top", /*topPercent*/ ctx[0] + "%");
  		},
  		m(target, anchor) {
  			insert(target, div1, anchor);
  			if (if_block) if_block.m(div1, null);
  			append(div1, t);
  			append(div1, div0);
  		},
  		p(ctx, [dirty]) {
  			if (/*label*/ ctx[3]) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  				} else {
  					if_block = create_if_block$2(ctx);
  					if_block.c();
  					if_block.m(div1, t);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}

  			if (dirty & /*blackout, opacity*/ 80) {
  				set_style(div0, "opacity", /*blackout*/ ctx[4] ? 1 : /*opacity*/ ctx[6]);
  			}

  			if (dirty & /*blackout*/ 16 && div1_class_value !== (div1_class_value = "circleholder " + (/*blackout*/ ctx[4] ? "blackout" : "") + " svelte-1t8q5w8")) {
  				attr(div1, "class", div1_class_value);
  			}

  			if (dirty & /*color*/ 32) {
  				set_style(div1, "--accent-color", /*color*/ ctx[5]);
  			}

  			if (dirty & /*radiusPercent*/ 4) {
  				set_style(div1, "--diameter", /*radiusPercent*/ ctx[2] * 2 * 100 + "%");
  			}

  			if (dirty & /*strokeWidth*/ 128) {
  				set_style(div1, "--stroke", /*strokeWidth*/ ctx[7] + "px");
  			}

  			if (dirty & /*opacity*/ 64) {
  				set_style(div1, "--opacity", /*opacity*/ ctx[6]);
  			}

  			if (dirty & /*leftPercent*/ 2) {
  				set_style(div1, "left", /*leftPercent*/ ctx[1] + "%");
  			}

  			if (dirty & /*topPercent*/ 1) {
  				set_style(div1, "top", /*topPercent*/ ctx[0] + "%");
  			}
  		},
  		i: noop,
  		o: noop,
  		d(detaching) {
  			if (detaching) detach(div1);
  			if (if_block) if_block.d();
  		}
  	};
  }

  function instance$2($$self, $$props, $$invalidate) {
  	let { topPercent } = $$props;
  	let { leftPercent } = $$props;
  	let { radiusPercent } = $$props;
  	let { label } = $$props;
  	let { blackout } = $$props;
  	let { color = "var(--ui)" } = $$props;
  	let { opacity = 0.2 } = $$props;
  	let { strokeWidth = 2 } = $$props;

  	$$self.$$set = $$props => {
  		if ("topPercent" in $$props) $$invalidate(0, topPercent = $$props.topPercent);
  		if ("leftPercent" in $$props) $$invalidate(1, leftPercent = $$props.leftPercent);
  		if ("radiusPercent" in $$props) $$invalidate(2, radiusPercent = $$props.radiusPercent);
  		if ("label" in $$props) $$invalidate(3, label = $$props.label);
  		if ("blackout" in $$props) $$invalidate(4, blackout = $$props.blackout);
  		if ("color" in $$props) $$invalidate(5, color = $$props.color);
  		if ("opacity" in $$props) $$invalidate(6, opacity = $$props.opacity);
  		if ("strokeWidth" in $$props) $$invalidate(7, strokeWidth = $$props.strokeWidth);
  	};

  	return [
  		topPercent,
  		leftPercent,
  		radiusPercent,
  		label,
  		blackout,
  		color,
  		opacity,
  		strokeWidth
  	];
  }

  class MapCircle extends SvelteComponent {
  	constructor(options) {
  		super();

  		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
  			topPercent: 0,
  			leftPercent: 1,
  			radiusPercent: 2,
  			label: 3,
  			blackout: 4,
  			color: 5,
  			opacity: 6,
  			strokeWidth: 7
  		});
  	}
  }

  /* imageGen/htmlGenerator/src/components/MapDistanceCircles.svelte generated by Svelte v3.32.3 */

  function get_each_context(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[4] = list[i];
  	return child_ctx;
  }

  // (25:0) {#each circlesToShow as c}
  function create_each_block(ctx) {
  	let mapcircle;
  	let current;
  	const mapcircle_spread_levels = [/*c*/ ctx[4]];
  	let mapcircle_props = {};

  	for (let i = 0; i < mapcircle_spread_levels.length; i += 1) {
  		mapcircle_props = assign(mapcircle_props, mapcircle_spread_levels[i]);
  	}

  	mapcircle = new MapCircle({ props: mapcircle_props });

  	return {
  		c() {
  			create_component(mapcircle.$$.fragment);
  		},
  		m(target, anchor) {
  			mount_component(mapcircle, target, anchor);
  			current = true;
  		},
  		p(ctx, dirty) {
  			const mapcircle_changes = (dirty & /*circlesToShow*/ 1)
  			? get_spread_update(mapcircle_spread_levels, [get_spread_object(/*c*/ ctx[4])])
  			: {};

  			mapcircle.$set(mapcircle_changes);
  		},
  		i(local) {
  			if (current) return;
  			transition_in(mapcircle.$$.fragment, local);
  			current = true;
  		},
  		o(local) {
  			transition_out(mapcircle.$$.fragment, local);
  			current = false;
  		},
  		d(detaching) {
  			destroy_component(mapcircle, detaching);
  		}
  	};
  }

  function create_fragment$3(ctx) {
  	let each_1_anchor;
  	let current;
  	let each_value = /*circlesToShow*/ ctx[0];
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  	}

  	const out = i => transition_out(each_blocks[i], 1, 1, () => {
  		each_blocks[i] = null;
  	});

  	return {
  		c() {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			each_1_anchor = empty();
  		},
  		m(target, anchor) {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(target, anchor);
  			}

  			insert(target, each_1_anchor, anchor);
  			current = true;
  		},
  		p(ctx, [dirty]) {
  			if (dirty & /*circlesToShow*/ 1) {
  				each_value = /*circlesToShow*/ ctx[0];
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  						transition_in(each_blocks[i], 1);
  					} else {
  						each_blocks[i] = create_each_block(child_ctx);
  						each_blocks[i].c();
  						transition_in(each_blocks[i], 1);
  						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
  					}
  				}

  				group_outros();

  				for (i = each_value.length; i < each_blocks.length; i += 1) {
  					out(i);
  				}

  				check_outros();
  			}
  		},
  		i(local) {
  			if (current) return;

  			for (let i = 0; i < each_value.length; i += 1) {
  				transition_in(each_blocks[i]);
  			}

  			current = true;
  		},
  		o(local) {
  			each_blocks = each_blocks.filter(Boolean);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				transition_out(each_blocks[i]);
  			}

  			current = false;
  		},
  		d(detaching) {
  			destroy_each(each_blocks, detaching);
  			if (detaching) detach(each_1_anchor);
  		}
  	};
  }

  function instance$3($$self, $$props, $$invalidate) {
  	let { centerPoint } = $$props;
  	let { diameter } = $$props;
  	let auBetweenLines = 1 / 16384;
  	while (auBetweenLines / diameter < 0.15) auBetweenLines *= 2;
  	console.log(auBetweenLines, centerPoint, diameter);
  	const circlesToShow = [];

  	for (let i = 1; i < 7; i++) {
  		circlesToShow.push({
  			topPercent: centerPoint.topPercent,
  			leftPercent: centerPoint.leftPercent,
  			radiusPercent: auBetweenLines / diameter * i,
  			label: Math.round(auBetweenLines * i * 10000) / 10000 + "AU",
  			opacity: 0.25,
  			strokeWidth: 1
  		});
  	}

  	$$self.$$set = $$props => {
  		if ("centerPoint" in $$props) $$invalidate(1, centerPoint = $$props.centerPoint);
  		if ("diameter" in $$props) $$invalidate(2, diameter = $$props.diameter);
  	};

  	return [circlesToShow, centerPoint, diameter];
  }

  class MapDistanceCircles extends SvelteComponent {
  	constructor(options) {
  		super();
  		init(this, options, instance$3, create_fragment$3, safe_not_equal, { centerPoint: 1, diameter: 2 });
  	}
  }

  var css_248z$4 = "canvas.svelte-110erry{background:black;position:absolute;z-index:0;top:0;left:0}";
  styleInject(css_248z$4);

  var css_248z$5 = "div.svelte-1kuj9kb{width:100%;height:100%}";
  styleInject(css_248z$5);

  /* imageGen/htmlGenerator/src/scan1.svelte generated by Svelte v3.32.3 */

  function get_each_context$1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[25] = list[i];
  	return child_ctx;
  }

  function get_each_context_1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[28] = list[i];
  	return child_ctx;
  }

  // (146:6) {#each circlesToShow as c}
  function create_each_block_1(ctx) {
  	let mapcircle;
  	let current;
  	const mapcircle_spread_levels = [/*c*/ ctx[28]];
  	let mapcircle_props = {};

  	for (let i = 0; i < mapcircle_spread_levels.length; i += 1) {
  		mapcircle_props = assign(mapcircle_props, mapcircle_spread_levels[i]);
  	}

  	mapcircle = new MapCircle({ props: mapcircle_props });

  	return {
  		c() {
  			create_component(mapcircle.$$.fragment);
  		},
  		m(target, anchor) {
  			mount_component(mapcircle, target, anchor);
  			current = true;
  		},
  		p(ctx, dirty) {
  			const mapcircle_changes = (dirty[0] & /*circlesToShow*/ 128)
  			? get_spread_update(mapcircle_spread_levels, [get_spread_object(/*c*/ ctx[28])])
  			: {};

  			mapcircle.$set(mapcircle_changes);
  		},
  		i(local) {
  			if (current) return;
  			transition_in(mapcircle.$$.fragment, local);
  			current = true;
  		},
  		o(local) {
  			transition_out(mapcircle.$$.fragment, local);
  			current = false;
  		},
  		d(detaching) {
  			destroy_component(mapcircle, detaching);
  		}
  	};
  }

  // (150:6) {#each pointsToShow as p}
  function create_each_block$1(ctx) {
  	let mappoint;
  	let current;
  	const mappoint_spread_levels = [/*p*/ ctx[25]];
  	let mappoint_props = {};

  	for (let i = 0; i < mappoint_spread_levels.length; i += 1) {
  		mappoint_props = assign(mappoint_props, mappoint_spread_levels[i]);
  	}

  	mappoint = new MapPoint({ props: mappoint_props });

  	return {
  		c() {
  			create_component(mappoint.$$.fragment);
  		},
  		m(target, anchor) {
  			mount_component(mappoint, target, anchor);
  			current = true;
  		},
  		p(ctx, dirty) {
  			const mappoint_changes = (dirty[0] & /*pointsToShow*/ 1)
  			? get_spread_update(mappoint_spread_levels, [get_spread_object(/*p*/ ctx[25])])
  			: {};

  			mappoint.$set(mappoint_changes);
  		},
  		i(local) {
  			if (current) return;
  			transition_in(mappoint.$$.fragment, local);
  			current = true;
  		},
  		o(local) {
  			transition_out(mappoint.$$.fragment, local);
  			current = false;
  		},
  		d(detaching) {
  			destroy_component(mappoint, detaching);
  		}
  	};
  }

  // (134:2) <Box     label="Area Scan"     label2={`[${Math.round((center[0] + range) * 1000) / 1000}, ${       Math.round((center[1] - range) * 1000) / 1000     }]`}     label3={`[${Math.round((center[0] - range) * 1000) / 1000}, ${       Math.round((center[1] + range) * 1000) / 1000     }]`}     label4={repair < 1 ? `Needs_Repair` : ''}   >
  function create_default_slot(ctx) {
  	let div;
  	let mapdistancecircles;
  	let t0;
  	let t1;
  	let mapcircle;
  	let t2;
  	let current;

  	mapdistancecircles = new MapDistanceCircles({
  			props: {
  				centerPoint: /*shipPoint*/ ctx[5],
  				diameter: /*diameter*/ ctx[4]
  			}
  		});

  	let each_value_1 = /*circlesToShow*/ ctx[7];
  	let each_blocks_1 = [];

  	for (let i = 0; i < each_value_1.length; i += 1) {
  		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  	}

  	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
  		each_blocks_1[i] = null;
  	});

  	const mapcircle_spread_levels = [/*blackoutCircle*/ ctx[6]];
  	let mapcircle_props = {};

  	for (let i = 0; i < mapcircle_spread_levels.length; i += 1) {
  		mapcircle_props = assign(mapcircle_props, mapcircle_spread_levels[i]);
  	}

  	mapcircle = new MapCircle({ props: mapcircle_props });
  	let each_value = /*pointsToShow*/ ctx[0];
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
  	}

  	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
  		each_blocks[i] = null;
  	});

  	return {
  		c() {
  			div = element("div");
  			create_component(mapdistancecircles.$$.fragment);
  			t0 = space();

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].c();
  			}

  			t1 = space();
  			create_component(mapcircle.$$.fragment);
  			t2 = space();

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			set_style(div, "transform", "rotate(" + /*rotateAmount*/ ctx[8] + "deg)");
  			attr(div, "class", "svelte-1kuj9kb");
  		},
  		m(target, anchor) {
  			insert(target, div, anchor);
  			mount_component(mapdistancecircles, div, null);
  			append(div, t0);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				each_blocks_1[i].m(div, null);
  			}

  			append(div, t1);
  			mount_component(mapcircle, div, null);
  			append(div, t2);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(div, null);
  			}

  			current = true;
  		},
  		p(ctx, dirty) {
  			if (dirty[0] & /*circlesToShow*/ 128) {
  				each_value_1 = /*circlesToShow*/ ctx[7];
  				let i;

  				for (i = 0; i < each_value_1.length; i += 1) {
  					const child_ctx = get_each_context_1(ctx, each_value_1, i);

  					if (each_blocks_1[i]) {
  						each_blocks_1[i].p(child_ctx, dirty);
  						transition_in(each_blocks_1[i], 1);
  					} else {
  						each_blocks_1[i] = create_each_block_1(child_ctx);
  						each_blocks_1[i].c();
  						transition_in(each_blocks_1[i], 1);
  						each_blocks_1[i].m(div, t1);
  					}
  				}

  				group_outros();

  				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
  					out(i);
  				}

  				check_outros();
  			}

  			const mapcircle_changes = (dirty[0] & /*blackoutCircle*/ 64)
  			? get_spread_update(mapcircle_spread_levels, [get_spread_object(/*blackoutCircle*/ ctx[6])])
  			: {};

  			mapcircle.$set(mapcircle_changes);

  			if (dirty[0] & /*pointsToShow*/ 1) {
  				each_value = /*pointsToShow*/ ctx[0];
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context$1(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  						transition_in(each_blocks[i], 1);
  					} else {
  						each_blocks[i] = create_each_block$1(child_ctx);
  						each_blocks[i].c();
  						transition_in(each_blocks[i], 1);
  						each_blocks[i].m(div, null);
  					}
  				}

  				group_outros();

  				for (i = each_value.length; i < each_blocks.length; i += 1) {
  					out_1(i);
  				}

  				check_outros();
  			}
  		},
  		i(local) {
  			if (current) return;
  			transition_in(mapdistancecircles.$$.fragment, local);

  			for (let i = 0; i < each_value_1.length; i += 1) {
  				transition_in(each_blocks_1[i]);
  			}

  			transition_in(mapcircle.$$.fragment, local);

  			for (let i = 0; i < each_value.length; i += 1) {
  				transition_in(each_blocks[i]);
  			}

  			current = true;
  		},
  		o(local) {
  			transition_out(mapdistancecircles.$$.fragment, local);
  			each_blocks_1 = each_blocks_1.filter(Boolean);

  			for (let i = 0; i < each_blocks_1.length; i += 1) {
  				transition_out(each_blocks_1[i]);
  			}

  			transition_out(mapcircle.$$.fragment, local);
  			each_blocks = each_blocks.filter(Boolean);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				transition_out(each_blocks[i]);
  			}

  			current = false;
  		},
  		d(detaching) {
  			if (detaching) detach(div);
  			destroy_component(mapdistancecircles);
  			destroy_each(each_blocks_1, detaching);
  			destroy_component(mapcircle);
  			destroy_each(each_blocks, detaching);
  		}
  	};
  }

  function create_fragment$4(ctx) {
  	let div;
  	let box;
  	let current;

  	box = new Box({
  			props: {
  				label: "Area Scan",
  				label2: `[${Math.round((/*center*/ ctx[3][0] + /*range*/ ctx[1]) * 1000) / 1000}, ${Math.round((/*center*/ ctx[3][1] - /*range*/ ctx[1]) * 1000) / 1000}]`,
  				label3: `[${Math.round((/*center*/ ctx[3][0] - /*range*/ ctx[1]) * 1000) / 1000}, ${Math.round((/*center*/ ctx[3][1] + /*range*/ ctx[1]) * 1000) / 1000}]`,
  				label4: /*repair*/ ctx[2] < 1 ? `Needs_Repair` : "",
  				$$slots: { default: [create_default_slot] },
  				$$scope: { ctx }
  			}
  		});

  	return {
  		c() {
  			div = element("div");
  			create_component(box.$$.fragment);
  			set_style(div, "--ui", "#fd0");
  			set_style(div, "--bg", "#210");
  			attr(div, "class", "svelte-1kuj9kb");
  		},
  		m(target, anchor) {
  			insert(target, div, anchor);
  			mount_component(box, div, null);
  			current = true;
  		},
  		p(ctx, dirty) {
  			const box_changes = {};

  			if (dirty[0] & /*pointsToShow*/ 1 | dirty[1] & /*$$scope*/ 1) {
  				box_changes.$$scope = { dirty, ctx };
  			}

  			box.$set(box_changes);
  		},
  		i(local) {
  			if (current) return;
  			transition_in(box.$$.fragment, local);
  			current = true;
  		},
  		o(local) {
  			transition_out(box.$$.fragment, local);
  			current = false;
  		},
  		d(detaching) {
  			if (detaching) detach(div);
  			destroy_component(box);
  		}
  	};
  }

  const KM_PER_AU = 149597900;

  function instance$4($$self, $$props, $$invalidate) {
  	const { ship, attackRadius, interactRadius, scanRadius, planets, ships, caches, range } = APP_DATA;
  	const repair = APP_DATA.repair || 1;
  	const allColors = ["white", "green", "yellow", "red", "purple"];

  	const getColor = c => Math.random() < repair
  	? c
  	: allColors[Math.floor(Math.random() * allColors.length)];

  	const getSize = s => Math.random() < repair
  	? s
  	: s + (Math.random() - 0.5) * (1 - repair) * 0.1;

  	const getRound = r => Math.random() < repair ? r : Math.random() > 0.5;

  	const getLocation = coords => {
  		return coords.map(c => Math.random() < repair
  		? c
  		: c + (Math.random() - 0.5) * (1 - repair) * range);
  	};

  	let pointsToShow = [
  		...planets.map(p => ({
  			color: getColor("green"),
  			location: getLocation(p.location),
  			radius: p.radius,
  			round: getRound(true),
  			name: p.name
  		})),
  		...caches.map(c => ({
  			color: getColor("yellow"),
  			location: getLocation(c.location),
  			size: getSize(0.01),
  			round: getRound(false)
  		})),
  		...ships.map(s => ({
  			color: getColor("red"),
  			location: getLocation(s.location),
  			size: getSize(0.01),
  			round: getRound(false),
  			name: s.name
  		})),
  		{
  			location: getLocation(ship.location),
  			color: getColor("white"),
  			size: getSize(0.01),
  			round: getRound(false)
  		}
  	];

  	const center = pointsToShow[pointsToShow.length - 1].location;
  	let upperBound = center[1] + range;
  	let leftBound = center[0] - range;
  	const diameter = range * 2;
  	const percentPerKilometer = 1 / diameter / KM_PER_AU;

  	pointsToShow.forEach(p => {
  		if (p.radius) p.size = getSize(Math.max(0.013, p.radius * 2 * percentPerKilometer));
  	});

  	// console.log(pointsToShow)
  	pointsToShow = pointsToShow.map(p => {
  		return {
  			...p,
  			label: p.name,
  			topPercent: (upperBound - p.location[1]) / diameter * 100,
  			leftPercent: (p.location[0] - leftBound) / diameter * 100
  		};
  	});

  	const shipPoint = pointsToShow[pointsToShow.length - 1];

  	const blackoutCircle = {
  		topPercent: shipPoint.topPercent,
  		leftPercent: shipPoint.leftPercent,
  		radiusPercent: range / diameter,
  		blackout: true
  	};

  	const circlesToShow = [];

  	if (attackRadius) circlesToShow.push({
  		topPercent: shipPoint.topPercent,
  		leftPercent: shipPoint.leftPercent,
  		radiusPercent: percentPerKilometer * attackRadius * KM_PER_AU,
  		label: "Attack",
  		color: "red"
  	});

  	if (interactRadius) circlesToShow.push({
  		topPercent: shipPoint.topPercent,
  		leftPercent: shipPoint.leftPercent,
  		radiusPercent: percentPerKilometer * interactRadius * KM_PER_AU,
  		label: "Interact",
  		color: "white"
  	});

  	if (scanRadius) circlesToShow.push({
  		topPercent: shipPoint.topPercent,
  		leftPercent: shipPoint.leftPercent,
  		radiusPercent: percentPerKilometer * scanRadius * KM_PER_AU,
  		label: "Ship Scan",
  		color: "cyan"
  	});

  	const rotateAmount = Math.random() < repair
  	? 0
  	: (Math.random() - 0.5) * (1 - repair) * 180;

  	return [
  		pointsToShow,
  		range,
  		repair,
  		center,
  		diameter,
  		shipPoint,
  		blackoutCircle,
  		circlesToShow,
  		rotateAmount
  	];
  }

  class Scan1 extends SvelteComponent {
  	constructor(options) {
  		super();
  		init(this, options, instance$4, create_fragment$4, safe_not_equal, {}, [-1, -1]);
  	}
  }

  const app = new Scan1({
        target: document.body
      });

  return app;

}());