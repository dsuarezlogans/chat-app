const mongo = require('mongodb');
const io = require('socket.io').listen(4000).sockets;

mongo.connect('mongodb://localhost:27017/mongochat', (err, db) => {
    if(err) {
       throw err;
    }
    console.log('MongoDb Connection Open!')

    io.on('connection', (socket) => {
        let chat = db.collection('chats');

        sendStatus = (s) => {
            socket.emit('status', s);
        }

        chat.find().limit(100).sort({_id: 1}).toArray((err, res) => {
            if(err) {
                throw err;
            }

            socket.emit('output', res);

            socket.on('inputs', (data) => {
                let name = data.name;
                let message = data.message;

                if(!name || !message){
                    sendStatus('please enter a name and a message');
                }
                else {
                    chat.insert({ name, message}, () => {
                        io.emit('output', [data]);
                        sendStatus({
                            message: 'message sent',
                            clear: true
                        });
                    });
                }
            });

            socket.on('clear', (data) => {
                chat.remove({}, () => {
                    socket.emit('cleared');
                });
            })
        });
    });

})