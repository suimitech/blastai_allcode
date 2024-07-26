import React from "react";
import AutoHideAlert, { alertRef } from "./AutoHideAlert.js";
import MintModal, { modalRef } from "./MintModal.js";
import { ThemeProvider } from "@mui/material";
import { theme } from "../styles/theme.js";
// 渲染一个应用的根组件，其中包含了一个主题提供器（ThemeProvider），并在主题提供器内部渲染了一个自动隐藏警报（AutoHideAlert）和一个模态框（MintModal）
export const App = () => {
    return <ThemeProvider theme={theme}>
        <div>
            <AutoHideAlert ref={alertRef} />
            <MintModal ref={modalRef} />
        </div>
    </ThemeProvider>
}
