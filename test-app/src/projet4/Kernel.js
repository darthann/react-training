import React from "react";
import "./Kernel.css";
import "../assets/css/file-manager.css";
import config from "../config";
import AceEditor from "react-ace";
import { FormGroup, FormControl, Button, Col, Row } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import { toast } from "react-toastify";
import API from "../services/api";
import Script from "react-load-script";
import db from "../services/db";
import { Scrollbars } from "react-custom-scrollbars";
import { IDEStyle } from "./IDEStyle";
import { Importer } from "./Importer";
import { ProjectAction } from "./ProjectAction";

import "brace/ext/language_tools";
import "brace/ext/searchbox";
import "brace/keybinding/vim";

import "brace/mode/c_cpp";
import "brace/mode/javascript";
import "brace/mode/python";
import "brace/mode/csharp";
import "brace/mode/sh";
import "brace/snippets/css";
import "brace/snippets/less";
import "brace/snippets/html";

import "brace/theme/github";
import "brace/theme/monokai";
import "brace/theme/tomorrow";
import "brace/theme/kuroir";
import "brace/theme/twilight";
import "brace/theme/xcode";
import "brace/theme/textmate";
import "brace/theme/solarized_dark";
import "brace/theme/terminal";
import "brace/theme/solarized_light";

export default class Kernel extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      mode: props.defaultMode,
      theme: props.defaultTheme,
      fontSize: props.defaultFontSize,
      content: "",
      isLoading: null,
      isDeleting: null,
      filename: "",
      files: null,
      name: "",
      version: "",
      description: "",
      currentKernelID: null,
      modalShow: false,
      detailModalShow: false
    };
    this.onChange = this.onChange.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
    this.onModeChange = this.onModeChange.bind(this);
    this.onThemeChange = this.onThemeChange.bind(this);
    this.onFontSizeChange = this.onFontSizeChange.bind(this);
    this.onKernelClick = this.onKernelClick.bind(this);
  }

  async componentDidMount() {
    try {
      const serverFiles = await this.getServerFiles();
      if (serverFiles) {
        this.setState({ files: serverFiles.data }, () => {
          this.refreshKernelList();
        });
      }
    } catch (e) {
      alert(e);
    }

    this.setState({ isLoading: false });
  }

  /* componentDidUpdate(prevProps, prevState) {
    if (prevState.files !== this.state.files) {
      this.updateKernelList();
    }
  } */

  getServerFiles() {
    return API.get("/users/" + this.props.userID + "/files");
  }

  async updateKernelList() {
    try {
      const serverFiles = await this.getServerFiles();
      if (serverFiles) {
        this.setState({ files: serverFiles.data }, () => {
          if (this.state.files) this.refreshKernelList();
        });
      }
    } catch (e) {
      alert(e);
    }
  }

  onChange(content) {
    this.setState({ content: content });
  }

  onChangeText(e) {
    var fileName = e.target.getAttribute("fileName");
    if (fileName) {
      var parts = fileName.split(".");
      var ext = parts[parts.length - 1];
      switch (ext) {
        case "sh":
          this.setState({ ...this.state, mode: "sh" });
          break;
        case "py":
          this.setState({ ...this.state, mode: "python" });
          break;
        case "cpp":
          this.setState({ ...this.state, mode: "c_cpp" });
          break;
        case "h":
          this.setState({ ...this.state, mode: "c_cpp" });
          break;
        case "js":
          this.setState({ ...this.state, mode: "javascript" });
          break;
        case "cs":
          this.setState({ ...this.state, mode: "csharp" });
          break;
        default:
      }
    }

    this.setState({ content: e.target.value });
  }

  onModeChange(obj) {
    if (obj && obj.value) this.setState({ ...this.state, mode: obj.value });
  }

  onThemeChange(obj) {
    if (obj && obj.value) this.setState({ ...this.state, theme: obj.value });
  }

  onFontSizeChange(obj) {
    if (obj && obj.value) this.setState({ ...this.state, fontSize: obj.value });
  }

  refreshKernelList() {
    var kernelList = document.getElementById("kernelList");
    var li, openKernel;
    kernelList.innerHTML = "";
    var data = this.state.files;
    data.forEach(item => {
      li = document.createElement("li");
      openKernel = document.createElement("span");
      openKernel.className = "file-label";
      openKernel.textContent = item.Filename;
      openKernel.addEventListener("click", this.onKernelClick, false);
      li.appendChild(openKernel);
      kernelList.appendChild(li);
    });
  }

  onKernelClick(obj) {
    if (!obj.target.parentElement.classList.contains("selected")) {
      obj.target.parentElement.className = "selected";

      if (obj && obj.target.innerText) {
        var kernelName = obj.target.innerText;
        this.setState({ ...this.state, filename: kernelName });
        let data = this.state.files;
        data.forEach(item => {
          if (item.Filename === kernelName) {
            API.get("/users/" + this.props.userID + "/files/" + item.KernelId, {
              params: {
                download: true,
                responseType: "arraybuffer"
              }
            })
              .then(res => {
                console.log(res);
                var byteArray = new Uint8Array(res.data.File.Body.data);
                this.setState({
                  ...this.state,
                  currentKernelID: item.KernelId
                });
                var newFile = new File([byteArray], res.data.Name, {
                  type: "application/zip"
                });
                if (newFile) {
                  db.fs
                    .put({ id: 1, project: newFile })
                    .then(function() {
                      document.getElementById("fileChangeBtn").click();
                    })
                    .catch(function(error) {
                      console.log("Ooops: " + error);
                    });
                } else {
                  toast.error("The selected project does not contain any file");
                }
              })
              .catch(err => {
                console.error("Could not get file from server");
              });
          }
        });
      }
    }
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleSubmit = async event => {
    event.preventDefault();
    this.setState({ detailModalShow: false });
    if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE /
          1000000} MB.`
      );
      return;
    }
    this.setState({ isLoading: true });

    try {
      await this.createKernel();
      await this.updateKernelList();
      document.getElementById("clearTreeBtn").click();
      toast.success("Saving completed successfully");
      this.setState({ isLoading: false });
    } catch (e) {
      toast.error("Failed to upload all files");
      this.setState({ isLoading: false });
    }
  };

  async createKernel() {
    let formData = new FormData();
    const { name, version, description } = this.state;
    db.fs
      .get(1)
      .then(function(blobData) {
        if (blobData) {
          var file;
          file = blobData.project;
          if (file) {
            formData.append("file", file);
            formData.append("name", name);
            formData.append("version", version);
            formData.append("description", description);
            console.log(formData);
          }
        }
      })
      .catch(err => {
        console.error(err);
        console.error("Could not get database files");
      })
      .finally(() => {
        console.log(formData);
        if (!this.state.currentKernelID) {
          return API.post("/users/" + this.props.userID + "/files", formData);
        } else {
          return API.put(
            "/users/" +
              this.props.userID +
              "/files/" +
              this.state.currentKernelID,
            formData
          );
        }
      });
  }

  validateForm() {
    return this.state.content.length > 0;
  }

  render() {
    let detailClose = () => this.setState({ detailModalShow: false });
    let detailShow = () => this.setState({ detailModalShow: true });
    return (
      <React.Fragment>
        <div
          className="kernel"
          style={{
            padding: "5px",
            border: "1px solid #ccc",
            backgroundColor: "#f8f8f8",
            borderRadius: "6px"
          }}
        >
          <Row>
            <Col md={6}>
              <IDEStyle
                state={this.state}
                onModeChange={this.onModeChange}
                onThemeChange={this.onThemeChange}
                onFontSizeChange={this.onFontSizeChange}
              />
            </Col>

            <Col md={6}>
              <Importer validateForm={this.validateForm()} />
            </Col>
          </Row>
          <Row style={{ marginTop: "10px" }}>
            <Col
              md={5}
              style={{
                paddingRight: "0px",
                "user-select": "none"
              }}
            >
              <Col
                md={4}
                xs={4}
                style={{
                  paddingRight: "0px",
                  paddingLeft: "0px"
                }}
              >
                <Scrollbars style={{ height: 450 }}>
                  <div className="kernels">
                    <ul className="kernelList" id="kernelList" />
                  </div>
                </Scrollbars>
              </Col>
              <Col
                md={4}
                xs={4}
                style={{
                  paddingRight: "0px",
                  paddingLeft: "5px"
                }}
              >
                <Scrollbars style={{ height: 450 }}>
                  <div className="directories">
                    <div className="tree" id="tree" />
                  </div>
                </Scrollbars>
              </Col>
              <Col
                md={4}
                xs={4}
                style={{
                  paddingRight: "0px",
                  paddingLeft: "5px"
                }}
              >
                <Scrollbars style={{ height: 450 }}>
                  <div className="files">
                    <ul className="listing" id="listing" />
                  </div>
                </Scrollbars>
              </Col>
            </Col>
            <Col
              md={7}
              style={{
                paddingLeft: "5px"
              }}
            >
              <AceEditor
                mode={this.state.mode}
                theme={this.state.theme}
                fontSize={this.state.fontSize}
                width="auto"
                onChange={this.onChange}
                value={this.state.content}
                name="UNIQUE_ID_OF_DIV"
                editorProps={{ $blockScrolling: Infinity }}
                height={"450px"}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: true,
                  showLineNumbers: true,
                  highlightActiveLine: true,
                  showPrintMargin: false,
                  tabSize: 2
                }}
                //keyboardHandler="vim"
              />
            </Col>
          </Row>
          <Row style={{ padding: "20px" }}>
            <form>
              <div style={{ display: "none" }}>
                <FormGroup controlId="content">
                  <FormControl
                    componentClass="textarea"
                    name="content"
                    value={this.state.content}
                    onChange={this.onChangeText}
                    onInput={this.onChangeText}
                  />
                </FormGroup>
                <progress
                  id="progress-export-zip"
                  className="progress-export-zip"
                  hidden
                />
                <Button bsStyle="danger" id="fileChangeBtn" />
                <Button
                  bsStyle="danger"
                  id="backupCompleteTrigger"
                  onClick={detailShow}
                />

                <Button bsStyle="danger" id="clearBtn">
                  <i className="glyphicon glyphicon-remove" />
                  Clear
                </Button>
                <Button bsStyle="danger" id="clearTreeBtn">
                  <i className="glyphicon glyphicon-remove" />
                  ClearTree
                </Button>
                <LoaderButton
                  style={{ position: "relative" }}
                  bsStyle="primary"
                  bsSize="sm"
                  id="save2cacheBtn"
                  isLoading={this.state.isLoading}
                  text="Save To Cache"
                  loadingText="Saving…"
                />
              </div>
              <ProjectAction
                state={this.state}
                detailClose={detailClose}
                modalClose={() => this.setState({ modalShow: false })}
                handleChange={this.handleChange}
                handleSubmit={this.handleSubmit}
                userID={this.props.userID}
                onClickManageProject={() => this.setState({ modalShow: true })}
              />
            </form>
          </Row>
        </div>
        <Script url="lib/file-manager.js" />
      </React.Fragment>
    );
  }
}
