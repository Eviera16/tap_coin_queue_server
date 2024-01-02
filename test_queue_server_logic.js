const { workerData, parentPort } = require('worker_threads');
class Queue {
    constructor() {
        this.queue = [];
    }

    set_queue(queue) {
        this.queue = queue;
    }

    get_queue() {
        return this.queue;
    }

    get_queue_length() {
        return this.queue.length;
    }

    get_index(index) {
        try {
            return this.queue[index];
        }
        catch {
            return null;
        }
    }

    enqueue(client) {
        this.queue.push(client);
        return this.queue.length - 1;
    }

    dequeue() {
        return this.queue.shift();;
    }

    peek(index) {
        if (this.queue[index + 1] != null) {
            return true;
        }
        return false;
    }

    remove(client) {
        var remove_client = this.queue.indexOf(client)
        this.queue.splice(remove_client, 1);
        return true;
    }
}

// This is your logic for the worker thread
const data = workerData;
parentPort.postMessage({ event_type: "RTC", RTC: data.workerId });
var checking_queue = false;
var adding_user = false;
main_queue = new Queue();
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
var left_over_queue = []

function check_queue() {
    checking_queue = true;
    const queue_length = main_queue.get_queue_length();
    var no_more_matches = false;
    if (queue_length > 0) {
        var i = 0;
        while (no_more_matches == false) {
            if (adding_user) {
                console.log("ADDING USER IS TRUE");
                break;
            }
            if (left_over_queue.length > 0) {
                if (i != left_over_queue.length) {
                    const player_1 = left_over_queue[i];
                    const player_2 = main_queue.dequeue();

                    if (player_1 == player_2) {
                        parentPort.postMessage({ event_type: "DISCONNECT_USER", result: true, token: player_1 });
                    }
                    else {
                        left_over_queue.splice(i, 1);
                        parentPort.postMessage({ event_type: "MATCH_FOUND", player_1: player_1, player_2: player_2 })
                    }
                }
                else {
                    left_over_queue = [];
                }
            }
            else if (main_queue.peek(0)) {
                const player_1 = main_queue.dequeue();
                const player_2 = main_queue.dequeue();
                if (player_1 == player_2) {
                    parentPort.postMessage({ event_type: "DISCONNECT_USER", result: true, token: player_1 });
                }
                else {
                    parentPort.postMessage({ event_type: "MATCH_FOUND", player_1: player_1, player_2: player_2 })
                }
                i++;
            }
            else {
                if (main_queue.get_index(0) != null) {
                    var last_user = main_queue.get_index(0)
                    main_queue.remove(last_user)
                    left_over_queue.push(last_user)
                    // if there is a user, then send it back to clusters to be added to first available array
                    // and send back that checking queue for this thread is done
                    // parentPort.postMessage({ event_type: "THREAD_DONE", workerId: data.workerId })
                }
                else {
                    console.log("NO USERS IN QUEUE");
                    // else just send back that checking the queue for this thread is done
                    // parentPort.postMessage({ event_type: "THREAD_DONE", workerId: data.workerId })
                }
                no_more_matches = true
            }
            i++;
        }
        checking_queue = false;
    }
    else {
        checking_queue = false;
    }
}

parentPort.on('message', (message) => {
    // console.log(`Received message right here in worker ${data.workerId}:`, message['content']['token']);
    if (message["event_type"] == "CHECK_QUEUE") {
        main_queue.set_queue(message["users"]);
        check_queue();
    }
    else if (message['event_type'] == "DISCONNECT_USER") {
        const RESULT = main_queue.remove(message['token']);
        if (RESULT) {
            parentPort.postMessage({ event_type: "DISCONNECT_USER", result: true, token: message['token'] });
        }
        else {
            parentPort.postMessage({ event_type: "DISCONNECT_USER", result: false, token: message['token'] });
        }
    }

});

// set boolean maybe
// if the second check queue call overlaps with
// the first one

// handle moving user to another thread to match with someone if wait too long
// maybe have user in multiple threads and check threads out of sync; if a user
// is currently being checked in another thread set a boolean to not check him in
// different thread; once user is matched take them out of all threads immediately
// adjust this maybe