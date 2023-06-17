<template>
	<view class="container">
		<view class="header">
			<view class="tab_list" :class="{'borderBottom':flagComments}" @click="switchCommentsPage()">评论</view>
			<view class="tab_list" :class="{'borderBottom':flagCollection}" @click="switchCollectionPage()">收藏</view>
			<view class="tab_list" :class="{'borderBottom':flagFootprints}" @click="switchFootprintsPage()">足迹</view>
		</view>
		<scroll-view scroll-y="true" 
		@scrolltolower="(flagComments ? loadMoreComment() : null),
		 (flagCollection ? loadMoreCollection() : null), 
		 (flagFootprints ? loadMoreFootprint() : null)"
				style="height: calc(100vh - 42px);">
			<view class="container-box1" v-if="flagComments">
				<view class="comments_list" v-for="(item, index) in comment_List" :key="item.id">
					<view class="container_flex">
						<image :src="user_info.avatar" 
						style="width: 50px;height: 50px;border-radius: 100%;width: 50px;"></image>
						<view class="" style="flex: 1;margin-left: 10px;">
							<u-row>
								<u-col span="6" 
								style="font-size: 16px;height: 25px;">{{user_info.account}}</u-col>
								<u-col span="6" 
								style="text-align: right;height: 25px;">
									<view class="">
										<span @click="isUmodal(item.id,1)">删除</span>
									</view>
								</u-col>
							</u-row>
							<u-row>
								<u-col style="font-size: 0.625rem;color: #95a5a6;">{{time_comment[index]}}</u-col>
							</u-row>
						</view>
					</view>
					<view style="word-wrap: break-word;margin-top: 8px;">{{item.content}}</view>
					<view style="padding: 10px;background-color: #f1f2f6;margin: 10px 0px;display: flex;">
						<image v-if="item.news.pics != ''" :src="item.news.pics" style="width: 100px;height: 80px;"></image>
						<view style="flex: 1;margin-left: 10px;font-size: 18px;">
							{{item.news.title}}
						</view>
					</view>
				</view>
			</view>

			<view class="collection_box" v-if="flagCollection">
				<view class="layout" v-for="(item, index) in collect_List">
					<image :src="item.pics" v-if="item.pics != ''">
					</image>
					<view class="layout_right">
						<view class="collection_title">
							{{item.title}}
						</view>
						<view class="" style="position: absolute;bottom: 0;width: 100%;">
							<u-row justify="space-between">
								<u-col span="10" style="font-size: 0.625rem;">
									<view class="" style="white-space: nowrap;overflow: hidden;">
										<span style="color: #95a5a6;">{{item.create_time}}</span>
										<span style="margin-left:4px;color: #95a5a6;">{{item.total_comment}}评论</span>
										<span style="margin-left:4px;color: #95a5a6;">{{item.total_hit}}浏览量</span>
									</view>
								</u-col>
								<u-col span="2" style="text-align: right;">
									<view class="">
										<span @click="isUmodal(item.news_id,2)">删除</span>
									</view>
								</u-col>
							</u-row>
						</view>
					</view>
				</view>
			</view>

			<view class="footprints_box collection_box" v-if="flagFootprints">
				<view class="layout" v-for="(item, index) in footprint_List">
					<image :src="item.pics" v-if="item.pics != ''"></image>
					<view class="layout_right">
						<view class="collection_title">
							{{item.title}}
						</view>
						<view style="position: absolute;bottom: 0;width: 100%;">
							<u-row justify="space-between">
								<u-col style="font-size: 0.625rem;">
									<view class="" style="white-space: nowrap;overflow: hidden;">
										<span style="color: #95a5a6;">{{item.create_time}}</span>
										<span style="margin-left:4px;color: #95a5a6;">{{item.total_comment}}评论</span>
										<span style="margin-left:4px;color: #95a5a6;">{{item.total_hit}}浏览量</span>
									</view>
								</u-col>
							</u-row>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		
		<u-modal
		width="260px"
		:show="showUmodal" 
		:title="title" 
		:content="content"
		:confirmText="confirmText" 
		:cancelText="cancelText" 
		@confirm="isConfirm ? delComment() : delCollection()"
		@cancel="showUmodal = false"
		showCancelButton> 
		</u-modal>
		
		<u-toast ref="uToast"></u-toast>
		
	</view>
</template>

<script>
	import {
		httpRequest,
		formatCommentTime
	} from '@/utils/request.js'
	
	export default {
		components:{
		},
		data() {
			return {
				errorTips:[
					{
						type: 'success',
						message: "删除成功",
						iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/error.png',
						duration: 700
					},
				],
				
				id:null,
				isConfirm:false,
				showUmodal: false, //按钮模态框状态
				title: '删除提示', //标题内容
				content: '', //模态框内容
				confirmText: '确认', //确认按钮的文字
				cancelText: '取消', //取消按钮的文字
				
				clickId:false, //ture删除的是评论，false则是收藏
				titleEvent:'', //询问标题
				news_id:null, //要删除收藏新闻的id
				commen_id:null, //要删除的评论id或要删除的新闻的id
				flagIsbtns:false, //提示按钮弹窗状态
				flagFeedback: false, //反馈弹窗状态
				tipsFeedback: '', //反馈文本
				feedbackImg: '', //
				user_id: null,
				flagIsbtns: false, //提示删除弹窗状态
				token: '',
				flagComments: false, //评论页装状态
				flagCollection: false, //收藏页装状态
				flagFootprints: false, //足迹页装状态
				comment_List: [], //评论列表
				time_comment: [], //转换后的评论时间
				collect_List: [], //收藏列表
				footprint_List: [], //足迹列表
				user_info: [], //用户信息
				page:1,
				size:10
			};
		},
		onLoad(option) {
			this.token = uni.getStorageSync('token');
			if (option.page == 2) {
				uni.setNavigationBarTitle({
					title: "我的评论"
				})
				this.flagComments = true
			} else if (option.page == 3) {
				uni.setNavigationBarTitle({
					title: "我的收藏"
				})
				this.flagCollection = true
			} else if (option.page == 4) {
				uni.setNavigationBarTitle({
					title: "我的足迹"
				})
				this.flagFootprints = true
			};

		},
		onShow() {
			this.getUserInfo();
			this.CommentList();
			this.getCollect();
			this.getFootprint();
		},
		methods: {
			isUmodal(id,index){
				this.id = id;
				this.showUmodal = true;
				if(index == 1){
					this.content = "确认要删除这条评论吗?"
					this.isConfirm = true;
				} else {
					this.content = "确认要删除这条收藏吗?"
					this.isConfirm = false;
				}
			},

			//
			loadMoreComment(){
				this.size += 10;
				this.CommentList();
			},
			//
			loadMoreCollection(){
				this.size += 10;
				this.getCollect();
			},
			//
			loadMoreFootprint(){
				this.size += 10;
				this.getFootprint();
			},
			//关闭
			closeIsbtns(){
				this.flagIsbtns = false;
			},
			//删除评论
			delComment() {
				let url = `http://172.16.222.16:91/api/news/deleteComment/${this.id}`;
				httpRequest(url, "GET", this.token, null, (_res) => {
					console.log(_res);
					if(_res.data.code === 200){
						this.CommentList();
						this.showUmodal = false;
						this.$refs.uToast.show(this.errorTips[0]);
					}
				});
			},
			//删除收藏
			delCollection() {
				let url = `http://172.16.222.16:91/api/news/storeAction`;
				httpRequest(url, "POST", this.token, {
					news_id: this.id,
					action: 2
				}, (_res) => {
					if(_res.data.code === 200){
						this.showUmodal = false;
						this.$refs.uToast.show(this.errorTips[0]);
						this.getCollect();
					}					
				});
			},
			//获取足迹
			getFootprint() {
				let url = `http://172.16.222.16:91/api/history/getMyList/${this.page}/${this.size}`;
				httpRequest(url, "GET", this.token, null, (_res) => {
					this.footprint_List = _res.data.data.rows
				});
			},
			//获取用户信息
			getUserInfo() {
				let url = `http://172.16.222.16:91/api/account/getInfo`;
				httpRequest(url, "POST", this.token, null, (_res) => {
					this.user_info = _res.data.data;
				});
			},
			//获取收藏
			getCollect() {
				let url = `http://172.16.222.16:91/api/store/getMyList/${this.page}/${this.size}`;
				httpRequest(url, "GET", this.token, null, (_res) => {
					this.collect_List = _res.data.data.rows;
				});
			},
			//获取评论列表
			CommentList() {
				let url = `http://172.16.222.16:91/api/comment/getMyList/${this.page}/${this.size}`;
				httpRequest(url, "GET", this.token, null, (_res) => {
					this.comment_List = _res.data.data.rows;
					console.log(this.comment_List);
					//转换时间戳
					this.time_comment = formatCommentTime(this.comment_List);
				});
			},
			//切换评论页
			switchCommentsPage() {
				this.flagComments = true,
				this.flagCollection = false,
				this.flagFootprints = false,
				uni.setNavigationBarTitle({
					title: "我的评论"
				})
			},
			//切换收藏页
			switchCollectionPage() {
				this.flagComments = false,
				this.flagCollection = true,
				this.flagFootprints = false,
				uni.setNavigationBarTitle({
					title: "我的收藏"
				})
			},
			//切换足迹
			switchFootprintsPage() {
				this.flagComments = false,
				this.flagCollection = false,
				this.flagFootprints = true,
				uni.setNavigationBarTitle({
					title: "我的足迹"
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.borderBottom {
		border-bottom: 2px solid #FF0000;
	}

	.container {
		width: 100%;
		background-color: #fff;

		.header {
			display: flex;
			width: 100%;

			.tab_list {
				flex: 1;
				text-align: center;
				height: 40px;
				line-height: 40px;
				background-color: #fff;
			}

		}

		.container-box1,
		.collection_box,
		.footprints_box {
			padding: 0px 10px;

			.comments_list {
				padding: 10px 0px;
				border-bottom: 1px solid #dfe4ea;

				.container_flex {
					display: flex;
				}
			}
		}

		.collection_box {
			.layout {
				display: flex;
				border-bottom: 1px solid #dfe4ea;
				padding: 10px 0px;
				height: 76px;
				
				image {
					width: 100px;
					height: 76px;
				}

				.layout_right {
					flex: 1;
					position: relative;
					margin-left: 6px;

					.collection_title {
						width: 100%;
						height: calc(76px - 22px);
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
						position: absolute;
						top: 0;
						font-size: 18px;
					}
				}
			}
		}
	}
</style>