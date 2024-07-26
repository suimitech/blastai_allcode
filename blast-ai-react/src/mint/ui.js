import { getMaxSupply, getMintedNumber, getAlphaHunterTx } from "./web3.js";
import { showMintModal } from "../components/MintModal";
import { getWalletAddressOrConnect } from "../wallet.js";
export const updateMintButton = () => {
    const mintButtons = [
        ...document.querySelectorAll('#mint-button'),
        ...document.querySelectorAll("a[href*='#mint-button']")
    ]

    if (mintButtons) {
        console.log(mintButtons)
        mintButtons.forEach((mintButton) => {

            mintButton.onclick = async () => {
                const initialBtnText = mintButton.textContent;
                setButtonText(mintButton, "Loading...")


                try {

                    const currentUser = await getWalletAddressOrConnect(true); // 获取当前用户的账户地址
                    const mintStatus = sessionStorage.getItem(currentUser); // 获取当前用户的 mintStatus
                    const quantity = getMintQuantity();
                    if (mintStatus === 'success') {
                        // 如果 mint 成功状态存在，直接执行页面跳转
                        window.location.href = 'https://www.blastai.xyz/alphahunter';
                    }
                    else
                        showMintModal(quantity);


                } catch (e) {
                    console.log("Error on pressing mint")
                    console.error(e)
                    alert(`Error on getAlphaHunterTx: ${e}`)
                }
                setButtonText(mintButton, initialBtnText)
            }
        })
    }
}

export const updateMintedCounter = async () => {
    const mintedElem = document.querySelector("#minted-counter")
    const totalElem = document.querySelector("#total-counter")
    console.log("COUNTER ELEMS", mintedElem, totalElem)
    if (mintedElem) {
        const minted = await getMintedNumber()
        console.log("MINTED", minted)
        if (minted) {
            mintedElem.textContent = minted
        }
    }
    if (totalElem) {
        const maxSupply = await getMaxSupply()
        console.log("TOTAL", maxSupply)
        if (maxSupply) {
            totalElem.textContent = maxSupply
        }
    }
}

const getMintQuantity = () => {
    const quantity = document.querySelector('#quantity-select')?.value
    return quantity !== '' && quantity !== undefined ? Number(quantity) : undefined;
}

const setButtonText = (btn, text) => {
    if (btn.childElementCount > 0) {
        btn.children[0].textContent = text;
    } else {
        btn.textContent = text;
    }
}
