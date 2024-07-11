import * as net from "net";
import fs from "fs";
import path from "path";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data",(data)=>{
    const request = data.toString();
    const requestLine = request.split('\r\n');
    // console.log(requestLine)
    const [method,url,version] =requestLine[0].split(' ');
    const regex = /\/echo\/\w*/gi;
    const fileRegex = /\/files\/\w/gi;
    if(url == '/'){
      socket.write("HTTP/1.1 200 OK\r\n\r\n")
      return socket.end();
    }else if(regex.test(url)){
      let data = url.split('/')[2];
      let length = Buffer.byteLength(data);
      socket.write("HTTP/1.1 200 OK\r\nContent-Type:text/plain\r\nContent-Length:"+length+"\r\n\r\n"+data+"\r\n")
      return socket.end();
    }else if(url == '/user-agent'){
      const userAgent = requestLine.find(line=>{
        return line.match('User-Agent')
      })
      if(userAgent){
        const userAgentValue = userAgent.split(':')[1].trim();
        console.log('userAgent and value',userAgent,userAgentValue);
        socket.write("HTTP/1.1 200 OK\r\nContent-Type:text/plain\r\nContent-Length:" + userAgentValue.length + "\r\n\r\n" + userAgentValue + "\r\n");
        return socket.end();
      }
    }else if(fileRegex.test(url)){
      let data = url.split('/')[2];
      // let p = path.join('tmp',data);
        const index = process.argv.indexOf('--directory');
      let middlePath = null;
      if(index > -1 && index + 1 < process.argv.length){
        middlePath = process.argv[index + 1];
      }
      if(!middlePath){
        console.error('Error: --directory flag not provided');
        process.exit(1);
      }
      let p = path.join(middlePath,data);
      if(method=='POST'){
        const body = requestLine[requestLine.length - 1];
        if(body){
          let file = fs.writeFileSync(p,body);
          console.log(file)
        }
        console.log('body ',body)
        console.log('request' ,requestLine)
        socket.write('HTTP/1.1 201 Created\r\n\r\n');
        socket.end();
        return;
      }

    

      if(fs.existsSync(p)){
        let file = fs.readFileSync(p,'utf-8');
        let length = Buffer.byteLength(file);
        console.log(file);
        socket.write('HTTP/1.1 200 OK\r\nContent-Type:application/octet-stream\r\nContent-Length:'+length+'\r\n\r\n'+file);
        return socket.end();
      }
    }
      console.log('came inside not found',url)
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n")
      socket.end();
  })
  socket.on("close", () => {
    socket.end();
  });
});
//
server.listen(4221, "localhost");
