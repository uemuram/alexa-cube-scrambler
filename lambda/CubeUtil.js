const Speech = require('ssml-builder');

class CubeUtil {

    // パズルタイプに応じたスクランブルを生成する
    generateScramble(puzzleType) {
        let scrambleInfo = {};
        switch (puzzleType) {
            case "2x2x2":
                scrambleInfo.scramble = this.generate2x2x2Scramble();
                scrambleInfo.cardTitle = "2x2x2 スクランブル";
                break;
            case "3x3x3":
                scrambleInfo.scramble = this.generate3x3x3Scramble();
                scrambleInfo.cardTitle = "3x3x3 スクランブル";
                break;
            default:
                // 未対応パズル
                return null;
        }
        console.log(scrambleInfo);
        return scrambleInfo;
    }

    // スクランブルの文字列をssmlに変換する
    scrambleStr2ssml(str, readingSpeed, afterPhrase) {
        let rate = {
            "fast": "fast",
            "medium": "medium",
            "slow": "x-slow"
        }[readingSpeed];

        let speechStr = str
            .replace(/F/g, "エフ")
            .replace(/D/g, "デー")
            .replace(/2/g, "ツー")
            .replace(/'/g, "ダッシュ")
            .replace(/ /g, ",");
        let speech = new Speech()
            .prosody({ rate: rate }, speechStr)
            .pause('2s')
            .say(afterPhrase);
        return speech.ssml();
    }

    // スクランブル生成の基本関数
    generateScrambleBase(length) {
        const faces = ["U", "D", "R", "L", "F", "B"];
        const options = ["", "'", "2"];
        let scramble = "";
        let beforeFace = -1;
        let before2Face = -1;
        let currentFace;
        for (let i = 0; i < length; i++) {
            // 回す面を決める。
            do {
                currentFace = this.randomN(6);
            } while (!this.faceCheck(currentFace, beforeFace, before2Face));
            scramble += (faces[currentFace] + options[this.randomN(3)]);
            if (i < length - 1) {
                scramble += " ";
            }
            // 2つ前、1つ前の手順を記録
            before2Face = beforeFace;
            beforeFace = currentFace;
        }
        return scramble;
    }

    // 2x2x2のスクランブルを生成
    generate2x2x2Scramble() {
        return this.generateScrambleBase(11);
    }

    // 3x3x3のスクランブルを生成
    generate3x3x3Scramble(length) {
        return this.generateScrambleBase(18);
    }

    // n種類(0～n-1)の乱数を生成
    randomN(n) {
        return Math.floor((Math.random() * n));
    }

    // 回す面のチェック
    faceCheck(current, before, before2) {
        // 1つ前と同じ面は回さない
        if (current == before) {
            return false;
        }
        // 同じ面 -> 対面 -> 同じ面 の順の回転はNG(例: U2, D, U')
        if (current == before2
            && ((current % 2 == 0 && current - before == -1) || (current % 2 == 1 && current - before == 1))) {
            return false;
        }
        return true;
    }

    // 配列判定
    isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    // オブジェクト判定
    isKeyValueObj(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    }

    // オブジェクトのディープコピー
    deepCopy(obj) {
        return Object.assign({}, JSON.parse(JSON.stringify(obj)));
    }

}

module.exports = CubeUtil;