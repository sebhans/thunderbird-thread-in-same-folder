'use strict'

async function* iterateMessagePages(page) {
    for (let message of page.messages) {
        yield message;
    }

    while (page.id) {
        page = await messenger.messages.continueList(page.id);
        for (let message of page.messages) {
            yield message;
        }
    }
}

async function load() {
    await messenger.messages.onNewMailReceived.addListener(async (folder, messages) => {
        for await (let message of iterateMessagePages(messages)) {
            let full = await messenger.messages.getFull(message.id);
            let inReplyTos = full["headers"]["in-reply-to"];
            if (inReplyTos.length > 0) {
                let inReplyTo = inReplyTos[0]
                if (inReplyTo.startsWith("<")) {
                    inReplyTo = inReplyTo.substring(1);
                }
                if (inReplyTo.endsWith(">")) {
                    inReplyTo = inReplyTo.substring(0, inReplyTo.length - 1)
                }
                let queryResult = await messenger.messages.query({"headerMessageId" : inReplyTo})
                if (queryResult.messages.length > 0) {
                    let parent = queryResult.messages[0]
		    if (parent['folder'] != message['folder']) {
		        messenger.messages.move([message.id], parent['folder'])
		    }
                }
            }
        }
    })
}

document.addEventListener("DOMContentLoaded", load);
