import React from "react";

import { ButtonGroup, Col, Button } from "react-bootstrap";
export const Importer = props => (
  <ButtonGroup justified>
    <Col md={4} sm={4}>
      <label for="project-input">
        <Button bsStyle="primary" id="projectBtn">
          <i className="glyphicon glyphicon-list-alt" />
          Import Zip
        </Button>
      </label>
      <input
        type="file"
        accept="application/zip"
        id="project-input"
        style={{ display: "none" }}
      />
    </Col>
    <Col md={4} xs={4}>
      <label for="file-input">
        <Button bsStyle="primary" id="fileBtn">
          <i className="glyphicon glyphicon-file" />
          Import File
        </Button>
      </label>
      <input type="file" style={{ display: "none" }} id="file-input" />
    </Col>
    <Col md={4} xs={4}>
      <Button bsStyle="primary" id="saveBtn" disabled={!props.validateForm}>
        <i className="glyphicon glyphicon-floppy-save" />
        Add To Project
      </Button>
    </Col>
  </ButtonGroup>
);
