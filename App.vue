<script>
import { getAccessToken } from './utils/api.js'
import { connect, onMessage } from './utils/websocket.js'
import { store } from './utils/store.js'

export default {
	onLaunch: function() {
		if (getAccessToken()) {
			connect()
			onMessage((data) => {
				if (data.unreadCount !== undefined) {
					store.unreadCount = data.unreadCount
				}
			})
		}
	},
	onShow: function() {
		if (getAccessToken()) {
			connect()
		}
	}
}
</script>

<style>
	/* 禁止页面级橡皮筋回弹，避免到顶后整屏下拉变形 */
	page {
		height: 100%;
		overflow: hidden;
		overscroll-behavior: none;
	}
</style>
