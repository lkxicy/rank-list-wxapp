<template>
	<view>

		<view class="container999" @touchstart="refreshStart" @touchmove="refreshMove" @touchend="refreshEnd">

			<!-- 刷新组件需搭配scroll-view使用，并在pages.json中添加 "disableScroll":true-->
			<refresh ref="refresh" @isRefresh='isRefresh'></refresh>
			<view class='nav'>
				<!-- 导航栏 agents导航栏标题 -->
				<navTab ref="navTab" :tabTitle="tabTitle" @changeTab='changeTab'></navTab>
			</view>

			<!-- swiper切换 swiper-item表示一页 scroll-view表示滚动视窗 -->
			<swiper style="min-height: 100vh;" :current="currentTab" @change="swiperTab">
				<swiper-item v-for="(listItem,listIndex) in list" :key="listIndex">
					<scroll-view style="height: 100%;" scroll-y="true" @scrolltolower="lower1" scroll-with-animation :scroll-into-view="toView">
						<view class='content'>
							<view class="img">
								<image src="cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/排行榜背景.jpg" style="width: 100%;height: 420rpx;" />
								<view class="text2">{{date[currentTab] | convertTime('YYYY-MM-DD')}} 更新</view>
							</view>
							<uni-list v-for="(n,index) in listItem" v-if="listItem.length>0"  :key="index">
								<uni-list-item :title="(index+1) +' '+ n.music" :show-arrow="false"></uni-list-item>
							</uni-list>
							<view class='noCard' v-if="listItem.length===0">
								暂无信息
							</view>
						</view>
					</scroll-view>
				</swiper-item>
			</swiper>
		</view>
	</view>
</template>

<script>
	const util = require('../../util/util.js');
	import uniRequest from 'uni-request';
	import refresh from '../../components/refresh.vue';
	import navTab from '../../components/navTab.vue';
	import uniList from "@/components/uni-list/uni-list.vue";
	import uniListItem from "@/components/uni-list-item/uni-list-item.vue";
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
			refresh,
			navTab,
			uniList,
			uniListItem
		},
		data() {
			return {
				date: [], // 排行榜更新日期
				currentPage: 'index',
				toView: '', //回到顶部id
				tabTitle: ['网易云音乐TOP200', '酷狗音乐TOP100', 'QQ音乐TOP300'], //导航栏格式 --导航栏组件
				currentTab: 0, //sweiper所在页
				pages: [1, 1, 1], //第几个swiper的第几页
				list: [
					[],
					[],
					[],
				],
				neMusic:[
					[],[],[],[],[],[],[],[],[],[],[],[],[]
				],
				kgMusic:[
					[],[],[],[],[],[]
				],
				qqMusic:[
					[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]
				],
			};
		},
		// 这里需要优化一下   一开始只取一部分数据  而后触发下拉加载函数再获取其余的
		onReady() {
			uni.showLoading({
				title: '玩命加载中...'
			});
			// 获取网易云数据
			uniRequest
				.get("https://musicapi.leanapp.cn/top/list?idx=1")
				.then(res => {
					let k=0;  // 用于下面判断15个为一组
					let updateTime = res.data.playlist.updateTime; //更新时间
					let time = new Date(updateTime); // 时间戳转化为普通时间
					this.date[0] = time; // 避免抢占  防止出错
					let ne_singers = "";
					//两种输出形式  一种单人  一种多人
					for (let i = 0; i < res.data.playlist.tracks.length; i++) {
						// 多人输出形式   singer1、singer2、... - song
						if (res.data.playlist.tracks[i].ar.length > 1) {
							for (var j = 0; j < res.data.playlist.tracks[i].ar.length; j++) {
								ne_singers += res.data.playlist.tracks[i].ar[j].name;
								if (j != res.data.playlist.tracks[i].ar.length - 1) {
									ne_singers += "、";
								}
							}
							let str1 = ne_singers + " - " + res.data.playlist.tracks[i].name;
							
							if(i<15){
								this.list[0].push({
									music: str1,
									belong: 'ne'
								});
							}
							else{
								if(i%15==0&&i!=15){
									k++;
								}
								this.neMusic[k].push({
									music: str1,
									belong: 'ne'
								});
							}							
							
							
							j = 0;
							ne_singers = "";
						}
						//单人输出形式    singer - song
						else {
							let str2 =
								res.data.playlist.tracks[i].ar[0].name +
								" - " +
								res.data.playlist.tracks[i].name;
								
							if(i<15){
								this.list[0].push({
									music: str2,
									belong: 'ne'
								});
							}
							else{
								if(i%15==0&&i!=15){
									k++;
								}
								this.neMusic[k].push({
									music: str2,
									belong: 'ne'
								});
							}		
						}
					}

				})
				.catch(err => {
					uni.hideLoading();
					uni.showToast({
						title: '网易云数据获取出错，请刷新再试',
						position: "bottom",
						icon: 'none',
						duration: 2000
					});

				});

			// 获取酷狗数据
			this.getKgmusic();


			// 获取QQ音乐数据
			uniRequest
				.get(
					"https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg?page=detail&tpl=macv4&type=top&topid=26&g_tk=5381&loginUin=0&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=0"
				)
				.then(res => {
					let k=0;
					let updateTime = res.data.update_time; //更新时间
					this.date[2] = updateTime;

					let qq_singers = "";
					//两种输出形式  一种单人  一种多人
					for (let i = 0; i < res.data.songlist.length; i++) {
						// 多人输出形式   singer1、singer2、... - song
						if (res.data.songlist[i].data.singer.length > 1) {
							for (var j = 0; j < res.data.songlist[i].data.singer.length; j++) {
								qq_singers += res.data.songlist[i].data.singer[j].name;
								if (j != res.data.songlist[i].data.singer.length - 1) {
									qq_singers += "、";
								}
							}
							let str1 = qq_singers + " - " + res.data.songlist[i].data.songname;
							
							if(i<15){
								this.list[2].push({
									music: str1,
									belong: 'qq'
								});
							}
							else{
								if(i%15==0&&i!=15){
									k++;
								}
								this.qqMusic[k].push({
									music: str1,
									belong: 'qq'
								});
							}	
							
							j = 0;
							qq_singers = "";
						}
						//单人输出形式    singer - song
						else {
							let str2 =
								res.data.songlist[i].data.singer[0].name +
								" - " +
								res.data.songlist[i].data.songname;
								
								if(i<15){
									this.list[2].push({
										music: str2,
										belong: 'qq'
									});
								}
								else{
									if(i%15==0&&i!=15){
										k++;
									}
									this.qqMusic[k].push({
										music: str2,
										belong: 'qq'
									});
								}	
								
						}
					}
				})
				.catch(err => {
					uni.hideLoading();
					uni.showToast({
						title: 'QQ音乐数据获取出错，请刷新再试',
						position: "bottom",
						icon: 'none',
						duration: 2000
					});

				});

			// 加一个东西   以防用户在渲染的时候操作  造成卡顿   解决卡顿问题的终极办法还是优化获取数据的量
			setTimeout(() => {
				uni.hideLoading();
			}, 3000)

		},
		onLoad(e) {

		},
		onShow() {},
		onHide() {},
		methods: {
			// 把获取酷狗排行榜的数据封装了起来  用了云函数请求http  
			getKgmusic() {
				let k=0;
				wx.cloud.init();
				wx.cloud.callFunction({
						name: 'music',
						data: {
							'url': 'http://mobilecdnbj.kugou.com/api/v3/rank/song?version=9108&ranktype=3&plat=0&pagesize=100&area_code=5&page=0&volid=40709&rankid=8888&with_res_tag=2'
						}
					})
					.then(res => {
						let updateTime = JSON.parse(res.result).data.timestamp * 1000; //更新时间
						let time = new Date(updateTime); // 时间戳转化为普通时间
						this.date[1] = time;

						// 由于API已经集成到一起了  所以只需要一种输出形式
						for (let i = 0; i < JSON.parse(res.result).data.info.length; i++) {
							
							if(i<15){
								this.list[1].push({
									music: JSON.parse(res.result).data.info[i].filename,
									belong: 'kg'
								});
							}
							else{
								if(i%15==0&&i!=15){
									k++;
								}
								this.kgMusic[k].push({
									music: JSON.parse(res.result).data.info[i].filename,
									belong: 'kg'
								});
							}	
						}
						

					})
					.catch(err => {
						uni.hideLoading();
						uni.showToast({
							title: '酷狗数据获取出错，请刷新再试',
							position: "bottom",
							icon: 'none',
							duration: 2000
						});

					});
			},

			toTop() {
				this.toView = ''
				setTimeout(() => {
					this.toView = 'top' + this.currentTab
				}, 10)
			},
			changeTab(index) {
				this.currentTab = index;
			},
			// 其他请求事件 当然刷新和其他请求可以写一起 多一层判断。
			isRequest() {
				return new Promise((resolve, reject) => {
					this.pages[this.currentTab]++
					var that = this
					setTimeout(() => {
						uni.hideLoading()
						uni.showToast({
							icon: 'success',
							title: `加载成功`
						})
						
						if(this.currentTab==0){
							if(this.pages[0]-1==this.neMusic.length){
								uni.showToast({
									icon: 'none',
									title: `没有更多了`
								})
							}
							else{
								resolve(this.neMusic[this.pages[0]-2]);
							}
						}
						
						else if(this.currentTab==1){
							if(this.pages[1]-1==this.kgMusic.length){
								uni.showToast({
									icon: 'none',
									title: `没有更多了`
								})
							}
							resolve(this.kgMusic[this.pages[1]-2]);
						}
						
						else if(this.currentTab==2){
							if(this.pages[2]-1==this.qqMusic.length){
								uni.showToast({
									icon: 'none',
									title: `没有更多了`
								})
							}
							resolve(this.qqMusic[this.pages[2]-2]);
						}

					}, 1000)
				})
			},
			// swiper 滑动
			swiperTab: function(e) {
				var index = e.detail.current //获取索引
				this.$refs.navTab.longClick(index);
			},
			// 加载更多 util.throttle为防抖函数
			lower1: util.throttle(function(e) {
				uni.showLoading({
					title: '加载中',
					mask: true
				})
				this.isRequest().then((res) => {
					let tempList = this.list
					tempList[this.currentTab] = tempList[this.currentTab].concat(res)
					this.list = tempList
					this.$forceUpdate() //二维数组，开启强制渲染
				})
			}, 300),
			// 刷新touch监听
			refreshStart(e) {
				this.$refs.refresh.refreshStart(e);
			},
			refreshMove(e) {
				this.$refs.refresh.refreshMove(e);
			},
			refreshEnd(e) {
				this.$refs.refresh.refreshEnd(e);
			},
			isRefresh() {
				setTimeout(() => {
					uni.showToast({
						icon: 'success',
						title: '刷新成功'
					})
					this.$refs.refresh.endAfter() //刷新结束调用
				}, 1000)
			}
		}
	};
</script>

<style lang="scss">
	.img {
		position: relative;
		width: 100%;
		height: 420rpx;
	}

	.img .text2 {
		position: absolute;
		font-size: 32rpx;
		left: 40rpx;
		bottom: 0;
		height: 60rpx;
		color: #aaa;
	}

	.container999 {
		width: 100vw;
		font-size: 28upx;
		min-height: 100vh;
		overflow: hidden;
		color: #6B8082;
		position: relative;
		background-color: #f6f6f6;
	}

	.content {
		width: 100%;
	}

	.card {
		width: 90%;
		height: 368upx;
		background-color: white;
		margin: 0 auto 42upx auto;
		background: #FFFFFF;
		box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.10);
		border-radius: 5px;
		position: relative;
	}

	.noCard {
		width: 90%;
		height: 200upx;
		margin: auto;
		background-color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #999999;
		box-shadow: 0 0 10upx 0 rgba(0, 0, 0, 0.10);
		border-radius: 10upx;
	}


	.nav {
		position: fixed;
		left: 0;
		top: 0;
		color: white;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
		font-size: 24upx;
		background-color: #50B7EA;
		z-index: 996;
	}

	.searchInput999 {
		width: 90%;
		margin: 0 auto;
		background: white;
		border-radius: 30upx;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 56upx;
	}

	.search999 {
		width: 32upx;
		height: 32upx;
	}

	.searchBox999 {
		width: 56upx;
		height: 56upx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.input999 {
		color: #999;
		width: 80%;
	}
</style>
