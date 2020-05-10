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
        const speakOutput = c.MSG_launch;
        const reprompt = c.MSG_launchReprompt;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
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

            // パズルタイプの初期設定。セッションからとれれば引継ぎ。とれなければデフォルト(3x3x3)
            let sessionPuzzleType = attributes.puzzleType;
            let puzzleType = sessionPuzzleType ? sessionPuzzleType : '3x3x3';

            // 読み上げ速度の設定。セッションからとれれば引継ぎ、とれなければデフォルト(medium)
            let sessionReadingSpeed = attributes.readingSpeed;
            let readingSpeed = sessionReadingSpeed ? sessionReadingSpeed : 'medium';

            // スロットからパズルタイプを取得
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
                        .reprompt(c.MSG_notGenerateScrambleYet)
                        .getResponse();
                }
            }
            console.log(puzzleType);

            // スクランブルを生成
            let scrambleInfo = cubeUtil.generateScramble(puzzleType);
            // 未対応パズルだった場合
            if (!scrambleInfo) {
                console.log("未対応パズル");
                return handlerInput.responseBuilder
                    .speak(c.MSG_notSupportedPuzzleType[puzzleType])
                    .reprompt(c.MSG_notGenerateScrambleYet)
                    .getResponse();
            }
            let scramble = scrambleInfo.scramble;
            let cardTitle = scrambleInfo.cardTitle;

            // 読み上げを生成
            let speech = cubeUtil.scrambleStr2ssml(scramble, readingSpeed);

            // 今の状態をセッションに保存
            attributes.puzzleType = puzzleType;
            attributes.scramble = scramble;
            attributes.cardTitle = cardTitle;
            handlerInput.attributesManager.setSessionAttributes(attributes);

            return handlerInput.responseBuilder
                .speak(speech)
                .withSimpleCard(cardTitle, scramble)
                .reprompt(c.MSG_afterGenerateScramble)
                .getResponse();
        } catch (e) {
            console.log(e);
        }
    }
};

const RepeatScrambleIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RepeatScrambleIntent';
    },
    handle(handlerInput) {
        try {
            // セッション準備
            let attributes = handlerInput.attributesManager.getSessionAttributes();
            // 記録されているスクランブルを取得
            let scramble = attributes.scramble;
            let cardTitle = attributes.cardTitle;

            // 読み上げ速度の設定。セッションからとれれば引継ぎ、とれなければデフォルト(medium)
            let sessionReadingSpeed = attributes.readingSpeed;
            let readingSpeed = sessionReadingSpeed ? sessionReadingSpeed : 'medium';

            if (scramble && cardTitle) {
                let speech = cubeUtil.scrambleStr2ssml(scramble, readingSpeed);
                // 前回のスクランブル情報がセッションから取れた場合
                return handlerInput.responseBuilder
                    .speak(speech)
                    .withSimpleCard(cardTitle, scramble)
                    .reprompt(c.MSG_afterGenerateScramble)
                    .getResponse();
            } else {
                // 前回のスクランブル情報がセッションからとれなかった場合
                return handlerInput.responseBuilder
                    .speak("前回のスクランブル情報を取得できませんでした。")
                    .reprompt(c.MSG_notGenerateScrambleYet)
                    .getResponse();
            }
        } catch (e) {
            console.log(e);
        }
    }
};

const SetReadingSpeedIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SetReadingSpeedIntent';
    },
    handle(handlerInput) {
        try {
            // スロットから読み上げ速度を取得
            let readingSpeedSlot = handlerInput.requestEnvelope.request.intent.slots.ReadingSpeed.resolutions;
            console.log(readingSpeedSlot);
            let readingSpeed;
            // スロット値が取得できた場合は内容をチェック
            if (readingSpeedSlot) {
                let statusCode = readingSpeedSlot.resolutionsPerAuthority[0].status.code;
                console.log(statusCode);
                if (statusCode === 'ER_SUCCESS_MATCH') {
                    console.log("読み取り速度取得成功");
                    readingSpeed = readingSpeedSlot.resolutionsPerAuthority[0].values[0].value.id;
                } else {
                    console.log("読み取り速度取得失敗1");
                    return handlerInput.responseBuilder
                        .speak('読み取り速度を認識できませんでした。もう一度お願いします。')
                        .reprompt(c.MSG_notGenerateScrambleYet)
                        .getResponse();
                }
            } else {
                console.log("読み取り速度取得失敗2");
                return handlerInput.responseBuilder
                    .speak('読み取り速度を認識できませんでした。もう一度お願いします。')
                    .reprompt(c.MSG_notGenerateScrambleYet)
                    .getResponse();
            }

            // 今の状態をセッションに保存
            let attributes = handlerInput.attributesManager.getSessionAttributes();
            attributes.readingSpeed = readingSpeed;
            handlerInput.attributesManager.setSessionAttributes(attributes);

            let speedStr = {
                "fast": "速い",
                "medium": "普通",
                "slow": "ゆっくり",
            }[readingSpeed];
            return handlerInput.responseBuilder
                .speak('読み上げ速度を' + speedStr + 'に設定しました。')
                .reprompt(c.MSG_notGenerateScrambleYet)
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
        const speakOutput = c.MSG_help;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(c.MSG_notGenerateScrambleYet)
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
        const speakOutput = 'スキルを終了します。';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = c.MSG_fallBack;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(c.MSG_notGenerateScrambleYet)
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
        const speakOutput = `エラーが発生しました。もう一度お試しください。`;

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
        RepeatScrambleIntentHandler,
        SetReadingSpeedIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
