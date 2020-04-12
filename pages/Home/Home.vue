<template>
	<view class="comment">

		<view class="status_bar">
			<!-- 这里是状态栏 -->
		</view>

		<view class="title">
			<view class="album-url">
				<image :src="alPUrl[index-1]" style="height: 110rpx; width: 110rpx;" />
			</view>
			{{singer[index-1]}} - {{songName[index-1]}}
			<br />
			<view class="album">《{{album[index-1]}}》</view>
		</view>

		<view @click="this.change(this.str[this.index-1],this.songName[this.index-1],this.singer[this.index-1]),this.commentID[this.index-1];">
			<image v-if="this.getComment()==false" src="cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/评论未收藏.png"
			 style="height: 96rpx; width: 96rpx;" />
			<image v-if="this.getComment()==true" src="cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/评论收藏.png"
			 style="height: 96rpx; width: 96rpx;" />
		</view>

		<view class="box-left">
			<view class="content">{{lysic[index-1] | isMusic()}}</view>
		</view>

		<view class="line"></view>

		<view class="box-right">
			<view class="speaker">
				<image :src="userPUrl[index-1]" style="height: 70rpx; width: 70rpx;" class="photo" />
				{{pName[index-1]}}
			</view>
			<view class="like">{{like[index-1]}}人喜欢</view>
			<view v-if="turn==true" class="content">{{output(fix(sort_out(str[index-1])))}}</view>
			<view v-if="turn==false" class="content" style="text-align: center;">{{str[index-1]}}</view>

			<switchc class="switch" text="竖|横" :sid="0" @change="this.turn=!this.turn"></switchc>
		</view>


		<view class="btn">
			<image class="mplayer" src="cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/上一首.png" @click="beforeMusic()"
			 style="margin-right:15%;height: 90rpx; width: 90rpx;">

				<image v-show="playing==false" class="mplayer" src="cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/播放.png"
				 @click="playMusic()" style="margin-right:15%;height: 90rpx; width: 90rpx;">
					<image v-show="playing==true" class="mplayer" src="cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/暂停.png"
					 @click="stopMusic()" style="margin-right:15%;height: 90rpx; width: 90rpx;">

						<image class="mplayer" src="cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/下一首.png" @click="laterMusic(0);"
						 style="margin-right:10%;height: 90rpx; width: 90rpx;">

							<image class="mplayer" src="cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/歌单.png" @click="Show()"
							 style="height: 90rpx; width: 90rpx;">
		</view>



		<!-- 下方菜单 -->
		<popup-layer ref="popup" direction="top" v-model="boolShow">
			<view style="height: 400rpx;overflow-y: scroll;">
				<uni-list v-for="(song,index) in songName" :key="index">
					<uni-list-item v-if="index!=0" @click="selectMusic(index)" :title="mixup(singer[index],song) | tooLong()"
					 :show-arrow="false" style="text-align: center;"></uni-list-item>
				</uni-list>
			</view>
		</popup-layer>
	</view>
</template>

<script>
	import switchc from '@/components/zz-switchc/zz-switchc.vue';
	import uniPopup from "@/components/uni-popup/uni-popup.vue";
	import popupLayer from '../../components/popup-layer.vue';
	import uniRequest from 'uni-request';
	const bgAudioMannager = uni.getBackgroundAudioManager(); // 用于播放背景音乐的对象
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
			uniPopup,
			popupLayer,
			switchc
		},
		data() {
			return {
				playing: false, // 判断是否正在播放

				turn: true, // 默认是竖型展开评论

				boolShow: false, // 控制显示下拉列表
				loading: false, // 用于判断是否正在获取API数据  防止出现BUG

				sheet: [], //歌单ID数组  保存歌单   仅用于nextMusic()
				songID: [], // 歌曲的ID号数组，用于获取以下的信息  数组的作用是返回上一首歌曲和前进
				playUrl: "", // 可播放的歌曲链接
				index: 1, // 现在用户所浏览的所在位置
				id: "", // 用于暂存歌曲的ID
				sheetID: "", // 用于暂存歌单的ID


				commentID: ['1'],
				str: ["一叶轻船 一双人倚揽 一曲烟雨行舟太缓慢"], // 原评论主体
				like: ["23333"], //点赞数
				pName: ["icy"], //评论人用户名
				userPUrl: ["cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/头像.png"], //评论人的头像

				alPUrl: ["cloud://comments-list-zrh75.636f-comments-list-zrh75-1301638370/图片资源/专辑.jpg"], //专辑封面图
				songName: ["烟雨行舟"], //歌名
				singer: ["司南"], //歌手名字
				album: ["烟雨行舟"], //专辑名称

				flag: true, // true的时候继续递归   false是递归结束的标志
				num: 0, // 设置递归极限次数  若递归 5 次都没有找到  可能出现意料之外的BUG   需要暂停递归并显示错误信息

				popupVisible: false,

				// 歌词部分  在连接不上API的时候显示以下的歌词
				lysic: [
					`
 烟雨行舟
 
 
 作词：Bye【清禾音社】
 
 作曲：Bye【清禾音社】
 
 编曲：Bye【清禾音社】
 
 画手：瑶池（逸恋仙居）
 
 美工P***浮
 
 混音：MR鱼
 
 母带：MR曾经
 
 演唱：伦桑
 
 
 翻唱：司南
 
 后期：Mr.鱼
 
 海报：佩奇
 
 
 烟雨入江南
 
 山水如墨染
 
 宛若丹青未干
 
 提笔然 点欲穿
 
 
 行舟临秀川
 
 画鷁推清澜
 
 缱绻怡然
 
 
 天色沉靛蓝
 
 波光似锦缎
 
 缀着零星白帆
 
 诗情满 千卷难
 

 渔舟齐桅杆
 
 鸳鸯凭舷栏
 
 琴瑟相伴
 
 
 一叶轻船
 
 一双桨悠懒
 
 一绵江风微拂素罗衫
 
 渔火点点聚散
 
 欸乃声声浅淡
 
 天近晚
 
 炊烟袅飘沿斑
 
 
 一叶轻船
 
 一双人倚揽
 
 一曲烟雨行舟太缓慢
 
 执手相看
 
 把酒当歌言欢
 
 红尘路漫漫
 
 愿今生与你共览
 
 
 暮霭渐褪暗
 
 胭脂余味淡
 
 我支着竹绢伞
 
 你闲摆花团扇
 
 
 浪儿晃曳慢
 
 夜垂云流缓
 
 且吟且谈
 
 
 一叶轻船
 
 一双桨悠懒
 
 一绵江风微拂素罗衫
 
 渔火点点聚散
 
 欸乃声声浅淡
 
 天近晚
 
 炊烟袅飘沿斑

 
 一叶轻船
 
 一双人倚揽
 
 一曲烟雨行舟太缓慢
 
 执手相看
 
 把酒当歌言欢
 
 红尘路漫漫
 
 欲今生与你共览
 
 
 一叶轻船
 
 一双月对半
 
 一帘清梦幽幽醉阑珊
 
 移舟靠岸
 
 案前惟剩空盏
 
 莫怨良辰短
 
 曲终了韵意未完
 
 `
				]
			};
		},
		// 获取数据，且判断数据的合法性，若数据不合法则需要重新获取
		// 异步请求不能用for循环   需要用递归   for会一瞬间把全部循环给循环掉
		onReady() {
			this.getStorage();
			this.nextMusic(0);
		},
		computed: {
			getcom() {
				return this.$store.getters.getCOM;
			}
		},
		methods: {
			// 把缓存中的数据拉到vuex中
			getStorage() {
				var keys = [];
				try {
					const res = wx.getStorageInfoSync()
					for (let i = 0; i < res.keys.length - 1; i++) {
						keys[i] = res.keys[i];
					}
				} catch (e) {

				}


				for (let item in keys) {
					try {
						var res = wx.getStorageSync(keys[item])
						if (res) {
							this.add(res.str, res.songName, res.singer, res.commentID);
						}
					} catch (err) {

					}
				}

			},

			// 设置缓存
			setStorage() {

				// 收藏时，放入到缓存中，key是通过api获取的commentID 唯一
				wx.setStorage({
					key: String(this.commentID[this.index - 1]),
					data: {
						commentID: this.commentID[this.index - 1],
						songName: this.songName[this.index - 1],
						singer: this.singer[this.index - 1],
						str: this.str[this.index - 1],
					},
					success() {
						uni.showToast({
							title: '收藏成功',
							position: "center",
							icon: 'success',
							duration: 2000
						});
					},
					fail(err) {
						// console.log(err)
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
			removeStorage() {
				wx.removeStorage({
					key: String(this.commentID[this.index - 1]),
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

			// 播放歌曲
			playMusic() {
				bgAudioMannager.title = this.songName[this.index - 1];
				bgAudioMannager.singer = this.singer[this.index - 1];
				bgAudioMannager.coverImgUrl = this.alPUrl[this.index - 1];
				bgAudioMannager.src = 'https://music.163.com/song/media/outer/url?id=' + this.songID[this.index - 1] + '.mp3';
				bgAudioMannager.play();
				this.playing = true;
			},

			// 停止播放歌曲  识别到
			stopMusic() {
				bgAudioMannager.pause();
				this.playing = false;
			},

			// 操作弹窗的函数
			Open() {
				this.$refs.popup.open();
			},
			Show() {
				this.$refs.popup.show();
			},
			Close() {
				this.$refs.popup.close();
			},


			getComment() {
				let item;
				// 收藏库中有该评论
				for (item in this.getcom) {
					if (this.getcom[item].songName == this.songName[this.index - 1] &&
						this.getcom[item].str == this.str[this.index - 1] &&
						this.getcom[item].singer == this.singer[this.index - 1]) {
						return true;
					}
				}
				return false;
			},
			// 操作歌曲的函数
			change(str, songName, singer, commentID) {
				// 点了收藏  也就是收藏库中还未收藏
				if (this.getComment() == false) {
					this.add(str, songName, singer, commentID);
					this.setStorage();
				} else {
					this.del(str, songName, singer, commentID);
					this.removeStorage();
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

			// 把歌手名字和歌曲名字糅合
			mixup(sing, song) {
				return sing + ' - ' + song;
			},

			// 上一首歌曲
			beforeMusic() {
				if (this.loading == false) {
					// 大于1即表示有上一首歌曲  显示上一首歌曲的信息
					if (this.index > 2) {
						this.index--;
					}
					// 没有上一首歌曲   弹出错误信息
					else {
						uni.showToast({
							title: '没有上一首啦！',
							position: "center",
							icon: 'none',
							duration: 2000
						});
					}
				}
			},

			// 下一首歌曲  若不在数组末尾则往下移动数组显示   若在数组末尾则调用nextMusic()
			laterMusic(num) {
				if (this.loading == false) {
					// 随便取一个数据的长度  判断在不在末尾
					// 不在末尾的情况
					if (this.index < this.singer.length) {
						this.index++;
					} else {
						// 在没有获取中的状态下才调用函数获取下一曲  不然会出现BUG

						this.nextMusic(num);


					}
				}
			},

			// 在下拉菜单中寻找历史记录的歌曲  这个是点击事件
			selectMusic(ind) {
				this.index = ind + 1;
				this.Close();
			},


			// 先调用获取热门歌单的API  获取热门歌单的ID  再调用从歌单中随机获取一首歌曲的API   再获取这首歌曲的ID   用于下面的操作
			nextMusic(num) {
				this.loading = true;
				uni.showLoading({
					title: '玩命加载中...'
				});

				// 先获取热门歌单ID
				uniRequest
					.get("https://musicapi.leanapp.cn/personalized")
					.then(res => {
						// 先把30个歌单的ID全部存进一个数组
						for (let i = 0; i < res.data.result.length; i++) {
							this.sheet.push(res.data.result[i].id);
						}

						// 随机获取一个ID  0-29
						let ran = parseInt(Math.random() * 29);
						this.sheetID = parseInt(this.sheet[ran]); // 这里的sheetID是歌单ID
						return uniRequest.get(
							"https://api.uomg.com/api/rand.music?mid=" +
							this.sheetID +
							"&format=json"
						);
					})
					.then(res => {
						this.playUrl = res.data.data.url;
						let id1 = this.playUrl.split(/[id=*]/);
						this.id = id1[id1.length - 1]; // 这里的ID是歌曲ID
						// this.songID.push(String(this.id));  之前因为这里用push导致会出现评论和歌曲不同步的情况
						this.songID[this.index] = String(this.id);
						return uniRequest.get(
							"https://musicapi.leanapp.cn/comment/music?id=" + this.id + "&limit=1"
						);
					})
					.then(res => {
						if (res.data.code == "-460") {
							throw "API调用出错";
						}
						let r = 0; // 用于生成随机数
						for (let k = 0;; k++) {
							if (k <= 10) {
								let flag = 1; // 用于英文和数字退出循环的
								// 随机获取10条热评中的一条
								r = parseInt(Math.random() * 9);

								// 用下面的函数获取整理好的评论
								let str4 = this.sort_out(res.data.hotComments[r].content);
								let len = str4.length; // 总行数  (高度)

								// 判断是否存在英文和数字  若有则去除 因为会影响输出格式
								let reg = RegExp(/[a-zA-Z0-9]/);
								for (let i = 0; i < str4.length; i++) {
									if (str4[i].match(reg)) {
										flag = 0;
										break;
									}
								}
								if (flag == 0) {
									continue;
								}

								// 列数大于5，列数过多，重新random
								if (len > 9) {
									continue;
								}

								// 格式通过，退出单个歌曲的评论循环是，顺便赋值
								// 没有超过限制的情况

								// 这个commentID是用作缓存的key 把评论加入到缓存中的
								this.commentID[this.index] = res.data.hotComments[r].commentId;

								this.str[this.index] = res.data.hotComments[r].content;
								this.like[this.index] = res.data.hotComments[r].likedCount;
								this.pName[this.index] = res.data.hotComments[r].user.nickname;
								this.userPUrl[this.index] = res.data.hotComments[r].user.avatarUrl;

								this.sheet.push(this.sheetID);
								this.songID.push(this.id);
								break;
							} else {
								// 格式不通过，抛出异常
								throw "格式不通过，需要重新循环";
							}
						}
						return uniRequest.get(
							"https://api.imjad.cn/cloudmusic/?type=lyric&id=" +
							this.songID[this.index]
						);
					})

					// 这部分的axios是用于获取歌词  先处理一下歌词前面的时间轴
					.then(res => {
						let str1 = res.data.lrc.lyric.split(/[[\]]/); // 分割歌词  去除前面的时间轴
						let lrc = "";

						for (let i = 2; i < str1.length; i += 2) {
							lrc += str1[i] + " \n ";
						}

						this.lysic[this.index] = lrc;
						return uniRequest.get(
							"https://musicapi.leanapp.cn/song/detail?ids=" +
							this.songID[this.index]
						);
					})
					// 这部分的axios是用于获取歌曲信息   
					.then(res => {
						this.songName[this.index] = res.data.songs[0].name;

						this.alPUrl[this.index] = res.data.songs[0].al.picUrl;
						this.album[this.index] = res.data.songs[0].al.name;

						let s = "";

						// 当歌手人数大于1的情况下
						if (res.data.songs[0].ar.length > 1) {
							for (let i = 0; i < res.data.songs[0].ar.length; i++) {
								s += res.data.songs[0].ar[i].name;
								if (i != res.data.songs[0].ar.length - 1) {
									s += "、";
								}

							}
							this.singer[this.index] = s;
						} else {
							this.singer[this.index] = res.data.songs[0].ar[0].name;
						}
					})
					// 这里的then是表示之前的都无误  退出递归
					.then(() => {
						this.index++;
						this.flag = false;
						this.loading = false;
						uni.hideLoading();
					})
					// catch到错误的话  重新递归
					.catch(err => {
						// console.log("err :", err);
						num++;
						if (num <= 5) {
							this.nextMusic(num);
						} else {
							uni.hideLoading();
							uni.showToast({
								title: '出错啦，请尝试点击 下一首 或稍后再试',
								position: "bottom",
								icon: 'none',
								duration: 2000
							});
							this.loading = false;

						}

					});

			},

			// 输出二维数组函数
			output(arr) {
				let str = [];
				for (let i = 0; i < arr.length; i++) {
					for (let j = 0; j < arr[0].length; j++) {
						str += arr[i][j];
					}
					str += " \n ";
				}
				return str;
			},

			// 整理原始评论数组的函数    若一列出现大于规定行数的情况  则换列
			sort_out(str) {
				// 用正则表达式分割字符串，遇到类似，。[].的符号就换行
				let str4 = str.split(/[,，.。!！?？《》、…"‘’'“”~@→\-_~::[\]\s]+/);

				// 第一个字出现字符以上正则导致换行的情况下，取消第一行的换行
				for (let i = 0; i < str4.length; i++) {
					if (str4[i] == "") {
						str4.splice(i, 1);
					}
				}

				let sum = 12; // 规定总行数  暂定为12  (高度)

				// 把大于规定行数的列数分开来  形成两列或多列   分列的时候加一个空格  美观
				for (let i = 0; i < str4.length; i++) {
					if (str4[i].length > sum) {
						// 在第13的位置，也就是下标12的位置，插入一个v1空格  可造成第二列第一个字符下沉
						str4[i] = str4[i].slice(0, sum) + "　" + str4[i].slice(sum);
						// 先用大于总行数的字符加入到下一个
						str4.splice(i + 1, 0, str4[i].slice(sum));
						// 然后小于等于总行数的字符等于本身
						str4[i] = str4[i].slice(0, sum);
					}
				}

				str4 = str4.filter(function(s) {
					return s && s.trim();
				});

				return str4;
			},

			// 填充数组函数
			fix(str4) {
				let sum = 12;
				let len = str4.length; // 总列数  (宽度)
				let str3 = []; // str3是最后生成的二维数组

				// 初始化数组
				for (let i = 0; i < sum; i++) {
					str3[i] = new Array();
					for (let j = 0; j < len; j++) {
						// 用输入法 v1 打出来的空格
						str3[i][j] = "　 ";
					}
				}
				// 星星，排列好了
				for (let j = len - 1, x = 0; x < str4.length; x++, j--) {
					for (let i = 0, y = 0; y < str4[x].length; y++, i++) {
						str3[i][j] = str4[x][y] + " ";
					}
				}
				return str3;
			}
		}
	};
</script>
<style scoped>
	.status_bar {
		height: var(--status-bar-height);
		width: 100%;
	}

	.comment {
		margin-top: 15%;
	}

	.comment .title {
		float: left;
		height: 110rpx;
		width: 80%;
		margin-left: 3%;
		font-size: 36rpx;
		overflow-x: scroll;
		overflow-y: hidden;
		white-space: nowrap;
		margin-right: 2%;
	}

	.comment .title .album-url {
		float: left;
		margin-right: 5%;
	}

	.comment .title .album {
		color: #aaa;
		font-size: 30rpx;
		white-space: nowrap;
	}

	.comment .box-left {
		float: left;
		margin-top: 10%;
		margin-left: 3%;
		width: 43%;
		height: 708rpx;
	}

	.comment .box-left .content {
		float: left;
		text-align: center;
		height: 548rpx;
		width: 100%;
		overflow-y: scroll;
		overflow-x: hidden;
		white-space: pre-wrap;
	}

	.comment .box-left .switch {
		float: right;
		margin-right: 10%;
	}

	.comment .line {
		margin-left: 3.5%;
		float: left;
		border-right: 2rpx solid #ddd;
		height: 400rpx;
		margin-top: 20%;
	}

	.comment .box-right {
		float: right;
		margin-top: 5%;
		width: 46%;
		height: 200rpx;
		margin-right: 0rpx;
	}

	.comment .box-right .speaker {
		margin-right: 5%;
		overflow: auto;
		white-space: nowrap;
		height: 80rpx;
		width: 90%;
	}

	.comment .box-right .speaker .photo {
		text-align: center;
		font-size: 32rpx;
		vertical-align: middle;
		border-radius: 50%;
		margin-right: 2%;
	}

	.comment .box-right .like {
		font-size: 30rpx;
		color: #aaa;
		float: right;
		margin-right: 8%;
		height: 60rpx;
		overflow: auto;
		white-space: nowrap;
	}

	.comment .box-right .content {
		float: right;
		color: #808080;
		height: 500rpx;
		width: 100%;
		font-weight: 100;
		font-size: 26rpx;
		margin-top: 2%;
		text-align: right;
		white-space: pre-wrap;
		margin-right: 4%;
	}

	.comment .btn {
		position: fixed;
		bottom: 5%;
		width: 80%;
		margin-left: 7%;
		padding: 3%;
		border: #97DCF7 6rpx solid;
		border-radius: 60rpx;
	}

	.mplayer:active {
		background-color: #a8a8a8;
	}

	.comment .list {
		overflow: auto;
		white-space: nowrap;
	}
</style>
