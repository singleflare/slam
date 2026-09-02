const playerPath = window.location.pathname
const playerPageMatch = playerPath.match(/(p1|p2|p3)\.html$/)

function leavePlayerPage() {
  window.location.replace('/playerLogin.html')
}

/*if (!new URLSearchParams(window.location.search).has('token')) {
  leavePlayerPage()
}
else {
  // Remove the consumed token from browser history and the address bar.
  window.history.replaceState(null, '', playerPath)
}

window.addEventListener('pageshow', (event) => {
  if (event.persisted || !playerPageMatch) leavePlayerPage()
})*/
s.on('logoutAllPlayerWebs', () => {
  leavePlayerPage()
})
s.on('buzzersOpen', () => {
  $('#buzzer').prop('disabled', false)
})
s.on('buzzersClose', () => {
  $('#buzzer').prop('disabled', true)
})
s.on('buzzersReset', () => {
  $('#buzzer').prop('disabled', false)
})
s.on('slamsOpen', () => {
  $('#slam').prop('disabled', false)
})
s.on('slamsClose', () => {
  $('#slam').prop('disabled', true)
})
s.on('slamsReset', () => {
  $('#slam').prop('disabled', false)
})