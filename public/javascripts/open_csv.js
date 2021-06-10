function fetch_file(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url); // 'write_data.php' is the path to the php file described above.
    xhr.setRequestHeader('Content-Type', 'text/csv');
    xhr.send();

    xhr.onreadystatechange = function(data) {
        if (xhr.readyState === 4) {
            if(xhr.status==200) {
                processData(data.target.response)
            }
        }
    }
}
function processData(allText) {
    allText = allText.replace(/"[^"]+"/g, function(v) {
        return v.replace(/,/g, '');
    });
    allText = allText.replace(/['"]+/g, '')
    json = []
    var allTextLines = allText.split(/\r\n|\n/);
    var entries = allTextLines[0].split(',');
    for (var i =1;i<allTextLines.length-1;i++) {
        line = allTextLines[i].split(',');
        obj = {}
        for (var j=0;j<entries.length;j++) {
            obj[entries[j]]=line[j]
        }
        json.push(obj)
    }
    question_csv = json
    return json

}