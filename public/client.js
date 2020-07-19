
var sendRequest = () => {
    let req = new XMLHttpRequest();
    req.open('GET', "https://heroku-advanced-node.herokuapp.com/chat", true);
    req.onreadystatechange = () => {
      if(req.readyState == 4 && req.status == 200)
      {
         document.write(req.responseText);

         var socket = io.connect('https://heroku-advanced-node.herokuapp.com/');
         socket.on('user count', (data) => {
           console.log(data);
         });
      }
    }
    req.send();
}

//sendRequest();

$('document').ready(() => {
  /*global io*/
  var socket = io(); //Since connecting from inside the same domain. Not from outside.

  $('form').submit(() => {
    var messageToSend = $('m').val();
    socket.emit('chat message', messageToSend);
    $('m').val('');
    return false; //To prevent form from refreshing
  });

  socket.on('user', (data) => {
    $('num-users').text(data.currentUsers + ' users are online');
    var message = data.name;
    if(data.connected) message += ' has joined the chat';
    else message += ' has left the chat';

    $('messages').append($('<li>').html('<b>' + message + '</b>'));
  });

  socket.on('chat message', (data) => {
    $('#messages').append($('<li>').text(data.name+': '+data.message));
  });

});
