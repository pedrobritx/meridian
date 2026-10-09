import controls from '../../design/meridian/universal-core-a.json';
import records from '../../design/meridian/universal-core-b.json';
import projects from '../../design/meridian/universal-project-patterns.json';
import extended from '../../design/meridian/universal-extended.json';
export const universalComponents=Object.freeze([
  ...controls.items,...records.items,...projects.items,...extended.items
]);
export const universalGroups=Object.freeze([...new Set(universalComponents.map(item=>item.group))]);
export const projectNames=Object.freeze([...new Set(universalComponents.flatMap(item=>item.projects).filter(x=>x!=='all'))].sort());
export function componentsFor({search='',group='all',project='all'}={}) {
  const q=String(search).trim().toLocaleLowerCase();
  return universalComponents.filter(item=>
    (group==='all'||item.group===group)&&
    (project==='all'||item.projects.includes('all')||item.projects.includes(project))&&
    (!q||[item.name,item.anatomy,item.id,item.group,...item.projects].join(' ').toLocaleLowerCase().includes(q))
  );
}
export function findComponent(id){return universalComponents.find(item=>item.id===id)||null;}
