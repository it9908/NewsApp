<template>
	<!-- 分享组件 -->
	<view>
		<view class="container">
			<u-row>
				<u-col span="3" align="center">
					<image src="../static/images/Applications/weixin.png"></image>
					<view>微信</view>
				</u-col>
				<u-col span="3" align="center">
					<image src="../static/images/Applications/pyq.png"></image>
					<view>朋友圈</view>
				</u-col>
				<u-col span="3" align="center">
					<image src="../static/images/Applications/qq.png"></image>
					<view>QQ</view>
				</u-col>
				<u-col span="3" align="center">
					<image src="../static/images/Applications/douyin.png"></image>
					<view>抖音</view>
				</u-col>
			</u-row>
			<view class="close" @click="closePopup">
				取消
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "share",
		methods:{
			//自定义事件、关闭分享页，然后在父组件中监听
			closePopup() {
				this.$emit('flag-share');
			},
		}
	}
</script>

<style lang="scss">
	.container {
		.u-row {
			padding: 16px 0px;

			.u-col {
				image {
					width: 50px;
					height: 50px;
					margin-bottom: 8px;
				}
			}
		}

		.close {
			font-size: 16px;
			color: #fff;
			background: #c7ecee;
			line-height: 46px;
			text-align: center;
		}
	}
</style>