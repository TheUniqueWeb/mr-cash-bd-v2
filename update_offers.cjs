const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const regex = /\/\/ Fallback offers if none available[\s\S]*?res\.json\(\{/m;

const replacement = `
      // Fallback offers: ALWAYS add them to ensure the offerwall looks populated
      const fallbackOffers = [
        {
          campid: '1092831',
          title: 'Bkash App Install & Transact',
          description: 'Download the official bKash app from the Google Play Store, register a new account, and perform a micro-transaction.',
          link: 'https://play.google.com/store/apps/details?id=com.bKash.customerapp',
          payoutPoints: 8500,
          payoutUSD: 0.85,
          originalTitle: 'Bkash App Install & Transact',
          country: 'BD',
          device: 'Android',
          category: 'App Installs'
        },
        {
          campid: '1092832',
          title: 'Nagad Account Verification',
          description: 'Open a Nagad account using your national ID, complete KYC verification, and set your secure 4-digit PIN.',
          link: 'https://play.google.com/store/apps/details?id=com.konasl.nagad',
          payoutPoints: 7000,
          payoutUSD: 0.70,
          originalTitle: 'Nagad Account Verification',
          country: 'BD',
          device: 'Mobile',
          category: 'Signups'
        },
        {
          campid: '1092833',
          title: 'Subscribe MR CASH BD (YouTube)',
          description: 'Subscribe to our official YouTube channel and turn on the notification bell to stay updated with new earning methods!',
          link: 'https://youtube.com',
          payoutPoints: 500,
          payoutUSD: 0.05,
          originalTitle: 'YouTube Subscription',
          country: 'Global',
          device: 'Mobile',
          category: 'Signups'
        },
        {
          campid: '1092834',
          title: 'Join MR CASH BD Telegram',
          description: 'Join our official Telegram channel for instant payment proofs, updates, and daily promo codes!',
          link: 'https://t.me/mrcashbd',
          payoutPoints: 400,
          payoutUSD: 0.04,
          originalTitle: 'Telegram Join',
          country: 'Global',
          device: 'Mobile',
          category: 'Signups'
        },
        {
          campid: '1092835',
          title: 'Daraz Online Shopping Install',
          description: 'Install the Daraz App and register a new account. Browse for 2 minutes to complete the task.',
          link: 'https://play.google.com/store/apps/details?id=com.daraz.android',
          payoutPoints: 4500,
          payoutUSD: 0.45,
          originalTitle: 'Daraz Online Shopping',
          country: 'BD',
          device: 'Android',
          category: 'App Installs'
        }
      ];

      formattedOffers = [...formattedOffers, ...fallbackOffers];

      res.json({
`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
