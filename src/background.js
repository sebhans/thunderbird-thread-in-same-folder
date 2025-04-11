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
    const isReasonableFolderForReply = function(folder) {
        return !(folder.type === 'sent' || folder.type === 'trash');
    }

    await messenger.messages.onNewMailReceived.addListener(async (folder, messages) => {
        for await (let message of iterateMessagePages(messages)) {
            const full = await messenger.messages.getFull(message.id);
            const inReplyTos = full["headers"]["in-reply-to"];
            if (inReplyTos.length > 0) {
                let inReplyTo = inReplyTos[0]
                if (inReplyTo.startsWith("<")) {
                    inReplyTo = inReplyTo.substring(1);
                }
                if (inReplyTo.endsWith(">")) {
                    inReplyTo = inReplyTo.substring(0, inReplyTo.length - 1)
                }
                const queryResult = await messenger.messages.query({"headerMessageId" : inReplyTo})
                if (queryResult.messages.length > 0) {
                    const parent = queryResult.messages[0]
                    const parentFolder = parent['folder']
                    if (parentFolder != message['folder'] && isReasonableFolderForReply(parentFolder)) {
                        messenger.messages.move([message.id], parentFolder)
                    }
                }
            }
        }
    })
}

document.addEventListener("DOMContentLoaded", load);
