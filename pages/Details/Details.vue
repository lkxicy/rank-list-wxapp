<template>
	<view>
		<view class="title">
			<text >❏ 关于本小程序</text>
		</view>
		
		<text class="normal">◆ 若遭遇BUG，可点击右上角三个点重新进入小程序\n\n</text>
		<text class="normal">◆ 开发者邮箱：lkx_icy@qq.com\n\n</text>
		<text class="normal">◆ 如果有好的建议的话，还望不吝赐教\n\n</text>
		<text class="normal">◆ 由于本小程序收藏系统是用本地缓存的，所以当微信缓存被清除时您的收藏会一并消失，见谅\n\n</text>
		<text class="normal">◆ 部分图片资源源自网络，如侵权请邮箱联系删除</text>
		
	</view>
</template>

<script>
	export default {
		onShareAppMessage(res) {
		    if (res.from === 'button') {// 来自页面内分享按钮
		      // console.log(res.target)
		    }
		    return {
		      title: '南梦神评论',
		      path: '/pages/Home/Home',
			  imageUrl:'cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/LOGO.png',
		    }
		  },
		data() {
			return {
				
			}
		},
		methods: {
			
		}
	}
</script>

<style>
	page{
		background-color: #f3f9f1;
	}
	.title{
	  font-weight: 700;
	  font-size: 38rpx;
	  color: #aa5500;
	  margin-bottom: 20rpx;
	}
	.normal{
		font-size: 28rpx;
		color:#424c50;
	}

</style>
