/**
 * Created by pekko1215 on 2017/07/15.
 */
var YakuData = [
    {
        name:"はずれ",
        pay:[0,0,0]
    },
    {
        name:"リプレイ",
        pay:[0,15,15]
    },
    {
        name:"ベル",
        pay:[10,3,0]
    },
    {
        name:"スイカ",
        pay:[15,0,0]
    },
    {
        name:"チェリー",
        pay:[4,15,0]
    },
    {
        name: "赤7",
        pay: [15, 0, 0]
    },
    {
        name:"青7",
        pay:[15,0,0]
    },
    {
        name:"BAR",
        pay:[0,0,0]
    },
    {
        name:"変則BIG",
        pay:[0,0,0]
    },
    {
        name:"REG",
        pay:[15,0,0]
    },
    {
        name:"JAC1",
        pay:[0,0,15]
    },
    {
        name:"JAC2",
        pay:[0,0,15]
    }
]

for(var i=0;i<7;i++){
    YakuData.push({
        name:"cherryBIG"+(i+1),
        pay:[0,0,15]
    })
}