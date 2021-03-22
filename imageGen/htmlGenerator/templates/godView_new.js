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

  var css_248z = ":root {\n  --main-width: 750px;\n  --main-height: var(--main-width);\n\n  --text-size: 24px;\n  --text-size-small: calc(var(--text-size) * 0.75);\n  --text-size-tiny: calc(var(--text-size) * 0.6);\n\n  --bg: #001100;\n  --bg-rgb: 0, 17, 0;\n\n  --ui: #0f0;\n}\n\nhtml {\n  font-family: monospace;\n  font-size: var(--text-size);\n  line-height: 1;\n}\n\nbody {\n  width: var(--main-width);\n  height: var(--main-height);\n  margin: 0;\n\n  display: flex;\n  align-items: center;\n  justify-content: center;\n\n  background: var(--bg);\n  color: var(--ui);\n}\n\n* {\n  box-sizing: border-box;\n}\n\n.minilabel {\n  font-weight: bold;\n  text-transform: uppercase;\n  font-size: var(--text-size-small);\n}\n";
  styleInject(css_248z);

  function noop() { }
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
  function element(name) {
      return document.createElement(name);
  }
  function svg_element(name) {
      return document.createElementNS('http://www.w3.org/2000/svg', name);
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

  let current_component;
  function set_current_component(component) {
      current_component = component;
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
  function transition_in(block, local) {
      if (block && block.i) {
          outroing.delete(block);
          block.i(local);
      }
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

  var css_248z$2 = ".holder.svelte-gef6cd{position:absolute;width:100%;height:100%}.label.svelte-gef6cd{position:absolute;left:0;top:calc(0.3em + var(--size) / 2);text-align:center;transform:translateX(-50%);color:var(--accent-color)}.pointholder.svelte-gef6cd{position:absolute;top:calc(-1 * var(--size) / 2);left:calc(-1 * var(--size) / 2);width:var(--size);padding-top:var(--size)}.point.svelte-gef6cd{position:absolute;top:0;left:0;right:0;bottom:0;background:var(--accent-color)}";
  styleInject(css_248z$2);

  var css_248z$3 = ".circleholder.svelte-1t8q5w8.svelte-1t8q5w8{position:absolute;width:var(--diameter);height:var(--diameter);transform:translate(-50%, -50%)}.label.svelte-1t8q5w8.svelte-1t8q5w8{position:absolute;left:50%;bottom:-0.5em;transform:translateX(-50%);color:var(--accent-color);opacity:1;opacity:calc(var(--opacity) * 1.5);font-size:var(--text-size-tiny)}.label.top.svelte-1t8q5w8.svelte-1t8q5w8{bottom:auto;top:-0.5em}.circle.svelte-1t8q5w8.svelte-1t8q5w8{border-radius:50%;width:100%;height:100%;border:var(--stroke) solid var(--accent-color);position:absolute}.blackout.svelte-1t8q5w8.svelte-1t8q5w8{z-index:3}.blackout.svelte-1t8q5w8 .circle.svelte-1t8q5w8{border-width:1px;box-shadow:0 0 0 10000px var(--bg)}";
  styleInject(css_248z$3);

  var css_248z$4 = "canvas.svelte-110erry{background:black;position:absolute;z-index:0;top:0;left:0}";
  styleInject(css_248z$4);

  var css_248z$5 = ":root{--main-width:100%;--main-height:100%;--text-size:14px}.holder.svelte-436vxz{--main-width:100%;--main-height:100%;--text-size:14px;width:100%;height:100%}svg.svelte-436vxz{width:100%;height:100%}";
  styleInject(css_248z$5);

  /* imageGen/htmlGenerator/src/godView_new.svelte generated by Svelte v3.32.3 */

  function create_fragment(ctx) {
  	let div;
  	let svg;

  	return {
  		c() {
  			div = element("div");
  			svg = svg_element("svg");
  			attr(svg, "viewBox", "" + (view.left + " " + view.top + " " + view.right + " " + view.bottom));
  			attr(svg, "class", "svelte-436vxz");
  			attr(div, "class", "holder svelte-436vxz");
  		},
  		m(target, anchor) {
  			insert(target, div, anchor);
  			append(div, svg);
  		},
  		p: noop,
  		i: noop,
  		o: noop,
  		d(detaching) {
  			if (detaching) detach(div);
  		}
  	};
  }
  // planets = data.planets

  function instance($$self) {
  	let gameData;

  	async function getGameData() {
  		const res = await fetch("/game");
  		gameData = await res.json();
  		console.log(gameData);
  	}

  	getGameData();
  	setInterval(getGameData, 10 * 1000);

  	return [];
  }

  class GodView_new extends SvelteComponent {
  	constructor(options) {
  		super();
  		init(this, options, instance, create_fragment, safe_not_equal, {});
  	}
  }

  const app = new GodView_new({
        target: document.body
      });

  return app;

}());
