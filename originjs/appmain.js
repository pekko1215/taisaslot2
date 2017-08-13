var reelControl = null;

var xhr = new XMLHttpRequest();
xhr.open('GET', 'data/Sample.dat');
xhr.responseType = 'arraybuffer';
controlData = {};
xhr.onload = function () {
    var uUint8array = new Uint8Array(this.response)
    var data_view = new DataView(uUint8array.buffer);
    var pos = 0;
    if (data_view.getUint32(pos, false) != 0x52435432) {
        alert("制御データの読み込みに失敗しました");
        return;
    }
    pos += 4;
    controlData.controlCount = data_view.getUint8(pos++, false)
    controlData.reelChipCount = data_view.getUint8(pos++, false);
    controlData.reelLength = data_view.getUint8(pos++, false);
    controlData.yakuCount = data_view.getUint8(pos++, false);
    controlData.maxLine = data_view.getUint8(pos++, false);
    controlData.reelArray = [
        [],
        [],
        []
    ]
    controlData.reelArray = controlData.reelArray.map(function () {
        var array = [];
        for (var i = 0; i < controlData.reelLength; i++) {
            array.push(data_view.getUint8(pos++, false))
        }
        return array
    });
    controlData.yakuList = Array(controlData.yakuCount).fill(0).map(function () {
        return [data_view.getUint16(pos, false), pos += 2][0]
    })

    controlData.betLine = Array(controlData.maxLine).fill(0).map(function () {
        var array = [];
        for (i = 0; i < 4; i++) {
            array.push(data_view.getUint8(pos++, false))
        }
        return array
    })

    controlData.slideTable = [
        [],
        [],
        []
    ];
    controlData.tableSize = Math.floor((controlData.reelLength + 1) / 2);

    controlData.slideTableSize = [];

    for (var i = 0; i < 3; i++) {
        controlData.slideTableSize[i] = [data_view.getUint16(pos, false) * controlData.tableSize, pos += 2][0]
    }

    controlData.tableNum23IndexSize = [0, 0, 0]
    for (var i = 0; i < 3; i++) {
        controlData.tableNum23IndexSize[i] = [data_view.getUint16(pos, false) + 1, pos += 2][0]
    }
    controlData.tableNumSize = data_view.getUint8(pos++, false);
    controlData.tableNum23NumSize = data_view.getUint8(pos++, false);

    for (var i = 0; i < 3; i++) {
        controlData.slideTable[i] = [];
        for (var k = 0; k < controlData.slideTableSize[i]; k++) {
            controlData.slideTable[i].push(data_view.getUint8(pos++, false))
        }
    }

    controlData.tableNum1Size = controlData.controlCount * 3 * controlData.tableNumSize;
    controlData.tableNum1 = [];

    for (var i = 0; i < controlData.tableNum1Size; i++) {
        controlData.tableNum1.push(data_view.getUint8(pos++, false))
    }
    controlData.tableNum23Index = new Array(3);
    for (var i = 0; i < 3; i++) {
        controlData.tableNum23Index[i] = [0];
        for (var k = 1; k < controlData.tableNum23IndexSize[i]; k++) {
            controlData.tableNum23Index[i].push([data_view.getUint16(pos, false), pos += 2][0])
        }
    }
    controlData.tableNum23 = [];
    for (var i = 0; i < 3; i++) {
        controlData.tableNum23[i] = [];
        var tableNum23Size = controlData.tableNum23Index[i][controlData.tableNum23Index[i].length - 1] * controlData.tableNumSize;
        for (var k = 0; k < tableNum23Size; k++) {
            controlData.tableNum23[i].push(data_view.getUint8(pos++, false))
        }
    }
    controlData.tableNum23NumIndex = [];
    controlData.tableNum23NumIndex.push(0)
    for (var i = 1; i < controlData.controlCount * 6 + 1; i++) {
        controlData.tableNum23NumIndex[i] = [data_view.getUint16(pos, false), pos += 2][0]
    }
    controlData.tableNum23Num = [];
    for (var i = 0; i < controlData.tableNum23NumIndex[controlData.controlCount * 6] * controlData.tableNum23NumSize; i++) {
        controlData.tableNum23Num.push(data_view.getUint8(pos++, false))
    }
    reelControl = new reelControlData(controlData)
    window.slotmodule = new SlotModuleMk2();
    $(main)

}
xhr.send();

function main() {
    slotmodule.on("allreelstop", function (e) {
        var $ele = $("#nabi");


        if (e.hits != 0) {
            if (e.hityaku.length == 0)
                return
            var matrix = e.hityaku[0].matrix;
            var count = 0;
            slotmodule.once("bet", function () {
                slotmodule.clearFlashReservation()
            })

            slotmodule.setFlash(null, 0, function (e) {
                slotmodule.setFlash(flashdata.default, 20)
                slotmodule.setFlash(replaceMatrix(flashdata.default, matrix, colordata.LINE_F, null), 20, arguments.callee)
            })
        }
        if(gamemode=="big"){
            bonusdata.bonusgame--;
        }

        if(gamemode=="jac"||gamemode=="reg"){
            bonusdata.jacgamecount--;
        }

        replayflag = false;

        e.hityaku.forEach(function(d){
            switch(gamemode){
                case 'normal':
                    switch(d.name){
                        case "青7":
                        case "赤7":
                            setGamemode('big');
                            bonusdata = {
                                bonusgame:8,
                                jacincount:3,
                            }
                            bonusflag = "none";
                            isSBIG = true;
                            break;
                        case "REG":
                            setGamemode('reg');
                            bonusdata = {
                                jacgamecount:8,
                                jacgetcount:8
                            }
                            bonusflag = "none";
                            break;
                        case "リプレイ":
                            replayflag = true;
                            break;
                    }
                    if(d.name.indexOf("BIG")!=-1||d.name == "BAR"){
                        setGamemode('big');
                        bonusdata = {
                            bonusgame:8,
                            jacincount:1,
                        }
                        sounder.playSound("big1",true);
                    }
                    break;
                case 'big':
                    if(d.name=="リプレイ"){
                        setGamemode('jac');
                        bonusdata.jacincount--;
                        bonusdata.jacgamecount = 8;
                        bonusdata.jacgetcount = 8;

                    }
                    break;
                case 'reg':
                case 'jac':
                    bonusdata.jacgetcount--;
            }
        })
        if(gamemode=="big"&&bonusdata.bonusgame==0){
            setGamemode('normal');
            sounder.stopSound("big1")
            isCT = CTBIG;
        }
        if(gamemode=="reg"||gamemode=="jac"){
            if(bonusdata.jacgamecount==0||bonusdata.jacgetcount==0){
                if(!bonusdata.jacincount){
                    setGamemode('normal');
                    sounder.stopSound("big1")
                }else{
                    setGamemode('big');
                }
            }
        }
        e.stopend()
    })



    slotmodule.on("leveron", function () {
        if (slotmodule.getPlayControlData().controlCode == 8) {
            slotmodule.setFlash(flashdata.redtest, 30, function () {
            })
        }
    })

    slotmodule.on("bet", function (e) {
        sounder.playSound("3bet")
        if ("coin" in e){
            coin -= e.coin;

        }
    })

    slotmodule.on("pay", function (e) {
        var pays = e.hityaku.pay;
        var arg = arguments;
        if (pays == 0) {
            if (replayflag) {
                slotmodule.emit("bet", e.playingStatus);
                sounder.playSound("replay", false, e.replay);
            } else {
                e.payend()
            }
        } else {
            e.hityaku.pay--;
            coin++;

            sounder.playSound("pay", false, function () {
                arg.callee(e)

            })
        }
    })
    slotmodule.on("lot", function (e) {
        var ret = -1;
        switch (gamemode) {
            case "normal":
                var lot = normalLotter.lot().name
                switch (lot) {
                    case "リプレイ":
                        ret = lot
                        break;
                    case "ベル":
                    case "スイカ":
                    case "チェリー":
                        ret = lot;
                        if(isCT){
                            ret = "CT"
                        }
                        break;
                    case "BIG":
                        ret = control.code.indexOf("BIG1") + rand(3);
                        CTBIG = (rand(2)==0);
                        if(isCT){
                            if(CTBIG){
                                ret = "BIGCT2";
                            }else{
                                ret = "BIGCT2";
                            }
                        }
                        break;
                    case "REG":
                        ret = "REG";
                        if(!isCT){
                            ret = "はずれ"
                        }
                        break;
                    default:
                        ret = "はずれ"
                        if(isCT){
                            ret = "CT"
                        }
                }

                break;
            case "big":
                var lot = bigLotter.lot().name;
                switch(lot){
                    case null:
                        if(isSBIG){
                            ret = "SBIG子役"
                        }else{
                            ret = "NBIG子役"
                        }
                        break;
                    case "JACIN":
                        ret = "JACIN";
                        if(!isSBIG){
                            ret = "はずれ"
                        }
                        break;

                }
                break;
            case "reg":
            case "jac":
                var lot = jacLotter.lot().name;
                ret = lot;
                break;
        }
        return ret;
    })

    slotmodule.on("reelstop", function () {
        sounder.playSound("stop")
    })

    $("#audioFire").click(function () {
        sounder.playSound("stop")
    })

    slotmodule.on("reelstart", function () {
        sounder.playSound("start")
    })

    setInterval(function () {
        $("#nabi").html("差枚数:"+coin+"<br>" +
                        JSON.stringify(bonusdata))
    }, 10)
    var sounder = new Sounder();

    sounder.addFile("sound/stop.wav", "stop")
    sounder.addFile("sound/start.wav", "start");
    sounder.addFile("sound/bet.wav", "3bet");
    sounder.addFile("sound/pay.wav", "pay");
    sounder.addFile("sound/replay.wav", "replay");
    sounder.addFile("sound/big1.wav","big1");


    sounder.loadFile(function () {
        window.sounder = sounder
        console.log(sounder)
    })

    var normalLotter = new Lotter(lotdata.normal);
    var bigLotter = new Lotter(lotdata.big);
    var jacLotter = new Lotter(lotdata.jac);


    var gamemode = "normal";
    var bonusflag = "none"
    var coin = 0;

    var bonusdata;
    var replayflag;

    var isCT = false;
    var CTBIG = false;
    var isSBIG;

    var setGamemode = function(mode){
        switch (mode){
            case 'normal':
                gamemode = 'normal'
                slotmodule.setLotMode(0);
                slotmodule.setMaxbet(3);
                isSBIG = false
                break;
            case 'big':
                gamemode = 'big';
                slotmodule.setLotMode(1);
                slotmodule.setMaxbet(3);
                break;
            case 'reg':
                gamemode = 'reg';
                slotmodule.setLotMode(2);
                slotmodule.setMaxbet(1);
                break;
            case 'jac':
                gamemode = 'jac';
                slotmodule.setLotMode(2);
                slotmodule.setMaxbet(1);
                break;
        }
    }

}

function rand(m) {
    return Math.floor(Math.random() * m);
}

function replaceMatrix(base, matrix, front, back) {
    var out = JSON.parse(JSON.stringify(base));
    matrix.forEach(function (m, i) {
        m.forEach(function (g, j) {
            if (g == 1) {
                front && (out.front[i][j] = front);
                back && (out.back[i][j] = back);
            }
        })
    })
    return out
}

function flipMatrix(base) {
    var out = JSON.parse(JSON.stringify(base));
    return out.map(function (m) {
        return m.map(function (p) {
            return 1 - p;
        })
    })
}