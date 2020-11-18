const path = require('path')
const fileUtils = require('../utils/file_utils')
// 引入ws包
const WebSocket = require('ws')
// 创建 WebSocket 服务端的对象,绑定端口号为9998
const wss = new WebSocket.Server({
    port: 9998
})

// 服务端开启了监听
module.exports.listen = () => {
    // 对客户端的连接事件进行监听
    // client:代表客户端的连接socket对象
    wss.on('connection', client => {
        console.log('有客户端连接成功了');
        // 对客户端的连接对象进行message事件的监听
        // msg: 由客户端发给服务端的数据
        client.on('message', async msg => {
            let paylod = JSON.parse(msg)
            const action = paylod.action
            if (action === 'getData') {
                //  paylod.chartName的值为 hot map rank seller stock trend 
                let filePath = '../data/' + paylod.chartName + '.json'
                filePath = path.join(__dirname, filePath)
                const res = await fileUtils.getFileJsonData(filePath)
                // 在服务端获取到数据的基础上,增加一个data的字段,对应的值就是json内容
                paylod.data = res
                // 由服务端往客户端发送数据
                client.send(JSON.stringify(paylod))
            } else {
                // 如果没有收到action则将接受到的数据原封不动的转发给每一个处于连接状态的客户端
                // wss.clients 所有客户端的连接 是一个数组
                wss.clients.forEach(client => {
                    client.send(msg)
                })
            }
        })
    })
}