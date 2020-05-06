class CubeUtil {
    test3() {
        return "あいうえお";
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