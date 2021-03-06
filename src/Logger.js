/*
IMPORTANT :
-----------
This file should not include dexcalibur ./src/* file (recursive dependency)
*/


const Chalk = require("chalk");
const Process = require("process"); 

var callbacks = {
    exit: function(){
        Process.exit();
    }
};


var flush = function(){
    let s = prefix.join("");
    prefix = [];
    return s;
}


function multi_concat(msg){
    let ret="";
    for(let i=0; i<msg.length; i++)
        ret += msg[i];

    return ret;
}

var prefix = [];


class TestLogger
{
    static T_ERROR = 1;
    static T_INFO = 2;
    static T_DEBUG = 3;
    static T_WARN = 4;
    static T_RAW = 5;
    static T_SUCCESS = 6;

    constructor(debugMode){
        this.prefix = [];
        this.cache = [];
        this.cacheTag = null;
        this.debugEnabled = debugMode;

        this.T_ERROR = 1;
        this.T_INFO = 2;
        this.T_DEBUG = 3;
        this.T_WARN = 4;
        this.T_RAW = 5;
        this.T_SUCCESS = 6;
    }

    error(){
        this.cache.push({ type:TestLogger.T_ERROR, val:multi_concat(arguments) });
        return callbacks;
    }

    debug(){
        if(this.debugEnabled)
            this.cache.push({ type:TestLogger.T_DEBUG, val:multi_concat(arguments) });
        return callbacks;
    }

    info(){
        this.cache.push({ type:TestLogger.T_INFO, val:multi_concat(arguments) });
        return callbacks;
    }

    warn(){
        this.cache.push({ type:TestLogger.T_WARN, val:multi_concat(arguments) });
        return callbacks;
    }

    success(){
        this.cache.push({ type:TestLogger.T_SUCCESS, val:multi_concat(arguments) });
        return callbacks;
    }

    raw(){
        this.cache.push({ type:TestLogger.T_RAW, val:multi_concat(arguments) });
        return callbacks;
    }

    setTagCache(tag){
        this.cacheTag = tag;
    }

    removeTagCache(tag){
        this.cacheTag = null;
    }

    expect(expected, fn=null){
        let f = false;
        this.cache.map(x => {
            if(x.type==expected.type){
                if(typeof f == "function")
                    f = fn(expected, x);
                else
                    f = (x.val===expected.value);
            }
        });
        return f;
    }

    clearCache(){
        this.cache = [];
    }

    pop(){
        return this.prefix.pop()
    }

    push(prefix){
        this.prefix.push(prefix);
        return this.prefix;
    }
}


class ProdLogger
{

    constructor(debugMode){
        this.prefix = [];
        this.debugEnabled = debugMode;
    }

    enableDebug(){
        this.debugEnabled = true;
    }

    error(){
        console.log(Chalk.bold.red('[ERROR] '+prefix.join("")+multi_concat(arguments)));
        return callbacks;
    }

    debug(){
        if(this.debugEnabled)
            console.log(Chalk.bold.blue('[DEBUG] '+prefix.join("")+multi_concat(arguments)));
        return callbacks;
    }

    /**
     * TODO : TestLogger
     */
    debugPink(){
        if(this.debugEnabled)
            console.log(Chalk.bold.magenta('[DEBUG] '+prefix.join("")+multi_concat(arguments)));
        return callbacks;
    }

    /**
     * TODO : TestLogger
     */
    debugBgRed(){
        if(this.debugEnabled)
            console.log(Chalk.white.bgRed.bold('[DEBUG] '+prefix.join("")+multi_concat(arguments)));
        return callbacks;
    }

    warn(){
        if(this.debugEnabled)
            console.log(Chalk.bold.yellow('[DEBUG] '+prefix.join("")+multi_concat(arguments)));
        return callbacks;
    }

    success(){
        console.log(Chalk.bold.green(prefix.join("")+multi_concat(arguments)));
        return callbacks;
    }

    info(){
        console.log('[INFO] '+prefix.join("")+multi_concat(arguments));
        return callbacks;
    }

    raw(){
        console.log(multi_concat(arguments));
        return callbacks;
    }

    pop(){
        return this.prefix.pop()
    }

    push(prefix){
        this.prefix.push(prefix);
        return this.prefix;
    }
}


var loggerInstance = null;

function getInstance(config=null, override=false){
    if(loggerInstance===null || override){
        if(config===null){
            config={
                testMode: false,
                debugMode: false
            };
        }

        if((config!==null && config.testMode) || Process.env.DEXCALIBUR_TEST)
            loggerInstance = new TestLogger(config.debugMode);
        else
            loggerInstance = new ProdLogger(config.debugMode);
    }

    return loggerInstance;
}

module.exports = getInstance; 