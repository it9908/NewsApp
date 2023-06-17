<template>
	<view class="container">
		<view class="container_box1">
			<view class="ipt_bpx">
				<image src="/static/images/xiugaimima.png"></image>
				<input type="password" placeholder="旧密码" v-model="formData.passwordOld">
			</view>
			<view class="ipt_bpx">
				<image src="/static/images/xiugaimima.png"></image>
				<input type="password" placeholder="新密码" @blur="tipErrorPwd()" v-model="formData.passwordNew">
			</view>
			<view class="tips-txt" v-if="errorPwd">
				*密码要包含数字字母大写或小写
			</view>
			<view class="ipt_bpx">
				<image src="/static/images/xiugaimima.png"></image>
				<input type="password" placeholder="重复新密码" @blur="duplicateVerificationPassword()"
				v-model="formData.prtPasswrod">
			</view>
			<view class="tips-txt" v-if="errorRepeatPwd">
				*重复密码不正确
			</view>
			<view class="confirm_btn" @click="UpdatePassWord()">
				确认修改
			</view>
		</view>
		<u-modal :show="show" :content='content' 
		@confirm="UpdatePassWord() ? goLoginPage() : show = false" 
		width="220px" 
		style="text-align: center;font-size: 18px;"></u-modal>
	</view>
</template>

<script>
	import {
		httpRequest,goLogin
	} from '@/utils/request.js';
	export default {
		data() {
			return {
				content:'修改成功',
				show:false,
				formData: {
					passwordOld: '', //旧密码
					passwordNew: '', //新密码
					prtPasswrod: '', //重复新密码
				},
				errorPwd: false, //提示密码格式错误
				errorRepeatPwd: false, //提示重复密码错误
			};
		},
		computed: {
			//验证新新密码格式
			newPassWordVerification() {
				const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;
				return regex.test(this.formData.passwordNew);
			},
			//验证重复密码
			petPwd() {
				return this.formData.passwordNew === this.formData.prtPasswrod;
			}
		},
		methods: {
			//前往登录页
			goLoginPage(){
				goLogin();
			},
			//验证密码重复
			duplicateVerificationPassword(){
				if(!this.petPwd){
					this.errorRepeatPwd = true;
					return;
				}
				this.errorRepeatPwd = false;
				return true;
			},
			//提示密码格式
			tipErrorPwd() {
				if (this.newPassWordVerification) {
					//格式正确则隐藏提示，相反。。
					this.errorPwd = false;
				} else {
					this.errorPwd = true;
				}
			},
			
			//修改密码
			UpdatePassWord() {
				//验证密码格式
				if(this.newPassWordVerification === false || this.petPwd === false){
					this.show = true;
					this.content = "修改失败";
					return false;
				}
				const token = uni.getStorageSync('token');
				const url = `http://172.16.222.16:91/api/account/modifyPassword`;
				httpRequest(url, "POST", token, this.formData, (_res) => {
					console.log(_res.data.code);
					if (_res.data.code === 200) {
						this.show = true;
						this.content = "修改成功";
					}
				});
				return true;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.tips-txt{
		color: #ff0000;
		font-size: 0.625rem;
	}
	.container {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 80px 48px 0px;

		.container_box1 {
			width: 100%;
			.ipt_bpx {
				display: flex;
				border: 1px solid #a2a2a2;
				width: 100%;
				height: 40px;
				border-radius: 6px;
				margin-top: 30px;


				image {
					width: 30px;
					height: 30px;
					margin: 5px 8px 0px;
				}

				input {
					line-height: 40px;
					flex: 1;
					height: 40px;
				}
			}

			.confirm_btn {
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
		}
	}
</style>