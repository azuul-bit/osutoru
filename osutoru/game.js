(function (global) {
    "use strict";
    // 操作Class ------------------------------------------------
    function Game() {}

    // Header -----------------------------------------------
    global.Game = Game;
    global.Game.initGame = initGame;

    // field-------------------------------------------------
    var COL = 5;
    var ctx;
    var evented = false;
    var state = {};
    var point = {
        x: 0,
        y: 0
    };
    var turn_cycle = [1, 2, -1, -2];// 1,2なら自分のターン　-1,-2なら相手のターン

    // ゲーム開始状態
    var init_state = {
        map: [[-1, -1, -1, -1, -1],
              [0, 0, 0, 0, 0],
              [0, 0, 9, 0, 0],
              [0, 0, 0, 0, 0],
              [1, 1, 1, 1, 1]
              ],
//        mode: 0,
        turn: 0,
        revision: 0,
        selected: null,
        pointed: 0
    };

    // ゲーム開始時
    function initGame(_ctx) {
        ctx = _ctx;
        state = objCopy(init_state);
        if (!evented) {
            evented = true;
            setEvents();
        }
        Render.render(ctx, state, point);
        nextTurn(1);
    }

    function setEvents() {
        var isTouch;
        if ('ontouchstart' in window) {
            isTouch = true;
        } else {
            isTouch = false;
        }
        if (isTouch) {
            ctx.canvas.addEventListener('touchstart', ev_mouseClick)
        } else {
            ctx.canvas.addEventListener('mousemove', ev_mouseMove)
            ctx.canvas.addEventListener('mouseup', ev_mouseClick)
        }
    }

    function ev_mouseMove(e) {
        getMousePosition(e);
        state.pointed = hitTest(point.x, point.y);
        Render.render(ctx, state, point);
    }

    // クリックした時
    var preNumber;
    function ev_mouseClick(e) {
        var selected = hitTest(point.x, point.y);
        state.selected = selected;
        var number = selected;
        console.log("★ターン数：" + (Math.floor(state.revision / 4) + 1) + "　フェーズ：" + state.turn);
        console.log("クリックされたセルは " + number);
        // フェーズ１
        switch (state.turn) {
        case 1:
            if (Rule.getValue(state.map, number) == 1 || Rule.getValue(state.map, number) == 9) {
                nextTurn(1);
                Render.render(ctx, state, point);
//                    console.log("★フェイズ" + state.turn + "に移行します");
                preNumber = number;
            }
            break;
        // フェーズ２
        case 2:
            // 提示した選択肢を選んだ時
            if (Rule.canMove(state.map, preNumber).includes(number)) {

                var direction = Rule.findDirection(preNumber, number);// 移動方向
                state.map = Rule.putMap(state.map, preNumber, direction, state.turn);
//                    console.log("移動後======" + state.map);
                nextTurn(1);
                Render.render(ctx, state, point);

                if (Rule.getWinner(state.map) == 0) {
                    // AIが打つ
                    setTimeout(function () {
                        var _cp = {
                            preNumber: null,
                            direction: null
                        };
                        _cp = Ai.thinkAI(state.map, state.turn, 7);
                        console.log("AIの選択： " + _cp[0].preNumber + "を" + _cp[0].direction + "へ " + _cp[1]);
                        state.map = Rule.putMap(state.map, _cp[0].preNumber, _cp[0].direction, state.turn);
                        nextTurn(2);
                        Render.render(ctx, state, point);
                    }, 100);
                }
            } else {
                nextTurn(-1);
                state.selected = null;
                Render.render(ctx, state, point);
                console.log("別のセルがクリックされました。フェーズを戻します");
//                    console.log("★ターン数：" + (Math.floor(state.revision / 4) + 1) + "　フェーズ：" + state.turn);
            }
        }
    }


    function getMousePosition(e) {
        if (!e.clientX) { //SmartPhone
            if (e.touches) {
                e = e.originalEvent.touches[0];
            } else if (e.originalEvent.touches) {
                e = e.originalEvent.touches[0];
            } else {
                e = event.touches[0];
            }
        }
        var rect = e.target.getBoundingClientRect();
        point.x = e.clientX - rect.left;
        point.y = e.clientY - rect.top;
    }

    function hitTest(x, y) {
        var objects = [Render.RECT_BOARD];
        var click_obj = null;
        var selected = 0;
        for (var i = 0; i < objects.length; i++) {
            if (objects[i].w >= x && objects[i].x <= x && objects[i].h >= y && objects[i].y <= y) {
                selected = Math.floor(y / Render.CELL_SIZE) * COL + Math.floor(x / Render.CELL_SIZE);
                break;
            }
        }
        return selected;
    }

    function objCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function nextTurn(num) {
        state.revision += num;
        state.turn = turn_cycle[(state.revision - 1) % 4];
    }

})((this || 0).self || global);