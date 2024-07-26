import React, { useEffect, useState } from 'react';
import { Box, Button, Skeleton, Slider } from '@mui/material';
import {
    getMaxSupply,
    getMaxTokensPerMint,
    getMintedNumber,
    getMintPrice,
    alphaHuntermint,
    mint
} from '../mint/web3';
import { showAlert } from './AutoHideAlert';
import { parseTxError, roundToDecimal } from '../utils';
import { Attribution } from './Attribution';
import { isEthereumContract } from "../contract";
import { getWalletAddressOrConnect } from "../wallet.js";
export const QuantityModalStep = ({ setQuantity, setIsLoading, setTxHash, setStep, setIsOpen }) => {
    const [quantityValue, setQuantityValue] = useState(1)
    const [maxTokens, setMaxTokens] = useState(undefined)
    const [mintPrice, setMintPrice] = useState(undefined)
    const [mintedNumber, setMintedNumber] = useState()
    const [totalNumber, setTotalNumber] = useState()

    useEffect(() => {
        console.log("useEffect" + "1111")
        if (isEthereumContract()) {
            getMintPrice().then(price => {
                if (price !== undefined) {
                    setMintPrice(Number((price) / 1e18))
                }
            })
        }
        console.log("useEffect" + isEthereumContract + "2222")
        getMaxTokensPerMint().then(setMaxTokens)
        console.log(getMaxTokensPerMint + "3333")
        if (!window.DEFAULTS?.hideCounter) {
            getMintedNumber().then(setMintedNumber)
            getMaxSupply().then(setTotalNumber)
        }
        console.log("hideCounter" + "4444")
    }, [])


    const maxRange = maxTokens ?? 10
    const maxTokensTooLarge = maxRange >= 20
    const step = !maxTokensTooLarge ? Math.max(maxRange, 1) : 10
    const marks = [
        ...[...Array(Math.floor(maxRange / step) + 1)].map((_, i) => 1 + i * step),
        ...(maxTokensTooLarge ? [maxRange + 1] : [])
    ].map(m => ({
        value: Math.max(1, m - 1),
        label: (maxTokens !== undefined || m === 1)
            ? (Math.max(1, m - 1)).toString()
            : <Skeleton width="10px" height="30px" sx={{ mt: -2 }} />
    }))

    const onSuccess = async () => {
        setIsLoading(true)
        console.log("onSuccess+alphaHuntermint之前")
        const { tx } = await alphaHuntermint()
        console.log("onSuccess+alphaHuntermint之后")
        if (tx === undefined) {
            setIsLoading(false)
        }
        tx?.on("transactionHash", (hash) => {
            setTxHash(hash)
            console.log(hash + "交易哈希111")
        })?.on("confirmation", async () => {
            setIsLoading(false)
            console.log("showAlert111")
            showAlert(`Successfully alphaHunterminted  ${window.DEFAULTS?.redirectURL ? ". You will be redirected in less than a second" : ""}`, "success")
            console.log("showAlert222")
            // TODO: show success state in the modal
            // if (window.DEFAULTS?.redirectURL) {
            //     setTimeout(() => {
            //         window.location.href = window.DEFAULTS?.redirectURL
            //     }, 800)
            // }
            //更新mint成功状态
            const currentUser = await getWalletAddressOrConnect(true); // 获取当前用户的账户地址
            console.log("getWalletAddressOrConnect777")
            sessionStorage.setItem(currentUser, 'success'); // 将更新后的 mintStatus 存储回 sessionStorage
            console.log(33333333333 + "success")
            handleMintSuccess();
            console.log(444444444444 + "handleMintSuccess")
        })?.on("error", (e) => {
            console.log("error????1")
            setIsLoading(false)
            console.log("error????2")
            const { code, message } = parseTxError(e);
            if (code !== 4001) {
                showAlert(`Minting error: ${message}. Please try again or contact us`, "error");
            }
        })
    }
    const handleMintSuccess = () => {
        setIsLoading(false); // 停止加载状态
        console.log("55555555555555" + setIsLoading)
        setIsOpen(false); // 关闭模态框
        console.log("66666666666666" + setIsOpen)
        window.location.href = 'https://www.blastai.xyz/alphahunter';
        console.log("7777777777777" + "网站")
    }
    return <div style={{ width: "100%" }}>
        {maxRange > 1 && <Box sx={{
            display: "flex",
            alignItems: "flex-end",
            width: "100%",
            height: 64

        }}>

            {/* <Slider

                sx={{ ml: 2 }}
                disabled={maxTokens === undefined}
                aria-label="Quantity"
                defaultValue={1}
                valueLabelDisplay="auto"
                onChange={(e, v) => {
                    setQuantity(v)
                    setQuantityValue(v)
                }}
                step={1}
                marks={marks}
                min={1}
                max={maxRange}
            /> */}
        </Box>}
        <Button
            onClick={onSuccess}
            sx={{ mt: maxRange > 1 ? 4 : 2, width: "100%" }}
            variant="contained"
        >
            {mintPrice !== undefined
                ? (mintPrice !== 0 ? `Alphahunter for ${roundToDecimal(mintPrice * quantityValue, 4)} ETH` : "Alphahunter for free")
                : "Alphahunter"}
        </Button>
        {!window.DEFAULTS?.hideCounter && <Box
            sx={{
                color: (theme) => theme.palette.grey[500],
                display: "flex",
                fontWeight: 400,
                fontSize: 14,
                justifyContent: "center",
                mt: 2
            }}>
            {/* <span>{mintedNumber ?? "-"}</span>
            <span style={{ margin: "0 2px" }}>/</span>
            <span>{totalNumber ?? "-"}</span> */}
        </Box>}
        <Attribution sx={{ mt: 3, justifyContent: "center" }} />
    </div>
}