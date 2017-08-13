/**
 * Created by yuto-note on 2017/07/21.
 */
function Sounder(filesObj) {
    this.soundFilesObj = {
        unload: [],
        loaded: []
    };
    this.firstLoad = false;
    this.sources = [];
    this.loops = [];
}

Sounder.prototype.addFile = function (file, tag) {
    this.soundFilesObj.unload.push({
        filename: file,
        tag: tag
    });
}

Sounder.prototype.loadFile = function (callback) {
    var AudioContext = window.AudioContext // Default
        || window.webkitAudioContext // Safari and old versions of Chrome
        || false;
    this.context = new AudioContext();
    var context = this.context;
    var soundFilesObj = this.soundFilesObj;
    var that = this;
    Promise.all(soundFilesObj.unload.map(function (file) {
        return new Promise(function (fulfilled, rejected) {
            var request = new XMLHttpRequest();
            request.open("GET", file.filename, true);
            request.responseType = "arraybuffer";

            request.onload = function () {
                context.decodeAudioData(request.response, function (buffer) {
                    soundFilesObj.loaded.push({
                        filename: file.filename,
                        buffer: buffer,
                        tag: file.tag
                    });
                    fulfilled();
                }, function (e) {
                    console.log(e);
                })
            }
            request.send();
        })
    })).then(function () {
        that.firstLoad = true;
        soundFilesObj.unload = [];
        callback && callback();
    })
}

Sounder.prototype.playSound = function (tag, loop, callback, loopstart, loopend) {
    if (loop === undefined) {
        loop = false;
    }
    if (!this.firstLoad) {
        console.log("loadFile ga zikkou sarete naiyo")
    }
    var source = this.context.createBufferSource();
    var f = this.soundFilesObj.loaded.find(function (f) {
        return f.tag == tag;
    })
    if (!f) {
        return false;
    }
    source.buffer = f.buffer;
    source.loop = loop;
    if (loop) {
        source.loopStart = loopstart || 0;
        source.loopEnd = loopend || f.buffer.duration;
        this.loops.push({tag: tag, source: source})
    } else {

        setTimeout(callback, f.buffer.duration * 1000);
    }
    // source.onended = function () {
    //     source.disconnect();
    //     callback && callback();
    // }
    source.connect(this.context.destination);
    source.start()
    //$("#test").text($("#test").text() + "\n" + JSON.stringify(source.context.state))
    return true;
}

Sounder.prototype.stopSound = function (tag) {

    var f = this.loops.findIndex(function (f) {
        return f.tag == tag;
    })
    if (f!=-1) {
        return false;
    }
    try {
        this.loops[f].stop();
    }catch(e){
        return false;
    }
    loops.splice(f,1);

    return true;
}