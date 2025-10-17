// Cursor follow (both cursors)
const dotCursor   = document.querySelector('.cursor--dot');
const solarCursor = document.querySelector('.cursor--solar');

function handleMove(e){
  const x = e.clientX + 'px', y = e.clientY + 'px';
  dotCursor.style.left = x; dotCursor.style.top = y;
  solarCursor.style.left = x; solarCursor.style.top = y;
}
document.addEventListener('mousemove', handleMove);
