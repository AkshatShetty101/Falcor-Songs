// Checking for existing album
module.exports = function(data, al) {
    console.log("Here!" + al);
    return new Promise(function (resolve, reject) {
        console.log("Here!");
        var count = 0;
        console.log(data);
        for (var key in data.json.imgList) {
            var value = data.json.imgList[key];
            console.log(value);
            if (value.album) {
                console.log("Here!" + value.album);
                if (value.album == al)
                    resolve(count)
                count++;
            }
        }
        reject(count + 1);
    });

}