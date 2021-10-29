

const { puppeteerCrawler } = require('wflows')

const { handlePageFunction } = require('./handlePageFunction')




async function crawler() {

    console.log('main js books workflow')

    const crawler = await puppeteerCrawler({
        handlePageFunction, headless: true, preNavHook: null, postNavHook: null,

        urls: [{ url: process.env.PAGE_URL, userData: {}, batchName: 'books', unshift: false, retry: false, retries: 0, sync: false }],

        batches: [{ batchName: 'books', concurrencyLimit: 20, retries: 3 }]
    })

    crawler.on('BROWSER_CLOSED', async () => {
        console.log('exiting....')
        console.log('upload artifacts')


    })

}

crawler()
