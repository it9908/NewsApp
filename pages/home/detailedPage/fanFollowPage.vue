<template>
	<view class="container">
		<view class="tab_list">
			<view class="tab_btn" :class="{'borderBottom':flagFocus}" @click="SwitchFocus">关注</view>
			<view class="tab_btn" :class="{'borderBottom':flagFens}" @click="SwitchFans">粉丝</view>
		</view>
		<scroll-view scroll-y="true" ref="scrollView" @scrolltolower="flagFocus ? getConcernMore() : size += 10;getFens()"
		style="height: calc(100vh - 42px);">
			<!-- 关注列表 -->
			<view class="page1" v-if="flagFocus">
				<view v-for="(item, index) in listFocus" :key="index">
					<view class="page1-box">
						<u-swipe-action >
							<u-swipe-action-item 
								@click="openPopup(item.account_id)"
								:options="options1"
							>
								<view class="swipe-action u-border-top u-border-bottom">
									<view class="swipe-action__content">
										<image :src="item.avatar"></image>
										<p class="swipe-action__content__text">{{item.account}}</p>
									</view>
								</view>
							</u-swipe-action-item>
						</u-swipe-action>
					</view>
				</view>
			</view>
			<!-- 粉丝列表 -->
			<view class="page2" v-if="flagFens">
				<view class="page2-box" v-for="item in listFens" :key="item.accound_id">
					<image :src="item.avatar"></image>
					<p class="text-overflow: ellipsis;white-space: nowrap;">{{item.account}}</p>
				</view>
			</view>
		</scroll-view>
		
		
		<!-- 删除提示 -->
		<u-modal
		width="260px"
		:show="showUmodal" 
		:title="title" 
		:content="content"
		:confirmText="confirmText" 
		:cancelText="cancelText" 
		@confirm="delConcern()"
		@cancel="showUmodal = false"
		showCancelButton> 
		</u-modal>
		
		<u-toast ref="uToast"></u-toast>
		
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
				
				errorTips:[
					{
						type: 'success',
						message: "删除成功",
						iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/error.png',
						duration: 700
					},
				],
				
				
				showUmodal: false, //按钮模态框状态
				title: '删除提示', //标题内容
				content: '确定要删除他吗?', //模态框内容
				confirmText: '确认', //确认按钮的文字
				cancelText: '取消', //取消按钮的文字
				

				user_id: null,

				token: '',
				flagFens: false, //粉丝页状态
				flagFocus: false, //关注页状态
				options1: [{
					text: '删除'
				}],
				listFocus: [], //关注
				listFens: [], //粉丝
				page:1, 
				size:10,
			};
		},
		onLoad(option) {
			this.token = uni.getStorageSync('token');
			if (option.page == 0) {
				this.flagFocus = true;
			} else if (option.page == 1) {
				this.flagFens = true;
			}
			this.getConcern();
			this.getFens();

		},
		methods: {
			//
			openPopup(userId) {
				this.showUmodal = true;
				this.user_id = userId;
			},
			cancellationEvent() {
				this.flagIsbtns = false;
			},
			//删除关注
			delConcern() {
				const url = `http://172.16.222.16:91/api/fans/foucsAction`;
				httpRequest(url, "POST", this.token, {
					foucs_account_id: this.user_id,
					action: 2
				}, (_res) => {
					if (_res.data.code === 200) {
						this.showUmodal = false;
						this.$refs.uToast.show(this.errorTips[0]);
					}
					this.getConcern();
				});
			},
			//获取更多关注
			getConcernMore(){
				this.size += 10;
				this.getConcern();
			},
			//获取关注
			getConcern() {
				const url = `http://172.16.222.16:91/api/fans/getFoucsList/${this.page}/${this.size}`;
				httpRequest(url, "GET", this.token, null, (_res) => {
					this.listFocus = _res.data.data.rows;
				});
			},
			//获取粉丝
			getFens() {
				const url = `http://172.16.222.16:91/api/fans/getMyList/${this.page}/${this.size}`;
				httpRequest(url, "GET", this.token, null, (_res) => {
					this.listFens = _res.data.data.rows;
				});
			},
			//切换粉丝页面
			SwitchFans() {
				this.getFens();
				this.flagFens = true
				this.flagFocus = false

			},
			//切换粉丝页面
			SwitchFocus() {
				this.getConcern();
				this.flagFens = false
				this.flagFocus = true
			}
		}
	}
</script>

<style lang="scss">
	.borderBottom {
		border-bottom: 2px solid #FF0000;
	}

	.u-page {
		padding: 0;
	}

	.u-demo-block__title {}

	.swipe-action {
		border: none;

		&__content {
			display: flex;
			padding: 0rpx 0;

			image {
				width: 60px;
				height: 60px;
				border-radius: 50%;
			}

			&__text {
				width: 200px;
				margin-left: 20px;
				line-height: 50px;
				font-size: 16px;
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
				color: $u-main-color;
			}
		}
	}

	.container {
		background-color: #fff;

		.tab_list {
			width: 100%;
			height: 42px;
			background-color: #ffffff;
			display: grid;
			grid-template-columns: 1fr 1fr;

			.tab_btn {
				text-align: center;
				height: 40px;
				line-height: 40px;
			}
		}

		.page1,
		.page2 {
			padding: 0px 10px;
		}

		.page1 {
			.page1-box {
				padding: 20px 0px;
				border-bottom: 1px solid #a2a3a4;
			}
		}

		.page2 {

			.page2-box {
				display: flex;
				padding: 20px 0px;
				border-bottom: 1px solid #a2a3a4;

				image {
					width: 60px;
					height: 60px;
					border-radius: 50%;
				}

				p {
					line-height: 60px;
					font-size: 16px;
					margin-left: 18px;
				}
			}

		}



	}
</style>