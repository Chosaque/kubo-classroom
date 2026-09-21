export function sessionTime(task) {
  return Math.max(Date.parse(task.lastEventAt) || 0, ...(task.events || []).map(event => Date.parse(event.time) || 0));
}
export function sessions(tasks = [], query = '') {
  const needle = query.trim().toLocaleLowerCase();
  return tasks.filter(task => !task.isAgent && (!needle ||
    `${task.provider || 'Codex'} ${task.title || ''} ${task.id}`.toLocaleLowerCase().includes(needle)))
    .sort((a, b) => sessionTime(b) - sessionTime(a) || a.id.localeCompare(b.id));
}
