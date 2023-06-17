//封装请求方法
function httpRequest(_url, _method, token, _data, callback) {
	uni.request({
		url: _url,
		method: _method,
		header: {
			Authorization: token,
		},
		data: _data,
		success: (res) => {
			const _res = res;
			//通过回调，保存响应数据
			callback(_res);
		}
	});
}
//时间转换
function formatCommentTime(originTime) {
	//通过map函数筛选出评论时间
	let create_times = originTime.map(function(row) {
		return row.create_time;
	});
	//将筛选的时间进行转换
	let displayTimes = create_times.map(function(time){		
		let localTimestamp = Date.parse(new Date(time)); // 将原始时间字符串转换为本地时间的时间戳
		//与接口数据相差了8小时,减去8小时
		let currentTimestamp = Date.now() - 8 * 60 * 60 * 1000; // 当前时间减去8小时的时间戳
		let difference = currentTimestamp - localTimestamp; // 得到发布时间与当前本地时间的时间戳差异
		let days = Math.floor(difference / (1000 * 60 * 60 * 24)); //转换成天数
		let hours = Math.floor(difference / (1000 * 60 * 60)); //转换成小时
		let minutes = Math.floor(difference / (1000 * 60)); //转换成分钟
		//如果转换的时间天数大于7天则返回原时间
		if (days > 7) {
			return time;
			//如果转换的时间天数大于0天则返回为天数
		} else if (days > 0) {
			return days + "天前";
			//如果转换的时间天数大于0小时则返回为小时
		} else if (hours > 0) {
			return hours + "小时前";
			//都不符合则返回为分钟
		} else {
			return minutes + "分钟前";
		}
	});
	//返回时间
	return displayTimes;
}

//去注册
function goLogin(){
	uni.redirectTo({
		url:'/pages/logonLoginPage/Login',
	});
}
//跳转至详细页
//newsType新闻类型,newsId新闻id
function goDetailedPage(newsType,newsId){
	console.log(newsType,newsId);
	uni.navigateTo({
		url:`/pages/detailedPage/detailedPage?news_type=${newsType}&news_id=${newsId}`,
		animationType: 'slide-in-right',
		animationDuration: 200
	});
}

//导出
module.exports = {
	httpRequest,formatCommentTime,goDetailedPage,goLogin
}