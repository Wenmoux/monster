const baseURI = "https://od.zsqc68.com/index/api/"
const axios = require("axios")
const odStr = process.env.odStr
const notify = require('./sendNotify');

function get(api, data) {
    return new Promise(async (resolve) => {
        try {
            let res = await axios.post(`${baseURI}${api}`, data)
            console.log(res.data)
            resolve(res.data)
        } catch (err) {
            console.log(err)
        }
        resolve();
    });
}

async function od() {
    if (odStr) {
        userid = odStr.split("@")
        console.log(`共${userid.length}个OD账号`)
        for (i = 0; i < userid.length; i++) {
            user_id = userid[i]
            console.log(`--------开始OD账号${i+1}--------\n`)
            let adres = await get("getAdvertisingInfo", {
                user_id
            })
            let aid = adres.data.advertisement_id
            if (adres.is_watch == 1) {
                console.log(`去观看广告 ${aid}  ${adres.data.ftitle}`)
                await get("addAdvertisement", {
                    user_id,
                    "advertisement_id": aid
                })
                infores = await get("getUserInfo", {
                    user_id
                })
                console.log(`今日已观看${aid-1}次广告`)
                info = `可用梦想豆：${infores.data.bean}\n冻结梦想豆：${infores.data.frozen_bean}`
                console.log(info)
                if(aid == 5) await notify.sendNotify("OD", `${info}\n\n吹水群：https://t.me/xiubuye`)
            } else {
                infores = await get("getUserInfo", {
                    user_id
                })
                console.log(`今日已观看${aid-1}次广告`)
            }
        }
    } else {
        console.log("请填写环境变量")
    }
}

od()