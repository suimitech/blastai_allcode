import React, { useImperativeHandle, useState } from "react";
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { QuantityModalStep } from './QuantityModalStep';
import { isMobile } from "../utils";
// 用于显示一个带有关闭按钮的对话框标题
const DialogTitleWithClose = ({ children, onClose }) => {
    return <DialogTitle>
        <Box sx={{ textAlign: "center" }}>
            {children}
        </Box>
        {onClose ? (
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    ml: 4,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>) : null}
    </DialogTitle>
}
// 用于显示一个模态框，用来处理支付和交易确认的逻辑
export const MintModal = (props, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [txHash, setTxHash] = useState(undefined)
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [quantity, setQuantity] = useState(1)

    const handleClose = () => {
        setIsOpen(false);
    }

    useImperativeHandle(ref, () => ({
        setIsOpen, setQuantity
    })
    )

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}>
            {isLoading &&
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: 300,
                    height: 300,
                }}>
                    {txHash ? <CircularProgress /> : <span style={{
                        fontSize: 60,
                        lineHeight: 1,
                        margin: 0
                    }}>
                        👀
                    </span>}
                    <Typography
                        sx={{ mt: 3, textAlign: "center" }}
                        variant="h4">
                        {txHash
                            ? `Alpha Huntering ...`
                            : 'Confirm the transaction in your wallet'}
                    </Typography>
                    {!txHash && <Typography sx={{
                        mt: 3,
                        pl: 3,
                        pr: 3,
                        color: "#757575",
                        textAlign: "center"
                    }} variant="subtitle2">
                        Wait up to 2-3 sec until the transaction appears in your wallet
                        <br /><br />
                        {!isMobile() && "If you don't see the Confirm button, scroll down ⬇️"}</Typography>}
                </Box>
            }
            {!isLoading && <>
                <DialogTitleWithClose onClose={handleClose}>
                    <Typography variant="h1">Confirm to pay 0.00025 ETH for alphahunter</Typography>
                </DialogTitleWithClose>
                <DialogContent className="mintModal-content">
                    {step === 1 && <QuantityModalStep
                        setTxHash={setTxHash}
                        setQuantity={setQuantity}
                        setStep={setStep}

                        setIsLoading={setIsLoading}

                        setIsOpen={setIsOpen} // 将 setIsOpen 传递给 QuantityModalStep
                    />}
                </DialogContent>
            </>}
        </Dialog>
    )
}

export const modalRef = React.createRef();


// 用于在页面中显示铸造模态框。根据传入的 quantity 参数，更新模态框内部的状态，然后设置 isOpen 为true，显示模态框。
export const showMintModal = (quantity) => {
    if (quantity) {
        modalRef.current?.setQuantity(quantity)
    }
    modalRef.current?.setIsOpen(true);
}

const styles = {
    mintOption: {
        padding: "16px",
        marginLeft: "12px",
        marginRight: "12px",
        textAlign: "center",

        ":hover": {
            cursor: "pointer",
            backgroundColor: "rgba(0, 0, 0, 0.04)",
            borderRadius: "16px"
        }
    },
}

export default React.forwardRef(MintModal);
