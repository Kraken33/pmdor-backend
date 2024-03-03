import http from 'http';
import express from 'express';
import cors from 'cors';

const PORT = 3000;

export const createExpress = ()=>{ 
    const app = express();
    const server = http.createServer(app);

    app.use(cors());

    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`)
    });

    return {
        app,
        server,
    }
};