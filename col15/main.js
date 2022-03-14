/**
 * This template is a production ready boilerplate for developing with `PuppeteerCrawler`.
 * Use this to bootstrap your projects using the most up-to-date code.
 * If you're looking for examples or want to learn more, see README.
 */
require('dotenv').config()

const fs = require('fs')
const Apify = require('apify');
var cloudinary = require('cloudinary');
const { uploadToAtlas } = require('./atlas')
const { setInputs } = require('./inputConfig')
cloudinary.config({
    cloud_name: 'codergihub',
    api_key: '583195742238215',
    api_secret: process.env.cloudinary_api_secret
});



Apify.main(async () => {
  
        await setInputs()
        const { utils: { log } } = Apify;
        const startUrl = process.env.startUrl
        const JSONfileName = process.env.JSONfileName
        const marka = process.env.marka
        const gender = process.env.gender
        const category = process.env.category
        const subcategory = process.env.subcategory
        console.log('marka', marka)
        console.log('gender', gender)
        console.log('category', category)
        console.log('subcategory', subcategory)

        const { handler, getUrls } = require(`./handlers/${marka}`);
        const input = await Apify.getInput();
        console.log(input);

        const requestList = await Apify.openRequestList('start-urls', [startUrl]);
        const requestQueue = await Apify.openRequestQueue();

        const dataset = await Apify.openDataset(`${JSONfileName}-${Date.now()}`);



        const handlePageFunction = async (context) => {
            const { page } = context
            const pageUrl = await page.url()

            if (pageUrl === startUrl) {
                const nextPageUrl = startUrl.substring(0, startUrl.indexOf("=") + 1)
                const pageUrls = await getUrls(page, nextPageUrl)

                for (let url of pageUrls) {
                    await requestQueue.addRequest({ url });
                }

            }
            const data = await handler(page)
            const mappedData = data.map(d => {
                return {
                    ...d, marka,
                    gender,
                    category, subcategory
                }
            })
            await dataset.pushData(mappedData);


            //  return   
        }
        const crawler = new Apify.PuppeteerCrawler({
            requestList,
            requestQueue,
            maxConcurrency: 1,
            launchContext: {
                // Chrome with stealth should work for most websites.
                // If it doesn't, feel free to remove this.
               // useChrome: true,
                launchOptions:{headless:true,args: ['--no-sandbox', '--disable-setuid-sandbox',      "--disable-web-security",
                `--window-size=1200,1250`,
                "--allow-insecure-localhost",
                //  "--user-data-dir=/tmp/foo",
                "--ignore-certificate-errors",
                "--unsafely-treat-insecure-origin-as-secure=https://localhost:8888", 
                '--disable-gpu-rasterization',
                '--disable-low-res-tiling',
                '--disable-skia-runtime-opts',
                '--disable-yuv420-biplanar'
             ]}

            },
            handlePageFunction,
            preNavigationHooks: [
                async (crawlingContext, gotoOptions) => {
                    const { page } = crawlingContext;
                    await page.setRequestInterception(true);
                    page.on('request', req => {
                        const resourceType = req.resourceType();
                        if (resourceType === 'image') {
                            req.respond({
                                status: 200,
                                contentType: 'image/jpeg',
                                body: ''
                            });


                        } else {
                            req.continue();
                        }
                    });
                },
            ]
        });

        log.info('Starting the crawl.');
        await crawler.run();
        const ds= await dataset.getData()
 
     
        log.info('items...',ds.items&& ds.items.length);
     //   fs.writeFileSync(`${JSONfileName}.json`, JSON.stringify(ds.items))
        //const upload = await cloudinary.v2.uploader.upload(`${JSONfileName}.json`, { public_id: JSONfileName, resource_type: "auto", invalidate: true })
        await uploadToAtlas({ data: ds.items })
        log.info('items...');
        log.info('Crawl finished.');

    
});
