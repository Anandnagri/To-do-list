// ----- DOM SELECTORS -----
const taskForm = document.getElementById(&quot;task-form&quot;);
const titleInput = document.getElementById(&quot;task-title&quot;);
const descInput = document.getElementById(&quot;task-desc&quot;);
const taskList = document.getElementById(&quot;task-list&quot;);
const searchInput = document.getElementById(&quot;search-input&quot;);
const sortBtn = document.getElementById(&quot;sort-priority-btn&quot;);
const clearCompletedBtn = document.getElementById(&quot;clear-completed-btn&quot;);
const themeToggleBtn = document.getElementById(&quot;toggle-theme-btn&quot;);
// ----- GLOBAL STATE -----
let tasks = JSON.parse(localStorage.getItem(&quot;tasks&quot;)) || [];
let isSortedByPriority = false;
// ----- EVENT LISTENERS -----
taskForm.addEventListener(&quot;submit&quot;, addTask);
searchInput.addEventListener(&quot;input&quot;, renderTasks);
sortBtn.addEventListener(&quot;click&quot;, toggleSortByPriority);
clearCompletedBtn.addEventListener(&quot;click&quot;, clearCompletedTasks);
themeToggleBtn.addEventListener(&quot;click&quot;, toggleTheme);
window.addEventListener(&quot;DOMContentLoaded&quot;, () =&gt; {
applySavedTheme();
renderTasks();
});
// ----- TASK FUNCTIONS -----
function addTask(e) {
e.preventDefault();
const title = titleInput.value.trim();
const desc = descInput.value.trim();
if (!title) return;
const task = {
id: Date.now(),
title,
description: desc,
completed: false,
createdAt: new Date().toISOString(),
priority: calculatePriority(title, desc),
};
tasks.push(task);
saveTasks();
renderTasks();
taskForm.reset();
}

// Smart Priority Calculation
function calculatePriority(title, desc) {
let score = 0;
const text = (title + &quot; &quot; + desc).toLowerCase();
const keywords = {
urgent: 5,
important: 3,
asap: 3,
now: 2,
today: 2,
later: -1,
low: -2,
someday: -3
};
for (const [word, value] of Object.entries(keywords)) {
if (text.includes(word)) score += value;
}
// Bonus if just added
score += 1;
return score;
}
function getPriorityLabel(score) {
if (score &gt;= 5) return { label: &quot;   High&quot;, className: &quot;high&quot; };
if (score &gt;= 2) return { label: &quot;⚠️ Medium&quot;, className: &quot;medium&quot; };
return { label: &quot;   Low&quot;, className: &quot;low&quot; };
}
function saveTasks() {
localStorage.setItem(&quot;tasks&quot;, JSON.stringify(tasks));
}
function renderTasks() {
const searchQuery = searchInput.value.toLowerCase();
taskList.innerHTML = &quot;&quot;;
let visibleTasks = tasks.filter(
(task) =&gt;
task.title.toLowerCase().includes(searchQuery) ||
task.description.toLowerCase().includes(searchQuery)
);
if (isSortedByPriority) {
visibleTasks.sort((a, b) =&gt; b.priority - a.priority);

}
visibleTasks.forEach((task) =&gt; {
const taskItem = createTaskElement(task);
taskList.appendChild(taskItem);
});
enableDragAndDrop();
}
function createTaskElement(task) {
const li = document.createElement(&quot;li&quot;);
li.className = &quot;task-item&quot;;
li.draggable = true;
li.dataset.id = task.id;
if (task.completed) li.classList.add(&quot;completed&quot;);
const { label, className } = getPriorityLabel(task.priority);
li.innerHTML = `
&lt;div class=&quot;task-title&quot;&gt;
${task.title}
&lt;span class=&quot;priority-badge ${className}&quot; aria-label=&quot;Priority level&quot;&gt;${label}&lt;/span&gt;
&lt;/div&gt;
&lt;div class=&quot;task-desc&quot;&gt;${task.description || &quot;&quot;}&lt;/div&gt;
&lt;div class=&quot;task-actions&quot;&gt;
&lt;button class=&quot;complete-btn&quot; aria-label=&quot;Mark as complete&quot;&gt;✅&lt;/button&gt;
&lt;button class=&quot;delete-btn&quot; aria-label=&quot;Delete task&quot;&gt;  ️&lt;/button&gt;
&lt;/div&gt;
`;
li.querySelector(&quot;.complete-btn&quot;).addEventListener(&quot;click&quot;, () =&gt; {
task.completed = !task.completed;
saveTasks();
renderTasks();
});
li.querySelector(&quot;.delete-btn&quot;).addEventListener(&quot;click&quot;, () =&gt; {
tasks = tasks.filter((t) =&gt; t.id !== task.id);
saveTasks();
renderTasks();
});
return li;
}
function toggleSortByPriority() {

isSortedByPriority = !isSortedByPriority;
sortBtn.setAttribute(&quot;aria-pressed&quot;, isSortedByPriority);
renderTasks();
}
function clearCompletedTasks() {
tasks = tasks.filter((task) =&gt; !task.completed);
saveTasks();
renderTasks();
}
// ----- THEME TOGGLE -----
function toggleTheme() {
document.body.classList.toggle(&quot;dark&quot;);
localStorage.setItem(&quot;theme&quot;, document.body.classList.contains(&quot;dark&quot;) ? &quot;dark&quot; : &quot;light&quot;);
}
function applySavedTheme() {
const saved = localStorage.getItem(&quot;theme&quot;);
if (saved === &quot;dark&quot;) document.body.classList.add(&quot;dark&quot;);
}
// ----- DRAG &amp; DROP -----
function enableDragAndDrop() {
const items = document.querySelectorAll(&quot;.task-item&quot;);
items.forEach((item) =&gt; {
item.addEventListener(&quot;dragstart&quot;, dragStart);
item.addEventListener(&quot;dragover&quot;, dragOver);
item.addEventListener(&quot;drop&quot;, drop);
item.addEventListener(&quot;dragend&quot;, dragEnd);
});
}
let dragSrcEl = null;
function dragStart(e) {
dragSrcEl = this;
this.classList.add(&quot;dragging&quot;);
e.dataTransfer.effectAllowed = &quot;move&quot;;
}
function dragOver(e) {
e.preventDefault();
this.parentNode.insertBefore(dragSrcEl, this.nextSibling);
}
function drop(e) {

e.preventDefault();
const newOrder = [...document.querySelectorAll(&quot;.task-item&quot;)].map((el) =&gt; +el.dataset.id);
tasks.sort((a, b) =&gt; newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
saveTasks();
renderTasks();
}
function dragEnd() {
this.classList.remove(&quot;dragging&quot;);
}