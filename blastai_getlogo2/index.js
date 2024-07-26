const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; // 默认使用3000端口，你也可以根据需要修改
app.use(cors());
app.use(bodyParser.json());
//定义ap-key列表，可以持续添加，每个账号每个月可以调用10000次，从coinmarketcap.com中获取免费api-key
const API_KEYS = [
    '855bac07-653d-4ead-8ef2-200d2da01d93',
    '0a32bbc8-6eb3-44cd-8f6d-cc42a073cbc1'

];
let currentApiKeyIndex = 0;

const API_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/map';

//查询token在coinmarketcap.com中对应的特定id
async function fetchTokenId(symbol) {
    const apiKey = API_KEYS[currentApiKeyIndex];
    const headers = {
        'Accepts': 'application/json',
        'X-CMC_PRO_API_KEY': apiKey,
    };

    try {
        const response = await axios.get(API_URL, { headers, params: { symbol } });
        const data = response.data;
        if (data.status.error_code === 0 && data.data.length > 0) {
            return data.data[0].id;
        } else {
            throw new Error('Symbol not found');
        }
    } catch (error) {
        console.error('Error fetching data from CoinMarketCap:', error);
        // 如果是API key相关的错误，尝试下一个API key
        if (error.response && error.response.status === 429) { // 429表示API rate limit exceeded
            currentApiKeyIndex = (currentApiKeyIndex + 1) % API_KEYS.length;
        }
        throw error;
    }
}
//将token对应的id与特定url拼接，获取到token对应的logo图表的url
app.get('/get_id/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    if (!symbol) {
        return res.status(400).json({ error: "Missing 'symbol' parameter" });
    }

    try {
        const id = await fetchTokenId(symbol);
        const logo = `https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png`
        return res.status(200).json({ logo });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
