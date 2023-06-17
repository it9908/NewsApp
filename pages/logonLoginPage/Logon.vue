<template>
	<view class="container">
		<view class="container-box1">
			<u--image :showLoading="true" src="/static/images/yonghu.png" width="80px" height="80px">
			</u--image>
			<view class="tips">用户注册</view>
		</view>
		<view class="container-box2">
			<view class="container-content">
				<image src="/static/images/yonghu1.png"></image>
				<input type="text" placeholder="账号/手机/邮箱" v-model="formData.account"
					@blur="isValidAccount(formData.account),isPresenceAccount()">
			</view>
			<view :class="{'errorColor':flagAccount}" v-if="flagAccount">
				{{errorAccount}}
			</view>
			<view class="container-content">
				<image src="/static/images/jiesuo.png"></image>
				<input type="password" placeholder="密码" v-model="formData.password"
					@blur="isValidPassword(formData.password)">
			</view>
			<view :class="{'errorColor':flagPassWord}" v-if="flagPassWord">
				{{errorPassWord}}
			</view>
			<view class="container-content">
				<image src="/static/images/jiesuo.png"></image>
				<input type="password" 
					placeholder="重复密码" 
					v-model="formData.repeat_password" 
					@blur="isValidRptPassWord"
				>
			</view>
			<view :class="{'errorColor':flagRepeat_PassWord}" v-if="flagRepeat_PassWord">
				{{errorRepeat_PassWord}}
			</view>
			<view class="logon-btn" @click="logon">
				注册
			</view>
			<!-- 弹出提示 -->
			<u-popup :show="show" mode="center" bgColor="transparent">
				<view class="success-tips">
					注册成功
				</view>
			</u-popup>
			<view class="gologin-btn" @click="goLoginPage">
				已有账号，立即登录
			</view>
		</view>
	</view>
</template>

<script>
	import {
		httpRequest,goLogin
	} from '@/utils/request.js';
	export default {
		data() {
			return {
				formData: {
					account: '', //账号名
					password: '', //密码
					repeat_password: '' //重复密码
				},
				//提示错误信息
				errorAccount: '',
				errorPassWord: '*密码是6-20位字母+数字',
				errorRepeat_PassWord: '*两次密码不一致',
				//提示栏状态
				flagAccount: false,
				flagPassWord: false,
				flagRepeat_PassWord: false,
				//注册成功弹窗
				show: false,
			};
		},
		computed: {
			//
			ByRegistration() {
				return this.isValidAccount(this.formData.account) === true 
				&& this.isValidPassword(this.formData.password) === true 
				&& this.isValidRptPassWord() == true
			},
		},
		methods: {
			//验证账号是否存在
			isPresenceAccount() {
				const url = `http://172.16.222.16:91/api/account/accountExist?account=${this.formData.account}`
				httpRequest(url, "GET", null, null, (_res) => {
					if (_res.data.data) {
						this.errorAccount = '账号已存在';
						this.flagAccount = true;
					}
				});
			},
			//验证账号格式
			isValidAccount(account) {
				// 验证字符串长度是否在 6-20 位之间
				if (account.length < 6 || account.length > 20) {
					this.flagAccount = true
					this.errorAccount = "*账号必须是6-20位字符或者手机/邮箱";
					return false;
				}
				// 验证字符串是否为有效的手机号和电子邮箱地址
				const regex =
					/^((\w{6,20})|(1[3-9]\d{9})|([a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})))$/;
				if (!regex.test(account)) {
					this.errorAccount = "*账号必须是6-20位字符或者手机/邮箱";
					return false;
				}
				this.flagAccount = false
				// 如果都符合，则返回 true
				return true;
			},
			//验证密码格式
			isValidPassword(password) {
				// 验证字符串长度是否在 6-20 位之间，且只包含字母和数字
				const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;
				if (!regex.test(password)) {
					this.flagPassWord = true
					return false
				}
				this.flagPassWord = false
				return true
			},
			//验证密码重复
			isValidRptPassWord() {
				if (this.formData.password !== this.formData.repeat_password) {
					this.flagRepeat_PassWord = true
					return false
				}
				this.flagRepeat_PassWord = false
				return true
			},
			//通过注册
			logon() {
				if (this.ByRegistration) {
					const url = `http://172.16.222.16:91/api/account/register`;
					httpRequest(url, "POST", null, this.formData, (_res) => {
						this.show = true;						
						setTimeout(() => {
							this.show = false;
							this.goLoginPage();
						}, 1000);
					});
				}
			},
			//去登录
			goLoginPage() {
				goLogin()
			},
		}
	}
</script>

<style lang="scss">
	.errorColor {
		color: red;
	}

	.container {
		.container-box1 {
			width: 100%;
			height: 180px;
			background-color: red;
			display: grid;
			place-items: center center;

			.tips {
				color: #fff;
				font-size: 1.25rem;
			}
		}

		.container-box2 {
			padding: 40px 40px 0px;

			.container-content {
				border: 1px solid #a2a2a2;
				width: 100%;
				height: 40px;
				border-radius: 6px;
				line-height: 40px;
				display: flex;
				margin: 16px 0px 4px;

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

			.logon-btn {
				border: 1px solid #a2a2a2;
				width: 100%;
				height: 40px;
				border-radius: 6px;
				margin-top: 20px;
				background-color: red;
				text-align: center;
				line-height: 40px;
				color: #fff;
			}

			.success-tips {
				width: 160px;
				height: 100px;
				background-color: rgba(0, 0, 0, 0.6);
				border-radius: 10px;
				color: #fff;
				line-height: 100px;
				text-align: center;
			}

			.gologin-btn {
				border-radius: 6px;
				margin-top: 20px;
				text-align: center;
				line-height: 40px;
			}
		}
	}
</style>