const alignString = (str, length, symbol = " ") => {
    return new Array(length - str.length + 1).join(' ');
}
const alignTable = (strTable, length, symbol = " ") => {
    return strTable.map(element => {
        if (Array.isArray(element))
            return alignTable(element, length);
        else return element + alignString(String(element), length);
    });
}
const insertHyphens = count => {
    return new Array(count + 1).join("─");
}
const fillWithHyphens = (str, length) => {
    if ((length - str.length) % 2 != 0)
        str += "─";
    return insertHyphens((length - str.length) / 2) + str + insertHyphens((length - str.length) / 2);
}
function findMaxLength(arr) {
    return Math.max(...arr);
}
function tableToLengths(strTable) {
    return strTable.map((s) => {
        if (Array.isArray(s))
            return tableLengths(s);
        else return String(s).length;
    });
}
