const Speech = require('ssml-builder');

class CubeUtil {
    // スクランブルの文字列をssmlに変換する
    scrambleStr2ssml(str) {
        let speechStr = str
            .replace(/F/g, "エフ")
            .replace(/D/g, "デー")
            .replace(/2/g, "ツー")
            .replace(/'/g, "ダッシュ")
            .replace(/ /g, ",");

        let speech = new Speech()
            .prosody({ rate: "fast" }, speechStr);

        return speech.ssml();

        // let rotationSymbols = str.split(" ");
        // let speech = new Speech();
        // for (let i = 0; i < rotationSymbols.length; i++) {
        //     speech = speech.prosody(
        //         { rate: "medium" },
        //         rotationSymbols[i]
        //             .replace("2", "ツー")
        //             .replace("'", "ダッシュ")
        //             .replace("F", "エフ")
        //     );
        //     speech = speech.pause('0ms');
        // }
        // return speech.ssml();


        // let rotationSymbols = str.split(" ");
        // let speech = new Speech();
        // for (let i = 0; i < rotationSymbols.length; i++) {
        //     speech = speech.prosody(
        //         { rate: "medium" },
        //         rotationSymbols[i]
        //             .replace("2", "ツー")
        //             .replace("'", "ダッシュ")
        //             .replace("F", "エフ")
        //     );
        //     speech = speech.pause('0ms');
        // }
        // return speech.ssml();
    }

    // 3x3x3のスクランブルを生成
    generate3x3x3Scramble(length) {
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