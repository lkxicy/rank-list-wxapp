import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    // dispatch-->actions-->mutations-->state
    state: {
        com: [], // 评论收藏  收藏进来的应该是一个个对象属性——ID 歌名 歌词 之类的 
    },
    getters: {
        getCOM(state) {
            return state.com;
        }
    },
    mutations: {
		
        // 这个方法用于把点击了收藏的评论放到com的数组里面
        AddComment(state, arg) {
            state.com.push(arg);
        },
        // 从数组中移除
        DeleteComment(state, arg) {
            state.com.splice(state.com.map(item => item.str).indexOf(arg.str), 1);
        }
    },
    actions: {
		
        addCom({ commit }, arg) {
            commit("AddComment", arg);
        },
        deleteCom({ commit }, arg) {
            commit("DeleteComment", arg);
        }
    },
})