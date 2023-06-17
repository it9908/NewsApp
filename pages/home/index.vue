<template>
	<view class="container">
		<view class="container-box1">
			<view class="info_top">
				<image :src="userInfo.avatar"></image>
				<view class="account">{{userInfo.account}}</view>
			</view>
			<view class="info_bottom">
				<view class="info_list" @click="goPage1(page = 0)">
					<view>{{userInfo.num_fans}}</view>
					<view>关注</view>
				</view>
				<view class="info_list" @click="goPage1(page = 1)">
					<view>{{userInfo.num_focus}}</view>
					<view>粉丝</view>
				</view>
				<view class="info_list" @click="goPage2(page = 2)">
					<view>{{userInfo.num_comment}}</view>
					<view>评论</view>
				</view>
				<view class="info_list" @click="goPage2(page = 3)">
					<view>{{userInfo.num_stores}}</view>
					<view>收藏</view>
				</view>
				<view @click="goPage2(page = 4)" style="flex: 1;text-align: center;">
					<view style="font-size: 20px;">{{userInfo.num_history}}</view>
					<view>足迹</view>
				</view>
			</view>
		</view>
		<view class="container-box2">
			<view class="operation_btn">
				<image src="/static/images/txgenhuan.png"></image>
				<view class="operation_tips" @click="show = true">
					更换头像
				</view>
			</view>
			<view class="operation_btn">
				<image src="/static/images/xiugaimima.png"></image>
				<view class="operation_tips" @click="goUpdatePwd">
					修改密码
				</view>
			</view>
			<view class="logout_btn" @click="showUmodal = true">
				注销
			</view>

		</view>
		<!-- 是否退出登录 -->
		<u-modal width="260px" :show="showUmodal" :title="title" :content="content" :confirmText="confirmText"
			:cancelText="cancelText" @confirm="logout()" @cancel="showUmodal = false" showCancelButton>
		</u-modal>
		<!-- 弹出更换选项 -->
		<u-popup :show="show" :round="10" mode="center">
			<view class="popup-box">
				<view class="left">
					<image class="tab-img1" @click="getAlbum" src="/static/images/xiangce.png"></image>
					<view>相册</view>
				</view>
				<view class="right">
					<image class="tab-img1" @click="photosUpload" src="/static/images/xiangji.png"></image>
					<view>拍照</view>
					<image class="tab-img2" @click="show = false" src="/static/images/gb.png"></image>
				</view>
			</view>
		</u-popup>
			
	</view>
</template>

<script>
	import {
		httpRequest
	} from '@/utils/request.js'

	export default {
		components: {
		},
		data() {
			return {		
				showUmodal: false,
				title: '退出提示',
				content: '确定要退出吗?',
				confirmText: '确认',
				cancelText: '取消',
				token: '',
				flagIsbtns: false, //反馈弹窗状态
				userInfo: [], //用户信息
				page: '', //0表示关注页，1表示粉丝页，。。。。
				show: false, //
				src: 'https://cdn.uviewui.com/uview/album/1.jpg',
			};
		},
		onLoad() {
			this.token = uni.getStorageSync('token');
			if (this.token === '' || this.token === null || this.token === undefined) {
				uni.redirectTo({
					url: '/pages/logonLoginPage/Login?back=/pages/home/index',
				})
			} else {
				this.getUserInfo();
			}
		},
		onShow() {

			this.getUserInfo();

		},
		methods: {
			
			//上传照片
			uploadImage(filePath) {
				uni.uploadFile({
					url: 'http://172.16.222.16:91/api/account/uploadAvatar',
					filePath: filePath,
					name: 'file',
					header: {
						'Authorization': this.token
					},
					formData: {},
					success: (uploadFileRes) => {
						let result = JSON.parse(uploadFileRes.data);
						if (result.code == 200) {
							let data = result.data;
							this.$emit('onUploadSuccess', data.avatar);
							this.getUserInfo();
							this.show = false;
						}
					}
				});
			},
			//打开相机
			photosUpload() {
				uni.chooseImage({
					count: 1,
					sizeType: ['original', 'compressed'],
					sourceType: ['camera'],
					camera: 'front',
					success: (res) => {
						console.log(res);
						const files = res.tempFilePaths;
						this.uploadImage(files[0]);
					}
				})
			},
			//打开相册
			getAlbum() {
				uni.chooseImage({
					count: 1,
					sizeType: ['original', 'compressed'],
					mediaType: ["image"],
					sourceType: ['album'],
					success: (res) => {
						const files = res.tempFilePaths;
						this.uploadImage(files[0]);
					}
				})
			},
			//获取用户信息
			getUserInfo() {
				const url = `http://172.16.222.16:91/api/account/getInfo`;
				httpRequest(url, "POST", this.token, null, (_res) => {
					console.log(_res);
					this.userInfo = _res.data.data;
				});
			},
			//关闭按钮提示框
			closeIsbtns() {
				this.flagIsbtns = false;
			},
			//退出登录
			logout() {
				uni.removeStorageSync('token');
				uni.reLaunch({
					url: '/pages/index/index'
				})
			},
			//前往关注、粉丝页
			goPage1() {
				uni.navigateTo({
					url: `/pages/home/detailedPage/fanFollowPage?page=${this.page}`
				})
			},
			//前往评论、收藏、足迹页
			goPage2() {
				uni.navigateTo({
					url: `/pages/home/detailedPage/commentFavoriteFootprintPage?page=${this.page}`
				})
			},
			//前往修改密码
			goUpdatePwd() {
				uni.navigateTo({
					url: '/pages/home/updatePwd'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		.container-box1 {
			background-color: red;
			width: 100%;
			height: 200px;

			.info_top {
				display: flex;
				padding: 20px 20px 0px;

				image {
					width: 70px;
					height: 70px;
					border-radius: 50%;
					border: 2px solid #ffffff;
				}

				.account {
					color: #ffffff;
					font-size: 1.25rem;
					margin-left: 20px;
					flex: 1;
					line-height: 70px;
				}
			}

			.info_bottom {
				display: flex;
				width: 100%;
				height: 60px;
				margin-top: 40px;
				color: #fff;
				align-items: center;

				.info_list {
					border-right: 1px solid #fff;
					flex: 1;
					text-align: center;

					& view:first-of-type {
						font-size: 20px;
					}
				}
			}
		}

		.container-box2 {
			padding: 0px 20px 0px;

			.operation_btn {
				border-bottom: 1px solid #7ed6df;
				padding-bottom: 10px;
				display: flex;
				margin-top: 20px;

				image {
					width: 30px;
					height: 30px;
				}

				.operation_tips {
					margin-left: 14px;
					line-height: 30px;
				}
			}

			.logout_btn {
				font-size: 16px;
				margin-top: 20px;
				text-align: center;
				width: 100%;
				height: 46px;
				background-color: #c7ecee;
				line-height: 46px;
			}
		}

		// 弹出层样式
		.popup-box {
			display: flex;
			width: 200px;
			padding: 10px;
			.left,
			.right {
				flex: 1;
				text-align: center;
				
				view{
					font-size: 16px;
				}

				.tab-img1 {
					width: 40px;
					height: 40px;
					margin: 24px 0px 10px;
				}

				.tab-img2 {
					width: 20px;
					height: 20px;
					position: absolute;
					top: 0px;
					right: 0px;
				}
			}

			.right {
				position: relative;

			}
		}
	}
</style>