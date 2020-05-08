(function (global) {
    "use strict";
    // 描画Class ------------------------------------------------
    function Render() {}

    // Header -----------------------------------------------
    global.Render = Render;
    global.Render.render = render;
    global.Render.RECT_BOARD = RECT_BOARD;
    global.Render.CELL_SIZE = CELL_SIZE;

    // field -------------------------------------------------
    var COL = 5;
    var RECT_CANV = {
        x: 0,
        y: 0,
        w: 500,
        h: 500
    };
    var RECT_BOARD = {
        x: 0,
        y: 0,
        w: 500,
        h: 500
    };
    var CELL_SIZE = RECT_CANV.w / COL | 0;

    var COLOR_BLACK = "#000000";
    var COLOR_WHITE = "#FFFFFF";
    var COLOR_RED = "#b22222";
    var COLOR_YELLOW = "#FFFF99";
    var COLOR_LINE = "#000000";
    var COLOR_SELECT = "#F3FFD8";
    var COLOR_CANDIDATE = "#AAAAAA";

    var state_cache = null;
    var canv_cache = {
        canv_board: null,
        canv_pieaces: null,
        canv_candidate: null,
        canv_effect: null
    };
    var prev_revision = -1;

    //-------------------------------------
    function render(ctx, state, point) {

        // 一旦白紙に
        ctx.clearRect(0, 0, RECT_CANV.w, RECT_CANV.h);

        if (prev_revision < 0) {// 初期状態
            canv_cache.canv_board = drawBoard(state);
            canv_cache.canv_pieaces = drawPieceALL(state);
            canv_cache.canv_effect = drawEffect(state);
            Render.RECT_BOARD = RECT_BOARD;
            Render.CELL_SIZE = CELL_SIZE;
        } else {
            if (state.revision != prev_revision) {// 盤面変わってたら
                canv_cache.canv_pieaces = drawPieceALL(state);
                if (state.turn == 2) {
                    canv_cache.canv_candidate = drawCandidate(state);
                }
            }
            canv_cache.canv_effect = drawEffect(state, point);// フォーカスの色とか
        }

        ctx.drawImage(canv_cache.canv_board, 0, 0, RECT_CANV.w, RECT_CANV.h);
        ctx.drawImage(canv_cache.canv_pieaces, 0, 0, RECT_CANV.w, RECT_CANV.h);
        if (state.turn == 2) {
            ctx.drawImage(canv_cache.canv_candidate, 0, 0, RECT_CANV.w, RECT_CANV.h);
        }
        ctx.drawImage(canv_cache.canv_effect, 0, 0, RECT_CANV.w, RECT_CANV.h);

        var winner = Rule.getWinner(state.map);
        if (winner != 0) {
            ctx.font = "38px serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "red";
            ctx.fillText(winner==1?"これであなたもハーモナイザ":"飛べねえ豚はただの豚さ。", 250, 250);
        }
        prev_revision = state.revision;// ターン数を記憶
    }

    function drawBoard(state) {
        if (!canv_cache.canv_board) {
            canv_cache.canv_board = document.createElement("canvas");
            canv_cache.canv_board.width = RECT_CANV.w;
            canv_cache.canv_board.height = RECT_CANV.h;
        }
        var ctx = canv_cache.canv_board.getContext('2d');
        ctx.clearRect(0, 0, RECT_CANV.w, RECT_CANV.h);

        for (var x = 0; x < COL; x++) {
            for (var y = 0; y < COL; y++) {
                ctx.strokeStyle = COLOR_LINE;
                ctx.lineWidth = 6;
                ctx.fillStyle = COLOR_WHITE;
                ctx.beginPath();
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
        for (var x = 0; x < COL; x++) {
            ctx.fillStyle = COLOR_WHITE;
            ctx.beginPath();
            ctx.fillRect(45 + x * 100, 0, 10, 500);
        }
        for (var y = 0; y < COL; y++) {
            ctx.fillStyle = COLOR_WHITE;
            ctx.beginPath();
            ctx.fillRect(0, 45 + y * 100, 500, 10);
        }

        return canv_cache.canv_board;
    }

    function drawPieceALL(state) {
        if (!canv_cache.canv_pieaces) {
            canv_cache.canv_pieaces = document.createElement("canvas");
            canv_cache.canv_pieaces.width = RECT_CANV.w;
            canv_cache.canv_pieaces.height = RECT_CANV.h;
        }
        var ctx = canv_cache.canv_pieaces.getContext('2d');
        ctx.clearRect(0, 0, RECT_CANV.w, RECT_CANV.h);

        for (var x = 0; x < COL; x++) {
            for (var y = 0; y < COL; y++) {
                if (state.map[y][x] != 0) {
                    drawPiece(ctx, x * CELL_SIZE, y * CELL_SIZE, state.map[y][x]);
                }
            }
        }
        return canv_cache.canv_pieaces;
    }

    function drawPiece(ctx, x, y, number) {

        var grad = ctx.createLinearGradient(x, y, x + CELL_SIZE, y + CELL_SIZE);
        var font_color;
        var fill_color;

        ctx.shadowBlur = 20;
        ctx.shadowColor = "rgba(0, 0, 0, 1)";
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        ctx.fillStyle = grad;
        ctx.beginPath();

        switch (number) {
        case 1:
            font_color = COLOR_WHITE;
            fill_color = COLOR_RED;
            ctx.fillStyle = COLOR_RED;
            ctx.fillRect(x + CELL_SIZE / 10, y + CELL_SIZE / 10, CELL_SIZE - 1 * CELL_SIZE / 5, CELL_SIZE - 1 * CELL_SIZE / 5);
            break;
        case -1:
            font_color = COLOR_WHITE;
            fill_color = COLOR_YELLOW;
            ctx.fillStyle = COLOR_YELLOW;
            ctx.fillRect(x + CELL_SIZE / 10, y + CELL_SIZE / 10, CELL_SIZE - 1 * CELL_SIZE / 5, CELL_SIZE - 1 * CELL_SIZE / 5);
            break;
        case 9:
            fill_color = COLOR_YELLOW;
            ctx.fillStyle = COLOR_BLACK;
            ctx.arc( x + CELL_SIZE / 2, y + CELL_SIZE / 2, 35, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
            ctx.fill();
            break;
        }

        ctx.shadowColor = "rgba(0, 0, 0, 0)";;
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        return ctx;
    }

    function drawCandidate(state) {
        if (!canv_cache.canv_candidate) {
            canv_cache.canv_candidate = document.createElement("canvas");
            canv_cache.canv_candidate.width = RECT_CANV.w;
            canv_cache.canv_candidate.height = RECT_CANV.h;
        }
        var ctx = canv_cache.canv_candidate.getContext('2d');
        ctx.clearRect(0, 0, RECT_CANV.w, RECT_CANV.h);

        var candidateCell = Rule.canMove(state.map, state.selected);
        for (var i = 0; i < candidateCell.length; i++) {
            var x = (candidateCell[i] % COL | 0) * CELL_SIZE;
            var y = (candidateCell[i] / COL | 0) * CELL_SIZE;

            ctx.globalAlpha = 0.3;
            ctx.fillStyle = COLOR_CANDIDATE;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        }

        return canv_cache.canv_candidate;
    }

    function drawEffect(state) {
        if (!canv_cache.canv_effect) {
            canv_cache.canv_effect = document.createElement("canvas");
            canv_cache.canv_effect.width = RECT_CANV.w;
            canv_cache.canv_effect.height = RECT_CANV.h;
        }
        var ctx = canv_cache.canv_effect.getContext('2d');
        var x = (state.pointed % COL | 0) * CELL_SIZE;
        var y = (state.pointed / COL | 0) * CELL_SIZE;

        ctx.clearRect(0, 0, RECT_CANV.w, RECT_CANV.h);
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = COLOR_SELECT;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

        return canv_cache.canv_effect;
    }


})((this || 0).self || global);
