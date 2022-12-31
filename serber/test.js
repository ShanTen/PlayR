import fs from 'fs';
import path from 'path';
import { parseFile } from 'music-metadata';

const folderPath = ''; // Replace with the actual path to the folder

function parseMp3FileName(fileName) {
    if(fileName.includes("-")) {
        const fileNameParts = fileName.split(/[- ]/);
        const artist = fileNameParts[0];
        const song = fileNameParts[1].slice(0, -4);
        return { artist, song };
    }
    
    const song = fileName.slice(0, -4);
    return { undefined, song };
  }
  

fs.readdir(folderPath, (err, files) => {
    if (err) {
        console.error(err);
        return;
    }

    files.forEach((file) => {
        if (path.extname(file) === '.mp3') {
            parseFile(path.join(folderPath, file), { native: true })
                .then((metadata) => {

                    if (metadata) {
                        let { title, artist, album } = metadata.common;
                        if(title && artist && album){
                            console.log(`META: ${title}, ${artist}, ${album}`);
                        }
                        else{
                            try{
                                console.log(parseMp3FileName(file));    
                            }
                            catch(err){
                                console.log(`Probelm causing file: ${file}`);
                                console.error(err)
                            }
                            
                        }
                            
                    } else {
                        console.log(`This shouldnt be here: ${file}`);
                    }


                })
                .catch((err) => {
                    console.error(err);
                });
        }
    });
});
