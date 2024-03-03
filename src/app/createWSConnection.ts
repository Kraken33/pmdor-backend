import socketIO from 'socket.io';

export const createWSConnection = ({server}: {server: any})=>{
    return new socketIO.Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });
}