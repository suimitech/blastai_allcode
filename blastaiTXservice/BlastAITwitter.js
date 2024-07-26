const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 80
const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());
// MongoDB 连接 URI
const uri = 'mongodb+srv://dubai52233:Aaqweqweqwe123@cluster0.5p8on8l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; 
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectDB() {
  try {

    await client.connect();
    console.log('Connected to MongoDB');

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
} 

// 将推文数据插入数据库
app.post('/addtweets', async (req, res) => {
  try {
    console.log("推文写入数据库被调用");
    await connectDB();
    const collection = client.db("Blastai").collection("Blastai");
    console.log("已连接到数据库");

    // 查询最后一个数据的ID
    const lastTweet = await collection.findOne({}, { sort: { _id: -1 } });
    const newId = lastTweet ? lastTweet._id + 1 : 1;
    console.log("已为该推文获取它的专属id");
    const tweet = req.body;
    tweet._id = newId;
    await collection.insertOne(tweet);
    res.status(200).json(tweet);
    console.log("该条推文已经插入成功");
  } catch (error) {
    console.error("插入推文失败:", error);
    res.status(500).send({ message: '插入推文失败', error });
  }
});


// 添加新的API接口获取最近的100条推文
app.get('/gettweets100', async (req, res) => {
  try {
    await connectDB();
    const collection = client.db("Blastai").collection("Blastai");
    console.log("已连接到数据库");

    const endId = parseInt(req.query.endId) || Number.MAX_SAFE_INTEGER;

    // 从数据库中获取endId之前的最近的100条数据
    const tweets = await collection.find({ _id: { $lt: endId } }).sort({ _id: -1 }).limit(100).toArray();

    // 获取当前结尾的ID
    const newEndId = tweets.length > 0 ? tweets[tweets.length - 1]._id : null;

    res.status(200).json({ tweets, endId: newEndId });
    console.log("获取推文数据成功");
  } catch (error) {
    console.error("获取推文数据失败:", error);
    res.status(500).send({ message: '获取推文数据失败', error });
  }
});
app.get('/gettweets10', async (req, res) => {
  try {
    await connectDB();
    const collection = client.db("Blastai").collection("Blastai");
    console.log("已连接到数据库");

    const endId = parseInt(req.query.endId) || Number.MAX_SAFE_INTEGER;

    // 从数据库中获取endId之前的最近的10条数据
    const tweets = await collection.find({ _id: { $lt: endId } }).sort({ _id: -1 }).limit(10).toArray();

    // 获取当前结尾的ID
    const newEndId = tweets.length > 0 ? tweets[tweets.length - 1]._id : null;
    console.log("获取推文数据成功");
    res.status(200).json({ tweets, endId: newEndId });
  } catch (error) {
    console.error("获取推文数据失败:", error);
    res.status(500).send({ message: '获取推文数据失败', error });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});