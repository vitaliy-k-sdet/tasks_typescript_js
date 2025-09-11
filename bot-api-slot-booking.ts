/* Bot used to book time slots over API requests for submitting documents in one of the services with high demand. 
*/

import axios, { AxiosRequestConfig } from 'axios';
import { pwd } from './secrets/pwd';
import { chromium } from 'playwright';

import notifier = require('node-notifier');
let tokenData: any;
const rootUrl = 'mfa.XXX.XX';

async function getTokenAndFetchData() {
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`https://${rootUrl}/services/40/59`);
    await page.click('.auth-btn')

    await page.waitForURL(url => url.href.startsWith('https://id.XXX/') && url.href.includes(`redirect_uri=https://${rootUrl}/auth`));

    await page.goto(`https://${rootUrl}/euid-auth-js`);

    await page.waitForTimeout(2000);
    const input = await page.$('input[type="file"]');
    await input.setInputFiles('./secrets/key.jks');

    await page.waitForTimeout(2000);
    await page.fill('#PKeyPassword', pwd);

    await Promise.all([
      page.waitForTimeout(2000),
      page.click('#id-app-login-sign-form-file-key-sign-button')
    ]);

    await page.waitForSelector('#btnAcceptUserDataAgreement');

    const [response] = await Promise.all([
      page.waitForResponse(response => response.url().includes(`https://${rootUrl}/api/token`)),
      page.click('#btnAcceptUserDataAgreement')
    ]);
    const responseBody = await response.json();
    tokenData = responseBody.token;
    console.log('Token data:', tokenData);

    await fetchData();

  } catch (error) {
    console.error('Error:', error);
    throw error; 
  }
}

(async () => {


  try {
    await getTokenAndFetchData();
  } catch (error) {

  } finally {
    process.exit();
  }
})();



const delay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const fetchData = async () => {

const dataBooking = (date: string, startTimes: string): any => {
  return {
    operationId: 610,
    date: date,
    startTime: startTimes,
    phone: '+1',
    email: 'd@gmail.com'
  };
};

const myHeadersAvailability = {
  accept: 'application/json, text/plain, */*',
  'accept-language': 'en-US,en;q=0.9,uk;q=0.8',
  authorization: `Bearer ${tokenData}`,
  cookie: '_cfuvid=fmPgRjFPwui2gdBMEPhx3U0PbP1aqnxwrsI_UvOaKf0-1712070255203-0.0.1.1-604800000; _ga=GA1.1.235210126.1703629879; cf_clearance=dcATwq33DvnyFjUQpoKLXcVYlXA_1tK4Q.edCd8K0VY-1712077039-1.0.1.1-0dSdlx3YREypybnT0UEl2Aga.bqEkclpBRBpK7tPfR_P6kkpAIZLNRK0TBOoyWP6q1GVTrDf3X2FIshYJH1OEw; _ga_EMQHDMV81K=GS1.1.1712077038.6.0.1712077042.0.0.0; JSESSIONID=C3737F4596083154F974545E40DA38FB; JSESSIONID=3FDA4F7D794202252B64F7AFF2F99949',
  dnt: '1',
  referer: `https://${rootUrl}/registration?countryId=40&institutionId=59&categoryId=1&operationId=610`, 
  'sec-ch': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
  'sec-ch-mobile': '?0',
  'sec-ch-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36curl'
};

const  myHeadersBooking = {
  'sec-ch': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
  'DNT': '1',
  'sec-ch-mobile': '?0',
  'Authorization': `Bearer ${tokenData}`,
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Content-Type': 'application/json',
  'Accept': 'application/json, text/plain, */*',
  referer: `https://${rootUrl}/registration?countryId=40&institutionId=59&categoryId=1&operationId=610`, 
  'sec-ch-platform': '"Windows"'
};

const requestOptionsAvailability: AxiosRequestConfig = {
  method: 'GET',
  headers: myHeadersAvailability,
  url: `https://${rootUrl}/api/schedule?operationId=610&lang=uk`,
  responseType: 'json'
};

const requestOptionsBooking = (date: string, startTimes: string): AxiosRequestConfig => {
  return {
    method: 'POST',
    url: `https://${rootUrl}/api/appointment/book?lang=uk`,
    headers: myHeadersBooking,
    data: dataBooking(date, startTimes)
  };
};


  const startTime = Date.now();
  let responseBooking: { date: any; startTime: any; };
  let tries = 0;
  let success = false;
  const setTimeout = 15000;
  while (!success) {
    try {
      const response = await axios(requestOptionsAvailability);
      tries++;
      if (response.data && response.data.length > 0) {
        console.log(response.data);
        success = true; 
        showNotification('THERE IS ADULT (auto token) SLOT!!! GO GO GO!!!');
       
        const availableSlots = await response.data[0];
        const bookSlot = await axios(requestOptionsBooking(await availableSlots.date, await availableSlots.startTimes[0]));
        responseBooking = await bookSlot.data;

        if (bookSlot.status === 200){
          showNotification(`ADULT (auto token) SLOT BOOKED FOR ${responseBooking.date} at ${responseBooking.startTime}`);
        }
      } else {
        const currentTime = new Date().toLocaleTimeString();
        const elapsedTime = (Date.now() - startTime) / (1000 * 60);
        console.log(`[${currentTime}] NO ADULT (auto token) SLOTS!!! Retrying every ${setTimeout/1000} sec... (Try ${tries}) - Elapsed time: ${elapsedTime.toFixed(2)} minutes`);
        await delay(setTimeout);
      }
    } catch (error) {
      console.error('\n\nINVALID TOKEN !!!\n\n',error);
      showNotification('INVALID TOKEN !!!');
      await getTokenAndFetchData()
      break; 
    }

  }

  const endTime = Date.now();
  const totalDuration = (endTime - startTime) / (1000 * 60);
  console.log(`\n\nTotal script execution duration: ${totalDuration.toFixed(2)} minutes`);

  if (success) {
    console.log(`ADULT (auto token) SLOT BOOKED for: ${responseBooking.date} at ${responseBooking.startTime}`);
  } else {
    console.log('\n\n Failed to receive data after multiple attempts.');
  }
};

const showNotification = (message: string) => {
  notifier.notify({
    title: 'Data Notification',
    message: message,
    sound: true,
  });
};


