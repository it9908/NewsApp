<template>
	<scroll-view scroll-y="true" @scrolltolower="loadMoreVideo()" style="height: 100vh;background-color: #ffffff;">
		<view class="video_list" v-for="(item, index) in listVideo" :key="item.news_id">
			<view class="video_title" @click="goDetailed(item.news_id)">
				<text>{{item.title}}</text>
			</view>
			<video class="video" :id="'video'+item.news_id" @play="videoPlay(item.news_id)" :poster="item.pics"
				:src="item.video_url" @error="videoErrorCallback"></video>

			<u-row justify="space-between" style="margin: 10px 0px;">
				<u-col span="6" style="font-size: 0.625rem;">
					<view class="video_time">
						<span>{{item.create_time}}</span>
						<span style="margin-left:4px;">{{item.total_comment}}评论</span>
					</view>
				</u-col>
				<u-col span="6" style="text-align: right;">
					<view class="box-btn">
						<image @click="flagShare = true;" src="/static/images/fenxiang.png"></image>
						<span @click="flagShare = true;">分享</span>
						<image @click="collectVideo(item.news_id)"
							:src="item.is_store ? '/static/images/zysc1.png' : '/static/images/zysc2.png'"></image>
						<span @click="collectVideo(item.news_id)">{{item.is_store ? '已收藏' : '收藏'}}</span>
					</view>
				</u-col>
			</u-row>
		</view>
		<!-- 收藏成功提示 -->

		<!-- 分享组件 -->
		<u-popup :show="flagShare">
			<Share @flag-share="closePopup"></Share>
		</u-popup>

		<u-toast ref="uToast"></u-toast>

		<u-modal width="260px" :show="showUmodal" :title="title" :content="content" :confirmText="confirmText"
			:cancelText="cancelText" @confirm="goLoginPage()" @cancel="showUmodal = false" showCancelButton>
		</u-modal>

	</scroll-view>
</template>

<script>
	import Share from '@/components/share.vue'

	import {
		httpRequest,
		goDetailedPage
	} from '@/utils/request.js'
	export default {
		components: {
			Share,
		},
		data() {
			return {
				list4: [{
					url: 'https://cdn.uviewui.com/uview/resources/video.mp4',
				}],

				errorTips: [{
						type: 'success',
						message: "取消收藏成功",
						iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/success.png',
						duration: 700
					},
					{
						type: 'success',
						message: "收藏成功",
						iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/success.png',
						duration: 700
					}
				],


				showUmodal: false,
				title: "登录提示",
				content: "您还未登录请登录后再来收藏吧~~",
				confirmText: "去登录",
				cancelText: '取消',

				feedbackCollect: '',
				feedbackImg: '', //反馈图片
				flagCollect: false,
				type: 2,
				page: 1, //页数
				size: 5, //条数
				listVideo: [], //视频列表
				token: '',
				flagShare: false, //分享弹窗状态
			};
		},
		onLoad() {
			this.token = uni.getStorageSync('token');
		},
		onShow() {
			this.getlistVideo();
		},
		methods: {

			videoPlay(id) {
				var currentId = 'video' + id;
				var videoContent = uni.createVideoContext(currentId, this);
				videoContent.play();

				// 获取视频列表
				let trailer = this.list;
				trailer.forEach((item, index) => { // 获取json对象并遍历
					let tempId = 'video' + item.news_id;
					if (tempId != currentId) {
						// 暂停其余视频
						let video = uni.createVideoContext(tempId, this);
						video.pause(); //暂停视频播放事件
					}
				});
			},

			goDetailed(newsId) {
				goDetailedPage(this.type, newsId);
			},
			//取消收藏
			cancelFavorite(_newsId) {
				const url = `http://172.16.222.16:91/api/news/storeAction`;
				httpRequest(url, "POST", this.token, {
					news_id: _newsId,
					action: 2
				}, (_res) => {
					this.$refs.uToast.show(this.errorTips[0]);
					//0.8s后关闭
					setTimeout(() => {
						this.flagCollect = false;
					}, 800);
					this.getlistVideo();
				})
			},
			//收藏视频
			collectVideo(newsId) {
				if (this.token === '' || this.token === null || this.token === undefined) {
					this.showUmodal = true;
				}
				const url = `http://172.16.222.16:91/api/news/storeAction`;
				httpRequest(url, "POST", this.token, {
					news_id: newsId,
					action: 1
				}, (_res) => {
					if (_res.data.code === 200) {
						this.$refs.uToast.show(this.errorTips[1]);
						this.getlistVideo();
						//如果是已收藏那么就取消收藏
					} else if (_res.data.code === 422) {
						this.cancelFavorite(newsId);
					}
				});
			},
			//加载更多视频
			loadMoreVideo() {
				this.size++;
				this.getlistVideo();
			},
			//获取视频列表
			getlistVideo() {
				let url = `http://172.16.222.16:91/api/news/getList/${this.type}/${this.page}/${this.size}`;
				httpRequest(url, "GET", this.token, null, (_res) => {
					this.listVideo = _res.data.data.rows;
					console.log(this.listVideo);
				});
			},
			//关闭分享页
			closePopup() {
				this.flagShare = false;
			},
			//进入视频详细页
			goVideioDetailpage(news_id) {
				uni.navigateTo({
					url: `/pages/video/detailpage?news_type=${this.type}&news_id=${news_id}`,
					// 仅在真机生效
					animationType: 'slide-in-right',
					animationDuration: 200
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.video_list {

		padding: 0px 6px;
		border-bottom: 1px solid #dfe4ea;

		.video_title {

			padding: 10px 0px;

			text {
				font-size: 18px;
			}
		}

		video {
			width: 100%;

			border-radius: 6px;
		}


		.u-row .u-col {
			.video_time {
				color: #95a5a6;
			}

			.box-btn {
				image {
					width: 20px;
					height: 20px;
					vertical-align: middle;
					margin: 0px 6px;
				}
			}
		}
	}
</style>