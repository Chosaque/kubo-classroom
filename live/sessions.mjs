export function sessions(tasks = [], query = '') {
  const needle = query.trim().toLocaleLowerCase();
  return tasks.filter(task => !task.isAgent && (!needle ||
    `${task.provider || 'Codex'} ${task.title || ''} ${task.id}`.toLocaleLowerCase().includes(needle)))
    .sort((a, b) => (Date.parse(b.lastEventAt) || 0) - (Date.parse(a.lastEventAt) || 0) || a.id.localeCompare(b.id));
}
