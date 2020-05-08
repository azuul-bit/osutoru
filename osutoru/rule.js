(function (global) {
    "use strict";
    // ルールClass ------------------------------------------------
    function Rule() {}

    // Header -----------------------------------------------
    global.Rule = Rule;
    global.Rule.putMap = putMap;
    global.Rule.findDirection = findDirection;
    global.Rule.canMove = canMove;
    global.Rule.getWinner = getWinner;
    global.Rule.getValue = getValue;


    //-------------------------------------
    var COL = 5;
    var memoNG = {
        preNumber: null,
        direction: null
    };

    // 石を動かしたらどんな盤面か返す
    function putMap(map, preNumber, direction, turn) {
        var _map = map.concat();
        // 押す
        var move = calMove(direction);
        var number = preNumber + move;
        var preNumber_save = preNumber;
        var memoPreVal = getValue(_map, preNumber);
        var memoVal;
        var ng = {
            preNumber: null,
            direction: null
        };
        if (memoPreVal == 9) {
            ng.preNumber = number;
            ng.direction = reverseDirection(direction);
        }
        for (var i = 0; i < 5; i++){
            // 押したコマが落ちるとき
            if ((move == 5 && number > 24) || (move == -5 && number < 0)
                    || (move == 1 && number > COL * Math.floor(preNumber / COL) + 4)
                    || (move == -1 && number < COL * Math.floor(preNumber / COL))) {
                ng.preNumber = null;
                ng.direction = null;
                break;
            }
            // 移動先がコマのとき
            if (getValue(_map, number) == 1 || getValue(_map, number) == -1) {
                memoVal = getValue(_map, number);
                _map[Math.floor(number / COL)][number % COL] = memoPreVal
                memoPreVal = memoVal;
                number += move;
                preNumber += move;
                ng.direction = reverseDirection(direction);
            } else if (getValue(_map, number) == 0) {
                _map[Math.floor(number / COL)][number % COL] = memoPreVal;
                if (ng.direction != null) {
                    ng.preNumber = number;
                }
                break;
            }
        }
        _map[Math.floor(preNumber_save / COL)][preNumber_save % COL] = 0;
        memoNG = ng;
//        console.log(_map[0]);
//        console.log(_map[1]);
//        console.log(_map[2]);
//        console.log(_map[3]);
//        console.log(_map[4]);
        return _map;
    }

    // 移動可能場所を返す
    function canMove(map, number) {
        var candidateCell = [];
        var ngCell;
        var newNum;
        // おなじ場所には戻せない
        if (number == memoNG.preNumber) {
            ngCell = number + calMove(memoNG.direction);
        }
        if (getValue(map, number) != 9) {
            // はみ出ちゃだめ・移動先が穴はダメ・元いた場所に戻すのもダメ
            newNum = number - 1;
            if (number % 5 != 0 && getValue(map, newNum) != 9 && ngCell != newNum) {
                candidateCell.push(newNum);
            }
            newNum = number + 1;
            if (number % 5 != 4 && getValue(map, newNum) != 9 && ngCell != newNum) {
                candidateCell.push(newNum);
            }
            newNum = number - 5;
            if (number > 4 && getValue(map, newNum) != 9 && ngCell != newNum) {
                candidateCell.push(newNum);
            }
            newNum = number + 5;
            if (number < 20 && getValue(map, newNum) != 9 && ngCell != newNum) {
                candidateCell.push(newNum);
            }
        } else {
            newNum = number - 1;
            if (number % 5 != 0 && getValue(map, newNum) == 0 && ngCell != newNum) {
                candidateCell.push(newNum);
            }
            newNum = number + 1;
            if (number % 5 != 4 && getValue(map, newNum) == 0 && ngCell != newNum) {
                candidateCell.push(newNum);
            }
            newNum = number - 5;
            if (number > 4 && getValue(map, newNum) == 0 && ngCell != newNum) {
                candidateCell.push(newNum);
            }
            newNum = number + 5;
            if (number < 20 && getValue(map, newNum) == 0 && ngCell != newNum) {
                candidateCell.push(newNum);
            }

        }
        return candidateCell;
    }

    //どちらが勝ったか
    function getWinner(map) {
        var mine = 0;
        var yours = 0;
        for (var i = 0; i < COL; i++) {
            for (var j = 0; j < COL; j++) {
                if (map[i][j] == 1) {
                    mine++;
                } else if (map[i][j] == -1) {
                    yours++;
                }
            }
        }
        if (yours < 4) {
            return 1;
        } else if (mine < 4) {
            return -1;
        }
        return 0;
    }

    // セル番号から値を取り出す
    function getValue(map, number) {
        return map[Math.floor(number / COL)][number % COL];
    }

    // 移動方向を返す
    function findDirection(preNumber, number) {
        switch ((preNumber - number)) {
        case 5:
            return "up";
        case -5:
            return "down";
        case 1:
            return "left";
        case -1:
            return "right";
        }
    }

    // セル番号から値を取り出す
    function calMove(direction) {
        switch (direction) {
        case "up":
            return -5;
        case "down":
            return 5;
        case "left":
            return -1;
        case "right":
            return 1;
        }
    }

    // 逆の方向を返す
    function reverseDirection(direction) {
        switch (direction) {
        case "up":
            return "down";
        case "down":
            return "up";
        case "right":
            return "left";
        case "left":
            return "right";
        }
    }
})((this || 0).self || global);