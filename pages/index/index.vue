<template>
	<view class="container">
		<view class="container-box1" style="height: 100%;">
			<scroll-view scroll-y="true" @scrolltolower="loadMoreNews()" style="height: 100%;">
				<!-- 轮播图 -->
				<u-swiper height="180" :list="list2" keyName="image" showTitle :autoplay="false" circular></u-swiper>
				<!-- 咨询列表 -->
				<view class="consult" :class="{active:activeIndex === index}" v-for="(item, index) in listNews"
					:key="item.news_id" @click="handleClick(index,item.news_id)">
					<image :src="item.pics" v-if="item.pics != ''">
					</image>
					<view class="consult_box">
						<view class="consult_title">
							<span>{{item.title}}</span>
						</view>
						<view class="consult_bottom">
							<u-row justify="space-between">
								<u-col :span="item.pics != '' ? 5 : 7" style="font-size: 0.625rem;">
									<view class="consult_time">
										<span>{{item.create_time}}</span>
										<span style="margin-left:4px;">{{item.total_comment}}评论</span>
										<span style="margin-left:4px;">{{item.total_hit}}浏览量</span>
									</view>
								</u-col>
								<u-col :span="item.pics != '' ? 7 : 5" style="text-align: right;">
									<view class="consult_btn">
										<image @click.stop="flagShow = true" src="/static/images/fenxiang.png"></image>
										<span @click.stop="flagShow = true">分享</span>
										<image @click.stop="collectNews(item.news_id);"
											:src="item.is_store ? '/static/images/zysc1.png' : '/static/images/zysc2.png'">
										</image>
										<span @click.stop="collectNews(item.news_id)">
											{{item.is_store ? '已收藏' : '收藏'}}
										</span>
									</view>
								</u-col>
							</u-row>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<u-toast ref="uToast"></u-toast>
		
		<u-modal 
		width="260px"
		:show="showUmodal" 
		:title="title" 
		:content="content"
		:confirmText="confirmText"
		:cancelText="cancelText" 
		@confirm="goLoginPage()"
		@cancel="showUmodal = false"
		showCancelButton> 
		</u-modal>
		
		<!-- 分享组件 -->
		<u-popup :show="flagShow">
			<Share @flag-share="closePopup" />
		</u-popup>

	</view>
</template>

<script>
	//引入分享组件
	import Share from '@/components/share.vue'
	//引入请求方法
	import {
		httpRequest,
		goDetailedPage,goLogin
	} from "@/utils/request.js"
	export default {
		components: {
			Share,
		},
		data() {
			return {
				errorTips:[
					{
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
				
				
				showUmodal:false,
				title : "登录提示",
				content : "您还未登录请登录后再来收藏吧~~",
				confirmText : "去登录",
				cancelText:'取消',
				
				activeIndex: -1, // 初始化为 -1，表示没有任何盒子被按压

				flagShow: false, //分享弹窗状态
				listNews: [], //新闻列表
				token: '', //保存本地token
				type: 1, //新闻类型
				page: 1, //页码
				size: 10, //每页数量
				//轮播图数据
				list2: [{
					image: '/static/images/banner1.png',
					title: '建设高水平高职学校和专业建设计划',
				}, {
					image: '/static/images/banner2.png',
					title: '笃志、修身、务实、厚生'
				}, {
					image: '/static/images/banner3.png',
					title: '民族团结我同行 各族师生一家亲'
				}],
			}
		},
		onLoad() {
			this.token = uni.getStorageSync('token');
		},
		onShow() {
			this.getListNews();
		},
		methods: {
			goLoginPage(){
				goLogin();
			},
			
			//获取新闻列表
			getListNews() {
				let token =  uni.getStorageSync('token');
				const url = `http://172.16.222.16:91/api/news/getList/${this.type}/${this.page}/${this.size}`;
				httpRequest(url, "GET", token, null, (_res) => {
					this.listNews = _res.data.data.rows
					if(this.token === '' || this.token === undefined || this.token === null){
						this.listNews.is_store = false;
					}
					console.log(this.listNews);
				})
			},

			//点击进入详细页时的按压效果
			handleClick(index, newsId) {
				this.activeIndex = index; // 切换为按压状态
				// 在适当的时机，恢复为未按压状态
				setTimeout(() => {
					this.activeIndex = -1;
					//进入详细页
					this.goDetailed(this.type, newsId);
				}, 300); // 设置合适的时间间隔，使按压效果持续一段时间后恢复

			},
			//进入详细页
			goDetailed(newsType, newsId) {
				console.log(newsType, newsId);
				goDetailedPage(newsType, newsId);
			},

			//划到底部获取更多新闻
			loadMoreNews() {
				this.size += 10;
				this.getListNews();
			},
			//关闭分享页
			closePopup() {
				this.flagShow = false;
			},
			//检测用户是否登录
			openUmodal(newsId){
				this.news_id = newsId;
			},
			//取消收藏
			cancelFavorite() {
				let token =  uni.getStorageSync('token');
				const url = `http://172.16.222.16:91/api/news/storeAction`;
				httpRequest(url, "POST", token, {
					news_id: this.news_id,
					action: 2
				}, (_res) => {
					this.$refs.uToast.show(this.errorTips[0]);
					this.getListNews();
				})
			},
			//收藏一篇新闻
			collectNews(newsId) {
				let token =  uni.getStorageSync('token');
				this.news_id = newsId;
				if(this.token === '' || this.token === null || this.token === undefined){
					this.showUmodal = true;
				}
				const url = `http://172.16.222.16:91/api/news/storeAction`;
				httpRequest(url, "POST", token, {
					news_id: this.news_id,
					action: 1
				}, (_res) => {
					if (_res.data.code === 200) {
						this.$refs.uToast.show(this.errorTips[1]);
						this.getListNews();
						
						//如果是已收藏那么就取消收藏
					} else if (_res.data.code === 422) {
						this.cancelFavorite(newsId);
					}
				});
			},

		}
	}
</script>

<style lang="scss" scoped>
	.active {
		background-color: #ccc;
		/* 设置按压效果的背景色 */
	}

	.indicator {
		@include flex(row);
		justify-content: center;

		&__dot {
			height: 6px;
			width: 6px;
			border-radius: 100px;
			background-color: rgba(255, 255, 255, 0.35);
			margin: 0 5px;
			transition: background-color 0.3s;

			&--active {
				background-color: #ffffff;
			}
		}
	}

	.container {
		height: 100vh;
		padding: 0px 6px;
		background-color: #ffffff;

		.consult {
			margin-top: 4px;
			display: flex;
			border-bottom: 1px solid #dfe4ea;
			padding: 10px 0px;
			height: 76px;

			image {
				flex: 2;
				height: 76px;
			}

			.consult_box {

				position: relative;
				margin-left: 8px;
				flex: 5;

				.consult_title {
					width: 100%;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					font-size: 18px;
					position: absolute;
					left: 0;
					top: 0;
				}

				.consult_bottom {
					position: absolute;
					bottom: 0;
					width: 100%;

					.consult_time {
						white-space: nowrap;
						overflow: hidden;
						color: #95a5a6;
					}

					.consult_btn {
						image {
							width: 20px;
							height: 20px;
							vertical-align: middle;
							margin: 0px 6px;
						}
					}
				}
			}
		}


	}
</style>