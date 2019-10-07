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
    this.state = {
      imagesrc: ""
    };
    this.lastFileNameKey = "lastFileName";
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
    file.arrayBuffer()
    .then(buffer => {
      console.log("Array buffer promise is done !");

      let typed_array = new Uint8Array(buffer);
      // const st = String.fromCharCode.apply(null, typed_array);
      let st = ""
      try {
        st = String.fromCharCode.apply(null, typed_array);
        
      } catch {
        st = typed_array.reduce((data, byte) => { return data + String.fromCharCode(byte)}, '');
      }

      const base64String = btoa(st);

      // {`data:image/jpeg;base64,${data}`}

      // this.imageurl = this.domSanitizer.bypassSecurityTrustUrl(‘data:image/jpg;base64, ‘ + base64String);

      // if out of range const STRING_CHAR = TYPED_ARRAY.reduce((data, byte)=> {return data + String.fromCharCode(byte);}, ''));


      // var b64string = btoa(buffer)
      // // let b64string = btoa(String.fromCharCode(...new Uint8Array(buffer)));

      localStorage.setItem("lastFileName", file.name);
      localStorage.setItem(localStorage.getItem(App.lastFileNameKey), base64String);
    })
    .catch((e) => {
      console.log(e)
    });
    // FileManagerService('ImageID');
  }

  exportFiles(e) {
    localStorage.getItem('ImageID');
  }

  showImage(e) {
    console.log("Showing image");
    // image as file text to file.
    // var imageFileAsText = localStorage.getItem(this.lastFileName);
    // var imageFile = new File([imageFileAsText], "test.jpg", {
    //   type: "image/jpeg",
    // });
    // this.setState({
    //   file: URL.createObjectURL(imageFile)
    // })

    // let arrayBuffer = atob(localStorage.getItem(App.lastFileName));

    // let imagefile = new File([arrayBuffer], "test.jpg", { type: "image/jpeg", });

    // let testFile = new File([arrayBuffer], "RandomName.jpg");

    // console.log(imagefile);
    // console.log(testFile);

    const b64string = localStorage.getItem(localStorage.getItem(App.lastFileNameKey));
    console.log(b64string)
    const imageSrc = "data:image/jpeg;base64," + b64string
    this.setState({ imagesrc: imageSrc });
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
