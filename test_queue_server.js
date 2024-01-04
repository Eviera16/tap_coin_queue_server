const cluster = require('cluster');
const os = require('os');
const express = require('express');
const socket = require('socket.io');
const fs = require('fs')
var http = require("http");
class QueueClient {
    constructor(token, socketId, league, xcoord, ycoord) {
        this.token = token;
        this.socketId = socketId;
        this.league = league;
        this.xcoord = xcoord;
        this.ycoord = ycoord;
        this.in_game = false;
        this.sent2game = false;
    }
    get_token() {
        return this.token;
    }
    get_socketId() {
        return this.socketId;
    }
    get_in_game() {
        return this.in_game;
    }
    set_in_game(inGame) {
        this.in_game = inGame;
    }
    get_sent2game() {
        return this.sent2game;
    }
    set_sent2game(sent) {
        this.sent2game = sent;
    }
    check_queue(queue_pop, _io) {
        _io.to(this.socketId).emit("CHECKQUEUE", queue_pop);
    }

    send_message(message, to_socketId, _io) {
        _io.to(this.socketId).emit("FOUNDGAME", message);
        _io.to(to_socketId).emit("FOUNDGAME", message);
    }
}
const DEBUG = true;
var all_threads_running = false;
var NOOB_CLUSTER = null;
var BAD_CLUSTER = null;
var OKAY_CLUSTER = null;
var BETTER_CLUSTER = null;
var GOOD_CLUSTER = null;
var SOLID_CLUSTER = null;
var SUPER_CLUSTER = null;
var MEGA_CLUSTER = null;
var GODLY_CLUSTER = null;
var clusters_and_threads = {}
var all_clients = new Map();
var tokens_to_sockets = new Map();
// if (DEBUG) {
//     console.log("DEBUG IS TRUE")
//     setInterval(function () {
//         console.log("PING!")
//         http.get("http://127.0.0.1:3000");
//     }, 300000);
// }
// else {
//     setInterval(function () {
//         http.get("http://tapped-queue.herokuapp.com");
//     }, 300000);
// }
if (cluster.isMaster) {
    const app = express()
    var PORT = process.env.PORT || 3000;
    const server = app.listen(PORT)
    console.log("SERVER IS RUNNING ...");
    const io = socket(server);
    // console.log("IS THE MASTER");
    // Fork workers based on the number of CPU cores
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++) {
        if (i == 1) {
            break;
        }
        switch (i) {
            case 0:
                NOOB_CLUSTER = cluster.fork();
                clusters_and_threads["NOOB"] = {
                    "1": false,
                    "2": false,
                    "3": false,
                }
                console.log("NOOB_CLUSTER is running...");
                break;
            case 1:
                BAD_CLUSTER = cluster.fork();
                clusters_and_threads["BAD"] = {
                    "1": false,
                    "2": false,
                    "3": false,
                }
                console.log("BAD_CLUSTER is running...");
                break;
            case 2:
                OKAY_CLUSTER = cluster.fork();
                clusters_and_threads["OKAY"] = {
                    "1": false,
                    "2": false,
                    "3": false,
                }
                console.log("OKAY_CLUSTER is running...");
                break;
            case 3:
                BETTER_CLUSTER = cluster.fork();
                clusters_and_threads["BETTER"] = {
                    "1": false,
                    "2": false,
                    "3": false,
                }
                console.log("BETTER_CLUSTER is running...");
                break;
            case 4:
                GOOD_CLUSTER = cluster.fork();
                clusters_and_threads["GOOD"] = {
                    "1": false,
                    "2": false,
                    "3": false,
                }
                console.log("GOOD_CLUSTER is running...");
                break;
            case 5:
                SOLID_CLUSTER = cluster.fork();
                clusters_and_threads["SOLID"] = {
                    "1": false,
                    "2": false,
                    "3": false,
                }
                console.log("SOLID_CLUSTER is running...");
                break;
            case 6:
                SUPER_CLUSTER = cluster.fork();
                clusters_and_threads["SUPER"] = {
                    "1": false,
                    "2": false,
                    "3": false,
                }
                console.log("SUPER_CLUSTER is running...");
                break;
            case 7:
                MEGA_CLUSTER = cluster.fork();
                clusters_and_threads["MEGA"] = {
                    "1": false,
                    "2": false,
                    "3": false,
                }
                console.log("MEGA_CLUSTER is running...");
                break;
            default:
                GODLY_CLUSTER = cluster.fork();
                clusters_and_threads["GODLY"] = {
                    "1": false,
                    "2": false,
                    "3": false,
                }
                console.log("GOLDY_WORKER is running...");
                break;
        }
    }
    io.on('connection', (socket) => {

        io.to(socket.id).emit('connected', "CONNECTED");

        if (all_threads_running) {
            socket.on('PUTINQUEUE', (data) => {
                console.log("ENQUEUEING USER");
                var data_split = data.split("|");
                const TOKEN = data_split[0];
                const LEAGUE = data_split[1];
                const XCOORD = data_split[2];
                const YCOORD = data_split[3];
                var new_client = new QueueClient(TOKEN, socket.id, LEAGUE, XCOORD, YCOORD);
                all_clients.set(socket.id, new_client);
                tokens_to_sockets.set(TOKEN, socket.id);
                // current line: 181 | Dont forget to erase this eventually | line: 182 
                TEMP_LEAGUE = "1"
                send_users_to_leagues(TEMP_LEAGUE, new_client)
            })
            socket.on('disconnect', () => {
                console.log("IN DISCONNECT IN SOCKET !!!!!!!!!!");
                try {
                    var curr_user = all_clients.get(socket.id);
                    console.log("SOCKET ID IS !!!!!!!!!!: ", socket.id);
                    if (curr_user != null) {
                        console.log("CURR_USER IS NOT NULL !!!!!!!!!!");
                        var token = curr_user.get_token();
                        tokens_to_sockets.delete(token);
                        const LEAGUE = curr_user.league;
                        disconnect_user_from_queue(LEAGUE, curr_user);
                    }
                    else {
                        console.log("USER ALREADY LEFT ELSE !!!!!!!!!!:");
                    }
                }
                catch {
                    console.log("USER ALREADY LEFT CATCH !!!!!!!!!!:");
                }
            })
            socket.on('error', () => {
                console.log("IN ERROR IN SOCKET !!!!!!!!!!");
                try {
                    var curr_user = all_clients.get(socket.id);
                    if (curr_user != null) {
                        const LEAGUE = curr_user.league;
                        disconnect_user_from_queue(LEAGUE, curr_user);
                    }
                    else {
                        console.log("USER ALREADY LEFT ELSE");
                    }
                }
                catch {
                    console.log("USER ALREADY LEFT CATCH");
                }
            })
            socket.on('CREATE2GAME', (message) => {
                try {
                    var message_split = message.split("|");
                    const SENDING_TOKEN = message_split[0];
                    const PLAYER_1 = message_split[1];
                    const PLAYER_2 = message_split[2];
                    const GAME_ID = message_split[3];
                    var sending_user_socket = tokens_to_sockets.get(SENDING_TOKEN);
                    const sending_user = all_clients.get(sending_user_socket);
                    if (sending_user.get_sent2game() == false) {
                        sending_user.set_sent2game(true);
                        const MESSAGE = PLAYER_1 + "|" + PLAYER_2 + "|" + GAME_ID
                        io.to(sending_user_socket).emit("CREATE2GAME", MESSAGE);
                    }
                }
                catch {
                    console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
                    console.log("ALREADY CREATED THE USERS GAME");
                    console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
                }
            })
            // Rename to REMOVEFROMALLCLIENTS
            socket.on('REMOVEFROMQUEUE', (msg) => {
                try {
                    const msg_split = msg.split("|");
                    const PLAYER_1_TOKEN = msg_split[0];
                    const PLAYER_2_TOKEN = msg_split[1];
                    const PLAYER_1_SOCKET = tokens_to_sockets.get(PLAYER_1_TOKEN);
                    const PLAYER_2_SOCKET = tokens_to_sockets.get(PLAYER_2_TOKEN);

                    all_clients.delete(PLAYER_1_SOCKET);
                    all_clients.delete(PLAYER_2_SOCKET);
                    tokens_to_sockets.delete(PLAYER_1_TOKEN);
                    tokens_to_sockets.delete(PLAYER_2_TOKEN);
                    io.to(PLAYER_1_SOCKET).emit("LEFTQUEUE");
                    io.to(PLAYER_2_SOCKET).emit("LEFTQUEUE");
                }
                catch {
                    console.log("USER ALREADY REMOVED &&&&&&&&&&");
                }
            })
        }
    })

    // wait for responses from threads
    cluster.on('message', (worker, message, handle) => {
        if (message.event_type == "RTC") {
            console.log(`Running queue in Cluster: ${message.workerId} Thread: ${message.threadId}`);
            turn_queues_on(message.workerId, message.threadId, false);
            check_threads_are_up()
        }
        else if (message.event_type == "DISCONNECT_USER") {
            if (message.result) {
                try {
                    all_clients.delete(socket.id);
                    console.log(`Successfully disconnected ${message.token} from the queue. !!!!!!!!!!`);
                }
                catch {
                    console.log(`Already disconnected ${message.token} from the queue. !!!!!!!!!!`);
                }
            }
            else {
                console.log(`Could not disconnect ${message.token} from the queue. !!!!!!!!!!`);
            }
        }
        else if (message.event_type == "MATCH_FOUND") {
            const FOUND_PLAYER_1 = all_clients.get(message.player_1.socketId);
            const FOUND_PLAYER_2 = all_clients.get(message.player_2.socketId);
            console.log("FOUND PLAYER 1: ", FOUND_PLAYER_1);
            console.log("FOUND PLAYER 2: ", FOUND_PLAYER_2);
            if (FOUND_PLAYER_1.in_game == false && FOUND_PLAYER_2.in_game == false) {
                console.log("IN GAME IS FALSE FOR BOTH USERS");
                FOUND_PLAYER_1.in_game = true;
                FOUND_PLAYER_2.in_game = true;
                const MESSAGE = FOUND_PLAYER_1.token + "|" + FOUND_PLAYER_2.token;
                console.log("EMITTING MESSAGE: ", MESSAGE);
                io.to(message.player_1.socketId).emit("FOUNDGAME1", MESSAGE);
            }
        }
    });

    // handle moving user to different cluster if wait time too long; maybe also
    // handle sending information about moving from thread to thread as well

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        // You can decide to fork a new worker here
    });
} else {
    // This is your actual server logic for either the queue or the game server
    require('./test_queue_server_threads.js');

    // process.on('message', (message) => {
    //     console.log(`Received message in worker ${cluster.worker.id}:`, message);
    // });
}

function convert_num_to_league(num) {
    switch (num) {
        case 1:
            return "NOOB";
        case 2:
            return "BAD";
        case 3:
            return "OKAY";
        case 4:
            return "BETTER";
        case 5:
            return "GOOD";
        case 6:
            return "SOLID";
        case 7:
            return "SUPER";
        case 8:
            return "MEGA";
        default:
            return "GODLY";
    }
}

function turn_queues_on(cluster, thread, checking) {
    switch (cluster) {
        case 1:
            if (thread == 1) {
                if (checking) {
                    return clusters_and_threads["NOOB"]["1"];
                } else {
                    clusters_and_threads["NOOB"]["1"] = true
                }
            }
            else if (thread == 2) {
                if (checking) {
                    return clusters_and_threads["NOOB"]["2"];
                } else {
                    clusters_and_threads["NOOB"]["2"] = true
                }
            }
            else {
                if (checking) {
                    return clusters_and_threads["NOOB"]["3"];
                } else {
                    clusters_and_threads["NOOB"]["3"] = true
                }
            }
            break;
        case 2:
            if (thread == 1) {
                if (checking) {
                    return clusters_and_threads["BAD"]["1"];
                } else {
                    clusters_and_threads["BAD"]["1"] = true
                }
            }
            else if (thread == 2) {
                if (checking) {
                    return clusters_and_threads["BAD"]["2"];
                } else {
                    clusters_and_threads["BAD"]["2"] = true
                }
            }
            else {
                if (checking) {
                    return clusters_and_threads["BAD"]["3"];
                } else {
                    clusters_and_threads["BAD"]["3"] = true
                }
            }
            break;
        case 3:
            if (thread == 1) {
                if (checking) {
                    return clusters_and_threads["OKAY"]["1"];
                } else {
                    clusters_and_threads["OKAY"]["1"] = true;
                }
            }
            else if (thread == 2) {
                if (checking) {
                    return clusters_and_threads["OKAY"]["2"];
                } else {
                    clusters_and_threads["OKAY"]["2"] = true;
                }
            }
            else {
                if (checking) {
                    return clusters_and_threads["OKAY"]["3"];
                } else {
                    clusters_and_threads["OKAY"]["3"] = true;
                }
            }
            break;
        case 4:
            if (thread == 1) {
                if (checking) {
                    return clusters_and_threads["BETTER"]["1"];
                } else {
                    clusters_and_threads["BETTER"]["1"] = true
                }
            }
            else if (thread == 2) {
                if (checking) {
                    return clusters_and_threads["BETTER"]["2"];
                } else {
                    clusters_and_threads["BETTER"]["2"] = true
                }
            }
            else {
                if (checking) {
                    return clusters_and_threads["BETTER"]["3"];
                } else {
                    clusters_and_threads["BETTER"]["3"] = true
                }
            }
            break;
        case 5:
            if (thread == 1) {
                if (checking) {
                    return clusters_and_threads["GOOD"]["1"];
                } else {
                    clusters_and_threads["GOOD"]["1"] = true
                }
            }
            else if (thread == 2) {
                if (checking) {
                    return clusters_and_threads["GOOD"]["2"];
                } else {
                    clusters_and_threads["GOOD"]["2"] = true
                }
            }
            else {
                if (checking) {
                    return clusters_and_threads["GOOD"]["3"];
                } else {
                    clusters_and_threads["GOOD"]["3"] = true
                }
            }
            break;
        case 6:
            if (thread == 1) {
                if (checking) {
                    return clusters_and_threads["SOLID"]["1"];
                } else {
                    clusters_and_threads["SOLID"]["1"] = true
                }
            }
            else if (thread == 2) {
                if (checking) {
                    return clusters_and_threads["SOLID"]["2"];
                } else {
                    clusters_and_threads["SOLID"]["2"] = true
                }
            }
            else {
                if (checking) {
                    return clusters_and_threads["SOLID"]["3"];
                } else {
                    clusters_and_threads["SOLID"]["3"] = true
                }
            }
            break;
        case 7:
            if (thread == 1) {
                if (checking) {
                    return clusters_and_threads["SUPER"]["1"];
                } else {
                    clusters_and_threads["SUPER"]["1"] = true
                }
            }
            else if (thread == 2) {
                if (checking) {
                    return clusters_and_threads["SUPER"]["2"];
                } else {
                    clusters_and_threads["SUPER"]["2"] = true
                }
            }
            else {
                if (checking) {
                    return clusters_and_threads["SUPER"]["3"];
                } else {
                    clusters_and_threads["SUPER"]["3"] = true
                }
            }
            break;
        case 8:
            if (thread == 1) {
                if (checking) {
                    return clusters_and_threads["MEGA"]["1"];
                } else {
                    clusters_and_threads["MEGA"]["1"] = true
                }
            }
            else if (thread == 2) {
                if (checking) {
                    return clusters_and_threads["MEGA"]["2"];
                } else {
                    clusters_and_threads["MEGA"]["2"] = true
                }
            }
            else {
                if (checking) {
                    return clusters_and_threads["MEGA"]["3"];
                } else {
                    clusters_and_threads["MEGA"]["3"] = true
                }
            }
            break;
        default:
            if (thread == 1) {
                if (checking) {
                    return clusters_and_threads["NOOB"]["1"];
                } else {
                    clusters_and_threads["NOOB"]["1"] = true
                }
            }
            else if (thread == 2) {
                if (checking) {
                    return clusters_and_threads["NOOB"]["2"];
                } else {
                    clusters_and_threads["NOOB"]["2"] = true
                }
            }
            else {
                if (checking) {
                    return clusters_and_threads["NOOB"]["3"];
                } else {
                    clusters_and_threads["NOOB"]["3"] = true
                }
            }
            break;
    }
}

function check_threads_are_up() {
    all_queues_up = true;
    for (var i = 1; i < 9; i++) {
        if (i == 2) {
            all_queues_up = true;
            break;
        }
        for (var j = 1; j < 4; j++) {
            all_queues_up = turn_queues_on(i, j, true)
        }
    }
    if (all_queues_up) {
        all_threads_running = true;
    }
    else {
        all_threads_running = false;
    }
}

function send_users_to_leagues(league, user) {
    switch (league) {
        case "1":
            console.log("SENDING USER TO NOOB CLUSTER");
            NOOB_CLUSTER.send({ event_type: "ADD_USER", user: user });
            break;
        case "2":
            console.log("SENDING USER TO BAD CLUSTER");
            BAD_CLUSTER.send({ event_type: "ADD_USER", user: user });
            break;
        case "3":
            console.log("SENDING USER TO OKAY CLUSTER");
            OKAY_CLUSTER.send({ event_type: "ADD_USER", user: user });
            break;
        case "4":
            console.log("SENDING USER TO BETTER CLUSTER");
            BETTER_CLUSTER.send({ event_type: "ADD_USER", user: user });
            break;
        case "5":
            console.log("SENDING USER TO GOOD CLUSTER");
            GOOD_CLUSTER.send({ event_type: "ADD_USER", user: user });
            break;
        case "6":
            console.log("SENDING USER TO SOLID CLUSTER");
            SOLID_CLUSTER.send({ event_type: "ADD_USER", user: user });
            break;
        case "7":
            console.log("SENDING USER TO SUPER CLUSTER");
            SUPER_CLUSTER.send({ event_type: "ADD_USER", user: user });
            break;
        case "8":
            console.log("SENDING USER TO MEGA CLUSTER");
            MEGA_CLUSTER.send({ event_type: "ADD_USER", user: user });
            break;
        default:
            console.log("SENDING USER TO GODLY CLUSTER");
            GODLY_CLUSTER.send({ event_type: "ADD_USER", user: user });
            break;
    }
}

function disconnect_user_from_queue(league, user) {
    console.log(`THE LEAGUE NUMBER IS: ${league}`);
    switch (league) {
        case "1":
            console.log("GOT IN THE NOOB CLUSTER");
            NOOB_CLUSTER.send({ event_type: "DISCONNECT_USER", user: user });
            break;
        case "2":
            console.log("GOT IN THE BAD CLUSTER");
            BAD_CLUSTER.send({ event_type: "DISCONNECT_USER", user: user });
            break;
        case "3":
            OKAY_CLUSTER.send({ event_type: "DISCONNECT_USER", user: user });
            break;
        case "4":
            BETTER_CLUSTER.send({ event_type: "DISCONNECT_USER", user: user });
            break;
        case "5":
            GOOD_CLUSTER.send({ event_type: "DISCONNECT_USER", user: user });
            break;
        case "6":
            SOLID_CLUSTER.send({ event_type: "DISCONNECT_USER", user: user });
            break;
        case "7":
            SUPER_CLUSTER.send({ event_type: "DISCONNECT_USER", user: user });
            break;
        case "8":
            MEGA_CLUSTER.send({ event_type: "DISCONNECT_USER", user: user });
            break;
        default:
            console.log("GOT IN THE GODLY CLUSTER");
            GODLY_CLUSTER.send({ event_type: "DISCONNECT_USER", user: user });
            break;
    }
}