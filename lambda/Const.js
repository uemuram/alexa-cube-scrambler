class Const {

    constructor() {
        this.MSG_notSupportedPuzzleType = {
            "4x4x4": "すみません、4かける4かける4はまだサポートされていません。",
            "5x5x5": "すみません、5かける5かける5はまだサポートされていません。",
            "6x6x6": "すみません、6かける6かける6はまだサポートされていません。",
            "7x7x7": "すみません、7かける7かける7はまだサポートされていません。",
            "megaminx": "すみません、メガミンクスはまだサポートされていません。",
            "pyraminx": "すみません、ピラミンクスはまだサポートされていません。",
            "skewb": "すみません、スキューブはまだサポートされていません。",
            "square1": "すみません、スクウェアワンはまだサポートされていません。",
            "clock": "すみません、クロックはまだサポートされていません。"
        };

        this.MSG_afterGenerateScramble = "再度読み上げる場合は「もう一度」と言ってください。新しいスクランブルを作る場合は「スクランブル」と言ってください。";
        this.MSG_notGenerateScrambleYet = "スクランブルを作る場合は「スクランブル」と言ってください。";

        this.MSG_help = "新しいスクランブルを作る場合は「スクランブル」と言ってください。"
            + "パズルを指定する場合は「3かける3でスクランブル」、のように言ってください。"
            + "指定できるパズルは、2かける2、3かける3です。"
            + "スクランブルを再度読み上げる場合は、「もう一度」と言ってください。"
            + "読み上げ速度を変更する場合は、「速く読んで」、「普通に読んで」、「遅く読んで」のように言ってください。"

    }
}

module.exports = Const;