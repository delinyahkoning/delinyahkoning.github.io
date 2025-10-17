// Year in footer
document.getElementById('y').textContent = new Date().getFullYear();

// Make hover/down states apply to both cursors
import './cursor.js';
import './switch.js';
import './lightbox.js';
import './hero-liquify.js';

// Add hover/down classes to cursors for all interactive elements
const dotCursor   = document.querySelector('.cursor--dot');
const solarCursor = document.querySelector('.cursor--solar');
function onEnter(){ dotCursor.classList.add('cursor--hover'); solarCursor.classList.add('cursor--hover'); }
function onLeave(){ dotCursor.classList.remove('cursor--hover'); solarCursor.classList.remove('cursor--hover'); }

const interactive = document.querySelectorAll('a,button,[data-lightbox],.tab,.tri-switch');
interactive.forEach(el=>{
  el.addEventListener('mouseenter', onEnter);
  el.addEventListener('mouseleave', onLeave);
});
document.addEventListener('mousedown', ()=>{ dotCursor.classList.add('cursor--down'); solarCursor.classList.add('cursor--down'); });
document.addEventListener('mouseup',   ()=>{ dotCursor.classList.remove('cursor--down'); solarCursor.classList.remove('cursor--down'); });
