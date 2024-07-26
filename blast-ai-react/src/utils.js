
// 判断当前设备是否为移动设备
export const isMobile = () => /Mobi/i.test(window.navigator.userAgent)
    || /iPhone|iPod|iPad/i.test(navigator.userAgent);


// 对每个对象的每个属性应用指定的映射函数mapFn
export const objectMap = (object, mapFn) => {
    return Object.keys(object).reduce((result, key) => {
        result[key] = mapFn(object[key]);
        return result
    }, {})
}


// 创建新的url对象并提取主机部分
export const normalizeURL = (u) => ((new URL(u).host).replace('www.', ''))

export const parseErrorCode = (error) => {
    try {
        return error.code ?? JSON.parse(`{${error.message.split("{")[1]}`).code
    } catch (e) {
        console.log("Failed to parse error code")
        console.log("Parse error:", e)
        return undefined
    }
}

// 解析错误对象
export const parseErrorMessage = (error) => {
    return error.message.split("{")[0].trim().replace("execution reverted: ", "")
}


// 解析交易错误对象
export const parseTxError = (error) => {
    try {
        console.log(error.message)
        return {
            code: parseErrorCode(error),
            message: parseErrorMessage(error)
        };
    } catch (parse_error) {
        console.log("Failed to parse message")
        console.log("Parse error:", parse_error)
        console.log("Original error:", error)
        return {
            code: undefined, message: error?.toString()
        }
    }
}


// 格式化数值"v",使其符合全款字符的显示格式
// Avoid big number errors without using external libraries
export const formatValue = (v) => v.toLocaleString('fullwide', {
    useGrouping: false
});

// 四舍五入
export const roundToDecimal = (n, d) => {
    return +n.toFixed(d)
}

// TODO: remove this when migrated to forked Web3Modal
// Puts "custom-metamask" provider as the first option


// 确保连接钱包的界面正常显示
export const dirtyFixConnectWalletUI = () => {
    const web3ModalElem = document.querySelector(".web3modal-modal-card")
    web3ModalElem?.insertBefore(web3ModalElem.lastChild, web3ModalElem.firstChild)
}