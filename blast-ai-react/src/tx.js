import { formatValue, parseTxError } from "./utils";
import { getCurrentNetwork, web3 } from "./wallet";
import { showAlert } from "./components/AutoHideAlert";
import { isEthereum } from "./contract";


// 估算交易的 gas limit、最大 gas 费用和最大优先级费用
export const buildTx = async (tx, txData, defaultGasLimit, gasLimitSlippage = 5000) => {
    console.log("txData :", txData)
    const estimatedGas = await estimateGasLimit(tx, txData, defaultGasLimit);
    if (!estimatedGas) {
        return undefined
    }
    const maxFeePerGas = await estimateMaxGasFee(tx);
    const maxPriorityFeePerGas = await estimateMaxPriorityFeePerGas();
    const gasLimit = estimatedGas + gasLimitSlippage
    return { ...txData, gasLimit, maxFeePerGas, maxPriorityFeePerGas }
}

// 使用 tx 对象的 estimateGas() 方法估算交易的 gas limit
const estimateGasLimit = (tx, txData, defaultGasLimit) => {
    return tx.estimateGas(txData).catch((e) => {
        const { code, message } = parseTxError(e);
        if (code === -32000) {
            return defaultGasLimit;
        }
        showAlert(`${message}. Check if you connected the correct wallet, try again or contact us to resolve`, "error");
        console.log(e);
    })
}


// 使用 web3.eth.getGasPrice() 方法获取当前的 gas 价格
const estimateMaxGasFee = async (tx) => {
    const gasPrice = await web3.eth.getGasPrice();
    // Math.max is for Rinkeby (low gas price), 2.5 Gwei is Metamask default for maxPriorityFeePerGas
    const maxGasPrice = Math.max(Math.round(Number(gasPrice) * 1.2), 5e9);
    const chainID = await getCurrentNetwork()
    return isEthereum(chainID) ? formatValue(maxGasPrice) : undefined;
}

// 使用 web3.eth.getChainId() 方法获取当前链的 ID
const estimateMaxPriorityFeePerGas = async () => {
    const chainID = await web3.eth.getChainId();
    return isEthereum(chainID) ? 2e9 : undefined;
}
