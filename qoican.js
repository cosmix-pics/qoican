async function imageqoi(dataURL){
    const res = await fetch(dataURL)
    const buff = await res.arrayBuffer()
    const arr = new Uint8Array(buff)
    let width = arr[4] << 24 | arr[5] << 16 | arr[6] << 8 | arr[7]
    let height = arr[8] << 24 | arr[9] << 16 | arr[10] << 8 | arr[11]
    let pixelsSize = width * height
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = width
    canvas.height = height
    const imageData = ctx.createImageData(canvas.width, canvas.height)
    let pixels = new Int32Array(pixelsSize)

    let encodedOffset = 14
    const index = new Int32Array(64)
    let pixel = -16777216
    for (let pixelsOffset = 0; pixelsOffset < pixelsSize;) {
        let e = arr[encodedOffset++]
        switch (e >> 6) {
            case 0:
                pixels[pixelsOffset++] = pixel = index[e]
                continue
            case 1:
                pixel = (pixel & -16777216) | ((pixel + (((e >> 4) - 4 - 2) << 16)) & 16711680) | ((pixel + (((e >> 2 & 3) - 2) << 8)) & 65280) | ((pixel + (e & 3) - 2) & 255)
                break
            case 2:
                e -= 160
                let rb = arr[encodedOffset++]
                pixel = (pixel & -16777216) | ((pixel + ((e + (rb >> 4) - 8) << 16)) & 16711680) | ((pixel + (e << 8)) & 65280) | ((pixel + e + (rb & 15) - 8) & 255)
                break
            default:
                if (e < 254) {
                    e -= 191
                    pixels.fill(pixel, pixelsOffset, pixelsOffset + e)
                    pixelsOffset += e
                    continue
                }
                if (e == 254) {
                    pixel = (pixel & -16777216) | arr[encodedOffset] << 16 | arr[encodedOffset + 1] << 8 | arr[encodedOffset + 2]
                    encodedOffset += 3
                }
                else {
                    pixel = arr[encodedOffset + 3] << 24 | arr[encodedOffset] << 16 | arr[encodedOffset + 1] << 8 | arr[encodedOffset + 2]
                    encodedOffset += 4
                }
                break
        }
        pixels[pixelsOffset++] = index[((pixel >> 16) * 3 + (pixel >> 8) * 5 + (pixel & 63) * 7 + (pixel >> 24) * 11) & 63] = pixel
    }
    
    for (let i = 0; i < pixels.length; i++) {
        const pixel = pixels[i]
        const index = i * 4
        imageData.data[index] = (pixel >> 16) & 0xFF
        imageData.data[index + 1] = (pixel >> 8) & 0xFF
        imageData.data[index + 2] = pixel & 0xFF
        imageData.data[index + 3] = (pixel >> 24) & 0xFF
    }
    ctx.putImageData(imageData, 0, 0)
    document.body.appendChild(canvas)
    const png = canvas.toDataURL()
    canvas.addEventListener('contextmenu', event=>{
        event.preventDefault()
        QOIContextMenu.style.left = event.clientX+window.scrollX+'px'
        QOIContextMenu.style.top =  event.clientY+window.scrollY+'px'
        QOIContextMenu.style.display = 'block'
        let a = document.getElementById("downloadQUI")
        a.href = dataURL
        a.download = dataURL
    })
}
const QOIContextMenu = document.createElement('div');
QOIContextMenu.id = 'QOIContextMenu';
QOIContextMenu.innerHTML = '<ul><li><a id="downloadQUI" href="#">download QOI</a></li><li><a href="https://qoiformat.org">about QOI</a></li></ul>'
document.body.appendChild(QOIContextMenu);
const style = document.createElement('style')
style.innerHTML = `
  #QOIContextMenu {
    display: none;
    position: absolute;
    background-color: #f1f1f1;
    border: 1px solid #ccc;
    padding: 8px 0;
  }
  #QOIContextMenu ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  #QOIContextMenu ul li a {
    font-family: Tahoma, sans-serif;
    text-decoration: none;
    color: black;
  }
  #QOIContextMenu ul li {
    padding: 8px 16px;
  }
  #QOIContextMenu ul li:hover {
    background-color: #ccc;
  }
`;
document.head.appendChild(style);
document.addEventListener('click', e=>{QOIContextMenu.style.display = 'none'})