import React from 'react';
import amplitude from 'amplitude-js';
import { render } from "react-dom";
import { App } from "./components/App.js";
import "./styles/index.css";
import { showAlert } from "./components/AutoHideAlert.js";
import { showMintModal } from "./components/MintModal.js";
import { init } from "./mint";
import { dirtyFixConnectWalletUI } from "./utils";

//  React 应用初始化和渲染过程的管理逻辑
const createDOMElement = () => {
    const body = document.getElementsByTagName('body')[0];
    const div = Object.assign(document.createElement('div'), {
        id: "root",
    });
    body.appendChild(div);
    return div;
}

const renderAppContainer = () => {
    render(<App />, createDOMElement());
}

const isRendered = () => {
    return !!document.getElementById("root")
}

const renderAndInit = () => {
    renderAppContainer()
    if (!isRendered()) {
        console.error("React not rendered, returning")
        return
    }
    init()

    dirtyFixConnectWalletUI()
}

document.addEventListener("DOMContentLoaded", () => {
    renderAndInit()
});

window.onload = () => {
    if (!isRendered()) {
        console.warn("React re-rendering in window.onload")
        renderAndInit()
    }
}

export { showAlert, showMintModal, renderAppContainer };



