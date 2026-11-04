// Optical enhancement only: native controls own values, activation, and hit areas.
const controllers=new WeakMap();
const materialSelector='[data-liquid-glass]';
const controlSelector='button,input,select,summary,a[href],[role="button"],[role="switch"],[role="slider"],[data-glass-menu-trigger]';
const menuItemSelector='[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"],button,a[href]';
const contactKeys=new Set([' ','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown']);
const materialLevels={rear:0,raised:1,navigation:1,toolbar:1,control:2,range:2,switch:2,menu:3,sheet:3,dialog:3};

/**
 * Enhance opted-in controls/navigation without moving their interactive bounds.
 * Menus use an ID in data-glass-menu-trigger (or aria-controls), data-glass-menu,
 * and an initial hidden attribute. Their roles and action handlers remain owned
 * by the application. Call refresh after synchronous rendering, destroy on exit.
 */
export function initLiquidGlass(root=globalThis.document,options={}) {
  if (!root?.querySelectorAll || !root.addEventListener) return {refresh(){},destroy(){}};
  if (controllers.has(root)) return controllers.get(root);
  const doc=root.nodeType===9?root:root.ownerDocument;
  const win=doc?.defaultView;
  if (!win) return {refresh(){},destroy(){}};
  const scope=root.nodeType===9?doc.documentElement:(root.host||root);
  const listeners=[],snapshots=new Map(),pointers=new Map(),keys=new Map();
  const preferences=['(prefers-reduced-motion: reduce)','(prefers-reduced-transparency: reduce)','(forced-colors: active)','(prefers-contrast: more)']
    .map(query=>win.matchMedia?.(query)||{matches:false});
  let surfaces=new Set(),frame=0,destroyed=false,pointer=null,hovered=null,openMenu=null,pointerToggle=null,layersDirty=true;
  const menuResizeObserver=win.ResizeObserver?new win.ResizeObserver(scheduleLayers):null;

  function remember(el,type,name) {
    let values=snapshots.get(el);
    if (!values) {values=new Map();snapshots.set(el,values);}
    const key=type+':'+name;
    if (!values.has(key)) values.set(key,type==='attribute'
      ?{type,name,value:el.getAttribute(name)}
      :{type,name,value:el.style.getPropertyValue(name),priority:el.style.getPropertyPriority(name)});
  }
  function attribute(el,name,value) {
    if (!el || el.getAttribute(name)===value) return;
    remember(el,'attribute',name);
    if (value===null) el.removeAttribute(name);else el.setAttribute(name,value);
  }
  function style(el,name,value) {
    if (!el?.style || el.style.getPropertyValue(name)===value) return;
    remember(el,'style',name);
    if (value) el.style.setProperty(name,value);else el.style.removeProperty(name);
  }
  function restore(el) {
    for (const entry of snapshots.get(el)?.values()||[]) {
      if (entry.type==='attribute') {
        if (entry.value===null) el.removeAttribute(entry.name);else el.setAttribute(entry.name,entry.value);
      } else if (entry.value) el.style.setProperty(entry.name,entry.value,entry.priority);
      else el.style.removeProperty(entry.name);
    }
    snapshots.delete(el);
  }
  function listen(target,type,callback,config) {
    target.addEventListener(type,callback,config);
    listeners.push(()=>target.removeEventListener(type,callback,config));
  }
  function contains(el) {return !!el && (el===root||root.contains(el));}
  function element(target) {return target?.nodeType===1?target:target?.parentElement;}
  function surfaceFor(target) {
    const el=element(target)?.closest(materialSelector);
    return el&&contains(el)?el:null;
  }
  function enabled(target) {
    const control=element(target)?.closest(controlSelector);
    return !!control&&contains(control)&&!control.matches(':disabled,[aria-disabled="true"]');
  }
  function fluid() {
    return options.motion!==false&&!preferences[0].matches&&!preferences[2].matches
      &&scope.getAttribute('data-lab-motion')!=='quiet';
  }
  function opaque() {return options.transparency===false||preferences.slice(1).some(p=>p.matches);}
  function engaged(el) {
    attribute(el,'data-glass-engaged',[...pointers.values(),...keys.values()].includes(el)?'':null);
  }
  function releaseContact() {
    const active=new Set([...pointers.values(),...keys.values()]);
    pointers.clear();keys.clear();
    for (const el of active) engaged(el);
  }
  function clearPointer() {
    if (hovered) {style(hovered,'--glass-pointer-x','');style(hovered,'--glass-pointer-y','');}
    hovered=null;pointer=null;
  }
  function schedule() {
    if (destroyed||frame) return;
    frame=win.requestAnimationFrame(()=>{frame=0;update();});
  }
  function scheduleLayers() {layersDirty=true;schedule();}
  function menuItems(menu) {
    return [...menu.querySelectorAll(menuItemSelector)].filter(el=>!el.matches(':disabled,[aria-disabled="true"],[hidden]')&&el.getClientRects().length);
  }
  function commandMenu(menu) {return menu?.getAttribute('role')==='menu';}
  function updateMenuItems() {
    if (!openMenu||!commandMenu(openMenu.menu)) return;
    openMenu.items=[...new Set([...openMenu.items,...menuItems(openMenu.menu)])];
    for (const item of openMenu.items) if (openMenu.menu.contains(item)) attribute(item,'tabindex','-1');
  }
  function restoreProperty(el,type,name) {
    const entry=snapshots.get(el)?.get(type+':'+name);
    if (!entry) return;
    if (type==='attribute') {
      if (entry.value===null) el.removeAttribute(name);else el.setAttribute(name,entry.value);
    } else if (entry.value) el.style.setProperty(name,entry.value,entry.priority);
    else el.style.removeProperty(name);
    snapshots.get(el).delete(type+':'+name);
    if (!snapshots.get(el).size) snapshots.delete(el);
  }
  function viewport() {
    const visual=win.visualViewport;
    const left=visual?.offsetLeft||0,top=visual?.offsetTop||0;
    return {left:left+12,top:top+12,right:left+(visual?.width||win.innerWidth)-12,bottom:top+(visual?.height||win.innerHeight)-12};
  }
  function fixedCoordinates(menu) {
    // A native popover paints above backdrop roots without moving its DOM or
    // breaking application event delegation. Older browsers use local geometry.
    if (typeof menu.showPopover==='function'&&menu.matches(':popover-open')) return {left:0,top:0,scaleX:1,scaleY:1};
    // Backdrop filters, transforms and containment make a fixed child local to
    // that ancestor. Keep the menu in its authored DOM and convert coordinates.
    for (let parent=menu.parentElement;parent;parent=parent.parentElement) {
      const css=win.getComputedStyle(parent);
      if ([css.transform,css.perspective,css.filter,css.backdropFilter,css.webkitBackdropFilter].some(value=>value&&value!=='none')
        ||/(?:layout|paint|strict|content)/.test(css.contain||'')
        ||/(?:transform|perspective|filter)/.test(css.willChange||'')||css.contentVisibility==='auto') {
        const box=parent.getBoundingClientRect();
        const scaleX=parent.offsetWidth?box.width/parent.offsetWidth:1;
        const scaleY=parent.offsetHeight?box.height/parent.offsetHeight:1;
        return {left:box.left+(parent.clientLeft-parent.scrollLeft)*scaleX,top:box.top+(parent.clientTop-parent.scrollTop)*scaleY,scaleX:scaleX||1,scaleY:scaleY||1};
      }
    }
    return {left:0,top:0,scaleX:1,scaleY:1};
  }
  function positionMenu() {
    if (!openMenu) return;
    const {menu,trigger}=openMenu,view=viewport(),block=fixedCoordinates(menu),anchor=trigger.getBoundingClientRect();
    attribute(menu,'data-glass-positioned','');
    style(menu,'--glass-menu-max-width',`${Math.max(1,(view.right-view.left)/block.scaleX)}px`);
    style(menu,'--glass-menu-max-height',`${Math.max(1,(view.bottom-view.top)/block.scaleY)}px`);
    const width=menu.offsetWidth*block.scaleX,height=menu.offsetHeight*block.scaleY;
    const below=Math.max(0,view.bottom-anchor.bottom-8),above=Math.max(0,anchor.top-view.top-8);
    const upwards=height>below&&above>below;
    const available=Math.max(1,Math.min(view.bottom-view.top,upwards?above:below));
    style(menu,'--glass-menu-max-height',`${available/block.scaleY}px`);
    const renderedHeight=Math.min(height,available);
    const left=Math.max(view.left,Math.min(anchor.right-width,view.right-width));
    const top=Math.max(view.top,Math.min(upwards?anchor.top-8-renderedHeight:anchor.bottom+8,view.bottom-renderedHeight));
    style(menu,'--glass-menu-left',`${(left-block.left)/block.scaleX}px`);
    style(menu,'--glass-menu-top',`${(top-block.top)/block.scaleY}px`);
    style(menu,'--glass-menu-origin',upwards?'bottom right':'top right');
  }
  function closeMenu(returnFocus=false) {
    if (!openMenu) return;
    const {trigger,menu,items,topLayer}=openMenu;
    openMenu=null;
    menuResizeObserver?.disconnect();
    if (topLayer&&menu.matches(':popover-open')) menu.hidePopover();
    attribute(menu,'hidden','');attribute(menu,'data-glass-open',null);
    attribute(trigger,'aria-expanded','false');attribute(trigger,'data-glass-expanded',null);
    for (const item of items) restoreProperty(item,'attribute','tabindex');
    restoreProperty(menu,'attribute','data-glass-positioned');
    for (const name of ['--glass-menu-left','--glass-menu-top','--glass-menu-max-height','--glass-menu-max-width','--glass-menu-origin']) restoreProperty(menu,'style',name);
    restoreProperty(menu,'attribute','popover');
    if (returnFocus&&trigger.isConnected) trigger.focus({preventScroll:true});
    scheduleLayers();
  }
  function toggleMenu(trigger) {
    const id=(trigger.getAttribute('data-glass-menu-trigger')||trigger.getAttribute('aria-controls')||'').replace(/^#/,'');
    const menu=doc.getElementById(id);
    if (!menu?.matches('[data-glass-menu]')||!contains(menu)) return;
    if (openMenu?.trigger===trigger) {closeMenu(true);return;}
    closeMenu();
    openMenu={trigger,menu,items:[],topLayer:false};
    attribute(menu,'hidden',null);attribute(menu,'data-glass-open','');
    if (typeof menu.showPopover==='function') {
      attribute(menu,'popover','manual');
      menu.showPopover();openMenu.topLayer=true;
    }
    attribute(trigger,'aria-expanded','true');attribute(trigger,'data-glass-expanded','');
    openMenu.items=commandMenu(menu)?menuItems(menu):[];
    // Menu commands use arrow keys; native Tab advances outside the whole menu
    // and the focus listener dismisses it without moving focus back to its opener.
    updateMenuItems();
    positionMenu();
    menuResizeObserver?.observe(trigger);menuResizeObserver?.observe(menu);
    menuItems(menu)[0]?.focus({preventScroll:true});
    scheduleLayers();
  }
  function updateSelections() {
    const selection=new Map();
    for (const control of root.querySelectorAll('input[type="checkbox"],input[type="radio"],[aria-pressed],[aria-selected],[aria-checked],input[type="range"]')) {
      const el=surfaceFor(control);if (!el) continue;
      if (control.matches('input[type="range"]')) {
        const min=Number(control.min||0),max=Number(control.max||100),value=Number(control.value);
        if (Number.isFinite(value)&&max>min) style(el,'--glass-value',String(Math.min(1,Math.max(0,(value-min)/(max-min)))));
      } else {
        const selected=control.checked===true||['aria-pressed','aria-selected','aria-checked'].some(name=>control.getAttribute(name)==='true');
        selection.set(el,(selection.get(el)||false)||selected);
      }
    }
    for (const [el,selected] of selection) attribute(el,'data-glass-selected',selected?'':null);
  }
  function updateLayers() {
    const depths=new Map(),levels=new Map(),floating=[];
    const ordered=[...surfaces].sort((a,b)=>a.compareDocumentPosition(b)&4?-1:1);
    for (const el of ordered) {
      let depth=0,parent=el.parentElement?.closest(materialSelector);
      while (parent&&contains(parent)) {depth++;parent=parent.parentElement?.closest(materialSelector);}
      depths.set(el,depth);
      const ancestor=el.parentElement?.closest(materialSelector);
      const base=materialLevels[el.getAttribute('data-liquid-glass')]??1;
      levels.set(el,Math.max(base,ancestor&&contains(ancestor)?(levels.get(ancestor)??materialLevels[ancestor.getAttribute('data-liquid-glass')]??1)+1:base));
      if (el.matches('[data-glass-floating],[data-glass-scroll-edge],[data-glass-menu],dialog[open]')&&el.getClientRects().length) {
        floating.push({el,box:el.getBoundingClientRect(),z:Number.parseFloat(win.getComputedStyle(el).zIndex)||0});
      }
      if (el.hasAttribute('data-glass-scroll-edge')) {
        const scrollId=el.getAttribute('data-glass-scroll-target');
        const scroller=(scrollId&&doc.getElementById(scrollId))||el.closest('[data-glass-scroll-container]');
        const offset=scroller?scroller.scrollTop:(win.scrollY||doc.documentElement.scrollTop||0);
        attribute(el,'data-glass-scrolled',offset>4?'':null);
      }
    }
    // Only floating chrome needs geometric overlap checks; content controls use
    // their DOM material ancestry. No page-wide quadratic geometry scan.
    floating.sort((a,b)=>a.z-b.z||(a.el.compareDocumentPosition(b.el)&4?-1:1));
    for (let i=0;i<floating.length;i++) for (let j=i+1;j<floating.length;j++) {
      const a=floating[i],b=floating[j];
      if (a.el.contains(b.el)||b.el.contains(a.el)) continue;
      if (a.box.left>=b.box.right||b.box.left>=a.box.right||a.box.top>=b.box.bottom||b.box.top>=a.box.bottom) continue;
      depths.set(b.el,Math.max(depths.get(b.el),depths.get(a.el)+1));
      levels.set(b.el,Math.max(levels.get(b.el),levels.get(a.el)+1));
    }
    // A floating surface may have risen above another material; its controls
    // must also rise. Use ordinal levels, letting CSS cap optics rather than
    // assigning a clearer material to a child of a heavily frosted sheet.
    for (const el of ordered) {
      const parent=el.parentElement?.closest(materialSelector);
      if (parent&&contains(parent)) {
        depths.set(el,Math.max(depths.get(el),depths.get(parent)+1));
        levels.set(el,Math.max(levels.get(el),levels.get(parent)+1));
      }
    }
    for (const [el,depth] of depths) {
      attribute(el,'data-glass-overlap',depth?'':null);
      style(el,'--glass-overlap-depth',String(depth));
      style(el,'--glass-layer-level',String(levels.get(el)));
    }
  }
  function update() {
    if (destroyed) return;
    attribute(scope,'data-glass-motion',fluid()?'fluid':'quiet');
    attribute(scope,'data-glass-transparency',opaque()?'opaque':'translucent');
    if (!fluid()||opaque()) clearPointer();
    if (pointer&&surfaces.has(pointer.el)&&pointer.el.isConnected) {
      const {el,x,y}=pointer,box=el.getBoundingClientRect();
      if (box.width&&box.height) {
        style(el,'--glass-pointer-x',`${Math.max(0,Math.min(100,(x-box.left)/box.width*100)).toFixed(2)}%`);
        style(el,'--glass-pointer-y',`${Math.max(0,Math.min(100,(y-box.top)/box.height*100)).toFixed(2)}%`);
      }
    }
    if (openMenu&&(!openMenu.trigger.isConnected||!openMenu.menu.isConnected||openMenu.menu.hidden)) closeMenu();
    // A focus transfer briefly sets activeElement to body between focusout and
    // focusin. Check the settled target on the animation frame, not a microtask.
    if (openMenu&&commandMenu(openMenu.menu)&&!openMenu.menu.contains(doc.activeElement)) closeMenu();
    updateMenuItems();
    const focused=surfaceFor(doc.activeElement);
    for (const el of surfaces) attribute(el,'data-glass-focus',el===focused?'':null);
    updateSelections();
    if (layersDirty) {layersDirty=false;positionMenu();updateLayers();}
  }
  function refresh() {
    if (destroyed) return;
    const previous=surfaces;
    surfaces=new Set(root.querySelectorAll(materialSelector));
    if (root.matches?.(materialSelector)) surfaces.add(root);
    for (const el of previous) if (!surfaces.has(el)) restore(el);
    for (const [id,el] of pointers) if (!surfaces.has(el)) pointers.delete(id);
    for (const [key,el] of keys) if (!surfaces.has(el)) keys.delete(key);
    if (hovered&&!surfaces.has(hovered)) clearPointer();
    for (const el of snapshots.keys()) if (el!==scope&&!contains(el)) restore(el);
    layersDirty=true;
    update();
  }

  listen(root,'pointermove',event=>{
    const el=surfaceFor(event.target);
    if (!el||!fluid()||opaque()||event.pointerType==='touch') {clearPointer();return;}
    if (hovered!==el) clearPointer();
    hovered=el;pointer={el,x:event.clientX,y:event.clientY};schedule();
  },{passive:true});
  listen(root,'pointerout',event=>{if (hovered&&!hovered.contains(element(event.relatedTarget))) clearPointer();},{passive:true});
  listen(root,'pointerdown',event=>{
    if (event.button!==0||!enabled(event.target)) return;
    const el=surfaceFor(event.target);if (!el) return;
    pointers.set(event.pointerId,el);engaged(el);
  },{passive:true});
  for (const type of ['pointerup','pointercancel']) listen(win,type,event=>{
    const el=pointers.get(event.pointerId);pointers.delete(event.pointerId);if (el) engaged(el);
  },{passive:true});
  listen(win,'blur',()=>{releaseContact();clearPointer();pointerToggle=null;if (openMenu&&commandMenu(openMenu.menu)) closeMenu();});
  listen(doc,'focusin',event=>{
    if (openMenu&&commandMenu(openMenu.menu)&&!openMenu.menu.contains(element(event.target))) closeMenu();
    schedule();
  });
  listen(root,'focusout',()=>{
    keys.clear();for (const el of surfaces) engaged(el);
    schedule();
  });
  listen(root,'input',schedule);listen(root,'change',schedule);
  listen(root,'keydown',event=>{
    pointerToggle=null;
    if (event.key==='Escape'&&openMenu&&(openMenu.menu.contains(element(event.target))||openMenu.trigger.contains(element(event.target)))) {event.preventDefault();closeMenu(true);return;}
    const trigger=element(event.target)?.closest('[data-glass-menu-trigger]');
    if (trigger&&enabled(trigger)&&['ArrowDown','ArrowUp'].includes(event.key)
      &&commandMenu(doc.getElementById((trigger.getAttribute('data-glass-menu-trigger')||trigger.getAttribute('aria-controls')||'').replace(/^#/,'')))) {
      event.preventDefault();
      if (openMenu?.trigger!==trigger) toggleMenu(trigger);
      if (openMenu?.trigger===trigger) {
        const items=menuItems(openMenu.menu);
        items[event.key==='ArrowUp'?items.length-1:0]?.focus({preventScroll:true});
      }
      return;
    }
    if (openMenu&&commandMenu(openMenu.menu)&&openMenu.menu.contains(element(event.target))&&['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
      const items=menuItems(openMenu.menu);if (!items.length) return;
      const index=items.indexOf(doc.activeElement);
      const next=event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;
      event.preventDefault();items[next].focus();return;
    }
    if (!contactKeys.has(event.key)||!enabled(event.target)) return;
    const el=surfaceFor(event.target);if (!el) return;
    keys.set(event.key,el);engaged(el);
  });
  listen(root,'keyup',event=>{const el=keys.get(event.key);keys.delete(event.key);if (el) engaged(el);});
  listen(root,'click',event=>{
    const target=element(event.target),trigger=target?.closest('[data-glass-menu-trigger]');
    const closingTrigger=pointerToggle;pointerToggle=null;
    if (trigger&&contains(trigger)&&enabled(trigger)) {
      // Focusing the opener already dismissed a command menu; its pointer click
      // should complete that toggle rather than immediately opening it again.
      if (trigger===closingTrigger) closeMenu();else toggleMenu(trigger);
      return;
    }
    if (openMenu?.menu.contains(target)&&target?.closest('[data-glass-menu-close]')) closeMenu(true);
    else if (openMenu&&!openMenu.menu.contains(target)&&!openMenu.trigger.contains(target)) closeMenu();
  });
  listen(doc,'pointerdown',event=>{
    const target=element(event.target);
    pointerToggle=openMenu?.trigger.contains(target)?openMenu.trigger:null;
    if (openMenu&&!openMenu.menu.contains(target)&&!openMenu.trigger.contains(target)) closeMenu();
  },{capture:true,passive:true});
  listen(root,'scroll',scheduleLayers,{capture:true,passive:true});listen(win,'resize',scheduleLayers,{passive:true});
  if (win.visualViewport) for (const type of ['resize','scroll']) listen(win.visualViewport,type,scheduleLayers,{passive:true});
  for (const preference of preferences) {
    if (preference.addEventListener) listen(preference,'change',schedule);
    else if (preference.addListener) {preference.addListener(schedule);listeners.push(()=>preference.removeListener(schedule));}
  }
  const observer=new win.MutationObserver(records=>{
    if (records.some(record=>record.type==='childList'||record.attributeName==='data-liquid-glass')) refresh();
    else scheduleLayers();
  });
  observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['data-liquid-glass','data-lab-motion','data-theme','data-meridian','data-meridian-environment','hidden','open','aria-pressed','aria-selected','aria-checked']});
  const controller={refresh,destroy(){
    if (destroyed) return;
    destroyed=true;observer.disconnect();menuResizeObserver?.disconnect();
    if (frame) win.cancelAnimationFrame(frame);
    closeMenu();releaseContact();clearPointer();
    for (const remove of listeners) remove();
    for (const el of [...snapshots.keys()]) restore(el);
    controllers.delete(root);surfaces.clear();
  }};
  controllers.set(root,controller);refresh();return controller;
}
