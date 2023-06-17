<template>
	<view class="container">
		<view class="news-box" v-if="flagPage == 1">
			<view class="news-title">
				<h1>{{currentCtontentInfo.title}}</h1>
			</view>
			<view class="news-pageview">
				<span>{{currentCtontentInfo.create_time}}</span>
				<span class="news-mar">{{currentCtontentInfo.total_comment}}评论</span>
				<span class="news-mar">{{currentCtontentInfo.total_hit}}阅读量</span>
			</view>
			<view class="news-content" v-html="currentCtontentInfo.content"></view>
			<image class="news-pics" :src="currentCtontentInfo.pics" v-if="currentCtontentInfo.pics != ''"></image>
			<view class="comment-total">
				<h2>评论 {{currentCtontentInfo.total_comment}}</h2>
			</view>
		</view>

		<view class="video-box" v-if="flagPage == 2">
			<video style="width: 100%;" :src="`${host}${currentCtontentInfo.video_url}`"></video>
			<view class="container-box1">
				<view class="video_title">
					{{currentCtontentInfo.title}}
				</view>
				<view class="video_time">
					{{currentCtontentInfo.create_time}} 阅读量 {{currentCtontentInfo.total_hit}}
				</view>
				<view class="video_comment-total">
					评论 {{currentCtontentInfo.total_comment}}
				</view>
			</view>
		</view>

		<!-- 评论列表-->
		<view class="comment-box">
			<scroll-view scroll-y="true" :refresher-threshold="60" refresher-enabled @refresherpulling="onPulling"
				@refresherrefresh="onRefresh" :refresher-triggered="triggered" @scrolltolower="loadMoreComment()">
				<view class="comment-list" v-for="(item, index) in currentCtontentComment" :key="item.id">
					<view class="layout">
						<view class="left">
							<image class="user_avatar" :src="item.avatar"></image>
						</view>
						<view class="right">
							<span class="layout-left">{{item.account}}</span>
							<view class="layout-right">
								<span>{{ currentCtontentCommentsTime[index] }}</span>
								<image @click="care(item.account_id)"
									:src="followedUsers.includes(item.account_id) ? '/static/images/gz1.png' : '/static/images/gz2.png'">
								</image>
								<span @click="care(item.account_id)">
									{{followedUsers.includes(item.account_id) ? '已关注' : '+关注'}}
								</span>
							</view>
						</view>
					</view>
					<view class="content-box">
						{{ item.content }}
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 评论组件 -->
		<view class="footer">
			<u-badge :type="type" max="99" :value="comment_total"></u-badge>
			<Comment ref="Comment" @news_likes="likes()" @collection-news="collectNews()" :newsId="news_id"
				:_token="token" />
		</view>

		<u-toast ref="uToast"></u-toast>

		<u-modal width="260px" :show="showUmodal" :title="title" :content="content" :confirmText="confirmText"
			:cancelText="cancelText" @confirm="goLoginPage()" @cancel="showUmodal = false" showCancelButton>
		</u-modal>

	</view>
</template>

<script>
	import {
		httpRequest,
		formatCommentTime,
		goLogin
	} from '@/utils/request.js'

	import Comment from '@/components/comment.vue'

	export default {
		components: {
			Comment,
		},
		data() {
			return {
				//
				errorTips: [
					[{
							type: 'error',
							message: "您不能关注自己",
							iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/error.png',
							duration: 700
						},
						{
							type: 'success',
							message: "取消关注成功",
							iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/success.png',
							duration: 700
						},
						{
							type: 'success',
							message: "关注成功",
							iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/success.png',
							duration: 700
						}
					],
					[{
							type: 'success',
							message: "取消点赞",
							iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/success.png',
							duration: 700
						},
						{
							type: 'success',
							message: "点赞成功",
							iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/success.png',
							duration: 700
						}
					],
					[{
							type: 'success',
							message: "已取消收藏",
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
					[{
						type: 'success',
						message: "更新成功",
						iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/success.png',
						duration: 700
					}]
				],
				showUmodal: false,
				title: '1',
				content: '1',
				confirmText: '确认',
				cancelText: '取消',

				flagPage: null, //控制详细页状态、true为新闻详细页相反

				user_id: null, // 关注/取消关注当前用户id
				flagCollect: null, //视频收藏状态
				flaglikes: null, //视频点赞状态

				myId: null, //本用户的id
				followedUsers: [], //已关注用户的id

				token: '',

				triggered: false, //下拉滚动状态
				total_hit: '', //更新的阅读量
				host: 'http://172.16.222.16:91', //请求地址
				news_id: '', //保存当前新闻的id
				currentCtontentInfo: [], //当前新闻/视频信息
				currentCtontentComment: [], //新闻/视频评论
				currentNewsCommentTime: [], //新闻/视频评论时间

				page: 1, //页数
				size: 10, //条数
				type: 'error', //消息颜色
				comment_total: null, //评论条数
			}
		},
		onLoad(option) {
			this.token = uni.getStorageSync('token');
			this.flagPage = option.news_type; //
			this.news_id = option.news_id; //

		},
		onShow() {
			this.getCtontentInfo(); //获取新闻/视频的信息
			this.getCurrentCtontentComment(); //获取评论
			this.updateReadingVolume();
			this.getConcern();
			this.getUserInfo();
		},
		watch: {
			//监听收藏状态
			flagCollect(newVal, oldVal) {
				this.handleFlagNewsCollectChange(newVal);
			},
			//监听点赞状态
			flaglikes(newVal, oldVal) {
				this.handleFlagNewslikesChange(newVal);
			}
		},
		methods: {

			//获取当前内容的评论和评论时间
			getCurrentCtontentComment() {
				const url = `http://172.16.222.16:91/api/news/getCommentList/${this.news_id}/${this.page}/${this.size}`;
				httpRequest(url, "GET", this.token, null, (_res) => {
					this.currentCtontentComment = _res.data.data.rows;
					//评论数量
					this.comment_total = _res.data.data.total;
					//转换时间
					this.currentCtontentCommentsTime = formatCommentTime(this.currentCtontentComment);
				})
			},
			//获取当前这篇新闻
			getCtontentInfo() {
				const url = `http://172.16.222.16:91/api/news/getDetail/${this.news_id}`;
				httpRequest(url, "GET", this.token, null, (_res) => {
					this.currentCtontentInfo = _res.data.data; //获取新闻信息
					this.flaglikes = this.currentCtontentInfo.is_praise; //获取新闻点赞状态
					this.flagCollect = this.currentCtontentInfo.is_store; //获取新闻收藏状态
				});
			},
			//去登录
			goLoginPage() {
				goLogin();
			},
			//收藏状态
			handleFlagNewsCollectChange(newValue) {
				//是否已收藏
				if (newValue) {
					this.$refs.Comment.scImg = '/static/images/sc1.png';
				} else {
					this.$refs.Comment.scImg = '/static/images/sc2.png';
				}
			},
			//点赞状态
			handleFlagNewslikesChange(newValue) {
				if (newValue) {
					this.$refs.Comment.dzImg = '/static/images/ydz.png';
				} else {
					this.$refs.Comment.dzImg = '/static/images/dz.png';
				}
			},
			//获取本用户的id
			getUserInfo() {
				const url = `http://172.16.222.16:91/api/account/getInfo`;
				httpRequest(url, "POST", this.token, null, (_res) => {
					console.log(_res);
					this.myId = _res.data.data.account_id;
				});
			},
			//取消关注
			careCancellation() {
				const url = 'http://172.16.222.16:91/api/fans/foucsAction';
				httpRequest(url, "POST", this.token, {
					foucs_account_id: this.user_id,
					action: 2
				}, (_res) => {
					if (_res.data.code === 200) {
						this.getConcern();
						this.$refs.uToast.show(this.errorTips[0][1]);
					}
				});
			},
			//关注
			care(userId) {
				if (this.token === '' || this.token === null || this.token === undefined) {
					this.showUmodal = true;
					this.title = "登录提示";
					this.content = "您还未登录请登录后再来关注吧~~";
					this.confirmText = "去登录";
					return;
				}
				this.user_id = userId;
				const url = 'http://172.16.222.16:91/api/fans/foucsAction';
				//不能关注自己
				if (userId === this.myId) {
					this.$refs.uToast.show(this.errorTips[0][0])
				} else {
					httpRequest(url, "POST", this.token, {
						foucs_account_id: this.user_id,
						action: 1
					}, (_res) => {
						if (_res.data.code === 200) {
							this.getConcern();
							this.$refs.uToast.show(this.errorTips[0][2])
						} else {
							//执行取消关注方法
							this.careCancellation();
						}
					});
				}
			},
			//获取粉丝id
			getConcern() {
				const url = `http://172.16.222.16:91/api/fans/getFoucsList/1/100`;
				httpRequest(url, "GET", this.token, null, (_res) => {
					this.followedUsers = _res.data.data.rows;
					//筛选已关注用户的id
					this.followedUsers = this.followedUsers.map(item => item.account_id);
				});
			},
			//取消收藏
			collectCancellation() {
				const url = `http://172.16.222.16:91/api/news/storeAction`;
				httpRequest(url, "POST", this.token, {
					news_id: this.news_id,
					action: 2
				}, (_res) => {
					if (_res.data.code === 200) {
						this.flagCollect = false;
						this.$refs.uToast.show(this.errorTips[2][0]);
						this.$refs.Comment.scImg = '/static/images/sc2.png' //收藏状态图片变为未收藏
					}
				});
			},
			//收藏
			collectNews() {
				if (this.token === '' || this.token === null || this.token === undefined) {
					this.showUmodal = true;
					this.title = "登录提示";
					this.content = "您还未登录请登录后再来收藏吧~~";
					this.confirmText = "去登陆";
					return;
				}
				const url = `http://172.16.222.16:91/api/news/storeAction`;
				//如果是已收藏状态则执行取消收藏方法，反之
				if (this.flagCollect) {
					console.log(this.flagCollect);
					this.collectCancellation();
				} else {
					httpRequest(url, "POST", this.token, {
						news_id: this.news_id,
						action: 1
					}, (_res) => {
						//收藏成功则收藏变为红色
						if (_res.data.code === 200) {
							this.$refs.uToast.show(this.errorTips[2][1]);
							this.$refs.Comment.scImg = '/static/images/sc1.png'; //收藏状态图片变为未收藏
						} else {
							//如果返回422，说已收藏过，则执行取消收藏方法
							this.collectCancellation();
						}
					});
				}
			},
			//取消点赞
			likesCancellation() {
				const url = `http://172.16.222.16:91/api/news/praiseAction`;
				httpRequest(url, "POST", this.token, {
					news_id: this.news_id,
					action: 2
				}, (_res) => {
					if (_res.data.code === 200) {
						this.flaglikes = false;
						this.$refs.uToast.show(this.errorTips[1][0]);
						this.$refs.Comment.dzImg = '/static/images/dz.png';
					}
				});
			},
			//点赞
			likes() {
				if (this.token === '' || this.token === null || this.token === undefined) {
					this.showUmodal = true;
					this.title = "登录提示";
					this.content = "您还未登录请登录后再来点赞吧~~"
					this.confirmText = "去登陆";
					return;
				}
				const url = `http://172.16.222.16:91/api/news/praiseAction`;
				//如果新闻已是点赞状态，则点击为取消点赞、不是则执行点赞方法
				if (this.flaglikes) {
					this.likesCancellation();
				} else {
					httpRequest(url, "POST", this.token, {
						news_id: this.news_id,
						action: 1
					}, (_res) => {
						//点赞成功则点赞变为红色
						if (_res.data.code === 200) {
							this.$refs.uToast.show(this.errorTips[1][1]);
							this.$refs.Comment.dzImg = '/static/images/ydz.png';
						} else {
							//如果返回422，说已点赞过，则执行取消点赞方法
							this.likesCancellation();
						}
					});
				}
			},
			//更新阅读量
			updateReadingVolume() {
				const url = `http://172.16.222.16:91/api/news/updateHit/${this.news_id}`;
				httpRequest(url, "GET", this.token, null, (_res) => {
					this.total_hit = _res.data.data.total_hit;
				});
			},
			//下拉状态
			onPulling() {
				let that = this;
				if (!this.triggered) {
					// this.triggered 的值为 false，所以 !this.triggered 的值为 true
					// 因此，这里的代码会被执行
					//下拉加载，先让其变true再变false才能关闭
					this.triggered = true;
					//关闭加载状态 (转动的圈)，需要一点延时才能关闭
					setTimeout(() => {
						that.triggered = false;
						//提示更新成功
						this.flagFeedback = true;
						this.feedbackImg = '/static/images/cg.png';
						this.tipsFeedback = '更新成功';
						setTimeout(() => {
							this.flagFeedback = false;
						}, 300)
					}, 1400)
				}
			},
			//加载最新评论
			onRefresh() {
				setTimeout(() => {
					this.getCurrentCtontentComment();
					this.$refs.uToast.show(this.errorTips[3][0]);
				}, 1500)
			},
			//加载更多评论
			loadMoreComment() {
				this.size += 10;
				this.getCurrentCtontentComment();
			},

		}
	}
</script>

<style lang="scss" scoped>
	.container {
		height: 100vh;

		.news-box {
			background-color: #fff;
			padding: 16px 8px 0px;

			.news-title {
				line-height: 30px;
			}

			.news-pageview {
				margin: 10px 0px;
				color: #95a5a6;

				.news-mar {
					margin-left: 8px;
				}
			}

			.news-content {
				font-size: 1.25rem;
			}

			.news-pics {
				margin-top: 8px;
				width: 100%;
			}

			.comment-total {
				height: 54px;
				line-height: 54px;
				border-bottom: 1px solid #dfe4ea;
			}
		}

		.video-box {
			background: #ffffff;

			.container-box1 {
				padding: 0px 6px;


				.video_title {
					font-size: 18px;
					font-weight: 600;
				}

				.video_time {
					font-size: 0.625rem;
					color: #95a5a6;
				}

				.video_comment-total {
					font-size: 16px;
					font-weight: 600;
					padding: 10px 0px;
					border-bottom: 1px solid #dfe4ea;
				}
			}
		}


		.comment-box {
			background-color: #fff;
			padding: 0px 8px;
			padding-bottom: 46px;

			scroll-view {
				height: calc(100vh - 86px - 106px);

				.comment-list {
					margin: 16px 0px;

					.layout {
						display: flex;

						.left {

							image {
								width: 50px;
								height: 50px;
								border-radius: 50%;
							}
						}

						.right {
							width: 100%;
							display: flex;
							justify-content: space-between;

							.layout-left {
								flex: 1;
								overflow: hidden;
								font-weight: 600;
								font-size: 16px;
							}

							.layout-right {
								height: 50px;
								line-height: 50px;

								image {
									width: 22px;
									height: 22px;
									vertical-align: middle;
									margin-left: 10px;
								}

								span {
									margin-left: 6px;
									color: #95a5a6;
								}

								& span:first-of-type {
									font-size: 0.625rem;
								}

								& span:last-of-type {
									padding: 2px 6px;
									border-radius: 3px;
									background: #ff0000;
									color: #ffffff;
								}
							}

							height: 50px;
							line-height: 50px;
							margin-left: 24px;
						}
					}

					.content-box {
						word-wrap: break-word;
						margin-left: 74px;
					}
				}
			}
		}

		.footer {
			width: 100%;
			position: fixed;
			left: 0;
			bottom: 0;

			.u-badge {
				z-index: 3000;
				position: absolute;
				top: 4px;
				left: 53%;
			}
		}
	}
</style>