<template>
	<view class="container-comment">
		<view class="comment_box" @click="flagCommentBox = true">
			<image src="/static/images/bi.png"></image>
			<view class="" style="color: #38ada9;">
				写评论
			</view>
		</view>
		<view class="new_msg">
			<image src="/static/images/xiaoxi.png"></image>
		</view>
		<view class="new_msg">
			<image :src="dzImg" @click="likes()"></image>
		</view>
		<view class="new_msg">
			<image :src="scImg" @click="collectionNews()"></image>
		</view>
		<view class="new_msg">
			<image @click="flagShare = true" src="/static/images/fenxiang1.png"></image>
		</view>
		<!-- 弹出发表框 -->
		<u-popup style="padding-bottom: 20px;" :show="flagCommentBox" mode="bottom" bgColor="transparent">
			<view class="Release_box">
				<view class="box">
					<u--textarea focus ref="textarea" placeholder="请输入内容" confirmType="send" v-model="formMsg.content"
						style="flex: 5;background-color: #c7ecee;"></u--textarea>
					<view class="Release_btn" @click="postComments()">
						发表
					</view>
					<image @click="flagCommentBox = false" src="/static/images/gb.png"></image>
				</view>
			</view>
		</u-popup>
		<!-- 分享组件 -->
		<u-popup :show="flagShare" mode="bottom">
			<!-- 监听自定义事件 -->
			<Share @flag-share="closePopup"></Share>
		</u-popup>

		<u-toast ref="uToast"></u-toast>

		<u-modal width="260px" :show="showUmodal" :title="title" :content="content" :confirmText="confirmText"
			:cancelText="cancelText" @confirm="goLoginPage()" @cancel="showUmodal = false" showCancelButton>
		</u-modal>

	</view>
</template>

<script>
	import {
		httpRequest,
		goLogin
	} from '@/utils/request.js'
	import Share from '@/components/share.vue'
	export default {
		name: 'comment',
		components: {
			Share,
		},
		data() {
			return {
				showUmodal: false,
				title: '登录提示',
				content: '您还未登录请登录后再来发布吧~~',
				confirmText: '去登录',
				cancelText: '取消',

				errorTips: [{
					type: 'error',
					message: "请不要发布空白内容！",
					iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/error.png',
					duration: 700
				}, {
					type: 'success',
					message: "发布成功",
					iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/success.png',
					duration: 700
				}],

				feedbackImg: '', //反馈图片
				tipsFeedback: '', //反馈文本
				flagFeedback: false, //反馈弹窗状态
				flagIsbtns: false, //确认弹窗状态
				token: this._token,
				scImg: '/static/images/sc2.png', //收藏状态图片url
				dzImg: '/static/images/dz.png', //点赞状态图片url
				//留言内容
				formMsg: {
					news_id: this.newsId,
					content: '',
				},

				flagShare: false, //分享页状态
				flagCommentBox: false, //发表框状态
			};
		},

		props: {
			//接收新闻id
			newsId: {
				type: String,
				required: true
			},
			//接收token
			_token: {
				type: String,
				required: true
			}
		},
		methods: {
			//去登陆
			goLoginPage() {
				goLogin();
			},
			//关闭弹窗
			closeIsbtns() {
				this.flagIsbtns = false;
				this.flagCommentBox = false;
			},
			//自定义点赞方法
			likes() {
				this.$emit('news_likes');
			},
			//自定义收藏新闻方法
			collectionNews() {
				this.$emit('collection-news');
			},
			//关闭分享页
			closePopup() {
				this.flagShare = false;
			},
			// 发布留言
			postComments() {
				if (this.token === '' || this.token === null || this.token === undefined) {
					this.showUmodal = true;
				} else {
					const url = `http://172.16.222.16:91/api/news/addComment`;
					httpRequest(url, "POST", this.token, this.formMsg, (_res) => {
						console.log(_res);
						if (_res.data.code === 200) {

							this.$refs.uToast.show(this.errorTips[1]);

							//发布后清空
							this.formMsg.content = '';
							this.flagCommentBox = false;
						} else {
							this.$refs.uToast.show(this.errorTips[0]);
						}
					})
				}
			}
		},
	}
</script>

<style lang="scss">
	.container-comment {
		padding: 0px 8px;
		width: 100%;
		height: 46px;
		display: grid;
		grid-template-columns: 3fr 1fr 1fr 1fr 1fr;
		place-items: center center;
		background-color: #34e7e4;

		.comment_box {
			width: 100%;
			display: flex;
			background-color: #00d8d6;
			border-radius: 50px;
			height: 30px;
			align-items: center;

			image {
				width: 22px;
				height: 22px;
				margin: 0px 10px;
			}

			input {
				flex: 1;
				line-height: 30px;
			}
		}

		.new_msg {
			position: relative;
			height: 46px;

			image {
				margin-top: 8px;
				width: 30px;
				height: 30px;
			}

			.u-badge {
				position: absolute;
				top: 8px;
				right: -10px;
			}
		}

		.Release_box {
			background: #00d8d6;
			position: relative;
			background-color: #fff;

			.box {
				display: flex;
				margin: 24px 8px 10px 8px;

				image {
					position: absolute;
					width: 20px;
					height: 20px;
					top: 2px;
					right: 4px;
				}

				.Release_btn {
					flex: 1;
					font-size: 16px;
					margin-left: 10px;
					border-radius: 4px;
					text-align: center;
					background: #4a69bd;
					line-height: 90px;
					color: #82ccdd;
				}
			}
		}
	}
</style>