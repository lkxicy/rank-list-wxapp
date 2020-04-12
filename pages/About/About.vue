<template>

	<view class="About">
		<!-- 提示添加到 我的小程序  -->
		<show-tips></show-tips>

		<view class="status_bar">
			<!-- 这里是状态栏 -->
		</view>
		<view class="round">
			<view class="LOGO">
				<image src="cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/LOGO.png" mode="widthFix" class="logo"></image>
			</view>
			
			<view class="tex">南梦神评论 v1.0.0</view>
		</view>
		

		<view class="btn">
			<uni-list v-for="(n,index) in list" :key="index">
				<uni-list-item v-if="n.link!=''" :title="n.title" :thumb="n.src" @click="urlgo(n.link)"></uni-list-item>
				<!-- <uni-list-item v-if="n.title=='分享'" :title="n.title" :thumb="n.src"><button  open-type="share"></button></uni-list-item> -->
				<uni-list-item v-if="n.title=='赞赏支持'" :title="n.title" :thumb="n.src" @click="previewImage()"></uni-list-item>
				<button open-type="share"></button>
			</uni-list>
		</view>

		<view class="down">谁能有幸，错付终生</view>
	</view>
</template>

<script>
	import showTips from '../../components/redflower-showTips/redflower-showTips.vue'
	import uniList from "@/components/uni-list/uni-list.vue"
	import uniListItem from "@/components/uni-list-item/uni-list-item.vue"
	components: {
		uniList,
		uniListItem,
		showTips
	}
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
				list: [{
						title: '评论收藏',
						src: 'cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/评论收藏.png',
						link: '../ComCollect/ComCollect'
					},
					// {title:'排行榜收藏',src:'../../static/img/收藏.png',link:'../MicCollect/MicCollect'},
					{
						title: '分享',
						src: 'cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/分享.png',
						link: ''
						
					},
					{
						title: '赞赏支持',
						src: 'cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/点赞.png',
						link: ''
					},
					{
						title: '关于',
						src: 'cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/关于.png',
						link: '../Details/Details'
					}
				]
			};
		},
		methods: {
			
			urlgo(link) {
				uni.navigateTo({
					url: link
				});
			},
			
			// 预览图片
			previewImage() {
			    wx.previewImage({
			      urls: ['cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/赞赏.jpg'],
			    });
			  },
		}
	};
</script>
<style scoped>
	.About .round {
		margin-left: 0;
		margin-right: 0;
		background-color: #E7EDE5;
		width: 100%;
		height: 500rpx;
		border-radius: 0rpx 0rpx 300rpx 300rpx;
	}

	.About .round .tex {
		text-align: center;
	}
	
	.About .LOGO{
		padding-top: 200rpx;
		text-align: center;
	}
	
	.About .LOGO .logo{
		height: 150rpx;
		width: 150rpx;
		border-radius: 50%;
	}


	.About .down {
		position: fixed;
		font-size: 26rpx;
		bottom: 2%;
		left: 0;
		width: 100%;
		text-align: center;
		color: #808080;
	}
</style>
