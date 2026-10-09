import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Forest reference keeps native tasks and appearance choices independent',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('lab/forest-reference/');
  await expect(page.getByRole('heading',{name:/A quieter kind of depth/})).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme',/dawn|dusk/);
  await page.locator('#appearance').selectOption('dusk');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dusk');
  await page.getByLabel('Ambient illumination').fill('78');
  await expect(page.locator('#illumination-value')).toHaveText('78%');
  await page.getByLabel('Material character').selectOption('quiet');
  await expect(page.locator('html')).toHaveAttribute('data-atmosphere','quiet');
  await page.getByRole('radio',{name:'Create'}).check();
  await page.getByRole('button',{name:'Confirm direction'}).click();
  await expect(page.locator('#task-feedback')).toContainText('Create');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dusk');
  await expect(page.locator('#illumination')).toHaveValue('78');
  await page.getByRole('button',{name:'Reset local settings'}).click();
  await expect(page.locator('#appearance')).toHaveValue('system');
  expect(errors).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
});

test('pending actions and unread history use separate indicators',async({page})=>{
  await page.goto('lab/forest-reference/');
  await expect(page.getByRole('heading',{name:'All clear'})).toBeVisible();
  await expect(page.locator('#unread-count')).toHaveText('2 unread');
  await expect(page.locator('#pending-count')).toHaveText('0 pending actions');
  await page.getByRole('button',{name:'Simulate issue'}).click();
  await expect(page.locator('#pending-count')).toHaveText('1 pending action');
  await expect(page.getByRole('heading',{name:'Action required'})).toBeVisible();
  await page.getByRole('button',{name:'Resolve issue'}).click();
  await expect(page.getByRole('heading',{name:'All clear'})).toBeVisible();
  await expect(page.locator('#pending-count')).toHaveText('0 pending actions');
  await page.locator('#history summary').click();
  await expect(page.getByRole('list',{name:'Recent announcement history'})).toBeVisible();
  await expect(page.getByText('Reference workspace')).toBeVisible();
  await expect(page.getByText('Forest Lab')).toBeVisible();
});

test('history explicit unread intent is preserved until explicit acknowledgement',async({page})=>{
  await page.goto('lab/forest-reference/');
  await page.locator('#history summary').click();
  const entry=page.locator('#history-h1');
  // Visual encounter may have acknowledged the entry already. First normalise
  // to read, then deliberately mark unread and verify it is not auto-cleared.
  if(await entry.getAttribute('data-unread')==='true')
    await entry.getByRole('button',{name:'Mark as read: Workspace update'}).click();
  await expect(entry).toHaveAttribute('data-unread','false');
  await entry.getByRole('button',{name:'Mark as unread: Workspace update'}).click();
  await expect(entry).toHaveAttribute('data-unread','true');
  await page.waitForTimeout(1200);
  await expect(entry).toHaveAttribute('data-unread','true');
  await entry.getByRole('button',{name:'Mark as read: Workspace update'}).click();
  await expect(entry).toHaveAttribute('data-unread','false');
});

test('a11y preferences force opaque/quiet fallback; HTML retains basic accessibility',async({page})=>{
  await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce',forcedColors:'active'});
  await page.goto('lab/forest-reference/');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dusk');
  await page.getByRole('checkbox',{name:'Optional translucent surface'}).check();
  await expect(page.locator('html')).toHaveAttribute('data-material','opaque');
  await expect(page.locator('html')).toHaveAttribute('data-motion','quiet');
  await expect(page.locator('#accessibility-note')).toContainText('Opaque fallback active');
  await page.getByRole('radio',{name:'Reflect'}).check();
  await page.getByRole('button',{name:'Confirm direction'}).click();
  await expect(page.locator('#task-feedback')).toContainText('Reflect');
  await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
  await expect(page.locator('html')).toHaveAttribute('data-material','glass');
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(audit.violations,JSON.stringify(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})))).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
});
