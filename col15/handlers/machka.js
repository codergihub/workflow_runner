
const { extractPercentage } = require('../helper')
async function handler(page) {
    debugger;
    await page.waitForSelector('.ems-prd-list-wrapper')
    //  await autoScroll(page)
    debugger;
    const data = await page.evaluate(() => {
        function extractPercentage(val1, val2) {
            const value1ll = parseInt(val1.substring(0, leftLastIndex(val1)).replace('.', ''))
            const value2ll = parseInt(val2.substring(0, leftLastIndex(val2)).replace('.', ''))
            const percentage = Math.floor((((value1ll) - (value2ll)) * 100) / (value1ll))
            return percentage
        }

        function leftLastIndex(value) {
            return value.lastIndexOf(',') !== -1 ? value.lastIndexOf(',') : value.length
        }
        const items = Array.from(document.querySelectorAll('.ems-prd'))
        return items.map(item => {
            const priceOld = item.querySelector('.ems-prd-price-first') && item.querySelector('.ems-prd-price-first').innerText.replace('₺', '').trim()
            const priceNew = item.querySelector('.ems-prd-price-last') && item.querySelector('.ems-prd-price-last').innerText.replace('₺', '').trim()
            const discPerc = priceOld ? extractPercentage(priceOld, priceNew) : null;
           // const yeni =item.querySelector('.ems-prd-badge1') && item.querySelector('.ems-prd-badge1').innerText.trim()==='Yeni'?true:false
            return {
                title: item.querySelector('.ems-prd-title').innerText,
                priceOld,
                priceNew,
                priceBasket: null,
                basketDiscount: null,
                imageUrl:item.querySelector('.ems-responsive-item').getAttribute('data-image-src'),
                link: item.querySelector('.ems-prd-link btn-full').href,
                timestamp: Date.now(),
                plcHolder: 'https://storage.machka.com.tr/Machka/frontend/images/logo-emblem.svg',
                discPerc,
                hizliGonderi: null,
                kargoBedava: null,
                yeni:null,
  
            }
        }).filter(f => f.imageUrl !== null)
    })
    debugger;
    console.log('data length_____', data.length)

    return data
}
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 300);
        });
    });
}
async function getUrls(page, param) {

    return []
}
module.exports = { handler, getUrls }