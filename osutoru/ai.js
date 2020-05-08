(function (global) {
    "use strict";
    // AIClass ------------------------------------------------
    function Ai() {}

    // Header -----------------------------------------------
    global.Ai = Ai;
    global.Ai.thinkAI = thinkAI;


    //-------------------------------------
    var COL = 5;
    var COLXCOL = COL * COL;

    function thinkAI(map, turn_player, depth) {
        var copyMap = JSON.parse(JSON.stringify(map));
        return deepThinkAllAB(copyMap, turn_player, depth, 999 * turn_player * -1, 999 * turn_player);
    }

    // AI：小さくするのが目標 プレイヤー：大きくするのが目標
    function deepThinkAllAB(map, turn, depth, a, b) {
        var best_score = turn * 999 * -1;// 初期値は最低点
        var besthand;
        // depth回後でも決着が付いていないとき
        if (depth == 0) {
            best_score = evalMap(map);
            return [besthand, best_score];// best_scoreはコマの差
        }
        var nodeList = getNodeList(map, turn);
        for (var i = 0; i < nodeList.length; i++) {
            var hand = nodeList[i];
            var copyMap2 = JSON.parse(JSON.stringify(map));
            copyMap2 = Rule.putMap(copyMap2, hand.preNumber, hand.direction, turn);
            if (Rule.getWinner(copyMap2) == turn) {
                return [hand, 999 * turn];// 勝つなら最高点
            } else if (Rule.getWinner(copyMap2) == turn * -1) {
                if (besthand === void 0) {
                    best_score = 999 * turn * -1;
                    besthand = hand;
                }
//                best_score = 1000 * turn * -1;
                continue;
            }

            // 相手の番
            var sc = deepThinkAllAB(copyMap2, turn * -1, depth - 1, b, a)[1];
            if (besthand === void 0) {
                best_score = sc;
                besthand = hand;
            }
            if (turn == 1 && sc > best_score) {
                best_score = sc;
                besthand = hand;
            } else if (turn == -1 && sc < best_score) {
                best_score = sc;
                besthand = hand;
            }
            if ((turn == 1 && a < best_score) || (turn == -1 && a > best_score)) {
                a = best_score;
            }
            // さっきの候補セルより悪いとき
            if ((turn == 1 && b <= best_score) || (turn == -1 && b >= best_score)) {
                break;
            }
        }
//        if (depth == 2) {
//            console.log("best_score=====" + best_score);
//        }
//        console.log("深さ "+ (6-depth) + " の時のBESTHANDは"+besthand.preNumber+"を"+besthand.direction+"へ");
        return [besthand, best_score];
    }

    // 選択肢を返す
    function getNodeList(map, turn) {
        var node_list = [];
        for (var i = 0; i < COL; i++) {
            for (var j = 0; j < COL; j++) {
                if (map[i][j] == turn || map[i][j] == 9) {
                    var candidateCells = Rule.canMove(map, COL * i + j);
                    for (var k = 0; k < candidateCells.length; k++) {
                        var hand = {
                            preNumber: null,
                            direction: null
                        };
                        hand.preNumber = COL * i + j;
                        hand.direction = Rule.findDirection(hand.preNumber, candidateCells[k]);
                        node_list.push(hand);
                    }
                }
            }
        }
//        for (var i = 0; i < node_list.length; i++) {
//            console.log("node_list[i]===="+ node_list[i].preNumber +"　"+ node_list[i].direction);
//        }
        return node_list;
    }

    // 局面を評価
    function evalMap(map) {
        var ev = 0;
        for (var i = 0; i < COL; i++) {
            for (var j = 0; j < COL; j++) {
                switch (map[i][j]) {
                case 1:
                    ev += 1;
                    break;
                case -1:
                    ev += -1;
                    break;
                }
            }
        }
        return ev;
    }
})((this || 0).self || global);