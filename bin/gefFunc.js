
var obfuscate = function (str) {
    str = Buffer.from(str).toString('base64');
    return str;
}

var deobfuscate = function (str) {
    str = Buffer.from(str, 'base64').toString()
    return str;
}

module.exports = {
    obfuscate:obfuscate,
    deobfuscate: deobfuscate
}