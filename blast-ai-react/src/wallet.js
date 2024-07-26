import Web3 from "web3";
import Web3Modal, { injected } from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

import { NETWORKS } from "./constants.js";
import { isMobile, objectMap } from "./utils.js";
import { setContracts } from "./contract.js";
import { updateMintedCounter } from './mint/ui';


export let [web3, provider] = [];

export const isWeb3Initialized = () => {
    return web3 && provider;
}

// 用于管理和提供不同的 Web3 钱包集成选项，包括 WalletConnect、Coinbase Wallet 和 MetaMask
const getWeb3ModalProviderOptions = ({
    forceConnect,
    isMobileOnlyInjectedProvider,
    isDesktopNoInjectedProvider
}) => {
    const walletConnectOptions = {
        rpc: objectMap(NETWORKS, (value) => (value.rpcURL)),
        qrcodeModalOptions: {
            mobileLinks: [
                "rainbow",
                "zerion",
                "trust",
                "ledger",
                "gnosis"
            ],
            desktopLinks: [
                "rainbow",
                "zerion",
                "trust",
                "ledger",
                "gnosis"
            ]
        }
    }

    const basicProviderOptions = {
        walletconnect: {
            display: {
                description: "Connect Rainbow, Trust, Ledger, Gnosis, or scan QR code"
            },
            package: WalletConnectProvider,
            options: walletConnectOptions
        },
        coinbasewallet: {
            package: CoinbaseWalletSDK, // Required
            options: {
                appName: "Everybody", // Required
                rpc: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161", // Optional if `infuraId` is provided; otherwise it's required
                chainId: 1, // Optional. It defaults to 1 if not provided
                darkMode: false // Optional. Use dark theme, defaults to false
            }
        }
    }
    const metamaskProvider = {
        // Use custom Metamask provider because of conflicts with Coinbase injected provider
        "custom-metamask": {
            display: {
                logo: injected.METAMASK.logo,
                name: "MetaMask",
                description: "Connect to your MetaMask wallet"
            },
            package: {},
            options: {},
            connector: async (ProviderPackage, options) => {
                const mobileNotInjectedProvider = isMobile() && !window.ethereum
                // If mobile user doesn't have injected web3
                // Open the website in the Metamask mobile app via deep link
                if (mobileNotInjectedProvider && forceConnect) {
                    const link = window.location.href
                        .replace("https://", "")
                    // TODO: add "www." ?
                    // .replace("www.", "");
                    window.open(`https://metamask.app.link/dapp/${link}`);
                    return undefined
                }

                let provider
                if (window?.ethereum?.providers?.length > 1) {
                    provider = window?.ethereum?.providers?.filter(p => p.isMetaMask)?.at(0)
                    console.log("Found multiple injected web3 providers, using Metamask")
                } else {
                    provider = window?.ethereum
                }
                await provider?.request({ method: 'eth_requestAccounts' });
                return provider
            }
        },
    }
    // Used on desktop browsers without injected web3
    // Actually opens WalletConnect
    // TODO: start using this if MetaMask app stops crashes
    // TODO: experiment with MM + custom Infura for WalletConnect
    const fakeMetamaskProvider = {
        "custom-fake-metamask": {
            display: {
                logo: injected.METAMASK.logo,
                name: "MetaMask",
                description: "Connect MetaMask mobile wallet via QR code"
            },
            package: WalletConnectProvider,
            options: {
                rpc: objectMap(NETWORKS, (value) => (value.rpcURL)),
                qrcodeModalOptions: {
                    desktopLinks: ["metamask"]
                },
            },
            connector: async (ProviderPackage, options) => {
                const provider = new ProviderPackage(options);

                await provider.enable();

                return provider;
            }
        }
    }

    // Don't show separate Metamask option on Safari, Opera, Firefox desktop
    const allProviderOptions = isDesktopNoInjectedProvider ? basicProviderOptions : {
        ...metamaskProvider,
        ...basicProviderOptions
    }

    // Use only injected provider if it's the only wallet available
    // Built for mobile in-app browser wallets like Metamask, Coinbase
    return !isMobileOnlyInjectedProvider ? allProviderOptions : {}
}

const initWeb3Modal = (forceConnect, isMobileOnlyInjectedProvider) => {
    const isDesktopNoInjectedProvider = !isMobile() && !window.ethereum

    const web3Modal = new Web3Modal({
        cacheProvider: false,
        // Use custom Metamask provider because of conflicts with Coinbase injected provider
        // On mobile apps with injected web3, use ONLY injected providers
        disableInjectedProvider: !isMobileOnlyInjectedProvider,
        providerOptions: getWeb3ModalProviderOptions({
            forceConnect,
            isMobileOnlyInjectedProvider,
            isDesktopNoInjectedProvider
        })
    });

    return web3Modal
}
// 初始化 Web3 连接
const initWeb3 = async (forceConnect = false) => {
    if (isWeb3Initialized()) return

    const isMobileOnlyInjectedProvider = isMobile() && window.ethereum
    const web3Modal = initWeb3Modal(forceConnect, isMobileOnlyInjectedProvider)

    if (web3Modal.cachedProvider || forceConnect) {
        if (web3Modal.cachedProvider === "walletconnect") {
            web3Modal.clearCachedProvider()
        }
        // this is for fixing a previous bug
        if (isMobileOnlyInjectedProvider && web3Modal.cachedProvider !== "injected") {
            web3Modal.clearCachedProvider()
        }
        provider = await web3Modal.connect();
        console.log("initWeb3+provider11111:" + provider)
        if (provider) {
            let providerID
            if (provider.isMetaMask)
                providerID = isMobileOnlyInjectedProvider ? "injected" : "custom-metamask"
            if (provider.isCoinbaseWallet)
                providerID = isMobileOnlyInjectedProvider ? "injected" : "coinbasewallet"

            if (providerID)
                web3Modal.setCachedProvider(providerID)
        }
        provider.on("accountsChanged", async (accounts) => {
            if (accounts.length === 0) {
                if (provider.close) {
                    await provider.close();
                }
                web3Modal.clearCachedProvider();
            }
        });
    }
    web3 = provider ? new Web3(provider) : undefined;
}


// 判断钱包是否连接
export const isWalletConnected = async () => {
    console.log("11" + "isWalletConnected")
    if (!isWeb3Initialized()) {
        return false
    }
    const accounts = await web3.eth.getAccounts();
    console.log("22" + "isWalletConnected" + accounts)
    return accounts?.length > 0;
}
// 获取现在连接的钱包地址并判断是否需要切换网络
export const getWalletAddressOrConnect = async (shouldSwitchNetwork, refresh) => {
    const currentAddress = async () => {
        console.log("11" + "wallet")
        if (!isWeb3Initialized()) {
            console.log("22" + "wallet")
            return undefined;

        }
        try {
            console.log("33" + "wallet")
            return (await provider?.request({ method: 'eth_requestAccounts' }))[0];
        } catch {
            console.log("44" + "wallet")
            await provider.enable();
            console.log("55" + "wallet")
            return (await web3.eth.getAccounts())[0];
        }
    }
    if (!isWeb3Initialized()) {
        console.log("66" + "wallet")
        await connectWallet();
        console.log("77" + "wallet")
        if (refresh) {
            console.log("88" + "wallet")
            window.location.reload();
            console.log("99" + "wallet")
        }
    }
    // For multi-chain dapps (multi-chain contracts on the same page)
    if (shouldSwitchNetwork ?? true) {
        console.log("1010" + "wallet")
        await setContracts(shouldSwitchNetwork ?? true);
        console.log("1111" + "wallet")
    }
    console.log("1212" + "wallet")
    return await currentAddress();
}

// 获取现在连接网络
export const getCurrentNetwork = async () => {
    return Number(await provider?.request({ method: 'net_version' }));
}


// 切换网络
export const switchNetwork = async (chainID) => {
    if (!provider) {
        return
    }
    if (chainID === await getCurrentNetwork()) {
        console.log("Don't need to change network")
        return
    }
    const chainIDHex = `0x${chainID.toString(16)}`;
    try {
        await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainIDHex }],
        });
    } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if (error.code === 4902) {
            try {
                await provider.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: chainIDHex,
                            nativeCurrency: NETWORKS[chainID].currency,
                            chainName: NETWORKS[chainID].name,
                            rpcUrls: [NETWORKS[chainID].rpcURL],
                            blockExplorerUrls: [NETWORKS[chainID].blockExplorerURL]
                        },
                    ],

                });
            } catch (addError) {
                console.error(addError);
            }
        }
        console.error(error);
    }
}
// 初始化 Web3 过程中捕获并处理可能出现的非用户取消类的异常，确保用户可以看到有用的错误信息，同时避免因用户操作取消而弹出不必要的错误提示
const tryInitWeb3 = async (forceConnect) => {
    try {
        await initWeb3(forceConnect);
    } catch (e) {
        const message = e?.message ?? e
        const cancelMessageVariants = [
            "Modal closed by user",
            "User rejected the request",
            "User closed modal",
            "accounts received is empty"
        ]
        if (!cancelMessageVariants.find(s => message.includes(s))) {
            alert(`Error in initWeb3(${forceConnect}): ${message?.toString()}`)
            console.error(e)
        }
        return
    }
}

// 连接钱包函数
export const connectWallet = async () => {
    console.log("Connecting Wallet")
    await tryInitWeb3(true)
    await updateWalletStatus()
    console.log("Connected Wallet")
}
// 获取id为connect的按钮
const getConnectButton = () => {
    const btnID = window.buttonID ?? '#connect';
    return document.querySelector(btnID)
        ?? document.querySelector(`a[href='${btnID}']`);
}

// 更新"connect"按钮的文本状态
export const updateWalletStatus = async () => {
    const connected = await isWalletConnected();
    const button = getConnectButton();
    if (button && connected) {
        button.textContent = window?.DEFAULTS?.labels?.walletConnected ?? "Wallet connected";
    }
}

// 用户点击一下就会更新按钮的显示状态
export const updateConnectButton = () => {
    const walletBtn = getConnectButton();
    walletBtn?.addEventListener('click', async () => {
        await connectWallet()
        if (window.CONTRACT_ADDRESS && !window?.DISABLE_MINT) {
            await setContracts(true)
            await updateMintedCounter()
        }
    });
}