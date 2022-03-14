const {extractPercentage}=require('./helper')
async function handler(page) {
    debugger;//
    await page.waitForSelector('.prd-list .prd')
    debugger;
    const data = await page.evaluate(()=>{
        function extractPercentage(val1,val2){
 

    const value1ll=parseInt(val1.substring(0,leftLastIndex(val1)).replace('.',''))

    const value2ll=parseInt( val2.substring(0,leftLastIndex(val2)).replace('.',''))
 

    const percentage =Math.floor( (((value1ll)-(value2ll))*100)/(value1ll))
 return  percentage
}
function leftLastIndex(value){
return value.lastIndexOf(',') !==-1 ?value.lastIndexOf(','):value.length
}
          const items =Array.from(document.querySelectorAll('.prd-list .prd'))
        return items.map(item=>{
            const priceOld = item.querySelector('.prd-list .prd-price .urunListe_brutFiyat')&& item.querySelector('.prd-list .prd-price .urunListe_brutFiyat').textContent.replace('\n','').replace('₺','').trim()
            const priceNew= item.querySelector('.prd-list .prd-price .urunListe_satisFiyat')&& item.querySelector('.prd-list .prd-price .urunListe_satisFiyat').textContent.replace('\n','').replace('₺','').trim()
            
            
            const discPerc=priceOld ? extractPercentage(priceOld,priceNew):null

            return {
                    title:item.querySelector('.prd-name').innerText,
                    priceOld,
                    priceNew,
                    priceBasket:null ,
                    basketDiscount:null,
                    imageUrl:item.querySelector('.prd-image-org img').getAttribute('data-original'),
                    link:item.querySelector('.prd-lnk').href,
                    timestamp: Date.now(),
                    plcHolder:'https://img1-ipekyol.mncdn.com/images/lazyload/placeHolder.gif',
                    discPerc,
                    hizliGonderi:null,
                    kargoBedava:null
                }
        }).filter(f => f.imageUrl !== null)
    })
debugger;
      console.log('data length_____', data.length)
  
      return data
}

async function getUrls(page,param) {
 
    return []
}
module.exports = { handler, getUrls }