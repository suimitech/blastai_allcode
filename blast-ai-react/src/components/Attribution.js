import { Box, Link, } from '@mui/material';
import { getBaseURL } from '../constants';
import { useEffect, useState } from 'react';
import { NFTContract } from '../contract';
import { useEmbed } from "../hooks/useEmbed";

export const Attribution = (props) => {
    const [attributionText, setAttributionText] = useState("Confirm to pay 0.00025 ETH for alphahunter")
    const [isBuildshipUser, setIsBuildshipUser] = useState(false)
    const embed = useEmbed()

    const updateAttribution = async () => {
        try {
            if (Object.keys(NFTContract.methods).includes("DEVELOPER")) {
                const developer = await NFTContract.methods.DEVELOPER().call()
                console.log(developer)
                if (developer.toLowerCase().includes("buildship")) {
                    setAttributionText(_ => "Launched with Buildship")
                    setIsBuildshipUser(true)
                }
            }
        }
        catch (e) {
            console.log("Couldn't read contract developer")
            console.log(e)
        }
    }

    useEffect(() => {
        updateAttribution()
    }, [])

    useEffect(() => {
        if (embed?.watermark_enabled === false) {
            document.querySelector(".attribution-link").style.display = "none"
        }
    }, [embed])

    if (embed?.watermark_enabled === false) {
        return <></>
    }

    return <Box sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column"
    }}>
        <Box
            sx={{
                mt: 4,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                ...props?.sx
            }}>
            {/* for SEO */}
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 24,
                height: 24,
                borderRadius: 24,
            }}>
            </div>
            <Box sx={{
                marginLeft: "2px",
                fontSize: 14,
                fontWeight: 400,
                color: (theme) => theme.palette.grey[500],
            }}>
                {attributionText}
            </Box>
        </Box>
    </Box>
}
