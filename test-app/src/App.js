import React, { Component } from "react";
import './App.css';
import { Button } from 'reactstrap';

class App extends Component {
  constructor(props) {
    super(props);
    this.fileUpload = React.createRef();
    this.importFiles = this.importFiles.bind(this);
    this.exportFiles = this.exportFiles.bind(this);
    this.showImage = this.showImage.bind(this);
    this.lastFileName = "";
    this.state = {
      file: null
    }
  }

  importFiles(e) {
    // localStorage.setItem('myValue', Math.random());
    // console.log(localStorage.getItem('myValue'));
    this.fileUpload.current.click();
  }

  onFilesAdded(e) {
    var file = e.target.files[0];
    console.log(file);
    // Add to local storage, make a button to export from local storage (image)
    // promess UnzipFile(e.target.files.byteArray)
    file.text().then(text => {localStorage.setItem(file.name, text); console.log("Promess is done !"); this.lastFileName = file.name}).catch((e) => console.log(e));
    // FileManagerService('ImageID');
  }

  exportFiles(e) {
    localStorage.getItem('ImageID');
  }

  showImage(e) {
    console.log("Showing image");
    // image as file text to file.
    var imageFileAsText = localStorage.getItem(this.lastFileName);
    var imageFile = new File([imageFileAsText], "test.jpg", {
      type: "image/jpeg",
    });
    this.setState({
      file: URL.createObjectURL(imageFile)
    })
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
        <img src={this.state.file}/>
      </div>
    );
  }
}

export default App;
