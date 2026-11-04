import {test,expect} from '@playwright/test';

const appearances=['forest:light','forest:dark','aurora:light','aurora:dark'];

// Read actual blur and background alpha. This also resolves color-mix/calc and
// catches selectors that override a role's variables with a different paint.
async function material(locator) {
  return locator.evaluate(element=>{
    const css=getComputedStyle(element);
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
    const context=canvas.getContext('2d');
    context.fillStyle=css.backgroundColor;context.fillRect(0,0,1,1);
    const tint=context.getImageData(0,0,1,1).data[3]/255;
    return {
      tint,
      frost:Number((css.backdropFilter.match(/blur\(([\d.]+)px\)/)||[])[1]||0),
      background:css.backgroundColor+' '+css.backgroundImage,
      shadow:css.boxShadow,
      radius:parseFloat(css.borderTopLeftRadius),
      outline:css.outlineWidth+' '+css.outlineStyle+' '+css.outlineColor,
      border:css.borderWidth+' '+css.borderStyle+' '+css.borderColor,
      textDecoration:css.textDecoration,
      appearance:css.appearance,
      thumb:(()=>{const p=getComputedStyle(element,'::before');return {display:p.display,content:p.content,width:parseFloat(p.width)||0,left:p.left,background:p.backgroundColor,transform:p.transform};})()
    };
  });
}

async function stableMaterial(locator) {
  // A frame can change overlap after a mode switch, scroll, or newly opened panel.
  await expect.poll(async()=>Number.isFinite((await material(locator)).tint)).toBe(true);
  return material(locator);
}

async function menuWithinViewport(page,menu) {
  return menu.evaluate(element=>{
    const box=element.getBoundingClientRect();
    return box.left>=8&&box.right<=innerWidth-8&&box.top>=8&&box.bottom<=innerHeight-8;
  });
}

for(const appearance of appearances) {
  test(`real toolbar keeps selected glass distinct through hover and focus in ${appearance}`,async({page})=>{
    await page.goto('lab/universal-library/');
    await page.locator('#appearance-mode').selectOption(appearance);
    const toolbar=page.getByRole('toolbar',{name:'Workspace actions'});
    const selected=toolbar.getByRole('button',{name:'Workspace',exact:true});
    const sibling=toolbar.getByRole('button',{name:'Explore',exact:true});
    await selected.scrollIntoViewIfNeeded();
    await page.mouse.move(0,0);
    const base=await stableMaterial(selected);
    const normal=await stableMaterial(sibling);
    expect(base.background,'Selection needs a visible material lens').not.toBe(normal.background);
    expect(base.frost).toBeGreaterThan(0);
    expect(base.shadow).not.toBe('none');
    expect(base.radius).toBeGreaterThanOrEqual(16);
    const group=await material(selected.locator('..'));
    expect(group.shadow,'The floating toolbar retains elevation').not.toBe('none');
    expect(group.radius).toBeGreaterThanOrEqual(16);
    await sibling.hover();
    expect((await material(selected)).background,'Hover must remain distinct from selection').not.toBe((await material(sibling)).background);
    await sibling.focus();
    await expect(sibling).toBeFocused();
    await expect(selected).toHaveAttribute('aria-pressed','true');
    expect((await material(selected)).background,'Focus must remain distinct from selection').not.toBe((await material(sibling)).background);
    await sibling.click();
    await expect(sibling).toHaveAttribute('aria-pressed','true');
    await expect(selected).toHaveAttribute('aria-pressed','false');
    expect((await material(sibling)).background).not.toBe((await material(selected)).background);
    const content=page.locator('.md-glass-content');
    await expect(content).toHaveCSS('backdrop-filter','none');
    await expect(content).not.toHaveAttribute('data-liquid-glass');
  });

  test(`real inspector increases foreground frosting in ${appearance}`,async({page})=>{
    await page.goto('lab/living-workspace/');
    const [environment,theme]=appearance.split(':');
    await page.evaluate(({environment,theme})=>{
      Object.assign(document.documentElement.dataset,{meridian:'grass',meridianEnvironment:environment,theme});
    },{environment,theme});
    await page.getByRole('button',{name:'Open panel'}).click();
    const panel=page.getByRole('complementary',{name:'Floating workspace panel'});
    const navigation=panel.getByRole('tablist',{name:'Workspace view'});
    const selected=panel.getByRole('tab',{name:'Material',exact:true});
    const sibling=panel.getByRole('tab',{name:'Motion',exact:true});
    await expect(navigation).toHaveAttribute('data-glass-overlap','');
    await expect.poll(async()=>{
      const sheet=await material(panel),nav=await material(navigation),tab=await material(sibling);
      return nav.frost>sheet.frost&&nav.tint>sheet.tint&&tab.frost>nav.frost&&tab.tint>nav.tint;
    },{message:'Each nearer functional layer must be more frosted than its container'}).toBe(true);
    const chosen=await material(selected),other=await material(sibling);
    expect(chosen.frost).toBeGreaterThanOrEqual(other.frost);
    expect(chosen.tint).toBeGreaterThanOrEqual(other.tint);
    expect(chosen.background).not.toBe(other.background);
    await selected.focus();
    await page.keyboard.press('ArrowRight');
    await expect(sibling).toHaveAttribute('aria-selected','true');
    await expect(sibling).toBeFocused();
    await expect(panel.getByRole('tabpanel',{name:'Motion'})).toBeVisible();
    await expect.poll(async()=>{
      const switched=await material(sibling),former=await material(selected);
      return switched.frost>=former.frost&&switched.tint>=former.tint&&switched.background!==former.background;
    },{message:'The selected lens settles above its sibling after the transition'}).toBe(true);
  });
}

for(const width of [390,320]) {
  test(`real command menu stays within a ${width}px viewport through resize and scroll`,async({page})=>{
    await page.setViewportSize({width,height:844});
    await page.goto('lab/universal-library/');
    const trigger=page.getByRole('toolbar',{name:'Workspace actions'}).getByRole('button',{name:'More',exact:true});
    const menu=page.getByRole('menu',{name:'Document actions'});
    await trigger.click();
    await expect(menu).toBeVisible();
    expect(await menu.evaluate(el=>el.matches(':popover-open')),'The topmost menu must escape the toolbar backdrop root').toBe(true);
    expect(await menu.evaluate(el=>!!el.parentElement.closest('.md-glass-menu-origin')),'Top-layer placement preserves the authored DOM and action delegation').toBe(true);
    await expect.poll(()=>menuWithinViewport(page,menu)).toBe(true);
    await expect(menu.getByRole('menuitem',{name:'Save',exact:true})).toBeFocused();
    await page.setViewportSize({width:width===390?320:390,height:568});
    await expect.poll(()=>menuWithinViewport(page,menu)).toBe(true);
    await page.evaluate(()=>scrollBy(0,80));
    await expect.poll(async()=>!(await menu.isVisible())||await menuWithinViewport(page,menu)).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    if(await menu.isVisible())await page.keyboard.press('Escape');
    await trigger.click();
    await expect.poll(()=>menuWithinViewport(page,menu)).toBe(true);
    await menu.getByRole('menuitem',{name:'Copy',exact:true}).click();
    await expect(menu).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded','false');
    await expect(page.locator('#glass-reference-status')).toHaveText('Copy selected.');
  });
}

test('real menu closes when keyboard focus leaves without stealing the next focus',async({page})=>{
  await page.goto('lab/universal-library/');
  const trigger=page.getByRole('toolbar',{name:'Workspace actions'}).getByRole('button',{name:'More',exact:true});
  const menu=page.getByRole('menu',{name:'Document actions'});
  await trigger.click();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem',{name:'Copy',exact:true})).toBeFocused();
  // Tab is a departure from a command menu, whose items use arrow navigation.
  await page.keyboard.press('Tab');
  await expect(menu).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded','false');
  await expect(page.getByRole('switch',{name:'Soft light'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('switch',{name:'Soft light'})).toBeFocused();
});

test('forced colors renders visible on/off controls and selected toolbar state',async({page})=>{
  await page.emulateMedia({forcedColors:'active'});
  await page.goto('lab/universal-library/');
  const control=page.getByRole('switch',{name:'Soft light'});
  await control.scrollIntoViewIfNeeded();
  await control.check();
  const on=await material(control);
  await control.uncheck();
  const off=await material(control);
  await expect(control).not.toBeChecked();
  if(on.appearance==='none'||off.appearance==='none') {
    for(const state of [on,off]) {
      expect(state.thumb.display,'A custom fallback must render its state indicator').not.toBe('none');
      expect(state.thumb.content).not.toBe('none');
      expect(state.thumb.width).toBeGreaterThan(0);
    }
    expect(on.thumb,'Custom on/off appearances need to differ').not.toEqual(off.thumb);
  } else {
    expect(['auto','checkbox']).toContain(on.appearance);
    expect(['auto','checkbox']).toContain(off.appearance);
  }
  await control.focus();
  const focused=await material(control);
  expect(focused.outline).not.toMatch(/^0px /);
  const slider=page.getByRole('slider',{name:'Focus',exact:true});
  await slider.focus();await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveValue('61');
  const sliderStyle=await material(slider);
  expect(sliderStyle.appearance,'Forced colors restores a visible native range').not.toBe('none');
  const toolbar=page.getByRole('toolbar',{name:'Workspace actions'});
  const selected=await material(toolbar.getByRole('button',{name:'Workspace',exact:true}));
  const sibling=await material(toolbar.getByRole('button',{name:'Explore',exact:true}));
  const selectionMark=state=>[state.background,state.outline,state.border,state.textDecoration].join('|');
  expect(selectionMark(selected),'Selection remains visibly marked without relying on shadows').not.toBe(selectionMark(sibling));
});

test('reduced motion preserves switch state, slider input, and opaque inspector access',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('lab/universal-library/');
  const control=page.getByRole('switch',{name:'Soft light'});
  await control.check();const on=await material(control);
  await control.uncheck();const off=await material(control);
  expect(on.thumb.left,'Quiet mode must retain the knob’s on/off position').not.toBe(off.thumb.left);
  const trigger=page.getByRole('toolbar',{name:'Workspace actions'}).getByRole('button',{name:'More',exact:true});
  await trigger.click();
  await expect(page.getByRole('menu',{name:'Document actions'})).toHaveCSS('animation-name','none');
  await page.keyboard.press('Escape');
  await page.goto('lab/living-workspace/');
  await page.locator('#opaque').check();
  await page.getByRole('button',{name:'Open panel'}).click();
  const panel=page.getByRole('complementary',{name:'Floating workspace panel'});
  await expect(panel).toBeVisible();
  await expect(panel).toHaveCSS('backdrop-filter','none');
  await page.getByRole('tab',{name:'Material',exact:true}).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab',{name:'Motion',exact:true})).toHaveAttribute('aria-selected','true');
  await expect(page.getByRole('tabpanel',{name:'Motion'})).toBeVisible();
});

test('increased contrast retains a visible opaque on/off indicator',async({page})=>{
  await page.emulateMedia({contrast:'more'});
  await page.goto('lab/universal-library/');
  const control=page.getByRole('switch',{name:'Soft light'});
  await control.check();const on=await material(control);
  await control.uncheck();const off=await material(control);
  expect(on.thumb.display).not.toBe('none');
  expect(off.thumb.display).not.toBe('none');
  await expect.poll(async()=>(await material(control)).thumb.left).not.toBe(on.thumb.left);
  await expect(page.locator('html')).toHaveAttribute('data-glass-transparency','opaque');
  await expect(page.locator('.md-glass-group').first()).toHaveCSS('backdrop-filter','none');
});
