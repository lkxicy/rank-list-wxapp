<template>
	<view>
		<view class="status_bar">
			<!-- 这里是状态栏 -->
		</view>
		<view v-if="getcom==''" style="text-align:center;">暂无数据</view>
		<uni-list v-for="(n,index) in getcom" :key="index">
			<uni-list-item :title="n.singer + ' - ' +n.songName" :showArrow="false" :note="n.str">
				<template v-slot:right="">
					<view @click="change(n.str,n.songName,n.singer,n.commentID)">
						<image v-if="getComment(n.str,n.songName,n.singer)==false" style="width: 80rpx;height: 80rpx;" src="cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/评论未收藏.png"
						 mode="widthFix" />

						<image v-if="getComment(n.str,n.songName,n.singer)==true" style="width: 80rpx;height: 80rpx;" src="cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/评论收藏.png"
						 mode="widthFix" />

					</view>

				</template>
			</uni-list-item>
		</uni-list>
	</view>
</template>

<script>
	import uniList from "@/components/uni-list/uni-list.vue"
	import uniListItem from "@/components/uni-list-item/uni-list-item.vue"
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
		components: {
			uniList,
			uniListItem
		},
		data() {
			return {

			};
		},
		methods: {
			// 设置缓存
			setStorage(str, songName, singer, commentID) {

				// 收藏时，放入到缓存中，key是通过api获取的commentID 唯一
				wx.setStorage({
					key: String(commentID),
					data: {
						commentID: commentID,
						songName: songName,
						singer: singer,
						str: str,
					},
					success() {
						uni.showToast({
							title: '收藏成功',
							position: "center",
							icon: 'success',
							duration: 2000
						});
					},
					fail() {
						uni.showToast({
							title: '操作失败，请重试',
							position: "center",
							icon: 'none',
							duration: 2000
						});
					}
				})
			},

			// 取消收藏  并且从缓存中移除
			removeStorage(commentID) {
				wx.removeStorage({
					key: String(commentID),
					success() {
						uni.showToast({
							title: '取消收藏成功',
							position: "center",
							icon: 'success',
							duration: 2000
						});
					},
					fail() {
						uni.showToast({
							title: '操作失败，请重试',
							position: "center",
							icon: 'none',
							duration: 2000
						});
					}
				})
			},

			change(str, songName, singer, commentID) {
				// 点了收藏  也就是收藏库中还未收藏
				if (this.getComment(str, songName, singer) == false) {
					this.add(str, songName, singer, commentID);
					this.setStorage(str, songName, singer, commentID);
				} else {
					this.del(str, songName, singer, commentID);
					this.removeStorage(commentID);
				}

			},
			add(str, songName, singer, commentID) {
				this.$store.dispatch('addCom', {
					str,
					songName,
					singer,
					commentID
				});
			},
			del(str, songName, singer, commentID) {
				this.$store.dispatch("deleteCom", {
					str,
					songName,
					singer,
					commentID
				});
			},

			getComment(str, songName, singer) {
				let item;
				for (item in this.getcom) {
					// 在store中找得到的情况下
					if (this.getcom[item].songName == songName &&
						this.getcom[item].str == str &&
						this.getcom[item].singer == singer) {
						return true;
					}
				}
				return false;
			},

		},
		computed: {
			getcom() {
				return this.$store.getters.getCOM;
			}
		},
	}
</script>
<style scoped>

</style>
