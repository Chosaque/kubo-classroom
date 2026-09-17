export const THEMES=['cream','mint','lavender'];
export const OUTFITS=['original','overalls','pinafore','hijab'];
export const taskActive=t=>['active','waiting'].includes(t?.runtimeState||t?.state);
export function roomVisible(task,hidden){return taskActive(task)||!hidden[task.id]||Date.parse(task.lastEventAt||'')>hidden[task.id];}
