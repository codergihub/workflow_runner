async function handler(page) {
    
    await page.waitForSelector('.productList .product-list-item')

    const data = await page.$$eval('.productList .product-list-item', (productCards) => {
        return productCards.map(productCard => {

          const imageUrl = productCard.querySelector('.product-img img').getAttribute('data-original')
          const title= productCard.querySelector('.product-name').innerText
          const priceOld=productCard.querySelector('.price-psfx') && productCard.querySelector('.price-psfx').innerText.replace('TL','').trim()
          const priceNew= productCard.querySelector('.price-payable') && productCard.querySelector('.price-payable').innerText.replace('TL','').trim()
          const  priceBasket=productCard.querySelector('.a-campaignPrice') && productCard.querySelector('.a-campaignPrice').innerText.replace('TL','').trim()
          const basketDiscount=priceBasket ? Math.floor( ((parseInt(priceNew)-parseInt(priceBasket))*100)/parseInt(priceNew)):null
          const discPerc =priceOld ? Math.floor( ((parseInt(priceOld)-parseInt(priceNew))*100)/parseInt(priceOld)):null
          const hizliGonderi=productCard.querySelector('.product-badges').textContent.indexOf('hızlı gönderi') !==-1 ? true:false 
          const kargoBedava =productCard.querySelector('.product-badges').textContent.indexOf('kargo bedava') !==-1 ? true:false
            return {
                title,
                priceOld,
                priceNew,
                priceBasket,
                basketDiscount,
                imageUrl: imageUrl,
                link: productCard.querySelector('.product-figure-wrap a').href,   
                timestamp: Date.now(),
                plcHolder:"https://statics.boyner.com.tr/assets/images/loading-icon.gif",
                discPerc,
                hizliGonderi,
                kargoBedava
            }
        }).filter(f => f.imageUrl !== null)
    })

    console.log('data length_____', data.length)
  


      return data
}

async function getUrls(page) {
    const param='/?dropListingPageSize=90&orderOption=Editor'
    await page.waitForSelector('.red-v1 .grey')
    const firstUrl =await page.url()
    
    const productCount = await page.$eval('.red-v1 .grey', element => parseInt(element.innerText.replace(/[^0-9]/g,'')))
    const totalPages = Math.ceil(productCount / 90)
    const pageUrls = []
    let pagesLeft = totalPages
    for (let i = 2; i <= totalPages; i++) {
        const url = `${firstUrl}/${i}${param}`
    
        console.log('i', i)
        if (pagesLeft > 0) {
            pageUrls.push(url)
            --pagesLeft
        }
    }
    return pageUrls
}
module.exports = { handler, getUrls }