
async function handler(page) {


    await page.waitForSelector('.catalog-products')


    const data = await page.$$eval('.catalog-products .product-card', (productCards) => {
        return productCards.map(productCard => {

            const imageUrl = productCard.querySelector('.catalog-products .product-card .product-card__image .image-box .product-card__image--item.swiper-slide img').getAttribute('data-srcset')
            const title = productCard.querySelector('.product-card__title a').getAttribute('title')
            const priceOld = productCard.querySelector('.product-card__price--old') && productCard.querySelector('.product-card__price--old').textContent.trim().replace('₺', '').replace('TL', '')
            const priceNew = productCard.querySelector('.product-card__price--new') && productCard.querySelector('.product-card__price--new').textContent.trim().replace('₺', '').replace('TL', '')
            const priceBasket = productCard.querySelector('.product-card__price--basket>.sale') && productCard.querySelector('.product-card__price--basket>.sale').textContent.trim().replace('₺', '').replace('TL', '')
            const basketDiscount = productCard.querySelector('.product-card__price--basket span') && productCard.querySelector('.product-card__price--basket span').innerText.replace(/(\D+)/g, '')
            const discPerc = priceOld ? Math.floor(((parseInt(priceOld) - parseInt(priceNew)) * 100) / parseInt(priceOld)) : null
            return {
                title,
                priceOld: priceOld ? priceOld.replace(',', '.').trim() : 0,
                priceNew: priceNew ? priceNew.replace(',', '.').trim() : 0,
                priceBasket: priceBasket ? priceBasket.replace(',', '.').trim() : 0,
                basketDiscount: basketDiscount?basketDiscount:0,
                imageUrl: imageUrl && 'https:' + imageUrl.substring(imageUrl.lastIndexOf('//'), imageUrl.lastIndexOf('.jpg') + 4),
                link: productCard.querySelector('.catalog-products .product-card .product-card__image .image-box a').href,
                timestamp: Date.now(),
                plcHolder: "https://dfcdn.defacto.com.tr/AssetsV2/dist/img/placeholders/placeholder.svg",
                discPerc:discPerc?discPerc:0
            }
        }).filter(f => f.imageUrl !== null)
    })

    console.log('data length_____', data.length)



    return data
}
async function getUrls(page, url) {
    await page.waitForSelector('.catalog__meta--product-count span')
    const productCount = await page.$eval('.catalog__meta--product-count span', element => parseInt(element.innerHTML))
    const totalPages = Math.ceil(productCount / 72)
    const pageUrls = []
    let pagesLeft = totalPages
    for (let i = 2; i <= totalPages; i++) {

        console.log('i', i)
        if (pagesLeft > 0) {

            pageUrls.push(`${url}` + i)
            --pagesLeft
        }
    }
    return pageUrls
}
module.exports = { handler, getUrls }