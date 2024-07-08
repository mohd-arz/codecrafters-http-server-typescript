import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data",(data)=>{
    const request = data.toString();
    const requestLine = request.split('\r\n');
    console.log(requestLine)
    const [method,url,version] =requestLine[0].split(' ');
    const regex = /\/echo\/\w*/gi;
    if(url == '/'){
      socket.write("HTTP/1.1 200 OK\r\n\r\n")
    } else if(regex.test(url)){
      let data = url.split('/')[2];
      let length = Buffer.byteLength(data);
      socket.write("HTTP/1.1 200 OK\r\nContent-Type:text/plain\r\nContent-Length:"+length+"\r\n\r\n"+data+"\r\n")
  }else if(url == '/user-agent'){
    const userAgent = requestLine.find(line=>{
      return line.match('User-Agent')
  })
  if(userAgent){
    const userAgentValue = userAgent.split(':')[1].trim();
    console.log('userAgent and value',userAgent,userAgentValue);
    socket.write("HTTP/1.1 200 OK\r\nContent-Type:text/plain\r\nContent-Length:" + userAgentValue.length + "\r\n\r\n" + userAgentValue + "\r\n");
  }
  }
  else{
    console.log('came inside not found',url)
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n")
    }
    socket.end();
  })
  socket.on("close", () => {
    socket.end();
  });
});
//
server.listen(4221, "localhost");
