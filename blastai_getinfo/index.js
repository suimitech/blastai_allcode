const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 80;

app.use(cors());
app.use(bodyParser.json());

// Array of API keys to cycle through
const apiKeys = [
    "cf13a74d-7b82-497d-9e12-9baa595df6db",
    "5df702f1-1708-44ee-bb79-9a470646f80b"
];

// Index to track which API key to use next
let currentApiKeyIndex = 0;

app.get('/getinfo/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    try {
        const cryptoInfo = await getCryptoInfo(symbol);
        res.json(cryptoInfo);
    } catch (error) {
        res.status(500).json({ error: "发生错误：" + error.message });
    }
});

async function getCryptoInfo(symbol) {
    const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest";
    const apiKey = apiKeys[currentApiKeyIndex]; // Get current API key
    const params = {
        symbol: symbol.toUpperCase()
    };
    const headers = {
        "X-CMC_PRO_API_KEY": apiKey,
        "Accept": "application/json"
    };

    try {
        const response = await axios.get(url, { params, headers });
        const data = response.data;
        if ('data' in data && symbol.toUpperCase() in data['data']) {
            const cryptoData = data['data'][symbol.toUpperCase()]['quote']['USD'];
            const { price, volume_24h, market_cap, fully_diluted_market_cap } = cryptoData;
            return {
                price,
                volume_24h,
                market_cap,
                fully_diluted_market_cap
            };
        } else {
            return { error: "暂无此加密货币的信息" };
        }
    } catch (error) {
        // If API limit reached, switch to next API key
        if (error.response && error.response.status === 429) {
            switchToNextApiKey();
            return getCryptoInfo(symbol); // Retry with the next API key
        } else {
            throw new Error("发生错误：" + error.message);
        }
    }
}

function switchToNextApiKey() {
    currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;
    console.log(`Switched to API Key index ${currentApiKeyIndex}`);
}

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});
