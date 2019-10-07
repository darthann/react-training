import React, { Component } from "react";
import './App.css';
import { Button } from 'reactstrap';

class App extends Component {
  constructor(props) {
    super(props);
    this.fileUpload = React.createRef();
    this.importFiles = this.importFiles.bind(this);
    this.exportFiles = this.exportFiles.bind(this);
  }

  importFiles(e) {
    // localStorage.setItem('myValue', Math.random());
    // console.log(localStorage.getItem('myValue'));
    this.fileUpload.current.click();
  }

  onFilesAdded(e) {
    console.log("onFilesAdded");
    var files = e.target.files;
    console.log(files);
    // Add to local storage, make a button to export from local storage (image)
    
    // promess UnzipFile(e.target.files.byteArray)
    localStorage.setItem('ImageID', e.target.files);
    // FileManagerService('ImageID');
  }

  exportFiles(e) {
    localStorage.getItem('ImageID')
  }

  render() { 
    return (
      <div>
        <Button onClick={this.importFiles} color="primary" size="lg">IMPORT ZIP</Button>
        <input ref={this.fileUpload} className="FileInput" type="file" multiple onChange={this.onFilesAdded}/>
        <Button onClick={this.exportFiles} color="primary" size="lg">IMPORT ZIP</Button>
      </div>
    );
  }
}

export default App;
