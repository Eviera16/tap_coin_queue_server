const { Worker } = require('worker_threads');
const cluster = require('cluster');
const ARRAY_STATUS = {
    FEEDING: 1,
    SENDING: 2,
    INACTIVE: 3,
}
var INSERT_ARRAY_1 = {
    "status": ARRAY_STATUS.FEEDING,
    "array": []
};
var INSERT_ARRAY_2 = {
    "status": ARRAY_STATUS.INACTIVE,
    "array": []
};
var INSERT_ARRAY_3 = {
    "status": ARRAY_STATUS.SENDING,
    "array": []
};
var sending_users = false;
var thread1_checking_queue = false;

const thread1 = new Worker('./test_queue_server_logic.js',
    {
        workerData: {
            "workerId": "1",
            "league": cluster.worker.id
        }
    });
// const thread2 = new Worker('./test_queue_server_logic.js', {
//     workerData: {
//         "workerId": "2",
//         "league": cluster.worker.id
//     }
// });
// const thread3 = new Worker('./test_queue_server_logic.js', {
//     workerData: {
//         "workerId": "3",
//         "league": cluster.worker.id
//     }
// });

setInterval(function () {
    check_queue()
}, 3000);

process.on('message', (message) => {
    if (message.event_type == "ADD_USER") {
        if (INSERT_ARRAY_1.status == ARRAY_STATUS.FEEDING) {
            INSERT_ARRAY_1.array.push(message.user);
        }
        else if (INSERT_ARRAY_2.status == ARRAY_STATUS.FEEDING) {
            INSERT_ARRAY_2.array.push(message.user);
        }
        else if (INSERT_ARRAY_3.status == ARRAY_STATUS.FEEDING) {
            INSERT_ARRAY_3.array.push(message.user);
        }
        else {
            // send message to user that queue is full 
            // figure out requeueing user when there is space
        }
    }
    else if (message.event_type == "DISCONNECT_USER") {
        disconnect_user(message.user);
    }
});

thread1.on('message', (message) => {
    // Handle messages from the workerlo from Worker: ${message.data['testing']}` });
    if (message.event_type == "RTC") {
        const THREAD_ID = message.RTC;
        process.send({ event_type: "RTC", RTC: true, threadId: THREAD_ID, workerId: cluster.worker.id });
    }
    else if (message.event_type == "DISCONNECT_USER") {
        process.send({ event_type: "DISCONNECT_USER", result: message.result, token: message.token });
    }
    else if (message.event_type == "MATCH_FOUND") {
        process.send({ event_type: "MATCH_FOUND", player_1: message.player_1, player_2: message.player_2 })
    }
    // else if (message.event_type == "THREAD_DONE") {
    //     // check which thread is done and set the checking queue value for that thread
    //     if (message.workerId == 1) {
    //         thread1_checking_queue = false;
    //     }
    //     // repeat for other threads
    //     // process.send({ event_type: "MATCH_FOUND", player_1: message.player_1, player_2: message.player_2 })
    // }
});

// handle when users has waited too long in thread and needs to be moved to
// a different thread; if still too long then add to a different cluster 
// set booleans in user objets to handle levels of threads and clusters
// for each users during the wait time

// thread2.on('message', (message) => {
//     // Handle messages from the worker
//     if (message.event_type == "RTC") {
//         const THREAD_ID = message.RTC;
//         process.send({ event_type: "RTC", RTC: true, threadId: THREAD_ID, workerId: cluster.worker.id });
//     }
//     else if (message.event_type == "ADD_USER") {
//         process.send({ event_type: "ADD_USER", message: message.message });
//     }
// });

// handle when users has waited too long in thread and needs to be moved to
// a different thread; if still too long then add to a different cluster 
// set booleans in user objets to handle levels of threads and clusters
// for each users during the wait time

// thread3.on('message', (message) => {
//     // Handle messages from the worker
//     if (message.event_type == "RTC") {
//         const THREAD_ID = message.RTC;
//         process.send({ event_type: "RTC", RTC: true, threadId: THREAD_ID, workerId: cluster.worker.id });
//     }
//     else if (message.event_type == "ADD_USER") {
//         process.send({ event_type: "ADD_USER", message: message.message });
//     }
// });

// handle when users has waited too long in thread and needs to be moved to
// a different thread; if still too long then add to a different cluster 
// set booleans in user objets to handle levels of threads and clusters
// for each users during the wait time

thread1.on('error', (error) => {
    // Handle errors in the worker
    console.error(`Thread1 error: ${error}`);
});

thread1.on('exit', (code) => {
    // Handle worker exit
    console.log(`Thread1 exited with code ${code}`);
});

// thread2.on('error', (error) => {
//     // Handle errors in the worker
//     console.error(`Thread2 error: ${error}`);
// });

// thread2.on('exit', (code) => {
//     // Handle worker exit
//     console.log(`Thread2 exited with code ${code}`);
// });

// thread3.on('error', (error) => {
//     // Handle errors in the worker
//     console.error(`Thread3 error: ${error}`);
// });

// thread3.on('exit', (code) => {
//     // Handle worker exit
//     console.log(`Thread3 exited with code ${code}`);
// });

function placement_by_x_y_coord(user) {
    console.log("IN PLACEMENT BY X Y COORD ##########");
    const X_COORD = user.xcoord
    const Y_COORD = user.ycoord
    if (X_COORD < 100 && Y_COORD < 100) {
        console.log("IT IS THREAD 1 ##########");
        thread1.postMessage({ event_type: "ADD_USER", user: user })
    }
    // else if (X_COORD < 200 && Y_COORD < 200) {
    //     console.log("IT IS THREAD 2");
    //     thread2.postMessage({ event_type: "ADD_USER", user: user })
    // }
    // else if (X_COORD < 300 && Y_COORD < 300) {
    //     console.log("IT IS THREAD 3");
    //     thread3.postMessage({ event_type: "ADD_USER", user: user })
    // }
}

function disconnect_user(user) {
    const X_COORD = user.xcoord
    const Y_COORD = user.ycoord
    if (X_COORD < 100 && Y_COORD < 100) {
        console.log("IT IS THREAD 1");
        thread1.postMessage({ event_type: "DISCONNECT_USER", token: user.token })
    }
    // else if (X_COORD < 200 && Y_COORD < 200) {
    //     console.log("IT IS THREAD 2");
    //     thread2.postMessage({ event_type: "ADD_USER", user: user })
    // }
    // else if (X_COORD < 300 && Y_COORD < 300) {
    //     console.log("IT IS THREAD 3");
    //     thread3.postMessage({ event_type: "ADD_USER", user: user })
    // }
}

function sending_array_logic(array1, array2, array3) {
    if (array1.array.length > 0) {
        // figure out cycling through threads
        // thread1_checking_queue = true;
        thread1.postMessage({ event_type: "CHECK_QUEUE", users: array1.array });
        array1.array = [];
        if (array2.status == ARRAY_STATUS.SENDING || array3.status == ARRAY_STATUS.SENDING) {
            if (array2.status != ARRAY_STATUS.FEEDING && array3.status != ARRAY_STATUS.FEEDING) {
                array1.status = ARRAY_STATUS.FEEDING;
            }
            else {
                array1.status = ARRAY_STATUS.INACTIVE;
            }
        }
        // come back to this later
        // if (thread1_checking_queue == false) {
        // }
    }

}

function adjust_array_status(array, number) {
    if (array.status == ARRAY_STATUS.INACTIVE) {
        array.status = ARRAY_STATUS.FEEDING;
    }
    else if (array.status == ARRAY_STATUS.SENDING) {
        array.status = ARRAY_STATUS.INACTIVE;
    }
    else if (array.status == ARRAY_STATUS.FEEDING) {
        array.status = ARRAY_STATUS.SENDING;
    }
}

function check_queue() {
    if (!sending_users) {
        if (INSERT_ARRAY_1.status == ARRAY_STATUS.INACTIVE) {
            INSERT_ARRAY_1.status = ARRAY_STATUS.FEEDING;
            INSERT_ARRAY_2.status = ARRAY_STATUS.INACTIVE;
            INSERT_ARRAY_3.status = ARRAY_STATUS.SENDING;
        }
        else if (INSERT_ARRAY_2.status == ARRAY_STATUS.INACTIVE) {
            INSERT_ARRAY_2.status = ARRAY_STATUS.FEEDING;
            INSERT_ARRAY_3.status = ARRAY_STATUS.INACTIVE;
            INSERT_ARRAY_1.status = ARRAY_STATUS.SENDING;
        }
        else if (INSERT_ARRAY_3.status == ARRAY_STATUS.INACTIVE) {
            INSERT_ARRAY_3.status = ARRAY_STATUS.FEEDING;
            INSERT_ARRAY_1.status = ARRAY_STATUS.INACTIVE;
            INSERT_ARRAY_2.status = ARRAY_STATUS.SENDING;
        }

        if (INSERT_ARRAY_1.status == ARRAY_STATUS.SENDING) {
            console.log(INSERT_ARRAY_1.array);
            sending_users = true;
            sending_array_logic(INSERT_ARRAY_1, INSERT_ARRAY_2, INSERT_ARRAY_3);
            sending_users = false;
        }
        else if (INSERT_ARRAY_2.status == ARRAY_STATUS.SENDING) {
            console.log(INSERT_ARRAY_2.array);
            sending_users = true;
            sending_array_logic(INSERT_ARRAY_2, INSERT_ARRAY_1, INSERT_ARRAY_3);
            sending_users = false;
        }
        else if (INSERT_ARRAY_3.status == ARRAY_STATUS.SENDING) {
            console.log(INSERT_ARRAY_3.array);
            sending_users = true;
            sending_array_logic(INSERT_ARRAY_3, INSERT_ARRAY_1, INSERT_ARRAY_2);
            sending_users = false;
        }
    }
    else {
        if (INSERT_ARRAY_1.status == ARRAY_STATUS.INACTIVE) {
            INSERT_ARRAY_1.status == ARRAY_STATUS.FEEDING;
        }
        else if (INSERT_ARRAY_2.status == ARRAY_STATUS.INACTIVE) {
            INSERT_ARRAY_2.status == ARRAY_STATUS.FEEDING;
        }
        else if (INSERT_ARRAY_3.status == ARRAY_STATUS.INACTIVE) {
            INSERT_ARRAY_3.status == ARRAY_STATUS.FEEDING;
        }
        if (INSERT_ARRAY_1.status == ARRAY_STATUS.FEEDING) {
            INSERT_ARRAY_1.status == ARRAY_STATUS.SENDING;
        }
        else if (INSERT_ARRAY_2.status == ARRAY_STATUS.FEEDING) {
            INSERT_ARRAY_2.status == ARRAY_STATUS.SENDING;
        }
        else if (INSERT_ARRAY_3.status == ARRAY_STATUS.FEEDING) {
            INSERT_ARRAY_3.status == ARRAY_STATUS.SENDING;
        }
    }
}