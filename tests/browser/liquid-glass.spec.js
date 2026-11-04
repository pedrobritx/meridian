import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const moduleSource=await readFile(new URL('../../src/universal/liquid-glass.js',import.meta.url),'utf8').catch(()=>null);

async function fixture(page) {
  expect(moduleSource,'The shared Liquid Glass enhancer exists').not.toBeNull();
  await page.setContent(`<meta name="viewport" content="width=device-width,initial-scale=1"><style>
    body{margin:0;font:16px sans-serif;min-height:1800px}button,label,nav{padding:16px}
    nav{position:fixed;inset:0 0 auto;background:#fff}main{padding:100px 20px}
    #surface{display:block;box-sizing:border-box;width:min(320px,100%);padding:20px}#glass-action{display:block;width:180px;height:60px}
    #glass-menu{position:fixed;top:140px;left:30px;right:auto;bottom:auto;margin:0;padding:20px;background:#eee}
    #glass-menu[data-glass-positioned]{left:var(--glass-menu-left);top:var(--glass-menu-top);max-width:var(--glass-menu-max-width);max-height:var(--glass-menu-max-height);overflow:auto;box-sizing:border-box}
    [hidden]{display:none!important}
  </style>
  <nav data-liquid-glass="navigation" data-glass-scroll-edge>Navigation</nav>
  <main><div id="surface" data-liquid-glass="raised"><button id="glass-action" data-liquid-glass="control">Action</button></div>
    <label data-liquid-glass="control"><input id="toggle" type="checkbox" role="switch"> Keep place</label>
    <input id="slider" type="range" min="0" max="100" value="50" data-liquid-glass="control" aria-label="Size">
    <button id="menu-trigger" data-liquid-glass="control" data-glass-menu-trigger="glass-menu" aria-controls="glass-menu" aria-expanded="false" aria-haspopup="menu">Actions</button>
    <div id="glass-menu" data-liquid-glass="menu" data-glass-menu role="menu" hidden><button role="menuitem" data-glass-menu-close>Copy</button><button role="menuitem" data-glass-menu-close>Save</button></div>
    <button id="outside">Outside</button>
  </main>`);
  await page.evaluate(async source=>{
    const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
    window.glassModule=await import(url);
    URL.revokeObjectURL(url);
    window.glassEnhancer=window.glassModule.initLiquidGlass(document);
  },moduleSource);
}

test('material follows local contact and focus without changing native controls',async({page})=>{
  await fixture(page);
  const action=page.locator('#glass-action');
  await action.hover();
  await expect.poll(()=>action.evaluate(el=>el.style.getPropertyValue('--glass-pointer-x'))).not.toBe('');
  const box=await action.boundingBox();
  await page.mouse.move(box.x+box.width*.7,box.y+box.height*.4);
  await expect.poll(()=>action.evaluate(el=>parseFloat(el.style.getPropertyValue('--glass-pointer-x')))).toBeCloseTo(70,0);
  await page.mouse.down();
  await expect(action).toHaveAttribute('data-glass-engaged','');
  await page.mouse.up();
  await expect(action).not.toHaveAttribute('data-glass-engaged','');
  await page.locator('#toggle').check();
  await expect(page.locator('#toggle')).toBeChecked();
  await page.locator('#slider').focus();
  await expect(page.locator('#slider')).toHaveAttribute('data-glass-focus','');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#slider')).toHaveValue('51');
  await expect(action).toHaveAttribute('data-glass-overlap','');
});

test('glass menu handles keyboard navigation, Escape, selection, and outside dismissal',async({page})=>{
  await fixture(page);
  await page.evaluate(()=>{
    window.menuActionCount=0;
    document.querySelector('main').addEventListener('click',event=>{
      if (event.target.closest('[role="menuitem"]')) window.menuActionCount++;
    });
  });
  const trigger=page.locator('#menu-trigger'),menu=page.locator('#glass-menu');
  await trigger.click();
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded','true');
  await expect(menu.getByRole('menuitem',{name:'Copy'})).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem',{name:'Save'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(menu.getByRole('menuitem',{name:'Save'})).toBeFocused();
  await page.keyboard.press('Escape');
  await trigger.click();
  await menu.getByRole('menuitem',{name:'Copy'}).click();
  await expect(menu).toBeHidden();
  expect(await page.evaluate(()=>window.menuActionCount)).toBe(1);
  await trigger.click();
  await page.locator('#outside').click();
  await expect(menu).toBeHidden();
  await expect(page.locator('#outside')).toBeFocused();
});

test('command menu Tab and external focus dismiss without redirecting focus',async({page})=>{
  await fixture(page);
  const trigger=page.locator('#menu-trigger'),menu=page.locator('#glass-menu'),outside=page.locator('#outside');
  await trigger.click();
  await page.keyboard.press('Tab');
  await expect(menu).toBeHidden();
  await expect(outside).toBeFocused();
  await trigger.click();
  await page.keyboard.press('Shift+Tab');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await outside.focus();
  await expect(menu).toBeHidden();
  await expect(outside).toBeFocused();
  await trigger.click();
  await trigger.click();
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(menu.getByRole('menuitem',{name:'Copy',includeHidden:true})).not.toHaveAttribute('tabindex','-1');
});

test('informational dialog popover keeps its own focus and keyboard behavior',async({page})=>{
  await fixture(page);
  await page.evaluate(()=>{
    const menu=document.querySelector('#glass-menu');
    menu.setAttribute('role','dialog');menu.setAttribute('aria-label','Information');
    menu.innerHTML='<p>Information</p><button id="info-close" data-glass-menu-close>Close information</button>';
    document.querySelector('#menu-trigger').setAttribute('aria-haspopup','dialog');
  });
  const trigger=page.locator('#menu-trigger'),menu=page.locator('#glass-menu'),outside=page.locator('#outside');
  await trigger.click();
  await outside.focus();
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeVisible();
  await expect(outside).toBeFocused();
  await page.locator('#info-close').focus();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu).toBeHidden();
});

test('menu stays within narrow viewport, chooses above near the bottom, and scrolls long content',async({page})=>{
  await page.setViewportSize({width:390,height:500});
  await fixture(page);
  await page.evaluate(()=>{
    const trigger=document.querySelector('#menu-trigger');
    Object.assign(trigger.style,{position:'fixed',left:'12px',bottom:'12px',width:'90px'});
    document.querySelector('#glass-menu').style.width='240px';
  });
  await page.locator('#menu-trigger').click();
  const menu=page.locator('#glass-menu');
  await expect.poll(()=>menu.evaluate(el=>el.style.getPropertyValue('--glass-menu-origin'))).toBe('bottom right');
  let box=await menu.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(11.5);expect(box.x+box.width).toBeLessThanOrEqual(378.5);
  expect(box.y).toBeGreaterThanOrEqual(11.5);expect(box.y+box.height).toBeLessThanOrEqual(488.5);
  await page.evaluate(()=>{
    const menu=document.querySelector('#glass-menu');
    for (let i=0;i<12;i++) {const item=document.createElement('button');item.setAttribute('role','menuitem');item.textContent='Extra action '+i;item.style.display='block';menu.append(item);}
  });
  await expect.poll(()=>menu.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);
  await page.setViewportSize({width:320,height:360});
  await expect.poll(()=>menu.evaluate(el=>el.getBoundingClientRect().right)).toBeLessThanOrEqual(308.5);
  await expect.poll(()=>menu.evaluate(el=>el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(348.5);
  box=await menu.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(11.5);expect(box.y).toBeGreaterThanOrEqual(11.5);
  expect(box.y+box.height).toBeLessThanOrEqual(348.5);
});

test('filtered or scaled toolbar containing blocks preserve viewport-safe placement',async({page})=>{
  await page.setViewportSize({width:390,height:600});
  await fixture(page);
  // Verify the coordinate fallback for browsers without a native top layer.
  await page.evaluate(()=>{document.querySelector('#glass-menu').showPopover=undefined;});
  await page.evaluate(()=>{
    const group=document.createElement('div');
    group.dataset.liquidGlass='toolbar';
    group.style.cssText='position:relative;width:150px;padding:10px;border:3px solid;backdrop-filter:blur(4px);transform:scale(.9);transform-origin:top left';
    document.querySelector('main').append(group);
    group.append(document.querySelector('#menu-trigger'),document.querySelector('#glass-menu'));
    document.querySelector('#glass-menu').style.width='240px';
    window.glassEnhancer.refresh();
  });
  await page.locator('#menu-trigger').click();
  const menu=page.locator('#glass-menu');
  await expect.poll(()=>menu.evaluate(el=>el.getBoundingClientRect().left)).toBeGreaterThanOrEqual(11.5);
  let box=await menu.boundingBox();
  expect(box.x+box.width).toBeLessThanOrEqual(378.5);
  await page.evaluate(()=>scrollTo(0,80));
  await expect.poll(()=>menu.evaluate(el=>el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(11.5);
  box=await menu.boundingBox();
  expect(box.y+box.height).toBeLessThanOrEqual(588.5);
});

test('visual viewport changes reposition an open menu and teardown restores authored coordinates',async({page})=>{
  await fixture(page);
  await page.evaluate(()=>{
    window.glassEnhancer.destroy();
    const viewport=new EventTarget();
    Object.assign(viewport,{width:390,height:250,offsetLeft:0,offsetTop:100});
    Object.defineProperty(window,'visualViewport',{configurable:true,value:viewport});
    Object.assign(document.querySelector('#menu-trigger').style,{position:'fixed',left:'12px',top:'280px',width:'90px'});
    document.querySelector('#glass-menu').style.setProperty('--glass-menu-left','authored');
    window.glassEnhancer=window.glassModule.initLiquidGlass(document);
  });
  await page.locator('#menu-trigger').click();
  const menu=page.locator('#glass-menu');
  await expect.poll(()=>menu.evaluate(el=>el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(111.5);
  await page.evaluate(()=>{window.visualViewport.height=180;window.visualViewport.offsetTop=150;window.visualViewport.dispatchEvent(new Event('resize'));});
  await expect.poll(()=>menu.evaluate(el=>el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(318.5);
  await expect.poll(()=>menu.evaluate(el=>el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(161.5);
  await page.evaluate(()=>window.glassEnhancer.destroy());
  await expect(menu).toBeHidden();
  expect(await menu.evaluate(el=>el.style.getPropertyValue('--glass-menu-left'))).toBe('authored');
  await expect(menu).not.toHaveAttribute('data-glass-positioned','');
});

test('nested controls and floating chrome stay optically above the sheets they overlap',async({page})=>{
  await fixture(page);
  await page.evaluate(()=>{
    const sheet=document.createElement('div');sheet.id='sheet';sheet.dataset.liquidGlass='sheet';sheet.dataset.glassFloating='';
    sheet.style.cssText='position:fixed;left:20px;top:70px;width:220px;height:170px;z-index:1';
    sheet.innerHTML='<div id="nested-nav" data-liquid-glass="navigation"><button id="nested-control" data-liquid-glass="control">Nested</button></div>';
    const floating=document.createElement('div');floating.id='floating';floating.dataset.liquidGlass='navigation';floating.dataset.glassFloating='';
    floating.style.cssText='position:fixed;left:30px;top:80px;width:220px;height:120px;z-index:2';
    floating.innerHTML='<button id="floating-control" data-liquid-glass="control">Floating</button>';
    document.querySelector('main').append(sheet,floating);window.glassEnhancer.refresh();
  });
  const levels=await page.evaluate(()=>Object.fromEntries(['sheet','nested-nav','nested-control','floating','floating-control'].map(id=>[id,Number(document.getElementById(id).style.getPropertyValue('--glass-layer-level'))])));
  expect(levels['nested-nav']).toBeGreaterThan(levels.sheet);
  expect(levels['nested-control']).toBeGreaterThan(levels['nested-nav']);
  expect(levels.floating).toBeGreaterThan(levels.sheet);
  expect(levels['floating-control']).toBeGreaterThan(levels.floating);
});

test('scroll, new surfaces, accessibility preferences, and teardown preserve usable fallbacks',async({page})=>{
  await fixture(page);
  await page.evaluate(()=>scrollTo(0,120));
  await expect(page.locator('nav')).toHaveAttribute('data-glass-scrolled','');
  await page.evaluate(()=>{
    const button=document.createElement('button');button.id='late-action';button.dataset.liquidGlass='control';button.textContent='Later';
    document.querySelector('main').append(button);
  });
  await page.locator('#late-action').focus();
  await expect(page.locator('#late-action')).toHaveAttribute('data-glass-focus','');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('html')).toHaveAttribute('data-glass-motion','quiet');
  await page.locator('#late-action').hover();
  await expect.poll(()=>page.locator('#late-action').evaluate(el=>el.style.getPropertyValue('--glass-pointer-x'))).toBe('');
  await page.emulateMedia({forcedColors:'active'});
  await expect(page.locator('html')).toHaveAttribute('data-glass-transparency','opaque');
  await page.locator('#toggle').check();
  await expect(page.locator('#toggle')).toBeChecked();
  await page.locator('#menu-trigger').click();
  await expect(page.locator('#glass-menu')).toBeVisible();
  await page.evaluate(()=>window.glassEnhancer.destroy());
  await expect(page.locator('#glass-menu')).toBeHidden();
  await expect(page.locator('#menu-trigger')).toHaveAttribute('aria-expanded','false');
  await expect(page.locator('html')).not.toHaveAttribute('data-glass-motion','quiet');
  await page.locator('#late-action').focus();
  await expect(page.locator('#late-action')).not.toHaveAttribute('data-glass-focus','');
});
