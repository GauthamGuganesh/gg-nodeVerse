var sendRequest = () => {
    let req = new XMLHttpRequest();
    req.open('GET', "https://heroku-advanced-node.herokuapp.com/chat", true);
    req.onreadystatechange = () => {
      if(this.readyState == 4 && this.status == 200) document.write(this.responseText)
    }
    req.send();
}

sendRequest();

//var socket = io();
