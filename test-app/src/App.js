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

  onFilesAdded(e) {
    var file = e.target.files[0];
    console.log(file);
    
    if (file.type.includes("zip")) {
      console.log("Zip uploading...");
      localStorage.setItem(App.lastFileNameKey, file.name);
      localStorage.setItem(App.lastZipTypeKey, file.type);

      var zip = new JSZip();
      zip.loadAsync(file).then(zip => {
        console.log("Zip from blob file :", zip);
        let directories = Object.keys(zip.files);
        let profondeur = 0;
        let testtable = [];
        for (let i = 0; i < directories.length; i++) {
          console.log(directories[i]);
          let temp = directories[i].split("/").length;
          testtable.push({profondeur: temp, nom: directories[i]});
          if (temp > profondeur) {
            profondeur = temp;
          }
        }
        console.log("La profondeur max :", profondeur)
        testtable.sort((a, b) => (a.profondeur > b.profondeur) ? 1 : ((b.profondeur > a.profondeur) ? -1 : 0));
        console.log(testtable);
        for (let i; i < profondeur; i++) {
          
        }
      })
      .catch((e) => {
        console.log(e)
      });
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
          <Button onClick={this.importFiles} color="primary" size="lg">IMPORT ZIP</Button>
        </div>
        <input ref={this.fileUpload} className="FileInput" type="file" onChange={this.onFilesAdded}/>
        <div className="ImportButtonContainer">
          <Button onClick={this.showImage} color="primary" size="lg">SHOW IMAGE</Button>
        </div>
        <img alt="" src={this.state.imagesrc}/>
      </div>
    );
  }
}

export default App;
