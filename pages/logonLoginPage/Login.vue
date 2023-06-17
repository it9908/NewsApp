<template>
	<view class="container">
		<view class="container-box1">
			<image src="/static/images/yonghu.png"></image>
			<view class="tips">
				用户登录
			</view>
		</view>
		<view class="container-box2">
			<view class="ipt-box">
				<image src="/static/images/yonghu1.png"></image>
				<input type="text" placeholder="账号/手机/邮箱" v-model="formData.account">
			</view>
			<view class="ipt-box">
				<image src="/static/images/xiugaimima.png"></image>
				<input type="password" placeholder="密码" v-model="formData.password">
			</view>
			<view class="forgetPwd-btn">忘记密码</view>
			<view class="login-btn" @click="login">立即登录</view>
			<!-- 弹出提示 -->
			<u-popup :show="show" mode="center"  bgColor="transparent">
				<view class="success-tips">
					{{errorLogin}}
				</view>
			</u-popup>
			<view class="logon-btn" @click="goLogon">
				没有账号，立即注册
			</view>
		</view>
	</view>
</template>

<script>
	import {
		httpRequest
	} from '@/utils/request.js'
	export default {
		data() {
			return {
				errorLogin:'',
				formData: {
					account: '',
					password: '',
				},
				show: false,
				backUrl:'',
			};
		},
		onLoad(option) {
			if(option.hasOwnProperty("back")){
				this.backUrl = option.back;
			} else {
				this.backUrl = '/pages/index/index';
			}
			
		},
		methods: {
			//登录
			login() {
				const url = `http://172.16.222.16:91/api/account/login`;
				httpRequest(url, "POST", null, this.formData, (_res) => {
					if (_res.data.code === 200) {
						this.show = true;
						this.errorLogin = "登录成功";
						setTimeout(() => {
							this.show = false;
							uni.setStorageSync('token', _res.data.data.token);
							uni.reLaunch({
								url: this.backUrl,
							})
						}, 800);
					} else {
						this.show = true;
						this.errorLogin = "登录失败";
						setTimeout(() => {
							this.show = false;
						}, 800);
					}
				});
			},
			//去注册
			goLogon() {
				uni.navigateTo({
					url: '/pages/logonLoginPage/Logon'
				})
			}
		}
	}
</script>

<style lang="scss">
	.container {
		.container-box1 {
			width: 100%;
			height: 180px;
			background-color: red;
			display: grid;
			place-items: center center;

			image {
				width: 80px;
				height: 80px;
			}

			.tips {
				color: #fff;
				font-size: 1.25rem;
			}
		}

		.container-box2 {
			padding: 40px 40px 0px;

			.ipt-box {
				border: 1px solid #a2a2a2;
				width: 100%;
				height: 40px;
				border-radius: 6px;
				margin-top: 30px;
				display: flex;

				image {
					width: 30px;
					height: 30px;
					margin: 5px 16px 0px
				}

				input {
					line-height: 40px;
					flex: 1;
					height: 40px;
				}
			}

			.forgetPwd-btn {
				width: 100%;
				height: 40px;
				border-radius: 6px;
				margin-top: 10px;
				text-align: right;
			}

			.login-btn {
				border: 1px solid #a2a2a2;
				width: 100%;
				height: 40px;
				border-radius: 6px;
				margin-top: 30px;
				background-color: red;
				text-align: center;
				line-height: 40px;
				color: #fff;
			}

			.success-tips {
				width: 160px;
				padding: 0px 10px;
				height: 100px;
				background-color: rgba(0, 0, 0, 0.6);
				border-radius: 10px;
				color: #fff;
				font-size: 16px;
				line-height: 100px;
				text-align: center;
			}

			.logon-btn {
				width: 100%;
				height: 40px;
				border-radius: 6px;
				margin-top: 30px;
				text-align: center;
				line-height: 40px;
			}
		}
	}
</style>