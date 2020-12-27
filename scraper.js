const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());
const axios = require('axios');
// const cheerio = require('cheerio');
const InstagramClient = require('./utils/insta-client');
const client = new InstagramClient();

// // accepts the URL of an instagram page
// const getVideo = async (url) => {
//   // calls axios to go to the page and stores the result in the html variable
//   const html = await axios.get(url);
//   // calls cheerio to process the html received
//   // const $ = cheerio.load(html.data);
//   // searches the html for the videoString
//   const videoString = $("meta[property='og:video']").attr('content');
//   console.log(videoString);
//   // returns the videoString
//   return videoString;
// };

// // the callback is an async function
// app.post('/api/download', async (request, response) => {
//   console.log('request coming in...', request.body);
//   try {
//     // call the getVideo function, wait for videoString and store it
//     // in the videoLink variable
//     const videoLink = await getVideo(request.body.url);
//     // if we get a videoLink, send the videoLink back to the user
//     if (videoLink !== undefined) {
//       response.json({ downloadLink: videoLink });
//     } else {
//       // if the videoLink is invalid, send a JSON response back to the user
//       response.json({ error: 'The link you have entered is invalid. ' });
//     }
//   } catch (err) {
//     // handle any issues with invalid links
//     response.json({
//       error: 'There is a problem with the link you have provided.',
//     });
//   }
// });

app.get('/:instagramName/followers', async (request, response) => {
  const instagramName = request.params.instagramName;
  try {
    const followers = await client.getFollowers(instagramName);
    response.json({
      success: true,
      followers: followers,
    });
  } catch (e) {
    response.json({
      success: false,
      error: e.toString(),
    });
    return;
  }
});

app.post('/download/video', async (req, res) => {
  const url = req.body.url;
  try {
    const downloadLink = await client.getVideoDownloadLink(url);
    if (downloadLink != undefined) {
      res.json({
        downloadLink: downloadLink,
      });
    } else {
      res.json({ error: 'Link is not valid.' });
    }
  } catch (e) {
    res.json({
      error: 'There is a problem with the link you have provided.',
      e: e,
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  await client.start();
  console.log(`listening on ${PORT}`);
});
