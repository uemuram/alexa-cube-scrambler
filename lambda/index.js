// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const Speech = require('ssml-builder');

const CubeUtil = require('CubeUtil');
const cubeUtil = new CubeUtil();
const Const = require('Const');
const c = new Const();

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = "スクランブルを生成する場合は「スクランブル」と言ってください。";
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const GenerateScrambleIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GenerateScrambleIntent';
    },
    handle(handlerInput) {
        try {
            // セッション準備
            let attributes = handlerInput.attributesManager.getSessionAttributes();

            // パズルタイプを設定
            let sessionPuzzleType = attributes.puzzleType;
            // セッションからとれれば引継ぎ。とれなければデフォルト(3x3x3)
            let puzzleType = sessionPuzzleType ? sessionPuzzleType : '3x3x3';

            // スロットから取得
            let puzzleTypeSlot = handlerInput.requestEnvelope.request.intent.slots.PuzzleType.resolutions;
            console.log(puzzleTypeSlot);
            // スロット値が取得できた場合は内容をチェック
            if (puzzleTypeSlot) {
                let statusCode = puzzleTypeSlot.resolutionsPerAuthority[0].status.code;
                console.log(statusCode);
                if (statusCode === 'ER_SUCCESS_MATCH') {
                    console.log("パズルタイプ取得成功");
                    // パズルタイプ取得に成功した場合のみ設定
                    puzzleType = puzzleTypeSlot.resolutionsPerAuthority[0].values[0].value.id;
                } else {
                    console.log("パズルタイプ取得失敗");
                    // パズルタイプを認識できなかった場合は聞き返す
                    return handlerInput.responseBuilder
                        .speak('パズルの種類を確認できませんでした。もう一度お願いします。')
                        .reprompt('スクランブルを生成する場合は「スクランブル」と言ってください。')
                        .getResponse();
                }
            }
            console.log(puzzleType);

            let scramble;
            let cardTitle;
            switch (puzzleType) {
                case "2x2x2":
                    scramble = cubeUtil.generate2x2x2Scramble();
                    cardTitle = "2x2x2 スクランブル";
                    break;
                case "3x3x3":
                    scramble = cubeUtil.generate3x3x3Scramble();
                    cardTitle = "3x3x3 スクランブル";
                    break;
                default:
                    // 未対応パズル
                    console.log("未対応パズル");
                    return handlerInput.responseBuilder
                        .speak(c.msg_notSupportedPuzzleType[puzzleType])
                        .reprompt('スクランブルを生成する場合は「スクランブル」と言ってください。')
                        .getResponse();
            }

            console.log(scramble);
            let speech = cubeUtil.scrambleStr2ssml(scramble);
            console.log(speech);

            // 今の状態をセッションに保存
            attributes.scramble = scramble;
            attributes.puzzleType = puzzleType;
            handlerInput.attributesManager.setSessionAttributes(attributes);

            return handlerInput.responseBuilder
                .speak(speech)
                .withSimpleCard(cardTitle, scramble)
                .reprompt('もう一度スクランブルを生成する場合は「次」と言ってください。')
                .getResponse();
        } catch (e) {
            console.log(e);
        }
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        GenerateScrambleIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
