
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

sendRequest();

//var socket = io();
