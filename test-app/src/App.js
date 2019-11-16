import React, { Component } from "react";
import './App.css';
import { Button } from 'reactstrap';
import JSZip from 'jszip';
import { initDB, useIndexedDB } from 'react-indexed-db';

export const DBConfig = {
  name: 'MyDB',
  version: 1,
  objectStoresMeta: [
    {
      store: 'people',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'name', keypath: 'name', options: { unique: false } },
        { name: 'email', keypath: 'email', options: { unique: false } }
      ]
    }
  ]
};

initDB(DBConfig);

class App extends Component {
  constructor(props) {
    super(props);
    this.fileUpload = React.createRef();
    this.importFiles = this.importFiles.bind(this);
    this.exportFiles = this.exportFiles.bind(this);
    this.showImage = this.showImage.bind(this);
    this.state = {
      imagesrc: ""
    };
    this.lastFileNameKey = "lastFileName";
    this.lastZipTypeKey = "lastZipType"
  }

  importFiles(e) {
    this.fileUpload.current.click();
  }

  async onFilesAdded(e) {
    var file = e.target.files[0];
    console.log(file);
    
    if (file.type.includes("nonononon")) {
      localStorage.setItem(App.lastFileNameKey, file.name);
      localStorage.setItem(App.lastZipTypeKey, file.type);

      var zip = new JSZip();
      zip.loadAsync(file).then(zip => {
        // console.log("Zip from blob file :", zip);
        let directories = Object.keys(zip.files);
        let profondeur = 0;
        let testtable = [];
        for (let i = 0; i < directories.length; i++) {
          let temp = directories[i].split("/").length;
          testtable.push({profondeur: temp, nom: directories[i]});
          if (temp > profondeur) {
            profondeur = temp;
          }
        }
        console.log("La profondeur max :", profondeur)
        testtable.sort((a, b) => (a.profondeur > b.profondeur) ? 1 : ((b.profondeur > a.profondeur) ? -1 : 0));
        console.log(testtable);
        let json = {"name": "projet", "toggled": false, "children": []}
        for (let pro = 0; pro <= profondeur; pro++) {
          for (let i = 0; i < testtable.length; i++) {
            // test profondeur max 3
            // 1 Mettre tout les dossiers dans le json
            // 2 Ajouter les fichiers aux bons endroits avec leur nom
            if (testtable[i]["profondeur"] === pro) {
              // Ajouter au json selon l'architecture (quand vide master quand remplit vide)
              const temp = testtable[i]["nom"].split("/");
              // Dossier
              if (temp[temp.length - 1] === "") {
                // Trouver l'endroit ou push le dossier
                json["children"].push({"name": temp[temp.length - 2], "toggled": false, "folder": true, "children": []})
              }
            }
          }
          console.log(json);
        }
      })
      .catch((e) => {
        console.log(e)
      });
    }

    if (file.type.includes("zip")) {      
      async function decompress(file) {
        return new Promise((resolve, reject) => {
          var zip = new JSZip();
          zip.loadAsync(file).then(zip => {
            resolve(zip);
          });
        });
      }

      async function readOnly(file) {
        return new Promise((resolve, reject) => {
          let fileReader = new FileReader();
          fileReader.onload = function(fileLoadedEvent)
          {
            resolve(fileLoadedEvent.target.result);
          };
          fileReader.readAsText(file);
        });
      }

      let zipobject = await decompress(file);

      console.log(zipobject);

      let myFile = zipobject.files["compile_my_code.sh"];

      console.log(zipobject.files["compile_my_code.sh"]);

      let text = await zipobject.files["compile_my_code.sh"].async("string");
      console.log("Content of file", text);

      zipobject.file("compile_my_code.sh", "Et merce la famille !");

      let text2 = await zipobject.files["compile_my_code.sh"].async("string");
      console.log("Content of file", text2);

      console.log(zipobject.files["compile_my_code.sh"]);
    }
  }

  decodeFile(file) {
    return new Promise((resolve, reject) => { 
        file.async("string").then(function (data) {
            resolve(data)
        }).catch((e) => {
            console.log(e)
            reject(e)});     
    });
  }

  exportFiles(e) {
    localStorage.getItem('ImageID');
  }

  showImage(e) {
    console.log("Showing image");
    const b64string = localStorage.getItem(localStorage.getItem(App.lastFileNameKey));
    console.log(b64string)
    const imageSrc = "data:image/jpeg;base64," + b64string
    this.setState({ imagesrc: imageSrc });

    useIndexedDB('people').add({ name: 'name', email: 'email' })
    .then(() => {console.log("Added")})
    .catch((e) => {console.log(e)});
  }

  render() { 
    return (
      <div>
        <div className="ImportButtonContainer">
          <Button onClick={this.importFiles} color="primary" size="lg">IMPORT</Button>
        </div>
        <input ref={this.fileUpload} className="FileInput" type="file" onChange={this.onFilesAdded}/>
        {/* <div className="ImportButtonContainer">
          <Button onClick={this.showImage} color="primary" size="lg">SHOW IMAGE</Button>
        </div>
        <img alt="" src={this.state.imagesrc}/> */}
      </div>
    );
  }
}

export default App;
