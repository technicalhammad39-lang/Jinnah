const fs = require('fs');
const path = require('path');
const svg2img = require('svg2img');
const pngToIco = require('png-to-ico');

const svgPath = path.join(__dirname, 'public', 'favicon.svg');
const pngPath = path.join(__dirname, 'public', 'favicon-temp.png');
const icoPath = path.join(__dirname, 'app', 'favicon.ico');
const publicIcoPath = path.join(__dirname, 'public', 'favicon.ico');

svg2img(svgPath, { width: 512, height: 512 }, (error, buffer) => {
    if (error) {
        console.error('Error generating PNG:', error);
        process.exit(1);
    }
    fs.writeFileSync(pngPath, buffer);
    console.log('PNG generated at', pngPath);

    pngToIco(pngPath).then(buf => {
        fs.writeFileSync(icoPath, buf);
        fs.writeFileSync(publicIcoPath, buf);
        console.log('ICO generated at', icoPath, 'and', publicIcoPath);
        fs.unlinkSync(pngPath);
    }).catch(console.error);
});
