import bodyParser from 'body-parser';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { parseFile } from 'music-metadata';
import cors from 'cors'

const app = express();

app.use(cors())
app.use(bodyParser.urlencoded({extended: true})) 
app.use(bodyParser.json())  

import { readFile } from 'fs/promises';
const config = JSON.parse(
  await readFile('./config.json')
);

const folderLocation = config.musakDir;


function parseMp3FromFileName(fileName) {
    var filePath = fileName;
    let picture = null;

    if(fileName.includes("-")) {
        const fileNameParts = fileName.split("-");
        const artist = fileNameParts[0].trim();
        const title = fileNameParts[1].slice(0, -4).trim();
        return { "title":title,"artist":artist, "picture":picture ,"filePath":filePath };
    }
    
    const title = fileName.slice(0, -4).trim();
    return { "title":title,"artist":null, "picture":picture ,"filePath":filePath };
}

async function parseMp3Files(folderPath) {
    const files = await fs.promises.readdir(folderPath);
    var filesToSend = []

    for (const file of files) {
      if (path.extname(file) === '.mp3') {
        const metadata = await parseFile(path.join(folderPath, file), { native: true });
        if (metadata) {

          //console.log(metadata.common.picture)

            let { title, artist, picture } = metadata.common;
            

            if(title && artist && picture){
                //console.log(`META: ${title}, ${artist}, ${album}`);
                var songMetaData = { title, artist, picture }
                songMetaData.filePath = file
                filesToSend.push(songMetaData);
            }
            else{
                try{
                    //console.log(parseMp3FileName(file));
                    filesToSend.push(parseMp3FromFileName(file));
                }
                catch(err){
                    console.log(`Probelm causing file: ${file}`);
                    console.error(err)
                }
            }
        } else {
            console.log("Why am i here? just to suffer.")
        }
      }
    }

    return filesToSend;
  }


//sends meta data (including image)
app.get('/api/getMetaData', async (req, res) => {

  try {
      var toSend = await parseMp3Files(folderLocation);
      //console.log(toSend[0].picture)
      res.send(toSend)
  } catch (err) {
      console.log("An error occurred.");
      console.log(err);
      res.sendStatus(500);
  }
});


app.get('/api/getSong/:songPath', async (req, res) => {

  let fullFilepath = `${folderLocation}/${req.params.songPath}`
  
  fs.readFile(fullFilepath, (error, data) => {
    if (error) {
      res.sendStatus(500)
      return
    }

    res.type('audio/mp3')
    res.send(data)
  })

});


/*Host/Run it*/
const port = process.env.PORT || 5050;
app.listen(port, ()=>{
    console.log(`Listening on http://localhost:${port}`);
});
