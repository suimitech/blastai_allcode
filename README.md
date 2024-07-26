# blastai_allcode
blastai中的所有嵌入代码:
说明：
（1）alphahunter.html文件：
blastai的alphahunter页嵌入代码
位置：Code Embed 2
功能：1、获取最新爬取的top 10 narratives数据 并显示在网页上；
      2、从history页面跳转到alphahunter页时  获取指定时间点的top 10 narratives数据并显示在网页上
      3、当页面信息加载不出来时，修改内网穿url： Alphahunter页中的：Code Embed2中的fetchlatestdata()中的内网穿透url和fetchDataByTimestamps(timestamp1, timestamp2)中的内网穿透url

-----------------------------------------------------------------------------
（2）top-10-tokens.html文件：
blastai的top 10 tokens页中的嵌入代码
位置：blastai的top 10 tokens页中的Code Embed
作用：1、获取最新爬取的top 10 tokens数据 并显示在网页上；
      2、从history页面跳转到alphahunter页时  获取指定时间点的top 10 tokens数据并显示在网页上
      3、当页面信息加载不出来时，修改内网穿url：Code Emded中的fetchDataByTimestamps(timestamp1, timestamp2)中的内网穿透url和updateCryptoInfo()中的内网穿透url

------------------------------------------------------------------------------
（3）history-nav.html
blastai的history page页中的嵌入代码
位置：hitory_nav页中的Code Embed 4
作用：1、实现查询指定时间范围内的json文件信息
      2、更换内网穿透url:Code Embed4中的fetchPeriodNarratives(timestamp1, timestamp2)函数中的内网穿透url

------------------------------------------------------------------------------
（4）market_v10.html
blastai中的market页中的嵌入代码
位置：Markets页中的Code Embed
作用：market表格的数据的实时更新、页面右侧轮播图和kol的显示
websocket相关：
         1、如果market页面不实时更新了，可能就是因为crytocompare.com中的api使用次数超过限制了，需要更换Markets页面中的Code Embed中的 initializeWebSocket()函数中的api_key
         2、如果market页面加载之后没有内容，需要更换fetchInitialData()函数和updateData()函数 中的api_key
         3、api_key从crytocompare.com获取<免费的>
         
------------------------------------------------------------------------------
（5）kol-flow.html
blastai的kol-flow页面的嵌入代码
位置：kol-flow页中的Div Block 444下面的Code Embed
作用：显示最新爬取的推特推文列表

------------------------------------------------------------------------------
(6)blastai_getlogo2文件夹
调用api查询token对应的logo图标的服务器端代码
位置：top 10 tokens页中的嵌入代码中
作用：blastai中获取各种tokens的图标 先查询token在coinmarketcap.com中对应的特定id  再根据id拼凑对应的url
使用：直接将文件夹部署到zeabur.com中并设置一个Networking中的Domain,现在已经部署上了,例如可以通过https://blastai-getlogo2.zeabur.app/get_id/eth查询eth对应的logo的url

------------------------------------------------------------------------------
（6）blastai-getinfo文件夹
调用api查询token对应的price,  volume_24h, market_cap,  fully_diluted_market_cap信息的服务器端代码
位置：top 10 tokens页中的嵌入代码
作用：blastai网页中的top 10 tokens页中的得到排行前十的  price,  volume_24h, market_cap,  fully_diluted_market_cap
使用：直接将文件夹部署到zeabur.com中并设置一个Networking中的Domain,现在已经部署上了，例如可以通过https://blast-getinfo.zeabur.app/getinfo/eth来查询eth对应的信息

-------------------------------------------------------------------------------
（7）blastaiTXservice文件夹
查询数据库中最新100条或者10条数据的服务器端代码
位置：market页中的嵌入代码中右下角kol部分、kol-flow中的嵌入代码部分
作用：获取最新100推文信息：http://localhost:80/gettweets100?endId=
     获取最新10条推文信息：http://localhost:80/gettweets10?endId=
使用：直接部署到zeabur.com中

--------------------------------------------------------------------------------
(8)footer-slider.html
市值排名前20个token向左无限滚动条
位置：blastai项目中alphahunter、top-10-tokens、merkets、kol-flow页中，页面最下方
作用：实时显示20个token的价格变动,如果有变动就会给price添加一个背景颜色变化

(9)blast-ai-react文件夹
链接小狐狸钱包的react项目代码
位置：alphahunter中的Home页中的嵌入代码
使用：部署到vercel之后，在webflow的home页中嵌入
      <script src="https://blast-ai-react.vercel.app/static/js/main.js"></script>
      <link href="https://blast-ai-react.vercel.app/css/main.css" rel="stylesheet">

--------------------------------------------------------------------------------
本项目所有代码的源代码已经上传到https://github.com/suimitech/blastai_allcode中了，项目服务器端代码部署到zeabur.com中了，zeabur.com是通过github账号登录的：
github账号：dayuya_zy@163.com
      密码：Zy1527815910.





 

