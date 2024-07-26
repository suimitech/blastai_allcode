import { getWalletAddressOrConnect, web3 } from "../wallet.js";
import { formatValue } from "../utils.js";
import { NFTContract } from "../contract.js"
import { buildTx } from "../tx";
import { readOnlyWeb3 } from "../web3";

// 用于在 NFTContract.methods 对象中查找与给定方法名称匹配的方法名。
const findMethodByName = (methodName) =>
    Object.keys(NFTContract.methods)
        .find(key => key.toLowerCase() === methodName.toLowerCase())


// 用于获取可能的自定义方法名，如果存在的话，返回相应的方法
const getMethodWithCustomName = (methodName) => {
    const method = window.DEFAULTS?.contractMethods ? window.DEFAULTS?.contractMethods[methodName] : undefined
    if (method) {
        console.log(`Using custom ${methodName} method name: `, method)
        if (NFTContract.methods[method]) {
            return NFTContract.methods[method]
        } else {
            alert(`Custom ${methodName} name isn't present in the ABI, using default name`)
            console.log(`Custom ${methodName} name isn't present in the ABI, using default name`)
        }
    }
    return undefined
}


// 用于获取执行mint操作的方法，并根据提供的参数执行该方法
const getMintTx = ({ numberOfTokens }) => {
    const customMintMethod = getMethodWithCustomName('mint')
    if (customMintMethod)
        return customMintMethod(numberOfTokens)

    console.log("Using hardcoded mint method detection")
    const methodNameVariants = ['mint', 'publicMint', 'mintNFTs', 'mintPublic', 'mintSale']
    const name = methodNameVariants.find(n => findMethodByName(n) !== undefined)
    if (!name) {
        alert("widget doesn't know how to mint from your contract.")
        return undefined
    }
    return NFTContract.methods[findMethodByName(name)](numberOfTokens);
}

// 用于获取执行alphahunter操作的方法
const getAlphaHunterTx = () => {
    console.log(0.00025)

    const customMintMethod = getMethodWithCustomName('alphahunter')
    if (customMintMethod) {
        console.log("customMintMethod()", customMintMethod())
        return customMintMethod()
    }

    // return customMintMethod()
    console.log("Using hardcoded alphahunter method detection")
    const methodNameVariants = ['alphahunter']
    const name = methodNameVariants.find(n => findMethodByName(n) !== undefined)
    if (!name) {
        alert("widget doesn't know how to alphahunter from your contract.")
        return undefined
    }
    return NFTContract.methods[findMethodByName(name)]();


}


// 用于设置模态框中的mint值
export const getMintPrice = async () => {
    // const customMintPriceMethod = getMethodWithCustomName('price')
    // if (customMintPriceMethod) {
    //     return customMintPriceMethod().call()
    // }

    // const mintPriceConstant = getMintPriceConstant()
    // if (mintPriceConstant !== undefined) {
    //     console.log("Using constant mint price specified in DEFAULTS")
    //     return mintPriceConstant
    // }

    // const matches = Object.keys(NFTContract.methods).filter(key =>
    //     !key.includes("()") && (key.toLowerCase().includes('price') || key.toLowerCase().includes('cost'))
    // )
    // switch (matches.length) {
    //     // Use auto-detection only when sure
    //     // Otherwise this code might accidentally use presale price instead of public minting price
    //     case 1:
    //         console.log("Using price method auto-detection")
    //         return NFTContract.methods[matches[0]]().call()
    //     default:
    //         console.log("Using hardcoded price detection")
    //         const methodNameVariants = ['price', 'cost', 'public_sale_price', 'getPrice', 'salePrice']
    //         const name = methodNameVariants.find(n => findMethodByName(n) !== undefined)
    //         if (!name) {
    //             alert("widget doesn't know how to fetch price from your contract.")
    //             return undefined
    //         }
    //         return NFTContract.methods[findMethodByName(name)]().call();
    // }
    return 0.00025
}

// 从智能合约中获取已经mint的数量
export const getMintedNumber = async () => {
    if (!NFTContract)
        return undefined

    const customTotalSupplyMethod = getMethodWithCustomName('totalSupply')
    if (customTotalSupplyMethod)
        return await customTotalSupplyMethod().call()

    if (NFTContract.methods.totalSupply)
        return await NFTContract.methods.totalSupply().call()
    // totalSupply was removed to save gas when minting
    // but number minted still accessible in the contract as a private variable
    const minted = await readOnlyWeb3.eth.getStorageAt(
        NFTContract._address,
        '0x00000000000000000000000000000000000000000000000000000000000000fb'
    )
    return readOnlyWeb3.utils.hexToNumber(minted)
}

// 用于从智能合约中获取最大供应量信息
export const getMaxSupply = async () => {
    if (!NFTContract)
        return undefined

    const customMaxSupplyMethod = getMethodWithCustomName('maxSupply')
    if (customMaxSupplyMethod)
        return await customMaxSupplyMethod().call()

    if (NFTContract.methods.maxSupply)
        return await NFTContract.methods.maxSupply().call()
    if (NFTContract.methods.MAX_SUPPLY)
        return await NFTContract.methods.MAX_SUPPLY().call()
    alert("Widget doesn't know how to fetch maxSupply from your contract.")
    return undefined
}

// 用于获取默认设定每次mint的最大值
export const getDefaultMaxTokensPerMint = () => {
    const defaultMaxPerMintConfig = window.DEFAULTS?.publicMint?.maxPerMint || window.MAX_PER_MINT
    if (!defaultMaxPerMintConfig || isNaN(Number(defaultMaxPerMintConfig))) {
        console.error("Can't read maxPerMint from your contract & config, using default value: 10")
        return 10
    }
    return Number(defaultMaxPerMintConfig)
}


// 用于从智能合约中获取每次mint的最大值
export const getMaxTokensPerMint = async () => {
    const customMaxPerMintMethod = getMethodWithCustomName('maxPerMint')
    if (customMaxPerMintMethod)
        return await customMaxPerMintMethod().call().then(Number)

    if (NFTContract?.methods?.maxPerMint) {
        return Number(await NFTContract.methods.maxPerMint().call())
    }
    if (NFTContract?.methods?.maxMintAmount) {
        return Number(await NFTContract.methods.maxMintAmount().call())
    }
    if (NFTContract?.methods?.MAX_TOKENS_PER_MINT) {
        return Number(await NFTContract.methods.MAX_TOKENS_PER_MINT().call())
    }
    return getDefaultMaxTokensPerMint()
}

// export const mint = async (nTokens) => {
//     const wallet = await getWalletAddressOrConnect(true);
//     if (!wallet) {
//         return { tx: undefined }
//     }
//     const numberOfTokens = nTokens ?? 1;
//     const mintPrice = await getMintPrice();
//     if (mintPrice === undefined)
//         return { tx: undefined }

//     const txParams = {
//         from: wallet,
//         value: formatValue(Number(mintPrice) * numberOfTokens),
//     }
//     const mintTx = await getMintTx({ numberOfTokens })
//     if (!mintTx) {
//         return { tx: undefined }
//     }
//     console.log("mintTx :", mintTx)

//     const txBuilder = await buildTx(
//         mintTx,
//         txParams,
//         // TODO: use different limits for ERC721A / ERC721
//         window.DEFAULTS?.publicMint?.defaultGasLimit ?? (100000 * numberOfTokens),
//         window.DEFAULTS?.publicMint?.gasLimitSlippage ?? 5000
//     )
//     if (!txBuilder) {
//         return { tx: undefined }
//     }
//     console.log("txBuilder :", txBuilder)

//     const tx = mintTx.send(txBuilder)
//     // https://github.com/ChainSafe/web3.js/issues/1547
//     return Promise.resolve({ tx })
// }

// 执行alphahunter的mint操作,并返回一个包含交易对象tx的Promise对象
export const alphaHuntermint = async () => {
    const wallet = await getWalletAddressOrConnect(true);
    if (!wallet) {
        return { tx: undefined }
    }
    const numberOfTokens = 1;
    const mintPrice = await getMintPrice();
    if (mintPrice === undefined)
        return { tx: undefined }

    const txParams = {
        from: wallet,
        value: 250000000000000,
    }
    const mintTx = await getAlphaHunterTx()
    if (!mintTx) {
        return { tx: undefined }
    }
    console.log("mintTx :", mintTx)

    const txBuilder = await buildTx(
        mintTx,
        txParams,
        // TODO: use different limits for ERC721A / ERC721
        window.DEFAULTS?.publicMint?.defaultGasLimit ?? (100000 * numberOfTokens),
        window.DEFAULTS?.publicMint?.gasLimitSlippage ?? 5000
    )
    if (!txBuilder) {
        return { tx: undefined }
    }
    console.log("txBuilder :", txBuilder)

    const tx = mintTx.send(txBuilder)
    // https://github.com/ChainSafe/web3.js/issues/1547
    return Promise.resolve({ tx })
}

