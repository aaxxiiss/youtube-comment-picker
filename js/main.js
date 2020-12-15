import { youtubeApiKey } from './../api-keys.js';
import { CommentList } from './CommentList.js';

console.log('Main JS loaded');


function submitVideoId() {
    if (isValidId(videoIdField.value)) {
        console.log('video id submitted: ' + videoIdField.value);
        commentData.video.id = videoIdField.value;
        gapi.load("client", getData);
    }
    else {
        console.log('Video id is not valid');
    }
}

function updateId() {

    if (isValidId(videoIdField.value)) {
        activateButton(submitButton);
    };
    if (commentData.isSet && commentData.video.id != videoIdField.value) {
        commentData.resetData();
        resetResultsInDom();
    }
}

function isValidId(id) {
    const regex = /([a-zA-Z0-9_-]{11})/;
    return regex.test(id);
}

function getData() {
    // 2. Initialize the JavaScript client library.
    gapi.client.init({
        'apiKey': youtubeApiKey,
        // Your API key will be automatically added to the Discovery Document URLs.
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
    })
        .then(() => {
            // 3. Initialize and make the API request.
            return gapi.client.youtube.commentThreads.list({
                "part": [
                    "snippet"
                ],
                "maxResults": 100,
                "videoId": videoIdField.value,
                "access_token": youtubeApiKey
            });
        })
        .then(response => processCommentData(response.result), reason => 'Error: ' + reason.result.error.message)
        .then(() => {
            return gapi.client.youtube.videos.list({
                "part": [
                    "contentDetails, snippet"
                ],
                "id": [
                    "3y007Hg3gK0"
                ],
                "access_token": youtubeApiKey
            });
        })
        .then(response => processVideoData(response.result), reason => 'Error: ' + reason.result.error.message)
        .then(() => dataProcessingFinished())
        .then(() => updateResultsInDom());

};

function processCommentData(data) {

    console.log(data);

    let modifiedComments = [];

    for (let comment of data.items) {
        let modifiedComment = {
            'id': comment.snippet.topLevelComment.snippet.authorChannelId.value,
            'name': comment.snippet.topLevelComment.snippet.authorDisplayName,
            'imageUrl': comment.snippet.topLevelComment.snippet.authorProfileImageUrl,
            'content': comment.snippet.topLevelComment.snippet.textOriginal,
        };

        modifiedComments.push(modifiedComment);
    }

    commentData.comments = modifiedComments;

}

function processVideoData(data) {
    console.log(data);

    commentData.video.channelName = data.items[0].snippet.channelTitle;
    commentData.video.title = data.items[0].snippet.title;
    commentData.video.channelId = data.items[0].snippet.channelId;

    console.log(commentData.video);
}

function dataProcessingFinished() {
    commentData.isSet = true;
}

function updateResultsInDom() {

    console.log('Updating reults')

    channelNameSpan.textContent = commentData.video.channelName;
    videoTitleSpan.textContent = commentData.video.title;
    commentsCountSpan.textContent = commentData.getFilteredComments(true, true).length;

    activateButton(pickWinnerButton);
}


function resetResultsInDom() {

    console.log('Resetting dom...')

    channelNameSpan.textContent = '';
    videoTitleSpan.textContent = '';
    commentsCountSpan.textContent = '';
    winnerNameSpan.textContent = '';
    winnerCommentSpan.textContent = '';
    winnerImg.setAttribute('src', '');

    disableButton(submitButton);
    disableButton(pickWinnerButton);
}

function pickWinner() {

    console.log('Picking winner...');

    if (commentData.isSet) {
        var winner = commentData.comments[Math.floor(Math.random() * commentData.comments.length)];
        winnerNameSpan.textContent = winner.name;
        winnerCommentSpan.textContent = winner.content;
        winnerImg.setAttribute('src', winner.imageUrl);
    }
}

function disableButton(buttonElement) {
    buttonElement.setAttribute('disabled', true);
}

function activateButton(buttonElement) {
    buttonElement.removeAttribute('disabled');
}

// DATA

let commentData = new CommentList();

// DOM elements

let videoIdField = document.getElementById('video-id');
let submitButton = document.getElementById('submit-video-id');
let pickWinnerButton = document.getElementById('pick-winner');
let channelNameSpan = document.getElementById('channel-name');
let videoTitleSpan = document.getElementById('video-title');
let commentsCountSpan = document.getElementById("comments-count");
let winnerNameSpan = document.getElementById("winner-name");
let winnerCommentSpan = document.getElementById("winner-comment");
let winnerImg = document.getElementById("winner-image");

// Events

videoIdField.addEventListener('input', updateId);
submitButton.addEventListener('click', submitVideoId);
pickWinnerButton.addEventListener('click', pickWinner);