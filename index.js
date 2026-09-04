const express = require('express');
const {createServer} = require('node:http');
const {randomBytes} = require('node:crypto');
const app = express();
const server=createServer(app)
const {Server}=require('socket.io')
const io=new Server(server)
server.listen(3000)
const { join } = require('node:path');
const { isKeyObject } = require('node:util/types');
app.use(express.json());
app.use(express.static('public'))
console.log('http://localhost:3000/pages/controller.html')

// Password protection - controller sets these
let pagePasswords = {p1: '',p2: '',p3: ''};
const pageTokens = new Map();

// Controller sets passwords for pages
app.post('/api/set-passwords', (req, res) => {
  const { nc1, nc2, nc3 } = req.body;
  if (nc1) pagePasswords.p1 = nc1;
  if (nc2) pagePasswords.p2 = nc2;
  if (nc3) pagePasswords.p3 = nc3;
  res.json({ message: 'Passwords updated', pagePasswords });
});

// Validate password and return token
app.post('/api/validate-password', (req, res) => {
  const { page, password } = req.body;
  
  if (!page || !password) return res.status(400).json({ error: 'Page and password required' });
  if (!pagePasswords[page] || pagePasswords[page] !== password) return res.status(403).json({ error: 'Invalid password' });
  // Keep tokens opaque so they can be revoked by the controller.
  const token = randomBytes(32).toString('hex');
  pageTokens.set(token, page);
  res.json({ token, page });
});

// Protect pages - check token in query string
app.get(/^\/pages\/(p1|p2|p3)\.html$/, (req, res) => {
  const token = req.query.token;
  const pageMatch = req.path.match(/\/pages\/(p1|p2|p3)\.html/);
  const page = pageMatch[1];

  if (!token || pageTokens.get(token) !== page) return res.status(403).send('Token không hợp lệ.');

  pageTokens.delete(token);
  res.set('Cache-Control', 'no-store');
  res.sendFile(join(__dirname, 'public', req.path));
});

let crosswordGrid = [], wordCoordinates = [], letterQnas = [], crosswordClues = [],crosswordState=[],buzzed=[],slammed=[]
//0:empty,1:unopened,2:revealed,3:number
let alphabet = 'A Ă Â B C D Đ E Ê G H I K L M N O Ô Ơ P Q R S T U Ư V X Y'.split(' ')

io.on('connection',(s)=>{
  s.on('generateCrosswordGrid',(crossword, coords, clues, qnas, isFinal)=>{
    io.emit('generateCrosswordGrid', crossword,isFinal);
    crosswordGrid = crossword;
    wordCoordinates = coords;
    crosswordClues = clues;
    letterQnas = qnas;
    for (let i = 0; i < crossword.length; i++) {
      if (crossword[i] == null) {
        crosswordState[i] = 0;
      }
      else if (typeof crossword[i] === 'string') {
        crosswordState[i] = 1;
      }
      else if(typeof crossword[i] === 'number') {
        crosswordState[i] = 3;
      }
    }
  })
  s.on('resetCrossword',()=>{
    io.emit('resetCrossword');
  })
  s.on('showQuestion',(question)=>{
    console.log('showQuestion', question)
    io.emit('showQuestion', question);
  })
  s.on('showAnswer',(answer)=>{
    io.emit('showAnswer', answer);
  })
  s.on('revealWord',(wordNum,isFinal)=>{
    let indexesAndLettersToOpen = [];
    let wordCoordinate=wordCoordinates[wordNum-1]
    for(let i=0;i<wordCoordinate.length;i++){
      indexesAndLettersToOpen.push({ index: wordCoordinate[i], letter: crosswordGrid[wordCoordinate[i]] });
      if(crosswordState[wordCoordinate[i]]===1){
        crosswordState[wordCoordinate[i]]=2
      }
    }
    io.emit('revealWord', indexesAndLettersToOpen,isFinal);
  })
  s.on('hideWord',(wordNum)=>{
    let indexesToHide = [];
    let wordCoordinate=wordCoordinates[wordNum-1]
    for(let i=0;i<wordCoordinate.length;i++){
      if(crosswordState[wordCoordinate[i]]!=2){
        indexesToHide.push({ index: wordCoordinate[i]});
      }
    }
    io.emit('hideWord',indexesToHide);
  })
  s.on('checkRemainingLetterCount',(letter)=>{
    let count = 0;
    let letters = [];
    if (letter == 'A') {
      letters = ['A', 'Á', 'À', 'Ả', 'Ã', 'Ạ']
    }
    else if (letter == 'E') {
      letters = ['E', 'É', 'È', 'Ẻ', 'Ẽ', 'Ẹ']
    }
    else if (letter == 'I') {
      letters = ['I', 'Í', 'Ì', 'Ỉ', 'Ĩ', 'Ị']
    }
    else if (letter == 'O') {
      letters = ['O', 'Ó', 'Ò', 'Ỏ', 'Õ', 'Ọ']
    }
    else if (letter == 'U') {
      letters = ['U', 'Ú', 'Ù', 'Ủ', 'Ũ', 'Ụ']
    }
    else if (letter == 'Y') {
      letters = ['Y', 'Ý', 'Ỳ', 'Ỷ', 'Ỹ', 'Ỵ']
    }
    else if (letter == 'Â') {
      letters = ['Â', 'Ấ', 'Ầ', 'Ẩ', 'Ẫ', 'Ậ']
    }
    else if (letter == 'Ă') {
      letters = ['Ă', 'Ắ', 'Ằ', 'Ẳ', 'Ẵ', 'Ặ']
    }
    else if (letter == 'Ê') {
      letters = ['Ê', 'Ế', 'Ề', 'Ể', 'Ễ', 'Ệ']
    }
    else if (letter == 'Ô') {
      letters = ['Ô', 'Ố', 'Ồ', 'Ổ', 'Ỗ', 'Ộ']
    }
    else if (letter == 'Ơ') {
      letters = ['Ơ', 'Ớ', 'Ờ', 'Ở', 'Ỡ', 'Ợ']
    }
    else if (letter == 'Ư') {
      letters = ['Ư', 'Ứ', 'Ừ', 'Ử', 'Ữ', 'Ự']
    }
    else {
      letters = [letter]
    }
    for(let i=0;i<crosswordGrid.length;i++){
      letters.forEach((letter) => {
        if(crosswordGrid[i] === letter) {
          if(crosswordState[i]!=2){
            count++
          }
        }
      })
    }
    io.emit('remainingLetterCount', count);
  })

  s.on('revealSpecificLetterInCrossword',(letter,isFinal)=>{
    let indexesAndLettersToOpen = [];
    let letters = [];
    if (letter == 'A') {
      letters = ['A', 'Á', 'À', 'Ả', 'Ã', 'Ạ']
    }
    else if (letter == 'E') {
      letters = ['E', 'É', 'È', 'Ẻ', 'Ẽ', 'Ẹ']
    }
    else if (letter == 'I') {
      letters = ['I', 'Í', 'Ì', 'Ỉ', 'Ĩ', 'Ị']
    }
    else if (letter == 'O') {
      letters = ['O', 'Ó', 'Ò', 'Ỏ', 'Õ', 'Ọ']
    }
    else if (letter == 'U') {
      letters = ['U', 'Ú', 'Ù', 'Ủ', 'Ũ', 'Ụ']
    }
    else if (letter == 'Y') {
      letters = ['Y', 'Ý', 'Ỳ', 'Ỷ', 'Ỹ', 'Ỵ']
    }
    else if (letter == 'Â') {
      letters = ['Â', 'Ấ', 'Ầ', 'Ẩ', 'Ẫ', 'Ậ']
    }
    else if (letter == 'Ă') {
      letters = ['Ă', 'Ắ', 'Ằ', 'Ẳ', 'Ẵ', 'Ặ']
    }
    else if (letter == 'Ê') {
      letters = ['Ê', 'Ế', 'Ề', 'Ể', 'Ễ', 'Ệ']
    }
    else if (letter == 'Ô') {
      letters = ['Ô', 'Ố', 'Ồ', 'Ổ', 'Ỗ', 'Ộ']
    }
    else if (letter == 'Ơ') {
      letters = ['Ơ', 'Ớ', 'Ờ', 'Ở', 'Ỡ', 'Ợ']
    }
    else if (letter == 'Ư') {
      letters = ['Ư', 'Ứ', 'Ừ', 'Ử', 'Ữ', 'Ự']
    }
    else {
      letters = [letter]
    }
    for(let i=0;i<crosswordGrid.length;i++){
      letters.forEach((letter) => {
        if(crosswordGrid[i] === letter) {
          if(crosswordState[i]!=2){
            indexesAndLettersToOpen.push({ index: i, letter: crosswordGrid[i] });
          }
          if(crosswordState[i]===1){
            crosswordState[i]=2
          }
        }
      })
    }
    io.emit('revealTile', indexesAndLettersToOpen, isFinal);
    if(!isFinal){
      let numbersToHighlight = [];
      wordCoordinates.forEach((wordCoord, i) => {
        for(let j=0;j<indexesAndLettersToOpen.length;j++){
          if(wordCoord.includes(indexesAndLettersToOpen[j].index)){
            numbersToHighlight.push(i+1)
            console.log('highlighting word', i+1)
            io.emit('highlightNumber', numbersToHighlight)
          }
        }
      })
    }
  })
  s.on('highlightWord',(wordNum)=>{
    io.emit('highlightWord', wordCoordinates[wordNum-1]);
  })
  s.on('unhighlightWord',()=>{
    io.emit('unhighlightWord');
  })

  s.on('sound',sound=>{
    io.emit('sound', sound)
  })
  s.on('stopAllSounds',()=>{
    io.emit('stopAllSounds')
  })
  s.on('buzz',(data)=>{
    buzzed.push(data)
    if(buzzed.length==1){
      io.emit('buzzed',buzzed[0])
    }
  })
  s.on('slam',(data)=>{
    slammed.push(data)
    if(slammed.length==1){
      io.emit('slammed',slammed[0])
    }
  })
  s.on('resetBuzzers',()=>{
    buzzed=[]
    io.emit('buzzersReset')
  })
  s.on('resetSlams',()=>{
    slammed=[]
    io.emit('slamsReset')
  })
  s.on('openBuzzer',()=>{
    buzzed=[]
    io.emit('buzzersOpen')
  })
  s.on('openSlam',()=>{
    slammed=[]
    io.emit('slamsOpen')
  })
  s.on('closeBuzzer',()=>{
    buzzed=[]
    io.emit('buzzersClose')
  })
  s.on('closeSlam',()=>{
    slammed=[]
    io.emit('slamsClose')
  })
  s.on('timer60s',()=>{
    io.emit('timer60s')
    io.emit('sound','timer 60s')
  })
  s.on('stopTimer',()=>{
    io.emit('stopTimer')
  })
  s.on('showFinaleLetters',()=>{
    io.emit('showFinaleLetters')
  })
  s.on('revealFinaleLetter',(numer,letter)=>{
    io.emit('revealFinaleLetter',numer,letter)
  })
  s.on('updateScoreboard',(names,scores)=>{
    console.log('updateScoreboard',names,scores)
    io.emit('updateScoreboard',{names,scores})
  })
  s.on('logoutAllPlayerWebs',()=>{
    io.emit('logoutAllPlayerWebs')
  })
})